import React from 'react';

const SpinnerLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-[#5f35d2] rounded-full animate-spin`}></div>
    </div>
  );
};

export default SpinnerLoader; 