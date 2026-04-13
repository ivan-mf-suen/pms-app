'use client';

import React from 'react';
import { Tender } from '@/lib/mockData';
import { Language } from '@/lib/i18n';
import { X } from 'lucide-react';
import TenderCompanyDetail from './TenderCompanyDetail';

interface TenderDetailModalProps {
  tender: Tender;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onAward?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TenderDetailModal({
  tender,
  language,
  isOpen,
  onClose,
  onAward,
  onEdit,
  onDelete,
}: TenderDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {tender.company?.name || 'Tender Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <TenderCompanyDetail
            tender={tender}
            language={language}
            onAward={onAward}
            onEdit={onEdit}
            onDelete={onDelete}
            viewOnly={false}
          />
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            {language === 'zh-Hant' ? '關閉' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
