'use client';

import Link from 'next/link';
import { Property } from '@/lib/mockData';
import { useI18n } from '@/contexts/I18nContext';
import { mockWorkOrders, mockInventory } from '@/lib/mockData';

interface PropertyRowProps {
  property: Property;
}

export default function PropertyRow({ property }: PropertyRowProps) {
  const { t } = useI18n();

  // Calculate work order count for this property
  const workOrderCount = mockWorkOrders.filter(
    (wo) => wo.propertyId === property.id
  ).length;

  // Calculate expired warranty count
  // Count inventory items at this property with warranty end date in the past
  const today = new Date();
  const expiredWarrantyCount = mockInventory.reduce((count, inv) => {
    const expiredLocations = inv.locations.filter((loc) => {
      if (loc.propertyId !== property.id) return false;
      const warrantyEnd = new Date(loc.warrantyEnd);
      return warrantyEnd < today;
    });
    return count + expiredLocations.length;
  }, 0);

  // Get status badge color
  const statusColorMap: Record<string, string> = {
    occupied: 'bg-green-100 text-green-800',
    available: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    vacant: 'bg-red-100 text-red-800',
  };

  const statusColor = statusColorMap[property.status] || 'bg-gray-100 text-gray-800';

  return (
    <tr className="hover:bg-blue-50 cursor-pointer transition border-b">
      <td className="px-6 py-4 text-sm">
        <Link href={`/properties/${property.id}`}>
          <span className="text-blue-600 hover:text-blue-800 font-semibold">
            {property.address}
          </span>
        </Link>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {property.city}, {property.state} {property.zipCode}
      </td>
      <td className="px-6 py-4 text-sm">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {t(`propertyStatus_${property.status}`)}
        </span>
      </td>
      <td className="px-6 py-4 text-sm">
        {expiredWarrantyCount > 0 ? (
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
            {expiredWarrantyCount}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm">
        {workOrderCount > 0 ? (
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
            {workOrderCount}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}
