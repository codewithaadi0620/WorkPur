import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.get('/admin', authenticate, authorize('ADMIN'), analyticsController.getAdminAnalytics);
router.get('/client', authenticate, authorize('CLIENT'), analyticsController.getClientDashboardStats);
router.get('/freelancer', authenticate, authorize('FREELANCER'), analyticsController.getFreelancerDashboardStats);
router.post('/refresh-views', authenticate, authorize('ADMIN'), analyticsController.refreshMaterializedViews);

export default router;
