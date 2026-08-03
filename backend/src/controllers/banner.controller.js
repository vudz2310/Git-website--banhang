import Banner from "../models/Banner.js";

// Lấy danh sách banner đang hoạt động (Public)
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ sort_order: 1 });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy toàn bộ danh sách banner (Admin)
export const adminGetBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ sort_order: 1 });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo banner mới (Admin)
export const createBanner = async (req, res) => {
  try {
    const { title, image, redirectUrl, isActive, sort_order } = req.body;
    const newBanner = new Banner({
      title,
      image,
      redirectUrl,
      isActive,
      sort_order,
    });
    const saved = await newBanner.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Cập nhật thông tin banner (Admin)
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, redirectUrl, isActive, sort_order } = req.body;
    const updated = await Banner.findByIdAndUpdate(
      id,
      { title, image, redirectUrl, isActive, sort_order },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Không tìm thấy banner" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Xóa banner (Admin)
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Banner.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Không tìm thấy banner" });
    }
    res.status(200).json({ success: true, message: "Xóa banner thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
