import { Router } from 'express';
import * as contractController from '../controllers/contract.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/my-contracts', authenticate, contractController.getUserContracts);
router.get('/:id', authenticate, contractController.getById);
router.post('/:id/complete', authenticate, contractController.complete);

export default router;
