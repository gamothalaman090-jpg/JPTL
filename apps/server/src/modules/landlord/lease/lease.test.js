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
let landlordUser;
let tenantUser;
let property;
let unit;
let lease;
let requestId;

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
        monthlyRent: 2400,
        notes: 'Would love to extend our contract for another year.',
        status: 'pending',
      },
    ],
  });

  requestId = lease.extensionRequests[0]._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Landlord Digital Lease Management API (/api/landlord/lease)', () => {
  it('GET /api/landlord/lease/extensions - should list all lease extension requests across properties', async () => {
    const res = await request(app)
      .get('/api/landlord/lease/extensions')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.extensionRequests)).toBe(true);
    expect(res.body.extensionRequests.length).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /api/landlord/lease/:leaseId/extensions/:requestId/review - should approve extension and update lease term', async () => {
    const res = await request(app)
      .patch(`/api/landlord/lease/${lease._id}/extensions/${requestId}/review`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        status: 'approved',
        landlordNotes: 'Approved with pleasure.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.lease.status).toBe('renewal_approved');
  });
});
