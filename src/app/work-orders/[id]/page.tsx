'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockWorkOrders, mockInventory, mockProperties } from '@/lib/mockData';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { notFound } from 'next/navigation';

export default function WorkOrderDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const { id } = params as { id: string };
  const [workOrderId, setWorkOrderId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Extract ID from promise (client-side component)
  // if (!workOrderId && typeof window !== 'undefined') {
  //   params.then((resolved) => setWorkOrderId(resolved.id));
  // }

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

  // Calculate financials
  const cumulative = wo.financials.original + wo.financials.voApproved + wo.financials.contingency;
  const threshold = wo.financials.original + wo.financials.contingency;
  const exceedsThreshold = cumulative > threshold;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <a
            href="/work-orders"
            className="text-blue-600 hover:underline mb-4 block"
          >
            ← Back to Work Orders
          </a>
          <h1 className="text-3xl font-bold text-gray-800">{wo.controlNumber}</h1>
          <p className="text-gray-600 mt-1">
            {property?.address} • {wo.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Work Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Work Order Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">{t('workOrderStatus')}</p>
                  <p className="font-semibold text-gray-800 capitalize">{wo.status}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{t('priority')}</p>
                  <p className="font-semibold text-gray-800 capitalize">{wo.priority}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Created Date</p>
                  <p className="font-semibold text-gray-800">{wo.createdDate}</p>
                </div>
                {wo.completedDate && (
                  <div>
                    <p className="text-gray-600 text-sm">Completed Date</p>
                    <p className="font-semibold text-gray-800">{wo.completedDate}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-gray-600 text-sm">Description</p>
                  <p className="font-semibold text-gray-800">{wo.description}</p>
                </div>
              </div>
            </div>

            {/* Linked Inventory */}
            {linkedInventory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('linkedInventory')}</h2>
                <div className="space-y-3">
                  {linkedInventory.map((inv) => (
                    <div key={inv.id} className="border border-gray-200 rounded p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{inv.brand} {inv.model}</p>
                          <p className="text-sm text-gray-600">{inv.locations[0]?.address}</p>
                          {inv.locations.length > 1 && (
                            <p className="text-xs text-gray-500 mt-1">+{inv.locations.length - 1} more location{inv.locations.length - 1 !== 1 ? 's' : ''}</p>
                          )}
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {inv.type.toUpperCase()}
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

                {/* Add Remark Form (Mock) */}
                <div className="border-2 border-dashed border-gray-300 rounded p-4 mt-4">
                  <textarea
                    placeholder="Add a note to this work order (append-only)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-2">Note: Demo mode - remarks cannot be edited</p>
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

            {/* Audit Log */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex justify-between items-center mb-4"
              >
                <h2 className="text-xl font-bold text-gray-800">{t('auditLog')}</h2>
                <span className="text-gray-600">{expanded ? '▼' : '▶'}</span>
              </button>

              {expanded && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {wo.auditLog.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-gray-800 text-sm capitalize">{entry.action}</p>
                        <p className="text-xs text-gray-600">{entry.timestamp}</p>
                      </div>
                      <p className="text-xs text-gray-700">By: {entry.actor}</p>
                      {entry.description && (
                        <p className="text-xs text-gray-600 mt-1">{entry.description}</p>
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
