import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { requireProperty } from '../middlewares/tenant';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.use(requireProperty);

const createRoomSchema = z.object({
  room_type_id: z.string().uuid(),
  floor_id: z.string().uuid().optional(),
  number: z.string().min(1).max(20),
  name: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
  is_smoking: z.boolean().optional(),
  is_accessible: z.boolean().optional(),
  has_balcony: z.boolean().optional(),
  notes: z.string().optional(),
  rate_override: z.number().optional(),
});

const updateRoomSchema = z.object({
  room_type_id: z.string().uuid().optional(),
  floor_id: z.string().uuid().optional().nullable(),
  name: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
  is_smoking: z.boolean().optional(),
  is_accessible: z.boolean().optional(),
  has_balcony: z.boolean().optional(),
  notes: z.string().optional(),
  rate_override: z.number().optional().nullable(),
});

const changeStatusSchema = z.object({
  status: z.string().min(1),
  reason: z.string().optional(),
});

router.get('/', authorize('room.view'), roomController.findAll);
router.get('/status-summary', authorize('room.view'), roomController.getStatusSummary);
router.get('/:id', authorize('room.view'), roomController.findById);
router.get('/:id/status-history', authorize('room.view'), roomController.getStatusHistory);
router.post('/', authorize('room.update'), validate(createRoomSchema), roomController.create);
router.patch('/:id', authorize('room.update'), validate(updateRoomSchema), roomController.update);
router.delete('/:id', authorize('room.update'), roomController.delete);
router.patch('/:id/status', authorize('room.update'), validate(changeStatusSchema), roomController.changeStatus);

export default router;
