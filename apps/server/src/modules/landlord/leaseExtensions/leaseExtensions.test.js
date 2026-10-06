import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Lease from '../../../shared/models/lease.model.js';

let mongoServer;
let landlordToken;
let tenantToken;
let landlordUser;
let tenantUser;
let property;
let unit;
let lease;
let extensionId;

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

  property = await Property.create({
    name: 'Aura Sky Towers',
    address: '88 Horizon Blvd',
    city: 'Metro Central',
    landlord: landlordUser._id,
  });

  unit = await Unit.create({
    label: 'Unit 14B',
    property: property._id,
    tenant: tenantUser._id,
    monthlyRent: 2400,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    status: 'occupied',
  });

  lease = await Lease.create({
    tenant: tenantUser._id,
    unit: unit._id,
    property: property._id,
    landlord: landlordUser._id,
    leaseStart: new Date('2026-01-01'),
    leaseEnd: new Date('2026-12-31'),
    monthlyRent: 2400,
    securityDeposit: 3600,
    status: 'active',
    extensionRequests: [
      {
        termMonths: 12,
        proposedStartDate: new Date('2027-01-01'),
        proposedEndDate: new Date('2027-12-31'),
        monthlyRent: 2500,
        notes: 'Would love to extend our contract for another year.',
        status: 'pending',
      },
    ],
  });

  extensionId = lease.extensionRequests[0]._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Landlord Lease Extensions API (/api/landlord/lease-extensions)', () => {
  it('GET /api/landlord/lease-extensions - should list all lease extension requests across properties', async () => {
    const res = await request(app)
      .get('/api/landlord/lease-extensions')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data.extensions)).toBe(true);
  });

  it('GET /api/landlord/lease-extensions?status=pending - should filter extension requests by pending status', async () => {
    const res = await request(app)
      .get('/api/landlord/lease-extensions?status=pending')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.extensions.length).toBeGreaterThanOrEqual(1);
    const hasPending = res.body.data.extensions[0].extensionRequests.some((r) => r.status === 'pending');
    expect(hasPending).toBe(true);
  });

  it('GET /api/landlord/lease-extensions?status=rejected - should return empty list when no rejected requests exist', async () => {
    const res = await request(app)
      .get('/api/landlord/lease-extensions?status=rejected')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(0);
  });

  it('PATCH /api/landlord/lease-extensions/:leaseId/:extensionId - should approve extension and update lease', async () => {
    const res = await request(app)
      .patch(`/api/landlord/lease-extensions/${lease._id}/${extensionId}`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        action: 'approve',
        landlordNotes: 'Approved for 12 months.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.action).toBe('approve');
    expect(res.body.leaseStatus).toBe('active');
  });

  it('PATCH /api/landlord/lease-extensions/:leaseId/:extensionId - should idempotently return success when already approved', async () => {
    const res = await request(app)
      .patch(`/api/landlord/lease-extensions/${lease._id}/${extensionId}`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        action: 'approve',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.action).toBe('approve');
  });
});

describe('Error Handling', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app)
      .get('/api/landlord/lease-extensions');

    expect(res.status).toBe(401);
  });

  it('returns 403 when wrong role accesses route', async () => {
    const res = await request(app)
      .get('/api/landlord/lease-extensions')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(403);
  });

  it('returns 400 when invalid action is provided', async () => {
    const res = await request(app)
      .patch(`/api/landlord/lease-extensions/${lease._id}/${extensionId}`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({ action: 'maybe' });

    expect(res.status).toBe(400);
  });

  it('returns 404 when lease does not exist', async () => {
    const fakeLeaseId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/landlord/lease-extensions/${fakeLeaseId}/${extensionId}`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({ action: 'approve' });

    expect(res.status).toBe(404);
  });

  it('returns 404 when extension request does not exist in lease', async () => {
    const fakeExtId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/landlord/lease-extensions/${lease._id}/${fakeExtId}`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({ action: 'approve' });

    expect(res.status).toBe(404);
  });
});
