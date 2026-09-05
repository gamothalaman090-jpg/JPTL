import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Payment from '../../../shared/models/payment.model.js';

let mongoServer;
let landlordToken;
let landlordUser;
let tenantUser;
let property;
let unit;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';

  landlordUser = await User.create({
    firstName: 'Alexander',
    lastName: 'Vance',
    email: 'alexander.vance@example.com',
    password: 'Password123!',
    role: 'landlord',
    status: 'active',
  });

  landlordToken = jwt.sign(
    { _id: landlordUser._id, id: landlordUser._id, role: 'landlord', email: landlordUser.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  property = await Property.create({
    name: 'Aura Sky Towers',
    address: '88 Horizon Blvd',
    city: 'Metro Central',
    landlord: landlordUser._id,
  });

  tenantUser = await User.create({
    firstName: 'Sophia',
    lastName: 'Lin',
    email: 'sophia.lin@example.com',
    password: 'Password123!',
    role: 'tenant',
    landlord: landlordUser._id,
    status: 'active',
  });

  unit = await Unit.create({
    label: 'Unit 14B',
    property: property._id,
    tenant: tenantUser._id,
    monthlyRent: 2400,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1150,
    status: 'occupied',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Rent Roll Module API (/api/landlord/rentroll)', () => {
  let createdPaymentId;

  it('POST /api/landlord/rentroll - should generate a rent payment invoice', async () => {
    const res = await request(app)
      .post('/api/landlord/rentroll')
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        unitId: unit._id,
        amount: 2400,
        dueDate: '2026-10-01',
        description: 'October 2026 Monthly Rent',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(2400);
    expect(res.body.data.status).toBe('pending');
    createdPaymentId = res.body.data._id || res.body.data.id;
  });

  it('GET /api/landlord/rentroll - should list all invoices and financial summary', async () => {
    const res = await request(app)
      .get('/api/landlord/rentroll')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.summary).toBeDefined();
  });

  it('GET /api/landlord/rentroll/kpi - should return quick summary KPIs', async () => {
    const res = await request(app)
      .get('/api/landlord/rentroll/kpi')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalExpected).toBeGreaterThanOrEqual(2400);
  });

  it('PATCH /api/landlord/rentroll/:id/mark-paid - should mark invoice as paid', async () => {
    const res = await request(app)
      .patch(`/api/landlord/rentroll/${createdPaymentId}/mark-paid`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        paymentMethod: 'ach',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('paid');
    expect(res.body.data.paidAt).toBeDefined();
  });

  it('GET /api/landlord/rentroll/export - should export rentroll records', async () => {
    const res = await request(app)
      .get('/api/landlord/rentroll/export')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /api/landlord/rentroll/:id - should delete / void payment record', async () => {
    const res = await request(app)
      .delete(`/api/landlord/rentroll/${createdPaymentId}`)
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const paymentInDb = await Payment.findById(createdPaymentId);
    expect(paymentInDb).toBeNull();
  });
});
