'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockWorkOrders, mockProperties, mockInventory, mockPayments } from '@/lib/mockData';
import { exportToExcel, downloadCSV, generateCSV, ExportColumn } from '@/lib/exportUtils';
import { useState } from 'react';

export default function ReportsPage() {
  const { t } = useI18n();
  const [activeReport, setActiveReport] = useState<'workorders' | 'properties' | 'inventory'>(
    'workorders'
  );

  // Work Order Status Report
  const workOrderStats = {
    open: mockWorkOrders.filter((wo) => wo.status === 'open').length,
    inProgress: mockWorkOrders.filter((wo) => wo.status === 'in_progress').length,
    completed: mockWorkOrders.filter((wo) => wo.status === 'completed').length,
    onHold: mockWorkOrders.filter((wo) => wo.status === 'on_hold').length,
    total: mockWorkOrders.length,
  };

  const totalWorkOrderCost = mockWorkOrders.reduce((sum, wo) => {
    return (
      sum + (wo.financials.original + wo.financials.voApproved + wo.financials.contingency)
    );
  }, 0);

  // Property Condition Report
  const propertyStats = {
    total: mockProperties.length,
    occupied: mockProperties.filter((p) => p.status === 'occupied').length,
    available: mockProperties.filter((p) => p.status === 'available').length,
    maintenance: mockProperties.filter((p) => p.status === 'maintenance').length,
    vacant: mockProperties.filter((p) => p.status === 'vacant').length,
  };

  const totalPropertyValue = mockProperties.reduce((sum, p) => sum + p.currentValue, 0);
  const avgPropertyValue = totalPropertyValue / mockProperties.length;

  // Inventory Report
  const expiredWarranty = mockInventory.filter((inv) => {
    const today = new Date();
    return new Date(inv.warrantyEnd) < today;
  }).length;

  const expiringWarranty = mockInventory.filter((inv) => {
    const today = new Date();
    const warranty = new Date(inv.warrantyEnd);
    const diffTime = warranty.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 90;
  }).length;

  // Export functions
  const handleExportWorkOrders = async () => {
    const columns: ExportColumn[] = [
      { key: 'controlNumber', label: 'Control Number' },
      { key: 'status', label: 'Status' },
      { key: 'cumulative', label: 'Cumulative Cost' },
      { key: 'exceedsThreshold', label: 'Exceeds Threshold' },
      { key: 'createdDate', label: 'Created Date' },
    ];

    const exportData = mockWorkOrders.map((wo) => ({
      controlNumber: wo.controlNumber,
      status: wo.status,
      cumulative: wo.financials.original + wo.financials.voApproved + wo.financials.contingency,
      exceedsThreshold:
        wo.financials.original + wo.financials.voApproved + wo.financials.contingency >
        wo.financials.original + wo.financials.contingency
          ? 'YES'
          : 'NO',
      createdDate: wo.createdDate,
    }));

    await exportToExcel(exportData, columns, `work_order_status_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportProperties = async () => {
    const columns: ExportColumn[] = [
      { key: 'address', label: 'Address' },
      { key: 'type', label: 'Property Type' },
      { key: 'status', label: 'Status' },
      { key: 'currentValue', label: 'Current Value' },
    ];

    await exportToExcel(mockProperties, columns, `property_condition_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportInventory = async () => {
    const columns: ExportColumn[] = [
      { key: 'brand', label: 'Brand' },
      { key: 'model', label: 'Model' },
      { key: 'type', label: 'Type' },
      { key: 'location', label: 'Location' },
      { key: 'warrantyEnd', label: 'Warranty End' },
      { key: 'status', label: 'Status' },
    ];

    await exportToExcel(mockInventory, columns, `inventory_report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('reportsTitle')}</h1>
          <p className="text-gray-600 mt-1">View and export system reports</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Report Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveReport('workorders')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeReport === 'workorders'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-50 border'
            }`}
          >
            Work Order Status
          </button>
          <button
            onClick={() => setActiveReport('properties')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeReport === 'properties'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-50 border'
            }`}
          >
            Property Condition
          </button>
          <button
            onClick={() => setActiveReport('inventory')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeReport === 'inventory'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-50 border'
            }`}
          >
            Asset Inventory
          </button>
        </div>

        {/* Work Order Status Report */}
        {activeReport === 'workorders' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-3xl font-bold text-gray-800">{workOrderStats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Open</p>
                <p className="text-3xl font-bold text-gray-800">{workOrderStats.open}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{workOrderStats.inProgress}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">On Hold</p>
                <p className="text-3xl font-bold text-yellow-600">{workOrderStats.onHold}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{workOrderStats.completed}</p>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Work Order Costs (Cumulative)</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">${totalWorkOrderCost.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">
                Average per work order: ${(totalWorkOrderCost / mockWorkOrders.length).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportWorkOrders}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              {t('exportToExcel')}
            </button>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Control #</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Original</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Cumulative</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Exceeds Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockWorkOrders.map((wo) => {
                    const cumulative =
                      wo.financials.original + wo.financials.voApproved + wo.financials.contingency;
                    const threshold = wo.financials.original + wo.financials.contingency;
                    return (
                      <tr key={wo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-blue-600">{wo.controlNumber}</td>
                        <td className="px-6 py-4">{wo.status}</td>
                        <td className="px-6 py-4">${wo.financials.original.toLocaleString()}</td>
                        <td className="px-6 py-4 font-semibold">${cumulative.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              cumulative > threshold
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {cumulative > threshold ? 'YES' : 'NO'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Property Condition Report */}
        {activeReport === 'properties' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-3xl font-bold text-gray-800">{propertyStats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Occupied</p>
                <p className="text-3xl font-bold text-green-600">{propertyStats.occupied}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Available</p>
                <p className="text-3xl font-bold text-blue-600">{propertyStats.available}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Maintenance</p>
                <p className="text-3xl font-bold text-yellow-600">{propertyStats.maintenance}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Vacant</p>
                <p className="text-3xl font-bold text-red-600">{propertyStats.vacant}</p>
              </div>
            </div>

            {/* Value Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Portfolio Value</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">${totalPropertyValue.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">
                Average property value: ${avgPropertyValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportProperties}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              {t('exportToExcel')}
            </button>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Address</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Type</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Current Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockProperties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{prop.address}</td>
                      <td className="px-6 py-4 capitalize">{prop.type}</td>
                      <td className="px-6 py-4 capitalize">{prop.status}</td>
                      <td className="px-6 py-4 font-semibold">${prop.currentValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Asset Inventory Report */}
        {activeReport === 'inventory' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Assets</p>
                <p className="text-3xl font-bold text-gray-800">{mockInventory.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Active Warranty</p>
                <p className="text-3xl font-bold text-green-600">
                  {mockInventory.length - expiredWarranty - expiringWarranty}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Expiring (≤90d)</p>
                <p className="text-3xl font-bold text-yellow-600">{expiringWarranty}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Expired</p>
                <p className="text-3xl font-bold text-red-600">{expiredWarranty}</p>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportInventory}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              {t('exportToExcel')}
            </button>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Brand</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Model</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Type</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Warranty End</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockInventory.map((inv) => {
                    const today = new Date();
                    const warranty = new Date(inv.warrantyEnd);
                    const diffTime = warranty.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isExpired = diffDays < 0;
                    const isExpiring = diffDays >= 0 && diffDays <= 90;

                    return (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{inv.brand}</td>
                        <td className="px-6 py-4">{inv.model}</td>
                        <td className="px-6 py-4 capitalize">{inv.type}</td>
                        <td className="px-6 py-4">{inv.warrantyEnd}</td>
                        <td className="px-6 py-4">
                          {isExpired ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                              EXPIRED
                            </span>
                          ) : isExpiring ? (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                              EXPIRING ({diffDays}d)
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                              ACTIVE
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
