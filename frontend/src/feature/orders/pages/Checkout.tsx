import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartService } from '../../cart';
import { AuthService } from '../../auth';
import { OrderService } from '../services/orderService';
import { PaymentService } from '../services/paymentService';
import { AddressService } from '../services/addressService';
import type { CheckoutForm, CartItemWithDetails, UserVoucher } from '../types';
import { useVietnamPlaces } from '../hooks/useVietnamPlaces';
import { findPlaceByName } from '../utils/addressHelpers';
import {
  CheckoutAddressForm,
  CheckoutPaymentMethod,
  CheckoutVoucherSection,
  CheckoutOrderSummary,
} from '../components';
import { LoadingSpinner } from '../../../common';
import { httpGet } from '../../../api/http';

declare global {
  interface Window {
    google: any;
  }
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);

  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    paymentMethod: 'cod',
    note: '',
  });

  const {
    provinces,
    districts,
    wards,
    provinceCode,
    districtCode,
    setProvinceCode,
    setDistrictCode,
    placesLoading,
    addressWarning,
  } = useVietnamPlaces(form, setForm);

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Google Places Autocomplete
  useEffect(() => {
    if (!addressInputRef.current || !window.google) return;
    const input = addressInputRef.current;

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'vn' },
      fields: ['address_components', 'formatted_address', 'place_id'],
      types: ['address'],
    });
    autocompleteRef.current = autocomplete;

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.place_id || !place.address_components) return;

      let streetNumber = '';
      let route = '';
      let ward = '';
      let district = '';
      let city = '';

      place.address_components.forEach((component: any) => {
        const types = component.types;
        if (types.includes('street_number')) streetNumber = component.long_name;
        if (types.includes('route')) route = component.long_name;
        if (types.includes('sublocality_level_1') || types.includes('ward'))
          ward = component.long_name;
        if (types.includes('administrative_area_level_2') || types.includes('district'))
          district = component.long_name;
        if (types.includes('administrative_area_level_1') || types.includes('province'))
          city = component.long_name;
      });

      const fullAddress = [streetNumber, route].filter(Boolean).join(' ') || place.formatted_address;

      setForm((prev) => ({
        ...prev,
        address: fullAddress,
        ward: prev.ward || ward,
        district: prev.district || district,
        city: prev.city || city,
      }));

      if (city && provinces.length > 0) {
        const match = findPlaceByName(provinces, city);
        if (match) setProvinceCode(match.code);
      }
      if (district && districts.length > 0) {
        const match = findPlaceByName(districts, district);
        if (match) setDistrictCode(match.code);
      }
    });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [provinces, districts, setProvinceCode, setDistrictCode]);

  // Load giỏ hàng và thông tin người dùng
  useEffect(() => {
    loadCart();

    const currentUser = AuthService.getUser();
    if (currentUser?.id) {
      setForm((prev) => ({
        ...prev,
        fullName: currentUser.full_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || prev.phone || '',
      }));
      loadUserVouchers();

      (async () => {
        try {
          const addr = await AddressService.getDefaultAddress(currentUser.id);
          if (!addr) return;
          setForm((prev) => ({
            ...prev,
            phone: prev.phone || addr.phone || currentUser.phone || '',
            address: prev.address || addr.line1 || '',
            ward: prev.ward || addr.ward || '',
            district: prev.district || addr.district || '',
            city: prev.city || addr.city || '',
          }));
        } catch (e) {
          console.log('Load default address failed:', e);
        }
      })();
    } else {
      createSampleVouchers();
    }
  }, []);

  const loadCart = async () => {
    try {
      const cart = await CartService.getCart();
      const items = cart?.items || [];
      const itemsWithDetails: CartItemWithDetails[] = items.map((item: any) => ({
        ...item,
        product_name: item.variant?.product?.name || item.name_snapshot,
        product_img: item.variant?.product?.thumbnail || item.variant?.image_url,
        color: item.variant?.color,
        size: item.variant?.size,
        variant_sku: item.variant?.sku,
      }));
      setCartItems(itemsWithDetails);
    } catch (e) {
      console.error('Load cart failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVouchers = async () => {
    try {
      setVoucherLoading(true);
      const res = await httpGet<{ success: boolean; data?: any[] }>('vouchers/available');
      if (res && res.data) {
        const available = res.data.map((v: any) => ({
          id: v.id || Math.random(),
          assigned_at: new Date().toISOString(),
          is_used: false,
          used_at: null,
          voucher: v,
        }));
        setUserVouchers(available.length > 0 ? available : getSampleVouchersList());
      } else {
        createSampleVouchers();
      }
    } catch {
      createSampleVouchers();
    } finally {
      setVoucherLoading(false);
    }
  };

  const getSampleVouchersList = (): UserVoucher[] => [
    {
      id: 1,
      assigned_at: new Date().toISOString(),
      is_used: false,
      used_at: null,
      voucher: {
        id: 1,
        code: 'SALE20',
        name: 'Giảm 20% Đơn từ 500k',
        description: 'Giảm 20% tối đa 200k',
        discount_type: 'percentage',
        discount_value: 20,
        min_order_amount: 500000,
        max_discount: 200000,
        valid_from: '2024-01-01T00:00:00',
        valid_until: '2026-12-31T23:59:59',
      },
    },
    {
      id: 2,
      assigned_at: new Date().toISOString(),
      is_used: false,
      used_at: null,
      voucher: {
        id: 2,
        code: 'FREESHIP',
        name: 'Miễn phí vận chuyển',
        description: 'Freeship cho đơn hàng từ 1 triệu',
        discount_type: 'fixed',
        discount_value: 30000,
        min_order_amount: 1000000,
        max_discount: 30000,
        valid_from: '2024-01-01T00:00:00',
        valid_until: '2026-12-31T23:59:59',
      },
    },
  ];

  const createSampleVouchers = () => {
    setUserVouchers(getSampleVouchersList());
  };

  const handleApplyVoucherByCode = () => {
    if (!voucherCode.trim()) return;
    const found = userVouchers.find(
      (uv) => uv.voucher?.code.toLowerCase() === voucherCode.trim().toLowerCase() && !uv.is_used
    );
    if (found) {
      setSelectedVoucher(found);
      setVoucherCode('');
    } else {
      alert('Mã giảm giá không tồn tại hoặc đã được sử dụng');
    }
  };

  // Tính toán đơn hàng
  const subtotal = CartService.calculateTotal(cartItems);

  const getVoucherDiscount = () => {
    if (!selectedVoucher?.voucher) return 0;
    const v = selectedVoucher.voucher;
    if (subtotal < (v.min_order_amount || 0)) return 0;
    if (v.discount_type === 'percentage') {
      const calc = (subtotal * v.discount_value) / 100;
      return v.max_discount > 0 ? Math.min(calc, v.max_discount) : calc;
    }
    return v.discount_value || 0;
  };

  const discount = getVoucherDiscount();
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const tax = Math.round(Math.max(0, subtotal - discount) * 0.1);
  const finalTotal = subtotal - discount + shippingFee + tax;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone || !form.address || !form.city || !form.district) {
      alert('Vui lòng điền đầy đủ các thông tin giao hàng bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      const currentUser = AuthService.getUser();
      const orderData = {
        user_id: currentUser?.id || null,
        shipping_address: {
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          district: form.district,
          ward: form.ward,
        },
        payment_method: form.paymentMethod,
        note: form.note,
        items: cartItems.map((item) => ({
          variant_id: item.variant_id,
          product_id: null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          name_snapshot: item.product_name || `Sản phẩm #${item.variant_id}`,
          sku_snapshot: item.variant_sku || `SKU-${item.variant_id}`,
        })),
        subtotal,
        discount,
        shipping_fee: shippingFee,
        tax,
        total: finalTotal,
      };

      const response = await OrderService.createOrder(orderData);
      if (response.success) {
        if (saveAddress && currentUser?.id) {
          try {
            await AddressService.saveDefaultAddress(currentUser.id, {
              full_name: form.fullName,
              phone: form.phone,
              line1: form.address,
              ward: form.ward || null,
              district: form.district || null,
              city: form.city || null,
            });
          } catch (err) {
            console.log('Save address error (ignored):', err);
          }
        }

        if (form.paymentMethod === 'momo') {
          const momo = await PaymentService.createMomoPayment(response.order.id);
          if (momo?.payUrl) {
            window.location.assign(momo.payUrl);
            return;
          }
        }

        alert(`Đặt hàng thành công! Mã đơn hàng: ${response.order.code || response.order.id}`);
        await CartService.clearCart();
        navigate('/profile');
      } else {
        throw new Error(response.message || 'Tạo đơn hàng thất bại');
      }
    } catch (err: any) {
      alert('Đặt hàng thất bại: ' + (err.message || 'Vui lòng kiểm tra lại kết nối'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner text="Đang chuẩn bị trang thanh toán..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề trang */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Thanh toán đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Vui lòng kiểm tra kỹ thông tin nhận hàng và phương thức thanh toán trước khi hoàn tất
          </p>
        </div>

        {/* Layout 2 cột: Trái thông tin, Phải tóm tắt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột trái (7 cột) */}
          <div className="lg:col-span-7 space-y-6">
            <CheckoutAddressForm
              form={form}
              onInputChange={handleInputChange}
              addressInputRef={addressInputRef}
              provinces={provinces}
              districts={districts}
              wards={wards}
              provinceCode={provinceCode}
              districtCode={districtCode}
              setProvinceCode={setProvinceCode}
              setDistrictCode={setDistrictCode}
              placesLoading={placesLoading}
              addressWarning={addressWarning}
              saveAddress={saveAddress}
              setSaveAddress={setSaveAddress}
            />

            <CheckoutPaymentMethod
              paymentMethod={form.paymentMethod}
              note={form.note}
              onInputChange={handleInputChange}
            />

            <CheckoutVoucherSection
              userVouchers={userVouchers}
              selectedVoucher={selectedVoucher}
              voucherCode={voucherCode}
              onVoucherCodeChange={setVoucherCode}
              onApplyVoucherByCode={handleApplyVoucherByCode}
              onSelectVoucher={setSelectedVoucher}
              onRemoveVoucher={() => setSelectedVoucher(null)}
              voucherLoading={voucherLoading}
              totalAmount={subtotal}
            />
          </div>

          {/* Cột phải (5 cột) - Tóm tắt đơn hàng & nút thanh toán */}
          <div className="lg:col-span-5">
            <CheckoutOrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              discount={discount}
              shippingFee={shippingFee}
              tax={tax}
              finalTotal={finalTotal}
              submitting={submitting}
              onFormSubmit={handleSubmitOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;