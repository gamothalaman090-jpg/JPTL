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
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Resident Compliance Vault & Documents API (Tenant & Landlord)', () => {
  let createdDocId;

  it('POST /api/tenant/documents - tenant submits a verification document', async () => {
    const res = await request(app)
      .post('/api/tenant/documents')
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        name: 'State_Farm_Renter_Insurance_Policy.pdf',
        type: 'Proof of Insurance',
        category: 'upload',
        notes: 'Annual policy active through December 2027.',
        fileSize: '2.1 MB',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('State_Farm_Renter_Insurance_Policy.pdf');
    expect(res.body.data.status).toBe('Pending Review');
    expect(res.body.data.fileUrl).toContain('cloudinary');
    createdDocId = res.body.data._id || res.body.data.id;
  });

  it('GET /api/tenant/documents - tenant lists their uploaded compliance documents', async () => {
    const res = await request(app)
      .get('/api/tenant/documents')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.documents.length).toBe(1);
    expect(res.body.metrics.pending).toBe(1);
  });

  it('GET /api/landlord/documents - landlord views compliance vault with metrics', async () => {
    const res = await request(app)
      .get('/api/landlord/documents')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.documents.length).toBe(1);
    expect(res.body.documents[0].tenantName).toBe('Sophia Lin');
    expect(res.body.metrics.pendingReview).toBe(1);
  });

  it('PATCH /api/landlord/documents/:id/verify - landlord verifies compliance document', async () => {
    const res = await request(app)
      .patch(`/api/landlord/documents/${createdDocId}/verify`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        status: 'Verified',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.document.status).toBe('Verified');
    expect(res.body.document.reviewedBy).toBeTruthy();

    const dbDoc = await Document.findById(createdDocId);
    expect(dbDoc.status).toBe('Verified');
  });

  it('DELETE /api/landlord/documents/:id - landlord purges/removes document', async () => {
    const res = await request(app)
      .delete(`/api/landlord/documents/${createdDocId}`)
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const dbDoc = await Document.findById(createdDocId);
    expect(dbDoc).toBeNull();
  });
});
