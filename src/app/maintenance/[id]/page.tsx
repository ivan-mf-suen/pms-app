'use client';

import { mockMaintenanceRequests, mockProperties, mockInventory } from '@/lib/mockData';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toISOString().split('T')[0];
};

export default function MaintenanceDetailPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [isApproving, setIsApproving] = useState(false);
  
  // Helper to get maintenance request from localStorage or mock data
  const getMaintenanceRequest = () => {
    if (typeof window === 'undefined') {
      return mockMaintenanceRequests.find((r) => r.id === id);
    }
    
    // Check localStorage first
    const saved = localStorage.getItem('maintenanceRequests');
    const savedRequests = saved ? JSON.parse(saved) : [];
    const foundSaved = savedRequests.find((r: any) => r.id === id);
    
    if (foundSaved) return foundSaved;
    
    // Fallback to mock data
    return mockMaintenanceRequests.find(r => r.id === id);
  };

  // Resolve params synchronously by finding the maintenance request
  const request = getMaintenanceRequest();
  const property = request ? mockProperties.find((p) => p.id === request.propertyId) : null;
  const linkedInventory = request && request.inventoryId ? mockInventory.find((inv) => inv.id === request.inventoryId) : null;

  // Calculate warranty days remaining for linked inventory
  const getWarrantyDaysRemaining = (warrantyEnd: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const warranty = new Date(warrantyEnd);
    warranty.setHours(0, 0, 0, 0);
    const diffTime = warranty.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isWarrantyExpired = (warrantyEnd: string): boolean => {
    return getWarrantyDaysRemaining(warrantyEnd) < 0;
  };

  const handleApproveMaintenance = async () => {
    if (!user || !(user.role === 'admin' || user.role === 'manager')) return;
    
    setIsApproving(true);
    try {
      // Generate work order
      const controlNumber = `WO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newWorkOrder = {
        id: `wo-${Date.now()}`,
        controlNumber,
        propertyId: request.propertyId,
        maintenanceRequestId: request.id,
        inventoryIds: request.inventoryId ? [request.inventoryId] : [],
        status: 'open' as const,
        createdDate: new Date().toISOString().split('T')[0],
        priority: request.priority,
        description: request.description,
        financials: {
          original: request.estimatedCost,
          voApproved: 0,
          contingency: 0,
        },
        remarks: [],
        auditLog: [],
      };
      
      // Save work order to localStorage
      const savedWOs = localStorage.getItem('workOrders');
      const workOrders = savedWOs ? JSON.parse(savedWOs) : [];
      workOrders.push(newWorkOrder);
      localStorage.setItem('workOrders', JSON.stringify(workOrders));
      
      // Update maintenance request
      const approvedRequest = {
        ...request,
        status: 'open' as const,
        approvedBy: user.name,
        approvedDate: new Date().toISOString().split('T')[0],
        workOrderId: newWorkOrder.id,
      };
      
      // Save updated maintenance request
      const savedMRs = localStorage.getItem('maintenanceRequests');
      const maintenanceRequests = savedMRs ? JSON.parse(savedMRs) : [];
      const index = maintenanceRequests.findIndex((r: any) => r.id === request.id);
      if (index >= 0) {
        maintenanceRequests[index] = approvedRequest;
      } else {
        maintenanceRequests.push(approvedRequest);
      }
      localStorage.setItem('maintenanceRequests', JSON.stringify(maintenanceRequests));
      
      // Show success and redirect
      alert(t('approveMaintenance') + ' - ' + t('success'));
      router.push(`/work-orders/${newWorkOrder.id}`);
    } catch (error) {
      console.error('Error approving maintenance:', error);
      alert(t('error'));
    } finally {
      setIsApproving(false);
    }
  };

  if (!request) {
    notFound();
  }

  const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
    low: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
    high: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    urgent: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
  };

  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    canceled: 'bg-gray-100 text-gray-800',
  };

  const priorityBadgeColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  // Calculate cost status
  const costSavings = request.actualCost ? request.estimatedCost - request.actualCost : null;
  const costOverage = request.actualCost ? request.actualCost - request.estimatedCost : null;

  return (
    <div className={`min-h-screen ${priorityColors[request.priority].bg}`}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/maintenance"
            className="text-blue-600 hover:underline mb-4 block"
          >
            ← {t('backToMaintenance')}
          </Link>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{request.title}</h1>
              <p className="text-gray-600 mt-2">{t('id')}: {request.id}</p>
            </div>
            <div className="flex gap-2">
              <span
                className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                  priorityBadgeColors[request.priority]
                }`}
              >
                {t(`priority_${request.priority}`)} {t('priority')}
              </span>
              <span
                className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                  statusColors[request.status]
                }`}
              >
                {t(`maintenanceStatus_${request.status}`)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('description')}</h2>
            <p className="text-gray-700 leading-relaxed">{request.description}</p>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('basicInformation')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">{t('properties')}</p>
                {property ? (
                  <Link
                    href={`/properties/${property.id}`}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    {property.address}
                  </Link>
                ) : (
                  <p className="font-semibold text-gray-800">{t('unknownProperty')}</p>
                )}
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">{t('status')}</p>
                <p className="font-semibold text-gray-800 capitalize">
                  {t(`maintenanceStatus_${request.status}`)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">{t('priority')}</p>
                <p className="font-semibold text-gray-800 capitalize">{t(`priority_${request.priority}`)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">{t('createdDate')}</p>
                <p className="font-semibold text-gray-800">{formatDate(request.createdDate)}</p>
              </div>
            </div>
          </div>

          {/* Linked Inventory */}
          {linkedInventory && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('linkedInventory')}</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">{t('brandModel')}</p>
                    <Link
                      href={`/inventory/${linkedInventory.id}`}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      {linkedInventory.brand} {linkedInventory.model}
                    </Link>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">{t('inventoryType')}</p>
                    <p className="font-semibold text-gray-800 capitalize">{t(`type_${linkedInventory.type}`)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">{t('warrantyStatus')}</p>
                    {linkedInventory.locations.some((loc) => isWarrantyExpired(loc.warrantyEnd)) ? (
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                        {t('expiredWarranty')}
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        {t('active')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('financialSummary')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-gray-600 text-sm font-semibold mb-1">{t('estimatedCost')}</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${request.estimatedCost.toLocaleString()}
                </p>
              </div>
              {request.actualCost && (
                <>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="text-gray-600 text-sm font-semibold mb-1">{t('actualCost')}</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${request.actualCost.toLocaleString()}
                    </p>
                  </div>
                  {costSavings !== null && (
                    <div
                      className={`border-l-4 pl-4 ${
                        costSavings >= 0 ? 'border-green-500' : 'border-red-500'
                      }`}
                    >
                      <p className="text-gray-600 text-sm font-semibold mb-1">
                        {costSavings >= 0 ? t('savings') : t('overage')}
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          costSavings >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {costSavings >= 0 ? '+' : '-'}${Math.abs(costSavings).toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            {!request.actualCost && (
              <p className="text-gray-500 text-sm mt-4 italic">
                {t('actualCostNotRecorded')}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('timeline')}</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="w-1 h-12 bg-gray-300 my-2"></div>
                </div>
                <div className="pb-8">
                  <p className="font-semibold text-gray-800">{t('created')}</p>
                  <p className="text-gray-600">{formatDate(request.createdDate)}</p>
                </div>
              </div>

              {request.status === 'in_progress' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{t('inProgress')}</p>
                    <p className="text-gray-600">{t('currentlyBeingWorkedOn')}</p>
                  </div>
                </div>
              )}

              {request.completedDate && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                      ✓
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{t('completed')}</p>
                    <p className="text-gray-600">{formatDate(request.completedDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('actions')}</h2>
            <div className="flex gap-4 flex-wrap">
              {request.status === 'pending_approval' && 
               (user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  onClick={handleApproveMaintenance}
                  disabled={isApproving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
                >
                  {isApproving ? t('loading') : t('approveMaintenance')}
                </button>
              )}
              {property && (
                <Link
                  href={`/properties/${property.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {t('viewProperty')}
                </Link>
              )}
              {linkedInventory && (
                <Link
                  href={`/inventory/${linkedInventory.id}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {t('viewInventory')}
                </Link>
              )}
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                {t('printDetails')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
