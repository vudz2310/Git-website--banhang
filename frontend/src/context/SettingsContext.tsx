import React, { createContext, useContext, useEffect, useState } from 'react';
import { SettingService } from '../assets/api/settingService';
import type { SettingsData, GeneralSetting, FooterSetting, SocialSetting } from '../assets/api/settingService';

interface SettingsContextType {
  settings: SettingsData;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultGeneral: GeneralSetting = {
  site_name: 'Shop Điện thoại VIP',
  logo_url: '',
  contact_email: 'support@shopdienthoaivip.com',
  contact_phone: '0123 456 789',
  address: '123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội, Việt Nam',
  seo_title: 'Shop Điện thoại VIP - Điện thoại, laptop, phụ kiện chính hãng',
  seo_description: 'Cung cấp các sản phẩm công nghệ cao cấp chính hãng chất lượng với mức giá tốt nhất thị trường.'
};

const defaultFooter: FooterSetting = {
  about_us: 'Shop Điện thoại VIP tự hào là đơn vị cung cấp các thiết bị di động, máy tính bảng và phụ kiện chính hãng, uy tín hàng đầu Việt Nam.',
  columns: [
    {
      title: 'Giới thiệu',
      links: [
        { label: 'Về chúng tôi', url: '/about' },
        { label: 'Hệ thống cửa hàng', url: '/contact' },
        { label: 'Tuyển dụng', url: '/careers' }
      ]
    },
    {
      title: 'Chính sách',
      links: [
        { label: 'Chính sách bảo mật', url: '/privacy' },
        { label: 'Điều khoản dịch vụ', url: '/terms' },
        { label: 'Chính sách đổi trả', url: '/returns' },
        { label: 'Chính sách giao hàng', url: '/shipping' }
      ]
    },
    {
      title: 'Liên hệ & Hỗ trợ',
      links: [
        { label: 'Hướng dẫn mua hàng', url: '/how-to-buy' },
        { label: 'Phương thức thanh toán', url: '/payment-methods' },
        { label: 'Liên hệ trực tiếp', url: '/contact' }
      ]
    }
  ]
};

const defaultSocial: SocialSetting = {
  facebook: 'https://facebook.com/shopdienthoaivip',
  instagram: 'https://instagram.com/shopdienthoaivip',
  youtube: 'https://youtube.com/c/shopdienthoaivip',
  tiktok: 'https://tiktok.com/@shopdienthoaivip'
};

const defaultSettings: SettingsData = {
  general: defaultGeneral,
  footer: defaultFooter,
  social: defaultSocial
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {}
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await SettingService.getAll();
      if (res.success && res.data) {
        // Merge with defaults to ensure we don't have partial missing values
        const mergedSettings: SettingsData = {
          general: { ...defaultGeneral, ...(res.data.general || {}) },
          footer: { ...defaultFooter, ...(res.data.footer || {}) },
          social: { ...defaultSocial, ...(res.data.social || {}) }
        };
        setSettings(mergedSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
export default SettingsContext;
