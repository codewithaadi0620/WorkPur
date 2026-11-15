import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema } from '../validators/market.validator.js';

const router = Router();

// Public routes (anyone can browse projects)
router.get('/', projectController.getAll);

// Protected routes
router.get('/client/my-projects', authenticate, authorize('CLIENT'), projectController.getClientProjects);
router.get('/:id', authenticate, projectController.getById);
router.get('/:id/smart-matches', authenticate, authorize('CLIENT', 'ADMIN'), projectController.getSmartMatches);

// Client-only routes
router.post('/', authenticate, authorize('CLIENT'), validate(createProjectSchema), projectController.create);
router.put('/:id', authenticate, authorize('CLIENT'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', authenticate, authorize('CLIENT', 'ADMIN'), projectController.remove);

export default router;
