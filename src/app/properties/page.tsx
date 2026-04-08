'use client';

import PropertyCard from '@/components/PropertyCard';
import PropertyRow from '@/components/PropertyRow';
import { mockProperties, mockInventory, mockMaintenanceRequests, mockWorkOrders } from '@/lib/mockData';
import {
  getPropertiesWithExpiredWarranties,
  getPropertiesWithMaintenanceRequests,
  getPropertiesWithWorkOrders,
} from '@/lib/filterUtils';
import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export default function PropertiesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'expired' | 'maintenance' | 'workorders'>('all');
  const [allProperties, setAllProperties] = useState(mockProperties);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'address',
    direction: 'asc',
  });

  // Load view mode and properties from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('propertyViewMode') as 'grid' | 'list' | null;
      if (savedViewMode) {
        setViewMode(savedViewMode);
      }

      const saved = localStorage.getItem('properties');
      const savedProperties = saved ? JSON.parse(saved) : [];
      
      // Combine: mock data + saved properties (avoid duplicates by ID)
      const combinedProperties = [...mockProperties];
      savedProperties.forEach((saved: any) => {
        if (!combinedProperties.find(p => p.id === saved.id)) {
          combinedProperties.push(saved);
        }
      });
      
      setAllProperties(combinedProperties);
    }
  }, []);

  // Save view mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('propertyViewMode', viewMode);
    }
  }, [viewMode]);

  const getFilteredProperties = (): typeof allProperties => {
    switch (filter) {
      case 'expired':
        return getPropertiesWithExpiredWarranties(allProperties, mockInventory);
      case 'maintenance':
        return getPropertiesWithMaintenanceRequests(allProperties, mockMaintenanceRequests);
      case 'workorders':
        return getPropertiesWithWorkOrders(allProperties, mockWorkOrders);
      case 'all':
      default:
        return allProperties;
    }
  };

  const filtered = getFilteredProperties();

  // Sort handler
  const handleSort = (column: string) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Get sort icon
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

  // Sort properties
  const sortedFiltered = [...filtered].sort((a, b) => {
    const { column, direction } = sortConfig;
    let aValue: any = '';
    let bValue: any = '';

    if (column === 'address') {
      aValue = a.address;
      bValue = b.address;
    } else if (column === 'bedrooms') {
      aValue = a.bedrooms;
      bValue = b.bedrooms;
    } else if (column === 'status') {
      aValue = a.status;
      bValue = b.status;
    }

    let comparison = 0;
    if (typeof aValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else {
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('properties')}</h1>
            <p className="text-gray-600 mt-1">{t('manageAllProperties')}</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Link
                href={`/properties/create`}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                title="Edit property"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Link>
          )}
        </div>
      </div> 
      {/* Content */}
       
      <div className="max-w-7xl mx-auto px-4 py-8">
        

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 flex-wrap justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {t('propertyFilter_allAssets')} ({allProperties.length})
              </button>
              <button
                onClick={() => setFilter('expired')}
                className={`px-4 py-2 rounded transition ${
                  filter === 'expired'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {t('propertyFilter_expiredItems')} ({getPropertiesWithExpiredWarranties(allProperties, mockInventory).length})
              </button>
              <button
                onClick={() => setFilter('maintenance')}
                className={`px-4 py-2 rounded transition ${
                  filter === 'maintenance'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {t('propertyFilter_maintenanceRequests')} ({getPropertiesWithMaintenanceRequests(allProperties, mockMaintenanceRequests).length})
              </button>
              <button
                onClick={() => setFilter('workorders')}
                className={`px-4 py-2 rounded transition ${
                  filter === 'workorders'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {t('propertyFilter_workOrders')} ({getPropertiesWithWorkOrders(allProperties, mockWorkOrders).length})
              </button>
            </div>

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

        {/* Properties Grid or List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th 
                      onClick={() => handleSort('address')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('address')}{getSortIcon('address')}
                    </th>
                    <th 
                      onClick={() => handleSort('type')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('location')}{getSortIcon('type')}
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('status')}{getSortIcon('status')}
                    </th>
                    <th onClick={() => handleSort('expired')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('expiredWarranties') || 'Warranty Expiring'}
                      {getSortIcon('expired')}</th>
                    <th onClick={() => handleSort('workorders')} className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                      {t('workOrders')}{getSortIcon('workorders')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedFiltered.map((property) => (
                    <PropertyRow key={property.id} property={property} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('noPropertiesFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
}[]