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

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';

  // Seed Landlord
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

  // Seed Property
  property = await Property.create({
    name: 'Aura Sky Towers',
    address: '88 Horizon Blvd',
    city: 'Metro Central',
    category: 'Luxury',
    landlord: landlordUser._id,
  });

  // Seed Tenant
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

  // Seed Unit
  unit = await Unit.create({
    label: 'Unit 14B',
    property: property._id,
    tenant: tenantUser._id,
    monthlyRent: 2400,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1150,
    status: 'occupied',
    leaseStart: new Date('2026-01-15'),
    leaseEnd: new Date('2027-01-14'),
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Digital Lease & Extension Workflow API (Tenant & Landlord)', () => {
  let createdRequestId;
  let leaseId;

  it('GET /api/tenant/lease - should return digital lease contract details', async () => {
    const res = await request(app)
      .get('/api/tenant/lease')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.monthlyRent).toBe(2400);
    expect(res.body.data.unitLabel).toBe('Unit 14B');
    expect(res.body.data.propertyName).toBe('Aura Sky Towers');
    expect(Array.isArray(res.body.data.covenants)).toBe(true);
    leaseId = res.body.data.id || res.body.data._id;
  });

  it('POST /api/tenant/lease/extension - tenant submits renewal extension request', async () => {
    const res = await request(app)
      .post('/api/tenant/lease/extension')
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        termMonths: 12,
        proposedStartDate: '2027-01-15',
        notes: 'Requesting to renew for another 12 months with same terms.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.extensionRequest.termMonths).toBe(12);
    expect(res.body.extensionRequest.status).toBe('pending');
    createdRequestId = res.body.extensionRequest._id;
  });

  it('GET /api/tenant/lease/document - should return downloadable digital contract data', async () => {
    const res = await request(app)
      .get('/api/tenant/lease/document')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.contractPdfUrl).toBeTruthy();
  });

  it('GET /api/landlord/lease/extensions - landlord retrieves pending extension requests', async () => {
    const res = await request(app)
      .get('/api/landlord/lease/extensions')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.extensionRequests.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pendingExtensionsCount).toBe(1);
  });

  it('PATCH /api/landlord/lease/:leaseId/extensions/:requestId/review - landlord approves extension', async () => {
    const res = await request(app)
      .patch(`/api/landlord/lease/${leaseId}/extensions/${createdRequestId}/review`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        status: 'approved',
        landlordNotes: 'Renewal approved for 12 months at rate lock $2,400/mo.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.lease.status).toBe('renewal_approved');

    // Verify Unit leaseEnd was extended
    const updatedUnit = await Unit.findById(unit._id);
    expect(new Date(updatedUnit.leaseEnd).getFullYear()).toBe(2028);
  });
});
