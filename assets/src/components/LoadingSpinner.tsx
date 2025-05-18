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
  color = '#0070c5', // Primary color from our new palette
  text,
  fullScreen = false,
  fullContainer = false,
}) => {
  const { t } = useTranslation();
  
  // Size mappings for different spinner types
  const sizeMap = {
    pulse: {
      small: 6,
      medium: 12,
      large: 18,
    },
    clip: {
      small: 24,
      medium: 40,
      large: 60,
    },
    bar: {
      small: 60,
      medium: 120,
      large: 180,
    },
  };

  // Get the spinner component based on type
  const getSpinner = () => {
    switch (type) {
      case 'pulse':
        return <PulseLoader color={color} size={sizeMap.pulse[size]} speedMultiplier={0.8} />;
      case 'clip':
        return <ClipLoader color={color} size={sizeMap.clip[size]} speedMultiplier={0.8} />;
      case 'bar':
        return <BarLoader color={color} width={sizeMap.bar[size]} height={4} speedMultiplier={0.8} />;
      default:
        return <PulseLoader color={color} size={sizeMap.pulse[size]} speedMultiplier={0.8} />;
    }
  };

  // Default loading text if not provided
  const loadingText = text || t('common.loading');

  // Container class based on props
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm z-50'
    : fullContainer
    ? 'flex flex-col items-center justify-center w-full h-full min-h-[200px]'
    : 'flex flex-col items-center justify-center p-6';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center bg-white bg-opacity-80 p-8 rounded-xl shadow-card">
        {getSpinner()}
        {loadingText && (
          <p className="mt-4 text-secondary-700 font-medium animate-pulse-slow">{loadingText}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
