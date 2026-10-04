import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/send';
import { getPaginationParams } from '../utils/pagination';
import { Property } from '../models/property.model';
import { NotFoundError } from '../errors/app-error';

const router = Router();
router.use(authenticate);

router.get('/', authorize('property.view'), async (req, res, next) => {
  try {
    const { page, limit } = getPaginationParams(req.query as any);
    const where: any = {};
    if (req.user!.organizationId) where.organization_id = req.user!.organizationId;

    const { count, rows } = await Property.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    sendPaginated(res, rows, count, page, limit);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authorize('property.view'), async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) throw new NotFoundError('Property', req.params.id);
    sendSuccess(res, property);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('property.update'), async (req, res, next) => {
  try {
    const property = await Property.create({
      ...req.body,
      organization_id: req.user!.organizationId,
    } as any);
    sendCreated(res, property, 'Property created successfully');
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authorize('property.update'), async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) throw new NotFoundError('Property', req.params.id);
    await property.update(req.body);
    sendSuccess(res, property, 'Property updated successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
