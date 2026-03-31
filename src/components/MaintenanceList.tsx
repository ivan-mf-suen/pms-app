'use client';

import { useI18n } from '@/contexts/I18nContext';
import { MaintenanceRequest } from '@/lib/mockData';

interface MaintenanceListProps {
  requests: MaintenanceRequest[];
}

const priorityColors: Record<string, string> = {
  low: 'text-gray-600 bg-gray-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-orange-600 bg-orange-100',
  urgent: 'text-red-600 bg-red-100',
};

const statusColors: Record<string, string> = {
  open: 'text-blue-600 bg-blue-100',
  in_progress: 'text-purple-600 bg-purple-100',
  completed: 'text-green-600 bg-green-100',
  canceled: 'text-gray-600 bg-gray-100',
};

export default function MaintenanceList({ requests }: MaintenanceListProps) {
  const { t } = useI18n();

  const getStatusLabel = (status: string) => {
    return t(`maintenanceStatus_${status}`)
  };

  return (
    <div className="space-y-3">
      {requests.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No maintenance requests</p>
      ) : (
        requests.slice(0, 5).map((request) => (
          <div
            key={request.id}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{request.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded ${priorityColors[request.priority]}`}>
                    {t(`priority_${request.priority}`)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[request.status]}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-gray-800">
                  ${request.estimatedCost.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('estimatedCost')}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
