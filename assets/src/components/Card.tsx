import React, { ReactNode } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import LoadingSpinner from './LoadingSpinner';

interface CardProps {
  title: string;
  value: ReactNode;
  footer?: ReactNode;
  className?: string;
  change?: number;
  isLoading?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  value, 
  footer, 
  className = '',
  change,
  isLoading = false
}) => {
  const { t, dir } = useTranslation();
  
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`} dir={dir}>
        <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
        <div className="h-12 flex items-center">
          <LoadingSpinner type="clip" size="small" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow p-6 transition-all hover:shadow-md ${className}`} dir={dir}>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="text-2xl font-bold text-gray-800 mb-2">{value}</div>
      
      {change !== undefined && (
        <div className="flex items-center mt-2 mb-1">
          <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              change >= 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {change >= 0 ? (
              <svg className="mr-1.5 h-2 w-2 text-green-600" fill="currentColor" viewBox="0 0 8 8">
                <path d="M4 0l4 4H6v4H2V4H0z" />
              </svg>
            ) : (
              <svg className="mr-1.5 h-2 w-2 text-red-600" fill="currentColor" viewBox="0 0 8 8">
                <path d="M4 8l-4-4h2V0h4v4h2z" />
              </svg>
            )}
            {Math.abs(Math.round(change))}%
          </span>
        </div>
      )}
      
      {footer && (
        <div className="text-xs text-gray-500 mt-2">{footer}</div>
      )}
    </div>
  );
};

export default Card; 