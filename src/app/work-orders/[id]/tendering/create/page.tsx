'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockWorkOrders, mockTenderCompanies, saveTenderToStorage, generateTenderControlNumber } from '@/lib/mockData';
import { useI18n } from '@/contexts/I18nContext';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateTenderPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const workOrderId = params.id as string;

  const workOrder = mockWorkOrders.find((w) => w.id === workOrderId);
  
  const [formData, setFormData] = useState({
    companyId: '',
    fee: '',
    submissionDate: new Date().toISOString().split('T')[0],
    deadline: '',
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyId) {
      newErrors.companyId = t('required') || 'Required';
    }
    if (!formData.fee || parseFloat(formData.fee) <= 0) {
      newErrors.fee = t('invalidAmount') || 'Please enter a valid amount';
    }
    if (!formData.submissionDate) {
      newErrors.submissionDate = t('required') || 'Required';
    }
    if (formData.deadline && new Date(formData.deadline) <= new Date(formData.submissionDate)) {
      newErrors.deadline = t('deadlineMustBeAfterSubmission') || 'Deadline must be after submission date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const selectedCompany = mockTenderCompanies.find((c) => c.id === formData.companyId);

      if (!selectedCompany) {
        alert(t('selectCompany') || 'Please select a company');
        return;
      }

      const newTender = {
        id: `tender-${Date.now()}`,
        workOrderId,
        companyId: formData.companyId,
        company: selectedCompany,
        fee: parseFloat(formData.fee),
        submissionDate: formData.submissionDate,
        deadline: formData.deadline || new Date(new Date(formData.submissionDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        awarded: false,
        status: 'pending' as const,
        documentIds: [],
        documents: [],
        remarks: formData.remarks ? [
          {
            id: `rem-${Date.now()}`,
            text: formData.remarks,
            author: 'system@example.com',
            username: 'System',
            timestamp: new Date().toISOString(),
          },
        ] : [],
        auditLog: [
          {
            id: `audit-${Date.now()}`,
            action: 'create',
            actor: 'user@example.com',
            username: 'User',
            timestamp: new Date().toISOString(),
            entityType: 'work_order',
            entityId: workOrderId,
            description: `Created tender for company: ${selectedCompany.name}`,
          },
        ],
      };

      saveTenderToStorage(newTender);
      alert(t('createdSuccessfully') || 'Tender created successfully');
      router.push(`/work-orders/${workOrderId}/tendering`);
    } catch (error) {
      console.error('Error creating tender:', error);
      alert(t('operationFailed') || 'Failed to create tender');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/work-orders/${workOrderId}/tendering`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('createTender')}</h1>
          <p className="text-gray-600 mt-1">
            {t('workOrder')}: {workOrder.controlNumber}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {/* Company Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('company')} *
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">{t('selectCompany') || 'Select a company'}</option>
              {mockTenderCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.companyId && <p className="text-red-600 text-sm mt-1">{errors.companyId}</p>}
          </div>

          {/* Fee */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('tenderingFee')} (HKD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            {errors.fee && <p className="text-red-600 text-sm mt-1">{errors.fee}</p>}
          </div>

          {/* Submission Date */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('submissionDate')} *
              </label>
              <input
                type="date"
                value={formData.submissionDate}
                onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              {errors.submissionDate && <p className="text-red-600 text-sm mt-1">{errors.submissionDate}</p>}
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('tenderDeadline')}
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              {errors.deadline && <p className="text-red-600 text-sm mt-1">{errors.deadline}</p>}
            </div>
          </div>

          {/* Initial Remarks */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('remarks')}
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder={t('enterRemarks') || 'Enter any initial remarks...'}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              {isSubmitting ? (t('saving') || 'Saving...') : t('createTender')}
            </button>
            <Link
              href={`/work-orders/${workOrderId}/tendering`}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition text-center"
            >
              {t('cancel')}
            </Link>
          </div>
        </form>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{t('note')}:</span> {t('createTenderInfo') || 'A new tender will be created with "Pending" status. You can edit or award it from the tender list.'}
          </p>
        </div>
      </div>
    </div>
  );
}
