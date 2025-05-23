import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { fetchTopProducts } from '../utils/api';
import { formatCurrency, formatNumber } from '../utils/dateUtils';
import type { DateRange, Product } from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';
import LoadingSpinner from './LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProductsProps {
  dateRange: DateRange;
}

const Products: React.FC<ProductsProps> = ({ dateRange }) => {
  const { t, dir } = useTranslation();
  
  const { data, isLoading, error } = useQuery(
    ['products', dateRange],
    () => fetchTopProducts(dateRange, 10),
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

  // Prepare chart data
  const chartData = {
    labels: data?.map((product) => product.name) || [],
    datasets: [
      {
        label: t('products.revenue'),
        data: data?.map((product) => product.total) || [],
        backgroundColor: 'rgba(34, 113, 177, 0.7)',
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('products.topProducts'),
      },
    },
  };

  return (
    <div dir={dir}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-md shadow">
          <Bar options={chartOptions} data={chartData} />
        </div>

        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-medium mb-4">{t('products.topProducts')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.productName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.totalSold')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.revenue')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.map((product: Product) => (
                  <tr key={product.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(product.quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(product.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products; 