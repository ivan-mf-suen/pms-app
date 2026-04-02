'use client';

import { MaintenanceRequest } from '@/lib/mockData';
import { useState, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { X } from 'lucide-react';

interface MaintenanceEditModalProps {
  isOpen: boolean;
  maintenance: MaintenanceRequest;
  onSave: (updated: MaintenanceRequest) => void;
  onClose: () => void;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  base64Content: string;
}

export default function MaintenanceEditModal({
  isOpen,
  maintenance,
  onSave,
  onClose,
}: MaintenanceEditModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState(maintenance);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>(
    (maintenance as any).attachedFiles || []
  );
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    field: keyof MaintenanceRequest,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploadError('');
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > maxFileSize) {
        setUploadError(
          `${file.name} ${t('error')}: ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds 5MB limit`
        );
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Content = e.target?.result as string;
        const newFile: AttachedFile = {
          id: Date.now().toString() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date().toISOString(),
          base64Content,
        };
        setAttachedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSave = () => {
    const updated = {
      ...formData,
      attachedFiles,
    } as MaintenanceRequest & { attachedFiles: AttachedFile[] };
    onSave(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('edit')} {t('document')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('title')}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('priority')}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">{t('priority_low')}</option>
                <option value="medium">{t('priority_medium')}</option>
                <option value="high">{t('priority_high')}</option>
                <option value="urgent">{t('priority_urgent')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending_approval">{t('maintenanceStatus_pending_approval')}</option>
                <option value="approved">{t('maintenanceStatus_approved')}</option>
                <option value="open">{t('maintenanceStatus_open')}</option>
                <option value="in_progress">{t('maintenanceStatus_in_progress')}</option>
                <option value="completed">{t('maintenanceStatus_completed')}</option>
                <option value="canceled">{t('maintenanceStatus_canceled')}</option>
              </select>
            </div>
          </div>

          {/* Estimated Cost */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('estimatedCost')}
            </label>
            <input
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* File Upload Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('attachedFiles')}</h3>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {uploadError}
              </div>
            )}

            {/* Upload Button */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                + {t('uploadFiles')}
              </button>
            </div>

            {/* File List */}
            {attachedFiles.length > 0 ? (
              <div className="space-y-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-600">
                        {(file.size / 1024).toFixed(2)} KB • {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('noFilesAttached')}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t p-6 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
