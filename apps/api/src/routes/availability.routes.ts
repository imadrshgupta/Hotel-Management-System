import { Router } from 'express';
import { availabilityService } from '../services/availability.service';
import { sendSuccess } from '../utils/send';
import { authenticate } from '../middlewares/authenticate';
import { requireProperty } from '../middlewares/tenant';

const router = Router();
router.use(authenticate);
router.use(requireProperty);

router.get('/room-types', async (req, res, next) => {
  try {
    const availability = await availabilityService.getRoomTypeAvailability({
      property_id: req.propertyId!,
      check_in_date: req.query.check_in_date as string,
      check_out_date: req.query.check_out_date as string,
      room_type_id: req.query.room_type_id as string,
      adults: req.query.adults ? parseInt(req.query.adults as string, 10) : undefined,
    });
    sendSuccess(res, availability);
  } catch (error) {
    next(error);
  }
});

router.get('/rooms', async (req, res, next) => {
  try {
    const availability = await availabilityService.getRoomAvailabilityForDates(
      req.propertyId!,
      req.query.start_date as string,
      req.query.end_date as string
    );
    sendSuccess(res, availability);
  } catch (error) {
    next(error);
  }
});

router.get('/occupancy', async (req, res, next) => {
  try {
    const data = await availabilityService.getOccupancyData(
      req.propertyId!,
      req.query.date as string
    );
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

export default router;
