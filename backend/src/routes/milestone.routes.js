import { Router } from 'express';
import * as milestoneController from '../controllers/milestone.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createMilestoneSchema, submitMilestoneSchema } from '../validators/market.validator.js';

const router = Router();

// Client actions
router.post('/contract/:contractId', authenticate, authorize('CLIENT'), validate(createMilestoneSchema), milestoneController.create);
router.post('/:id/fund-escrow', authenticate, authorize('CLIENT'), milestoneController.fundEscrow);
router.post('/:id/approve', authenticate, authorize('CLIENT'), milestoneController.approve);
router.post('/:id/reject', authenticate, authorize('CLIENT'), milestoneController.reject);
router.post('/:id/release-payment', authenticate, authorize('CLIENT'), milestoneController.releasePayment);

// Freelancer actions
router.post('/:id/submit-work', authenticate, authorize('FREELANCER'), validate(submitMilestoneSchema), milestoneController.submitWork);

export default router;
