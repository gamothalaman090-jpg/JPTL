import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';
import * as controller from './paymentOptions.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (/^image\/(png|jpeg|webp)$/.test(file.mimetype)) callback(null, true);
    else callback(new Error('QR image must be PNG, JPG, or WebP'));
  },
});

const router = Router();
router.use(requireAuth, requireRole('landlord'));
router.get('/', controller.list);
router.post('/', upload.single('qrImage'), controller.create);
router.put('/:id', upload.single('qrImage'), controller.update);
router.patch('/:id/active', controller.setActive);
export default router;
