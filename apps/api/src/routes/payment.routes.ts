import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
router.use(authenticate);

router.get('/:id', authorize('billing.create'), paymentController.findById);
router.get('/folio/:folioId', authorize('billing.create'), paymentController.findByFolio);
router.post('/', authorize('billing.create'), paymentController.create);
router.post('/:id/refund', authorize('billing.refund'), paymentController.refund);

export default router;
