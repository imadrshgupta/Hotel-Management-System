import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { requireProperty } from '../middlewares/tenant';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.use(requireProperty);

const guestSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
});

const createReservationSchema = z.object({
  check_in_date: z.string(),
  check_out_date: z.string(),
  adults: z.number().min(1),
  children: z.number().min(0).optional(),
  rooms_count: z.number().min(1).optional(),
  source: z.string().optional(),
  room_type_id: z.string().uuid(),
  guest: guestSchema,
  special_requests: z.string().optional(),
  notes: z.string().optional(),
  advance_paid: z.number().min(0).optional(),
});

const updateReservationSchema = z.object({
  check_in_date: z.string().optional(),
  check_out_date: z.string().optional(),
  adults: z.number().min(1).optional(),
  children: z.number().min(0).optional(),
  special_requests: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/', authorize('reservation.view'), reservationController.findAll);
router.get('/:id', authorize('reservation.view'), reservationController.findById);
router.post('/', authorize('reservation.create'), validate(createReservationSchema), reservationController.create);
router.patch('/:id', authorize('reservation.update'), validate(updateReservationSchema), reservationController.update);
router.post('/:id/confirm', authorize('reservation.update'), reservationController.confirm);
router.post('/:id/cancel', authorize('reservation.cancel'), reservationController.cancel);
router.post('/:id/no-show', authorize('reservation.update'), reservationController.noShow);

export default router;
