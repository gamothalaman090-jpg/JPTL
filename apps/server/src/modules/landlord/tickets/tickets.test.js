import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Ticket from '../../../shared/models/ticket.model.js';

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

describe('Maintenance Ticketing API (Landlord & Tenant)', () => {
  let createdTicketId;

  // 1. Tenant submits ticket
  it('POST /api/tenant/tickets - tenant submits a maintenance ticket', async () => {
    const res = await request(app)
      .post('/api/tenant/tickets')
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        title: 'Master Bath Faucet Leak',
        description: 'Water leaking steadily from mixer valve onto vanity floor.',
        category: 'Plumbing',
        priority: 'high',
        photoUrls: ['https://example.com/faucet-leak.jpg'],
        unitId: unit._id,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Master Bath Faucet Leak');
    expect(res.body.data.status).toBe('submitted');
    expect(res.body.data.statusHistory.length).toBe(1);
    expect(res.body.data.statusHistory[0].userRole).toBe('tenant');
    createdTicketId = res.body.data._id;
  });

  // 2. Tenant views their ticket
  it('GET /api/tenant/tickets - tenant gets their own tickets', async () => {
    const res = await request(app)
      .get('/api/tenant/tickets')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tickets.length).toBe(1);
    expect(res.body.metrics.open).toBe(1);
  });

  // 3. Landlord lists tickets
  it('GET /api/landlord/tickets - landlord lists tickets with metrics', async () => {
    const res = await request(app)
      .get('/api/landlord/tickets')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tickets.length).toBe(1);
    expect(res.body.tickets[0].id.toString()).toBe(createdTicketId.toString());
    expect(res.body.metrics.submitted).toBe(1);
  });

  // 4. Landlord assigns technician
  it('PATCH /api/landlord/tickets/:id/assign - landlord assigns technician & transitions status to in_progress', async () => {
    const res = await request(app)
      .patch(`/api/landlord/tickets/${createdTicketId}/assign`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        name: 'Marco Rossi',
        phone: '+1 (555) 438-9201',
        company: 'Apex Plumbing Solutions',
        eta: 'Tomorrow, 9:00 AM - 12:00 PM',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('in_progress');
    expect(res.body.data.assignedTechnician.name).toBe('Marco Rossi');
    expect(res.body.data.statusHistory.length).toBe(2);
  });

  // 5. Landlord marks ticket as resolved
  it('PATCH /api/landlord/tickets/:id/status - landlord marks ticket as resolved', async () => {
    const res = await request(app)
      .patch(`/api/landlord/tickets/${createdTicketId}/status`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        status: 'resolved',
        note: 'Faucet cartridge replaced. Pressure checked and zero leaks confirmed.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('resolved');
    expect(res.body.data.statusHistory.length).toBe(3);
  });
});
