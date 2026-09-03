import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Announcement from '../../../shared/models/announcements.model.js';

let mongoServer;
let landlordToken;
let tenantToken;
let landlordUser;
let tenantUser;
let property;

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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Announcements Module API (Landlord & Tenant)', () => {
  let createdAnnouncementId;

  it('POST /api/landlord/announcements - landlord creates a broadcast notice', async () => {
    const res = await request(app)
      .post('/api/landlord/announcements')
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        title: 'Scheduled Elevator Maintenance',
        content: 'Elevator bank B will undergo routine sensor testing tomorrow between 1 PM and 3 PM.',
        propertyId: property._id,
        isPinned: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Scheduled Elevator Maintenance');
    expect(res.body.data.isPinned).toBe(true);
    createdAnnouncementId = res.body.data._id;
  });

  it('GET /api/landlord/announcements - landlord lists their posted announcements', async () => {
    const res = await request(app)
      .get('/api/landlord/announcements')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('GET /api/tenant/announcements - tenant reads announcements feed from landlord', async () => {
    const res = await request(app)
      .get('/api/tenant/announcements')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.announcements)).toBe(true);
    expect(res.body.announcements.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/tenant/announcements/:id - tenant views single announcement details', async () => {
    const res = await request(app)
      .get(`/api/tenant/announcements/${createdAnnouncementId}`)
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Scheduled Elevator Maintenance');
  });

  it('POST /api/landlord/announcements - should block tenant from publishing announcement (403)', async () => {
    const res = await request(app)
      .post('/api/landlord/announcements')
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        title: 'Unauthorized announcement',
        content: 'This should fail',
      });

    expect(res.status).toBe(403);
  });
});
