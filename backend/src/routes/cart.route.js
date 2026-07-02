import express from 'express';
import { getCart, addItem, updateQuantity, removeItem, clearCart } from '../controllers/cart.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Lấy giỏ hàng hiện tại (hỗ trợ cả user đăng nhập và guest qua IP/Session)
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variant_id:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/items', addItem);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   post:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ hàng
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: itemId
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
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/items/:itemId', updateQuantity);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   delete:
 *     summary: Xóa sản phẩm khỏi giỏ hàng
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete('/items/:itemId', removeItem);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Xóa sạch giỏ hàng
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete('/', clearCart);

export default router;
