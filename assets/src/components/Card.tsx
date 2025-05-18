import React, { ReactNode } from 'react';
import { useTranslation } from '../hooks/useTranslation';

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
      <div className={`woostatsx-card ${className}`} dir={dir}>
        <div className="woostatsx-card-header">{title}</div>
        <div className="woostatsx-card-value">
          <div className="inline-block w-6 h-6 border-2 border-t-wp-primary border-r-gray-200 border-b-gray-200 border-l-gray-200 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`woostatsx-card ${className}`} dir={dir}>
      <div className="woostatsx-card-header">{title}</div>
      <div className="woostatsx-card-value">{value}</div>
      {change !== undefined && (
        <div className="woostatsx-card-footer">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(Math.round(change))}%
          </span>
        </div>
      )}
      {footer && <div className="woostatsx-card-footer">{footer}</div>}
    </div>
  );
};

export default Card; 