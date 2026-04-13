'use client';

import React, { useState, useRef } from 'react';
import { TenderDocument } from '@/lib/mockData';
import { getTranslation, Language } from '@/lib/i18n';
import { Upload, Trash2, File } from 'lucide-react';

interface DocumentUploadProps {
  documents: TenderDocument[];
  language: Language;
  onDocumentsChange: (documents: TenderDocument[]) => void;
  disabled?: boolean;
}

export default function DocumentUpload({
  documents,
  language,
  onDocumentsChange,
  disabled = false,
}: DocumentUploadProps) {
  const t = (key: string) => getTranslation(language, key);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newDocs: TenderDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newDocs.push({
        id: `doc-${Date.now()}-${i}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        uploadDate: new Date().toISOString().split('T')[0],
        documentPath: URL.createObjectURL(file),
      });
    }

    onDocumentsChange([...documents, ...newDocs]);
  };

  const handleDelete = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!disabled && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
            accept="*/*"
          />

          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">{t('uploadDocuments')}</p>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'zh-Hant'
              ? '或將文件拖放到此'
              : 'or drag and drop files here'}
          </p>
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{t('tenderDocuments')}</h4>
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1">
                  <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.fileSize)} • {doc.uploadDate}
                    </p>
                  </div>
                </div>
                {!disabled && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                    title={t('deleteFile')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-500">{t('noDocumentsUploaded')}</p>
      )}
    </div>
  );
}
