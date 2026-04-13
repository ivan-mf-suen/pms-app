'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockWorkOrders, mockInventory, mockProperties, mockMaintenanceRequests, mockDocuments } from '@/lib/mockData';
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
  const attachedDocuments = mockDocuments.filter((doc) => doc.workOrderId === wo.id);
  
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

  // Helper function to format username as "Role - Name"
  const formatUsername = (userRole: string, userName: string) => {
    const roleDisplay = userRole.charAt(0).toUpperCase() + userRole.slice(1);
    return `${roleDisplay} - ${userName}`;
  };

  // Save remark function
  const handleSaveRemark = async () => {
    if (!newRemark.trim() || !user) return;
    
    setIsSavingRemark(true);
    try {
      const formattedUsername = formatUsername(user.role, user.name);
      const now = new Date().toISOString();
      
      const remark = {
        id: `rem-${Date.now()}`,
        text: newRemark,
        author: user.email,
        username: formattedUsername,
        timestamp: now,
      };
      
      // Create audit log entry for the remark
      const auditEntry = {
        id: `audit-${Date.now()}`,
        action: 'remark',
        actor: user.email,
        username: formattedUsername,
        timestamp: now,
        entityType: 'work_order',
        entityId: id,
        description: newRemark,
      };
      
      const updatedWO = {
        ...wo,
        remarks: [...wo.remarks, remark],
        auditLog: [...wo.auditLog, auditEntry],
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
      
      // Refresh the page to show the new remark and audit log
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
                {property?.address} 
              </p>
            </div>
            <div className="flex gap-2">
              {wo.tenders && wo.tenders.length > 0 && (
                <Link
                  href={`/work-orders/${id}/tendering`}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-semibold text-sm flex items-center gap-2"
                  title={`View ${wo.tenders.length} tender(s) for this work order`}
                >
                  📋 {wo.tenders.length} {t('tenders')}
                </Link>
              )}
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

            {/* Attached Files */}
            {attachedDocuments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('attachedFiles') || '附加文件'}</h2>
                <div className="space-y-3">
                  {attachedDocuments.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded p-4 hover:border-blue-300 hover:bg-blue-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{doc.name}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>{doc.type}</span>
                            <span>{doc.uploadDate}</span>
                          </div>
                        </div>
                        <a
                          href="#"
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm whitespace-nowrap ml-4"
                          title="Download document"
                        >
                          ↓ {t('download') || '下載'}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remarks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('remarks')}</h2>
              <div className="space-y-4">
                {wo.remarks.map((remark: any) => (
                  <div key={remark.id} className="border border-gray-200 rounded p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-gray-800">{remark.username || remark.author}</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
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

            {/* Tendering */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{t('tendering')}</h2>
                <Link
                  href={`/work-orders/${id}/tendering/create`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
                  title="Create a new tender for this work order"
                >
                  + {t('addTender') || 'Add Tender'}
                </Link>
              </div>
              {wo.tenders && wo.tenders.length > 0 ? (
                <div className="space-y-4">
                  {wo.tenders.map((tender: any) => {
                    const companyName = tender.company?.name || `Company ${tender.companyId}`;
                    const contactName = tender.company?.contactPerson?.name || 'Not provided';
                    const contactPhone = tender.company?.contactPerson?.phone || 'N/A';
                    
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
                    
                    const currentStatus = tender.status || (tender.awarded ? 'awarded' : 'pending');
                    const statusColor = statusColors[currentStatus] || statusColors.pending;
                    const statusLabel = statusLabels[currentStatus] || currentStatus;
                    
                    return (
                      <div
                        key={tender.id}
                        className={`border rounded-lg p-4 transition ${
                          currentStatus === 'awarded'
                            ? 'border-green-300 bg-green-50'
                            : currentStatus === 'rejected'
                            ? 'border-red-300 bg-red-50'
                            : currentStatus === 'cancelled'
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <Link
                              href={`/tendering/${tender.id}`}
                              className="font-semibold text-blue-600 hover:text-blue-800 transition"
                            >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            
                              {companyName}
                          
                            <p className="text-sm text-gray-600 mt-1">{t('contactPerson')}: {contactName}</p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <span
                              className={`inline-block px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${statusColor}`}
                            >
                              {statusLabel}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">{t('tenderingFee')}</p>
                            <p className="text-lg font-bold text-gray-900">HKD ${tender.fee.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">{t('submissionDate')}</p>
                            <p className="text-gray-800">{tender.submissionDate}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">{t('contactPhone')}</p>
                            <p className="text-gray-800">{contactPhone}</p>
                          </div>
                        </div>
                        {tender.deadline && (
                          <div className="mt-3 flex justify-between text-sm">
                            <span className="text-gray-600">{t('tenderDeadline')}: {tender.deadline}</span>
                            {tender.awardedDate && (
                              <span className="text-green-600 font-semibold">{t('awardedDate')}: {tender.awardedDate}</span>
                            )}
                          </div>
                        )}
                        {tender.remarks && tender.remarks.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
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
                        {tender.awarded && (
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs font-semibold text-green-700">✓ {t('awardTender')} - {t('awardedDate')}: {tender.awardedDate}</p>
                          </div>
                        )}
                          </Link>
                      </div>
                      
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm mb-4">{t('noTenders')}</p>
                  <Link
                    href={`/work-orders/${id}/tendering/create`}
                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
                  >
                    + {t('addTender') || 'Add Tender'}
                  </Link>
                </div>
              )}
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
                  {wo.auditLog.map((entry: any) => (
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
                        <span className="font-semibold">{t('by')}:</span> {entry.username || entry.actor}
                      </p>
                      {entry.description && (
                        <p className="text-xs text-gray-600 mb-2">{entry.description}</p>
                      )}
                      {entry.changes && Object.keys(entry.changes).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                          {Object.entries(entry.changes).map(([key, value]: [string, any], idx: number) => {
                            // Check if value is an object with field, oldValue, newValue structure
                            const hasChangeStructure = value && typeof value === 'object' && 'field' in value && 'oldValue' in value && 'newValue' in value;
                            const fieldName = hasChangeStructure ? value.field : key.replace(/\./g, ' > ');
                            const oldVal = hasChangeStructure ? value.oldValue : undefined;
                            const newVal = hasChangeStructure ? value.newValue : value;
                            
                            return (
                              <div key={idx} className="text-xs bg-white rounded p-2 border border-gray-200">
                                <p className="font-semibold text-gray-700 capitalize">{fieldName}</p>
                                <div className="flex gap-2 mt-1">
                                  {oldVal !== undefined && (
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-600 font-semibold">Before:</p>
                                      <p className="text-xs text-red-700 font-mono">{String(oldVal)}</p>
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600 font-semibold">After:</p>
                                    <p className="text-xs text-green-700 font-mono">{typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal)}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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
