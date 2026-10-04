import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { requireProperty } from '../middlewares/tenant';

const router = Router();
router.use(authenticate);
router.use(requireProperty);

router.get('/', authorize('billing.create'), invoiceController.findAll);
router.get('/:id', authorize('billing.create'), invoiceController.findById);
router.post('/generate', authorize('billing.create'), invoiceController.generate);
router.post('/:id/finalize', authorize('billing.create'), invoiceController.finalize);
router.post('/:id/void', authorize('billing.refund'), invoiceController.void_);

export default router;
