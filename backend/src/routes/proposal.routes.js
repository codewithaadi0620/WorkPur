import { Router } from 'express';
import * as proposalController from '../controllers/proposal.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { submitProposalSchema } from '../validators/market.validator.js';

const router = Router();

// Freelancer routes
router.post('/', authenticate, authorize('FREELANCER'), validate(submitProposalSchema), proposalController.submit);
router.get('/my-proposals', authenticate, authorize('FREELANCER'), proposalController.getFreelancerProposals);

// Client routes
router.get('/project/:projectId', authenticate, authorize('CLIENT', 'ADMIN'), proposalController.getProjectProposals);
router.post('/:id/accept', authenticate, authorize('CLIENT'), proposalController.accept);
router.post('/:id/reject', authenticate, authorize('CLIENT'), proposalController.reject);

export default router;
