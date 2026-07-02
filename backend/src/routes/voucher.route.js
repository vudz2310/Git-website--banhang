import express from 'express';
import { getAvailableVouchers, getUserVouchers } from '../controllers/voucher.controller.js';

const router = express.Router();

router.get('/vouchers/available', getAvailableVouchers);
router.get('/user-vouchers/:userId', getUserVouchers);

export default router;
