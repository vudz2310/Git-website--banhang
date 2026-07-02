import express from 'express';
import { getAvailableVouchers, getUserVouchers } from '../controllers/voucher.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/vouchers/available:
 *   get:
 *     summary: Lấy danh sách voucher đang hoạt động và còn thời hạn
 *     tags: [Vouchers]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/vouchers/available', getAvailableVouchers);

/**
 * @swagger
 * /api/user-vouchers/{userId}:
 *   get:
 *     summary: Lấy danh sách các voucher của một user cụ thể
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/user-vouchers/:userId', getUserVouchers);

export default router;
