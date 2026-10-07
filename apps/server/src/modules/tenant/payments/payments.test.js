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
import Lease from '../../../shared/models/lease.model.js';

let mongoServer;
let tenantToken;
let landlordToken;
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
  landlordToken = jwt.sign(
    { _id: landlordUser._id, id: landlordUser._id, role: 'landlord', email: landlordUser.email },
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

  await Lease.create({ tenant: tenantUser._id, landlord: landlordUser._id, property: property._id, unit: unit._id, leaseStart: new Date('2026-01-01'), leaseEnd: new Date('2029-01-01'), leaseType: 'fixed_term', monthlyRent: 2400, status: 'active' });

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
  it('keeps an unsubmitted advance draft out of landlord rent roll and allows discarding it', async () => {
    const beforeRentRoll = await request(app).get('/api/landlord/rentroll').set('Cookie', [`token=${landlordToken}`]);
    expect(beforeRentRoll.status).toBe(200);
    const created = await request(app)
      .post('/api/tenant/payments/advance-invoice')
      .set('Cookie', [`token=${tenantToken}`])
      .send({ monthsAhead: 2 });
    expect(created.status).toBe(201);
    expect(created.body.data.status).toBe('draft');
    expect(created.body.data.isAdvancePayment).toBe(true);
    const draftId = created.body.data._id;

    const rentRoll = await request(app).get('/api/landlord/rentroll').set('Cookie', [`token=${landlordToken}`]);
    expect(rentRoll.status).toBe(200);
    expect(rentRoll.body.data.some((payment) => String(payment.id) === String(draftId))).toBe(false);
    expect(rentRoll.body.summary.totalPending).toBe(beforeRentRoll.body.summary.totalPending);

    const discarded = await request(app).delete(`/api/tenant/payments/${draftId}/advance-draft`).set('Cookie', [`token=${tenantToken}`]);
    expect(discarded.status).toBe(200);
    expect(await Payment.findById(draftId)).toBeNull();
  });

  it('shows an advance payment to landlord only after tenant submits onsite confirmation', async () => {
    const created = await request(app)
      .post('/api/tenant/payments/advance-invoice')
      .set('Cookie', [`token=${tenantToken}`])
      .send({ monthsAhead: 1 });
    expect(created.status).toBe(201);
    const draftId = created.body.data._id;

    const submitted = await request(app)
      .post(`/api/tenant/payments/${draftId}/pay-onsite`)
      .set('Cookie', [`token=${tenantToken}`])
      .send({ note: 'Advance rent paid onsite' });
    expect(submitted.status).toBe(201);
    expect(submitted.body.data.reviewStatus).toBe('pending_review');
    expect(submitted.body.data.status).toBe('pending');

    const rentRoll = await request(app).get('/api/landlord/rentroll').set('Cookie', [`token=${landlordToken}`]);
    expect(rentRoll.status).toBe(200);
    expect(rentRoll.body.data.some((payment) => String(payment.id) === String(draftId))).toBe(true);
  });

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

    expect(res.status).toBe(410);
    expect(res.body.message).toMatch(/retired/i);
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

  it('POST /api/tenant/payments/methods - does not accept simulated card methods', async () => {
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

    expect(res.status).toBe(410);
  });

  it('GET /api/tenant/payments/methods - should list saved payment methods', async () => {
    const res = await request(app)
      .get('/api/tenant/payments/methods')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('Error Handling', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/tenant/payments');
    expect(res.status).toBe(401);
  });

  it('retires simulated advance payments', async () => {
    const res = await request(app)
      .post('/api/tenant/payments/pay-advance')
      .set('Cookie', [`token=${tenantToken}`])
      .send({ monthsAhead: 0 });
    expect(res.status).toBe(410);
  });

  it('returns 404 when receipt transaction does not exist', async () => {
    const res = await request(app)
      .get('/api/tenant/payments/receipt/TXN_NONEXISTENT')
      .set('Cookie', [`token=${tenantToken}`]);
    expect(res.status).toBe(404);
  });
});
