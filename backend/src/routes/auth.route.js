import express from "express";

import { login, register } from "../controllers/auth.controller.js";

const router = express.Router();
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary:
 *       Đăng nhập
 *
 *     tags:
 *       - Auth
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *
 *           schema:
 *
 *             type: object
 *
 *             properties:
 *
 *               email:
 *                 type: string
 *
 *               password:
 *                 type: string
 *
 *     responses:
 *
 *       200:
 *
 *         description:
 *           Thành công
 */

router.post("/login", login);
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary:
 *       Đăng kí
 *
 *     tags:
 *       - Auth
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *
 *           schema:
 *
 *             type: object
 *
 *             properties:
 *
 *               email:
 *                 type: string
 *
 *               password:
 *                 type: string
 *
 *               full_name:
 *                 type: string
 *
 *               phone:
 *                 type: string
 *
 *     responses:
 *
 *       200:
 *
 *         description:
 *           Thành công
 */
router.post("/register", register);

export default router;
