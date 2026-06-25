import { httpGet, httpPost, httpPut, httpDelete } from './http';

export interface Banner {
  _id: string;
  title: string;
  image: string;
  redirectUrl: string;
  isActive: boolean;
  sort_order: number;
  created_at?: string;
}

export const BannerService = {
  async getActive(): Promise<{ success: boolean; data: Banner[] }> {
    return httpGet<{ success: boolean; data: Banner[] }>('banners');
  },

  async adminGetAll(): Promise<{ success: boolean; data: Banner[] }> {
    return httpGet<{ success: boolean; data: Banner[] }>('banners/admin');
  },

  async create(payload: Omit<Banner, '_id'>): Promise<{ success: boolean; data: Banner }> {
    return httpPost<{ success: boolean; data: Banner }>('banners', payload);
  },

  async update(id: string, payload: Partial<Banner>): Promise<{ success: boolean; data: Banner }> {
    return httpPut<{ success: boolean; data: Banner }>(`banners/${id}`, payload);
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return httpDelete<{ success: boolean; message: string }>(`banners/${id}`);
  }
};
