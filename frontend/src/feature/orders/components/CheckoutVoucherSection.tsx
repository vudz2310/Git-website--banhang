import React from 'react';
import type { UserVoucher } from '../types';
import { formatCurrency, VoucherIcon, XIcon, CheckIcon, WarningIcon, TargetIcon, RocketIcon } from '../../../common';

export interface CheckoutVoucherSectionProps {
  userVouchers: UserVoucher[];
  selectedVoucher: UserVoucher | null;
  voucherCode: string;
  onVoucherCodeChange: (code: string) => void;
  onApplyVoucherByCode: () => void;
  onSelectVoucher: (voucher: UserVoucher) => void;
  onRemoveVoucher: () => void;
  voucherLoading: boolean;
  totalAmount: number;
}

export const CheckoutVoucherSection: React.FC<CheckoutVoucherSectionProps> = ({
  userVouchers,
  selectedVoucher,
  voucherCode,
  onVoucherCodeChange,
  onApplyVoucherByCode,
  onSelectVoucher,
  onRemoveVoucher,
  voucherLoading,
  totalAmount,
}) => {
  const availableVouchers = userVouchers.filter((uv) => !uv.is_used);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <VoucherIcon className="mr-2 w-5 h-5 text-blue-600" />
          Mã giảm giá & Khuyến mãi
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          {availableVouchers.length} voucher khả dụng
        </span>
      </div>

      {/* Voucher đã chọn */}
      {selectedVoucher && selectedVoucher.voucher && (
        <div className="mb-5 p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-700 font-bold text-base">
                  {selectedVoucher.voucher.name}
                </span>
                <span className="text-xs px-2 py-0.5 bg-emerald-200 text-emerald-800 font-mono rounded font-semibold">
                  {selectedVoucher.voucher.code}
                </span>
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                {selectedVoucher.voucher.description || 'Ưu đãi dành riêng cho đơn hàng này'}
              </p>
              <p className="text-sm font-bold text-emerald-700 mt-2">
                Giảm: {selectedVoucher.voucher.discount_type === 'percentage'
                  ? `${selectedVoucher.voucher.discount_value}%`
                  : formatCurrency(selectedVoucher.voucher.discount_value)}
                {selectedVoucher.voucher.discount_type === 'percentage' &&
                  selectedVoucher.voucher.max_discount > 0 &&
                  ` (Tối đa: ${formatCurrency(selectedVoucher.voucher.max_discount)})`}
              </p>
            </div>
            <button
              type="button"
              onClick={onRemoveVoucher}
              className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 border border-red-200 bg-white rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center shadow-2xs"
            >
              <XIcon className="w-3.5 h-3.5 mr-1" />
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Nhập mã voucher */}
      <div className="mb-5">
        <div className="flex space-x-2">
          <input
            type="text"
            value={voucherCode}
            onChange={(e) => onVoucherCodeChange(e.target.value)}
            placeholder="Nhập mã voucher (VD: SALE20)"
            className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 uppercase"
          />
          <button
            type="button"
            onClick={onApplyVoucherByCode}
            disabled={!voucherCode.trim()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center shadow-sm"
          >
            <RocketIcon className="w-4 h-4 mr-1.5" />
            Áp dụng
          </button>
        </div>
      </div>

      {/* Danh sách voucher có sẵn */}
      {voucherLoading ? (
        <div className="text-center py-6 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
          Đang tải voucher...
        </div>
      ) : availableVouchers.length > 0 ? (
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {availableVouchers.map((uv) => {
            const v = uv.voucher;
            if (!v) return null;
            const isValid =
              new Date() >= new Date(v.valid_from) && new Date() <= new Date(v.valid_until);
            const canUse = totalAmount >= (v.min_order_amount || 0);
            const isSelected = selectedVoucher?.id === uv.id;

            return (
              <div
                key={uv.id}
                onClick={() => {
                  if (isValid && canUse) onSelectVoucher(uv);
                }}
                className={`p-3.5 border rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                } ${!isValid || !canUse ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 text-sm">{v.name}</span>
                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                      {v.code}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Đơn tối thiểu: {formatCurrency(v.min_order_amount || 0)}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {isValid && canUse ? (
                    isSelected ? (
                      <span className="text-xs font-semibold text-blue-600 flex items-center">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Đang dùng
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVoucher(uv);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center"
                      >
                        <TargetIcon className="w-3.5 h-3.5 mr-1" />
                        Dùng
                      </button>
                    )
                  ) : (
                    <span className="text-xs text-amber-600 flex items-center">
                      <WarningIcon className="w-3.5 h-3.5 mr-1" />
                      {!isValid ? 'Hết hạn' : 'Chưa đủ điều kiện'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-xs text-gray-400">
          Chưa có voucher khả dụng trong ví
        </div>
      )}
    </div>
  );
};
