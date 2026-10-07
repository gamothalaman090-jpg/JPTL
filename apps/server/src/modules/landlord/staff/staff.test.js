import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';

let mongoServer;
let landlord;
let landlordToken;
let property;
let unit;
let staff;
let staffToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';
  process.env.NODE_ENV = 'test';
  landlord = await User.create({ firstName: 'Rita', lastName: 'Owner', email: 'staff.owner@example.com', password: 'Password123!', role: 'landlord' });
  landlordToken = jwt.sign({ id: String(landlord._id), role: 'landlord' }, process.env.JWT_SECRET);
  property = await Property.create({ landlord: landlord._id, name: 'Test Homes', address: '1 Main Street', city: 'Manila' });
  unit = await Unit.create({ property: property._id, label: 'Unit 1', monthlyRent: 12000, sqft: 35, status: 'vacant' });
  staff = await User.create({ firstName: 'Sam', lastName: 'Staff', email: 'sam.staff@example.com', password: 'JPTL-a1b2c3d4e5f6', role: 'staff', landlord: landlord._id });
  staffToken = jwt.sign({ id: String(staff._id), role: 'staff', landlord: String(landlord._id) }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Landlord staff management and scoped access', () => {
  it('emails a staff invitation and lists the new staff account', async () => {
    const invited = await request(app)
      .post('/api/landlord/staff')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({ firstName: 'Casey', lastName: 'Manager', email: 'casey.manager@example.com' });
    expect(invited.status).toBe(201);
    expect(invited.body.data.invitationSent).toBe(true);
    expect(invited.body.data.email).toBe('casey.manager@example.com');
    expect(invited.body.data.password).toBeUndefined();

    const listed = await request(app).get('/api/landlord/staff').set('Authorization', `Bearer ${landlordToken}`);
    expect(listed.status).toBe(200);
    expect(listed.body.data.some((member) => member.email === 'casey.manager@example.com')).toBe(true);
  });

  it('allows staff in rent roll, maintenance, and announcement posting only', async () => {
    const dashboard = await request(app).get('/api/staff/dashboard').set('Authorization', `Bearer ${staffToken}`);
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data.dashboard.kpi).toBeDefined();

    const rentRoll = await request(app).get('/api/landlord/rentroll').set('Authorization', `Bearer ${staffToken}`);
    expect(rentRoll.status).toBe(200);

    const tickets = await request(app).get('/api/landlord/tickets').set('Authorization', `Bearer ${staffToken}`);
    expect(tickets.status).toBe(200);

    const announcement = await request(app)
      .post('/api/landlord/announcements')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ title: 'Water shutoff', content: 'Water service will pause briefly.', category: 'Maintenance' });
    expect(announcement.status).toBe(201);

    const properties = await request(app).get('/api/landlord/properties').set('Authorization', `Bearer ${staffToken}`);
    expect(properties.status).toBe(403);
  });

  it('deactivates staff accounts and blocks their existing tokens', async () => {
    const response = await request(app)
      .delete(`/api/landlord/staff/${staff._id}`)
      .set('Authorization', `Bearer ${landlordToken}`);
    expect(response.status).toBe(200);

    const rentRoll = await request(app).get('/api/landlord/rentroll').set('Authorization', `Bearer ${staffToken}`);
    expect(rentRoll.status).toBe(401);
  });
});
