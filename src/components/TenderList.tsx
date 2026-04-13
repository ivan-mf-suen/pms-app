'use client';

import React, { useState } from 'react';
import { Tender } from '@/lib/mockData';
import { getTranslation, Language } from '@/lib/i18n';
import { ChevronUp, ChevronDown, ChevronsUpDown, Edit2, Trash2, Eye, Plus, Award } from 'lucide-react';

interface TenderListProps {
  workOrderId: string;
  tenders: Tender[];
  language: Language;
  onAddClick: () => void;
  onEditClick: (tender: Tender) => void;
  onDeleteClick: (tender: Tender) => void;
  onDetailClick: (tender: Tender) => void;
  onAwardClick: (tender: Tender) => void;
}

export default function TenderList({
  workOrderId,
  tenders,
  language,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onDetailClick,
  onAwardClick,
}: TenderListProps) {
  const t = (key: string) => getTranslation(language, key);
  
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'submissionDate',
    direction: 'desc',
  });

  const handleSort = (column: string) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedTenders = [...tenders].sort((a, b) => {
    let aVal: any = a[sortConfig.column as keyof Tender];
    let bVal: any = b[sortConfig.column as keyof Tender];

    // Handle company name specially
    if (sortConfig.column === 'company') {
      aVal = a.company?.name || '';
      bVal = b.company?.name || '';
    }

    if (typeof aVal === 'string') {
      return sortConfig.direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  const getSortIcon = (column: string) => {
    if (sortConfig.column !== column) return <ChevronsUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (tenders.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">{t('noRelatedTenders')}</p>
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {t('addTender')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={onAddClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {t('addTender')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('company')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  {t('tableHeaderCompany')}
                  {getSortIcon('company')}
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort('fee')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 ml-auto"
                >
                  {t('tableHeaderFee')}
                  {getSortIcon('fee')}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('awarded')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  {t('tableHeaderStatus')}
                  {getSortIcon('awarded')}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('submissionDate')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  {t('tableHeaderSubmitted')}
                  {getSortIcon('submissionDate')}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('deadline')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  {t('tableHeaderDeadline')}
                  {getSortIcon('deadline')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('tableHeaderActions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedTenders.map((tender) => (
              <tr key={tender.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{tender.company?.name}</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  HK${tender.fee.toLocaleString('en-US')}
                </td>
                <td className="px-4 py-3">
                  {tender.awarded ? (
                    <div className="space-y-1">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {t('awarded')}
                      </span>
                      {tender.controlNumber && (
                        <div className="text-xs text-gray-600 mt-1">{tender.controlNumber}</div>
                      )}
                    </div>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {t('pending')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">{tender.submissionDate}</td>
                <td className="px-4 py-3 text-gray-700">{tender.deadline}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDetailClick(tender)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title={t('viewDetails')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!tender.awarded && (
                      <>
                        <button
                          onClick={() => onEditClick(tender)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          title={t('editTender')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(tender)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title={t('deleteTender')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onAwardClick(tender)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title={t('awardTender')}
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
