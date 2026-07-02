import express from 'express';
import { getCart, addItem, updateQuantity, removeItem, clearCart } from '../controllers/cart.controller.js';

const router = express.Router();

router.get('/', getCart);
router.post('/items', addItem);
router.post('/items/:itemId', updateQuantity);
router.delete('/items/:itemId', removeItem);
router.delete('/', clearCart);

export default router;
