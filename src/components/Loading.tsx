import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({ fullScreen = false, size = 'md' }) => {
  const spinnerSize = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  }[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${spinnerSize} border-amber-600 border-t-transparent rounded-full animate-spin`}
      />
      <p className="text-amber-800 font-medium animate-pulse text-sm">Đang tải dữ liệu...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex justify-center w-full">{content}</div>;
};

export default Loading;
