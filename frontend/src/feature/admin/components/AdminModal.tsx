import React, { useEffect } from 'react';
import { XIcon } from '../../../components/Icons';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onSubmit?: (e: React.FormEvent) => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  submitDisabled?: boolean;
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  onSubmit,
  submitText = 'Lưu thay đổi',
  cancelText = 'Hủy bỏ',
  isLoading = false,
  submitDisabled = false,
  footer,
}) => {
  // Đóng modal khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Ngăn cuộn trang body khi modal đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
      {/* Header cố định */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Đóng"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Body cuộn độc lập chống tràn */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">{children}</div>

      {/* Footer cố định */}
      {footer !== undefined ? (
        footer
      ) : (
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-100 bg-gray-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          {onSubmit && (
            <button
              type="submit"
              disabled={isLoading || submitDisabled}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                submitText
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Container */}
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
        <div
          className={`w-full ${sizeClasses[size]} text-left transform transition-all my-8`}
          onClick={(e) => e.stopPropagation()}
        >
          {onSubmit ? <form onSubmit={onSubmit}>{content}</form> : content}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
