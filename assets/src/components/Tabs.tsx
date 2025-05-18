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
    { 
      id: 'overview', 
      label: t('dashboard.title'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ) 
    },
    { 
      id: 'products', 
      label: t('products.title'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ) 
    },
    { 
      id: 'customers', 
      label: t('customers.title'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) 
    },
    { 
      id: 'sales-days', 
      label: t('salesDays.title'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      id: 'advanced', 
      label: t('advanced.title'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ) 
    },
  ] as const;

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden" dir={dir}>
      <nav className="flex flex-wrap border-b border-secondary-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 py-4 px-6 font-medium text-sm transition-all duration-200
              ${
                activeTab === tab.id
                ? 'border-b-2 border-primary-600 text-primary-700 bg-primary-50'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className={`transition-colors duration-200 ${activeTab === tab.id ? 'text-primary-600' : 'text-secondary-400'}`}>
              {tab.icon}
            </span>
            <span className="relative">
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary-600 rounded-full"></span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
