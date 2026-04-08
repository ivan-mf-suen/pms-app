'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockWorkOrders, mockInventory, mockProperties, mockMaintenanceRequests } from '@/lib/mockData';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function WorkOrderDetailPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const params = useParams();
  const { id } = params as { id: string };
  const [auditExpanded, setAuditExpanded] = useState(false);
  const [maintenanceExpanded, setMaintenanceExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [newRemark, setNewRemark] = useState('');
  const [isSavingRemark, setIsSavingRemark] = useState(false);

  // Helper to get work order request from localStorage or mock data
  const getWorkOrderRequest = () => {
    if (typeof window === 'undefined') {
      return mockWorkOrders.find((r) => r.id === id) || notFound();
    }
    
    // Check localStorage first
    const saved = localStorage.getItem('workOrders');
    const savedRequests = saved ? JSON.parse(saved) : [];
    const foundSaved = savedRequests.find((r: any) => r.id === id);
    
    if (foundSaved) return foundSaved;
    
    // Fallback to mock data
    return mockWorkOrders.find(r => r.id ===  id) || notFound();
  };
  
  // Resolve params synchronously by finding the work order with the given ID
  const wo = getWorkOrderRequest();
  const property = mockProperties.find((p) => p.id === wo.propertyId);
  const linkedInventory = mockInventory.filter((inv) => wo.inventoryIds.includes(inv.id));
  const relatedMaintenance = mockMaintenanceRequests.find((m) => m.id === wo.maintenanceRequestId);
  
  // Get work order history - same property
  const getAllWorkOrders = () => {
    const savedWOs = localStorage.getItem('workOrders');
    const localWOs = savedWOs ? JSON.parse(savedWOs) : [];
    const merged = [...mockWorkOrders];
    localWOs.forEach((wo: any) => {
      const index = merged.findIndex(m => m.id === wo.id);
      if (index >= 0) {
        merged[index] = wo;
      } else {
        merged.push(wo);
      }
    });
    return merged;
  };
  
  const similarWorkOrders = getAllWorkOrders()
    .filter((w) => {
      // Same property
      return w.id !== wo.id && w.propertyId === wo.propertyId;
    })
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  // Calculate financials
  const cumulative = wo.financials.original + wo.financials.voApproved + wo.financials.contingency;
  const threshold = wo.financials.original + wo.financials.contingency;
  const exceedsThreshold = cumulative > threshold;

  // Save remark function
  const handleSaveRemark = async () => {
    if (!newRemark.trim() || !user) return;
    
    setIsSavingRemark(true);
    try {
      const remark = {
        id: `rem-${Date.now()}`,
        text: newRemark,
        author: user.email,
        timestamp: new Date().toISOString(),
      };
      
      const updatedWO = {
        ...wo,
        remarks: [...wo.remarks, remark],
      };
      
      // Save to localStorage
      const saved = localStorage.getItem('workOrders');
      const savedRequests = saved ? JSON.parse(saved) : [];
      const index = savedRequests.findIndex((r: any) => r.id === id);
      
      if (index >= 0) {
        savedRequests[index] = updatedWO;
      } else {
        savedRequests.push(updatedWO);
      }
      
      localStorage.setItem('workOrders', JSON.stringify(savedRequests));
      setNewRemark('');
      
      // Refresh the page to show the new remark
      window.location.reload();
    } catch (error) {
      console.error('Error saving remark:', error);
      alert('Failed to save remark');
    } finally {
      setIsSavingRemark(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <a
            href="/work-orders"
            className="text-blue-600 hover:underline mb-4 block"
          >
            ← {t('back')}
          </a>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{wo.controlNumber}</h1>
              <p className="text-gray-600 mt-2">
                {property?.address} • {wo.description}
              </p>
            </div>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link
                href={`/work-orders/${id}/edit`}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                title="Edit work order"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Work Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('details')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">{t('workOrderStatus')}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                      wo.status === 'open'
                        ? 'bg-gray-100 text-gray-800'
                        : wo.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : wo.status === 'on_hold'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {wo.status === 'open' && t('open')}
                    {wo.status === 'in_progress' && t('inProgress')}
                    {wo.status === 'on_hold' && t('onHold')}
                    {wo.status === 'completed' && t('completed')}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">{t('priority')}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                      wo.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : wo.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : wo.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {wo.priority === 'urgent' && t('urgent')}
                    {wo.priority === 'high' && t('high')}
                    {wo.priority === 'medium' && t('medium')}
                    {wo.priority === 'low' && t('low')}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">{t('createdDate')}</p>
                  <p className="font-semibold text-gray-800">{wo.createdDate}</p>
                </div>
                {wo.completedDate && (
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">{t('completedDate')}</p>
                    <p className="font-semibold text-gray-800">{wo.completedDate}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-gray-600 text-sm font-semibold mb-1">{t('description')}</p>
                  <p className="font-semibold text-gray-800">{wo.description}</p>
                </div>
              </div>
            </div>

            {/* Related Maintenance */}
            {relatedMaintenance && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-4">{t('relatedMaintenance')}</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-blue-700 font-semibold">{relatedMaintenance.title}</p>
                      <p className="text-sm text-blue-600 mt-1">{relatedMaintenance.description}</p>
                    </div>
                    <Link
                      href={`/maintenance/${relatedMaintenance.id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm whitespace-nowrap"
                    >
                      {t('viewDetails')} →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200">
                    <div>
                      <p className="text-xs font-semibold text-blue-700 uppercase">{t('status')}</p>
                      <p className="text-sm text-blue-900 font-semibold capitalize">{relatedMaintenance.status}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-700 uppercase">{t('priority')}</p>
                      <p className="text-sm text-blue-900 font-semibold capitalize">{relatedMaintenance.priority}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Linked Inventory */}
            {linkedInventory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('linkedInventory')}</h2>
                <div className="space-y-3">
                  {linkedInventory.map((inv) => (
                    <div key={inv.id} className="border border-gray-200 rounded p-4 hover:border-blue-300 hover:bg-blue-50 transition">
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/inventory/${inv.id}`}
                          className="flex-1 text-blue-600 hover:text-blue-800"
                        >
                          <p className="font-semibold text-gray-800">{inv.brand} {inv.model}</p>
                          <p className="text-sm text-gray-600">{inv.locations[0]?.address}</p>
                          {inv.locations.length > 1 && (
                            <p className="text-xs text-gray-500 mt-1">+{inv.locations.length - 1} more location{inv.locations.length - 1 !== 1 ? 's' : ''}</p>
                          )}
                        </Link>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {t(`type_${inv.type}`)}
                        </span>
                      </div>
                      {inv.hp && (
                        <p className="text-sm text-gray-600 mt-2">HP: {inv.hp}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remarks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('remarks')}</h2>
              <div className="space-y-4">
                {wo.remarks.map((remark) => (
                  <div key={remark.id} className="border border-gray-200 rounded p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-gray-800">{remark.author}</p>
                      <p className="text-xs text-gray-600">{remark.timestamp}</p>
                    </div>
                    <p className="text-gray-700">{remark.text}</p>
                  </div>
                ))}

                {/* Add Remark Form */}
                <div className="border-2 border-dashed border-gray-300 rounded p-4 mt-4">
                  <textarea
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    placeholder="Add a note to this work order (append-only)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleSaveRemark}
                      disabled={!newRemark.trim() || isSavingRemark}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      {isSavingRemark ? t('saving') : t('saveRemark')}
                    </button>
                    <button
                      onClick={() => setNewRemark('')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Financials */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('financials')}</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <p className="text-gray-600">{t('original')}</p>
                  <p className="font-semibold text-gray-800">${wo.financials.original.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <p className="text-gray-600">{t('voApproved')}</p>
                  <p className="font-semibold text-gray-800">${wo.financials.voApproved.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <p className="text-gray-600">{t('contingency')}</p>
                  <p className="font-semibold text-gray-800">${wo.financials.contingency.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 font-bold">
                  <p className="text-gray-800">{t('cumulative')}</p>
                  <p className={cumulative > 10000 ? 'text-lg text-gray-900' : 'text-lg text-green-600'}>
                    ${cumulative.toLocaleString()}
                  </p>
                </div>

                {/* Threshold Flag */}
                <div className="mt-4 pt-4 border-t-2">
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      exceedsThreshold
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-green-50 border border-green-200'
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-600 mb-1">{t('exceedsThreshold')}</p>
                    <p
                      className={`text-sm font-bold ${
                        exceedsThreshold ? 'text-red-800' : 'text-green-800'
                      }`}
                    >
                      {exceedsThreshold ? (
                        <>
                          ⚠️ YES - Over by ${(cumulative - threshold).toLocaleString()}
                        </>
                      ) : (
                        <>
                          ✓ NO - Within budget
                        </>
                      )}
                    </p>
                    {exceedsThreshold && (
                      <p className="text-xs text-red-700 mt-2">
                        Cumulative (${cumulative.toLocaleString()}) exceeds threshold (${threshold.toLocaleString()})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>


            

            {/* Similar Work Orders - Same Property */}
            {similarWorkOrders.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <button
                  onClick={() => setHistoryExpanded(!historyExpanded)}
                  className="w-full flex justify-between items-center mb-4"
                >
                  <h2 className="text-xl font-bold text-gray-800">
                    {t('relatedWorkOrders')} ({similarWorkOrders.length})
                  </h2>
                  <span className="text-gray-600">{historyExpanded ? '▼' : '▶'}</span>
                </button>

                {historyExpanded && (
                  <div className="space-y-3">
                    {similarWorkOrders.map((workOrder) => {
                      const wo_property = mockProperties.find((p) => p.id === workOrder.propertyId);
                      const wo_cumulative = workOrder.financials.original + workOrder.financials.voApproved + workOrder.financials.contingency;
                      return (
                        <Link
                          key={workOrder.id}
                          href={`/work-orders/${workOrder.id}`}
                          className="block border border-gray-200 rounded p-3 hover:border-blue-400 hover:bg-blue-50 transition"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-blue-600 hover:text-blue-800">{workOrder.controlNumber}</p>
                              <p className="text-xs text-gray-600">{workOrder.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-semibold text-gray-800">${wo_cumulative.toLocaleString()}</p>
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                                  workOrder.status === 'open'
                                    ? 'bg-gray-100 text-gray-800'
                                    : workOrder.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : workOrder.status === 'on_hold'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {workOrder.status === 'open' && t('open')}
                                {workOrder.status === 'in_progress' && t('inProgress')}
                                {workOrder.status === 'on_hold' && t('onHold')}
                                {workOrder.status === 'completed' && t('completed')}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Audit Log - Enhanced with Field Changes */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={() => setAuditExpanded(!auditExpanded)}
                className="w-full flex justify-between items-center mb-4"
              >
                <h2 className="text-xl font-bold text-gray-800">{t('auditLog')}</h2>
                <span className="text-gray-600">{auditExpanded ? '▼' : '▶'}</span>
              </button>

              {auditExpanded && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {wo.auditLog.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm capitalize">
                            {entry.action === 'create' && '✎ ' + t('created')}
                            {entry.action === 'update' && '✍ ' + t('updated')}
                            {entry.action === 'remark' && '💬 ' + t('remark')}
                            {entry.action === 'status_change' && '🔄 ' + t('statusChanged')}
                            {entry.action === 'delete' && '✕ ' + t('deleted')}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600">{entry.timestamp}</p>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">
                        <span className="font-semibold">{t('by')}:</span> {entry.actor}
                      </p>
                      {entry.description && (
                        <p className="text-xs text-gray-600 mb-2">{entry.description}</p>
                      )}
                      {entry.changes && Object.keys(entry.changes).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                          {Object.entries(entry.changes).map(([key, value]: [string, any], idx: number) => (
                            <div key={idx} className="text-xs bg-white rounded p-2 border border-gray-200">
                              <p className="font-semibold text-gray-700 capitalize">{key.replace(/\./g, ' > ')}</p>
                              <div className="flex gap-2 mt-1">
                                <div className="flex-1">
                                  <p className="text-xs text-gray-600 font-semibold">Changed to:</p>
                                  <p className="text-xs text-green-700 font-mono">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
