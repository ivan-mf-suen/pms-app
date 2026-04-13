'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Tender, 
  mockWorkOrders, 
  getTendersForWorkOrder, 
  saveTenderToStorage,
  deleteTenderFromStorage,
} from '@/lib/mockData';
import { useI18n } from '@/contexts/I18nContext';
import { ArrowLeft } from 'lucide-react';

export default function TenderingPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();

  const workOrderId = params.id as string;
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);


  useEffect(() => {
    // Load work order from localStorage or mock data
    let wo = mockWorkOrders.find((w) => w.id === workOrderId);
    
    // Check localStorage for updated work order
    const savedWOs = localStorage.getItem('workOrders');
    if (savedWOs) {
      const localWOs = JSON.parse(savedWOs);
      const savedWO = localWOs.find((w: any) => w.id === workOrderId);
      if (savedWO) {
        wo = savedWO;
      }
    }
    
    setWorkOrder(wo);

    // Load tenders from work order first, then supplement with any from localStorage
    const loadedTendersList: Tender[] = [];
    if (wo?.tenders) {
      loadedTendersList.push(...wo.tenders);
    }
    
    // Also check localStorage for any tenders that might not be in the work order yet
    const storedTenders = localStorage.getItem('tenders');
    if (storedTenders) {
      const localTenders = JSON.parse(storedTenders);
      localTenders.forEach((localTender: Tender) => {
        if (localTender.workOrderId === workOrderId && !loadedTendersList.find(t => t.id === localTender.id)) {
          loadedTendersList.push(localTender);
        }
      });
    }
    
    setTenders(loadedTendersList);
  }, [workOrderId]);

  const handleDeleteTender = (tender: Tender) => {
    if (confirm(`${t('deleteTender')}?`)) {
      deleteTenderFromStorage(tender.id);
      // Refresh tenders list
      const loadedTendersList: Tender[] = [];
      if (workOrder?.tenders) {
        loadedTendersList.push(...workOrder.tenders);
      }
      const storedTenders = localStorage.getItem('tenders');
      if (storedTenders) {
        const localTenders = JSON.parse(storedTenders);
        localTenders.forEach((localTender: Tender) => {
          if (localTender.workOrderId === workOrderId && !loadedTendersList.find(t => t.id === localTender.id)) {
            loadedTendersList.push(localTender);
          }
        });
      }
      setTenders(loadedTendersList);
    }
  };

  const handleAwardTender = (tender: Tender) => {
    if (confirm(`${t('awardTender')}?`)) {
      const awardedTender: Tender = {
        ...tender,
        awarded: true,
        status: 'awarded',
        awardedDate: new Date().toISOString().split('T')[0],
        auditLog: [
          ...tender.auditLog,
          {
            id: `audit-${Date.now()}`,
            action: 'status_change',
            actor: 'user@example.com',
            username: 'User',
            timestamp: new Date().toISOString(),
            entityType: 'work_order',
            entityId: workOrderId,
            description: `Tender awarded`,
          },
        ],
      };

      saveTenderToStorage(awardedTender);
      // Refresh tenders list
      const loadedTendersList: Tender[] = [];
      if (workOrder?.tenders) {
        loadedTendersList.push(...workOrder.tenders);
      }
      const storedTenders = localStorage.getItem('tenders');
      if (storedTenders) {
        const localTenders = JSON.parse(storedTenders);
        localTenders.forEach((localTender: Tender) => {
          if (localTender.workOrderId === workOrderId && !loadedTendersList.find(t => t.id === localTender.id)) {
            loadedTendersList.push(localTender);
          }
        });
      }
      setTenders(loadedTendersList);
      alert(`${t('awardTender')} - ${t('success')}`);
    }
  };

  if (!workOrder) {
    return <div className="p-6 text-center text-gray-500">{t('loading')}</div>;
  }

  // Status color mapping
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-blue-100 text-blue-800',
    awarded: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  const statusLabels: Record<string, string> = {
    pending: t('tenderStatusPending') || 'Pending',
    submitted: t('tenderStatusSubmitted') || 'Submitted',
    awarded: t('tenderStatusAwarded') || 'Awarded',
    rejected: t('tenderStatusRejected') || 'Rejected',
    cancelled: t('tenderStatusCancelled') || 'Cancelled'
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            href={`/work-orders/${workOrderId}`}
            className="text-blue-600 hover:underline mb-4 block flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{t('tendering')}</h1>
              <p className="text-gray-600 mt-1">{t('workOrderStatus')}: {workOrder.controlNumber}</p>
            </div>
            <Link
              href={`/work-orders/${workOrderId}/tendering/create`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
            >
              + {t('addTender') || 'Add Tender'}
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {tenders.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {tenders.map((tender) => {
              const companyName = tender.company?.name || `Company ${tender.companyId}`;
              const contactName = tender.company?.contactPerson?.name || 'Not provided';
              const contactPhone = tender.company?.contactPerson?.phone || 'N/A';
              
              const currentStatus = tender.status || (tender.awarded ? 'awarded' : 'pending');
              const statusColor = statusColors[currentStatus] || statusColors.pending;
              const statusLabel = statusLabels[currentStatus] || currentStatus;
              
              return (
                <div
                  key={tender.id}
                  className={`bg-white rounded-lg shadow p-6 border ${
                    currentStatus === 'awarded'
                      ? 'border-green-300 bg-green-50'
                      : currentStatus === 'rejected'
                      ? 'border-red-300 bg-red-50'
                      : currentStatus === 'cancelled'
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-lg transition'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{companyName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{t('contactPerson')}: {contactName}</p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">{t('tenderingFee')}</p>
                      <p className="text-lg font-bold text-gray-900">HKD ${tender.fee.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">{t('submissionDate')}</p>
                      <p className="text-gray-800">{tender.submissionDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">{t('tenderDeadline')}</p>
                      <p className="text-gray-800">{tender.deadline || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">{t('contactPhone')}</p>
                      <p className="text-gray-800">{contactPhone}</p>
                    </div>
                  </div>

                  {tender.remarks && tender.remarks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2">{t('remarks')}:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {tender.remarks.map((remark: any) => (
                          <li key={remark.id} className="text-xs">
                            • {remark.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    {currentStatus !== 'awarded' && currentStatus !== 'rejected' && currentStatus !== 'cancelled' && (
                      <button
                        onClick={() => handleAwardTender(tender)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition"
                      >
                        {t('awardTender')}
                      </button>
                    )}
                    <Link
                      href={`/tendering/${tender.id}`}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition"
                    >
                      {t('viewDetails')}
                    </Link>
                    <button
                      onClick={() => handleDeleteTender(tender)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition"
                    >
                      {t('deleteTender')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">{t('noTenders')}</p>
            <Link
              href={`/work-orders/${workOrderId}/tendering/create`}
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              + {t('addTender') || 'Add Tender'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
