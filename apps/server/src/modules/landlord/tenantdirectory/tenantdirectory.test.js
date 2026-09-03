import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';

let mongoServer;
let landlordToken;
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

  unit = await Unit.create({
    label: 'Unit 18C',
    property: property._id,
    monthlyRent: 2600,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    status: 'vacant',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Tenant Directory Module API (/api/landlord/tenantdirectory)', () => {
  let createdTenantId;

  it('POST /api/landlord/tenantdirectory - should create and onboard a new tenant', async () => {
    const res = await request(app)
      .post('/api/landlord/tenantdirectory')
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        firstName: 'Marcus',
        lastName: 'Chen',
        email: 'marcus.chen@example.com',
        phone: '+1 (555) 777-8899',
        propertyId: property._id,
        unitId: unit._id,
        monthlyRent: 2600,
        leaseStart: '2026-02-01',
        leaseEnd: '2027-01-31',
        status: 'active',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('marcus.chen@example.com');
    createdTenantId = res.body.data.id || res.body.data._id;

    // Verify unit became occupied
    const updatedUnit = await Unit.findById(unit._id);
    expect(updatedUnit.status).toBe('occupied');
  });

  it('GET /api/landlord/tenantdirectory - should list all tenants', async () => {
    const res = await request(app)
      .get('/api/landlord/tenantdirectory')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/landlord/tenantdirectory/:id - should get detailed profile of tenant', async () => {
    const res = await request(app)
      .get(`/api/landlord/tenantdirectory/${createdTenantId}`)
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.firstName).toBe('Marcus');
  });

  it('PUT /api/landlord/tenantdirectory/:id - should update tenant details', async () => {
    const res = await request(app)
      .put(`/api/landlord/tenantdirectory/${createdTenantId}`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        phone: '+1 (555) 999-0011',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.phone).toBe('+1 (555) 999-0011');
  });

  it('DELETE /api/landlord/tenantdirectory/:id - should delete tenant and release unit', async () => {
    const res = await request(app)
      .delete(`/api/landlord/tenantdirectory/${createdTenantId}`)
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify unit was released to vacant
    const updatedUnit = await Unit.findById(unit._id);
    expect(updatedUnit.status).toBe('vacant');
    expect(updatedUnit.tenant).toBeNull();
  });
});
