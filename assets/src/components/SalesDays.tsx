import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBestSalesDays } from '../utils/api';
import { formatCurrency, formatNumber } from '../utils/dateUtils';
import type { DateRange, SalesDay } from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';
import LoadingSpinner from './LoadingSpinner';

interface SalesDaysProps {
  dateRange: DateRange;
}

const SalesDays: React.FC<SalesDaysProps> = ({ dateRange }) => {
  const { t, dir } = useTranslation();
  
  const { data, isLoading, error } = useQuery(
    ['salesDays', dateRange],
    () => fetchBestSalesDays(dateRange, 20),
    { keepPreviousData: true }
  );

  if (isLoading) {
    return <LoadingSpinner type="pulse" size="medium" fullContainer />;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        {t('common.error')}
      </div>
    );
  }

  // Get the highest sale value for color scaling
  const maxSale = data?.reduce((max, day) => Math.max(max, day.total), 0) || 0;

  // Helper to generate a color gradient from pale green to deep green based on sales amount
  const getHeatmapColor = (value: number) => {
    const percentage = maxSale > 0 ? value / maxSale : 0;
    return `rgba(34, 197, 94, ${Math.max(0.1, percentage)})`;
  };

  return (
    <div className="bg-white p-4 rounded-md shadow" dir={dir}>
      <h3 className="text-lg font-medium mb-4">{t('salesDays.title')}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('salesDays.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('salesDays.orders')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('salesDays.revenue')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.map((day: SalesDay) => (
                <tr key={day.date}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(day.order_count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(day.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div>
          <h4 className="text-md font-medium mb-2">{t('salesDays.heatmap')}</h4>
          <div className="grid grid-cols-7 gap-2">
            {/* Day labels */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-xs text-gray-500 text-center">
                {t(`salesDays.days.${day.toLowerCase()}`)}
              </div>
            ))}
            
            {/* Generate a placeholder grid for days */}
            {data?.map((day: SalesDay) => {
              const date = new Date(day.date);
              const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
              
              return (
                <div
                  key={day.date}
                  className="h-12 rounded flex items-center justify-center text-xs shadow-sm"
                  style={{
                    backgroundColor: getHeatmapColor(day.total),
                    gridColumnStart: dayOfWeek + 1,
                  }}
                  title={`${date.toLocaleDateString()}: ${formatCurrency(day.total)}`}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDays; 