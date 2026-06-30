import React, { useEffect, useState } from 'react';
import { SettingService } from '../../assets/api/settingService';
import type { GeneralSetting, FooterSetting, SocialSetting } from '../../assets/api/settingService';
import { useSettings } from '../../context/SettingsContext';
import AdminBanners from './AdminBanners';

const AdminSettings: React.FC = () => {
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'footer' | 'banners'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [general, setGeneral] = useState<GeneralSetting>({
    site_name: '',
    logo_url: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    seo_title: '',
    seo_description: ''
  });

  const [social, setSocial] = useState<SocialSetting>({
    facebook: '',
    instagram: '',
    youtube: '',
    tiktok: ''
  });

  const [footerAbout, setFooterAbout] = useState('');
  const [footerColumnsJSON, setFooterColumnsJSON] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await SettingService.getAll();
        if (res.success && res.data) {
          if (res.data.general) setGeneral(res.data.general);
          if (res.data.social) setSocial(res.data.social);
          if (res.data.footer) {
            setFooterAbout(res.data.footer.about_us || '');
            setFooterColumnsJSON(JSON.stringify(res.data.footer.columns || [], null, 2));
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setMessage({ type: 'error', text: 'Không thể tải cấu hình từ server' });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await SettingService.updateByKey('general', general);
      await refreshSettings();
      setMessage({ type: 'success', text: 'Cập nhật cấu hình chung thành công!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Cập nhật thất bại. Vui lòng kiểm tra lại.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await SettingService.updateByKey('social', social);
      await refreshSettings();
      setMessage({ type: 'success', text: 'Cập nhật mạng xã hội thành công!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Cập nhật thất bại. Vui lòng kiểm tra lại.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      // Validate and parse columns JSON
      let parsedColumns;
      try {
        parsedColumns = JSON.parse(footerColumnsJSON);
        if (!Array.isArray(parsedColumns)) {
          throw new Error('Footer columns must be a JSON array');
        }
      } catch (jsonErr: any) {
        setMessage({ type: 'error', text: `Sai định dạng JSON ở cột liên kết: ${jsonErr.message}` });
        setSaving(false);
        return;
      }

      const footerPayload: FooterSetting = {
        about_us: footerAbout,
        columns: parsedColumns
      };

      await SettingService.updateByKey('footer', footerPayload);
      await refreshSettings();
      setMessage({ type: 'success', text: 'Cập nhật chân trang thành công!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Cập nhật thất bại. Vui lòng kiểm tra lại.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải cấu hình...</span>
      </div>
    );
  }

  return (
    <div className={`${activeTab === 'banners' ? 'max-w-6xl' : 'max-w-4xl'} mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300`}>
      {/* Title */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Cấu hình Website</h2>
        <p className="text-sm text-gray-500">Quản lý các thông tin hiển thị chung, chân trang và mạng xã hội.</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-gray-200 bg-gray-50/50">
        <button
          onClick={() => { setActiveTab('general'); setMessage(null); }}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'general'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Cấu hình chung
        </button>
        <button
          onClick={() => { setActiveTab('social'); setMessage(null); }}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'social'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Mạng xã hội
        </button>
        <button
          onClick={() => { setActiveTab('footer'); setMessage(null); }}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'footer'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Chân trang (Footer)
        </button>
        <button
          onClick={() => { setActiveTab('banners'); setMessage(null); }}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'banners'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Quản lý Banners
        </button>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`mx-6 mt-6 p-4 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form content */}
      <div className="p-6">
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tên cửa hàng / Website</label>
                <input
                  type="text"
                  required
                  value={general.site_name}
                  onChange={(e) => setGeneral({ ...general, site_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ví dụ: Shop Điện thoại VIP"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Logo URL</label>
                <input
                  type="text"
                  value={general.logo_url}
                  onChange={(e) => setGeneral({ ...general, logo_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ví dụ: /assets/logo.png hoặc https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  required
                  value={general.contact_phone}
                  onChange={(e) => setGeneral({ ...general, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ví dụ: 0123 456 789"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email liên hệ</label>
                <input
                  type="email"
                  required
                  value={general.contact_email}
                  onChange={(e) => setGeneral({ ...general, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ví dụ: support@site.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Địa chỉ văn phòng / Cửa hàng</label>
              <input
                type="text"
                required
                value={general.address}
                onChange={(e) => setGeneral({ ...general, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ví dụ: 123 Đường ABC, Quận XYZ, Hà Nội"
              />
            </div>
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">SEO Meta Tags</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">SEO Title (Tiêu đề trình duyệt)</label>
                  <input
                    type="text"
                    value={general.seo_title}
                    onChange={(e) => setGeneral({ ...general, seo_title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Mặc định sẽ lấy Tên website nếu để trống"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">SEO Description (Mô tả tìm kiếm)</label>
                  <textarea
                    value={general.seo_description}
                    onChange={(e) => setGeneral({ ...general, seo_description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nhập mô tả ngắn gọn về website của bạn..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-all disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'social' && (
          <form onSubmit={handleSaveSocial} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={social.facebook}
                  onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={social.instagram}
                  onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">YouTube Channel URL</label>
                <input
                  type="url"
                  value={social.youtube}
                  onChange={(e) => setSocial({ ...social, youtube: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">TikTok Profile URL</label>
                <input
                  type="url"
                  value={social.tiktok}
                  onChange={(e) => setSocial({ ...social, tiktok: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-all disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'footer' && (
          <form onSubmit={handleSaveFooter} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Về chúng tôi (About Us ở chân trang)</label>
              <textarea
                required
                value={footerAbout}
                onChange={(e) => setFooterAbout(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Lời giới thiệu ngắn gọn ở góc chân trang..."
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase">Cấu hình các cột liên kết (Định dạng JSON)</label>
                <span className="text-[11px] text-gray-400 font-mono">Phải là một mảng JSON</span>
              </div>
              <textarea
                required
                value={footerColumnsJSON}
                onChange={(e) => setFooterColumnsJSON(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
                placeholder="[ ... ]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Gợi ý cấu trúc: <code>[{"{"} "title": "Giới thiệu", "links": [{"{"} "label": "Về chúng tôi", "url": "/about" {"}"}] {"}"}]</code>
              </p>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-all disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu chân trang'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'banners' && (
          <div className="p-2">
            <AdminBanners />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
