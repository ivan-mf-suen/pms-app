'use client';

import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers, mockProperties, mockWorkOrders, mockInventory, mockNotifications } from '@/lib/mockData';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="text-5xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('accessDenied')}</h1>
            <p className="text-gray-600 mb-6">{t('accessDeniedMessage')}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rolePermissions = {
    admin: ['Dashboard', 'Properties', 'Inventory', 'Work Orders', 'Documents', 'Reports', 'Admin Panel'],
    manager: ['Dashboard', 'Properties', 'Inventory', 'Work Orders', 'Documents', 'Reports'],
    user: ['Dashboard', 'Properties', 'Tenants', 'Payments'],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('adminPanel')}</h1>
          <p className="text-gray-600 mt-1">System administration and configuration</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* System Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">{t('totalProperties')}</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{mockProperties.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Total Work Orders</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{mockWorkOrders.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">{t('totalAssets')}</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{mockInventory.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">{t('notifications')}</p>
            <p className="text-4xl font-bold text-orange-600 mt-2">
              {mockNotifications.filter((n) => !n.readStatus).length}
            </p>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('userList')}</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('email')}</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('userRole')}</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('lastLogin')}</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-800">{userItem.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          userItem.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : userItem.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Permissions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('permissions')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['admin', 'manager', 'user'] as const).map((role) => (
              <div key={role} className="border rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                  {role === 'admin'
                    ? t('roleAdmin')
                    : role === 'manager'
                    ? t('roleManager')
                    : t('roleUser')}
                </h3>
                <ul className="space-y-2">
                  {rolePermissions[role].map((permission, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <span className="text-green-600 mr-2">✓</span>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-bold text-blue-900 mb-2">System Information</h3>
          <p className="text-sm text-blue-800 mb-1">
            <strong>Implementation:</strong> Client-side only (no backend server)
          </p>
          <p className="text-sm text-blue-800 mb-1">
            <strong>Data Storage:</strong> Mock data + localStorage for sessions
          </p>
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This is a prototype/demo system. Production deployment requires backend
            authentication, database persistence, and security enhancements.
          </p>
        </div>
      </div>
    </div>
  );
}
