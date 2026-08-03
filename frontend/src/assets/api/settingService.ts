import { httpGet, httpPut } from './http';

export interface GeneralSetting {
  site_name: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  seo_title: string;
  seo_description: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterSetting {
  about_us: string;
  columns: FooterColumn[];
}

export interface SocialSetting {
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
}

export interface SettingsData {
  general: GeneralSetting;
  footer: FooterSetting;
  social: SocialSetting;
}

export const SettingService = {
  async getAll(): Promise<{ success: boolean; data: SettingsData }> {
    return httpGet<{ success: boolean; data: SettingsData }>('settings');
  },

  async updateByKey(key: keyof SettingsData, value: any): Promise<{ success: boolean; message: string; data: any }> {
    return httpPut<{ success: boolean; message: string; data: any }>(`settings/${key}`, { value });
  }
};
