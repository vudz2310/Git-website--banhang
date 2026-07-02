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

/**
 * @swagger
 * /api/products/{productId}/reviews:
 *   get:
 *     summary: Lấy danh sách đánh giá của sản phẩm theo ID sản phẩm
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/products/:productId/reviews', getProductReviews);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Gửi đánh giá mới cho sản phẩm
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               rating:
 *                 type: number
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đánh giá đã được gửi
 */
router.post('/reviews', createReview);

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Lấy danh sách tất cả các đánh giá (Admin)
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/reviews', getReviewsAdmin);

/**
 * @swagger
 * /api/reviews/{reviewId}/approve:
 *   post:
 *     summary: Phê duyệt đánh giá
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/reviews/:reviewId/approve', approveReview);

/**
 * @swagger
 * /api/reviews/{reviewId}/reject:
 *   post:
 *     summary: Từ chối đánh giá
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/reviews/:reviewId/reject', rejectReview);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Xóa đánh giá
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete('/reviews/:reviewId', deleteReview);

export default router;
