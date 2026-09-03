import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import Payment from '../../../shared/models/payment.model.js';

let mongoServer;
let tenantToken;
let tenantUser;
let landlordUser;
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

  tenantToken = jwt.sign(
    { _id: tenantUser._id, id: tenantUser._id, role: 'tenant', email: tenantUser.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

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

  await TenantProfile.create({
    user: tenantUser._id,
    property: property._id,
    unit: unit._id,
    monthlyRent: 2400,
    status: 'active',
    autoPayEnabled: true,
  });

  // Seed pending payment
  await Payment.create({
    tenant: tenantUser._id,
    unit: unit._id,
    amount: 2400,
    dueDate: new Date(),
    status: 'pending',
    type: 'rent',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Tenant Payments & Ledger API (/api/tenant/payments)', () => {
  it('GET /api/tenant/payments - should return ledger, balance due, and payment records', async () => {
    const res = await request(app)
      .get('/api/tenant/payments')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentStatement).toBeDefined();
    expect(Array.isArray(res.body.data.history)).toBe(true);
  });

  it('POST /api/tenant/payments/pay - should execute rent payment and produce official receipt', async () => {
    const res = await request(app)
      .post('/api/tenant/payments/pay')
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        amount: 2400,
        paymentMethod: 'ach',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(2400);
    expect(res.body.data.status).toBe('paid');
  });

  it('PATCH /api/tenant/payments/autopay - should toggle auto-pay setting', async () => {
    const res = await request(app)
      .patch('/api/tenant/payments/autopay')
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        enabled: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.autoPayEnabled).toBe(false);
  });

  it('POST /api/tenant/payments/methods - should save a new payment method', async () => {
    const res = await request(app)
      .post('/api/tenant/payments/methods')
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        type: 'card',
        brand: 'Visa',
        last4: '4242',
        expiry: '12/28',
        isDefault: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.brand).toBe('Visa');
    expect(res.body.data.last4).toBe('4242');
  });

  it('GET /api/tenant/payments/methods - should list saved payment methods', async () => {
    const res = await request(app)
      .get('/api/tenant/payments/methods')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
