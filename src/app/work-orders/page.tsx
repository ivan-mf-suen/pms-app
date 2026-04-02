'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockWorkOrders, mockProperties } from '@/lib/mockData';
import { exportToExcel, downloadCSV, generateCSV, ExportColumn } from '@/lib/exportUtils';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export default function WorkOrdersPage() {
  const { t } = useI18n();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'createdDate',
    direction: 'desc',
  });

  // Merge mockData with localStorage work orders
  const getAllWorkOrders = () => {
    const savedWOs = localStorage.getItem('workOrders');
    const localWOs = savedWOs ? JSON.parse(savedWOs) : [];
    
    // Merge and deduplicate: localStorage items are newer, so use them if they exist
    const merged = [...mockWorkOrders];
    const mergedIds = new Set(merged.map(wo => wo.id));
    
    localWOs.forEach((wo: any) => {
      const index = merged.findIndex(m => m.id === wo.id);
      if (index >= 0) {
        // Update existing with localStorage version (newer)
        merged[index] = wo;
      } else {
        // Add new work orders from localStorage
        merged.push(wo);
      }
    });
    
    return merged;
  };

  // Calculate cumulative and check threshold
  const getCumulativeAndThreshold = (wo: any) => {
    const cumulative =
      wo.financials.original + wo.financials.voApproved + wo.financials.contingency;
    const threshold = wo.financials.original + wo.financials.contingency;
    const exceedsThreshold = cumulative > threshold;
    return { cumulative, threshold, exceedsThreshold };
  };

  // Sort function handler
  const handleSort = (column: string) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Get sort icon for column
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

  // Filter work orders
  let filtered = getAllWorkOrders();

  if (filterStatus !== 'all') {
    filtered = filtered.filter((wo) => wo.status === filterStatus);
  }

  if (filterProperty !== 'all') {
    filtered = filtered.filter((wo) => wo.propertyId === filterProperty);
  }

  // Sort work orders
  const sortedFiltered = [...filtered].sort((a, b) => {
    const { column, direction } = sortConfig;
    let aValue: any = '';
    let bValue: any = '';

    if (column === 'controlNumber') {
      aValue = a.controlNumber;
      bValue = b.controlNumber;
    } else if (column === 'properties') {
      const propA = mockProperties.find((p) => p.id === a.propertyId);
      const propB = mockProperties.find((p) => p.id === b.propertyId);
      aValue = propA?.address || '';
      bValue = propB?.address || '';
    } else if (column === 'status') {
      aValue = a.status;
      bValue = b.status;
    } else if (column === 'priority') {
      const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 };
      aValue = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 999;
      bValue = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 999;
    } else if (column === 'original') {
      aValue = a.financials.original;
      bValue = b.financials.original;
    } else if (column === 'voApproved') {
      aValue = a.financials.voApproved;
      bValue = b.financials.voApproved;
    } else if (column === 'contingency') {
      aValue = a.financials.contingency;
      bValue = b.financials.contingency;
    } else if (column === 'cumulative') {
      const aCum = a.financials.original + a.financials.voApproved + a.financials.contingency;
      const bCum = b.financials.original + b.financials.voApproved + b.financials.contingency;
      aValue = aCum;
      bValue = bCum;
    } else if (column === 'createdDate') {
      aValue = new Date(a.createdDate).getTime();
      bValue = new Date(b.createdDate).getTime();
    }

    // Compare values
    let comparison = 0;
    if (typeof aValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else {
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  // Export functions
  const handleExportExcel = async () => {
    const columns: ExportColumn[] = [
      { key: 'controlNumber', label: 'Control Number' },
      { key: 'propertyAddress', label: 'Property' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'original', label: 'Original' },
      { key: 'voApproved', label: 'VO Approved' },
      { key: 'contingency', label: 'Contingency' },
      { key: 'cumulative', label: 'Cumulative' },
      { key: 'exceedsThreshold', label: 'Exceeds Threshold' },
      { key: 'createdDate', label: 'Created Date' },
    ];

    const exportData = filtered.map((wo) => {
      const { cumulative, exceedsThreshold } = getCumulativeAndThreshold(wo);
      const property = mockProperties.find((p) => p.id === wo.propertyId);
      return {
        controlNumber: wo.controlNumber,
        propertyAddress: property?.address || wo.propertyId,
        status: wo.status,
        priority: wo.priority,
        original: wo.financials.original,
        voApproved: wo.financials.voApproved,
        contingency: wo.financials.contingency,
        cumulative,
        exceedsThreshold: exceedsThreshold ? 'YES' : 'NO',
        createdDate: wo.createdDate,
      };
    });

    await exportToExcel(exportData, columns, `work_orders_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportCSV = () => {
    const columns: ExportColumn[] = [
      { key: 'controlNumber', label: 'Control Number' },
      { key: 'propertyAddress', label: 'Property' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'original', label: 'Original' },
      { key: 'voApproved', label: 'VO Approved' },
      { key: 'contingency', label: 'Contingency' },
      { key: 'cumulative', label: 'Cumulative' },
      { key: 'exceedsThreshold', label: 'Exceeds Threshold' },
      { key: 'createdDate', label: 'Created Date' },
    ];

    const exportData = filtered.map((wo) => {
      const { cumulative, exceedsThreshold } = getCumulativeAndThreshold(wo);
      const property = mockProperties.find((p) => p.id === wo.propertyId);
      return {
        controlNumber: wo.controlNumber,
        propertyAddress: property?.address || wo.propertyId,
        status: wo.status,
        priority: wo.priority,
        original: wo.financials.original,
        voApproved: wo.financials.voApproved,
        contingency: wo.financials.contingency,
        cumulative,
        exceedsThreshold: exceedsThreshold ? 'YES' : 'NO',
        createdDate: wo.createdDate,
      };
    });

    const csv = generateCSV(exportData, columns);
    downloadCSV(csv, `work_orders_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('workOrders')}</h1>
          <p className="text-gray-600 mt-1">Track and manage all work orders with auto-generated control numbers</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Export */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t('workOrderStatus')}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Work Orders</option>
                <option value="open">{t('open')}</option>
                <option value="in_progress">{t('inProgress')}</option>
                <option value="on_hold">{t('onHold')}</option>
                <option value="completed">{t('completed')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t('properties')}
              </label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Properties</option>
                {mockProperties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.address}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleExportExcel}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {t('exportToExcel')}
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {t('exportToCSV')}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            {filtered.reduce((acc, wo) => (wo.status === 'open' ? acc + 1 : acc), 0)} Open • 
            {' '}
            {filtered.reduce((acc, wo) => (wo.status === 'in_progress' ? acc + 1 : acc), 0)} In Progress • 
            {' '}
            {filtered.reduce((acc, wo) => (wo.status === 'completed' ? acc + 1 : acc), 0)} Completed
          </p>
        </div>

        {/* Work Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th 
                    onClick={() => handleSort('controlNumber')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                  >
                    {t('controlNumber')}{getSortIcon('controlNumber')}
                  </th>
                  <th 
                    onClick={() => handleSort('properties')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                  >
                    {t('properties')}{getSortIcon('properties')}
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                  >
                    {t('workOrderStatus')}{getSortIcon('status')}
                  </th>
                  <th 
                    onClick={() => handleSort('priority')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                  >
                    {t('priority')}{getSortIcon('priority')}
                  </th>
                  <th 
                    onClick={() => handleSort('cumulative')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                  >
                    {t('cumulative')}{getSortIcon('cumulative')}
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                  >
                    {t('Threshold')}{getSortIcon('status')}
                  </th>
                  <th 
                    onClick={() => handleSort('createdDate')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                  >
                    {t('createdDate')}{getSortIcon('createdDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No work orders found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  sortedFiltered.map((wo) => {
                    const property = mockProperties.find((p) => p.id === wo.propertyId);
                    const { cumulative, exceedsThreshold } = getCumulativeAndThreshold(wo);

                    return (
                      <tr key={wo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">{wo.controlNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{property?.address || wo.propertyId}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              wo.status === 'open'
                                ? 'bg-gray-100 text-gray-800'
                                : wo.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : wo.status === 'on_hold'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {wo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              wo.priority === 'urgent'
                                ? 'bg-red-100 text-red-800'
                                : wo.priority === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : wo.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {wo.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">${cumulative.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">
                          {exceedsThreshold ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                              {t('exceedsThreshold')}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                              {t('withinThreshold')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">{wo.createdDate}</td>
                        <td className="px-6 py-4 text-sm">
                          <Link
                            href={`/work-orders/${wo.id}`}
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
