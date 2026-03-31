'use client';

import { useI18n } from '@/contexts/I18nContext';
import { mockInventory, mockMaintenanceRequests, mockWorkOrders, Property } from '@/lib/mockData';
import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
  property: Property;
}

const statusColors: Record<string, string> = {
  occupied: 'bg-green-100 text-green-800',
  available: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  vacant: 'bg-red-100 text-red-800',
};

// Helper function to check if warranty is expired
const isWarrantyExpired = (warrantyEnd: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const warranty = new Date(warrantyEnd);
  warranty.setHours(0, 0, 0, 0);
  return warranty.getTime() < today.getTime();
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const { t } = useI18n();

  // Count expired warranty items
  const expiredWarrantyCount = mockInventory.filter((item) => 
    item.locations.some((loc) => isWarrantyExpired(loc.warrantyEnd) && loc.propertyId === property.id)
  ).length;

  const workOrderCount = mockWorkOrders.filter((item) => 
    item.propertyId === property.id
  ).length;

  const maintenanceCount = mockMaintenanceRequests.filter((item) => 
    item.propertyId === property.id
  ).length;

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
        <div className="relative w-full h-48 bg-gray-200">
          {property.imageUrl ? (
            <Image
              src={property.imageUrl}
              alt={property.address}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="eager"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[property.status]}`}>
            {t(`propertyType_${property.type}`)}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-800 truncate">{property.address}</h3>
          <p className="text-sm text-gray-600">
            {property.city}, {property.state} {property.zipCode}
          </p>
          <div className="flex gap-4 mt-3 text-sm text-gray-600">
            <span>⚠️{expiredWarrantyCount} {t('expiredWarranties')}</span>
            <span>📝{workOrderCount} {t('workOrders')}</span>
          </div>
          <div className="mt-3 pt-3 border-t">
            {/* <p className="text-sm font-semibold text-gray-800">
              ${property.currentValue.toLocaleString()}
            </p> */}
            <p className="text-sm text-gray-500">🔧{maintenanceCount} {t('maintenanceIssues')}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
