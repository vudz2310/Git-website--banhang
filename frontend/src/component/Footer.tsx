import React from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import {
  FacebookIcon,
  LocationIcon,
  PhoneIcon,
  EmailIcon,
} from "../components/Icons";

const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Thông tin công ty */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              {settings.general.logo_url ? (
                <img
                  src={settings.general.logo_url}
                  alt={settings.general.site_name}
                  className="h-8 object-contain bg-white rounded px-1"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {settings.general.site_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold">
                {settings.general.site_name}
              </span>
            </div>
            <p className="text-gray-300 mb-6">{settings.footer.about_us}</p>
            {/* Mạng xã hội */}
            <div className="flex space-x-4">
              {settings.social.facebook && (
                <a
                  href={settings.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-600 transition-all duration-300"
                  title="Facebook"
                >
                  <FacebookIcon className="w-5 h-5" />
                </a>
              )}
              {settings.social.instagram && (
                <a
                  href={settings.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-pink-600 transition-all duration-300 font-bold text-xs"
                  title="Instagram"
                >
                  IG
                </a>
              )}
              {settings.social.youtube && (
                <a
                  href={settings.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-600 transition-all duration-300 font-bold text-xs"
                  title="YouTube"
                >
                  YT
                </a>
              )}
              {settings.social.tiktok && (
                <a
                  href={settings.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-black transition-all duration-300 font-bold text-xs"
                  title="TikTok"
                >
                  TK
                </a>
              )}
            </div>
          </div>

          {/* Các cột liên kết động */}
          {settings.footer.columns.map((column, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      to={link.url}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start">
                <LocationIcon className="w-5 h-5 mr-2 shrink-0 text-blue-500" />
                <span>{settings.general.address}</span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2 shrink-0 text-blue-500" />
                <span>{settings.general.contact_phone}</span>
              </li>
              <li className="flex items-center">
                <EmailIcon className="w-5 h-5 mr-2 shrink-0 text-blue-500" />
                <a
                  href={`mailto:${settings.general.contact_email}`}
                  className="hover:underline"
                >
                  {settings.general.contact_email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300 text-sm">
          {/* <p>&copy; {new Date().getFullYear()} {settings.general.site_name}. Tất cả quyền được bảo lưu.</p> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
