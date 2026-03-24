'use client';

import PropertyCard from '@/components/PropertyCard';
import { mockProperties } from '@/lib/mockData';
import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

export default function PropertiesPage() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' 
    ? mockProperties 
    : mockProperties.filter((p) => p.status === filter);

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
              {t('allProperties')} ({mockProperties.length})
            </button>
            <button
              onClick={() => setFilter('occupied')}
              className={`px-4 py-2 rounded transition ${
                filter === 'occupied'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('propertyStatus_occupied')} ({mockProperties.filter((p) => p.status === 'occupied').length})
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
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('noPropertiesFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
