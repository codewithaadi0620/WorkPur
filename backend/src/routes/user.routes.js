import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import * as adminService from '../services/admin.service.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Public metadata routes
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await adminService.getCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (e) {
    next(e);
  }
});

router.get('/meta/skills', async (req, res, next) => {
  try {
    const skills = await adminService.getSkills();
    res.status(200).json({ success: true, data: skills });
  } catch (e) {
    next(e);
  }
});

router.get('/notifications', authenticate, userController.getNotifications);
router.put('/notifications/:id/read', authenticate, userController.markNotificationAsRead);
router.get('/:id', userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

export default router;
