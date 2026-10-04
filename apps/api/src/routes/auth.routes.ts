import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { authRateLimiter } from '../middlewares/rate-limiter';
import { loginSchema, refreshTokenSchema, changePasswordSchema } from '../validators/auth.validator';

const router = Router();

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/logout',
  validate(refreshTokenSchema),
  authController.logout
);

router.post(
  '/refresh',
  authRateLimiter,
  validate(refreshTokenSchema),
  authController.refreshToken
);

router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

export default router;
