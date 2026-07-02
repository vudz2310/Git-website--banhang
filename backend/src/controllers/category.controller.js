import Category from '../models/Category.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sort_order: 1 });
    const data = categories.map(c => {
      const obj = c.toJSON();
      obj.id = obj._id.toString();
      return obj;
    });
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, parent_id, sort_order } = req.body;
    const category = await Category.create({
      name,
      slug,
      parent_id: parent_id || null,
      sort_order: sort_order || 0
    });
    return res.status(201).json({
      success: true,
      id: category._id.toString()
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
