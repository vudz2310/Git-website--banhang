import { httpGet, httpPost } from './http';
import type { ID } from './types';

export type Address = {
  id: ID;
  user_id: ID;
  full_name: string;
  phone: string;
  line1: string;
  ward?: string | null;
  district?: string | null;
  city?: string | null;
  is_default: number | boolean;
  created_at?: string;
};

export interface NormalizedAddress {
  city: string;
  district: string;
  ward: string;
  address: string;
  changed: boolean;
  notes?: string;
}

export class AddressService {
  static async getDefaultAddress(userId: ID): Promise<Address | null> {
    const resp = await httpGet<{ data: Address | null }>(`users/${userId}/address-default`);
    return resp?.data || null;
  }

  static async saveDefaultAddress(
    userId: ID,
    payload: Pick<Address, 'full_name' | 'phone' | 'line1' | 'ward' | 'district' | 'city'>
  ): Promise<{ success: boolean; id: ID }> {
    return httpPost<{ success: boolean; id: ID }>(`users/${userId}/address-default`, payload);
  }

  // Chuẩn hóa địa chỉ đã sát nhập (Ví dụ: Hà Tây -> Hà Nội; Quận 2/Quận 9/Thủ Đức -> TP Thủ Đức)
  static gitAddress(city: string, district: string, ward: string, address: string): NormalizedAddress {
    let newCity = city.trim();
    let newDistrict = district.trim();
    let newWard = ward.trim();
    let newAddress = address.trim();
    let changed = false;
    let notes: string[] = [];

    // 1. Xử lý Hà Tây -> Hà Nội
    const cleanCity = newCity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (cleanCity.includes('ha tay') || cleanCity === 'ha tay') {
      newCity = 'Thành phố Hà Nội';
      changed = true;
      notes.push('Tỉnh Hà Tây đã sáp nhập vào Thành phố Hà Nội.');
    }

    // 2. Xử lý Quận 2, Quận 9, Quận Thủ Đức -> Thành phố Thủ Đức (TP Hồ Chí Minh)
    const cleanDist = newDistrict.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isHCMC = newCity.toLowerCase().includes('ho chi minh') || newCity.toLowerCase().includes('hcm') || newCity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('ho chi minh');
    
    if (isHCMC || cleanDist.includes('quan 2') || cleanDist.includes('quan 9') || cleanDist.includes('thu duc')) {
      if (cleanDist === 'quan 2' || cleanDist === 'district 2' || cleanDist.includes('quan 2')) {
        newDistrict = 'Thành phố Thủ Đức';
        newCity = 'Thành phố Hồ Chí Minh';
        changed = true;
        notes.push('Quận 2 đã sáp nhập vào Thành phố Thủ Đức.');
      } else if (cleanDist === 'quan 9' || cleanDist === 'district 9' || cleanDist.includes('quan 9')) {
        newDistrict = 'Thành phố Thủ Đức';
        newCity = 'Thành phố Hồ Chí Minh';
        changed = true;
        notes.push('Quận 9 đã sáp nhập vào Thành phố Thủ Đức.');
      } else if (cleanDist === 'quan thu duc' || cleanDist === 'thu duc' || (cleanDist.includes('thu duc') && !cleanDist.includes('thanh pho thu duc'))) {
        newDistrict = 'Thành phố Thủ Đức';
        newCity = 'Thành phố Hồ Chí Minh';
        changed = true;
        notes.push('Quận Thủ Đức đã sáp nhập vào Thành phố Thủ Đức.');
      }
    }

    return {
      city: newCity,
      district: newDistrict,
      ward: newWard,
      address: newAddress,
      changed,
      notes: notes.join(' ')
    };
  }
}



