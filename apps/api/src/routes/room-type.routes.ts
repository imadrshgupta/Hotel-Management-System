import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/send';
import { RoomType } from '../models/room-type.model';
import { NotFoundError } from '../errors/app-error';

const router = Router();
router.use(authenticate);

router.get('/', authorize('room.view'), async (req, res, next) => {
  try {
    const where: any = { property_id: req.propertyId };
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === 'true';
    const roomTypes = await RoomType.findAll({ where, order: [['sort_order', 'ASC']] });
    sendSuccess(res, roomTypes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authorize('room.view'), async (req, res, next) => {
  try {
    const roomType = await RoomType.findByPk(req.params.id);
    if (!roomType) throw new NotFoundError('Room Type', req.params.id);
    sendSuccess(res, roomType);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('room.update'), async (req, res, next) => {
  try {
    const roomType = await RoomType.create({
      ...req.body,
      property_id: req.propertyId,
      organization_id: req.organizationId,
    } as any);
    sendCreated(res, roomType, 'Room type created successfully');
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authorize('room.update'), async (req, res, next) => {
  try {
    const roomType = await RoomType.findByPk(req.params.id);
    if (!roomType) throw new NotFoundError('Room Type', req.params.id);
    await roomType.update(req.body);
    sendSuccess(res, roomType, 'Room type updated successfully');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('room.update'), async (req, res, next) => {
  try {
    const roomType = await RoomType.findByPk(req.params.id);
    if (!roomType) throw new NotFoundError('Room Type', req.params.id);
    await roomType.destroy();
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

export default router;
