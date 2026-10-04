import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/send';
import { Floor } from '../models/floor.model';
import { NotFoundError } from '../errors/app-error';

const router = Router();
router.use(authenticate);

router.get('/', authorize('room.view'), async (req, res, next) => {
  try {
    const where: any = { property_id: req.propertyId };
    const floors = await Floor.findAll({ where, order: [['level', 'ASC']] });
    sendSuccess(res, floors);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authorize('room.view'), async (req, res, next) => {
  try {
    const floor = await Floor.findByPk(req.params.id);
    if (!floor) throw new NotFoundError('Floor', req.params.id);
    sendSuccess(res, floor);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('room.update'), async (req, res, next) => {
  try {
    const floor = await Floor.create({
      ...req.body,
      property_id: req.propertyId,
      organization_id: req.organizationId,
    } as any);
    sendCreated(res, floor, 'Floor created successfully');
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authorize('room.update'), async (req, res, next) => {
  try {
    const floor = await Floor.findByPk(req.params.id);
    if (!floor) throw new NotFoundError('Floor', req.params.id);
    await floor.update(req.body);
    sendSuccess(res, floor, 'Floor updated successfully');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('room.update'), async (req, res, next) => {
  try {
    const floor = await Floor.findByPk(req.params.id);
    if (!floor) throw new NotFoundError('Floor', req.params.id);
    await floor.destroy();
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

export default router;
