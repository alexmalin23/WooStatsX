import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Tabs from './components/Tabs';
import Products from './components/Products';
import Customers from './components/Customers';
import SalesDays from './components/SalesDays';
import Advanced from './components/Advanced';
import DateRangePicker from './components/DateRangePicker';
import LoadingSpinner from './components/LoadingSpinner';
import { formatDate, getPresetDateRanges } from './utils/dateUtils';
import { testApiConnection } from './utils/api';
import { useTranslation } from './hooks/useTranslation';
import type { DateRange as ApiDateRange } from './utils/api';

type Tab = 'overview' | 'products' | 'customers' | 'sales-days' | 'advanced';

const App: React.FC = () => {
  const { t, dir } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Setup date range
  const [dateRange, setDateRange] = useState<ApiDateRange>(
    getPresetDateRanges().last30Days
  );

  // Check API connectivity on load
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        setIsLoading(true);
        const isConnected = await testApiConnection();
        setApiConnected(isConnected);
        console.log('API connection status:', isConnected);
        console.log('API base URL:', window.wooStatsx?.apiUrl);
        console.log('Date Range:', dateRange.from, 'to', dateRange.to);
      } catch (error) {
        console.error('API connection check failed:', error);
        setApiConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkApiConnection();
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleDateRangeChange = (newDateRange: ApiDateRange) => {
    setDateRange(newDateRange);
  };

  const refreshData = () => {
    // This will be handled by React Query's refetch functionality
    window.location.reload();
  };

  // Get date range presets with translations
  const dateRangePresets = [
    { label: t('common.today'), value: 'today', range: getPresetDateRanges().today },
    { label: t('common.yesterday'), value: 'yesterday', range: getPresetDateRanges().yesterday },
    { label: t('common.last7Days'), value: 'last7Days', range: getPresetDateRanges().last7Days },
    { label: t('common.last30Days'), value: 'last30Days', range: getPresetDateRanges().last30Days },
    { label: t('common.lastMonth'), value: 'lastMonth', range: getPresetDateRanges().lastMonth },
    { label: t('common.lastHalfYear'), value: 'lastHalfYear', range: getPresetDateRanges().lastHalfYear },
    { label: t('common.lastYear'), value: 'lastYear', range: getPresetDateRanges().lastYear },
  ];

  if (isLoading) {
    return <LoadingSpinner type="pulse" size="large" fullContainer />;
  }

  return (
    <div className="woostatsx-app p-8 w-full bg-secondary-50 rounded-xl shadow-card" dir={dir}>
      {apiConnected === false && (
        <div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 p-5 rounded-lg mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-danger-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-danger-800">{t('common.error')}</p>
              <p className="mt-1 text-danger-700">{t('common.error')}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-secondary-900">
          <span className="text-primary-600 font-extrabold">WooStatsX</span> {t('dashboard.title')}
        </h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            presets={dateRangePresets}
          />
          
          <button
            onClick={refreshData}
            className="btn btn-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('common.refresh') || 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-card">
        {activeTab === 'overview' && <Dashboard dateRange={dateRange} />}
        {activeTab === 'products' && <Products dateRange={dateRange} />}
        {activeTab === 'customers' && <Customers dateRange={dateRange} />}
        {activeTab === 'sales-days' && <SalesDays dateRange={dateRange} />}
        {activeTab === 'advanced' && <Advanced dateRange={dateRange} />}
      </div>
      
    </div>
  );
};

export default App;
