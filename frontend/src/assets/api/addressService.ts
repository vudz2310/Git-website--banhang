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
}


