'use client';

import { useI18n } from '@/contexts/I18nContext';
import { Inventory, mockProperties } from '@/lib/mockData';
import Link from 'next/link';

interface InventoryCardProps {
  item: Inventory;
}

const typeColors: Record<string, string> = {
  hvac: 'bg-blue-100 text-blue-800',
  electrical: 'bg-yellow-100 text-yellow-800',
  plumbing: 'bg-green-100 text-green-700',
  appliance: 'bg-orange-100 text-orange-700',
  structural: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
};

const typeIcons: Record<string, string> = {
  hvac: '❄️',
  electrical: '⚡',
  plumbing: '🚰',
  appliance: '🏠',
  structural: '🏗️',
  other: '📦',
};

// Helper function to check if warranty is expired
const isWarrantyExpired = (warrantyEnd: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const warranty = new Date(warrantyEnd);
  warranty.setHours(0, 0, 0, 0);
  return warranty.getTime() < today.getTime();
};

const isWarrantyExpiring = (warrantyEnd: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const warranty = new Date(warrantyEnd);
  warranty.setHours(0, 0, 0, 0);
  const diffTime = warranty.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return daysRemaining >= 0 && daysRemaining <= 90;
};

export default function InventoryCard({ item }: InventoryCardProps) {
  const { t } = useI18n();

  // Get first location for display
  const firstLocation = item.locations[0];
  const propertyName = mockProperties.find((p) => p.id === firstLocation?.propertyId)?.address || 'Unknown';
  const totalQty = item.locations.reduce((sum, loc) => sum + loc.quantity, 0);

  // Determine warranty status
  let warrantyBadgeClass = 'bg-green-100 text-green-800';
  let warrantyText = t('active');

  if (firstLocation) {
    if (isWarrantyExpired(firstLocation.warrantyEnd)) {
      warrantyBadgeClass = 'bg-red-100 text-red-800';
      warrantyText = t('warrantyExpired');
    } else if (isWarrantyExpiring(firstLocation.warrantyEnd)) {
      warrantyBadgeClass = 'bg-yellow-100 text-yellow-800';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const warranty = new Date(firstLocation.warrantyEnd);
      warranty.setHours(0, 0, 0, 0);
      const daysRemaining = Math.ceil((warranty.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      warrantyText = `${daysRemaining}d`;
    }
  }

  return (
    <Link href={`/inventory/${item.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
        {/* Header with brand and type badge */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 truncate">{item.brand}</h3>
              <p className="text-sm text-gray-600 truncate">{item.model}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${typeColors[item.type] || typeColors.other}`}>
              {typeIcons[item.type]} {t(`type_${item.type}`)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Location */}
          <div>
            <p className="text-gray-600 text-xs font-semibold uppercase mb-1">{t('location')}</p>
            <p className="font-semibold text-gray-800 text-sm truncate">{firstLocation?.address || 'N/A'}</p>
            {item.locations.length > 1 && (
              <p className="text-xs text-gray-500 mt-1">+{item.locations.length - 1} more location{item.locations.length - 1 !== 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <p className="text-gray-600 text-xs font-semibold uppercase mb-1">{t('quantity')}</p>
            <p className="font-semibold text-gray-800 text-sm">{totalQty} unit{totalQty !== 1 ? 's' : ''}</p>
          </div>

          {/* Warranty Status */}
          <div>
            <p className="text-gray-600 text-xs font-semibold uppercase mb-1">{t('warrantyStatus')}</p>
            <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${warrantyBadgeClass}`}>
              {warrantyText}
            </div>
          </div>

          {/* Install Date */}
          {firstLocation && (
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase mb-1">{t('installDate')}</p>
              <p className="font-semibold text-gray-800 text-sm">{firstLocation.installDate}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
