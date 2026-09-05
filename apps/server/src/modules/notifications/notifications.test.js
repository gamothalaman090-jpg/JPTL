import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../../app.js';
import User from '../../shared/models/user.model.js';
import { Notification } from '../../shared/models/notification.model.js';
import { signToken } from '../../shared/utils/jwt.js';

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = 'test-jwt-secret-key-12345';
  process.env.VAPID_PUBLIC_KEY = 'test-vapid-public-key';
  process.env.VAPID_PRIVATE_KEY = 'test-vapid-private-key';

  const user = await User.create({
    firstName: 'Test',
    lastName: 'Resident',
    email: 'resident.notify@example.com',
    password: 'Password123!',
    role: 'tenant',
  });
  userId = user._id;
  userToken = signToken({ id: user._id, role: user.role });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Notifications & Web-Push API (/api/notifications)', () => {
  let createdNotifId;

  beforeEach(async () => {
    await Notification.deleteMany({});
    const n = await Notification.create({
      user: userId,
      title: 'Invoice Ready',
      body: 'Your monthly rent invoice is ready for payment.',
      type: 'payment',
      read: false,
    });
    createdNotifId = n._id.toString();
  });

  it('GET /api/notifications - should return user notifications and unreadCount', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Cookie', [`token=${userToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.unreadCount).toBe(1);
    expect(res.body.notifications.length).toBe(1);
    expect(res.body.notifications[0].title).toBe('Invoice Ready');
  });

  it('PATCH /api/notifications/:id/read - should mark a notification as read', async () => {
    const res = await request(app)
      .patch(`/api/notifications/${createdNotifId}/read`)
      .set('Cookie', [`token=${userToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notification.read).toBe(true);
    expect(res.body.unreadCount).toBe(0);
  });

  it('PATCH /api/notifications/read-all - should mark all notifications as read', async () => {
    await Notification.create({
      user: userId,
      title: 'Second Alert',
      body: 'Maintenance completed',
      type: 'maintenance',
      read: false,
    });

    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Cookie', [`token=${userToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.unreadCount).toBe(0);
  });

  it('POST /api/notifications/subscribe - should register push subscription', async () => {
    const res = await request(app)
      .post('/api/notifications/subscribe')
      .set('Cookie', [`token=${userToken}`])
      .send({
        subscription: {
          endpoint: 'https://fcm.googleapis.com/fcm/send/test-token-12345',
          keys: {
            p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0A43cxQ3iENbpf0iG5CDVFT1nCQvs-SLalN_nCQfoasE',
            auth: 'tBHItJAhAazQxNqBesTwOQ',
          },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
