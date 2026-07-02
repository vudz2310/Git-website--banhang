import jwt from 'jsonwebtoken';
import Cart from '../models/Cart.js';
import ProductVariant from '../models/ProductVariant.js';
import Product from '../models/Product.js';

// Helper to identify user or guest cart
const getCartIdentifier = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { type: 'user', query: { user_id: decoded.id } };
    } catch (err) {
      // Token expired or invalid, treat as guest
    }
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const cleanIp = ip.toString().replace(/[^a-zA-Z0-9]/g, '_');
  return { type: 'guest', query: { session_id: `guest_${cleanIp}`, user_id: null } };
};

export const getCart = async (req, res) => {
  try {
    const { type, query } = getCartIdentifier(req);
    
    // If logged in, let's check if there is an orphan guest cart for this IP to merge first
    if (type === 'user') {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const cleanIp = ip.toString().replace(/[^a-zA-Z0-9]/g, '_');
      const guestCartQuery = { session_id: `guest_${cleanIp}`, user_id: null };
      
      const guestCart = await Cart.findOne(guestCartQuery);
      if (guestCart && guestCart.items.length > 0) {
        let userCart = await Cart.findOne(query);
        if (!userCart) {
          userCart = await Cart.create({ user_id: query.user_id });
        }
        
        // Merge items
        for (const guestItem of guestCart.items) {
          const existingItem = userCart.items.find(
            item => item.variant_id.toString() === guestItem.variant_id.toString()
          );
          if (existingItem) {
            existingItem.quantity += guestItem.quantity;
          } else {
            userCart.items.push({
              variant_id: guestItem.variant_id,
              quantity: guestItem.quantity,
              unit_price: guestItem.unit_price
            });
          }
        }
        await userCart.save();
        await Cart.deleteOne(guestCartQuery);
      }
    }

    const cart = await Cart.findOne(query).populate({
      path: 'items.variant_id',
      populate: { path: 'product_id' }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const formattedItems = cart.items.map(item => {
      const variant = item.variant_id;
      if (!variant) return null;
      const product = variant.product_id;
      if (!product) return null;

      return {
        id: item._id.toString(),
        cart_id: cart._id.toString(),
        variant_id: variant._id.toString(),
        quantity: item.quantity,
        unit_price: item.unit_price,
        created_at: item.created_at,
        variant: {
          id: variant._id.toString(),
          product_id: product._id.toString(),
          variant_sku: variant.variant_sku,
          color: variant.color,
          size: variant.size,
          price: variant.price,
          compare_price: variant.compare_price,
          weight: variant.weight,
          is_active: variant.is_active,
          created_at: variant.created_at
        },
        product: {
          id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          product_img: product.product_img,
          brand: product.brand,
          is_active: product.is_active,
          created_at: product.created_at,
          updated_at: product.updated_at
        }
      };
    }).filter(Boolean);

    const total_amount = formattedItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    return res.status(200).json({
      id: cart._id.toString(),
      user_id: cart.user_id ? cart.user_id.toString() : 0,
      session_id: cart.session_id,
      expires_at: cart.expires_at,
      created_at: cart.created_at,
      items: formattedItems,
      total_amount
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addItem = async (req, res) => {
  try {
    const { variant_id, quantity, unit_price } = req.body;
    if (!variant_id || !quantity || !unit_price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const { query } = getCartIdentifier(req);
    let cart = await Cart.findOne(query);
    if (!cart) {
      cart = await Cart.create(query);
    }

    const existingItem = cart.items.find(
      item => item.variant_id.toString() === variant_id.toString()
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({
        variant_id,
        quantity: Number(quantity),
        unit_price: Number(unit_price)
      });
    }

    await cart.save();

    // Get the newly added/updated item
    const savedCart = await Cart.findById(cart._id).populate({
      path: 'items.variant_id',
      populate: { path: 'product_id' }
    });

    const savedItem = savedCart.items.find(
      item => item.variant_id._id.toString() === variant_id.toString()
    );

    const variant = savedItem.variant_id;
    const product = variant.product_id;

    return res.status(200).json({
      id: savedItem._id.toString(),
      cart_id: savedCart._id.toString(),
      variant_id: variant._id.toString(),
      quantity: savedItem.quantity,
      unit_price: savedItem.unit_price,
      created_at: savedItem.created_at,
      variant: {
        id: variant._id.toString(),
        product_id: product._id.toString(),
        price: variant.price
      },
      product: {
        id: product._id.toString(),
        name: product.name,
        product_img: product.product_img
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const { query } = getCartIdentifier(req);
    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    item.quantity = Number(quantity);
    await cart.save();

    return res.status(200).json({
      id: item._id.toString(),
      cart_id: cart._id.toString(),
      variant_id: item.variant_id.toString(),
      quantity: item.quantity,
      unit_price: item.unit_price,
      created_at: item.created_at
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { query } = getCartIdentifier(req);
    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.pull(itemId);
    await cart.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { query } = getCartIdentifier(req);
    const cart = await Cart.findOne(query);
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
