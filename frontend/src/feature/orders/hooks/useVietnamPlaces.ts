import { useState, useEffect } from 'react';
import type { PlaceOption, CheckoutForm } from '../types';
import { findPlaceByName } from '../utils/addressHelpers';
import { AddressService } from '../services/addressService';

export function useVietnamPlaces(
  form: CheckoutForm,
  setForm: React.Dispatch<React.SetStateAction<CheckoutForm>>
) {
  const [provinces, setProvinces] = useState<PlaceOption[]>([]);
  const [districts, setDistricts] = useState<PlaceOption[]>([]);
  const [wards, setWards] = useState<PlaceOption[]>([]);
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [addressWarning, setAddressWarning] = useState<string | null>(null);

  // Load danh sách Tỉnh/Thành phố
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setPlacesLoading(true);
        const res = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await res.json();
        const list: PlaceOption[] = Array.isArray(data)
          ? data
              .filter((x: any) => x && typeof x.code === 'number' && typeof x.name === 'string')
              .map((x: any) => ({ code: x.code, name: x.name }))
          : [];
        if (!cancelled) setProvinces(list);
      } catch (e) {
        console.log('Load provinces failed (ignore):', e);
      } finally {
        if (!cancelled) setPlacesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Tự động phát hiện và chuẩn hóa tỉnh thành, quận huyện đã sáp nhập
  useEffect(() => {
    if (!form.city && !form.district) {
      setAddressWarning(null);
      return;
    }

    const result = AddressService.gitAddress(form.city, form.district, form.ward, form.address);
    if (result.changed) {
      setForm((prev) => ({
        ...prev,
        city: result.city,
        district: result.district,
        ward: result.ward,
        address: result.address,
      }));
      setAddressWarning(result.notes || null);
    } else {
      const cleanCity = form.city
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      const cleanDist = form.district
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      const hasOldHata = cleanCity.includes('ha tay');
      const hasOldDist =
        cleanDist.includes('quan 2') ||
        cleanDist.includes('quan 9') ||
        (cleanDist.includes('thu duc') && !cleanDist.includes('thanh pho thu duc'));

      if (!hasOldHata && !hasOldDist) {
        setAddressWarning(null);
      }
    }
  }, [form.city, form.district, form.ward, form.address, setForm]);

  // Đồng bộ provinceCode theo form.city
  useEffect(() => {
    if (!provinces.length) return;
    if (!form.city) {
      setProvinceCode(null);
      return;
    }
    const match = findPlaceByName(provinces, form.city);
    if (match) {
      if (match.code !== provinceCode) {
        setProvinceCode(match.code);
        setDistrictCode(null);
        setDistricts([]);
        setWards([]);
      }
    } else {
      setProvinceCode(null);
    }
  }, [provinces, form.city, provinceCode]);

  // Load Quận/Huyện theo provinceCode
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!provinceCode) {
        setDistricts([]);
        setDistrictCode(null);
        setWards([]);
        return;
      }
      try {
        setPlacesLoading(true);
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await res.json();
        const list: PlaceOption[] = Array.isArray(data?.districts)
          ? data.districts
              .filter((x: any) => x && typeof x.code === 'number' && typeof x.name === 'string')
              .map((x: any) => ({ code: x.code, name: x.name }))
          : [];
        if (cancelled) return;
        setDistricts(list);
        setWards([]);

        const matchDistrict = findPlaceByName(list, form.district);
        if (matchDistrict) {
          setDistrictCode(matchDistrict.code);
        }
      } catch (e) {
        console.log('Load districts failed (ignore):', e);
      } finally {
        if (!cancelled) setPlacesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provinceCode, form.district]);

  // Load Phường/Xã theo districtCode
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!districtCode) {
        setWards([]);
        return;
      }
      try {
        setPlacesLoading(true);
        const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        const data = await res.json();
        const list: PlaceOption[] = Array.isArray(data?.wards)
          ? data.wards
              .filter((x: any) => x && typeof x.code === 'number' && typeof x.name === 'string')
              .map((x: any) => ({ code: x.code, name: x.name }))
          : [];
        if (cancelled) return;
        setWards(list);
      } catch (e) {
        console.log('Load wards failed (ignore):', e);
      } finally {
        if (!cancelled) setPlacesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [districtCode]);

  return {
    provinces,
    districts,
    wards,
    provinceCode,
    districtCode,
    setProvinceCode,
    setDistrictCode,
    placesLoading,
    addressWarning,
  };
}
