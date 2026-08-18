import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { setupTestDatabase, teardownTestDatabase, createTestUser } from '../setup';

describe('Phase 08 - Corporate Sales & Quotation API (E2E)', () => {
  let token: string;
  let organizationId: string;
  let corporateClientId: string;
  let leadId: string;
  let quotationId: string;
  let userId: string;

  beforeAll(async () => {
    await setupTestDatabase();
    const testUser = await createTestUser({
      permissions: ['corporate.create', 'corporate.view', 'lead.create', 'lead.view', 'quotation.create', 'quotation.view', 'quotation.approve', 'quotation.send', 'quotation.accept']
    });
    token = testUser.token;
    organizationId = testUser.organizationId;
    userId = testUser.userId;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('Corporate Client & Lead CRM', () => {
    it('should create a corporate client', async () => {
      const res = await request(app)
        .post('/api/v1/corporate-clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyName: 'Acme Corp',
          industry: 'Technology',
          email: 'hello@acme.corp'
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.companyName).toBe('Acme Corp');
      corporateClientId = res.body.data.id;
    });

    it('should create a B2B sales lead for the client', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          corporateClientId,
          title: 'Annual Tech Retreat',
          destination: 'Bali',
          estimatedTravelers: 50,
          budget: 50000,
          probability: 80
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.leadNumber).toContain('LD-');
      leadId = res.body.data.id;
    });
  });

  describe('Quotation Engine & Margin Protection', () => {
    it('TEST 1: Should compute Gross Profit and allow normal margins', async () => {
      // Cost = 10000, Selling = 12000
      const res = await request(app)
        .post('/api/v1/quotations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          corporateClientId,
          leadId,
          validUntil: new Date(Date.now() + 86400000).toISOString(),
          items: [
            {
              serviceType: 'TRANSPORT',
              description: 'Bus',
              quantity: 1,
              unitCostPrice: 10000,
              unitSellingPrice: 12000
            }
          ]
        });

      expect(res.status).toBe(201);
      expect(Number(res.body.data.totalCostPrice)).toBe(10000);
      expect(Number(res.body.data.totalSellingPrice)).toBe(12000);
      expect(Number(res.body.data.grossProfit)).toBe(2000); // 20k Margin
      expect(res.body.data.status).toBe('DRAFT');
      
      quotationId = res.body.data.id;
    });

    it('TEST 2: Should flag NEGATIVE_MARGIN for internal review', async () => {
      // Cost = 10000, Selling = 8000
      const res = await request(app)
        .post('/api/v1/quotations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          corporateClientId,
          leadId,
          validUntil: new Date(Date.now() + 86400000).toISOString(),
          items: [
            {
              serviceType: 'TRANSPORT',
              description: 'Bus',
              quantity: 1,
              unitCostPrice: 10000,
              unitSellingPrice: 8000
            }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('INTERNAL_REVIEW');
    });

    it('TEST 3: Quotation cannot be accepted if EXPIRED', async () => {
      // Create expired quotation
      const q = await prisma.quotation.create({
        data: {
          organizationId,
          corporateClientId,
          quotationNumber: 'QT-TEST-EXPIRED',
          version: 1,
          validFrom: new Date(Date.now() - 172800000), // 2 days ago
          validUntil: new Date(Date.now() - 86400000), // 1 day ago
          status: 'SENT'
        }
      });

      const res = await request(app)
        .post(`/api/v1/quotations/${q.id}/accept`)
        .set('Authorization', `Bearer ${token}`)
        .send({ acceptanceMethod: 'ONLINE' });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('QUOTATION_EXPIRED');
    });

    it('TEST 4: Quotation acceptance should be idempotent', async () => {
      // Mark our first quotation as sent so we can accept it
      await prisma.quotation.update({ where: { id: quotationId }, data: { status: 'SENT' } });

      const res1 = await request(app)
        .post(`/api/v1/quotations/${quotationId}/accept`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      expect(res1.status).toBe(200);

      const res2 = await request(app)
        .post(`/api/v1/quotations/${quotationId}/accept`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      expect(res2.status).toBe(400);
      expect(res2.body.errorCode).toBe('INVALID_STATUS'); // Already accepted
    });
  });

  describe('Corporate Booking Conversion', () => {
    it('TEST 5: Convert accepted quotation to corporate booking idempotently', async () => {
      const res1 = await request(app)
        .post(`/api/v1/quotations/${quotationId}/convert-to-booking`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res1.status).toBe(200);
      expect(res1.body.data.bookingType).toBe('CORPORATE');
      expect(res1.body.data.corporateClientId).toBe(corporateClientId);
      expect(Number(res1.body.data.dueAmount)).toBe(12000);

      // Attempt duplicate
      const res2 = await request(app)
        .post(`/api/v1/quotations/${quotationId}/convert-to-booking`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res2.status).toBe(409);
      expect(res2.body.errorCode).toBe('BOOKING_ALREADY_CREATED');
    });
  });

  describe('Security & Isolation', () => {
    it('TEST 7: Tenant isolation on quotation retrieval', async () => {
      // Create a rogue user in a different tenant
      const rogueUser = await createTestUser({ permissions: ['quotation.view'] });
      
      const res = await request(app)
        .get(`/api/v1/quotations/${quotationId}`)
        .set('Authorization', `Bearer ${rogueUser.token}`);
      
      expect(res.status).toBe(404); // Should not leak existence
    });
  });
});
