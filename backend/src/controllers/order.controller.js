import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import ProductVariant from '../models/ProductVariant.js';
import Product from '../models/Product.js';

const getCartIdentifier = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { type: 'user', query: { user_id: decoded.id } };
    } catch (err) {
      // ignore
    }
  }
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const cleanIp = ip.toString().replace(/[^a-zA-Z0-9]/g, '_');
  return { type: 'guest', query: { session_id: `guest_${cleanIp}`, user_id: null } };
};

export const createOrder = async (req, res) => {
  try {
    const { type, query } = getCartIdentifier(req);
    const cart = await Cart.findOne(query);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng đang trống.' });
    }

    // Map cart items to order items and verify details
    const orderItems = [];
    for (const item of cart.items) {
      const variant = await ProductVariant.findById(item.variant_id).populate('product_id');
      if (!variant) {
        return res.status(400).json({ success: false, message: `Biến thể ${item.variant_id} không tồn tại.` });
      }
      orderItems.push({
        product_id: variant.product_id._id,
        variant_id: variant._id,
        name_snapshot: variant.product_id.name,
        sku_snapshot: variant.variant_sku || null,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total: item.unit_price * item.quantity
      });
    }

    const {
      subtotal,
      discount,
      shipping_fee,
      tax,
      total,
      note,
      shipping_address_json
    } = req.body;

    const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    const code = `ORD-${Date.now()}-${randomSuffix}`;

    const order = await Order.create({
      user_id: query.user_id || null,
      code,
      status: 'pending',
      subtotal: Number(subtotal),
      discount: Number(discount || 0),
      shipping_fee: Number(shipping_fee || 30000),
      tax: Number(tax || 0),
      total: Number(total),
      currency: 'VND',
      payment_status: 'pending',
      shipping_status: 'pending',
      note: note || '',
      shipping_address_json: shipping_address_json || '',
      items: orderItems
    });

    // Clear cart items
    cart.items = [];
    await cart.save();

    // Format order object to have id
    const orderObj = order.toJSON();
    orderObj.id = orderObj._id.toString();

    return res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      order: orderObj
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const filter = { user_id: userId };
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(pageSize);

    const data = orders.map(order => {
      const obj = order.toJSON();
      obj.id = obj._id.toString();
      return obj;
    });

    return res.status(200).json({
      data,
      total,
      page,
      pageSize
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const obj = order.toJSON();
    obj.id = obj._id.toString();
    return res.status(200).json(obj);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrderItemsWithDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate({
      path: 'items.variant_id',
      populate: { path: 'product_id' }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const data = order.items.map(item => {
      const variant = item.variant_id;
      const product = variant ? variant.product_id : null;
      
      return {
        id: item._id.toString(),
        order_id: order._id.toString(),
        product_id: item.product_id.toString(),
        variant_id: item.variant_id ? item.variant_id._id.toString() : null,
        name_snapshot: item.name_snapshot,
        sku_snapshot: item.sku_snapshot,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total: item.total,
        product_name: item.name_snapshot,
        product_image: product ? product.product_img : '',
        variant_color: variant ? variant.color : '',
        variant_size: variant ? variant.size : ''
      };
    });

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(orderId, req.body, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const obj = order.toJSON();
    obj.id = obj._id.toString();
    return res.status(200).json(obj);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const obj = order.toJSON();
    obj.id = obj._id.toString();
    return res.status(200).json(obj);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(orderId, { status: 'cancelled' }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const obj = order.toJSON();
    obj.id = obj._id.toString();
    return res.status(200).json(obj);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
