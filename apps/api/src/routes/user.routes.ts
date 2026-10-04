import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { getSequelize } from '../config/database';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/send';
import { getPaginationParams } from '../utils/pagination';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { UserRole } from '../models/user-role.model';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { NotFoundError } from '../errors/app-error';

const router = Router();
router.use(authenticate);

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional(),
  role_ids: z.array(z.string().uuid()).optional(),
});

router.get('/', authorize('user.view'), async (req, res, next) => {
  try {
    const { page, limit } = getPaginationParams(req.query as any);
    const where: any = {};
    if (req.user!.organizationId) where.organization_id = req.user!.organizationId;

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Role, as: 'roles', attributes: ['id', 'name', 'slug'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    sendPaginated(res, rows, count, page, limit);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authorize('user.view'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'roles' }],
    });
    if (!user) throw new NotFoundError('User', req.params.id);
    sendSuccess(res, user.toJSON());
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('user.create'), validate(createUserSchema), async (req, res, next) => {
  try {
    const user = await User.create({
      ...req.body,
      organization_id: req.user!.organizationId,
    } as any);

    // Assign roles
    if (req.body.role_ids?.length) {
      for (const roleId of req.body.role_ids) {
        await UserRole.create({
          user_id: user.id,
          role_id: roleId,
        } as any);
      }
    }

    sendCreated(res, user.toJSON(), 'User created successfully');
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authorize('user.update'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new NotFoundError('User', req.params.id);

    const { password, ...updateData } = req.body;
    await user.update(updateData);

    // Update roles if provided
    if (req.body.role_ids) {
      await UserRole.destroy({ where: { user_id: user.id } });
      for (const roleId of req.body.role_ids) {
        await UserRole.create({ user_id: user.id, role_id: roleId } as any);
      }
    }

    sendSuccess(res, user.toJSON(), 'User updated successfully');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('user.delete'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new NotFoundError('User', req.params.id);
    await user.destroy();
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

export default router;
