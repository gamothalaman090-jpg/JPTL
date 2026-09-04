import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../../app.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Middleware Suite Verification', () => {
  it('should assign and return X-Request-ID correlation header', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(typeof res.headers['x-request-id']).toBe('string');
    expect(res.body.requestId).toBe(res.headers['x-request-id']);
  });

  it('should preserve incoming X-Request-ID header', async () => {
    const customId = 'trace-id-abc-123';
    const res = await request(app)
      .get('/api/health')
      .set('X-Request-ID', customId);

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBe(customId);
    expect(res.body.requestId).toBe(customId);
  });

  it('should set Helmet security headers', async () => {
    const res = await request(app).get('/api/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });

  it('should return standardized 404 for undefined routes', async () => {
    const res = await request(app).get('/api/non-existent-route-random-404');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Route GET /api/non-existent-route-random-404 not found');
  });

  it('should sanitize MongoDB operator injection keys ($gt, $ne, etc.)', async () => {
    // Attempting login with MongoDB operator injection payload
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: { $gt: '' },
        password: 'anypassword',
      });

    // The $gt operator should be stripped by sanitizeMiddleware before reaching DB
    // Since email object is emptied, validation fails gracefully with 400
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
