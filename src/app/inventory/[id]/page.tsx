'use client';

import { mockInventory, mockProperties } from '@/lib/mockData';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useParams, useRouter } from 'next/navigation';

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const item = mockInventory.find((inv) => inv.id === id);

  if (!item) {
    notFound();
  }

  // Calculate total quantity across all locations
  const totalQuantity = item.locations.reduce((sum, loc) => sum + loc.quantity, 0);

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
              <span className="inline-block px-4 py-2 rounded-lg text-sm font-semibold bg-purple-100 text-purple-800">
                Total: {totalQuantity} unit{totalQuantity !== 1 ? 's' : ''}
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
                <p className="text-gray-600 text-sm font-semibold mb-2">Total Quantity</p>
                <p className="font-semibold text-gray-800">{totalQuantity} unit{totalQuantity !== 1 ? 's' : ''}</p>
              </div>
              {item.hp && (
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Horsepower (HP)</p>
                  <p className="font-semibold text-gray-800">{item.hp} HP</p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Locations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Locations & Warranty ({item.locations.length})</h2>
            <div className="space-y-4">
              {item.locations.map((location, index) => {
                const locationProperty = mockProperties.find((p) => p.id === location.propertyId);
                const daysRemaining = getWarrantyDaysRemaining(location.warrantyEnd);
                const isExpired = isWarrantyExpired(location.warrantyEnd);
                const isExpiring = isWarrantyExpiring(location.warrantyEnd);

                return (
                  <div
                    key={location.id}
                    onClick={() => router.push(`/properties/${location.propertyId}`)}
                    className="border rounded-lg p-4 hover:border-blue-400 hover:shadow-md hover:bg-blue-50 transition cursor-pointer"
                  >
                    <div className="space-y-3">
                      {/* Location Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-gray-600 text-sm font-semibold mb-1">Location {index + 1}</p>
                          <p className="font-semibold text-gray-800 text-lg">{location.address}</p>
                          {locationProperty && (
                            <Link
                              href={`/properties/${location.propertyId}`}
                              className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Property Details →
                            </Link>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm font-semibold mb-1">Quantity</p>
                          <p className="font-semibold text-gray-800 text-lg">{location.quantity} unit{location.quantity !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="pt-2">
                        <p className="text-gray-600 text-xs font-semibold mb-1 uppercase">Status</p>
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                            location.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : location.status === 'inactive'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                        </span>
                      </div>

                      {/* Warranty & Installation Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                        <div>
                          <p className="text-gray-600 text-xs font-semibold mb-1 uppercase">Install Date</p>
                          <p className="font-semibold text-gray-800">{location.installDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs font-semibold mb-1 uppercase">Warranty End</p>
                          <p className="font-semibold text-gray-800">{location.warrantyEnd}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs font-semibold mb-1 uppercase">Warranty Status</p>
                          {isExpired ? (
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                              EXPIRED
                            </span>
                          ) : isExpiring ? (
                            <div className="flex items-center gap-1">
                              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                                {daysRemaining}d Left
                              </span>
                            </div>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Condition Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                        {location.condition && (
                          <div>
                            <p className="text-gray-600 text-xs font-semibold mb-1 uppercase">Condition</p>
                            <span
                              className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                                location.condition === 'excellent'
                                  ? 'bg-green-100 text-green-800'
                                  : location.condition === 'good'
                                  ? 'bg-blue-100 text-blue-800'
                                  : location.condition === 'fair'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {location.condition.charAt(0).toUpperCase() + location.condition.slice(1)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-600 text-xs font-semibold mb-1 uppercase">Last Verified</p>
                          <p className="font-semibold text-gray-800">{location.lastVerified}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
            <div className="flex gap-4 flex-wrap">
              {item.locations.some((loc) => isWarrantyExpired(loc.warrantyEnd)) && (
                <button
                  onClick={() => {
                    const expiredLocations = item.locations.filter((loc) => isWarrantyExpired(loc.warrantyEnd));
                    if (expiredLocations.length === 1) {
                      router.push(`/maintenance/create?inventoryId=${item.id}&locationId=${expiredLocations[0].id}`);
                    } else {
                      // Multiple expired locations - let the user choose
                      const locationId = expiredLocations[0].id; // Default to first for now
                      router.push(`/maintenance/create?inventoryId=${item.id}&locationId=${locationId}`);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Create Maintenance Request
                </button>
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
