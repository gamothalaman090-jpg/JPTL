import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Announcement from '../../../shared/models/announcements.model.js';

let mongoServer;
let tenantToken;
let landlordUser;
let tenantUser;
let property;
let notice;

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

  notice = await Announcement.create({
    title: 'Water Main Maintenance Notice',
    content: 'Water shutoff will occur tomorrow from 9am to 11am for system maintenance.',
    category: 'General',
    author: landlordUser._id,
    property: property._id,
    isPinned: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Tenant Announcements Feed API (/api/tenant/announcements)', () => {
  it('GET /api/tenant/announcements - tenant fetches notice feed', async () => {
    const res = await request(app)
      .get('/api/tenant/announcements')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.announcements)).toBe(true);
    expect(res.body.announcements.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/tenant/announcements/:id - tenant views specific announcement details', async () => {
    const res = await request(app)
      .get(`/api/tenant/announcements/${notice._id}`)
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Water Main Maintenance Notice');
  });
});
