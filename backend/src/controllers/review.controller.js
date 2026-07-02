import Review from '../models/Review.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product_id: productId })
      .populate('user_id')
      .populate('product_id');

    const data = reviews.map(r => {
      const obj = r.toJSON();
      obj.id = obj._id.toString();
      obj.user = r.user_id ? {
        full_name: r.user_id.full_name,
        email: r.user_id.email
      } : { full_name: 'Khách hàng', email: '' };
      obj.product = r.product_id ? {
        name: r.product_id.name,
        image_url: r.product_id.product_img
      } : { name: '', image_url: '' };
      return obj;
    });

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { product_id, user_id, rating, title, content } = req.body;
    if (!product_id || !user_id || !rating || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const review = await Review.create({
      product_id,
      user_id,
      rating: Number(rating),
      title: title || '',
      content: content || '',
      comment: content || '', // For backward compatibility with schema
      is_approved: false, // Moderated by default
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Đánh giá đã được gửi và đang chờ duyệt.',
      review
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user_id')
      .populate('product_id')
      .sort({ created_at: -1 });

    const data = reviews.map(r => {
      const obj = r.toJSON();
      obj.id = obj._id.toString();
      obj.user = r.user_id ? {
        full_name: r.user_id.full_name,
        email: r.user_id.email
      } : { full_name: 'Khách hàng', email: '' };
      obj.product = r.product_id ? {
        name: r.product_id.name,
        image_url: r.product_id.product_img
      } : { name: '', image_url: '' };
      return obj;
    });

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndUpdate(reviewId, { is_approved: true, status: 'approved' }, { new: true });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    return res.status(200).json({ success: true, review });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const rejectReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndUpdate(reviewId, { is_approved: false, status: 'rejected' }, { new: true });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    return res.status(200).json({ success: true, review });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
