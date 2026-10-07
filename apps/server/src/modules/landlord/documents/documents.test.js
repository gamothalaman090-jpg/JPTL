import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Document from '../../../shared/models/document.model.js';

let mongoServer;
let landlordToken;
let tenantToken;
let landlordUser;
let tenantUser;
let property;
let unit;
let sampleDoc;

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
    sqft: 1100,
    status: 'occupied',
  });

  sampleDoc = await Document.create({
    name: 'Renter_Insurance_Policy.pdf',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/jptl_vault/policy.pdf',
    type: 'Proof of Insurance',
    category: 'upload',
    size: '1.2 MB',
    status: 'Pending Review',
    tenant: tenantUser._id,
    landlord: landlordUser._id,
    property: property._id,
    unit: unit._id,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Landlord Resident Compliance Vault API (/api/landlord/documents)', () => {
  it('GET /api/landlord/documents - should inspect compliance vault queue and metrics', async () => {
    const res = await request(app)
      .get('/api/landlord/documents')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.documents.length).toBeGreaterThanOrEqual(1);
    expect(res.body.metrics).toBeDefined();
  });

  it('persists the landlord compliance reminder lead time', async () => {
    const update = await request(app)
      .patch('/api/landlord/documents/reminder-settings')
      .set('Cookie', [`token=${landlordToken}`])
      .send({ noticeLeadTimeDays: 60 });
    expect(update.status).toBe(200);
    expect(update.body.data.noticeLeadTimeDays).toBe(60);

    const read = await request(app)
      .get('/api/landlord/documents/reminder-settings')
      .set('Cookie', [`token=${landlordToken}`]);
    expect(read.status).toBe(200);
    expect(read.body.data.noticeLeadTimeDays).toBe(60);
  });

  it('PATCH /api/landlord/documents/:id/verify - should verify document status', async () => {
    const res = await request(app)
      .patch(`/api/landlord/documents/${sampleDoc._id}/verify`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        status: 'Verified',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.document.status).toBe('Verified');
  });

  it('DELETE /api/landlord/documents/:id - should delete document record', async () => {
    const res = await request(app)
      .delete(`/api/landlord/documents/${sampleDoc._id}`)
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Error Handling', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/landlord/documents');
    expect(res.status).toBe(401);
  });

  it('returns 403 when wrong role accesses route', async () => {
    const res = await request(app)
      .get('/api/landlord/documents')
      .set('Cookie', [`token=${tenantToken}`]);
    expect(res.status).toBe(403);
  });

  it('returns 404 when verifying non-existent document', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/landlord/documents/${fakeId}/verify`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({ status: 'Verified' });
    expect(res.status).toBe(404);
  });

  it('returns 400 when invalid status is provided on verification', async () => {
    const res = await request(app)
      .patch(`/api/landlord/documents/${sampleDoc._id}/verify`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({ status: 'InvalidStatus' });
    expect(res.status).toBe(400);
  });
});
