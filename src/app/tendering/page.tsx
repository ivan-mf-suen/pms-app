'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockWorkOrders, mockProperties } from '@/lib/mockData';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Trash2, Edit2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TenderingPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'createdDate',
    direction: 'desc',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingTender, setEditingTender] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Get all tenders from work orders
  const getAllTenders = () => {
    const tenders: any[] = [];
    const allWOs = mockWorkOrders;

    allWOs.forEach((wo) => {
      if (wo.tenders && wo.tenders.length > 0) {
        wo.tenders.forEach((tender: any) => {
          tenders.push({
            ...tender,
            workOrderId: wo.id,
            workOrderControlNumber: wo.controlNumber,
            propertyId: wo.propertyId,
          });
        });
      }
    });

    return tenders;
  };

  const handleSort = (column: string) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (column: string) => {
    if (sortConfig.column !== column) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400 inline ml-1" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600 inline ml-1" />
    );
  };

  const handleOpenCreateModal = () => {
    setEditingTender(null);
    setFormData({
      companyName: '',
      registrationNumber: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      fee: '',
      submissionDate: new Date().toISOString().split('T')[0],
      deadline: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (tender: any) => {
    setEditingTender(tender);
    setFormData({
      companyName: tender.company?.name || '',
      registrationNumber: tender.company?.registrationNumber || '',
      contactName: tender.company?.contactPerson?.name || '',
      contactPhone: tender.company?.contactPerson?.phone || '',
      contactEmail: tender.company?.contactPerson?.email || '',
      fee: tender.fee,
      submissionDate: tender.submissionDate,
      deadline: tender.deadline || '',
    });
    setShowModal(true);
  };

  const handleDeleteTender = (tenderId: string, workOrderId: string) => {
    if (!confirm(t('confirmDelete'))) return;
    
    const saved = localStorage.getItem('workOrders');
    const savedWOs = saved ? JSON.parse(saved) : [];
    
    // Find and update the work order
    const woIndex = savedWOs.findIndex((wo: any) => wo.id === workOrderId);
    if (woIndex >= 0) {
      savedWOs[woIndex].tenders = savedWOs[woIndex].tenders.filter((t: any) => t.id !== tenderId);
      localStorage.setItem('workOrders', JSON.stringify(savedWOs));
    } else {
      // Update from mock data
      const mockWO = mockWorkOrders.find(wo => wo.id === workOrderId);
      if (mockWO && mockWO.tenders) {
        mockWO.tenders = mockWO.tenders.filter(t => t.id !== tenderId);
      }
    }
    
    window.location.reload();
  };

  const handleSaveTender = () => {
    if (!formData.companyName || !formData.fee || !formData.submissionDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newTender = {
      id: editingTender?.id || `tender-${Date.now()}`,
      workOrderId: editingTender?.workOrderId || '',
      companyId: editingTender?.companyId || `company-${Date.now()}`,
      company: {
        id: editingTender?.company?.id || `company-${Date.now()}`,
        name: formData.companyName,
        registrationNumber: formData.registrationNumber,
        licenseInfo: formData.registrationNumber ? `License: ${formData.registrationNumber}` : '',
        contactPerson: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail,
          address: 'Hong Kong',
        },
      },
      fee: parseFloat(formData.fee),
      submissionDate: formData.submissionDate,
      deadline: formData.deadline,
      awardedDate: editingTender?.awardedDate,
      awarded: editingTender?.awarded || false,
      documentIds: editingTender?.documentIds || [],
      remarks: editingTender?.remarks || [],
      auditLog: editingTender?.auditLog || [],
    };

    const saved = localStorage.getItem('workOrders');
    const savedWOs = saved ? JSON.parse(saved) : [];
    
    if (editingTender && editingTender.workOrderId) {
      // Update existing tender
      const woIndex = savedWOs.findIndex((wo: any) => wo.id === editingTender.workOrderId);
      if (woIndex >= 0) {
        const tenderIndex = savedWOs[woIndex].tenders.findIndex((t: any) => t.id === editingTender.id);
        if (tenderIndex >= 0) {
          savedWOs[woIndex].tenders[tenderIndex] = newTender;
        }
      }
    } else if (editingTender?.workOrderId) {
      // Add new tender to existing work order
      const woIndex = savedWOs.findIndex((wo: any) => wo.id === editingTender.workOrderId);
      if (woIndex >= 0) {
        if (!savedWOs[woIndex].tenders) {
          savedWOs[woIndex].tenders = [];
        }
        savedWOs[woIndex].tenders.push(newTender);
      }
    }

    localStorage.setItem('workOrders', JSON.stringify(savedWOs));
    setShowModal(false);
    window.location.reload();
  };

  // Filter and sort tenders
  let allTenders = getAllTenders();

  // Apply filters
  if (filterStatus !== 'all') {
    allTenders = allTenders.filter((tender) => {
      const status = tender.awarded ? 'awarded' : 'pending';
      return status === filterStatus;
    });
  }

  if (filterProperty !== 'all') {
    allTenders = allTenders.filter((tender) => tender.propertyId === filterProperty);
  }

  if (searchQuery) {
    allTenders = allTenders.filter((tender) => {
      const company = tender.company?.name || '';
      const controlNumber = tender.workOrderControlNumber || '';
      return (
        company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        controlNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }

  // Sort
  allTenders.sort((a, b) => {
    let aVal: any = a[sortConfig.column] || '';
    let bVal: any = b[sortConfig.column] || '';

    if (sortConfig.column === 'fee') {
      aVal = a.fee;
      bVal = b.fee;
    } else if (sortConfig.column === 'submissionDate') {
      aVal = new Date(a.submissionDate).getTime();
      bVal = new Date(b.submissionDate).getTime();
    } else if (sortConfig.column === 'companyName') {
      aVal = a.company?.name || '';
      bVal = b.company?.name || '';
    }

    if (aVal < bVal) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Get unique properties for filter
  const properties = mockProperties;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('tendering')}</h1>
            <p className="text-gray-600 mt-1">{t('manageTenders')}</p>
          </div>
          <div className="flex gap-2">
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('createTender') || 'Create Tender'}
              </button>
            )}
            <Link
              href="/work-orders"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {t('workOrders')} →
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {t('search')}
              </label>
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {t('tenderStatus')}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="all">{t('all')}</option>
                <option value="pending">{t('pending')}</option>
                <option value="awarded">{t('awardTender')}</option>
              </select>
            </div>

            {/* Property Filter */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {t('properties')}
              </label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="all">{t('all')}</option>
                {properties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterProperty('all');
                  setSearchQuery('');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                {t('reset')}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="text-sm text-gray-600 border-t pt-4">
            {t('showing')} <span className="font-semibold">{allTenders.length}</span> {t('of')}{' '}
            <span className="font-semibold">{getAllTenders().length}</span> {t('tenders')}
          </div>
        </div>

        {/* Tenders Table */}
        {allTenders.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    <button
                      onClick={() => handleSort('workOrderControlNumber')}
                      className="hover:text-blue-600 transition flex items-center"
                    >
                      {t('controlNumber')}
                      {getSortIcon('workOrderControlNumber')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    <button
                      onClick={() => handleSort('companyName')}
                      className="hover:text-blue-600 transition flex items-center"
                    >
                      {t('company')}
                      {getSortIcon('companyName')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    <button
                      onClick={() => handleSort('fee')}
                      className="hover:text-blue-600 transition flex items-center"
                    >
                      {t('tenderingFee')}
                      {getSortIcon('fee')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    <button
                      onClick={() => handleSort('submissionDate')}
                      className="hover:text-blue-600 transition flex items-center"
                    >
                      {t('submissionDate')}
                      {getSortIcon('submissionDate')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    {t('tenderStatus')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allTenders.map((tender) => (
                  <tr key={tender.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <Link
                        href={`/work-orders/${tender.workOrderId}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        {tender.workOrderControlNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/tendering/${tender.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {tender.company?.name || `Company ${tender.companyId}`}
                      </Link>
                      <p className="text-xs text-gray-600">
                        {tender.company?.contactPerson?.name || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">HKD ${tender.fee.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800">{tender.submissionDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          tender.awarded
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {tender.awarded ? t('awardTender') : t('pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Link
                        href={`/tendering/${tender.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                      >
                        {t('viewDetails') || 'View'} →
                      </Link>
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(tender)}
                            className="text-orange-600 hover:text-orange-800 font-semibold text-sm flex items-center gap-1"
                            title="Edit tender"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTender(tender.id, tender.workOrderId)}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm flex items-center gap-1"
                            title="Delete tender"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">{t('noTenders')}</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingTender ? 'Edit Tender' : 'Create New Tender'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber || ''}
                  onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., REG-001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contactName || ''}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.contactPhone || ''}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="email address"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Fee (HKD) *
                  </label>
                  <input
                    type="number"
                    value={formData.fee || ''}
                    onChange={(e) => setFormData({...formData, fee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Submission Date *
                  </label>
                  <input
                    type="date"
                    value={formData.submissionDate || ''}
                    onChange={(e) => setFormData({...formData, submissionDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveTender}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {editingTender ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
