import express from 'express';
import { getDefaultAddress, saveDefaultAddress } from '../controllers/address.controller.js';

const router = express.Router();

router.get('/:userId/address-default', getDefaultAddress);
router.post('/:userId/address-default', saveDefaultAddress);

export default router;
