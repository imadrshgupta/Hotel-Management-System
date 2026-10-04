import { Router } from 'express';
import { env } from '../config/env';

// Auth
import authRoutes from './auth.routes';

// Users
import userRoutes from './user.routes';

// Properties
import propertyRoutes from './property.routes';

// Floors
import floorRoutes from './floor.routes';

// Room Types
import roomTypeRoutes from './room-type.routes';

// Rooms
import roomRoutes from './room.routes';

// Guests
import guestRoutes from './guest.routes';

// Reservations
import reservationRoutes from './reservation.routes';

// Stays
import stayRoutes from './stay.routes';

// Folios
import folioRoutes from './folio.routes';

// Payments
import paymentRoutes from './payment.routes';

// Invoices
import invoiceRoutes from './invoice.routes';

// Housekeeping
import housekeepingRoutes from './housekeeping.routes';

// POS
import posRoutes from './pos.routes';

// Availability
import availabilityRoutes from './availability.routes';

// Reports
import reportRoutes from './report.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/health/ready', async (req, res) => {
  const checks: Record<string, string> = {};

  // Database check
  try {
    const { getSequelize } = await import('../config/database');
    await getSequelize().authenticate();
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  // Redis check
  try {
    const { getRedisClient } = await import('../config/redis');
    await getRedisClient().ping();
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

// API routes
const apiPrefix = env.API_PREFIX;

router.use(`${apiPrefix}/auth`, authRoutes);
router.use(`${apiPrefix}/users`, userRoutes);
router.use(`${apiPrefix}/properties`, propertyRoutes);
router.use(`${apiPrefix}/floors`, floorRoutes);
router.use(`${apiPrefix}/room-types`, roomTypeRoutes);
router.use(`${apiPrefix}/rooms`, roomRoutes);
router.use(`${apiPrefix}/guests`, guestRoutes);
router.use(`${apiPrefix}/reservations`, reservationRoutes);
router.use(`${apiPrefix}/stays`, stayRoutes);
router.use(`${apiPrefix}/folios`, folioRoutes);
router.use(`${apiPrefix}/payments`, paymentRoutes);
router.use(`${apiPrefix}/invoices`, invoiceRoutes);
router.use(`${apiPrefix}/housekeeping`, housekeepingRoutes);
router.use(`${apiPrefix}/pos`, posRoutes);
router.use(`${apiPrefix}/availability`, availabilityRoutes);
router.use(`${apiPrefix}/reports`, reportRoutes);

export default router;
