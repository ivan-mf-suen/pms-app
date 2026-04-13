'use client';

import React, { useState } from 'react';
import { Tender, TenderCompany } from '@/lib/mockData';
import { getTranslation, Language } from '@/lib/i18n';
import { X } from 'lucide-react';

interface TenderFormProps {
  workOrderId: string;
  tender?: Tender;
  companies: TenderCompany[];
  language: Language;
  onSave: (tender: Tender) => void;
  onCancel: () => void;
}

export default function TenderForm({
  workOrderId,
  tender,
  companies,
  language,
  onSave,
  onCancel,
}: TenderFormProps) {
  const t = (key: string) => getTranslation(language, key);

  const [formData, setFormData] = useState({
    companyId: tender?.companyId || '',
    fee: tender?.fee || '',
    submissionDate: tender?.submissionDate || '',
    deadline: tender?.deadline || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyId) {
      newErrors.companyId = t('selectCompany');
    }

    const fee = parseFloat(formData.fee as any);
    if (!formData.fee || fee <= 0) {
      newErrors.fee = t('feeIsRequired');
    }

    if (!formData.submissionDate) {
      newErrors.submissionDate = t('selectSubmissionDate');
    }

    if (!formData.deadline) {
      newErrors.deadline = t('selectDeadline');
    }

    if (formData.submissionDate && formData.deadline && formData.submissionDate > formData.deadline) {
      newErrors.submissionDate = t('submissionDateAfterDeadline');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const selectedCompany = companies.find((c) => c.id === formData.companyId);

    const newTender: Tender = {
      id: tender?.id || `tender-${Date.now()}`,
      workOrderId,
      companyId: formData.companyId,
      company: selectedCompany,
      fee: parseFloat(formData.fee as any),
      submissionDate: formData.submissionDate,
      deadline: formData.deadline,
      awarded: tender?.awarded || false,
      controlNumber: tender?.controlNumber,
      awardedDate: tender?.awardedDate,
      documentIds: tender?.documentIds || [],
      remarks: tender?.remarks || [],
      auditLog: tender?.auditLog || [],
    };

    onSave(newTender);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-96 overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {tender ? t('editTender') : t('addTender')}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Company Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('companyName')} *
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.companyId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">{t('selectCompany')}</option>
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
            {errors.companyId && <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>}
          </div>

          {/* Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tenderingFeeLabel')} *
            </label>
            <input
              type="number"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
              placeholder={t('enterFee')}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.fee ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fee && <p className="text-red-500 text-sm mt-1">{errors.fee}</p>}
          </div>

          {/* Submission Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('submissionDate')} *
            </label>
            <input
              type="date"
              value={formData.submissionDate}
              onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.submissionDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.submissionDate && <p className="text-red-500 text-sm mt-1">{errors.submissionDate}</p>}
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tenderDeadline')} *
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.deadline ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
