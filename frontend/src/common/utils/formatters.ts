/**
 * Format số tiền sang định dạng tiền tệ Việt Nam (VNĐ)
 * @example formatCurrency(150000) => "150.000 ₫"
 */
export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format số lượng hiển thị (phân cách hàng nghìn) - không có ký hiệu tiền tệ
 * @example formatNumberOnly(1234567) => "1.234.567"
 */
export function formatNumberOnly(value?: number | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
}

/**
 * Format ngày tháng năm (dd/mm/yyyy)
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch {
    return '—';
  }
}

/**
 * Format ngày giờ đầy đủ (HH:mm - dd/mm/yyyy)
 */
export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

/**
 * Tự động tạo slug chuẩn SEO và URL-friendly từ chuỗi tiếng Việt
 * @example generateSlug("Điện thoại iPhone 15 Pro") => "dien-thoai-iphone-15-pro"
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Cắt ngắn văn bản dài kèm dấu 3 chấm
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format số lượng hiển thị (phân cách hàng nghìn)
 * @example formatNumber(1234567) => "1.234.567"
 */
export function formatNumber(value?: number | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
}

export { getAssetUrl, API_HOST } from '../../api/http';

