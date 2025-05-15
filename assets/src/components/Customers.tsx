import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTopCustomers } from '../utils/api';
import { formatCurrency, formatNumber } from '../utils/dateUtils';
import type { DateRange, Customer } from '../utils/api';

interface CustomersProps {
  dateRange: DateRange;
}

const Customers: React.FC<CustomersProps> = ({ dateRange }) => {
  const { data, isLoading, error } = useQuery(
    ['customers', dateRange],
    () => fetchTopCustomers(dateRange),
    { keepPreviousData: true }
  );

  if (isLoading) {
    return <div className="text-center p-8">Loading customers data...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        Error loading customers data. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md shadow">
      <h3 className="text-lg font-medium mb-4">Top Customers</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.map((customer: Customer) => (
              <tr key={customer.email}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {customer.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatNumber(customer.order_count)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(customer.total_spent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers; 