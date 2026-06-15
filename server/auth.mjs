import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Secret key cho JWT - trong production nên dùng environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '1d'; // Token hết hạn sau 1 ngày

/**
 * Hash password sử dụng bcrypt
 */
export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password với hash
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Tạo JWT token
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware: Xác thực user từ JWT token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Gắn user info vào request
  req.user = decoded;
  next();
}

/**
 * Middleware: Yêu cầu quyền admin
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

/**
 * Middleware kết hợp: Authenticate + Require Admin
 */
export function authenticateAdmin(req, res, next) {
  authenticateToken(req, res, (err) => {
    if (err) return next(err);
    requireAdmin(req, res, next);
  });
}

/**
 * Middleware: Verify user ownership
 * Kiểm tra user chỉ có thể truy cập data của chính mình (trừ admin)
 */
export function verifyUserOwnership(req, res, next) {
  // Nếu chưa authenticate, yêu cầu login
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admin có thể truy cập data của bất kỳ user nào
  if (req.user.role === 'admin') {
    return next();
  }

  // User thường chỉ được truy cập data của chính họ
  const requestedUserId = Number(req.params.id || req.params.userId);
  
  if (!Number.isFinite(requestedUserId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (req.user.id !== requestedUserId) {
    return res.status(403).json({ error: 'Access denied: You can only access your own data' });
  }

  next();
}

