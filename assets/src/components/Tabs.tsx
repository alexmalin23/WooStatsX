import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

type Tab = 'overview' | 'products' | 'customers' | 'sales-days' | 'advanced';

interface TabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  const { t, dir } = useTranslation();

  const tabs = [
    { id: 'overview', label: t('dashboard.title') },
    { id: 'products', label: t('products.title') },
    { id: 'customers', label: t('customers.title') },
    { id: 'sales-days', label: t('advanced.salesByDay') },
    { id: 'advanced', label: t('advanced.title') },
  ] as const;

  return (
    <div className="border-b border-gray-200" dir={dir}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === tab.id
                  ? 'woostatsx-tab-active border-wp-primary text-wp-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs; 