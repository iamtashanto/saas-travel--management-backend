import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { generateToken } from '../../src/common/utils/jwt';
import { BookingService } from '../../src/modules/bookings/booking.service';

describe('Phase 06: Booking Engine & Capacity Management', () => {
  let adminToken: string;
  let organizationId: string;
  let customerId: string;
  let travelerId: string;
  let tourPackageId: string;
  let tourScheduleId: string;
  let addonId: string;

  beforeAll(async () => {
    // 1. Setup Organization & Admin
    const org = await prisma.organization.create({
      data: { name: 'Test Org 6', slug: 'test-org-6' },
    });
    organizationId = org.id;

    const user = await prisma.user.create({
      data: {
        organizationId,
        name: 'Admin User',
        email: 'admin6@test.com',
        passwordHash: 'hash',
        status: 'ACTIVE',
      },
    });
    adminToken = generateToken(user.id, org.id, '1h');

    // 2. Setup Tour Package and Schedule
    const dest = await prisma.destination.create({
      data: { organizationId, name: 'Dest', slug: 'dest-6' }
    });
    const cat = await prisma.tourCategory.create({
      data: { organizationId, name: 'Cat', slug: 'cat-6' }
    });
    const tour = await prisma.tourPackage.create({
      data: {
        organizationId,
        title: 'Booking Tour',
        slug: 'booking-tour',
        destinationId: dest.id,
        categoryId: cat.id,
        durationDays: 3,
        durationNights: 2,
        basePrice: 1000,
        childPrice: 800,
        currency: 'USD'
      }
    });
    tourPackageId = tour.id;

    const schedule = await prisma.tourSchedule.create({
      data: {
        organizationId,
        tourPackageId,
        startDate: new Date('2027-01-01'),
        endDate: new Date('2027-01-03'),
        capacity: 2, // VERY SMALL CAPACITY for concurrency testing
        status: 'PUBLISHED'
      }
    });
    tourScheduleId = schedule.id;

    const addon = await prisma.tourAddon.create({
      data: {
        organizationId,
        tourPackageId,
        name: 'Extra Luggage',
        price: 50,
        currency: 'USD'
      }
    });
    addonId = addon.id;

    // 3. Create Customer and Traveler
    const resCust = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'John', lastName: 'Doe', phone: '+1234567890' });
    customerId = resCust.body.data.id;

    const resTrav = await request(app)
      .post('/api/v1/travelers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ customerId, firstName: 'Jane', type: 'ADULT' });
    travelerId = resTrav.body.data.id;
  });

  afterAll(async () => {
    await prisma.organization.deleteMany({ where: { id: organizationId } });
  });

  it('should successfully create a booking and hold seats', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerId,
        tourPackageId,
        tourScheduleId,
        travelers: [{ travelerId, type: 'ADULT' }],
        addons: [{ tourAddonId: addonId, quantity: 1 }]
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('HELD');
    expect(res.body.data.totalAmount).toBe('1050'); // 1000 base + 50 addon
    
    // Check seat reservations
    const availability = await request(app)
      .get(`/api/v1/public/bookings/tour-schedules/${tourScheduleId}/availability`)
      .set('X-Tenant-Slug', 'test-org-6');
      
    expect(availability.body.data.capacity).toBe(2);
    expect(availability.body.data.consumed).toBe(1);
    expect(availability.body.data.available).toBe(1);
  });

  it('should prevent concurrency overbooking (last seat race)', async () => {
    // There is 1 seat left.
    // Let's create two parallel public requests using different idempotency keys.
    const payload1 = {
      tourPackageId,
      tourScheduleId,
      customer: { firstName: 'Race1', lastName: 'A', email: 'a@a.com', phone: '111' },
      travelers: [{ firstName: 'Race1', lastName: 'A', type: 'ADULT' }]
    };
    const payload2 = {
      tourPackageId,
      tourScheduleId,
      customer: { firstName: 'Race2', lastName: 'B', email: 'b@b.com', phone: '222' },
      travelers: [{ firstName: 'Race2', lastName: 'B', type: 'ADULT' }]
    };

    const results = await Promise.all([
      request(app)
        .post('/api/v1/public/bookings')
        .set('X-Tenant-Slug', 'test-org-6')
        .set('Idempotency-Key', 'race-key-1')
        .send(payload1),
      request(app)
        .post('/api/v1/public/bookings')
        .set('X-Tenant-Slug', 'test-org-6')
        .set('Idempotency-Key', 'race-key-2')
        .send(payload2)
    ]);

    const statuses = results.map(r => r.status);
    expect(statuses).toContain(201); // One should succeed
    expect(statuses).toContain(409); // One should fail with INSUFFICIENT_CAPACITY
  });

  it('should return identical response for identical idempotency key', async () => {
    const payload = {
      tourPackageId,
      tourScheduleId,
      customer: { firstName: 'Idem', lastName: 'P', email: 'i@p.com', phone: '333' },
      travelers: [{ firstName: 'Idem', lastName: 'P', type: 'ADULT' }]
    };

    // Note: capacity is 0 now. So this will just fail with 409 both times, but the second time it'll be an idempotency error or cached response.
    // Let's test the cached response by hitting it twice.
    const res1 = await request(app)
      .post('/api/v1/public/bookings')
      .set('X-Tenant-Slug', 'test-org-6')
      .set('Idempotency-Key', 'idem-key-1')
      .send(payload);

    const res2 = await request(app)
      .post('/api/v1/public/bookings')
      .set('X-Tenant-Slug', 'test-org-6')
      .set('Idempotency-Key', 'idem-key-1')
      .send(payload);

    expect(res1.body).toEqual(res2.body); // Should be exactly the same response
  });
});
