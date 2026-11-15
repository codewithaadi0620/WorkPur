import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/users', adminController.getUsers);
router.post('/users/:id/suspend', adminController.suspend);
router.post('/users/:id/activate', adminController.activate);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.get('/skills', adminController.getSkills);
router.post('/skills', adminController.createSkill);
router.get('/projects', adminController.getProjects);
router.put('/projects/:id/status', adminController.updateProjectStatus);


export default router;
