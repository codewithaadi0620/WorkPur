import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { reviewSchema } from '../validators/market.validator.js';

const router = Router();

router.post('/', authenticate, validate(reviewSchema), reviewController.create);
router.get('/user/:userId', reviewController.getUserReviews);

export default router;
