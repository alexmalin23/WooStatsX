import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Dashboard from './components/Dashboard';
import Tabs from './components/Tabs';
import Products from './components/Products';
import Customers from './components/Customers';
import SalesDays from './components/SalesDays';
import Advanced from './components/Advanced';
import { formatDate } from './utils/dateUtils';
import { testApiConnection } from './utils/api';

type Tab = 'overview' | 'products' | 'customers' | 'sales-days' | 'advanced';

// Define time period options
type TimePeriod = 'today' | '7days' | '14days' | '30days' | '12months' | 'custom';

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'today', label: 'היום' },
  { value: '7days', label: '7 ימים' },
  { value: '14days', label: '14 ימים' },
  { value: '30days', label: '30 ימים' },
  { value: '12months', label: '12 חודשים' },
  { value: 'custom', label: 'מותאם אישית' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Get current date and ensure we're using the proper date
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: thirtyDaysAgo,
    endDate: today,
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30days');
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Check API connectivity on load
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const isConnected = await testApiConnection();
        setApiConnected(isConnected);
        console.log('API connection status:', isConnected);
        console.log('API base URL:', window.wooStatsx?.apiUrl);
        console.log('Date Range:', formatDate(dateRange.startDate), 'to', formatDate(dateRange.endDate));
        console.log('API nonce:', window.wooStatsx?.nonce ? 'Present' : 'Missing');
      } catch (error) {
        console.error('API connection check failed:', error);
        setApiConnected(false);
      }
    };
    
    checkApiConnection();
  }, []);

  // Update date range when period changes
  useEffect(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        // Set to start of today
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '14days':
        startDate.setDate(now.getDate() - 14);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '12months':
        startDate.setMonth(now.getMonth() - 12);
        break;
      case 'custom':
        // Don't change dates for custom selection
        return;
    }
    
    setDateRange({
      startDate,
      endDate: now,
    });
  }, [selectedPeriod]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleDateChange = (update: [Date | null, Date | null]) => {
    // Extract values and handle nulls properly
    const [start, end] = update;
    
    // Only update if we have both dates
    if (start && end) {
      console.log('New date range selected:', formatDate(start), 'to', formatDate(end));
      setDateRange({
        startDate: start,
        endDate: end,
      });
      // Set to custom period when user manually selects dates
      setSelectedPeriod('custom');
    } else if (start) {
      // If only start date is selected, update just that
      setDateRange(prev => ({
        ...prev,
        startDate: start,
      }));
    }
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  const apiParams = {
    from: formatDate(dateRange.startDate),
    to: formatDate(dateRange.endDate),
    all_time: false, // Changed from true to false to respect date filters
  };

  const refreshData = () => {
    // This will be handled by React Query's refetch functionality
    window.location.reload();
  };

  return (
    <div className="woostatsx-app p-4">
      {apiConnected === false && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">API Connection Error</p>
          <p>Could not connect to the WordPress REST API. Please check your server configuration.</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">WooStatsX Dashboard</h1>
        
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {TIME_PERIODS.map(period => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-wp-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            
            {selectedPeriod === 'custom' && (
              <div className="mt-2">
                <DatePicker
                  selectsRange={true}
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  onChange={handleDateChange}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  dateFormat="yyyy-MM-dd"
                  maxDate={today}
                  isClearable={false}
                />
              </div>
            )}
          </div>
          
          <button
            onClick={refreshData}
            className="bg-wp-primary hover:bg-wp-secondary text-white px-4 py-2 rounded text-sm"
          >
            Refresh Data
          </button>
        </div>
      </div>
      
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="mt-6">
        {activeTab === 'overview' && <Dashboard dateRange={apiParams} />}
        {activeTab === 'products' && <Products dateRange={apiParams} />}
        {activeTab === 'customers' && <Customers dateRange={apiParams} />}
        {activeTab === 'sales-days' && <SalesDays dateRange={apiParams} />}
        {activeTab === 'advanced' && <Advanced dateRange={apiParams} />}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Debug: {apiConnected === null ? 'Checking API...' : apiConnected ? 'API Connected' : 'API Connection Failed'}</p>
        <p>API URL: {window.wooStatsx?.apiUrl || '/wp-json/woostatsx/v1'}</p>
        <p>Date Range: {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}</p>
        <p>Selected Period: {selectedPeriod}</p>
      </div>
    </div>
  );
};

export default App; 