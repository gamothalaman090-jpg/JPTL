import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';

let mongoServer;
let landlordToken;
let landlordUser;

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
    onboardingCompleted: false,
    status: 'active',
  });

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

describe('Landlord Onboarding Module API (/api/landlord/onboarding)', () => {
  let createdPropId;

  it('GET /api/landlord/onboarding/status - should return current setup checklist status', async () => {
    const res = await request(app)
      .get('/api/landlord/onboarding/status')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.onboardingCompleted).toBe(false);
  });

  it('POST /api/landlord/onboarding/plan - should select portfolio plan tier', async () => {
    const res = await request(app)
      .post('/api/landlord/onboarding/plan')
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        plan: 'pro',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.plan).toBe('pro');
  });

  it('POST /api/landlord/onboarding/properties - should create initial property during onboarding', async () => {
    const res = await request(app)
      .post('/api/landlord/onboarding/properties')
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        name: 'Horizon View Tower',
        address: '101 Skyline Way',
        city: 'Bay Area',
        category: 'Residential',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Horizon View Tower');
    createdPropId = res.body.data._id || res.body.data.id;
  });

  it('POST /api/landlord/onboarding/units - should add unit to property during onboarding', async () => {
    const res = await request(app)
      .post('/api/landlord/onboarding/units')
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        propertyId: createdPropId,
        label: 'Penthouse 1A',
        monthlyRent: 3200,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1500,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.label).toBe('Penthouse 1A');
  });

  it('POST /api/landlord/onboarding/announcement - should create welcome announcement', async () => {
    const res = await request(app)
      .post('/api/landlord/onboarding/announcement')
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        title: 'Welcome to Horizon View Residences!',
        content: 'We are thrilled to welcome all new residents to our smart building community.',
        propertyId: createdPropId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('Welcome');
  });
});
