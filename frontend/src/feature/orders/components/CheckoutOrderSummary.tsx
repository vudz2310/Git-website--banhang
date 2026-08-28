import React from 'react';
import type { CartItemWithDetails } from '../types';
import { formatCurrency, BoxIcon, ShoppingCartIcon } from '../../../common';

export interface CheckoutOrderSummaryProps {
  cartItems: CartItemWithDetails[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  finalTotal: number;
  submitting: boolean;
  onFormSubmit: (e: React.FormEvent) => void;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  cartItems,
  subtotal,
  discount,
  shippingFee,
  tax,
  finalTotal,
  submitting,
  onFormSubmit,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center">
        <ShoppingCartIcon className="w-5 h-5 mr-2 text-blue-600" />
        Đơn hàng ({cartItems.length} sản phẩm)
      </h2>

      {/* Danh sách sản phẩm rút gọn */}
      <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 text-sm">
            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {item.product_img ? (
                <img
                  src={`http://localhost:3000${item.product_img}`}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BoxIcon className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {item.product_name || `Sản phẩm #${item.variant_id}`}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                SL: {item.quantity} {item.color ? `· ${item.color}` : ''}{' '}
                {item.size ? `· Size ${item.size}` : ''}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-gray-900 text-sm">
                {formatCurrency(item.unit_price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bảng chi tiết tính tiền */}
      <div className="space-y-3 pt-4 border-t border-gray-100 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Giảm giá Voucher</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Phí vận chuyển</span>
          <span className="font-semibold text-gray-800">
            {shippingFee === 0 ? (
              <span className="text-emerald-600 uppercase font-bold text-xs">Miễn phí</span>
            ) : (
              formatCurrency(shippingFee)
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Thuế VAT (10%)</span>
          <span className="font-semibold text-gray-800">{formatCurrency(tax)}</span>
        </div>

        <div className="flex justify-between items-baseline pt-4 border-t border-gray-100">
          <div>
            <span className="text-base font-bold text-gray-900 block">Tổng thanh toán</span>
            <span className="text-[11px] text-gray-400 font-normal">Đã bao gồm VAT & Ship</span>
          </div>
          <span className="text-2xl font-black text-rose-600">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      {/* Nút Đặt Hàng */}
      <button
        type="button"
        onClick={onFormSubmit}
        disabled={submitting || cartItems.length === 0}
        className="w-full mt-6 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base"
      >
        {submitting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Đang xử lý đơn hàng...
          </>
        ) : (
          'Xác nhận đặt hàng'
        )}
      </button>

      <p className="text-[11px] text-center text-gray-400 mt-3">
        Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng của chúng tôi
      </p>
    </div>
  );
};
