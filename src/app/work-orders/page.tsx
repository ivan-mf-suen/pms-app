'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockWorkOrders, mockProperties } from '@/lib/mockData';
import { exportToExcel, generateCSV, ExportColumn } from '@/lib/exportUtils';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function WorkOrdersPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCost, setFilterCost] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
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

  if (filterPriority !== 'all') {
    filtered = filtered.filter((wo) => wo.priority === filterPriority);
  }

  if (filterCost !== 'all') {
    const cumulative = (wo: any) => wo.financials.original + wo.financials.voApproved + wo.financials.contingency;
    if (filterCost === 'under50k') {
      filtered = filtered.filter((wo) => cumulative(wo) < 50000);
    } else if (filterCost === '50k-100k') {
      filtered = filtered.filter((wo) => {
        const cum = cumulative(wo);
        return cum >= 50000 && cum < 100000;
      });
    } else if (filterCost === 'over100k') {
      filtered = filtered.filter((wo) => cumulative(wo) >= 100000);
    }
  }

  // Search filter
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((wo) => {
      const property = mockProperties.find((p) => p.id === wo.propertyId);
      return (
        wo.controlNumber.toLowerCase().includes(query) ||
        (property?.address.toLowerCase().includes(query) || false) ||
        wo.description?.toLowerCase().includes(query)
      );
    });
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

  // Export function
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('workOrders')}</h1>
            <p className="text-gray-600 mt-1">{t('workOrdersDescription')}</p>
          </div>
          <div className="flex items-center gap-3">
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <>
                <Link
                  href="/tendering"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                  title="View tendering management"
                >
                  {t('tendering')} 📋
                </Link>
                <Link
                  href="/work-orders/create"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                  title="Create new work order"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Export */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t('workOrderStatus')}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('all')} {t('workOrders')}</option>
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
                <option value="all">{t('all')} {t('properties')}</option>
                {mockProperties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t('priority')}
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('all')} {t('priority')}</option>
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
                <option value="urgent">{t('urgent')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t('cost')}
              </label>
              <select
                value={filterCost}
                onChange={(e) => setFilterCost(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('all')} {t('cost')}</option>
                <option value="under50k">{t('cost_under50k')}</option>
                <option value="50k-100k">{t('cost_50k_100k')}</option>
                <option value="over100k">{t('cost_over100k')}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExportExcel}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {t('exportToExcel')}
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {t('search')}
            </label>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <p className="text-sm text-gray-600">
            {filtered.reduce((acc, wo) => (wo.status === 'open' ? acc + 1 : acc), 0)} {t('open')} • 
            {' '}
            {filtered.reduce((acc, wo) => (wo.status === 'in_progress' ? acc + 1 : acc), 0)} {t('inProgress')} • 
            {' '}
            {filtered.reduce((acc, wo) => (wo.status === 'completed' ? acc + 1 : acc), 0)} {t('completed')}
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
                            {wo.status === 'open' && t('open')}
                            {wo.status === 'in_progress' && t('inProgress')}
                            {wo.status === 'on_hold' && t('onHold')}
                            {wo.status === 'completed' && t('completed')}
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
                            {wo.priority === 'urgent' && t('urgent')}
                            {wo.priority === 'high' && t('high')}
                            {wo.priority === 'medium' && t('medium')}
                            {wo.priority === 'low' && t('low')}
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
                            {t('viewDetails')}
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
