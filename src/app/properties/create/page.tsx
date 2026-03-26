'use client';

import { mockProperties } from '@/lib/mockData';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

const propertyTypes = ['apartment', 'house', 'commercial', 'duplex', 'kindergarten', 'secondary-school'];
const propertyStatuses = ['available', 'occupied', 'maintenance', 'vacant'];

export default function CreatePropertyPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'apartment' as any,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 1000,
    purchasePrice: 100000,
    currentValue: 100000,
    status: 'available' as any,
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: isNaN(Number(value)) ? value : Number(value),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return;
    }

    // Create new property
    const newId = `prop-${String(mockProperties.length + 1).padStart(3, '0')}`;
    const newProperty = {
      id: newId,
      ...formData,
    };

    // Save to localStorage
    if (typeof window !== 'undefined') {
      const savedProperties = JSON.parse(localStorage.getItem('properties') || '[]');
      savedProperties.push(newProperty);
      localStorage.setItem('properties', JSON.stringify(savedProperties));
    }

    // Also add to mock data for immediate display
    mockProperties.push(newProperty);

    // Navigate to the new property detail page
    router.push(`/properties/${newId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            href="/properties"
            className="text-blue-600 hover:underline mb-4 block"
          >
            ← {t('back')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{t('create')} {t('properties')}</h1>
          <p className="text-gray-600 mt-2">Add a new property to your portfolio</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-gray-700 font-semibold mb-2">
              {t('address')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              placeholder="123 Main Street"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-gray-700 font-semibold mb-2">
                {t('city')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                placeholder="New York"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-gray-700 font-semibold mb-2">
                {t('state')}
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                placeholder="NY"
              />
            </div>
          </div>

          {/* Zip Code */}
          <div>
            <label htmlFor="zipCode" className="block text-gray-700 font-semibold mb-2">
              {t('zipCode')}
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              placeholder="10001"
            />
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-gray-700 font-semibold mb-2">
                {t('propertyType')} <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(`propertyType_${type}`) || type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-gray-700 font-semibold mb-2">
                {t('status')}
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
              >
                {propertyStatuses.map((status) => (
                  <option key={status} value={status}>
                    {t(`propertyStatus_${status}`) || status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bedrooms" className="block text-gray-700 font-semibold mb-2">
                {t('bedrooms')}
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="bathrooms" className="block text-gray-700 font-semibold mb-2">
                {t('bathrooms')}
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Square Feet */}
          <div>
            <label htmlFor="squareFeet" className="block text-gray-700 font-semibold mb-2">
              {t('squareFeet')}
            </label>
            <input
              type="number"
              id="squareFeet"
              name="squareFeet"
              value={formData.squareFeet}
              onChange={handleChange}
              min="0"
              step="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Purchase Price & Current Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="purchasePrice" className="block text-gray-700 font-semibold mb-2">
                {t('purchasePrice')} (USD)
              </label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="currentValue" className="block text-gray-700 font-semibold mb-2">
                {t('currentValue')} (USD)
              </label>
              <input
                type="number"
                id="currentValue"
                name="currentValue"
                value={formData.currentValue}
                onChange={handleChange}
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              />
            </div>
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
              href="/properties"
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
