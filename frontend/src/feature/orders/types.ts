import type { CartItem } from '../../api/types';

export type PlaceOption = {
  code: number;
  name: string;
};

export interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | string;
  note: string;
}

export interface CartItemWithDetails extends CartItem {
  variant_sku?: string;
  color?: string;
  size?: string;
  variant_price?: number;
  product_name?: string;
  product_img?: string;
  product_img_alt?: string;
  product_img_title?: string;
}

export interface Voucher {
  id: number;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number;
  valid_from: string;
  valid_until: string;
}

export interface UserVoucher {
  id: number;
  assigned_at: string;
  is_used: boolean;
  used_at: string | null;
  voucher: Voucher;
}
