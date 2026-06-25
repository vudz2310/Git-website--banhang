import express from "express";
import {
  getBanners,
  adminGetBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/banner.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route công khai
router.get("/", getBanners);

// Route bảo vệ cho Admin
router.get("/admin", verifyToken, isAdmin, adminGetBanners);
router.post("/", verifyToken, isAdmin, createBanner);
router.put("/:id", verifyToken, isAdmin, updateBanner);
router.delete("/:id", verifyToken, isAdmin, deleteBanner);

export default router;
