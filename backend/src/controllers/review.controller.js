import * as reviewService from '../services/review.service.js';

export async function create(req, res, next) {
  try {
    const review = await reviewService.createReview(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserReviews(req, res, next) {
  try {
    const reviews = await reviewService.getReviewsForUser(req.params.userId);
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}
