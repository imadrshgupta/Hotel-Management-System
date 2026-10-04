import { Router } from 'express';
import { posService } from '../services/pos.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/send';
import { getPaginationParams } from '../utils/pagination';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { requireProperty } from '../middlewares/tenant';

const router = Router();
router.use(authenticate);
router.use(requireProperty);

router.get('/', authorize('pos.view'), async (req, res, next) => {
  try {
    const { page, limit } = getPaginationParams(req.query as any);
    const { orders, total } = await posService.findAll(req.propertyId!, req.query, page, limit);
    sendPaginated(res, orders, total, page, limit);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authorize('pos.view'), async (req, res, next) => {
  try {
    const order = await posService.findById(req.params.id);
    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('pos.create'), async (req, res, next) => {
  try {
    const order = await posService.createOrder(
      {
        ...req.body,
        property_id: req.propertyId,
      },
      req.user!.userId
    );
    sendCreated(res, order, 'Order created');
  } catch (error) {
    next(error);
  }
});

router.post('/:id/post-to-room', authorize('pos.create'), async (req, res, next) => {
  try {
    const folioItem = await posService.postToRoom(
      req.params.id,
      req.body.stay_id,
      req.user!.userId
    );
    sendSuccess(res, folioItem, 'Order posted to room');
  } catch (error) {
    next(error);
  }
});

export default router;
