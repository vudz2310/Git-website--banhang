import { isRequired, isPositiveNumber, minLength } from './commonRules';
import type { ValidationResult } from './authValidation';

export interface ProductValidationData {
  name?: string;
  slug?: string;
  category_id?: string | number | null;
  sku?: string;
  price?: number | string;
  compare_price?: number | string;
  stock_quantity?: number | string;
}

/**
 * Validate thông tin sản phẩm và biến thể
 */
export function validateProductForm(data: ProductValidationData): ValidationResult {
  const errors: Record<string, string> = {};

  const nameErr = isRequired(data.name, 'Tên sản phẩm');
  if (nameErr) errors.name = nameErr;
  else {
    const minErr = minLength(data.name!, 2, 'Tên sản phẩm');
    if (minErr) errors.name = minErr;
  }

  if (data.sku) {
    const skuErr = minLength(data.sku, 2, 'Mã SKU');
    if (skuErr) errors.sku = skuErr;
  }

  if (data.price !== undefined) {
    const priceErr = isPositiveNumber(data.price, false, 'Giá bán');
    if (priceErr) errors.price = priceErr;
  }

  if (data.compare_price !== undefined && data.compare_price !== '') {
    const compareErr = isPositiveNumber(data.compare_price, true, 'Giá niêm yết');
    if (compareErr) errors.compare_price = compareErr;
  }

  if (data.stock_quantity !== undefined && data.stock_quantity !== '') {
    const stockErr = isPositiveNumber(data.stock_quantity, true, 'Số lượng kho');
    if (stockErr) errors.stock_quantity = stockErr;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
