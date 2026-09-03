import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';

let mongoServer;
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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Tenant Maintenance Ticketing API (/api/tenant/tickets)', () => {
  let createdTicketId;

  it('POST /api/tenant/tickets - tenant files a new maintenance request', async () => {
    const res = await request(app)
      .post('/api/tenant/tickets')
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        title: 'Master bathroom showerhead leaking',
        description: 'Persistent dripping sound and low pressure since yesterday evening.',
        category: 'Plumbing',
        priority: 'medium',
        unitId: unit._id,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Master bathroom showerhead leaking');
    expect(res.body.data.status).toBe('submitted');
    createdTicketId = res.body.data._id || res.body.data.id;
  });

  it('GET /api/tenant/tickets - tenant lists their active and resolved tickets', async () => {
    const res = await request(app)
      .get('/api/tenant/tickets')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tickets.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/tenant/tickets/:id/comments - tenant adds an update comment to ticket', async () => {
    const res = await request(app)
      .post(`/api/tenant/tickets/${createdTicketId}/comments`)
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        note: 'I will be available for technician entry after 2 PM.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PATCH /api/tenant/tickets/:id/cancel - tenant cancels maintenance ticket', async () => {
    const res = await request(app)
      .patch(`/api/tenant/tickets/${createdTicketId}/cancel`)
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        reason: 'Issue resolved on its own.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.ticket.status).toBe('cancelled');
  });
});
