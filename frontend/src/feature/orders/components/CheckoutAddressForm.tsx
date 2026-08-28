import React from 'react';
import type { CheckoutForm, PlaceOption } from '../types';
import { findPlaceByName } from '../utils/addressHelpers';
import { AuthService } from '../../auth';
import { WarningIcon } from '../../../common';

export interface CheckoutAddressFormProps {
  form: CheckoutForm;
  onInputChange: (field: keyof CheckoutForm, value: string) => void;
  addressInputRef: React.RefObject<HTMLInputElement | null>;
  provinces: PlaceOption[];
  districts: PlaceOption[];
  wards: PlaceOption[];
  provinceCode: number | null;
  districtCode: number | null;
  setProvinceCode: (code: number | null) => void;
  setDistrictCode: (code: number | null) => void;
  placesLoading?: boolean;
  addressWarning: string | null;
  saveAddress: boolean;
  setSaveAddress: (save: boolean) => void;
}

export const CheckoutAddressForm: React.FC<CheckoutAddressFormProps> = ({
  form,
  onInputChange,
  addressInputRef,
  provinces,
  districts,
  wards,
  provinceCode,
  districtCode,
  setProvinceCode,
  setDistrictCode,
  placesLoading = false,
  addressWarning,
  saveAddress,
  setSaveAddress,
}) => {
  const handleCityChange = (value: string) => {
    onInputChange('city', value);
    const match = findPlaceByName(provinces, value);
    if (match) {
      setProvinceCode(match.code);
      if (form.district) onInputChange('district', '');
      if (form.ward) onInputChange('ward', '');
      setDistrictCode(null);
    }
  };

  const handleDistrictChange = (value: string) => {
    onInputChange('district', value);
    const match = findPlaceByName(districts, value);
    if (match) {
      setDistrictCode(match.code);
      if (form.ward) onInputChange('ward', '');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Thông tin giao hàng</h2>
        {placesLoading && (
          <span className="text-xs text-blue-600 animate-pulse">Đang tải địa danh...</span>
        )}
      </div>

      <div className="space-y-4">
        {/* Họ tên & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => onInputChange('fullName', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="example@gmail.com"
            />
          </div>
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            placeholder="0987654321"
          />
        </div>

        {/* Tỉnh/TP - Quận/Huyện - Phường/Xã */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tỉnh / TP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tỉnh / Thành phố <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              list="provinceList"
              value={form.city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="VD: Hà Nội"
            />
            <datalist id="provinceList">
              {provinces.map((p) => (
                <option key={p.code} value={p.name} />
              ))}
            </datalist>
          </div>

          {/* Quận / Huyện */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Quận / Huyện <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              list={provinceCode ? 'districtList' : undefined}
              value={form.district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={!provinceCode}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-gray-50 disabled:text-gray-400"
              placeholder={provinceCode ? 'Gõ để tìm quận/huyện' : 'Chọn Tỉnh/TP trước'}
            />
            {provinceCode && (
              <datalist id="districtList">
                {districts.map((d) => (
                  <option key={d.code} value={d.name} />
                ))}
              </datalist>
            )}
          </div>

          {/* Phường / Xã */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phường / Xã</label>
            <input
              type="text"
              list={districtCode ? 'wardList' : undefined}
              value={form.ward}
              onChange={(e) => onInputChange('ward', e.target.value)}
              disabled={!districtCode}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-gray-50 disabled:text-gray-400"
              placeholder={districtCode ? 'Gõ để tìm phường/xã' : 'Chọn Quận/Huyện trước'}
            />
            {districtCode && (
              <datalist id="wardList">
                {wards.map((w) => (
                  <option key={w.code} value={w.name} />
                ))}
              </datalist>
            )}
          </div>
        </div>

        {/* Địa chỉ chi tiết */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Địa chỉ số nhà, tên đường <span className="text-red-500">*</span>
          </label>
          <input
            ref={addressInputRef}
            type="text"
            required
            value={form.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            placeholder="Số nhà, tên đường..."
          />
        </div>

        {/* Cảnh báo đơn vị hành chính */}
        {addressWarning && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start space-x-2">
            <WarningIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Lưu ý hành chính mới:</strong> {addressWarning}
            </div>
          </div>
        )}

        {/* Lưu địa chỉ cho lần sau */}
        {AuthService.getUser()?.id && (
          <div className="flex items-center gap-2 pt-2">
            <input
              id="saveAddress"
              type="checkbox"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="saveAddress" className="text-xs sm:text-sm text-gray-700 cursor-pointer">
              Lưu thông tin địa chỉ này làm mặc định cho các đơn hàng sau
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
