'use client';

import { mockPayments, mockTenants, mockProperties } from '@/lib/mockData';
import { useState } from 'react';

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toISOString().split('T')[0];
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState<string>('all');

  const getTenantName = (tenantId: string) => {
    return mockTenants.find((t) => t.id === tenantId)?.name || 'Unknown';
  };

  const getPropertyAddress = (propertyId: string) => {
    return mockProperties.find((p) => p.id === propertyId)?.address || 'Unknown';
  };

  const filtered =
    filter === 'all'
      ? mockPayments
      : mockPayments.filter((p) => p.status === filter);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };

  const totalCollected = mockPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = mockPayments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-600 mt-1">Track rental payments and payment history</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Total Collected</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              ${totalCollected.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-medium">Pending/Overdue</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              ${totalPending.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Total Records</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{mockPayments.length}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All ({mockPayments.length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded transition ${
                filter === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Paid ({mockPayments.filter((p) => p.status === 'paid').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded transition ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Pending ({mockPayments.filter((p) => p.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded transition ${
                filter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Overdue ({mockPayments.filter((p) => p.status === 'overdue').length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Paid Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {getTenantName(payment.tenantId)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getPropertyAddress(payment.propertyId)}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    ${payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(payment.dueDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment.paidDate ? formatDate(payment.paidDate) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[payment.status]
                      }`}
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
