'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockInventory, mockProperties } from '@/lib/mockData';
import { exportToExcel, downloadCSV, generateCSV, ExportColumn } from '@/lib/exportUtils';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InventoryCard from '@/components/InventoryCard';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export default function InventoryPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [filterWarranty, setFilterWarranty] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'brand',
    direction: 'asc',
  });

  // Load view mode and set warranty filter from query params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('inventoryViewMode') as 'grid' | 'list' | null;
      if (savedViewMode) {
        setViewMode(savedViewMode);
      }
    }

    const warrantyParam = searchParams.get('warranty');
    if (warrantyParam === 'expired') {
      setFilterWarranty('expired');
    }
  }, [searchParams]);

  // Save view mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventoryViewMode', viewMode);
    }
  }, [viewMode]);

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
    filtered = filtered.filter((item) =>
      item.locations.some((loc) => loc.propertyId === filterProperty)
    );
  }

  if (filterType !== 'all') {
    filtered = filtered.filter((item) => item.type === filterType);
  }

  if (filterWarranty === 'expiring') {
    filtered = filtered.filter((item) =>
      item.locations.some((loc) => isWarrantyExpiring(loc.warrantyEnd))
    );
  } else if (filterWarranty === 'expired') {
    filtered = filtered.filter((item) =>
      item.locations.some((loc) => isWarrantyExpired(loc.warrantyEnd))
    );
  } else if (filterWarranty === 'active') {
    filtered = filtered.filter((item) =>
      item.locations.some(
        (loc) => !isWarrantyExpired(loc.warrantyEnd) && !isWarrantyExpiring(loc.warrantyEnd)
      )
    );
  }

  // Sort function
  const sortedFiltered = [...filtered].sort((a, b) => {
    const { column, direction } = sortConfig;
    let aValue: any = '';
    let bValue: any = '';

    if (column === 'brand') {
      aValue = a.brand;
      bValue = b.brand;
    } else if (column === 'model') {
      aValue = a.model;
      bValue = b.model;
    } else if (column === 'type') {
      aValue = a.type;
      bValue = b.type;
    } else if (column === 'location') {
      aValue = a.locations[0]?.address || '';
      bValue = b.locations[0]?.address || '';
    } else if (column === 'quantity') {
      aValue = a.locations.reduce((sum, loc) => sum + loc.quantity, 0);
      bValue = b.locations.reduce((sum, loc) => sum + loc.quantity, 0);
    } else if (column === 'installDate') {
      aValue = new Date(a.locations[0]?.installDate || '');
      bValue = new Date(b.locations[0]?.installDate || '');
    } else if (column === 'warrantyEnd') {
      aValue = new Date(a.locations[0]?.warrantyEnd || '');
      bValue = new Date(b.locations[0]?.warrantyEnd || '');
    } else if (column === 'status') {
      const statusOrder = { active: 0, expiring: 1, expired: 2, inactive: 3 };
      const aStatus = a.locations[0]?.status === 'active' && !isWarrantyExpired(a.locations[0]?.warrantyEnd) ? 'active' : 
                      isWarrantyExpired(a.locations[0]?.warrantyEnd) ? 'expired' :
                      isWarrantyExpiring(a.locations[0]?.warrantyEnd) ? 'expiring' : 'inactive';
      const bStatus = b.locations[0]?.status === 'active' && !isWarrantyExpired(b.locations[0]?.warrantyEnd) ? 'active' :
                      isWarrantyExpired(b.locations[0]?.warrantyEnd) ? 'expired' :
                      isWarrantyExpiring(b.locations[0]?.warrantyEnd) ? 'expiring' : 'inactive';
      aValue = statusOrder[aStatus as keyof typeof statusOrder] ?? 999;
      bValue = statusOrder[bStatus as keyof typeof statusOrder] ?? 999;
    }

    // Compare values
    let comparison = 0;
    if (typeof aValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: string) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (column: string) => {
    if (sortConfig.column !== column) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400 inline ml-1" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600 inline ml-1" />
    );
  };

  // Export functions
  const handleExportExcel = async () => {
    const columns: ExportColumn[] = [
      { key: 'id', label: 'ID' },
      { key: 'brand', label: t('brand') },
      { key: 'model', label: t('model') },
      { key: 'hp', label: t('hp') },
      { key: 'type', label: t('inventoryType') },
      { key: 'location', label: t('location') },
      { key: 'quantity', label: t('quantity') },
      { key: 'totalQuantity', label: t('total') + ' ' + t('quantity') },
      { key: 'propertyId', label: t('properties') },
      { key: 'installDate', label: t('installDate') },
      { key: 'warrantyEnd', label: t('warrantyEnd') },
      { key: 'status', label: t('status') },
    ];

    const exportData = filtered.flatMap((item) =>
      item.locations.map((loc) => ({
        id: item.id,
        brand: item.brand,
        model: item.model,
        hp: item.hp || '',
        type: item.type,
        location: loc.address,
        quantity: loc.quantity,
        totalQuantity: item.locations.reduce((sum, l) => sum + l.quantity, 0),
        propertyId: mockProperties.find((p) => p.id === loc.propertyId)?.address || loc.propertyId,
        installDate: loc.installDate,
        warrantyEnd: loc.warrantyEnd,
        status: loc.status,
      }))
    );

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
      { key: 'quantity', label: t('quantity') },
      { key: 'totalQuantity', label: t('total') + ' ' + t('quantity') },
      { key: 'propertyId', label: t('properties') },
      { key: 'installDate', label: t('installDate') },
      { key: 'warrantyEnd', label: t('warrantyEnd') },
      { key: 'status', label: t('status') },
    ];

    const exportData = filtered.flatMap((item) =>
      item.locations.map((loc) => ({
        id: item.id,
        brand: item.brand,
        model: item.model,
        hp: item.hp || '',
        type: item.type,
        location: loc.address,
        quantity: loc.quantity,
        totalQuantity: item.locations.reduce((sum, l) => sum + l.quantity, 0),
        propertyId: mockProperties.find((p) => p.id === loc.propertyId)?.address || loc.propertyId,
        installDate: loc.installDate,
        warrantyEnd: loc.warrantyEnd,
        status: loc.status,
      }))
    );

    const csv = generateCSV(exportData, columns);
    downloadCSV(csv, `inventory_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('inventory')}</h1>
          <p className="text-gray-600 mt-1">{t('trackMaintenanceRequests')}</p>
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
                <option value="all">{t('all')} {t('properties')}</option>
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
                <option value="all">{t('all')} {t('inventoryType')}</option>
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
                {t('warrantyStatus')}
              </label>
              <select
                value={filterWarranty}
                onChange={(e) => setFilterWarranty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('all')} {t('inventoryItem')}</option>
                <option value="active">{t('active')} {t('warrantyStatus')}</option>
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

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {t('showing')} {filtered.length} {t('of')} {mockInventory.length} {t('items')}
            </p>

            {/* View Mode Toggle */}
            <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded transition text-sm font-semibold ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid view"
              >
                ⊞ {t('grid') || 'Grid'}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded transition text-sm font-semibold ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="List view"
              >
                ☰ {t('list') || 'List'}
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Grid or List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No inventory items found matching the selected filters.</p>
              </div>
            ) : (
              filtered.map((item) => (
                <InventoryCard key={item.id} item={item} />
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th 
                      onClick={() => handleSort('brand')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('brand')}
                      {getSortIcon('brand')}
                    </th>
                    <th 
                      onClick={() => handleSort('model')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('model')}
                      {getSortIcon('model')}
                    </th>
                    <th 
                      onClick={() => handleSort('type')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('inventoryType')}
                      {getSortIcon('type')}
                    </th>
                    <th 
                      onClick={() => handleSort('location')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('location')}
                      {getSortIcon('location')}
                    </th>
                    <th 
                      onClick={() => handleSort('quantity')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('total')} {t('quantity')}
                      {getSortIcon('quantity')}
                    </th>
                    <th 
                      onClick={() => handleSort('installDate')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('installDate')}
                      {getSortIcon('installDate')}
                    </th>
                    <th 
                      onClick={() => handleSort('warrantyEnd')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('warrantyEnd')}
                      {getSortIcon('warrantyEnd')}
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('status')}
                      {getSortIcon('status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No inventory items found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    sortedFiltered.map((item) => {
                      // Use first location for display
                      const firstLocation = item.locations[0];
                      const property = mockProperties.find((p) => p.id === firstLocation.propertyId);
                      
                      // Get most critical warranty status across all locations
                      const anyExpired = item.locations.some((loc) => isWarrantyExpired(loc.warrantyEnd));
                      const anyExpiring = item.locations.some((loc) => isWarrantyExpiring(loc.warrantyEnd));
                      
                      const daysRemaining = getWarrantyDaysRemaining(firstLocation.warrantyEnd);
                      const isExpired = anyExpired;
                      const isExpiring = anyExpiring && !anyExpired;

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
                          <td className="px-6 py-4 text-sm text-gray-800">
                            <div>
                              <p className="font-semibold">{firstLocation.address}</p>
                              {item.locations.length > 1 && (
                                <p className="text-xs text-gray-500 mt-1">+{item.locations.length - 1} more location{item.locations.length - 1 !== 1 ? 's' : ''}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm font-semibold">
                              {item.locations.reduce((sum, loc) => sum + loc.quantity, 0)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{firstLocation.installDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <span>{firstLocation.warrantyEnd}</span>
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
                                firstLocation.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : firstLocation.status === 'inactive'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {firstLocation.status}
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
        )}
      </div>
    </div>
  );
}
