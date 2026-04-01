'use client';

import PropertyCard from '@/components/PropertyCard';
import PropertyRow from '@/components/PropertyRow';
import { mockProperties } from '@/lib/mockData';
import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function PropertiesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>('all');
  const [allProperties, setAllProperties] = useState(mockProperties);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const filtered = filter === 'all' 
    ? allProperties 
    : allProperties.filter((p) => p.status === filter);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('properties')}</h1>
          <p className="text-gray-600 mt-1">{t('manageAllProperties')}</p>
        </div>
      </div>

      {/* Content */}
       
      <div className="max-w-7xl mx-auto px-4 py-8">
        {(user?.role === 'admin' || user?.role === 'manager') && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">{t('manageAllProperties')}</h2>
          <Link
            href="/properties/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            + {t('create')} {t('properties')}
          </Link>
        </div> 
        )}

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
                {t('allProperties')} ({allProperties.length})
              </button>
              <button
                onClick={() => setFilter('occupied')}
                className={`px-4 py-2 rounded transition ${
                  filter === 'occupied'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {t('propertyStatus_occupied')} ({allProperties.filter((p) => p.status === 'occupied').length})
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-4 py-2 rounded transition ${
                  filter === 'available'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {t('propertyStatus_available')} ({mockProperties.filter((p) => p.status === 'available').length})
              </button>
              <button
                onClick={() => setFilter('maintenance')}
                className={`px-4 py-2 rounded transition ${
                  filter === 'maintenance'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {t('propertyStatus_maintenance')} ({mockProperties.filter((p) => p.status === 'maintenance').length})
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('address')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('location')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('status')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('expiredWarranties') || 'Warranty Expiring'}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('workOrders')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((property) => (
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
}
