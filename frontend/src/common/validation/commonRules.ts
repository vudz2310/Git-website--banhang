/**
 * Regex kiểm tra định dạng email tiêu chuẩn
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Regex kiểm tra số điện thoại Việt Nam (10 số, đầu 03, 05, 07, 08, 09 hoặc +84)
 */
export const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;

/**
 * Regex kiểm tra URL hợp lệ (http/https)
 */
export const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Kiểm tra giá trị bắt buộc (không được null, undefined hoặc rỗng)
 */
export function isRequired(value: unknown, fieldName = 'Trường này'): string | null {
  if (value === null || value === undefined) {
    return `${fieldName} không được để trống`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} không được để trống`;
  }
  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName} phải có ít nhất một mục`;
  }
  return null;
}

/**
 * Kiểm tra định dạng Email hợp lệ
 */
export function isEmail(email?: string): string | null {
  if (!email || !email.trim()) return 'Email không được để trống';
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Địa chỉ email không đúng định dạng (VD: example@domain.com)';
  }
  return null;
}

/**
 * Kiểm tra số điện thoại di động Việt Nam
 */
export function isVietnamPhoneNumber(phone?: string): string | null {
  if (!phone || !phone.trim()) return 'Số điện thoại không được để trống';
  const cleanPhone = phone.replace(/[\s.-]/g, '');
  if (!VN_PHONE_REGEX.test(cleanPhone)) {
    return 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)';
  }
  return null;
}

/**
 * Kiểm tra độ dài tối thiểu
 */
export function minLength(value: string, min: number, fieldName = 'Trường này'): string | null {
  if (!value || value.trim().length < min) {
    return `${fieldName} phải có ít nhất ${min} ký tự`;
  }
  return null;
}

/**
 * Kiểm tra độ dài tối đa
 */
export function maxLength(value: string, max: number, fieldName = 'Trường này'): string | null {
  if (value && value.trim().length > max) {
    return `${fieldName} không được vượt quá ${max} ký tự`;
  }
  return null;
}

/**
 * Kiểm tra số dương (> 0 hoặc >= 0)
 */
export function isPositiveNumber(
  value: number | string,
  allowZero = true,
  fieldName = 'Giá trị'
): string | null {
  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num)) return `${fieldName} phải là số`;
  if (allowZero && num < 0) return `${fieldName} không được nhỏ hơn 0`;
  if (!allowZero && num <= 0) return `${fieldName} phải lớn hơn 0`;
  return null;
}

/**
 * Kiểm tra đường dẫn URL hợp lệ
 */
export function isUrl(url?: string, fieldName = 'Đường dẫn'): string | null {
  if (!url || !url.trim()) return null;
  if (!URL_REGEX.test(url.trim())) {
    return `${fieldName} không đúng định dạng URL hợp lệ`;
  }
  return null;
}
