'use client';

import { mockWorkOrders, mockProperties, mockMaintenanceRequests } from '@/lib/mockData';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';

const priorityOptions = ['low', 'medium', 'high', 'urgent'];
const statusOptions = ['open', 'in_progress', 'on_hold', 'completed'];

export default function EditWorkOrderPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load work order data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const savedWorkOrders = JSON.parse(localStorage.getItem('workOrders') || '[]');
      const foundSaved = savedWorkOrders.find((wo: any) => wo.id === id);
      if (foundSaved) {
        setFormData(foundSaved);
        setIsLoading(false);
        return;
      }
    }

    // Fallback to mockWorkOrders
    const workOrder = mockWorkOrders.find((wo) => wo.id === id);
    if (workOrder) {
      setFormData(workOrder);
    }
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  if (!formData) {
    notFound();
  }

  const property = mockProperties.find((p) => p.id === formData.propertyId);
  const maintenance = mockMaintenanceRequests.find((m) => m.id === formData.maintenanceRequestId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('financials.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        financials: {
          ...formData.financials,
          [field]: isNaN(Number(value)) ? value : Number(value),
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: isNaN(Number(value)) ? value : Number(value),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.priority) {
      setError('Priority is required');
      return;
    }

    if (!formData.status) {
      setError('Status is required');
      return;
    }

    if (formData.financials.original < 0 || formData.financials.voApproved < 0 || formData.financials.contingency < 0) {
      setError('Financial values cannot be negative');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create audit log entry for the update
      const changes = [];
      const originalWO = mockWorkOrders.find((wo) => wo.id === id);
      
      if (originalWO) {
        if (originalWO.description !== formData.description) {
          changes.push({ field: 'description', oldValue: originalWO.description, newValue: formData.description });
        }
        if (originalWO.priority !== formData.priority) {
          changes.push({ field: 'priority', oldValue: originalWO.priority, newValue: formData.priority });
        }
        if (originalWO.status !== formData.status) {
          changes.push({ field: 'status', oldValue: originalWO.status, newValue: formData.status });
        }
        if (originalWO.financials.original !== formData.financials.original) {
          changes.push({ field: 'original', oldValue: originalWO.financials.original, newValue: formData.financials.original });
        }
        if (originalWO.financials.voApproved !== formData.financials.voApproved) {
          changes.push({ field: 'voApproved', oldValue: originalWO.financials.voApproved, newValue: formData.financials.voApproved });
        }
        if (originalWO.financials.contingency !== formData.financials.contingency) {
          changes.push({ field: 'contingency', oldValue: originalWO.financials.contingency, newValue: formData.financials.contingency });
        }
      }

      const auditEntry = {
        id: `audit-${Date.now()}`,
        action: 'update' as const,
        actor: user?.name || 'Unknown',
        timestamp: new Date().toISOString(),
        entityType: 'work_order' as const,
        entityId: id,
        description: `Work order updated - ${changes.length} field(s) changed`,
        changes: changes,
      };

      const updatedWorkOrder = {
        ...formData,
        auditLog: [...(formData.auditLog || []), auditEntry],
      };

      // Update in localStorage
      if (typeof window !== 'undefined') {
        const savedWorkOrders = JSON.parse(localStorage.getItem('workOrders') || '[]');
        const index = savedWorkOrders.findIndex((wo: any) => wo.id === id);
        if (index > -1) {
          savedWorkOrders[index] = updatedWorkOrder;
          localStorage.setItem('workOrders', JSON.stringify(savedWorkOrders));
        } else {
          // If not found in saved, add it
          savedWorkOrders.push(updatedWorkOrder);
          localStorage.setItem('workOrders', JSON.stringify(savedWorkOrders));
        }
      }

      // Also update mockWorkOrders
      const mockIndex = mockWorkOrders.findIndex((wo) => wo.id === id);
      if (mockIndex > -1) {
        mockWorkOrders[mockIndex] = updatedWorkOrder;
      }

      // Navigate to work order detail page
      router.push(`/work-orders/${id}`);
    } catch (err) {
      console.error('Error updating work order:', err);
      setError('Failed to update work order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href={`/work-orders/${id}`} className="text-blue-600 hover:underline mb-4 block">
            ← {t('back')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{t('editWorkOrder')}</h1>
          <p className="text-gray-600 mt-2">{formData.controlNumber}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Work Order Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">{t('linkedMaintenance')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700 font-semibold">{t('title')}</p>
                <p className="text-gray-800">{maintenance?.title || 'N/A'}</p>
              </div>
              <div>
                <p className="text-blue-700 font-semibold">{t('properties')}</p>
                <p className="text-gray-800">{property?.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-blue-700 font-semibold">{t('createdDate')}</p>
                <p className="text-gray-800">{formData.createdDate}</p>
              </div>
              <div>
                <p className="text-blue-700 font-semibold">{t('controlNumber')}</p>
                <p className="text-gray-800">{formData.controlNumber}</p>
              </div>
            </div>
          </div>

          {/* Work Order Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('workOrderDetails')}</h2>
            <div className="space-y-4">
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
                  {t('description')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                  placeholder="Work order description"
                  required
                />
              </div>

              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-gray-700 font-semibold mb-2">
                    {t('workOrderStatus')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                    required
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status === 'open' && t('open')}
                        {status === 'in_progress' && t('inProgress')}
                        {status === 'on_hold' && t('onHold')}
                        {status === 'completed' && t('completed')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-gray-700 font-semibold mb-2">
                    {t('priority')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                    required
                  >
                    <option value="">Select Priority</option>
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority === 'low' && t('low')}
                        {priority === 'medium' && t('medium')}
                        {priority === 'high' && t('high')}
                        {priority === 'urgent' && t('urgent')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('financials')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 space-y-4">
              <div>
                <label htmlFor="original" className="block text-gray-700 font-semibold mb-2">
                  {t('original')} (HKD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="original"
                  name="financials.original"
                  value={formData.financials.original}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="voApproved" className="block text-gray-700 font-semibold mb-2">
                  {t('voApproved')} (HKD)
                </label>
                <input
                  type="number"
                  id="voApproved"
                  name="financials.voApproved"
                  value={formData.financials.voApproved}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="contingency" className="block text-gray-700 font-semibold mb-2">
                  {t('contingency')} (HKD)
                </label>
                <input
                  type="number"
                  id="contingency"
                  name="financials.contingency"
                  value={formData.financials.contingency}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                  placeholder="0"
                />
              </div>

              {/* Cumulative Display */}
              <div className="md:col-span-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 font-semibold mb-2">{t('cumulative')}</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${(formData.financials.original + formData.financials.voApproved + formData.financials.contingency).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex-1 disabled:opacity-50"
            >
              {isSubmitting ? t('loading') : t('save')}
            </button>
            <Link
              href={`/work-orders/${id}`}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
            >
              {t('cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
