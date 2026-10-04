import { Router } from 'express';
import { folioController } from '../controllers/folio.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const addItemSchema = z.object({
  description: z.string().min(1),
  category: z.string().min(1),
  quantity: z.number().min(0),
  unit_price: z.number().min(0),
  tax_amount: z.number().min(0).optional(),
  discount_amount: z.number().min(0).optional(),
  reference_type: z.string().optional(),
  reference_id: z.string().uuid().optional(),
});

router.get('/:id', authorize('billing.create'), folioController.findById);
router.get('/stay/:stayId', authorize('billing.create'), folioController.findByStay);
router.post('/:id/items', authorize('billing.create'), folioController.addItem);
router.delete('/:id/items/:itemId', authorize('billing.refund'), folioController.removeItem);

export default router;
