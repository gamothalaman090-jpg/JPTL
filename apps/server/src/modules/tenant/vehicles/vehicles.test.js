import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import { signToken } from '../../../shared/utils/jwt.js';

let mongoServer;
let tenantToken;
let tenantId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = 'test-jwt-secret-key-12345';

  const tenant = await User.create({
    firstName: 'Driver',
    lastName: 'Tenant',
    email: 'driver.tenant@example.com',
    password: 'Password123!',
    role: 'tenant',
  });
  tenantId = tenant._id;
  tenantToken = signToken({ id: tenant._id, role: tenant.role });

  await TenantProfile.create({
    user: tenantId,
    vehicles: [],
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Tenant Vehicle Registration API (/api/tenant/vehicles)', () => {
  let createdVehicleId;

  it('POST /api/tenant/vehicles - should register a new vehicle', async () => {
    const res = await request(app)
      .post('/api/tenant/vehicles')
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        make: 'Tesla Model Y',
        model: 'Long Range',
        color: 'Solid Black',
        licensePlate: '8XYZ999',
        decalNumber: 'DEC-9999',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.make).toBe('Tesla Model Y');
    expect(res.body.data.licensePlate).toBe('8XYZ999');
    createdVehicleId = res.body.data._id;
  });

  it('GET /api/tenant/vehicles - should list registered vehicles', async () => {
    const res = await request(app)
      .get('/api/tenant/vehicles')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].licensePlate).toBe('8XYZ999');
  });

  it('POST /api/tenant/vehicles - should reject duplicate license plate', async () => {
    const res = await request(app)
      .post('/api/tenant/vehicles')
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        make: 'Tesla Model Y',
        licensePlate: '8XYZ999',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/tenant/vehicles/:id - should remove vehicle', async () => {
    const res = await request(app)
      .delete(`/api/tenant/vehicles/${createdVehicleId}`)
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await TenantProfile.findOne({ user: tenantId });
    expect(check.vehicles.length).toBe(0);
  });
});
