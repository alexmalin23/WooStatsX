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
import { useTranslation } from '../hooks/useTranslation';

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
  const { t, dir } = useTranslation();
  
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
    return <div className="text-center p-8">{t('common.loading')}</div>;
  }

  if (hasError) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        {t('common.error')}
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
        label: t('advanced.refundAmount'),
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
        text: t('advanced.refundsOverTime'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div dir={dir}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card
          title={t('advanced.totalRefundAmount')}
          value={formatCurrency(refundsData?.total_refund_amount || 0)}
          footer={t('advanced.refundsProcessed', { count: refundsData?.refund_count || 0 })}
        />
        <Card
          title={t('advanced.topUsedCoupon')}
          value={couponsData && couponsData.length > 0 ? couponsData[0].code : t('advanced.noCouponsUsed')}
          footer={couponsData && couponsData.length > 0
            ? t('advanced.couponUsage', {
                count: couponsData[0].usage_count,
                amount: formatCurrency(couponsData[0].discount_amount)
              })
            : t('advanced.noCouponData')
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
          <h3 className="text-lg font-medium mb-4">{t('advanced.couponsUsed')}</h3>
          {couponsData && couponsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('advanced.couponCode')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('advanced.usageCount')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('advanced.discountAmount')}
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
            <p className="text-gray-500">{t('advanced.noCouponsInPeriod')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Advanced; 