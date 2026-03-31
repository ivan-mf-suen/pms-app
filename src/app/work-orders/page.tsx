'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockWorkOrders, mockProperties } from '@/lib/mockData';
import { exportToExcel, downloadCSV, generateCSV, ExportColumn } from '@/lib/exportUtils';
import Link from 'next/link';
import { useState } from 'react';

export default function WorkOrdersPage() {
  const { t } = useI18n();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProperty, setFilterProperty] = useState<string>('all');

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

  // Filter work orders
  let filtered = getAllWorkOrders();

  if (filterStatus !== 'all') {
    filtered = filtered.filter((wo) => wo.status === filterStatus);
  }

  if (filterProperty !== 'all') {
    filtered = filtered.filter((wo) => wo.propertyId === filterProperty);
  }

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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('controlNumber')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('properties')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('workOrderStatus')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('priority')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('cumulative')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('Threshold')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('createdDate')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No work orders found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((wo) => {
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
