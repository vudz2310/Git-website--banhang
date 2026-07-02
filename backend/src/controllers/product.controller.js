import mongoose from 'mongoose';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import ProductImage from '../models/ProductImage.js';
import Category from '../models/Category.js';

export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 12;
    const skip = (page - 1) * pageSize;

    let filter = { is_active: true };

    if (req.query.category) {
      const categoryDoc = await Category.findOne({ slug: req.query.category });
      if (categoryDoc) {
        filter.category_id = categoryDoc._id;
      } else {
        if (mongoose.Types.ObjectId.isValid(req.query.category)) {
          filter.category_id = req.query.category;
        }
      }
    }

    let sort = { created_at: -1 };
    if (req.query.new === 'true') {
      sort = { created_at: -1 };
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const data = await Promise.all(products.map(async (p) => {
      const productObj = p.toJSON();
      productObj.id = productObj._id.toString();

      const variants = await ProductVariant.find({ product_id: p._id, is_active: true });
      const images = await ProductImage.find({ product_id: p._id });

      productObj.has_images = images.length > 0;

      if (variants.length > 0) {
        const prices = variants.map(v => v.price);
        const comparePrices = variants.map(v => v.compare_price).filter(price => price != null);

        productObj.price = {
          min: Math.min(...prices),
          max: Math.max(...prices),
          compare_min: comparePrices.length > 0 ? Math.min(...comparePrices) : null,
          compare_max: comparePrices.length > 0 ? Math.max(...comparePrices) : null,
          has_discount: variants.some(v => v.compare_price && v.compare_price > v.price)
        };
      } else {
        productObj.price = null;
      }

      return productObj;
    }));

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

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productObj = product.toJSON();
    productObj.id = productObj._id.toString();

    const variants = await ProductVariant.find({ product_id: product._id, is_active: true });
    const images = await ProductImage.find({ product_id: product._id });

    const formattedVariants = variants.map(v => {
      const vObj = v.toJSON();
      vObj.id = vObj._id.toString();
      return vObj;
    });

    const formattedImages = images.map(img => {
      const imgObj = img.toJSON();
      imgObj.id = imgObj._id.toString();
      return imgObj;
    });

    if (variants.length > 0) {
      const prices = variants.map(v => v.price);
      const comparePrices = variants.map(v => v.compare_price).filter(price => price != null);

      productObj.price = {
        min: Math.min(...prices),
        max: Math.max(...prices),
        compare_min: comparePrices.length > 0 ? Math.min(...comparePrices) : null,
        compare_max: comparePrices.length > 0 ? Math.max(...comparePrices) : null,
        has_discount: variants.some(v => v.compare_price && v.compare_price > v.price)
      };
    } else {
      productObj.price = null;
    }

    return res.status(200).json({
      product: productObj,
      variants: formattedVariants,
      images: formattedImages
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
