import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';
import { signToken } from '../../../shared/utils/jwt.js';

let mongoServer;
let landlordToken;
let landlordId;
let tenantToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = 'test-jwt-secret-key-12345';

  const landlord = await User.create({
    firstName: 'Audit',
    lastName: 'Landlord',
    email: 'landlord.audit@example.com',
    password: 'Password123!',
    role: 'landlord',
  });
  landlordId = landlord._id;
  landlordToken = signToken({ id: landlord._id, role: landlord.role });

  const tenant = await User.create({
    firstName: 'Audit',
    lastName: 'Tenant',
    email: 'tenant.audit@example.com',
    password: 'Password123!',
    role: 'tenant',
  });
  tenantToken = signToken({ id: tenant._id, role: tenant.role });

  // Seed sample audit logs
  await AuditLog.create([
    {
      actor: landlordId,
      actorRole: 'landlord',
      action: 'LOGIN',
      entityKind: 'User',
      entityId: landlordId,
      ipAddress: '192.168.1.100',
    },
    {
      actor: landlordId,
      actorRole: 'landlord',
      action: 'CREATE_TENANT',
      entityKind: 'User',
      entityId: tenant._id,
      ipAddress: '192.168.1.100',
    },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Landlord Audit Logs API (/api/landlord/audit-logs)', () => {
  it('GET /api/landlord/audit-logs - should list audit logs for landlord', async () => {
    const res = await request(app)
      .get('/api/landlord/audit-logs')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.logs.length).toBe(2);
    expect(res.body.data.pagination.total).toBe(2);
    expect(res.body.data.logs[0].actorName).toBe('Audit Landlord');
  });

  it('GET /api/landlord/audit-logs - should filter by action', async () => {
    const res = await request(app)
      .get('/api/landlord/audit-logs?action=LOGIN')
      .set('Cookie', [`token=${landlordToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.logs.length).toBe(1);
    expect(res.body.data.logs[0].action).toBe('LOGIN');
  });

  it('GET /api/landlord/audit-logs - should reject non-landlord users', async () => {
    const res = await request(app)
      .get('/api/landlord/audit-logs')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(403);
  });
});
