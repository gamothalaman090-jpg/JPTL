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
import { purgeData } from './purge.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export async function seedData() {
  console.log('🌱 Starting comprehensive database seeder...');

  // 1. Purge existing data for clean idempotent state
  await purgeData(true);
  console.log('✨ Clean database slate ready.');

  // ==========================================
  // 2. SEED USERS
  // ==========================================
  console.log('👤 Seeding Users (Superadmin, Landlords, Tenants)...');

  // Superadmin
  const superadmin = await User.create({
    firstName: 'Alexander',
    lastName: 'Vance',
    email: 'admin@jptl.com',
    password: 'Password123!',
    phone: '+1 (555) 000-0001',
    role: 'superadmin',
    status: 'active',
  });

  // Primary Landlord
  const primaryLandlord = await User.create({
    firstName: 'Julian',
    middleName: 'E.',
    lastName: 'Thorne',
    email: 'landlord@jptl.com',
    password: 'Password123!',
    phone: '+1 (555) 100-0001',
    role: 'landlord',
    plan: 'pro',
    onboardingCompleted: true,
    status: 'active',
  });

  // Secondary Landlord
  const secondaryLandlord = await User.create({
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.landlord@jptl.com',
    password: 'Password123!',
    phone: '+1 (555) 100-0002',
    role: 'landlord',
    plan: 'starter',
    onboardingCompleted: true,
    status: 'active',
  });

  // Tenants
  const tenantSophia = await User.create({
    firstName: 'Sophia',
    lastName: 'Lin',
    email: 'tenant@jptl.com',
    password: 'Password123!',
    phone: '+1 (555) 200-0001',
    role: 'tenant',
    landlord: primaryLandlord._id,
    status: 'active',
  });

  const tenantMarcus = await User.create({
    firstName: 'Marcus',
    middleName: 'A.',
    lastName: 'Miller',
    email: 'marcus.tenant@jptl.com',
    password: 'Password123!',
    phone: '+1 (555) 200-0002',
    role: 'tenant',
    landlord: primaryLandlord._id,
    status: 'active',
  });

  const tenantElena = await User.create({
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.tenant@jptl.com',
    password: 'Password123!',
    phone: '+1 (555) 200-0003',
    role: 'tenant',
    landlord: primaryLandlord._id,
    status: 'active',
  });

  const tenantDavid = await User.create({
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.tenant@jptl.com',
    password: 'Password123!',
    phone: '+1 (555) 200-0004',
    role: 'tenant',
    landlord: secondaryLandlord._id,
    status: 'active',
  });

  const tenantProspect = await User.create({
    firstName: 'Rachel',
    lastName: 'Zane',
    email: 'prospect.tenant@jptl.com',
    password: 'Password123!',
    phone: '+1 (555) 200-0005',
    role: 'tenant',
    landlord: primaryLandlord._id,
    status: 'active',
  });

  console.log(`   ✅ Seeded 8 users (1 Superadmin, 2 Landlords, 5 Tenants)`);

  // ==========================================
  // 3. SEED PROPERTIES
  // ==========================================
  console.log('🏢 Seeding Properties...');

  const propAuraSky = await Property.create({
    name: 'Aura Sky Towers',
    address: '450 Financial Way',
    city: 'Downtown Metro',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    unitsCount: 4,
    occupancyRate: 50,
    category: 'Luxury',
    featured: true,
    landlord: primaryLandlord._id,
  });

  const propGrandHorizon = await Property.create({
    name: 'Grand Horizon Residences',
    address: '1200 Pacific Heights Blvd',
    city: 'San Francisco',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    unitsCount: 2,
    occupancyRate: 50,
    category: 'Residential',
    featured: false,
    landlord: primaryLandlord._id,
  });

  const propArtisanLofts = await Property.create({
    name: 'The Artisan Lofts',
    address: '88 Art District Lane',
    city: 'Brooklyn',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
    unitsCount: 2,
    occupancyRate: 50,
    category: 'Studio',
    featured: true,
    landlord: secondaryLandlord._id,
  });

  console.log(`   ✅ Seeded 3 properties`);

  // ==========================================
  // 4. SEED UNITS
  // ==========================================
  console.log('🚪 Seeding Units...');

  // Aura Sky Towers Units
  const unit101 = await Unit.create({
    label: 'Unit 101',
    property: propAuraSky._id,
    tenant: tenantSophia._id,
    monthlyRent: 2400,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1150,
    status: 'occupied',
    leaseStart: new Date('2026-01-01'),
    leaseEnd: new Date('2026-12-31'),
  });

  const unit102 = await Unit.create({
    label: 'Unit 102',
    property: propAuraSky._id,
    tenant: tenantMarcus._id,
    monthlyRent: 1850,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 800,
    status: 'occupied',
    leaseStart: new Date('2026-03-01'),
    leaseEnd: new Date('2027-02-28'),
  });

  const unit103 = await Unit.create({
    label: 'Unit 103',
    property: propAuraSky._id,
    tenant: null,
    monthlyRent: 3200,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1600,
    status: 'vacant',
  });

  const unit104 = await Unit.create({
    label: 'Unit 104',
    property: propAuraSky._id,
    tenant: null,
    monthlyRent: 1450,
    bedrooms: 0,
    bathrooms: 1,
    sqft: 550,
    status: 'maintenance',
  });

  // Grand Horizon Units
  const unit201 = await Unit.create({
    label: 'Unit 201',
    property: propGrandHorizon._id,
    tenant: tenantElena._id,
    monthlyRent: 2100,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    status: 'occupied',
    leaseStart: new Date('2025-09-01'),
    leaseEnd: new Date('2026-08-31'),
  });

  const unit202 = await Unit.create({
    label: 'Unit 202',
    property: propGrandHorizon._id,
    tenant: null,
    monthlyRent: 1950,
    bedrooms: 2,
    bathrooms: 1.5,
    sqft: 1050,
    status: 'vacant',
  });

  // Artisan Lofts Units
  const unitPenthouse401 = await Unit.create({
    label: 'Penthouse 401',
    property: propArtisanLofts._id,
    tenant: tenantDavid._id,
    monthlyRent: 4500,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2200,
    status: 'occupied',
    leaseStart: new Date('2025-06-01'),
    leaseEnd: new Date('2027-05-31'),
  });

  const unitArtisan101 = await Unit.create({
    label: 'Studio 101',
    property: propArtisanLofts._id,
    tenant: null,
    monthlyRent: 1600,
    bedrooms: 0,
    bathrooms: 1,
    sqft: 600,
    status: 'vacant',
  });

  console.log(`   ✅ Seeded 8 units (4 occupied, 3 vacant, 1 maintenance)`);

  // ==========================================
  // 5. SEED TENANT PROFILES
  // ==========================================
  console.log('📋 Seeding Tenant Profiles...');

  await TenantProfile.create({
    user: tenantSophia._id,
    property: propAuraSky._id,
    unit: unit101._id,
    monthlyRent: 2400,
    securityDeposit: 2400,
    leaseStart: unit101.leaseStart,
    leaseEnd: unit101.leaseEnd,
    status: 'active',
    autoPayEnabled: true,
    paymentMethods: [
      {
        id: 'pm_card_visa_4242',
        brand: 'Visa',
        last4: '4242',
        type: 'card',
        isDefault: true,
        expiry: '12/28',
      },
      {
        id: 'pm_ach_chase_1190',
        brand: 'Chase Bank',
        last4: '1190',
        type: 'ach',
        isDefault: false,
      },
    ],
  });

  await TenantProfile.create({
    user: tenantMarcus._id,
    property: propAuraSky._id,
    unit: unit102._id,
    monthlyRent: 1850,
    securityDeposit: 1850,
    leaseStart: unit102.leaseStart,
    leaseEnd: unit102.leaseEnd,
    status: 'active',
    autoPayEnabled: true,
    paymentMethods: [
      {
        id: 'pm_card_mc_8812',
        brand: 'Mastercard',
        last4: '8812',
        type: 'card',
        isDefault: true,
        expiry: '08/27',
      },
    ],
  });

  await TenantProfile.create({
    user: tenantElena._id,
    property: propGrandHorizon._id,
    unit: unit201._id,
    monthlyRent: 2100,
    securityDeposit: 2100,
    leaseStart: unit201.leaseStart,
    leaseEnd: unit201.leaseEnd,
    status: 'active',
    autoPayEnabled: false,
    paymentMethods: [],
  });

  await TenantProfile.create({
    user: tenantDavid._id,
    property: propArtisanLofts._id,
    unit: unitPenthouse401._id,
    monthlyRent: 4500,
    securityDeposit: 4500,
    leaseStart: unitPenthouse401.leaseStart,
    leaseEnd: unitPenthouse401.leaseEnd,
    status: 'active',
    autoPayEnabled: true,
    paymentMethods: [
      {
        id: 'pm_card_amex_1004',
        brand: 'Amex',
        last4: '1004',
        type: 'card',
        isDefault: true,
        expiry: '11/29',
      },
    ],
  });

  await TenantProfile.create({
    user: tenantProspect._id,
    property: null,
    unit: null,
    monthlyRent: 0,
    status: 'pre_added',
    autoPayEnabled: false,
    paymentMethods: [],
  });

  console.log(`   ✅ Seeded 5 tenant profiles`);

  // ==========================================
  // 6. SEED DIGITAL LEASES
  // ==========================================
  console.log('📑 Seeding Leases & Extension Requests...');

  await Lease.create({
    tenant: tenantSophia._id,
    landlord: primaryLandlord._id,
    property: propAuraSky._id,
    unit: unit101._id,
    leaseStart: unit101.leaseStart,
    leaseEnd: unit101.leaseEnd,
    monthlyRent: 2400,
    securityDeposit: 2400,
    status: 'active',
    contractPdfUrl: '/docs/sample-lease-agreement.pdf',
    covenants: [
      'Quiet hours: 10:00 PM – 7:00 AM daily',
      'Trash disposal via floor chutes (7:00 AM – 10:00 PM)',
      'Guest registration required for stays exceeding 48 hours',
      'No unauthorized structural alterations or lock changes',
      'Pets permitted under 35 lbs with valid vaccination records',
    ],
    extensionRequests: [
      {
        termMonths: 12,
        proposedStartDate: new Date('2027-01-01'),
        proposedEndDate: new Date('2027-12-31'),
        monthlyRent: 2400,
        tenantNotes: 'Looking forward to renewing our residency at Aura Sky Towers for another full year!',
        status: 'pending',
        requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  await Lease.create({
    tenant: tenantMarcus._id,
    landlord: primaryLandlord._id,
    property: propAuraSky._id,
    unit: unit102._id,
    leaseStart: unit102.leaseStart,
    leaseEnd: unit102.leaseEnd,
    monthlyRent: 1850,
    securityDeposit: 1850,
    status: 'active',
    contractPdfUrl: '/docs/sample-lease-agreement.pdf',
    covenants: [
      'Quiet hours: 10:00 PM – 7:00 AM daily',
      'No smoking in units, balconies, or common areas',
      'Designated parking space: P-42',
    ],
    extensionRequests: [],
  });

  await Lease.create({
    tenant: tenantElena._id,
    landlord: primaryLandlord._id,
    property: propGrandHorizon._id,
    unit: unit201._id,
    leaseStart: unit201.leaseStart,
    leaseEnd: unit201.leaseEnd,
    monthlyRent: 2100,
    securityDeposit: 2100,
    status: 'renewal_approved',
    contractPdfUrl: '/docs/sample-lease-agreement.pdf',
    extensionRequests: [
      {
        termMonths: 6,
        proposedStartDate: new Date('2026-09-01'),
        proposedEndDate: new Date('2027-02-28'),
        monthlyRent: 2100,
        tenantNotes: 'Requesting a 6-month extension due to employment relocation schedule.',
        status: 'approved',
        landlordNotes: 'Approved with current terms retained.',
        requestedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        reviewedBy: primaryLandlord._id,
      },
    ],
  });

  await Lease.create({
    tenant: tenantDavid._id,
    landlord: secondaryLandlord._id,
    property: propArtisanLofts._id,
    unit: unitPenthouse401._id,
    leaseStart: unitPenthouse401.leaseStart,
    leaseEnd: unitPenthouse401.leaseEnd,
    monthlyRent: 4500,
    securityDeposit: 4500,
    status: 'active',
    contractPdfUrl: '/docs/sample-lease-agreement.pdf',
    extensionRequests: [],
  });

  console.log(`   ✅ Seeded 4 active leases with digital covenants & extensions`);

  // ==========================================
  // 7. SEED PAYMENTS & RENT ROLL
  // ==========================================
  console.log('💳 Seeding Rent Roll & Payment Ledgers...');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.toLocaleString('en-US', { month: 'long' });

  // Sophia Lin Payments
  await Payment.create({
    tenant: tenantSophia._id,
    unit: unit101._id,
    property: propAuraSky._id,
    amount: 2400,
    baseRent: 2200,
    parkingFee: 150,
    utilityFee: 50,
    processingFee: 0,
    dueDate: new Date(currentYear, now.getMonth() - 1, 1),
    status: 'paid',
    period: `${new Date(currentYear, now.getMonth() - 1, 1).toLocaleString('en-US', { month: 'long' })} ${currentYear} Rent`,
    paymentMethod: 'Visa •••• 4242',
    mockTransactionId: 'TXN_SOPHIA_PREV_MO',
    paidAt: new Date(currentYear, now.getMonth() - 1, 2, 10, 30),
    notes: 'Auto-paid via card',
  });

  await Payment.create({
    tenant: tenantSophia._id,
    unit: unit101._id,
    property: propAuraSky._id,
    amount: 2400,
    baseRent: 2200,
    parkingFee: 150,
    utilityFee: 50,
    processingFee: 0,
    dueDate: new Date(currentYear, now.getMonth(), 1),
    status: 'paid',
    period: `${currentMonth} ${currentYear} Rent`,
    paymentMethod: 'Visa •••• 4242',
    mockTransactionId: 'TXN_SOPHIA_CURR_MO',
    paidAt: new Date(currentYear, now.getMonth(), 1, 9, 15),
    notes: 'Auto-paid via card',
  });

  await Payment.create({
    tenant: tenantSophia._id,
    unit: unit101._id,
    property: propAuraSky._id,
    amount: 2400,
    baseRent: 2200,
    parkingFee: 150,
    utilityFee: 50,
    processingFee: 0,
    dueDate: new Date(currentYear, now.getMonth() + 1, 1),
    status: 'pending',
    period: `${new Date(currentYear, now.getMonth() + 1, 1).toLocaleString('en-US', { month: 'long' })} ${currentYear} Rent`,
    notes: 'Scheduled for automated processing on due date',
  });

  // Marcus Miller Payments
  await Payment.create({
    tenant: tenantMarcus._id,
    unit: unit102._id,
    property: propAuraSky._id,
    amount: 1850,
    baseRent: 1750,
    parkingFee: 100,
    utilityFee: 0,
    dueDate: new Date(currentYear, now.getMonth() - 1, 1),
    status: 'paid',
    period: `${new Date(currentYear, now.getMonth() - 1, 1).toLocaleString('en-US', { month: 'long' })} ${currentYear} Rent`,
    paymentMethod: 'Mastercard •••• 8812',
    mockTransactionId: 'TXN_MARCUS_PREV_MO',
    paidAt: new Date(currentYear, now.getMonth() - 1, 3, 14, 20),
  });

  await Payment.create({
    tenant: tenantMarcus._id,
    unit: unit102._id,
    property: propAuraSky._id,
    amount: 1850,
    baseRent: 1750,
    parkingFee: 100,
    utilityFee: 0,
    dueDate: new Date(currentYear, now.getMonth(), 1),
    status: 'overdue',
    period: `${currentMonth} ${currentYear} Rent`,
    notes: 'First reminder notice sent',
  });

  // Elena Rostova Payments
  await Payment.create({
    tenant: tenantElena._id,
    unit: unit201._id,
    property: propGrandHorizon._id,
    amount: 2100,
    baseRent: 2000,
    parkingFee: 100,
    utilityFee: 0,
    dueDate: new Date(currentYear, now.getMonth(), 1),
    status: 'pending',
    period: `${currentMonth} ${currentYear} Rent`,
  });

  // David Kim Payments
  await Payment.create({
    tenant: tenantDavid._id,
    unit: unitPenthouse401._id,
    property: propArtisanLofts._id,
    amount: 4500,
    baseRent: 4200,
    parkingFee: 300,
    utilityFee: 0,
    dueDate: new Date(currentYear, now.getMonth(), 1),
    status: 'paid',
    period: `${currentMonth} ${currentYear} Rent`,
    paymentMethod: 'Amex •••• 1004',
    mockTransactionId: 'TXN_DAVID_CURR_MO',
    paidAt: new Date(currentYear, now.getMonth(), 1, 8, 0),
  });

  console.log(`   ✅ Seeded 7 payment records (Paid, Pending, Overdue)`);

  // ==========================================
  // 8. SEED MAINTENANCE TICKETS
  // ==========================================
  console.log('🔧 Seeding Maintenance Tickets...');

  await Ticket.create({
    title: 'Master Bath Faucet Leak',
    description: 'The cold water knob has a continuous drip causing water pooling on countertop.',
    category: 'Plumbing',
    priority: 'medium',
    status: 'in_progress',
    unit: unit101._id,
    tenant: tenantSophia._id,
    photoUrls: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    ],
    assignedTechnician: {
      name: 'Marco Rossi',
      phone: '+1 (555) 300-0010',
      company: 'Apex Plumbing Solutions',
      eta: 'Tomorrow at 10:00 AM',
      rating: 4.9,
    },
    statusHistory: [
      {
        status: 'submitted',
        changedBy: tenantSophia._id,
        userRole: 'tenant',
        note: 'Ticket submitted via Tenant Portal',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        status: 'acknowledged',
        changedBy: primaryLandlord._id,
        userRole: 'landlord',
        note: 'Reviewed issue details. Assigned plumbing specialist.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        status: 'in_progress',
        changedBy: primaryLandlord._id,
        userRole: 'landlord',
        note: 'Technician dispatched with parts order.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ],
  });

  await Ticket.create({
    title: 'HVAC Airflow Weak in Living Room',
    description: 'Central air blower seems weak and air is not reaching target temperature on hot afternoons.',
    category: 'HVAC',
    priority: 'high',
    status: 'submitted',
    unit: unit102._id,
    tenant: tenantMarcus._id,
    photoUrls: [],
    assignedTechnician: null,
    statusHistory: [
      {
        status: 'submitted',
        changedBy: tenantMarcus._id,
        userRole: 'tenant',
        note: 'Submitted by tenant',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ],
  });

  await Ticket.create({
    title: 'Balcony Light Fixture Flickering',
    description: 'Exterior light switch causes buzzing and flickering bulb on 2nd floor balcony.',
    category: 'Electrical',
    priority: 'low',
    status: 'resolved',
    unit: unit201._id,
    tenant: tenantElena._id,
    photoUrls: [],
    assignedTechnician: {
      name: 'James Carter',
      phone: '+1 (555) 300-0020',
      company: 'VoltWorks Electric',
      eta: 'Completed',
      rating: 5.0,
    },
    statusHistory: [
      {
        status: 'submitted',
        changedBy: tenantElena._id,
        userRole: 'tenant',
        note: 'Initial report',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        status: 'in_progress',
        changedBy: primaryLandlord._id,
        userRole: 'landlord',
        note: 'Electrician dispatched',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        status: 'resolved',
        changedBy: primaryLandlord._id,
        userRole: 'landlord',
        note: 'Replaced faulty junction box and installed LED fixture.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log(`   ✅ Seeded 3 maintenance tickets (In Progress, Submitted, Resolved)`);

  // ==========================================
  // 9. SEED ANNOUNCEMENTS
  // ==========================================
  console.log('📢 Seeding Announcements...');

  await Announcement.create({
    title: 'Scheduled Annual HVAC & Fire Alarm Testing',
    content: 'Please be advised that certified technicians will be conducting annual fire alarm audio testing and HVAC inspections on Wednesday between 9:00 AM and 1:00 PM. Alarm horns will sound intermittently.',
    category: 'Maintenance',
    isPinned: true,
    author: primaryLandlord._id,
  });

  await Announcement.create({
    title: 'Updated Resident Amenities & Pool Lounge Hours',
    content: 'Summer amenity hours are now in effect! The rooftop pool and fitness center are open from 6:00 AM to 11:00 PM daily. Please ensure all guests are registered at the front desk.',
    category: 'Policy',
    isPinned: false,
    author: primaryLandlord._id,
  });

  await Announcement.create({
    title: 'Community Summer Rooftop Mixer',
    content: 'Join us next Saturday at 6:30 PM on the Aura Sky Towers Skyline Terrace for complimentary artisan appetizers and refreshments! A great opportunity to connect with your neighbors.',
    category: 'General',
    isPinned: false,
    author: primaryLandlord._id,
  });

  await Announcement.create({
    title: 'JPTL Cloud Platform Infrastructure Upgrade',
    content: 'The platform infrastructure is undergoing scheduled routine optimization tonight at 2:00 AM UTC. No service interruption is anticipated.',
    category: 'System',
    isPinned: true,
    author: superadmin._id,
  });

  console.log(`   ✅ Seeded 4 announcements`);

  // ==========================================
  // 10. SEED COMPLIANCE DOCUMENTS
  // ==========================================
  console.log('📁 Seeding Resident Compliance Documents...');

  await Document.create({
    tenant: tenantSophia._id,
    unit: unit101._id,
    name: 'Signed_Lease_Agreement_Sophia_Lin.pdf',
    type: 'Lease Agreement',
    category: 'lease',
    size: '1.4 MB',
    fileUrl: 'https://res.cloudinary.com/fzpweior/raw/upload/sample_lease.pdf',
    status: 'Verified',
    reviewedBy: primaryLandlord._id,
    verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  });

  await Document.create({
    tenant: tenantSophia._id,
    unit: unit101._id,
    name: 'State_Farm_Renters_Insurance_Binder_2026.pdf',
    type: 'Insurance Policy',
    category: 'upload',
    size: '850 KB',
    fileUrl: 'https://res.cloudinary.com/fzpweior/raw/upload/insurance_binder.pdf',
    status: 'Verified',
    reviewedBy: primaryLandlord._id,
    verifiedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  });

  await Document.create({
    tenant: tenantSophia._id,
    unit: unit101._id,
    name: 'Government_Issued_Passport_Copy.pdf',
    type: 'Government ID',
    category: 'upload',
    size: '2.1 MB',
    fileUrl: 'https://res.cloudinary.com/fzpweior/raw/upload/passport_sample.pdf',
    status: 'Verified',
    reviewedBy: primaryLandlord._id,
    verifiedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
  });

  await Document.create({
    tenant: tenantSophia._id,
    unit: unit101._id,
    name: 'August_2026_Employment_Paystub.pdf',
    type: 'Proof of Income',
    category: 'upload',
    size: '420 KB',
    fileUrl: 'https://res.cloudinary.com/fzpweior/raw/upload/paystub_aug.pdf',
    status: 'Pending Review',
  });

  await Document.create({
    tenant: tenantMarcus._id,
    unit: unit102._id,
    name: 'Expired_Driver_License.pdf',
    type: 'Government ID',
    category: 'upload',
    size: '980 KB',
    fileUrl: 'https://res.cloudinary.com/fzpweior/raw/upload/license_expired.pdf',
    status: 'Rejected',
    rejectionReason: 'The uploaded identification document expired in June 2024. Please provide a current non-expired ID.',
    reviewedBy: primaryLandlord._id,
    verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  console.log(`   ✅ Seeded 5 compliance documents (Verified, Pending Review, Rejected)`);

  // ==========================================
  // 11. SEED AUDIT LOGS
  // ==========================================
  console.log('📜 Seeding Security Audit Logs...');

  await AuditLog.create({
    actor: primaryLandlord._id,
    actorRole: 'landlord',
    action: 'PROPERTY_CREATE',
    entityKind: 'Property',
    entityId: propAuraSky._id,
    ipAddress: '192.168.1.100',
  });

  await AuditLog.create({
    actor: primaryLandlord._id,
    actorRole: 'landlord',
    action: 'UNIT_CREATE',
    entityKind: 'Unit',
    entityId: unit101._id,
    ipAddress: '192.168.1.100',
  });

  await AuditLog.create({
    actor: primaryLandlord._id,
    actorRole: 'landlord',
    action: 'DOCUMENT_VERIFIED',
    entityKind: 'Document',
    entityId: unit101._id,
    ipAddress: '192.168.1.100',
  });

  await AuditLog.create({
    actor: tenantSophia._id,
    actorRole: 'tenant',
    action: 'PAYMENT_PROCESSED',
    entityKind: 'Payment',
    ipAddress: '192.168.1.105',
  });

  await AuditLog.create({
    actor: superadmin._id,
    actorRole: 'superadmin',
    action: 'SYSTEM_SETTINGS_UPDATE',
    entityKind: 'User',
    entityId: superadmin._id,
    ipAddress: '10.0.0.1',
  });

  console.log(`   ✅ Seeded 5 security audit logs`);

  console.log('\n========================================================');
  console.log('🎉 ALL DATA SEEDED SUCCESSFULLY!');
  console.log('========================================================');
  console.log('🔑 TEST CREDENTIALS:');
  console.log('   👑 Superadmin: admin@jptl.com        / Password123!');
  console.log('   🏡 Landlord:   landlord@jptl.com     / Password123!');
  console.log('   🏡 Landlord 2: sarah.landlord@jptl.com / Password123!');
  console.log('   🛋️ Tenant 1:   tenant@jptl.com       / Password123! (Unit 101, Aura Sky Towers)');
  console.log('   🛋️ Tenant 2:   marcus.tenant@jptl.com / Password123! (Unit 102, Aura Sky Towers)');
  console.log('   🛋️ Tenant 3:   elena.tenant@jptl.com / Password123! (Unit 201, Grand Horizon)');
  console.log('   🛋️ Tenant 4:   david.tenant@jptl.com / Password123! (Penthouse 401)');
  console.log('========================================================\n');
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

      await seedData();

      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
      process.exit(0);
    } catch (err) {
      console.error('❌ Seeder failed:', err);
      process.exit(1);
    }
  })();
}
