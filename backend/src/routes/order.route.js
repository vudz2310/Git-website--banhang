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

router.post('/', createOrder);
router.get('/user/:userId', getUserOrders);
router.get('/:orderId', getOrderById);
router.get('/:orderId/items-with-details', getOrderItemsWithDetails);
router.post('/:orderId', updateOrderDetails);
router.post('/:orderId/status', updateOrderStatus);
router.post('/:orderId/cancel', cancelOrder);

export default router;
