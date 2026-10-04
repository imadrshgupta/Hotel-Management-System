import { Router } from 'express';
import { guestController } from '../controllers/guest.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { requireProperty } from '../middlewares/tenant';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.use(requireProperty);

const createGuestSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  company_name: z.string().optional(),
  tax_id: z.string().optional(),
  vip_status: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/', authorize('guest.view'), guestController.findAll);
router.get('/search-duplicate', authorize('guest.view'), guestController.searchDuplicate);
router.get('/:id', authorize('guest.view'), guestController.findById);
router.post('/', authorize('guest.create'), validate(createGuestSchema), guestController.create);
router.patch('/:id', authorize('guest.update'), guestController.update);
router.delete('/:id', authorize('guest.update'), guestController.delete);
router.post('/:id/documents', authorize('guest.update'), guestController.addDocument);
router.post('/:id/preferences', authorize('guest.update'), guestController.addPreference);

export default router;
