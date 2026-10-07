import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Lease from '../../../shared/models/lease.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import EvictionNotice from '../../../shared/models/evictionNotice.model.js';

let mongoServer;
let landlord;
let otherLandlord;
let tenant;
let landlordToken;
let otherLandlordToken;
let tenantToken;
let lease;
let unit;

const tokenFor = (user) => jwt.sign({ _id: user._id, id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';
  landlord = await User.create({ firstName: 'Land', lastName: 'Lord', email: 'landlord.eviction@example.com', password: 'Password123!', role: 'landlord', status: 'active' });
  otherLandlord = await User.create({ firstName: 'Other', lastName: 'Owner', email: 'other.eviction@example.com', password: 'Password123!', role: 'landlord', status: 'active' });
  tenant = await User.create({ firstName: 'Test', lastName: 'Tenant', email: 'tenant.eviction@example.com', password: 'Password123!', role: 'tenant', landlord: landlord._id, status: 'active' });
  landlordToken = tokenFor(landlord);
  otherLandlordToken = tokenFor(otherLandlord);
  tenantToken = tokenFor(tenant);
  const property = await Property.create({ name: 'Test Property', address: '1 Test Road', city: 'Test City', landlord: landlord._id });
  unit = await Unit.create({ label: 'Unit 1', property: property._id, tenant: tenant._id, monthlyRent: 1000, sqft: 700, status: 'occupied' });
  lease = await Lease.create({ tenant: tenant._id, landlord: landlord._id, property: property._id, unit: unit._id, leaseStart: new Date('2026-01-01'), leaseEnd: new Date('2027-01-01'), monthlyRent: 1000, status: 'active' });
  await TenantProfile.create({ user: tenant._id, property: property._id, unit: unit._id, status: 'active', monthlyRent: 1000 });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Eviction notices and override API', () => {
  let noticeId;

  it('issues a 40-day notice and exposes it to the assigned tenant', async () => {
    const issueDate = '2026-10-01';
    const created = await request(app).post('/api/landlord/eviction-notices')
      .set('Cookie', [`token=${landlordToken}`])
      .send({ leaseId: lease._id.toString(), reason: 'Automated integration test', issuedAt: issueDate });
    expect(created.status).toBe(201);
    expect(created.body.notice.noticePeriodDays).toBe(40);
    expect(new Date(created.body.notice.moveOutDate).toISOString().slice(0, 10)).toBe('2026-11-10');
    noticeId = created.body.notice._id;

    const tenantList = await request(app).get('/api/tenant/eviction-notices').set('Cookie', [`token=${tenantToken}`]);
    expect(tenantList.status).toBe(200);
    expect(tenantList.body.notices.map((notice) => notice._id)).toContain(noticeId);
  });

  it('denies a landlord access to a lease owned by another landlord', async () => {
    const res = await request(app).post('/api/landlord/eviction-notices')
      .set('Cookie', [`token=${otherLandlordToken}`])
      .send({ leaseId: lease._id.toString(), reason: 'Not authorized' });
    expect(res.status).toBe(404);
  });

  it('does not allow an active notice to be deleted', async () => {
    const res = await request(app).delete(`/api/landlord/eviction-notices/${noticeId}`)
      .set('Cookie', [`token=${landlordToken}`]);
    expect(res.status).toBe(409);
    expect(await EvictionNotice.findById(noticeId)).not.toBeNull();
  });

  it('allows the landlord to cancel an active notice and keeps the cancellation visible to the tenant', async () => {
    const res = await request(app).patch(`/api/landlord/eviction-notices/${noticeId}/cancel`)
      .set('Cookie', [`token=${landlordToken}`]).send({ reason: 'Resolved after review' });
    expect(res.status).toBe(200);
    expect(res.body.notice.status).toBe('canceled');
    expect(res.body.notice.cancellationReason).toBe('Resolved after review');
    expect(res.body.notice.canceledBy.toString()).toBe(landlord._id.toString());
    const tenantList = await request(app).get('/api/tenant/eviction-notices').set('Cookie', [`token=${tenantToken}`]);
    expect(tenantList.body.notices.find((notice) => notice._id === noticeId).status).toBe('canceled');
  });

  it('deletes a canceled notice from tenant and landlord lists', async () => {
    const res = await request(app).delete(`/api/landlord/eviction-notices/${noticeId}`)
      .set('Cookie', [`token=${landlordToken}`]);
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
    expect(await EvictionNotice.findById(noticeId)).toBeNull();
    const tenantList = await request(app).get('/api/tenant/eviction-notices').set('Cookie', [`token=${tenantToken}`]);
    expect(tenantList.body.notices.some((notice) => notice._id === noticeId)).toBe(false);
  });

  it('requires a reason for Evict Override and leaves the lease active', async () => {
    const res = await request(app).post(`/api/landlord/eviction-notices/${lease._id}/override`)
      .set('Cookie', [`token=${landlordToken}`]).send({});
    expect(res.status).toBe(400);
    const unchanged = await Lease.findById(lease._id);
    expect(unchanged.status).toBe('active');
  });

  it('Evict Override ends the lease, frees the unit, and records the override', async () => {
    const activeNotice = await request(app).post('/api/landlord/eviction-notices')
      .set('Cookie', [`token=${landlordToken}`])
      .send({ leaseId: lease._id.toString(), reason: 'Active notice for override test' });
    const activeNoticeId = activeNotice.body.notice._id;
    const res = await request(app).post(`/api/landlord/eviction-notices/${lease._id}/override`)
      .set('Cookie', [`token=${landlordToken}`]).send({ reason: 'Approved administrative override' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ended');
    expect((await Lease.findById(lease._id)).status).toBe('ended');
    const updatedUnit = await Unit.findById(unit._id);
    expect(updatedUnit.status).toBe('vacant');
    expect(updatedUnit.tenant).toBeNull();
    const profile = await TenantProfile.findOne({ user: tenant._id });
    expect(profile.status).toBe('evicted');
    expect(profile.property).toBeNull();
    expect((await EvictionNotice.findById(activeNoticeId)).status).toBe('overridden');
    expect(await EvictionNotice.findById(noticeId)).toBeNull();
  });
});
