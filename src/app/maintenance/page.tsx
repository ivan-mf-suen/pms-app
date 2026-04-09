'use client';

import { mockMaintenanceRequests, mockProperties } from '@/lib/mockData';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toISOString().split('T')[0];
};

export default function MaintenancePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [filter, setFilter] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCost, setFilterCost] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [allRequests, setAllRequests] = useState(mockMaintenanceRequests);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'createdDate',
    direction: 'desc',
  });

  // Load view mode and requests from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('maintenanceViewMode') as 'grid' | 'list' | null;
      if (savedViewMode) {
        setViewMode(savedViewMode);
      }
    }

    const saved = localStorage.getItem('maintenanceRequests');
    const savedRequests = saved ? JSON.parse(saved) : [];

    // Combine: mock data + saved data (avoid duplicates by ID)
    const combinedRequests = [...mockMaintenanceRequests];
    savedRequests.forEach((saved: any) => {
      if (!combinedRequests.find(m => m.id === saved.id)) {
        combinedRequests.push(saved);
      }
    });

    setAllRequests(combinedRequests);
  }, []);

  // Save view mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('maintenanceViewMode', viewMode);
    }
  }, [viewMode]);

  const getPropertyAddress = (propertyId: string) => {
    return mockProperties.find((p) => p.id === propertyId)?.address || 'Unknown';
  };

  // Extract unique years from createdDate
  const getYears = () => {
    const years = new Set(allRequests.map((r) => new Date(r.createdDate).getFullYear().toString()));
    return Array.from(years).sort().reverse();
  };

  // Extract unique locations
  const getLocations = () => {
    const locations = new Set(
      allRequests.map((r) => {
        const prop = mockProperties.find((p) => p.id === r.propertyId);
        return prop?.address || 'Unknown';
      })
    );
    return Array.from(locations).sort();
  };

  let filtered = allRequests;

  // Filter by status
  if (filter !== 'all') {
    filtered = filtered.filter((r) => r.status === filter);
  }

  // Filter by year
  if (filterYear !== 'all') {
    filtered = filtered.filter((r) => new Date(r.createdDate).getFullYear().toString() === filterYear);
  }

  // Filter by priority
  if (filterPriority !== 'all') {
    filtered = filtered.filter((r) => r.priority === filterPriority);
  }

  // Filter by cost
  if (filterCost !== 'all') {
    if (filterCost === 'under1000') {
      filtered = filtered.filter((r) => r.estimatedCost < 1000);
    } else if (filterCost === '1000-5000') {
      filtered = filtered.filter((r) => r.estimatedCost >= 1000 && r.estimatedCost < 5000);
    } else if (filterCost === 'over5000') {
      filtered = filtered.filter((r) => r.estimatedCost >= 5000);
    }
  }

  // Filter by location
  if (filterLocation !== 'all') {
    filtered = filtered.filter((r) => {
      const prop = mockProperties.find((p) => p.id === r.propertyId);
      return prop?.address === filterLocation;
    });
  }

  // Search filter
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((r) => {
      const prop = mockProperties.find((p) => p.id === r.propertyId);
      return (
        r.title.toLowerCase().includes(query) ||
        (prop?.address.toLowerCase().includes(query) || false)
      );
    });
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const statusColors: Record<string, string> = {
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-orange-100 text-orange-800',
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    canceled: 'bg-gray-100 text-gray-800',
  };

  const handleSort = (column: string) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

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

  const getSortedData = (data: any[]) => {
    if (!data || data.length === 0) return data;

    const sorted = [...data].sort((a, b) => {
      let aValue: any = a[sortConfig.column];
      let bValue: any = b[sortConfig.column];

      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return sortConfig.direction === 'asc'
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }
      }

      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return sorted;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('maintenance')}</h1>
          <p className="text-gray-600 mt-1">{t('trackMaintenanceRequests')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-3">
          {/* Status Filter
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('all')} ({allRequests.length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded transition ${
                filter === 'open'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('open')} ({allRequests.filter((r) => r.status === 'open').length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded transition ${
                filter === 'in_progress'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('inProgress')} ({allRequests.filter((r) => r.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded transition ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('completed')} ({allRequests.filter((r) => r.status === 'completed').length})
            </button>
          </div> */}

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Year Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">{t('year') || '年份'}</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('all')}</option>
                {getYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">{t('priority')}</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('all')}</option>
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
                <option value="urgent">{t('urgent')}</option>
              </select>
            </div>

            {/* Cost Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">{t('estimatedCost') || '預算成本'}</label>
              <select
                value={filterCost}
                onChange={(e) => setFilterCost(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('all')}</option>
                <option value="under1000">{t('cost_under1000')}</option>
                <option value="1000-5000">{t('cost_1000_5000')}</option>
                <option value="over5000">{t('cost_over5000')}</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">{t('location') || '位置'}</label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('all')}</option>
                {getLocations().map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {t('search')}
            </label>
            <input
              type="text"
              placeholder={t('searchMaintenancePlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* View Mode Toggle */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {t('showing')} {filtered.length} {t('of')} {mockMaintenanceRequests.length} {t('items')}
            </p>

            {/* View Mode Toggle */}
            <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded transition text-sm font-semibold ${viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title="Grid view"
              >
                ⊞ {t('grid') || 'Grid'}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded transition text-sm font-semibold ${viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title="List view"
              >
                ☰ {t('list') || 'List'}
              </button>
            </div>
          </div>
        </div>



        {/* Grid/List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">{t('noMaintenanceRequests')}</p>
              </div>
            ) : (
              filtered.map((request) => (
                <div
                  key={request.id}
                  onClick={() => router.push(`/maintenance/${request.id}`)}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-lg hover:bg-blue-50 transition cursor-pointer"
                >
                  <div className="mb-3">
                    <p className="text-gray-600 text-xs font-semibold">{t('title')}</p>
                    <p className="font-semibold text-gray-800 text-sm line-clamp-2">{request.title}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-600 text-xs font-semibold">{t('properties')}</p>
                    <p className="font-semibold text-gray-800 text-sm">{getPropertyAddress(request.propertyId)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-600 text-xs font-semibold">{t('priority')}</p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${priorityColors[request.priority]
                          }`}
                      >
                        {t(`priority_${request.priority}`)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold">{t('status')}</p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColors[request.status]
                          }`}
                      >
                        {t(`maintenanceStatus_${request.status}`)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th
                      onClick={() => handleSort('title')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('title')} {getSortIcon('title')}
                    </th>
                    <th
                      onClick={() => handleSort('propertyId')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('properties')} {getSortIcon('propertyId')}
                    </th>
                    <th
                      onClick={() => handleSort('priority')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('priority')} {getSortIcon('priority')}
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('status')} {getSortIcon('status')}
                    </th>
                    <th
                      onClick={() => handleSort('createdDate')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('createdDate')} {getSortIcon('createdDate')}
                    </th>
                    <th
                      onClick={() => handleSort('estimatedCost')}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    >
                      {t('estimatedCost')} {getSortIcon('estimatedCost')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        {t('noMaintenanceRequests')}
                      </td>
                    </tr>
                  ) : (
                    getSortedData(filtered).map((request) => (
                      <tr
                        key={request.id}
                        onClick={() => router.push(`/maintenance/${request.id}`)}
                        className="hover:bg-blue-50 cursor-pointer transition"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600 hover:text-blue-800">{request.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{getPropertyAddress(request.propertyId)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${priorityColors[request.priority]}`}>
                            {t(`priority_${request.priority}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${statusColors[request.status]}`}>
                            {t(`maintenanceStatus_${request.status}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">{formatDate(request.createdDate)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">${request.estimatedCost.toLocaleString()}</td>
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
