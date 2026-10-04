import { Router } from 'express';
import { reportService } from '../services/report.service';
import { sendSuccess } from '../utils/send';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { requireProperty } from '../middlewares/tenant';

const router = Router();
router.use(authenticate);
router.use(requireProperty);

router.get('/arrivals', authorize('report.view'), async (req, res, next) => {
  try {
    const data = await reportService.getArrivals(req.propertyId!, req.query.date as string);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/departures', authorize('report.view'), async (req, res, next) => {
  try {
    const data = await reportService.getDepartures(req.propertyId!, req.query.date as string);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/in-house', authorize('report.view'), async (req, res, next) => {
  try {
    const data = await reportService.getInHouseGuests(req.propertyId!);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/room-status', authorize('report.view'), async (req, res, next) => {
  try {
    const data = await reportService.getRoomStatus(req.propertyId!);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/daily-revenue', authorize('report.view'), async (req, res, next) => {
  try {
    const data = await reportService.getDailyRevenue(req.propertyId!, req.query.date as string);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/occupancy', authorize('report.view'), async (req, res, next) => {
  try {
    const data = await reportService.getOccupancyReport(
      req.propertyId!,
      req.query.start_date as string,
      req.query.end_date as string
    );
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/payments', authorize('report.view'), async (req, res, next) => {
  try {
    const data = await reportService.getPaymentsReport(
      req.propertyId!,
      req.query.start_date as string,
      req.query.end_date as string
    );
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/outstanding', authorize('report.view'), async (req, res, next) => {
  try {
    const data = await reportService.getOutstandingReport(req.propertyId!);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

export default router;
