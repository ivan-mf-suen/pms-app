'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Tender,
  getTenderFromStorage,
  saveTenderToStorage,
  deleteTenderFromStorage,
  generateTenderControlNumber,
} from '@/lib/mockData';
import { useI18n } from '@/contexts/I18nContext';
import { getTranslation } from '@/lib/i18n';
import TenderCompanyDetail from '@/components/TenderCompanyDetail';
import TenderForm from '@/components/TenderForm';
import { mockTenderCompanies } from '@/lib/mockData';
import { ArrowLeft } from 'lucide-react';

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useI18n();
  const t = (key: string) => getTranslation(language, key);

  const tenderId = params.tenderId as string;
  const workOrderId = params.id as string;

  const [tender, setTender] = useState<Tender | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load tender from storage/mock data
    const loadedTender = getTenderFromStorage(tenderId);
    setTender(loadedTender || null);
    setIsLoading(false);
  }, [tenderId]);

  const handleSaveTender = (updated: Tender) => {
    saveTenderToStorage(updated);
    setTender(updated);
    setShowEditForm(false);
  };

  const handleDeleteTender = () => {
    if (confirm(t('confirmDeleteTender'))) {
      deleteTenderFromStorage(tenderId);
      router.push(`/work-orders/${workOrderId}/tendering`);
    }
  };

  const handleAwardTender = () => {
    if (!tender) return;

    if (confirm(t('awardTenderMessage'))) {
      const controlNumber = generateTenderControlNumber(workOrderId, 1);

      const awardedTender: Tender = {
        ...tender,
        awarded: true,
        awardedDate: new Date().toISOString().split('T')[0],
        controlNumber,
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
            description: `Tender awarded: ${controlNumber}`,
          },
        ],
      };

      saveTenderToStorage(awardedTender);
      setTender(awardedTender);
      alert(t('awardedSuccessfully'));
      setTimeout(() => {
        router.push(`/work-orders/${workOrderId}/tendering`);
      }, 1500);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">{t('loading')}</div>;
  }

  if (!tender) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">{t('notFound')}</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/work-orders/${workOrderId}/tendering`)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('manageTenders')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('tenderDetailTitle')} {tender.company?.name}
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <TenderCompanyDetail
            tender={tender}
            language={language}
            onAward={!tender.awarded ? handleAwardTender : undefined}
            onEdit={() => setShowEditForm(true)}
            onDelete={!tender.awarded ? handleDeleteTender : undefined}
            viewOnly={false}
          />
        </div>

        {/* Edit Form Modal */}
        {showEditForm && (
          <TenderForm
            workOrderId={workOrderId}
            tender={tender}
            companies={mockTenderCompanies}
            language={language}
            onSave={handleSaveTender}
            onCancel={() => setShowEditForm(false)}
          />
        )}
      </div>
    </div>
  );
}
