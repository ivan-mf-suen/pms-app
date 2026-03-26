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
  const [allRequests, setAllRequests] = useState(mockMaintenanceRequests);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, []);

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
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    canceled: 'bg-gray-100 text-gray-800',
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

        {/* List */}
        <div className="space-y-4">
          {filtered.map((request) => (
            <div
              key={request.id}
              onClick={() => router.push(`/maintenance/${request.id}`)}
              className="bg-white rounded-lg shadow p-6 mb-6 hover:shadow-lg hover:bg-blue-50 transition cursor-pointer"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">{t('title')}</p>
                  <p className="font-semibold text-gray-800">{request.title}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{t('properties')}</p>
                  <p className="font-semibold text-gray-800">
                    {getPropertyAddress(request.propertyId)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{t('priority')}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                      priorityColors[request.priority]
                    }`}
                  >
                    {t(`priority_${request.priority}`)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{t('status')}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                      statusColors[request.status]
                    }`}
                  >
                    {t(`maintenanceStatus_${request.status}`)}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-gray-600">{request.description}</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <p className="text-gray-600 text-sm">{t('createdDate')}</p>
                  <p className="text-sm text-gray-800">
                    {formatDate(request.createdDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{t('estimatedCost')}</p>
                  <p className="font-semibold text-gray-800">
                    ${request.estimatedCost.toLocaleString()}
                  </p>
                </div>
                {request.actualCost && (
                  <div>
                    <p className="text-gray-600 text-sm">{t('actualCost')}</p>
                    <p className="font-semibold text-gray-800">
                      ${request.actualCost.toLocaleString()}
                    </p>
                  </div>
                )}
                {request.completedDate && (
                  <div>
                    <p className="text-gray-600 text-sm">{t('completedDate')}</p>
                    <p className="text-sm text-gray-800">
                      {formatDate(request.completedDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('noMaintenanceRequests')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
