import rateLimit from 'express-rate-limit';

/**
 * Rate limiter cho login endpoint
 * Giới hạn 5 requests mỗi 15 phút
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter cho register endpoint
 * Giới hạn 3 requests mỗi giờ
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    error: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter chung cho API
 * Giới hạn 100 requests mỗi 15 phút
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Quá nhiều requests. Vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

