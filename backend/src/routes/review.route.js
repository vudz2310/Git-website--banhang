import express from 'express';
import { 
  getProductReviews, 
  createReview, 
  getReviewsAdmin, 
  approveReview, 
  rejectReview, 
  deleteReview 
} from '../controllers/review.controller.js';

const router = express.Router();

router.get('/products/:productId/reviews', getProductReviews);
router.post('/reviews', createReview);
router.get('/reviews', getReviewsAdmin);
router.post('/reviews/:reviewId/approve', approveReview);
router.post('/reviews/:reviewId/reject', rejectReview);
router.delete('/reviews/:reviewId', deleteReview);

export default router;
