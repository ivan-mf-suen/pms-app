'use client';

import { mockTenants, mockProperties } from '@/lib/mockData';

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toISOString().split('T')[0];
};

export default function TenantsPage() {
  const getPropertyAddress = (propertyId: string) => {
    return mockProperties.find((p) => p.id === propertyId)?.address || 'Unknown';
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Tenants</h1>
          <p className="text-gray-600 mt-1">Manage all your tenants and leases</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Property</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Monthly Rent</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Lease End</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{tenant.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getPropertyAddress(tenant.propertyId)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tenant.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tenant.phone}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    ${tenant.monthlyRent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(tenant.leaseEndDate)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[tenant.status]
                      }`}
                    >
                      {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
