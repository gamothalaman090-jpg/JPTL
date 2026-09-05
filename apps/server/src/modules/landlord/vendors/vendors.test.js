import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Vendor from '../../../shared/models/vendor.model.js';
import { signToken } from '../../../shared/utils/jwt.js';

let mongoServer;
let landlordToken;
let landlordId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = 'test-jwt-secret-key-12345';

  const landlord = await User.create({
    firstName: 'Vendor',
    lastName: 'Manager',
    email: 'landlord.vendor@example.com',
    password: 'Password123!',
    role: 'landlord',
  });
  landlordId = landlord._id;
  landlordToken = signToken({ id: landlord._id, role: landlord.role });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Vendor Directory API (/api/landlord/vendors)', () => {
  let createdVendorId;

  it('POST /api/landlord/vendors - should create a new vendor', async () => {
    const res = await request(app)
      .post('/api/landlord/vendors')
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        name: 'Speedy Pipes Co.',
        category: 'Plumbing',
        contactPhone: '+1 (555) 333-4444',
        email: 'speedy@pipes.com',
        company: 'Speedy Pipes LLC',
        contactPerson: 'Bob Builder',
        autoAssign: true,
        rating: 4.9,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Speedy Pipes Co.');
    expect(res.body.data.autoAssign).toBe(true);
    createdVendorId = res.body.data._id;
  });

  it('GET /api/landlord/vendors - should list all landlord vendors', async () => {
    const res = await request(app)
      .get('/api/landlord/vendors')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].name).toBe('Speedy Pipes Co.');
  });

  it('PATCH /api/landlord/vendors/:id - should update vendor details', async () => {
    const res = await request(app)
      .patch(`/api/landlord/vendors/${createdVendorId}`)
      .set('Cookie', [`token=${landlordToken}`])
      .send({
        rating: 5.0,
        contactPerson: 'Robert Builder Jr.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5.0);
    expect(res.body.data.contactPerson).toBe('Robert Builder Jr.');
  });

  it('DELETE /api/landlord/vendors/:id - should delete vendor', async () => {
    const res = await request(app)
      .delete(`/api/landlord/vendors/${createdVendorId}`)
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await Vendor.findById(createdVendorId);
    expect(check).toBeNull();
  });
});
