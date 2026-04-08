'use client';

import { mockInventory, mockProperties } from '@/lib/mockData';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

const inventoryTypes = ['hvac', 'electrical', 'plumbing', 'structural', 'appliance', 'fire', 'other'];
const conditions = ['excellent', 'good', 'fair', 'poor'];
const statuses = ['active', 'inactive', 'retired'];

export default function CreateInventoryPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    hp: 0,
    type: 'hvac' as any,
    locations: [
      {
        id: `loc-${Date.now()}-1`,
        address: '',
        propertyId: '',
        quantity: 1,
        installDate: '',
        warrantyEnd: '',
        condition: 'good' as any,
        status: 'active' as any,
        lastVerified: new Date().toISOString().split('T')[0],
        x: 50,
        y: 50,
        floorPlanName: '',
      },
    ],
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: isNaN(Number(value)) ? value : Number(value),
    });
  };

  const handleLocationChange = (index: number, field: string, value: any) => {
    const updatedLocations = [...formData.locations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      [field]: isNaN(Number(value)) && field !== 'propertyId' ? value : field === 'propertyId' ? value : Number(value),
    };
    setFormData({
      ...formData,
      locations: updatedLocations,
    });
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [
        ...formData.locations,
        {
          id: `loc-${Date.now()}-${formData.locations.length + 1}`,
          address: '',
          propertyId: '',
          quantity: 1,
          installDate: '',
          warrantyEnd: '',
          condition: 'good',
          status: 'active',
          lastVerified: new Date().toISOString().split('T')[0],
          x: 50,
          y: 50,
          floorPlanName: '',
        },
      ],
    });
  };

  const removeLocation = (index: number) => {
    const updated = formData.locations.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      locations: updated,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.brand.trim()) {
      setError('Brand is required');
      return;
    }
    if (!formData.model.trim()) {
      setError('Model is required');
      return;
    }
    if (formData.locations.length === 0) {
      setError('At least one location is required');
      return;
    }

    // Validate each location
    for (let i = 0; i < formData.locations.length; i++) {
      const loc = formData.locations[i];
      if (!loc.address.trim()) {
        setError(`Location ${i + 1}: Address is required`);
        return;
      }
      if (!loc.propertyId) {
        setError(`Location ${i + 1}: Property is required`);
        return;
      }
      if (!loc.installDate) {
        setError(`Location ${i + 1}: Install date is required`);
        return;
      }
      if (!loc.warrantyEnd) {
        setError(`Location ${i + 1}: Warranty end date is required`);
        return;
      }
    }

    // Create new inventory
    const newId = `inv-${String(mockInventory.length + 1).padStart(3, '0')}`;
    const newInventory = {
      id: newId,
      brand: formData.brand,
      model: formData.model,
      hp: formData.hp || undefined,
      type: formData.type,
      locations: formData.locations,
    };

    // Save to localStorage
    if (typeof window !== 'undefined') {
      const savedInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
      savedInventory.push(newInventory);
      localStorage.setItem('inventory', JSON.stringify(savedInventory));
    }

    // Also add to mock data for immediate display
    mockInventory.push(newInventory);

    // Navigate to inventory list
    router.push('/inventory');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/inventory" className="text-blue-600 hover:underline mb-4 block">
            ← {t('back')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{t('createNewInventoryItem')}</h1>
          <p className="text-gray-600 mt-2">{t('addNewInventoryItemToSystem')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('basicInformation')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">{t('brand')} *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Carrier"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">{t('model')} *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., AquaEdge 19DV"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">{t('hp')}</label>
                  <input
                    type="number"
                    name="hp"
                    value={formData.hp || ''}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">{t('inventoryType')} *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {inventoryTypes.map((type) => (
                      <option key={type} value={type}>
                        {t(`type_${type}`) || type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('locationsAndWarranty')} ({formData.locations.length})</h2>
              <button
                type="button"
                onClick={addLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
              >
                + {t('addLocation')}
              </button>
            </div>

            <div className="space-y-6">
              {formData.locations.map((location, index) => (
                <div key={location.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">{t('location')} {index + 1}</h3>
                    {formData.locations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm font-semibold"
                      >
                        {t('remove')}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">{t('address')} *</label>
                      <input
                        type="text"
                        value={location.address}
                        onChange={(e) => handleLocationChange(index, 'address', e.target.value)}
                        placeholder="Location address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">{t('property')} *</label>
                      <select
                        value={location.propertyId}
                        onChange={(e) => handleLocationChange(index, 'propertyId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a property</option>
                        {mockProperties.map((prop) => (
                          <option key={prop.id} value={prop.id}>
                            {prop.address}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">{t('quantity')}</label>
                      <input
                        type="number"
                        min="1"
                        value={location.quantity}
                        onChange={(e) => handleLocationChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">{t('condition')}</label>
                      <select
                        value={location.condition}
                        onChange={(e) => handleLocationChange(index, 'condition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {conditions.map((cond) => (
                          <option key={cond} value={cond}>
                            {cond.charAt(0).toUpperCase() + cond.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">{t('status')}</label>
                      <select
                        value={location.status}
                        onChange={(e) => handleLocationChange(index, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statuses.map((stat) => (
                          <option key={stat} value={stat}>
                            {stat.charAt(0).toUpperCase() + stat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">{t('installDate')} *</label>
                      <input
                        type="date"
                        value={location.installDate}
                        onChange={(e) => handleLocationChange(index, 'installDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">{t('warrantyEnd')} *</label>
                      <input
                        type="date"
                        value={location.warrantyEnd}
                        onChange={(e) => handleLocationChange(index, 'warrantyEnd', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">{t('floorPlanName')}</label>
                      <input
                        type="text"
                        value={location.floorPlanName}
                        onChange={(e) => handleLocationChange(index, 'floorPlanName', e.target.value)}
                        placeholder="e.g., Ground Floor"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">{t('xPosition')} (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={location.x}
                        onChange={(e) => handleLocationChange(index, 'x', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">{t('yPosition')} (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={location.y}
                        onChange={(e) => handleLocationChange(index, 'y', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {t('createInventoryItem')}
            </button>
            <Link
              href="/inventory"
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold text-center"
            >
              {t('cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
