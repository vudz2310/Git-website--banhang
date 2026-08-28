import { isRequired, isEmail, isVietnamPhoneNumber, minLength } from './commonRules';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate Họ và tên
 */
export function validateFullName(name?: string): string | null {
  const req = isRequired(name, 'Họ và tên');
  if (req) return req;
  return minLength(name!, 2, 'Họ và tên');
}

/**
 * Validate Mật khẩu (tối thiểu 6 ký tự)
 */
export function validatePassword(password?: string, min = 6): string | null {
  const req = isRequired(password, 'Mật khẩu');
  if (req) return req;
  return minLength(password!, min, 'Mật khẩu');
}

/**
 * Validate Xác nhận mật khẩu trùng khớp
 */
export function validatePasswordConfirm(password?: string, confirmPassword?: string): string | null {
  const req = isRequired(confirmPassword, 'Xác nhận mật khẩu');
  if (req) return req;
  if (password !== confirmPassword) {
    return 'Mật khẩu xác nhận không trùng khớp';
  }
  return null;
}

/**
 * Validate Form Đăng nhập
 */
export function validateLoginForm(data: { email?: string; password?: string }): ValidationResult {
  const errors: Record<string, string> = {};

  const emailErr = isEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(data.password, 1);
  if (passErr) errors.password = passErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate Form Đăng ký tài khoản
 */
export function validateRegisterForm(data: {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const nameErr = validateFullName(data.fullName);
  if (nameErr) errors.fullName = nameErr;

  const emailErr = isEmail(data.email);
  if (emailErr) errors.email = emailErr;

  if (data.phone) {
    const phoneErr = isVietnamPhoneNumber(data.phone);
    if (phoneErr) errors.phone = phoneErr;
  }

  const passErr = validatePassword(data.password, 6);
  if (passErr) errors.password = passErr;

  const confirmErr = validatePasswordConfirm(data.password, data.confirmPassword);
  if (confirmErr) errors.confirmPassword = confirmErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
