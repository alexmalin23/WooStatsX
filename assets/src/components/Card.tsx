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
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const Card: React.FC<CardProps> = ({ 
  title, 
  value, 
  footer, 
  className = '',
  change,
  isLoading = false,
  icon,
  variant = 'default'
}) => {
  const { t, dir } = useTranslation();
  
  // Define variant-specific styles
  const variantStyles = {
    default: 'border-l-4 border-secondary-300',
    primary: 'border-l-4 border-primary-500',
    success: 'border-l-4 border-success-500',
    warning: 'border-l-4 border-warning-500',
    danger: 'border-l-4 border-danger-500',
  };
  
  if (isLoading) {
    return (
      <div className={`woostatsx-card ${variantStyles[variant]} ${className}`} dir={dir}>
        <h3 className="text-sm font-medium text-secondary-600 mb-2 flex items-center gap-2">
          {icon && <span className="text-secondary-400">{icon}</span>}
          {title}
        </h3>
        <div className="h-12 flex items-center">
          <LoadingSpinner type="clip" size="small" />
        </div>
      </div>
    );
  }
  
  // Define change badge styles based on value
  const changeBadgeStyles = change !== undefined && change >= 0 
    ? 'badge badge-success' 
    : 'badge badge-danger';
  
  return (
    <div className={`woostatsx-card ${variantStyles[variant]} ${className}`} dir={dir}>
      <h3 className="text-sm font-medium text-secondary-600 mb-2 flex items-center gap-2">
        {icon && <span className="text-secondary-400">{icon}</span>}
        {title}
      </h3>
      
      <div className="text-3xl font-bold text-secondary-900 mb-3">{value}</div>
      
      {change !== undefined && (
        <div className="flex items-center mt-2 mb-2">
          <span className={changeBadgeStyles}>
            {change >= 0 ? (
              <svg className="mr-1.5 h-3 w-3 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="mr-1.5 h-3 w-3 text-danger-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {Math.abs(Math.round(change))}%
          </span>
        </div>
      )}
      
      {footer && (
        <div className="text-xs text-secondary-500 mt-auto pt-2">{footer}</div>
      )}
    </div>
  );
};

export default Card;
