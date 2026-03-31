'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { DayEvents } from '@/lib/calendarUtils';

interface CalendarEventPopoverProps {
  date: string; // YYYY-MM-DD
  dayEvents: DayEvents & { colors?: ('red' | 'yellow' | 'blue')[] };
  onClose?: () => void;
}

export default function CalendarEventPopover({ date, dayEvents, onClose }: CalendarEventPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const totalEvents =
    dayEvents.inventoryExpired.length +
    dayEvents.inventoryNearlyExpired.length +
    dayEvents.workOrders.length;

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-w-xs w-full mx-2"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-3 flex items-center justify-between sticky top-0">
        <div>
          <h3 className="text-sm font-bold text-gray-800">{formattedDate}</h3>
          <p className="text-xs text-gray-500">{totalEvents} event(s)</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg font-bold w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Expired Inventory */}
        {dayEvents.inventoryExpired.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-600 text-xs mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              EXPIRED WARRANTY ({dayEvents.inventoryExpired.length})
            </h4>
            <div className="space-y-1.5">
              {dayEvents.inventoryExpired.map((item) => (
                <Link
                  key={item.id}
                  href="/inventory"
                  className="block p-2 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors group"
                >
                  <p className="text-xs font-medium text-gray-800 group-hover:text-red-700">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 group-hover:text-red-600">
                    {item.details}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Nearly Expired Inventory */}
        {dayEvents.inventoryNearlyExpired.length > 0 && (
          <div>
            <h4 className="font-semibold text-yellow-700 text-xs mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              EXPIRING SOON ({dayEvents.inventoryNearlyExpired.length})
            </h4>
            <div className="space-y-1.5">
              {dayEvents.inventoryNearlyExpired.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-yellow-50 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.details}</p>
                  {item.daysUntilExpiry !== undefined && (
                    <p className="text-xs text-yellow-700 font-semibold mt-1">
                      ⏰ Expires in {item.daysUntilExpiry} day{item.daysUntilExpiry !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Orders */}
        {dayEvents.workOrders.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-600 text-xs mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              WORK ORDERS ({dayEvents.workOrders.length})
            </h4>
            <div className="space-y-1.5">
              {dayEvents.workOrders.map((item) => (
                <Link
                  key={item.id}
                  href={`/work-orders/${item.id}`}
                  className="block p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors group"
                >
                  <p className="text-xs font-medium text-gray-800 group-hover:text-blue-700">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 group-hover:text-blue-600">
                    {item.details}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalEvents === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500 text-xs">No events scheduled</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {totalEvents > 0 && (
        <div className="border-t border-gray-200 p-2 bg-gray-50 flex gap-2">
          <Link
            href="/inventory"
            className="flex-1 text-center text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-white py-1.5 rounded transition-colors"
          >
            View All Inventory
          </Link>
          <Link
            href="/work-orders"
            className="flex-1 text-center text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-white py-1.5 rounded transition-colors"
          >
            View All Work Orders
          </Link>
        </div>
      )}
    </div>
  );
}
