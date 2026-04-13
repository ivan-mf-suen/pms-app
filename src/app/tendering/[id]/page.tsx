'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockWorkOrders } from '@/lib/mockData';
import Link from 'next/link';
import { useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Edit2, Trash2 } from 'lucide-react';

export default function TenderDetailPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Find tender from work orders
  const getTender = () => {
    for (const wo of mockWorkOrders) {
      if (wo.tenders) {
        const foundTender = wo.tenders.find((t: any) => t.id === id);
        if (foundTender) {
          return {
            ...foundTender,
            workOrderId: wo.id,
            workOrderControlNumber: wo.controlNumber,
            workOrderDescription: wo.description,
          };
        }
      }
    }
    return null;
  };

  const tender = getTender();

  if (!tender) {
    return notFound();
  }

  const companyName = tender.company?.name || `Company ${tender.companyId}`;
  const contactPerson = tender.company?.contactPerson;

  const handleOpenEditModal = () => {
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

  const handleDeleteTender = () => {
    if (!confirm(t('confirmDelete'))) return;
    
    const saved = localStorage.getItem('workOrders');
    const savedWOs = saved ? JSON.parse(saved) : [];
    
    const woIndex = savedWOs.findIndex((wo: any) => wo.id === tender.workOrderId);
    if (woIndex >= 0) {
      savedWOs[woIndex].tenders = savedWOs[woIndex].tenders.filter((t: any) => t.id !== id);
      localStorage.setItem('workOrders', JSON.stringify(savedWOs));
    }
    
    router.push('/tendering');
  };

  const handleSaveTender = () => {
    if (!formData.companyName || !formData.fee || !formData.submissionDate) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedTender = {
      ...tender,
      company: {
        ...tender.company,
        name: formData.companyName,
        registrationNumber: formData.registrationNumber,
        licenseInfo: formData.registrationNumber ? `License: ${formData.registrationNumber}` : '',
        contactPerson: {
          ...tender.company.contactPerson,
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail,
        },
      },
      fee: parseFloat(formData.fee),
      submissionDate: formData.submissionDate,
      deadline: formData.deadline,
    };

    const saved = localStorage.getItem('workOrders');
    const savedWOs = saved ? JSON.parse(saved) : [];
    
    const woIndex = savedWOs.findIndex((wo: any) => wo.id === tender.workOrderId);
    if (woIndex >= 0) {
      const tenderIndex = savedWOs[woIndex].tenders.findIndex((t: any) => t.id === id);
      if (tenderIndex >= 0) {
        savedWOs[woIndex].tenders[tenderIndex] = updatedTender;
        localStorage.setItem('workOrders', JSON.stringify(savedWOs));
      }
    }
    
    setShowModal(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/tendering" className="text-blue-600 hover:underline mb-4 block">
            ← {t('back')}
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{companyName}</h1>
              <p className="text-gray-600 mt-2">{t('workOrder')}: {tender.workOrderControlNumber}</p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                  tender.awarded
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {tender.awarded ? t('awardTender') : t('pending')}
              </span>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenEditModal}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition font-semibold text-sm"
                    title="Edit tender"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteTender}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold text-sm"
                    title="Delete tender"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
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
            {/* Company Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('basicInformation')}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">{t('companyName')}</p>
                  <p className="text-gray-800 font-semibold">{companyName}</p>
                </div>
                {tender.company?.registrationNumber && (
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">{t('registrationNumber')}</p>
                    <p className="text-gray-800">{tender.company.registrationNumber}</p>
                  </div>
                )}
                {tender.company?.licenseInfo && (
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">{t('licenseInfo')}</p>
                    <p className="text-gray-800">{tender.company.licenseInfo}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            {contactPerson && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('contactPerson')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">{t('contactName')}</p>
                    <p className="text-gray-800">{contactPerson.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">{t('contactPhone')}</p>
                    <p className="text-gray-800">{contactPerson.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">{t('contactEmail')}</p>
                    <p className="text-gray-800">{contactPerson.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">{t('companyAddress')}</p>
                    <p className="text-gray-800">{contactPerson.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tender Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('tenderDetails')}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">{t('tenderingFee')}</p>
                    <p className="text-2xl font-bold text-gray-900">HKD ${tender.fee.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">{t('submissionDate')}</p>
                    <p className="text-gray-800 font-semibold">{tender.submissionDate}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">{t('tenderDeadline')}</p>
                    <p className="text-gray-800">{tender.deadline}</p>
                  </div>
                  {tender.awardedDate && (
                    <div>
                      <p className="text-gray-600 text-sm font-semibold mb-1">{t('awardedDate')}</p>
                      <p className="text-green-700 font-semibold">{tender.awardedDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Remarks */}
            {tender.remarks && tender.remarks.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('remarks')}</h2>
                <div className="space-y-3">
                  {tender.remarks.map((remark: any) => (
                    <div key={remark.id} className="border border-gray-200 rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-800 text-sm">
                          {remark.username || remark.author}
                        </p>
                        <p className="text-xs text-gray-600">{remark.timestamp}</p>
                      </div>
                      <p className="text-gray-700 text-sm">{remark.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Order Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">{t('linkedWorkOrder')}</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-700 font-semibold">{tender.workOrderControlNumber}</p>
                  <p className="text-sm text-blue-600 mt-1">{tender.workOrderDescription}</p>
                </div>
                <Link
                  href={`/work-orders/${tender.workOrderId}`}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm whitespace-nowrap"
                >
                  {t('viewDetails')} →
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('tenderStatus')}</h2>
              <div
                className={`px-4 py-4 rounded-lg border-2 ${
                  tender.awarded
                    ? 'bg-green-50 border-green-300'
                    : 'bg-yellow-50 border-yellow-300'
                }`}
              >
                <p
                  className={`text-sm font-semibold mb-2 ${
                    tender.awarded ? 'text-green-700' : 'text-yellow-700'
                  }`}
                >
                  {tender.awarded ? t('awardTender') : t('pending')}
                </p>
                {tender.awarded && (
                  <p className="text-xs text-green-600">
                    {t('awardedDate')}: {tender.awardedDate}
                  </p>
                )}
              </div>
            </div>

            {/* Key Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('keyInformation')}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase mb-1">
                    {t('workOrderControlNumber')}
                  </p>
                  <p className="text-gray-800 font-semibold">{tender.workOrderControlNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase mb-1">
                    {t('tenderingFee')}
                  </p>
                  <p className="text-lg font-bold text-gray-900">HKD ${tender.fee.toLocaleString()}</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-gray-600 text-xs font-semibold uppercase mb-1">
                    {t('submissionDate')}
                  </p>
                  <p className="text-gray-800">{tender.submissionDate}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase mb-1">
                    {t('tenderDeadline')}
                  </p>
                  <p className="text-gray-800">{tender.deadline}</p>
                </div>
              </div>
            </div>

            {/* Audit Log */}
            {tender.auditLog && tender.auditLog.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('auditLog')}</h2>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {tender.auditLog.map((entry: any) => (
                    <div key={entry.id} className="border border-gray-200 rounded p-3 bg-gray-50 text-xs">
                      <div className="flex justify-between mb-1">
                        <p className="font-semibold text-gray-800 capitalize">{entry.action}</p>
                        <p className="text-gray-600">{entry.timestamp}</p>
                      </div>
                      <p className="text-gray-700">{entry.username || entry.actor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Tender</h2>
            
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
                Update
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
