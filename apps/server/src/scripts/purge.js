import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import all models
import User from '../shared/models/user.model.js';
import Property from '../shared/models/property.model.js';
import Unit from '../shared/models/unit.model.js';
import TenantProfile from '../shared/models/tenantProfile.model.js';
import Lease from '../shared/models/lease.model.js';
import Payment from '../shared/models/payment.model.js';
import Ticket from '../shared/models/ticket.model.js';
import Announcement from '../shared/models/announcements.model.js';
import Document from '../shared/models/document.model.js';
import AuditLog from '../shared/models/auditLog.model.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export async function purgeData(silent = false) {
  const log = silent ? () => {} : console.log;

  log('🧹 Initiating database purge across all models...');

  const models = [
    { name: 'AuditLog', model: AuditLog },
    { name: 'Document', model: Document },
    { name: 'Ticket', model: Ticket },
    { name: 'Payment', model: Payment },
    { name: 'Lease', model: Lease },
    { name: 'TenantProfile', model: TenantProfile },
    { name: 'Unit', model: Unit },
    { name: 'Property', model: Property },
    { name: 'Announcement', model: Announcement },
    { name: 'User', model: User },
  ];

  const results = {};

  for (const { name, model } of models) {
    try {
      const deleteResult = await model.deleteMany({});
      results[name] = deleteResult.deletedCount || 0;
      log(`   🗑️  Deleted ${results[name]} documents from [${name}]`);
    } catch (err) {
      log(`   ⚠️  Error purging [${name}]: ${err.message}`);
      throw err;
    }
  }

  log('✅ Database purge successfully completed.');
  return results;
}

// Direct execution from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    try {
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error('MONGO_URI is not defined in environment variables');
      }

      console.log(`📡 Connecting to MongoDB: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
      await mongoose.connect(mongoUri);

      await purgeData();

      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
      process.exit(0);
    } catch (err) {
      console.error('❌ Purge failed:', err);
      process.exit(1);
    }
  })();
}
