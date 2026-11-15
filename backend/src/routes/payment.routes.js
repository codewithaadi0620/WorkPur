import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/wallet', authenticate, paymentController.getWallet);
router.post('/deposit', authenticate, paymentController.deposit);
router.post('/withdraw', authenticate, paymentController.withdraw);

export default router;
