'use client';

import { mockMaintenanceRequests, mockProperties } from '@/lib/mockData';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toISOString().split('T')[0];
};

export default function MaintenancePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [allRequests, setAllRequests] = useState(mockMaintenanceRequests);

  // Load view mode and requests from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('maintenanceViewMode') as 'grid' | 'list' | null;
      if (savedViewMode) {
        setViewMode(savedViewMode);
      }
    }

    const saved = localStorage.getItem('maintenanceRequests');
    const savedRequests = saved ? JSON.parse(saved) : [];
    
    // Combine: mock data + saved data (avoid duplicates by ID)
    const combinedRequests = [...mockMaintenanceRequests];
    savedRequests.forEach((saved: any) => {
      if (!combinedRequests.find(m => m.id === saved.id)) {
        combinedRequests.push(saved);
      }
    });
    
    setAllRequests(combinedRequests);
  }, []);

  // Save view mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('maintenanceViewMode', viewMode);
    }
  }, [viewMode]);


  const getPropertyAddress = (propertyId: string) => {
    return mockProperties.find((p) => p.id === propertyId)?.address || 'Unknown';
  };

  const filtered =
    filter === 'all'
      ? allRequests
      : allRequests.filter((r) => r.status === filter);

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const statusColors: Record<string, string> = {
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-orange-100 text-orange-800',
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    canceled: 'bg-gray-100 text-gray-800',
  };

  const handleSort = (column: string) => {
    // Placeholder for future sorting functionality
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('maintenance')}</h1>
          <p className="text-gray-600 mt-1">{t('trackMaintenanceRequests')}</p>
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
              {t('all')} ({allRequests.length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded transition ${
                filter === 'open'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('open')} ({allRequests.filter((r) => r.status === 'open').length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded transition ${
                filter === 'in_progress'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('inProgress')} ({allRequests.filter((r) => r.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded transition ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('completed')} ({allRequests.filter((r) => r.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 border border-gray-300 rounded-lg p-1 mb-6 w-fit">
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

        {/* Grid/List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">{t('noMaintenanceRequests')}</p>
              </div>
            ) : (
              filtered.map((request) => (
                <div
                  key={request.id}
                  onClick={() => router.push(`/maintenance/${request.id}`)}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-lg hover:bg-blue-50 transition cursor-pointer"
                >
                  <div className="mb-3">
                    <p className="text-gray-600 text-xs font-semibold">{t('title')}</p>
                    <p className="font-semibold text-gray-800 text-sm line-clamp-2">{request.title}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-600 text-xs font-semibold">{t('properties')}</p>
                    <p className="font-semibold text-gray-800 text-sm">{getPropertyAddress(request.propertyId)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-600 text-xs font-semibold">{t('priority')}</p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          priorityColors[request.priority]
                        }`}
                      >
                        {t(`priority_${request.priority}`)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold">{t('status')}</p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          statusColors[request.status]
                        }`}
                      >
                        {t(`maintenanceStatus_${request.status}`)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('title')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('properties')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('priority')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('status')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('createdDate')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('estimatedCost')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        {t('noMaintenanceRequests')}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((request) => (
                      <tr
                        key={request.id}
                        onClick={() => router.push(`/maintenance/${request.id}`)}
                        className="hover:bg-blue-50 cursor-pointer transition"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600 hover:text-blue-800">{request.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{getPropertyAddress(request.propertyId)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${priorityColors[request.priority]}`}>
                            {t(`priority_${request.priority}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${statusColors[request.status]}`}>
                            {t(`maintenanceStatus_${request.status}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">{formatDate(request.createdDate)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">${request.estimatedCost.toLocaleString()}</td>
                      </tr>
                    ))
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
