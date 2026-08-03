import express from "express";
import {
  getSettings,
  getSettingByKey,
  updateSetting,
} from "../controllers/setting.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route công khai để lấy cấu hình
router.get("/", getSettings);
router.get("/:key", getSettingByKey);

// Route admin để cập nhật cấu hình
router.put("/:key", verifyToken, isAdmin, updateSetting);

export default router;
