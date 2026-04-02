'use client';

import { mockProperties, mockTenants, mockMaintenanceRequests, mockInventory } from '@/lib/mockData';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useParams, useRouter } from 'next/navigation';
import FloorMap from '@/components/FloorMap';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const id = params.id as string;
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const floorMapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first for newly created properties
      const savedProperties = JSON.parse(localStorage.getItem('properties') || '[]');
      const foundSaved = savedProperties.find((p: any) => p.id === id);
      if (foundSaved) {
        setProperty(foundSaved);
        setIsLoading(false);
        return;
      }
    }
    // Fallback to mockProperties
    const foundMock = mockProperties.find((p) => p.id === id);
    setProperty(foundMock);
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  if (!property) {
    return notFound();
  }

  const tenant = mockTenants.find((t) => t.propertyId === id);
  const maintenanceRequests = mockMaintenanceRequests.filter(
    (r) => r.propertyId === id
  );
  const propertyInventory = mockInventory.filter(
    (inv) => inv.locations.some((loc) => loc.propertyId === id)
  );

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

  // Handler to show item on floor map
  const handleShowOnMap = (inventoryId: string) => {
    setSelectedInventoryId(inventoryId);
    // Scroll to floor map section
    setTimeout(() => {
      floorMapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <a href="/properties" className="text-blue-600 hover:underline mb-4 block">
            ← {t('backToProperties')}
          </a>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{property.address}</h1>
              <p className="text-gray-600 mt-1">
                {property.city}, {property.state} {property.zipCode}
              </p>
            </div>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link
                href={`/properties/${property.id}/edit`}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                title="Edit property"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative w-full h-150 bg-gray-200">
                {property.imageUrl ? (
                  <Image
                    src={property.imageUrl}
                    alt={property.address}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    loading="eager"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    {t('noImageAvailable')}
                  </div>
                )}
              </div>
            </div>



            {/* Floor Map Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden" ref={floorMapRef}>
              {/* Floor Plan Tabs */}
              {property.floorPlans && property.floorPlans.length > 1 && (
                <div className="border-b bg-gray-50 p-4">
                  <div className="flex gap-2 flex-wrap">
                    {property.floorPlans.map((floor: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedFloorIndex(index)}
                        className={`px-4 py-2 rounded transition font-semibold text-sm ${selectedFloorIndex === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                      >
                        {floor.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <FloorMap
                propertyId={property.id}
                floorPlanUrl={property.floorPlans?.[selectedFloorIndex]?.url || property.floorPlanUrl}
                inventory={mockInventory}
                currentFloorLabel={property.floorPlans?.[selectedFloorIndex]?.label}
                selectedInventoryId={selectedInventoryId}
              />
            </div>
            {/* Product Inventory Details */}
            {propertyInventory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{t('productInventory')}</h2>
                  <Link
                    href="/inventory"
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    {t('viewAll')} →
                  </Link>
                </div>
                <div className="space-y-4">
                  {propertyInventory.map((item) => {
                    // Get locations for this property
                    const locationForThisProperty = item.locations.filter((loc) => loc.propertyId === id);
                    const firstLocation = locationForThisProperty[0];

                    return (
                      <div
                        key={item.id}
                        onClick={() => router.push(`/inventory/${item.id}`)}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md hover:bg-blue-50 transition cursor-pointer"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-600 text-sm font-semibold">{t('inventoryType')}</p>
                            <p className="font-semibold text-gray-800">{t(`type_${item.type}`)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm font-semibold">{t('brandModel')}</p>
                            <p className="font-semibold text-blue-600 hover:text-blue-800">
                              {item.brand} {item.model}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm font-semibold">{t('location')}</p>
                            <div>
                              <p className="font-semibold text-gray-800">{firstLocation?.address}</p>
                              {locationForThisProperty.length > 1 && (
                                <p className="text-xs text-gray-500 mt-1">+{locationForThisProperty.length - 1} more location{locationForThisProperty.length - 1 !== 1 ? 's' : ''}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm font-semibold">{t('floorPlanName')}</p>
                            <p className="font-semibold text-gray-800">{firstLocation?.floorPlanName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm font-semibold">{t('status')}</p>
                            <span
                              className={`inline-block px-3 py-1 rounded text-xs font-semibold ${firstLocation?.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : firstLocation?.status === 'inactive'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                              {firstLocation?.status}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm font-semibold">{t('installDate')}</p>
                            <p className="font-semibold text-gray-800">{firstLocation?.installDate}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm font-semibold">{t('warrantyEnd')}</p>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-800">{firstLocation?.warrantyEnd}</p>
                              {firstLocation && (
                                <>
                                  {isWarrantyExpired(firstLocation.warrantyEnd) ? (
                                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                                      {t('expiredWarranty')}
                                    </span>
                                  ) : isWarrantyExpiring(firstLocation.warrantyEnd) ? (
                                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                                      {getWarrantyDaysRemaining(firstLocation.warrantyEnd)}d
                                    </span>
                                  ) : (
                                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                                      {t('active')}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-blue-600 text-xs font-semibold">
                            {t('viewDetails')} →
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowOnMap(item.id);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded text-sm font-semibold transition"
                            title="Show on floor map"
                          >
                            🗺️ {t('map') || 'Map'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4">
                  <Link
                    href="/inventory"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    {t('viewAllPropertyInventory')} →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('propertyDetails')}</h2>
              <div className="space-y-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase">{t('propertyType')}</p>
                  <p className="font-semibold text-gray-800 capitalize">{t(`propertyType_${property.type}`)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase">{t('status')}</p>
                  <p className="font-semibold text-gray-800 capitalize">{t(`propertyStatus_${property.status}`)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase">{t('yearEstablished')}</p>
                  <p className="font-semibold text-gray-800">{property.yearEstablished}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase">{t('yearBuilt')}</p>
                  <p className="font-semibold text-gray-800">{property.yearBuiltConstructed}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase">{t('totalArea')}</p>
                  <p className="font-semibold text-gray-800">{property.squareFeet.toLocaleString()} sq ft</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase">{t('maintenanceRequests')}</p>
                  <p className="font-semibold text-gray-800">{maintenanceRequests.length}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase">{t('ownershipStatus')}</p>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-semibold ${property.ownershipStatus === 'owned'
                          ? 'bg-green-100 text-green-800'
                          : property.ownershipStatus === 'leased'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {t(`ownershipStatus_${property.ownershipStatus}`) || property.ownershipStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <p className="text-gray-600 text-xs font-semibold uppercase mb-3">{t('facilityManager')}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">👤</span>
                    <p className="font-semibold text-gray-800">{property.facilityManager.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">📞</span>
                    <a
                      href={`tel:${property.facilityManager.phone}`}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      {property.facilityManager.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">✉️</span>
                    <a
                      href={`mailto:${property.facilityManager.email}`}
                      className="text-blue-600 hover:underline font-semibold break-all"
                    >
                      {property.facilityManager.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Maintenance History */}
            {maintenanceRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('maintenanceRequests')}</h2>
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div
                      key={request.id}
                      onClick={() => router.push(`/maintenance/${request.id}`)}
                      className="border border-gray-200 rounded p-4 mb-4 hover:border-blue-400 hover:shadow-md hover:bg-blue-50 transition cursor-pointer"
                    >
                      <p className="font-semibold text-gray-800 text-blue-600 group-hover:text-blue-700">
                        {request.title}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">{request.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${request.priority === 'urgent'
                              ? 'bg-red-100 text-red-800'
                              : request.priority === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : request.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {request.priority}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${request.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : request.status === 'open'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-blue-600 text-xs mt-3 font-semibold">
                        {t('viewDetails')} →
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}
