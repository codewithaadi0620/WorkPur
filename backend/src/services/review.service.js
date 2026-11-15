import { prisma, query } from '../config/database.js';

export async function createReview(reviewerId, { contractId, rating, comment }) {
  const contract = await prisma.contracts.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    const error = new Error('Contract not found.');
    error.statusCode = 404;
    throw error;
  }

  if (contract.status !== 'COMPLETED') {
    const error = new Error(`Cannot submit a review for a contract in ${contract.status} status. It must be COMPLETED.`);
    error.statusCode = 400;
    throw error;
  }

  if (reviewerId !== contract.client_id && reviewerId !== contract.freelancer_id) {
    const error = new Error('You are not a participant in this contract.');
    error.statusCode = 403;
    throw error;
  }

  const revieweeId = reviewerId === contract.client_id ? contract.freelancer_id : contract.client_id;

  // Insert review - database trigger will automatically recalculate freelancer rating
  const review = await prisma.reviews.create({
    data: {
      contract_id: contractId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating,
      comment,
    },
    include: {
      users_reviews_reviewer_idTousers: {
        select: { id: true, name: true, avatar_url: true },
      },
    },
  });

  return review;
}

export async function getReviewsForUser(userId) {
  const reviews = await prisma.reviews.findMany({
    where: { reviewee_id: userId },
    include: {
      users_reviews_reviewer_idTousers: {
        select: { id: true, name: true, avatar_url: true },
      },
      contracts: {
        include: {
          projects: {
            select: { id: true, title: true },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return reviews;
}
