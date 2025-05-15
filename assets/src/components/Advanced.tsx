import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import Card from './Card';
import { fetchRefunds, fetchCoupons } from '../utils/api';
import { formatCurrency, formatNumber } from '../utils/dateUtils';
import type { DateRange, Refund, Coupon } from '../utils/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AdvancedProps {
  dateRange: DateRange;
}

const Advanced: React.FC<AdvancedProps> = ({ dateRange }) => {
  // Fetch refunds data
  const { 
    data: refundsData, 
    isLoading: refundsLoading, 
    error: refundsError 
  } = useQuery(
    ['refunds', dateRange],
    () => fetchRefunds(dateRange),
    { keepPreviousData: true }
  );

  // Fetch coupons data
  const { 
    data: couponsData, 
    isLoading: couponsLoading, 
    error: couponsError 
  } = useQuery(
    ['coupons', dateRange],
    () => fetchCoupons(dateRange),
    { keepPreviousData: true }
  );

  const isLoading = refundsLoading || couponsLoading;
  const hasError = refundsError || couponsError;

  if (isLoading) {
    return <div className="text-center p-8">Loading advanced data...</div>;
  }

  if (hasError) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        Error loading advanced data. Please try again.
      </div>
    );
  }

  // Check if we have refunds data to display
  const hasRefundsToShow = refundsData && refundsData.refunds && refundsData.refunds.length > 0;

  // Prepare refunds chart data
  const refundsChartData = {
    labels: hasRefundsToShow ? refundsData.refunds.map((refund) => refund.date) : [],
    datasets: [
      {
        label: 'Refund Amount',
        data: hasRefundsToShow ? refundsData.refunds.map((refund) => refund.total) : [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const refundsChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Refunds Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card
          title="Total Refund Amount"
          value={formatCurrency(refundsData?.total_refund_amount || 0)}
          footer={`${refundsData?.refund_count || 0} refunds processed`}
        />
        <Card
          title="Top Used Coupon"
          value={couponsData && couponsData.length > 0 ? couponsData[0].code : 'No coupons used'}
          footer={couponsData && couponsData.length > 0
            ? `Used ${formatNumber(couponsData[0].usage_count)} times, discount of ${formatCurrency(couponsData[0].discount_amount)}`
            : 'No coupon data available for this period'
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Refunds Chart */}
        {hasRefundsToShow && (
          <div className="bg-white p-4 rounded-md shadow">
            <Line options={refundsChartOptions} data={refundsChartData} />
          </div>
        )}

        {/* Coupons Table */}
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-medium mb-4">Coupons Used</h3>
          {couponsData && couponsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coupon Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {couponsData.map((coupon: Coupon) => (
                    <tr key={coupon.code}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {coupon.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(coupon.usage_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(coupon.discount_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No coupons were used during this period.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Advanced; 