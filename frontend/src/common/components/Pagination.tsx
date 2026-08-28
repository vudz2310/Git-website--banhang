import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 ${className}`}
    >
      <div className="text-xs text-gray-500">
        Trang <span className="font-semibold text-gray-800">{currentPage}</span> / {totalPages}
        {totalItems !== undefined && (
          <span> (Tổng cộng <strong className="text-gray-800">{totalItems}</strong> mục)</span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
        >
          ← Trước
        </button>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
        >
          Sau →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
