'use client';

import { mockMaintenanceRequests, mockProperties, mockWorkOrders } from '@/lib/mockData';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateWorkOrderPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const maintenanceId = searchParams.get('maintenanceId');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [remarks, setRemarks] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the maintenance request
  const getMaintenanceRequest = () => {
    if (!maintenanceId) return null;
    
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const saved = localStorage.getItem('maintenanceRequests');
      const savedRequests = saved ? JSON.parse(saved) : [];
      const foundSaved = savedRequests.find((r: any) => r.id === maintenanceId);
      if (foundSaved) return foundSaved;
    }
    
    // Fallback to mock data
    return mockMaintenanceRequests.find(r => r.id === maintenanceId);
  };
  
  const getAllWorkOrders = () => {
    const savedWOs = localStorage.getItem('workOrders');
    const localWOs = savedWOs ? JSON.parse(savedWOs) : [];
        
    // Merge and deduplicate: localStorage items are newer, so use them if they exist
    const merged = [...mockWorkOrders];
    const mergedIds = new Set(merged.map(wo => wo.id));
        
    localWOs.forEach((wo: any) => {
    const index = merged.findIndex(m => m.id === wo.id);
    if (index >= 0) {
        // Update existing with localStorage version (newer)
        merged[index] = wo;
    } else {
        // Add new work orders from localStorage
        merged.push(wo);
    }
    });
    
    return merged;
};

  const maintenanceRequest = getMaintenanceRequest();
  const allWorkOrders = getAllWorkOrders();
  const property = maintenanceRequest ? mockProperties.find((p) => p.id === maintenanceRequest.propertyId) : null;
  const workOrder = maintenanceRequest ? mockWorkOrders.find((wo) => wo.id === maintenanceRequest.workOrderId) : null;

  // Pre-fill form from maintenance data
  useEffect(() => {
    if (maintenanceRequest) {
      setDescription(maintenanceRequest.description);
      setPriority(maintenanceRequest.priority || 'medium');
      setBudget(maintenanceRequest.estimatedCost?.toString() || '');
      setIsLoading(false);
    } else if (!isLoading && maintenanceId) {
      setError('Maintenance request not found');
    }
  }, [maintenanceRequest, maintenanceId, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!maintenanceRequest || !property) {
      setError('Maintenance request or property not found');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!budget || isNaN(Number(budget)) || Number(budget) < 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate work order
      const controlNumber = `WO-2026-${(allWorkOrders.length + 1).toString().padStart(4, '0')}`;
      const newWorkOrder = {
        id: `WO-2026-${(allWorkOrders.length + 1).toString().padStart(4, '0')}`,
        controlNumber,
        propertyId: maintenanceRequest.propertyId,
        maintenanceRequestId: maintenanceRequest.id,
        inventoryIds: maintenanceRequest.inventoryId ? [maintenanceRequest.inventoryId] : [],
        status: 'open' as const,
        createdDate: new Date().toISOString().split('T')[0],
        priority,
        description,
        financials: {
          original: Number(budget),
          voApproved: 0,
          contingency: 0,
        },
        remarks: remarks ? [{
          id: `remark-${Date.now()}`,
          text: remarks,
          author: user?.email || 'unknown',
          username: user ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} - ${user.name}` : 'Unknown',
          timestamp: new Date().toISOString()
        }] : [],
        auditLog: [
          {
            id: `audit-${Date.now()}`,
            action: 'create' as const,
            actor: user?.email || 'unknown',
            username: user ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} - ${user.name}` : 'Unknown',
            timestamp: new Date().toISOString(),
            entityType: 'work_order' as const,
            entityId: `wo-${Date.now()}`,
            description: 'Work order created from maintenance request',
          },
        ],
      };

      // Save work order to localStorage
      const savedWOs = localStorage.getItem('workOrders');
      const workOrders = savedWOs ? JSON.parse(savedWOs) : [];
      workOrders.push(newWorkOrder);
      localStorage.setItem('workOrders', JSON.stringify(workOrders));

      // Also add to mock data for immediate display
      mockWorkOrders.push(newWorkOrder);

      // Update maintenance request with work order link
      const updatedRequest = {
        ...maintenanceRequest,
        workOrderId: newWorkOrder.id,
        status: 'open' as const,
      };

      // Save updated maintenance request
      const savedMRs = localStorage.getItem('maintenanceRequests');
      const maintenanceRequests = savedMRs ? JSON.parse(savedMRs) : [];
      const index = maintenanceRequests.findIndex((r: any) => r.id === maintenanceRequest.id);
      if (index >= 0) {
        maintenanceRequests[index] = updatedRequest;
      } else {
        maintenanceRequests.push(updatedRequest);
      }
      localStorage.setItem('maintenanceRequests', JSON.stringify(maintenanceRequests));

      // Navigate to the new work order detail page
      router.push(`/work-orders`);
    } catch (err) {
      console.error('Error creating work order:', err);
      setError('Failed to create work order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  if (!maintenanceRequest || !property) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
            <p className="text-gray-700 mb-4">{error || 'Maintenance request not found'}</p>
            <Link
              href="/maintenance"
              className="text-blue-600 hover:underline"
            >
              ← Back to Maintenance
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            href={`/maintenance/${maintenanceRequest.id}`}
            className="text-blue-600 hover:underline mb-4 block"
          >
            ← {t('back')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{t('createWorkOrder')}</h1>
          <p className="text-gray-600 mt-2">
            {t('properties')}: {property.address}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Maintenance Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">{t('linkedInventory')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700 font-semibold">{t('title')}</p>
                <p className="text-gray-800">{maintenanceRequest.title}</p>
              </div>
              <div>
                <p className="text-blue-700 font-semibold">{t('priority')}</p>
                <p className="text-gray-800 capitalize">{t(`priority_${maintenanceRequest.priority}`)}</p>
              </div>
              <div>
                <p className="text-blue-700 font-semibold">{t('status')}</p>
                <p className="text-gray-800">{t(`maintenanceStatus_${maintenanceRequest.status}`)}</p>
              </div>
              <div>
                <p className="text-blue-700 font-semibold">{t('estimatedCost')}</p>
                <p className="text-gray-800">HKD {maintenanceRequest.estimatedCost?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
              {t('description')} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              placeholder="Detailed work order description"
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-gray-700 font-semibold mb-2">
              {t('priority')} <span className="text-red-500">*</span>
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            >
              <option value="low">{t('priority_low')}</option>
              <option value="medium">{t('priority_medium')}</option>
              <option value="high">{t('priority_high')}</option>
              <option value="urgent">{t('priority_urgent')}</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-gray-700 font-semibold mb-2">
              {t('original')} {t('estimatedCost')} (HKD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min="0"
              step="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              placeholder="0"
            />
          </div>

          {/* Remarks */}
          <div>
            <label htmlFor="remarks" className="block text-gray-700 font-semibold mb-2">
              {t('remarks')}
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              placeholder="Additional remarks or notes"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex-1 disabled:opacity-50"
            >
              {isSubmitting ? t('loading') : t('create')}
            </button>
            <Link
              href={`/maintenance/${maintenanceRequest.id}`}
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
