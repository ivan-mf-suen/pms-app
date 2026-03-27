'use client';

import { mockInventory, mockMaintenanceRequests, mockProperties } from '@/lib/mockData';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';

export default function CreateMaintenancePage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inventoryId = searchParams.get('inventoryId');
  const locationId = searchParams.get('locationId');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const inventory = inventoryId ? mockInventory.find((inv) => inv.id === inventoryId) : null;
  const location = inventory && locationId ? inventory.locations.find((loc) => loc.id === locationId) : null;
  const property = location ? mockProperties.find((p) => p.id === location.propertyId) : null;

  // Pre-fill form from inventory data
  useEffect(() => {
    if (inventory && location) {
      const prefilledTitle = `${inventory.brand} ${inventory.model} - Warranty Replacement`;
      const prefilledDescription = `Warranty expired equipment at ${location.address}. Warranty end date: ${location.warrantyEnd}. Condition: ${location.condition || 'unknown'}. Quantity: ${location.quantity}`;
      
      setTitle(prefilledTitle);
      setDescription(prefilledDescription);
      setIsLoading(false);
    } else if (inventoryId && !isLoading) {
      setError('Inventory item not found');
    }
  }, [inventory, location, inventoryId, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!estimatedCost || isNaN(Number(estimatedCost)) || Number(estimatedCost) < 0) {
      setError('Please enter a valid estimated cost');
      return;
    }

    if (!property) {
      setError('Property not found');
      return;
    }

    // Create new maintenance request with pending_approval status
    const newId = `maint-${String(mockMaintenanceRequests.length + 1).padStart(3, '0')}`;
    const newRequest = {
      id: newId,
      propertyId: property.id,
      title,
      description,
      priority,
      status: 'pending_approval' as const, // NEW: Requires admin approval
      createdDate: new Date().toISOString().split('T')[0],
      estimatedCost: Number(estimatedCost),
      inventoryId: inventory?.id,
    };

    mockMaintenanceRequests.push(newRequest);

    // Save to localStorage for persistence across page refreshes
    if (typeof window !== 'undefined') {
      const savedRequests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
      savedRequests.push(newRequest);
      localStorage.setItem('maintenanceRequests', JSON.stringify(savedRequests));
    }

    // Navigate to the new maintenance request detail page
    router.push(`/maintenance/${newId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  if (!inventory || !location || !property) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
            <p className="text-gray-700 mb-4">{error || 'Invalid inventory item or location'}</p>
            <Link
              href="/inventory"
              className="text-blue-600 hover:underline"
            >
              ← Back to Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            href={`/inventory/${inventoryId}`}
            className="text-blue-600 hover:underline mb-4 block"
          >
            ← {t('back')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{t('createMaintenance')}</h1>
          <p className="text-gray-600 mt-2">
            {inventory.brand} {inventory.model} at {location.address}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Inventory Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">{t('inventoryItemSummary')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700 font-semibold">{t('brandModel')}</p>
                <p className="text-gray-800">{inventory.brand} {inventory.model}</p>
              </div>
              <div>
                <p className="text-blue-700 font-semibold">{t('inventoryType')}</p>
                <p className="text-gray-800 capitalize">{t(`type_${inventory.type}`)}</p>
              </div>
              <div>
                <p className="text-blue-700 font-semibold">{t('location')}</p>
                <p className="text-gray-800">{location.address}</p>
              </div>
              <div>
                <p className="text-blue-700 font-semibold">{t('warrantyEnd')}</p>
                <p className="text-gray-800">{location.warrantyEnd}</p>
              </div>
              <div>
                <p className="text-blue-700 font-semibold">{t('condition')}</p>
                <p className="text-gray-800 capitalize">{location.condition || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">
              {t('title')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              placeholder="Maintenance request title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
              {t('description')} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              placeholder="Detailed description of the maintenance needed"
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-gray-700 font-semibold mb-2">
              {t('priority')} <span className="text-red-500">*</span>
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            >
              <option value="low">{t('priority_low')}</option>
              <option value="medium">{t('priority_medium')}</option>
              <option value="high">{t('priority_high')}</option>
              <option value="urgent">{t('priority_urgent')}</option>
            </select>
          </div>

          {/* Estimated Cost */}
          <div>
            <label htmlFor="estimatedCost" className="block text-gray-700 font-semibold mb-2">
              {t('estimatedCost')} (HKD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="estimatedCost"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              min="0"
              step="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              placeholder="0"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex-1"
            >
              {t('create')}
            </button>
            <Link
              href={`/inventory/${inventoryId}`}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
            >
              {t('cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
