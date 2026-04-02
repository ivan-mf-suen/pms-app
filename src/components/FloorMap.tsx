'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Inventory } from '@/lib/mockData';
import { useI18n } from '@/contexts/I18nContext';

interface FloorMapProps {
  propertyId: string;
  floorPlanUrl?: string;
  inventory: Inventory[];
  currentFloorLabel?: string;
}

const typeIcons: Record<string, string> = {
  hvac: '❄️',
  electrical: '⚡',
  plumbing: '🚰',
  appliance: '🏠',
  structural: '🏗️',
  other: '📦',
};

const typeColors: Record<string, string> = {
  hvac: 'bg-blue-100 text-blue-700',
  electrical: 'bg-yellow-100 text-yellow-700',
  plumbing: 'bg-green-100 text-green-700',
  appliance: 'bg-orange-100 text-orange-700',
  structural: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function FloorMap({ propertyId, floorPlanUrl, inventory, currentFloorLabel }: FloorMapProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Filter inventory items that are located in this property and on current floor
  const propertyInventory = inventory
    .map((inv) => ({
      ...inv,
      locations: inv.locations.filter((loc) => 
        loc.propertyId === propertyId && 
        (!currentFloorLabel || !loc.floorPlanName || loc.floorPlanName === currentFloorLabel)
      ),
    }))
    .filter((inv) => inv.locations.length > 0);

  if (!propertyInventory.length) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p className="text-gray-500 text-center">No inventory items with floor map positions yet.</p>
      </div>
    );
  }

  if (!floorPlanUrl) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p className="text-gray-500 text-center">Floor plan image not available for this property.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Property Floor Map</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(prev => Math.max(50, prev - 20))}
            className="px-3 py-1 bg-blue-600 hover:bg-gray-300 hover:text-white rounded text-sm font-semibold transition"
            title={t('zoomOut')}
          >
            {t('zoomOut')}
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-12 text-center">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(200, prev + 20))}
            className="px-3 py-1 bg-blue-600 hover:bg-gray-300 hover:text-white rounded text-sm font-semibold transition"
            title={t('zoomIn')}
          >
            {t('zoomIn')}
          </button>
        </div>
      </div>
      
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300" style={{ aspectRatio: '4/3', overflow: 'auto' }}>
        <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left', width: '100%', height: '100%', position: 'relative' }}>
          {/* Floor Plan Background Image */}
          <Image
            src={floorPlanUrl}
            alt="Floor Plan"
            fill
            className="object-cover"
            priority={false}
          />

          {/* Inventory Markers */}
          {propertyInventory.map((inv) =>
          inv.locations.map((location) => {
            const markerId = `${inv.id}-${location.id}`;
            const icon = typeIcons[inv.type] || '📦';
            const colorClass = typeColors[inv.type] || typeColors.other;
            const isHovered = hoveredMarker === markerId;

            return (
              <div
                key={markerId}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${location.x || 50}%`,
                  top: `${location.y || 50}%`,
                }}
                onMouseEnter={() => setHoveredMarker(markerId)}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => router.push(`/inventory/${inv.id}`)}
              >
                {/* Marker Circle */}
                <div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-200 ${colorClass} border-2 border-white shadow-md hover:shadow-lg hover:scale-110`}
                >
                  {icon}
                  {location.quantity > 1 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {location.quantity}
                    </span>
                  )}
                </div>

                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded shadow-lg whitespace-nowrap text-sm z-50">
                    <p className="font-semibold">{inv.brand} {inv.model}</p>
                    <p className="text-gray-300 text-xs">{t(`type_${inv.type}`)}</p>
                    <p className="text-gray-400 text-xs">{location.address}</p>
                    <p className="text-yellow-300 text-xs">Click to view details</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(typeIcons).map(([type, icon]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <span className="text-sm text-gray-700 capitalize font-medium">{type}</span>
          </div>
        ))}
      </div>

      {/* Inventory List Below Map */}
      {/*<div className="mt-6 border-t pt-4">
        <h4 className="text-lg font-bold text-gray-800 mb-3">Inventory at This Location</h4>
        <div className="space-y-2">
          {propertyInventory.map((inv) =>
            inv.locations.map((location) => (
              <div
                key={`${inv.id}-${location.id}`}
                className={`p-3 rounded-lg cursor-pointer transition-all ${typeColors[inv.type] || typeColors.other} hover:shadow-md`}
                onClick={() => router.push(`/inventory/${inv.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {typeIcons[inv.type] || '📦'} {inv.brand} {inv.model}
                    </p>
                    <p className="text-sm opacity-75">{location.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 bg-white rounded text-xs font-bold">
                      Qty: {location.quantity}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 text-xs opacity-75">
                  <span>📅 {location.condition}</span>
                  <span>⚠️ Warranty: {location.warrantyEnd}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>*/}
    </div>
  );
}
