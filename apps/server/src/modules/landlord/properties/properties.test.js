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

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed Landlord User
  landlordUser = await User.create({
    firstName: 'Ian',
    lastName: 'Landlord',
    email: 'ian.landlord@example.com',
    password: 'Password123!',
    role: 'landlord',
    status: 'active',
  });

  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';
  landlordToken = jwt.sign(
    { _id: landlordUser._id, id: landlordUser._id, role: 'landlord', email: landlordUser.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Landlord Properties & Units Management API', () => {
  let createdPropertyId;

  it('POST /api/landlord/properties - should create a new property', async () => {
    const res = await request(app)
      .post('/api/landlord/properties')
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        name: 'Grand Imperial Residences',
        address: '100 Sunset Boulevard',
        city: 'Bay Area',
        category: 'Luxury',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Grand Imperial Residences');
    expect(res.body.data.landlord.toString()).toBe(landlordUser._id.toString());
    createdPropertyId = res.body.data._id;
  });

  it('GET /api/landlord/properties - should list all properties with unit counts', async () => {
    const res = await request(app)
      .get('/api/landlord/properties')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].name).toBe('Grand Imperial Residences');
  });

  it('POST /api/landlord/properties/:id/units - should add a unit to property', async () => {
    const res = await request(app)
      .post(`/api/landlord/properties/${createdPropertyId}/units`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        label: 'Penthouse 12A',
        monthlyRent: 3500,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1400,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.label).toBe('Penthouse 12A');
  });

  it('DELETE /api/landlord/properties/:id - should delete property and its vacant units', async () => {
    const res = await request(app)
      .delete(`/api/landlord/properties/${createdPropertyId}`)
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deletedPropertyId).toBe(createdPropertyId.toString());

    // Verify property and unit are gone from DB
    const propInDb = await Property.findById(createdPropertyId);
    expect(propInDb).toBeNull();

    const unitsInDb = await Unit.find({ property: createdPropertyId });
    expect(unitsInDb.length).toBe(0);
  });
});
