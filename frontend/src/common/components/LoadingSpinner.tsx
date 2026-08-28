import React from 'react';

export interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-2',
  lg: 'h-14 w-14 border-3',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Đang tải...',
  size = 'md',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div
        className={`animate-spin rounded-full border-b-transparent border-blue-600 ${sizeClasses[size]}`}
      />
      {text && <p className="mt-3 text-xs sm:text-sm font-medium text-gray-500">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-xs flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
