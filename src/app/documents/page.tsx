'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockDocuments, mockProperties, mockMaintenanceRequests, mockWorkOrders } from '@/lib/mockData';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Trash2 } from 'lucide-react';

export default function DocumentsPage() {
  const { t } = useI18n();
  const [documents, setDocuments] = useState(mockDocuments);
  const [fileName, setFileName] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedMaintenance, setSelectedMaintenance] = useState('');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState('');

  // Fetch maintenance requests from both mockData and localStorage
  const getAllMaintenanceRequests = () => {
    const saved = localStorage.getItem('maintenanceRequests');
    const local = saved ? JSON.parse(saved) : [];
    const merged = [...mockMaintenanceRequests];
    local.forEach((m: any) => {
      const index = merged.findIndex(item => item.id === m.id);
      if (index >= 0) {
        merged[index] = m;
      } else {
        merged.push(m);
      }
    });
    return merged;
  };

  // Fetch work orders from both mockData and localStorage
  const getAllWorkOrders = () => {
    const saved = localStorage.getItem('workOrders');
    const local = saved ? JSON.parse(saved) : [];
    const merged = [...mockWorkOrders];
    local.forEach((w: any) => {
      const index = merged.findIndex(item => item.id === w.id);
      if (index >= 0) {
        merged[index] = w;
      } else {
        merged.push(w);
      }
    });
    return merged;
  };

  // Load documents from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('documents');
    if (saved) {
      try {
        const localDocs = JSON.parse(saved);
        const merged = [...mockDocuments];
        localDocs.forEach((doc: any) => {
          const index = merged.findIndex(d => d.id === doc.id);
          if (index >= 0) {
            merged[index] = doc;
          } else {
            merged.push(doc);
          }
        });
        setDocuments(merged);
      } catch (e) {
        console.error('Error loading documents from localStorage:', e);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!fileName) {
      alert('Please select a file');
      return;
    }

    // Mock file upload - in production, would upload to S3
    const newDoc: any = {
      id: `doc-${Date.now()}`,
      name: fileName,
      size: Math.floor(Math.random() * 5000000) + 100000,
      type: fileName.split('.').pop() || 'unknown',
      uploadDate: new Date().toISOString().split('T')[0],
    };

    // Add optional relationships
    if (selectedProperty) newDoc.propertyId = selectedProperty;
    if (selectedMaintenance) newDoc.maintenanceId = selectedMaintenance;
    if (selectedWorkOrder) newDoc.workOrderId = selectedWorkOrder;

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);

    // Save to localStorage
    localStorage.setItem('documents', JSON.stringify(updatedDocs));

    // Reset form
    setFileName('');
    setSelectedProperty('');
    setSelectedMaintenance('');
    setSelectedWorkOrder('');
    (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
  };

  const handleDelete = (docId: string) => {
    setDocuments(documents.filter((d) => d.id !== docId));
  };

  const handleDownloadDocument = (doc: any) => {
    if (doc.base64Content) {
      // If document has base64 content, download from that
      const link = document.createElement('a');
      link.href = doc.base64Content;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For mock documents without content, show a message
      alert(`Download support for ${doc.name} would be implemented in production with actual file storage.`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('documents')}</h1>
          <p className="text-gray-600 mt-1">Upload and manage documents for properties and work orders</p>
          <p className="text-xs text-gray-500 mt-2">// TODO: antivirus scan for production deployment</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('uploadDocument')}</h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8">
              <input
                type="file"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-2">
                Supported formats: PDF, DOCX, XLSX, JPG, PNG, and other common document types
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Link to Property (Optional)</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">None</option>
                  {mockProperties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Link to Maintenance Request (Optional)</label>
                <select
                  value={selectedMaintenance}
                  onChange={(e) => setSelectedMaintenance(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">None</option>
                  {getAllMaintenanceRequests().map((mr) => (
                    <option key={mr.id} value={mr.id}>
                      {mr.title} ({mr.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Link to Work Order (Optional)</label>
                <select
                  value={selectedWorkOrder}
                  onChange={(e) => setSelectedWorkOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">None</option>
                  {getAllWorkOrders().map((wo) => (
                    <option key={wo.id} value={wo.id}>
                      {wo.controlNumber} ({wo.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {fileName && <p className="text-sm text-gray-600">Selected: {fileName}</p>}

            <button
              onClick={handleUpload}
              disabled={!fileName}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('uploadDocument')}
            </button>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('fileName')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('fileSize')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('fileType')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Relationships</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('uploadDate')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No documents uploaded yet.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc: any) => {
                    const property = mockProperties.find((p) => p.id === doc.propertyId);
                    const maintenance = getAllMaintenanceRequests().find((m) => m.id === doc.maintenanceId);
                    const workOrder = getAllWorkOrders().find((w) => w.id === doc.workOrderId);
                    return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{doc.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{formatFileSize(doc.size)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          {property && (
                            <div className="text-xs">
                              <span className="font-semibold text-gray-600">Property:</span>{' '}
                              <Link
                                href={`/properties/${property.id}`}
                                className="text-blue-600 hover:underline hover:text-blue-800"
                              >
                                {property.address}
                              </Link>
                            </div>
                          )}
                          {maintenance && (
                            <div className="text-xs">
                              <span className="font-semibold text-gray-600">Maintenance:</span>{' '}
                              <Link
                                href={`/maintenance/${maintenance.id}`}
                                className="text-blue-600 hover:underline hover:text-blue-800"
                              >
                                {maintenance.title}
                              </Link>
                            </div>
                          )}
                          {workOrder && (
                            <div className="text-xs">
                              <span className="font-semibold text-gray-600">Work Order:</span>{' '}
                              <Link
                                href={`/work-orders/${workOrder.id}`}
                                className="text-blue-600 hover:underline hover:text-blue-800"
                              >
                                {workOrder.controlNumber}
                              </Link>
                            </div>
                          )}
                          {!property && !maintenance && !workOrder && (
                            <span className="text-xs text-gray-400">No relationships</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{doc.uploadDate}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadDocument(doc)}
                            className="text-blue-600 hover:text-blue-800 transition p-1"
                            title={t('download')}
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-600 hover:text-red-800 transition p-1"
                            title={t('delete')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Total documents: {documents.length}
        </p>
      </div>
    </div>
  );
}
