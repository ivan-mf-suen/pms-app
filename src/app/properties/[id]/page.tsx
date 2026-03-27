'use client';

import { mockProperties, mockTenants, mockMaintenanceRequests, mockInventory } from '@/lib/mockData';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useParams, useRouter } from 'next/navigation';
import FloorMap from '@/components/FloorMap';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function PropertyDetailPage() { 
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const id = params.id as string;
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <a href="/properties" className="text-blue-600 hover:underline mb-4 block">
            ← {t('backToProperties')}
          </a>
          <h1 className="text-3xl font-bold text-gray-800">{property.address}</h1>
          <p className="text-gray-600 mt-1">
            {property.city}, {property.state} {property.zipCode}
          </p>
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
            <FloorMap
              propertyId={property.id}
              floorPlanUrl={property.floorPlanUrl}
              inventory={mockInventory}
            />
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
                            <p className="text-gray-600 text-sm font-semibold">{t('status')}</p>
                            <span
                              className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                                firstLocation?.status === 'active'
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
                        <p className="text-blue-600 text-xs mt-3 font-semibold">
                          {t('viewDetails')} →
                        </p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">{t('propertyType')}</p>
                  <p className="font-semibold text-gray-800 capitalize">{property.type}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{t('status')}</p>
                  <p className="font-semibold text-gray-800 capitalize">{property.status}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{t('maintenanceRequests')}</p>
                  <p className="font-semibold text-gray-800">{maintenanceRequests.length}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{t('squareFeet')}</p>
                  <p className="font-semibold text-gray-800">{property.squareFeet.toLocaleString()}</p>
                </div>
                {/* <div>
                  <p className="text-gray-600 text-sm">{t('currentValue')}</p>
                  <p className="font-semibold text-gray-800">
                    ${property.currentValue.toLocaleString()}
                  </p>
                </div> */}
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
                          className={`text-xs px-2 py-1 rounded ${
                            request.priority === 'urgent'
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
                          className={`text-xs px-2 py-1 rounded ${
                            request.status === 'completed'
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

            {/* Actions - Admin/Manager Only */}
            {(user?.role === 'admin' || user?.role === 'manager') && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('actions')}</h2>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href={`/properties/${property.id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                >
                  {t('edit')}
                </Link>
                
                <Link
                  href="/properties"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm"
                >
                  {t('back')}
                </Link>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
