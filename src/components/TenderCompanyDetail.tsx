'use client';

import React, { useState } from 'react';
import { Tender } from '@/lib/mockData';
import { getTranslation, Language } from '@/lib/i18n';
import { Edit2, Trash2, Award, MapPin, Phone, Mail, FileText, Calendar } from 'lucide-react';

interface TenderCompanyDetailProps {
  tender: Tender;
  language: Language;
  onAward?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewOnly?: boolean;
}

export default function TenderCompanyDetail({
  tender,
  language,
  onAward,
  onEdit,
  onDelete,
  viewOnly = false,
}: TenderCompanyDetailProps) {
  const t = (key: string) => getTranslation(language, key);
  const [expandAuditLog, setExpandAuditLog] = useState(false);

  const company = tender.company;

  if (!company) {
    return <div className="p-4 text-center text-gray-500">{t('notFound')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
          {tender.awarded && (
            <div className="mt-2 space-y-1">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {t('awarded')}
              </span>
              {tender.controlNumber && (
                <div className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">{t('controlNumber')}:</span> {tender.controlNumber}
                </div>
              )}
            </div>
          )}
        </div>

        {!viewOnly && !tender.awarded && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title={t('editTender')}
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title={t('deleteTender')}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            {onAward && (
              <button
                onClick={onAward}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                title={t('awardTender')}
              >
                <Award className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Company Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('basicInformation')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">{t('registrationNumber')}</p>
            <p className="text-gray-900 font-medium">{company.registrationNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('licenseInfo')}</p>
            <p className="text-gray-900 font-medium">{company.licenseInfo}</p>
          </div>
        </div>
      </div>

      {/* Contact Person */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('contactPerson')}</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">{t('contactName')}</p>
            <p className="text-gray-900 font-medium">{company.contactPerson.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <a href={`tel:${company.contactPerson.phone}`} className="text-blue-600 hover:underline">
              {company.contactPerson.phone}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <a href={`mailto:${company.contactPerson.email}`} className="text-blue-600 hover:underline">
              {company.contactPerson.email}
            </a>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
            <p className="text-gray-900">{company.contactPerson.address}</p>
          </div>
        </div>
      </div>

      {/* Tender Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">{t('tenderingFee')}</p>
          <p className="text-3xl font-bold text-green-600">HK${tender.fee.toLocaleString('en-US')}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">{t('submissionDate')}</p>
            <p className="font-medium text-gray-900">{tender.submissionDate}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">{t('tenderDeadline')}</p>
            <p className="font-medium text-gray-900">{tender.deadline}</p>
          </div>
        </div>
      </div>

      {tender.awardedDate && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-600">{t('awardedDate')}</p>
          </div>
          <p className="font-medium text-gray-900">{tender.awardedDate}</p>
        </div>
      )}

      {/* Documents */}
      {tender.documents && tender.documents.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t('tenderDocuments')}
          </h3>
          <ul className="space-y-2">
            {tender.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                <span className="text-gray-700">{doc.fileName}</span>
                <span className="text-xs text-gray-500">{doc.uploadDate}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Remarks */}
      {tender.remarks && tender.remarks.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('remarks')}</h3>
          <ul className="space-y-3">
            {tender.remarks.map((remark) => (
              <li key={remark.id} className="bg-white p-3 rounded border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-900">{remark.username}</span>
                  <span className="text-xs text-gray-500">{remark.timestamp}</span>
                </div>
                <p className="text-gray-700">{remark.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Audit Log */}
      {tender.auditLog && tender.auditLog.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <button
            onClick={() => setExpandAuditLog(!expandAuditLog)}
            className="w-full text-left font-semibold text-gray-900 hover:text-blue-600 flex items-center justify-between"
          >
            {t('auditLog')}
            <span className="text-sm">{expandAuditLog ? '−' : '+'}</span>
          </button>
          {expandAuditLog && (
            <ul className="mt-3 space-y-2">
              {tender.auditLog.map((entry) => (
                <li key={entry.id} className="text-sm bg-white p-2 rounded border border-gray-300">
                  <p className="text-gray-900">
                    <span className="font-medium">{entry.action}</span> {t('by')} {entry.username}
                  </p>
                  <p className="text-gray-500 text-xs">{entry.timestamp}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
