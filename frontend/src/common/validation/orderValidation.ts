import { isRequired, isEmail, isVietnamPhoneNumber } from './commonRules';
import type { ValidationResult } from './authValidation';

export interface CheckoutValidationData {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  district?: string;
  ward?: string;
  address?: string;
  paymentMethod?: string;
}

/**
 * Validate form thanh toán đơn hàng
 */
export function validateCheckoutForm(data: CheckoutValidationData): ValidationResult {
  const errors: Record<string, string> = {};

  const nameErr = isRequired(data.fullName, 'Họ và tên người nhận');
  if (nameErr) errors.fullName = nameErr;

  const emailErr = isEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const phoneErr = isVietnamPhoneNumber(data.phone);
  if (phoneErr) errors.phone = phoneErr;

  const cityErr = isRequired(data.city, 'Tỉnh / Thành phố');
  if (cityErr) errors.city = cityErr;

  const distErr = isRequired(data.district, 'Quận / Huyện');
  if (distErr) errors.district = distErr;

  const addrErr = isRequired(data.address, 'Địa chỉ chi tiết');
  if (addrErr) errors.address = addrErr;

  const paymentErr = isRequired(data.paymentMethod, 'Phương thức thanh toán');
  if (paymentErr) errors.paymentMethod = paymentErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate mã Voucher
 */
export function validateVoucherCode(code?: string): string | null {
  if (!code || !code.trim()) return 'Vui lòng nhập mã voucher';
  if (code.trim().length < 3) return 'Mã voucher phải có ít nhất 3 ký tự';
  return null;
}
