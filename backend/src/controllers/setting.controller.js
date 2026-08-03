import Setting from "../models/Setting.js";

// Lấy tất cả settings dạng key-value
export const getSettings = async (req, res) => {
  try {
    const settingsList = await Setting.find({});
    const settingsMap = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return res.json({ success: true, data: settingsMap });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lấy danh sách cấu hình thất bại",
    });
  }
};

// Lấy setting theo key
export const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ key });
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy cấu hình với key: ${key}`,
      });
    }
    return res.json({ success: true, data: setting.value });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lấy cấu hình thất bại",
    });
  }
};

// Cập nhật hoặc tạo mới setting theo key (chỉ dành cho admin)
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Giá trị cấu hình (value) là bắt buộc",
      });
    }

    let setting = await Setting.findOne({ key });
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key, value });
    }

    return res.json({
      success: true,
      message: `Cập nhật cấu hình '${key}' thành công`,
      data: setting.value,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Cập nhật cấu hình thất bại",
    });
  }
};
