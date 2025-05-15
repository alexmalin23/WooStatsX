import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  value: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, value, footer, className = '' }) => {
  return (
    <div className={`woostatsx-card ${className}`}>
      <div className="woostatsx-card-header">{title}</div>
      <div className="woostatsx-card-value">{value}</div>
      {footer && <div className="woostatsx-card-footer">{footer}</div>}
    </div>
  );
};

export default Card; 