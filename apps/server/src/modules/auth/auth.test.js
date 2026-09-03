import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../../app.js';
import User from '../../shared/models/user.model.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication Module API (/api/auth)', () => {
  let authToken;

  it('POST /api/auth/signup - should register a new landlord account', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Alexander',
        lastName: 'Vance',
        email: 'vance.landlord@example.com',
        password: 'Password123!',
        phone: '+1 (555) 123-4567',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('vance.landlord@example.com');
    expect(res.body.user.role).toBe('landlord');
  });

  it('POST /api/auth/signup - should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Alexander',
        lastName: 'Vance',
        email: 'vance.landlord@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/signup - should reject weak password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'weak',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login - should authenticate valid landlord and return token & cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'vance.landlord@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.role).toBe('landlord');
    expect(res.headers['set-cookie']).toBeDefined();

    authToken = res.body.token;
  });

  it('POST /api/auth/login - should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'vance.landlord@example.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/auth/change-password - should change password for authenticated user', async () => {
    const res = await request(app)
      .patch('/api/auth/change-password')
      .set('Cookie', [`token=${authToken}`])
      .send({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/auth/logout - should clear cookie session', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});
