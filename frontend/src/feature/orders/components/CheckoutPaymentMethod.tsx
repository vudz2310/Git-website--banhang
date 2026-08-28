import React from 'react';
import type { CheckoutForm } from '../types';
import { CreditCardIcon, MoneyIcon } from '../../../common';

export interface CheckoutPaymentMethodProps {
  paymentMethod: string;
  note: string;
  onInputChange: (field: keyof CheckoutForm, value: string) => void;
}

export const CheckoutPaymentMethod: React.FC<CheckoutPaymentMethodProps> = ({
  paymentMethod,
  note,
  onInputChange,
}) => {
  const methods = [
    {
      id: 'cod',
      title: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi shipper giao hàng tận nơi',
      icon: <MoneyIcon className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'bank_transfer',
      title: 'Chuyển khoản Ngân hàng (QR Code)',
      description: 'Chuyển tiền nhanh 24/7 qua mã QR tài khoản ngân hàng',
      icon: <CreditCardIcon className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'momo',
      title: 'Ví Điện Tử MoMo',
      description: 'Thanh toán trực tuyến bảo mật qua cổng MoMo QR/App',
      icon: <span className="font-bold text-pink-600 text-sm">MoMo</span>,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
        Phương thức thanh toán
      </h2>

      <div className="space-y-3">
        {methods.map((m) => {
          const isSelected = paymentMethod === m.id;
          return (
            <label
              key={m.id}
              className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={m.id}
                checked={isSelected}
                onChange={(e) => onInputChange('paymentMethod', e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="ml-3.5 flex items-center justify-between flex-1">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                </div>
                <div className="ml-3 flex-shrink-0">{m.icon}</div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Ghi chú đơn hàng */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Ghi chú đơn hàng (Tùy chọn)
        </label>
        <textarea
          value={note}
          onChange={(e) => onInputChange('note', e.target.value)}
          rows={3}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
        />
      </div>
    </div>
  );
};
