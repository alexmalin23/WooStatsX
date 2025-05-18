import React from 'react';
import { PulseLoader, ClipLoader, BarLoader } from 'react-spinners';
import { useTranslation } from '../hooks/useTranslation';

export type SpinnerType = 'pulse' | 'clip' | 'bar';
export type SpinnerSize = 'small' | 'medium' | 'large';

interface LoadingSpinnerProps {
  type?: SpinnerType;
  size?: SpinnerSize;
  color?: string;
  text?: string;
  fullScreen?: boolean;
  fullContainer?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  type = 'pulse',
  size = 'medium',
  color = '#2271b1', // WordPress primary blue
  text,
  fullScreen = false,
  fullContainer = false,
}) => {
  const { t } = useTranslation();
  
  // Size mappings for different spinner types
  const sizeMap = {
    pulse: {
      small: 5,
      medium: 10,
      large: 15,
    },
    clip: {
      small: 20,
      medium: 35,
      large: 50,
    },
    bar: {
      small: 50,
      medium: 100,
      large: 150,
    },
  };

  // Get the spinner component based on type
  const getSpinner = () => {
    switch (type) {
      case 'pulse':
        return <PulseLoader color={color} size={sizeMap.pulse[size]} />;
      case 'clip':
        return <ClipLoader color={color} size={sizeMap.clip[size]} />;
      case 'bar':
        return <BarLoader color={color} width={sizeMap.bar[size]} />;
      default:
        return <PulseLoader color={color} size={sizeMap.pulse[size]} />;
    }
  };

  // Default loading text if not provided
  const loadingText = text || t('common.loading');

  // Container class based on props
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : fullContainer
    ? 'flex flex-col items-center justify-center w-full h-full min-h-[200px]'
    : 'flex flex-col items-center justify-center p-6';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center">
        {getSpinner()}
        {loadingText && (
          <p className="mt-4 text-gray-600 animate-pulse">{loadingText}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 