import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler,
} from 'chart.js';
import Card from './Card';
import { fetchStats, fetchRevenueTrend, fetchTopProducts, fetchBestSalesDays } from '../utils/api';
import { formatCurrency, formatNumber, getDateRangeLabel } from '../utils/dateUtils';
import type { DateRange, Product, SalesDay } from '../utils/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardProps {
  dateRange: DateRange;
}

const Dashboard: React.FC<DashboardProps> = ({ dateRange }) => {
  // Fetch overview stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery(
    ['stats', dateRange],
    () => fetchStats(dateRange),
    { keepPreviousData: true }
  );

  // Fetch revenue trend
  const { data: revenueTrend, isLoading: trendLoading, error: trendError } = useQuery(
    ['revenueTrend', dateRange],
    () => fetchRevenueTrend(dateRange),
    { keepPreviousData: true }
  );
  
  // Fetch top products for overview
  const { data: topProducts, isLoading: productsLoading } = useQuery(
    ['topProducts', dateRange],
    () => fetchTopProducts(dateRange, 5),
    { keepPreviousData: true }
  );
  
  // Fetch best sales days
  const { data: bestDays, isLoading: daysLoading } = useQuery(
    ['bestDays', dateRange],
    () => fetchBestSalesDays(dateRange, 5),
    { keepPreviousData: true }
  );

  // Debug log the data received from API
  useEffect(() => {
    console.log('Stats data:', stats);
    console.log('Revenue trend data:', revenueTrend);
    console.log('API base URL:', window.wooStatsx?.apiUrl || '/wp-json/woostatsx/v1');
  }, [stats, revenueTrend]);

  const isLoading = statsLoading || trendLoading || productsLoading || daysLoading;
  const hasError = statsError || trendError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-wp-primary border-r-gray-200 border-b-gray-200 border-l-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    // Show more detailed error information
    console.error('Stats error:', statsError);
    console.error('Trend error:', trendError);
    
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100">
        <h3 className="text-red-800 font-medium text-lg mb-2">Unable to Load Dashboard</h3>
        <p className="text-red-700 mb-4">There was an error loading the dashboard data. Please try again later.</p>
        <p className="text-xs mt-2 text-red-600">
          {statsError ? `Stats error: ${statsError}` : ''}
          {trendError ? `Trend error: ${trendError}` : ''}
        </p>
      </div>
    );
  }

  // Calculate additional metrics
  const aov = stats?.average_order_value || 0;
  const totalRevenue = stats?.total_sales || 0;
  const totalOrders = stats?.total_orders || 0;
  const dateRangeLabel = stats ? getDateRangeLabel(stats.date_range.from, stats.date_range.to) : '';
  
  // Calculate daily averages
  const daysDiff = stats?.date_range ? 
    Math.max(1, Math.round((new Date(stats.date_range.to).getTime() - new Date(stats.date_range.from).getTime()) / (1000 * 60 * 60 * 24))) : 
    1;
  const dailyAvgRevenue = totalRevenue / daysDiff;
  const dailyAvgOrders = totalOrders / daysDiff;
  
  // Extract most recent day's revenue for trend indication
  const latestRevenueDay = revenueTrend && revenueTrend.length > 0 ? 
    revenueTrend[revenueTrend.length - 1] : 
    { period: '', total: 0 };
  
  // Calculate revenue change percentage (vs daily average)
  const revenueChange = dailyAvgRevenue > 0 ? 
    ((latestRevenueDay.total - dailyAvgRevenue) / dailyAvgRevenue * 100) :
    0;
  
  // Prepare revenue trend chart data
  const chartData = {
    labels: revenueTrend?.map((item) => item.period) || [],
    datasets: [
      {
        label: 'Revenue',
        data: revenueTrend?.map((item) => item.total) || [],
        borderColor: '#2271b1',
        backgroundColor: 'rgba(34, 113, 177, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Revenue Trend',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Revenue: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue',
        },
        ticks: {
          callback: function(value) {
            if (typeof value === 'number') {
              return formatCurrency(value);
            }
            return value;
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        }
      }
    },
  };
  
  // Top Products Chart
  const topProductsChartData = {
    labels: topProducts?.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name) || [],
    datasets: [
      {
        label: 'Revenue',
        data: topProducts?.map(p => p.total) || [],
        backgroundColor: 'rgba(34, 113, 177, 0.7)',
      }
    ]
  };
  
  const topProductsChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Products by Revenue',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Revenue: ${formatCurrency(context.parsed.x)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          callback: function(value) {
            if (typeof value === 'number') {
              return formatCurrency(value);
            }
            return value;
          }
        }
      }
    }
  };

  return (
    <div>
      {/* KPI cards with trend indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          title="Total Sales"
          value={formatCurrency(totalRevenue)}
          footer={
            <div className="flex justify-between items-center">
              <span>{dateRangeLabel}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${revenueChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {revenueChange >= 0 ? '↑' : '↓'} {Math.abs(Math.round(revenueChange))}%
              </span>
            </div>
          }
          className="border-l-4 border-wp-primary"
        />
        <Card
          title="Total Orders"
          value={formatNumber(totalOrders)}
          footer={`${formatNumber(Math.round(dailyAvgOrders * 10) / 10)} orders per day`}
          className="border-l-4 border-yellow-500"
        />
        <Card
          title="Average Order Value"
          value={formatCurrency(aov)}
          footer={`Based on ${formatNumber(totalOrders)} orders`}
          className="border-l-4 border-purple-500"
        />
        <Card
          title="Daily Average Revenue"
          value={formatCurrency(dailyAvgRevenue)}
          footer={`Over ${daysDiff} days`}
          className="border-l-4 border-green-500"
        />
      </div>

      {/* Main charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Revenue Over Time</h3>
          <Line options={chartOptions} data={chartData} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Top Selling Products</h3>
          <Bar options={topProductsChartOptions} data={topProductsChartData} />
        </div>
      </div>
      
      {/* Additional data tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Best Performing Products</h3>
          {topProducts && topProducts.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.map((product, idx) => (
                    <tr key={product.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(product.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatNumber(product.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No product data available for this period.</p>
          )}
        </div>
        
        {/* Best Sales Days */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Best Sales Days</h3>
          {bestDays && bestDays.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bestDays.map((day, idx) => (
                    <tr key={day.date} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(day.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(day.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatNumber(day.order_count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No sales data available for this period.</p>
          )}
        </div>
      </div>
      
      {/* Summary section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium mb-2 text-gray-600">Revenue Insights</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Total revenue for this period: <span className="font-medium">{formatCurrency(totalRevenue)}</span></li>
              <li>Average daily revenue: <span className="font-medium">{formatCurrency(dailyAvgRevenue)}</span></li>
              <li>Average order value: <span className="font-medium">{formatCurrency(aov)}</span></li>
              {latestRevenueDay && latestRevenueDay.period && (
                <li>Most recent revenue ({latestRevenueDay.period}): <span className="font-medium">{formatCurrency(latestRevenueDay.total)}</span></li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-md font-medium mb-2 text-gray-600">Order Insights</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Total orders: <span className="font-medium">{formatNumber(totalOrders)}</span></li>
              <li>Daily order average: <span className="font-medium">{formatNumber(Math.round(dailyAvgOrders * 100) / 100)}</span></li>
              {bestDays && bestDays.length > 0 && (
                <li>Best day ({new Date(bestDays[0].date).toLocaleDateString()}): <span className="font-medium">{formatCurrency(bestDays[0].total)}</span> from <span className="font-medium">{bestDays[0].order_count}</span> orders</li>
              )}
              {topProducts && topProducts.length > 0 && (
                <li>Best product: <span className="font-medium">{topProducts[0].name}</span> generated <span className="font-medium">{formatCurrency(topProducts[0].total)}</span></li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Debug info in development */}
      <div className="mt-4 p-4 border border-gray-200 bg-gray-50 text-xs font-mono rounded">
        <p>Debug Info:</p>
        <p>Date Range: {JSON.stringify(dateRange)}</p>
        <p>API URL: {window.wooStatsx?.apiUrl || '/wp-json/woostatsx/v1'}</p>
        <p className="mt-2">Stats Response:</p>
        <pre className="overflow-auto max-h-40">{JSON.stringify(stats, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Dashboard; 