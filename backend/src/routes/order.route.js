import express from 'express';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  getOrderItemsWithDetails, 
  updateOrderDetails,
  updateOrderStatus, 
  cancelOrder 
} from '../controllers/order.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới từ giỏ hàng hiện tại
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subtotal:
 *                 type: number
 *               discount:
 *                 type: number
 *               shipping_fee:
 *                 type: number
 *               total:
 *                 type: number
 *               note:
 *                 type: string
 *               shipping_address_json:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đặt hàng thành công
 */
router.post('/', createOrder);

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     summary: Lấy danh sách đơn hàng của người dùng
 *     tags: [Orders]
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
router.get('/user/:userId', getUserOrders);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng theo ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/:orderId', getOrderById);

/**
 * @swagger
 * /api/orders/{orderId}/items-with-details:
 *   get:
 *     summary: Lấy các sản phẩm trong đơn hàng kèm thông tin chi tiết (variant, product)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/:orderId/items-with-details', getOrderItemsWithDetails);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   post:
 *     summary: Cập nhật thông tin chi tiết đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/:orderId', updateOrderDetails);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   post:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/:orderId/status', updateOrderStatus);

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   post:
 *     summary: Hủy đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/:orderId/cancel', cancelOrder);

export default router;
