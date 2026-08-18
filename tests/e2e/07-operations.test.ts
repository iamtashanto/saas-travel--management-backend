import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { generateToken } from '../../src/common/utils/jwt';

describe('Phase 07: Tour Operations & Resource Management', () => {
  let adminToken: string;
  let organizationId: string;
  let tourScheduleId: string;
  let vehicleId: string;
  let driverId: string;
  let travelerId: string;

  beforeAll(async () => {
    // 1. Setup Organization & Admin
    const org = await prisma.organization.create({
      data: { name: 'Test Org 7', slug: 'test-org-7' },
    });
    organizationId = org.id;

    const user = await prisma.user.create({
      data: {
        organizationId,
        name: 'Admin User 7',
        email: 'admin7@test.com',
        passwordHash: 'hash',
        status: 'ACTIVE',
      },
    });
    adminToken = generateToken(user.id, org.id, '1h');

    // 2. Setup Tour Package and Schedule
    const dest = await prisma.destination.create({
      data: { organizationId, name: 'Dest 7', slug: 'dest-7' }
    });
    const cat = await prisma.tourCategory.create({
      data: { organizationId, name: 'Cat 7', slug: 'cat-7' }
    });
    const tour = await prisma.tourPackage.create({
      data: {
        organizationId,
        title: 'Operations Tour',
        slug: 'operations-tour',
        destinationId: dest.id,
        categoryId: cat.id,
        durationDays: 3,
        durationNights: 2,
        basePrice: 1000,
        currency: 'USD'
      }
    });
    const schedule = await prisma.tourSchedule.create({
      data: {
        organizationId,
        tourPackageId: tour.id,
        startDate: new Date('2028-01-01'),
        endDate: new Date('2028-01-03'),
        capacity: 20,
        status: 'PUBLISHED'
      }
    });
    tourScheduleId = schedule.id;
  });

  afterAll(async () => {
    await prisma.organization.deleteMany({ where: { id: organizationId } });
  });

  it('should initialize a Tour Operation', async () => {
    const res = await request(app)
      .get(`/api/v1/tour-operations/schedules/${tourScheduleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.operationCode).toBeDefined();
    expect(res.body.data.checklists.length).toBeGreaterThan(0);
  });

  it('should create a Vehicle and Driver', async () => {
    const vRes = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Bus 1', registrationNumber: 'REG-001', type: 'BUS', capacity: 40 });
    
    expect(vRes.status).toBe(201);
    vehicleId = vRes.body.data.id;

    const dRes = await request(app)
      .post('/api/v1/drivers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ 
        name: 'John Driver', 
        phone: '123456', 
        licenseNumber: 'LIC-001', 
        licenseExpiryDate: '2030-01-01T00:00:00Z' 
      });
    
    expect(dRes.status).toBe(201);
    driverId = dRes.body.data.id;
  });

  it('should assign transport to tour', async () => {
    const aRes = await request(app)
      .post(`/api/v1/resource-assignments/${tourScheduleId}/transport`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vehicleId,
        driverId,
        seatCapacity: 40,
        departureAt: '2028-01-01T08:00:00Z',
        returnAt: '2028-01-03T18:00:00Z'
      });

    expect(aRes.status).toBe(201);
    expect(aRes.body.data.vehicleId).toBe(vehicleId);
  });

  it('should prevent double-assigning driver to overlapping tour', async () => {
    // Attempting to assign same driver during same dates
    const cRes = await request(app)
      .post(`/api/v1/resource-assignments/${tourScheduleId}/transport`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vehicleId,
        driverId,
        seatCapacity: 40,
        departureAt: '2028-01-02T08:00:00Z',
        returnAt: '2028-01-02T18:00:00Z'
      });
      
    expect(cRes.status).toBe(409); // RESOURCE_CONFLICT
  });

  it('should report an incident', async () => {
    const iRes = await request(app)
      .post('/api/v1/tour-incidents')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tourScheduleId,
        type: 'WEATHER',
        severity: 'MEDIUM',
        title: 'Heavy Rain Warning',
        description: 'Possible delays due to rain'
      });
      
    expect(iRes.status).toBe(201);
  });
});
