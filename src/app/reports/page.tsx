'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockWorkOrders, mockProperties, mockInventory, mockPayments } from '@/lib/mockData';
import { exportToExcel, ExportColumn } from '@/lib/exportUtils';
import { useState } from 'react';

export default function ReportsPage() {
  const { t } = useI18n();
  const [activeReport, setActiveReport] = useState<'progress' | 'funding' | 'status' | 'condition' | 'inventory'>(
    'progress'
  );

  // ==================== DATA CALCULATIONS ====================

  // Report 1: Work Progress Data
  const workProgressData = {
    total: mockWorkOrders.length,
    open: mockWorkOrders.filter((wo) => wo.status === 'open').length,
    inProgress: mockWorkOrders.filter((wo) => wo.status === 'in_progress').length,
    completed: mockWorkOrders.filter((wo) => wo.status === 'completed').length,
    onHold: mockWorkOrders.filter((wo) => wo.status === 'on_hold').length,
  };

  // Report 2: Funding Data
  const fundingData = {
    totalOriginal: mockWorkOrders.reduce((sum, wo) => sum + wo.financials.original, 0),
    totalVOApproved: mockWorkOrders.reduce((sum, wo) => sum + wo.financials.voApproved, 0),
    totalContingency: mockWorkOrders.reduce((sum, wo) => sum + wo.financials.contingency, 0),
    cumulativeTotal: mockWorkOrders.reduce((sum, wo) => sum + (wo.financials.original + wo.financials.voApproved + wo.financials.contingency), 0),
    exceedsThreshold: mockWorkOrders.filter((wo) => {
      const cumulative = wo.financials.original + wo.financials.voApproved + wo.financials.contingency;
      const threshold = wo.financials.original + wo.financials.contingency;
      return cumulative > threshold;
    }).length,
  };

  // Report 3: Work Order Status Data
  const statusData = {
    byStatus: {
      open: mockWorkOrders.filter((wo) => wo.status === 'open').length,
      inProgress: mockWorkOrders.filter((wo) => wo.status === 'in_progress').length,
      completed: mockWorkOrders.filter((wo) => wo.status === 'completed').length,
      onHold: mockWorkOrders.filter((wo) => wo.status === 'on_hold').length,
    },
  };

  // Report 4: Property Condition Data
  const propertyConditionData = {
    total: mockProperties.length,
    occupied: mockProperties.filter((p) => p.status === 'occupied').length,
    available: mockProperties.filter((p) => p.status === 'available').length,
    maintenance: mockProperties.filter((p) => p.status === 'maintenance').length,
    vacant: mockProperties.filter((p) => p.status === 'vacant').length,
    totalValue: mockProperties.reduce((sum, p) => sum + p.currentValue, 0),
  };

  // Report 5: Inventory Data
  const inventoryData = {
    totalItems: mockInventory.length,
    totalLocations: mockInventory.reduce((sum, inv) => sum + inv.locations.length, 0),
    activeItems: mockInventory.filter((inv) => inv.locations.some((loc) => loc.status === 'active')).length,
    inactiveItems: mockInventory.filter((inv) => inv.locations.some((loc) => loc.status === 'inactive')).length,
    retiredItems: mockInventory.filter((inv) => inv.locations.some((loc) => loc.status === 'retired')).length,
    expiredWarranty: mockInventory.filter((inv) => {
      const today = new Date();
      return inv.locations.some((loc) => new Date(loc.warrantyEnd) < today);
    }).length,
    expiringWarranty: mockInventory.filter((inv) => {
      const today = new Date();
      return inv.locations.some((loc) => {
        const warranty = new Date(loc.warrantyEnd);
        const diffTime = warranty.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 90;
      });
    }).length,
  };

  // ==================== EXPORT FUNCTIONS ====================
  const handleExport = async (reportType: string) => {
    try {
      let columns: ExportColumn[] = [];
      let exportData: any[] = [];

      if (reportType === 'progress') {
        columns = [
          { key: 'controlNumber', label: t('controlNumber') },
          { key: 'status', label: t('status') },
          { key: 'priority', label: t('priority') },
          { key: 'createdDate', label: t('createdDate') },
        ];
        exportData = mockWorkOrders.map((wo) => ({
          controlNumber: wo.controlNumber,
          status: wo.status,
          priority: wo.priority,
          createdDate: wo.createdDate,
        }));
      } else if (reportType === 'funding') {
        columns = [
          { key: 'controlNumber', label: t('controlNumber') },
          { key: 'original', label: t('originalBudget') },
          { key: 'voApproved', label: t('voApprovedBudget') },
          { key: 'contingency', label: t('contingencyBudget') },
          { key: 'cumulative', label: t('cumulativeSpending') },
          { key: 'exceeds', label: t('exceededThreshold') },
        ];
        exportData = mockWorkOrders.map((wo) => {
          const cumulative = wo.financials.original + wo.financials.voApproved + wo.financials.contingency;
          const threshold = wo.financials.original + wo.financials.contingency;
          return {
            controlNumber: wo.controlNumber,
            original: wo.financials.original,
            voApproved: wo.financials.voApproved,
            contingency: wo.financials.contingency,
            cumulative,
            exceeds: cumulative > threshold ? t('yes') : t('no'),
          };
        });
      } else if (reportType === 'status') {
        columns = [
          { key: 'controlNumber', label: t('controlNumber') },
          { key: 'status', label: t('status') },
          { key: 'createdDate', label: t('createdDate') },
          { key: 'completedDate', label: t('completedDate') },
        ];
        exportData = mockWorkOrders.map((wo) => ({
          controlNumber: wo.controlNumber,
          status: wo.status,
          createdDate: wo.createdDate,
          completedDate: wo.completedDate || 'N/A',
        }));
      } else if (reportType === 'condition') {
        columns = [
          { key: 'address', label: t('address') },
          { key: 'type', label: t('type') },
          { key: 'status', label: t('status') },
          { key: 'currentValue', label: t('currentValue') },
        ];
        exportData = mockProperties.map((prop) => ({
          address: prop.address,
          type: prop.type,
          status: prop.status,
          currentValue: prop.currentValue,
        }));
      } else if (reportType === 'inventory') {
        columns = [
          { key: 'brand', label: t('brand') },
          { key: 'model', label: t('model') },
          { key: 'type', label: t('type') },
          { key: 'status', label: t('status') },
          { key: 'warranty', label: t('warrantyEnd') },
        ];
        exportData = mockInventory.flatMap((item) =>
          item.locations.map((loc) => ({
            brand: item.brand,
            model: item.model,
            type: item.type,
            status: loc.status,
            warranty: loc.warrantyEnd,
          }))
        );
      }

      const timestamp = new Date().toISOString().split('T')[0];
      await exportToExcel(exportData, columns, `${reportType}_report_${timestamp}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('reportsTitle')}</h1>
          <p className="text-gray-600 mt-1">{t('allReports')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Report Navigation - 5 Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-lg shadow p-3">
          <button
            onClick={() => setActiveReport('progress')}
            className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
              activeReport === 'progress'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {t('workProgressReport')}
          </button>
          <button
            onClick={() => setActiveReport('funding')}
            className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
              activeReport === 'funding'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {t('fundingMonitoringReport')}
          </button>
          <button
            onClick={() => setActiveReport('status')}
            className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
              activeReport === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {t('workOrderStatusReport')}
          </button>
          <button
            onClick={() => setActiveReport('condition')}
            className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
              activeReport === 'condition'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {t('propertyConditionReport')}
          </button>
          <button
            onClick={() => setActiveReport('inventory')}
            className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
              activeReport === 'inventory'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {t('assetInventoryReport')}
          </button>
        </div>

        {/* Report 1: Work Progress Report */}
        {activeReport === 'progress' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t('workProgressReport')}</h2>
              <button
                onClick={() => handleExport('progress')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
              >
                {t('exportExcel')}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('total')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{workProgressData.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('workOrdersOpen')}</p>
                <p className="text-3xl font-bold text-gray-600 mt-2">{workProgressData.open}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('workOrdersInProgress')}</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{workProgressData.inProgress}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('workOrdersOnHold')}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{workProgressData.onHold}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('workOrdersCompleted')}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{workProgressData.completed}</p>
              </div>
            </div>

            {/* Details Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('controlNumber')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('status')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('priority')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('createdDate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockWorkOrders.slice(0, 10).map((wo: any) => (
                    <tr key={wo.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/work-orders/${wo.id}`}>
                      <td className="px-6 py-4 font-semibold text-blue-600">{wo.controlNumber}</td>
                      <td className="px-6 py-4 capitalize text-gray-700">{wo.status}</td>
                      <td className="px-6 py-4 capitalize text-gray-700">{wo.priority}</td>
                      <td className="px-6 py-4 text-gray-700">{wo.createdDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 2: Funding Monitoring Report */}
        {activeReport === 'funding' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t('fundingMonitoringReport')}</h2>
              <button
                onClick={() => handleExport('funding')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
              >
                {t('exportExcel')}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('originalBudget')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">${fundingData.totalOriginal.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('voApprovedBudget')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2 text-gray-700" >${fundingData.totalVOApproved.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('contingencyBudget')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2 text-gray-700">${fundingData.totalContingency.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-500">
                <p className="text-gray-600 text-sm font-semibold">{t('cumulativeSpending')}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">${fundingData.cumulativeTotal.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-lg font-bold text-gray-800 mb-2">{t('thresholdViolations')}</p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-red-600">{fundingData.exceedsThreshold}</span> {t('workOrders')} {t('exceededThreshold')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('controlNumber')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('originalBudget')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('cumulativeSpending')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('exceededThreshold')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockWorkOrders.slice(0, 10).map((wo: any) => {
                    const cumulative = wo.financials.original + wo.financials.voApproved + wo.financials.contingency;
                    const threshold = wo.financials.original + wo.financials.contingency;
                    return (
                      <tr key={wo.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/work-orders/${wo.id}`}>
                        <td className="px-6 py-4 font-semibold text-blue-600">{wo.controlNumber}</td>
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
                            {cumulative > threshold ? t('yes') : t('no')}
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

        {/* Report 3: Work Order Status Report */}
        {activeReport === 'status' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t('workOrderStatusReport')}</h2>
              <button
                onClick={() => handleExport('status')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
              >
                {t('exportExcel')}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('workOrdersOpen')}</p>
                <p className="text-3xl font-bold text-gray-600 mt-2">{statusData.byStatus.open}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('workOrdersInProgress')}</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{statusData.byStatus.inProgress}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('workOrdersOnHold')}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{statusData.byStatus.onHold}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('workOrdersCompleted')}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{statusData.byStatus.completed}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('controlNumber')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('status')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('createdDate')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('completedDate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockWorkOrders.slice(0, 10).map((wo: any) => (
                    <tr key={wo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-blue-600">{wo.controlNumber}</td>
                      <td className="px-6 py-4 capitalize">{wo.status}</td>
                      <td className="px-6 py-4">{wo.createdDate}</td>
                      <td className="px-6 py-4">{wo.completedDate || t('noData')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 4: Property Condition Report */}
        {activeReport === 'condition' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t('propertyConditionReport')}</h2>
              <button
                onClick={() => handleExport('condition')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
              >
                {t('exportExcel')}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('total')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{propertyConditionData.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('occupied')}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{propertyConditionData.occupied}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('available')}</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{propertyConditionData.available}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('maintenance')}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{propertyConditionData.maintenance}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('vacant')}</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{propertyConditionData.vacant}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold">{t('totalPortfolioValue')}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">${propertyConditionData.totalValue.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('address')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('type')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('status')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('currentValue')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockProperties.slice(0, 10).map((prop: any) => (
                    <tr key={prop.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-800">{prop.address}</td>
                      <td className="px-6 py-4 capitalize">{prop.type}</td>
                      <td className="px-6 py-4 capitalize">{prop.status}</td>
                      <td className="px-6 py-4">${prop.currentValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 5: Asset Inventory Report */}
        {activeReport === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t('assetInventoryReport')}</h2>
              <button
                onClick={() => handleExport('inventory')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
              >
                {t('exportExcel')}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('totalAssets')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{inventoryData.totalItems}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('totalLocations')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{inventoryData.totalLocations}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('activeInventory')}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{inventoryData.activeItems}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('inactiveInventory')}</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{inventoryData.inactiveItems}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('warrantyExpiry')}</p>
                <div className="mt-3 space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold text-red-600">{inventoryData.expiredWarranty}</span> {t('expiredWarranty')}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-yellow-600">{inventoryData.expiringWarranty}</span> {t('upcomingExpiry')}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{t('inventoryStatus')}</p>
                <div className="mt-3 space-y-2">
                  <p className="text-sm"><span className="font-semibold text-green-600">{inventoryData.activeItems}</span> {t('activeInventory')}</p>
                  <p className="text-sm"><span className="font-semibold text-gray-600">{inventoryData.inactiveItems}</span> {t('inactiveInventory')}</p>
                  <p className="text-sm"><span className="font-semibold text-red-600">{inventoryData.retiredItems}</span> {t('retiredInventory')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('brand')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('model')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('type')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('status')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">{t('warrantyEnd')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockInventory.slice(0, 10).flatMap((item: any) =>
                    item.locations.slice(0, 1).map((loc: any, idx: number) => (
                      <tr key={`${item.id}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-800">{item.brand}</td>
                        <td className="px-6 py-4">{item.model}</td>
                        <td className="px-6 py-4 capitalize">{item.type}</td>
                        <td className="px-6 py-4 capitalize">{loc.status}</td>
                        <td className="px-6 py-4">{loc.warrantyEnd}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
