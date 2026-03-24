'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockInventory, mockProperties } from '@/lib/mockData';
import { exportToExcel, downloadCSV, generateCSV, ExportColumn } from '@/lib/exportUtils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [filterWarranty, setFilterWarranty] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Calculate warranty days remaining
  const getWarrantyDaysRemaining = (warrantyEnd: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const warranty = new Date(warrantyEnd);
    warranty.setHours(0, 0, 0, 0);
    const diffTime = warranty.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isWarrantyExpiring = (warrantyEnd: string): boolean => {
    const daysRemaining = getWarrantyDaysRemaining(warrantyEnd);
    return daysRemaining >= 0 && daysRemaining <= 90;
  };

  const isWarrantyExpired = (warrantyEnd: string): boolean => {
    return getWarrantyDaysRemaining(warrantyEnd) < 0;
  };

  // Filter inventory
  let filtered = mockInventory;

  if (filterProperty !== 'all') {
    filtered = filtered.filter((item) => item.propertyId === filterProperty);
  }

  if (filterType !== 'all') {
    filtered = filtered.filter((item) => item.type === filterType);
  }

  if (filterWarranty === 'expiring') {
    filtered = filtered.filter((item) => isWarrantyExpiring(item.warrantyEnd));
  } else if (filterWarranty === 'expired') {
    filtered = filtered.filter((item) => isWarrantyExpired(item.warrantyEnd));
  } else if (filterWarranty === 'active') {
    filtered = filtered.filter((item) => !isWarrantyExpired(item.warrantyEnd) && !isWarrantyExpiring(item.warrantyEnd));
  }

  // Export functions
  const handleExportExcel = async () => {
    const columns: ExportColumn[] = [
      { key: 'id', label: 'ID' },
      { key: 'brand', label: t('brand') },
      { key: 'model', label: t('model') },
      { key: 'hp', label: t('hp') },
      { key: 'type', label: t('inventoryType') },
      { key: 'location', label: t('location') },
      { key: 'propertyId', label: t('properties') },
      { key: 'installDate', label: t('installDate') },
      { key: 'warrantyEnd', label: t('warrantyEnd') },
      { key: 'status', label: t('status') },
    ];

    const exportData = filtered.map((item) => ({
      ...item,
      propertyId: mockProperties.find((p) => p.id === item.propertyId)?.address || item.propertyId,
    }));

    await exportToExcel(exportData, columns, `inventory_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportCSV = () => {
    const columns: ExportColumn[] = [
      { key: 'id', label: 'ID' },
      { key: 'brand', label: t('brand') },
      { key: 'model', label: t('model') },
      { key: 'hp', label: t('hp') },
      { key: 'type', label: t('inventoryType') },
      { key: 'location', label: t('location') },
      { key: 'propertyId', label: t('properties') },
      { key: 'installDate', label: t('installDate') },
      { key: 'warrantyEnd', label: t('warrantyEnd') },
      { key: 'status', label: t('status') },
    ];

    const exportData = filtered.map((item) => ({
      ...item,
      propertyId: mockProperties.find((p) => p.id === item.propertyId)?.address || item.propertyId,
    }));

    const csv = generateCSV(exportData, columns);
    downloadCSV(csv, `inventory_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('inventory')}</h1>
          <p className="text-gray-600 mt-1">Manage all inventory items and equipment</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Export */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t('properties')}
              </label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Properties</option>
                {mockProperties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t('inventoryType')}
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="hvac">{t('type_hvac')}</option>
                <option value="electrical">{t('type_electrical')}</option>
                <option value="plumbing">{t('type_plumbing')}</option>
                <option value="structural">{t('type_structural')}</option>
                <option value="appliance">{t('type_appliance')}</option>
                <option value="other">{t('type_other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Warranty Status
              </label>
              <select
                value={filterWarranty}
                onChange={(e) => setFilterWarranty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Items</option>
                <option value="active">Active Warranty</option>
                <option value="expiring">{t('warrantyExpiring')} (≤90 days)</option>
                <option value="expired">{t('warrantyExpired')}</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleExportExcel}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {t('exportToExcel')}
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {t('exportToCSV')}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Showing {filtered.length} of {mockInventory.length} items
          </p>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('brand')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('model')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('inventoryType')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('location')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Property</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('installDate')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('warrantyEnd')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No inventory items found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const property = mockProperties.find((p) => p.id === item.propertyId);
                    const daysRemaining = getWarrantyDaysRemaining(item.warrantyEnd);
                    const isExpired = isWarrantyExpired(item.warrantyEnd);
                    const isExpiring = isWarrantyExpiring(item.warrantyEnd);

                    return (
                      <tr
                        key={item.id}
                        onClick={() => router.push(`/inventory/${item.id}`)}
                        className="hover:bg-blue-50 cursor-pointer transition"
                      >
                        <td className="px-6 py-4 text-sm text-blue-600 hover:text-blue-800 font-semibold">{item.brand}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{item.model}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                            {item.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">{item.location}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{property?.address || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{item.installDate}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{item.warrantyEnd}</span>
                            {isExpired && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                                EXPIRED
                              </span>
                            )}
                            {isExpiring && !isExpired && (
                              <>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                                  {daysRemaining}d
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              item.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'inactive'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
