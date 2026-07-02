import express from 'express';
import { getDefaultAddress, saveDefaultAddress } from '../controllers/address.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/{userId}/address-default:
 *   get:
 *     summary: Lấy địa chỉ giao hàng mặc định của người dùng
 *     tags: [Address]
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
router.get('/:userId/address-default', getDefaultAddress);

/**
 * @swagger
 * /api/users/{userId}/address-default:
 *   post:
 *     summary: Lưu/cập nhật địa chỉ giao hàng mặc định của người dùng
 *     tags: [Address]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               line1:
 *                 type: string
 *               ward:
 *                 type: string
 *               district:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/:userId/address-default', saveDefaultAddress);

export default router;
