import { Router } from 'express';
import {
  getTenantDirectory,
  getTenantDetails,
  createTenant,
  updateTenant,
  deleteTenant,
} from './tenantdirectory.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';

const router = Router();

// Restrict entire router to authenticated landlords
router.use(requireAuth, requireRole('landlord'));

// GET /api/landlord/tenantdirectory - List all tenants with search/status filters
router.get('/', getTenantDirectory);

// GET /api/landlord/tenantdirectory/:id - Get single tenant detailed profile
router.get('/:id', getTenantDetails);

// POST /api/landlord/tenantdirectory - Create / Pre-add tenant
router.post('/', createTenant);

// PUT /api/landlord/tenantdirectory/:id - Update tenant / lease / unit assignment
router.put('/:id', updateTenant);

// DELETE /api/landlord/tenantdirectory/:id - Remove tenant and release unit
router.delete('/:id', deleteTenant);

export default router;
