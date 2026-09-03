import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';

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
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Dashboard & KPI Aggregation API (Landlord & Tenant)', () => {
  it('GET /api/landlord/dash - should return full landlord dashboard with portfolio aggregations', async () => {
    const res = await request(app)
      .get('/api/landlord/dash')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('GET /api/landlord/dash/kpi - should return lightweight KPI stats for landlord', async () => {
    const res = await request(app)
      .get('/api/landlord/dash/kpi')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/tenant/dash - should return tenant overview dashboard payload', async () => {
    const res = await request(app)
      .get('/api/tenant/dash')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/tenant/dash/kpi - should return tenant quick KPI numbers', async () => {
    const res = await request(app)
      .get('/api/tenant/dash/kpi')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
