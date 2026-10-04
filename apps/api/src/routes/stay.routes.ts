import { Router } from 'express';
import { stayController } from '../controllers/stay.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { requireProperty } from '../middlewares/tenant';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.use(requireProperty);

const checkInSchema = z.object({
  reservation_id: z.string().uuid(),
  room_id: z.string().uuid(),
  guest_id: z.string().uuid(),
  actual_check_in: z.string().optional(),
  notes: z.string().optional(),
});

const checkOutSchema = z.object({
  actual_check_out: z.string().optional(),
  notes: z.string().optional(),
});

const extendStaySchema = z.object({
  check_out_date: z.string(),
});

router.get('/', authorize('checkin.create'), stayController.findAll);
router.get('/active', authorize('checkin.create'), stayController.getActiveStays);
router.get('/:id', authorize('checkin.create'), stayController.findById);
router.post('/check-in', authorize('checkin.create'), validate(checkInSchema), stayController.checkIn);
router.post('/:id/check-out', authorize('checkout.create'), validate(checkOutSchema), stayController.checkOut);
router.patch('/:id/extend', authorize('checkin.create'), validate(extendStaySchema), stayController.extendStay);

export default router;
