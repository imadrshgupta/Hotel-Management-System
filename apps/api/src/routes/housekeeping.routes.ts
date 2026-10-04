import { Router } from 'express';
import { housekeepingController } from '../controllers/housekeeping.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { requireProperty } from '../middlewares/tenant';

const router = Router();
router.use(authenticate);
router.use(requireProperty);

router.get('/', authorize('housekeeping.view'), housekeepingController.findAll);
router.get('/:id', authorize('housekeeping.view'), housekeepingController.findById);
router.post('/:id/assign', authorize('housekeeping.update'), housekeepingController.assign);
router.post('/:id/start', authorize('housekeeping.update'), housekeepingController.start);
router.post('/:id/complete', authorize('housekeeping.update'), housekeepingController.complete);
router.post('/:id/inspect', authorize('housekeeping.update'), housekeepingController.inspect);

export default router;
