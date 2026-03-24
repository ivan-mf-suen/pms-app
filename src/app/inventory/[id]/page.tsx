'use client';

import { mockInventory, mockProperties } from '@/lib/mockData';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function InventoryDetailPage() {
  const params = useParams();
  const { id } = params as { id: string };

  const item = mockInventory.find((inv) => inv.id === id);
  const property = item ? mockProperties.find((p) => p.id === item.propertyId) : null;

  if (!item) {
    notFound();
  }

  // Warranty calculation helper
  const getWarrantyDaysRemaining = (warrantyEnd: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const warranty = new Date(warrantyEnd);
    warranty.setHours(0, 0, 0, 0);
    const diffTime = warranty.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isWarrantyExpiring = (warrantyEnd: string): boolean => {
    const daysRemaining = getWarrantyDaysRemaining(warrantyEnd);
    return daysRemaining >= 0 && daysRemaining <= 90;
  };

  const isWarrantyExpired = (warrantyEnd: string): boolean => {
    return getWarrantyDaysRemaining(warrantyEnd) < 0;
  };

  const daysRemaining = getWarrantyDaysRemaining(item.warrantyEnd);
  const isExpired = isWarrantyExpired(item.warrantyEnd);
  const isExpiring = isWarrantyExpiring(item.warrantyEnd);

  const typeColors: Record<string, { bg: string; text: string }> = {
    hvac: { bg: 'bg-blue-50', text: 'text-blue-800' },
    electrical: { bg: 'bg-yellow-50', text: 'text-yellow-800' },
    plumbing: { bg: 'bg-cyan-50', text: 'text-cyan-800' },
    appliance: { bg: 'bg-purple-50', text: 'text-purple-800' },
    structural: { bg: 'bg-orange-50', text: 'text-orange-800' },
    other: { bg: 'bg-gray-50', text: 'text-gray-800' },
  };

  const defaultColors = { bg: 'bg-gray-50', text: 'text-gray-800' };
  const colors = typeColors[item.type] || defaultColors;

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/inventory"
            className="text-blue-600 hover:underline mb-4 block"
          >
            ← Back to Inventory
          </Link>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {item.brand} {item.model}
              </h1>
              <p className="text-gray-600 mt-2">ID: {item.id}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span
                className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800`}
              >
                {item.type.toUpperCase()}
              </span>
              <span
                className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                  item.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : item.status === 'inactive'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Brand</p>
                <p className="font-semibold text-gray-800">{item.brand}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Model</p>
                <p className="font-semibold text-gray-800">{item.model}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Type</p>
                <p className="font-semibold text-gray-800 capitalize">{item.type}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Status</p>
                <p className="font-semibold text-gray-800 capitalize">{item.status}</p>
              </div>
              {item.hp && (
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Horsepower (HP)</p>
                  <p className="font-semibold text-gray-800">{item.hp} HP</p>
                </div>
              )}
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Location</p>
                <p className="font-semibold text-gray-800">{item.location}</p>
              </div>
            </div>
          </div>

          {/* Property Information */}
          {property && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Property Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Property Address</p>
                  <Link
                    href={`/properties/${property.id}`}
                    className="text-blue-600 hover:underline font-semibold text-lg"
                  >
                    {property.address}
                  </Link>
                  <p className="text-gray-600 text-sm mt-1">
                    {property.city}, {property.state} {property.zipCode}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">Property Type</p>
                    <p className="font-semibold text-gray-800 capitalize">{property.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">Property Status</p>
                    <p className="font-semibold text-gray-800 capitalize">{property.status}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <Link
                  href={`/properties/${property.id}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Property Details →
                </Link>
              </div>
            </div>
          )}

          {/* Installation & Warranty Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Installation & Warranty</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-gray-600 text-sm font-semibold mb-2">Install Date</p>
                <p className="font-semibold text-lg text-gray-800">{item.installDate}</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-gray-600 text-sm font-semibold mb-2">Warranty End</p>
                <p className="font-semibold text-lg text-gray-800">{item.warrantyEnd}</p>
              </div>
            </div>
          </div>

          {/* Warranty Status Summary */}
          <div
            className={`rounded-lg shadow p-6 ${
              isExpired
                ? 'bg-red-50 border-l-4 border-red-500'
                : isExpiring
                ? 'bg-yellow-50 border-l-4 border-yellow-500'
                : 'bg-green-50 border-l-4 border-green-500'
            }`}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">Warranty Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Status</p>
                {isExpired ? (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">⚠️</span>
                    <span className="font-bold text-2xl text-red-600">EXPIRED</span>
                  </div>
                ) : isExpiring ? (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">⏰</span>
                    <span className="font-bold text-2xl text-yellow-600">EXPIRING SOON</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">✓</span>
                    <span className="font-bold text-2xl text-green-600">ACTIVE</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Days Remaining</p>
                <p
                  className={`font-bold text-3xl ${
                    isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-600' : 'text-green-600'
                  }`}
                >
                  {daysRemaining > 0 ? daysRemaining : 0}
                </p>
              </div>
              {!isExpired && (
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Days Until Reminder</p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      {daysRemaining <= 90 && daysRemaining > 0
                        ? `⏰ Warranty reminder active`
                        : `ℹ️ No reminder yet`}
                    </p>
                    <p className="text-xs text-gray-600">
                      Reminders trigger at 90 days before expiration
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
            <div className="flex gap-4 flex-wrap">
              {property && (
                <Link
                  href={`/properties/${property.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Associated Property
                </Link>
              )}
              <Link
                href="/inventory"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Back to Inventory List
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
