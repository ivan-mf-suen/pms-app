'use client';

import React from 'react';
import Link from 'next/link';
import { DayEvents } from '@/lib/calendarUtils';

interface CalendarEventDetailsProps {
  date: string; // YYYY-MM-DD
  dayEvents: DayEvents;
  onClose?: () => void;
}

export default function CalendarEventDetails({ date, dayEvents, onClose }: CalendarEventDetailsProps) {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalEvents = dayEvents.inventoryExpired.length + dayEvents.inventoryNearlyExpired.length + dayEvents.workOrders.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{formattedDate}</h2>
            <p className="text-sm text-gray-600">{totalEvents} event(s)</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Expired Inventory */}
          {dayEvents.inventoryExpired.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-600 text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Expired Warranty ({dayEvents.inventoryExpired.length})
              </h3>
              <div className="space-y-2">
                {dayEvents.inventoryExpired.map((item) => (
                  <Link
                    key={item.id}
                    href="/inventory"
                    className="block p-2 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.details}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Nearly Expired Inventory */}
          {dayEvents.inventoryNearlyExpired.length > 0 && (
            <div>
              <h3 className="font-semibold text-yellow-700 text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Expiring Soon ({dayEvents.inventoryNearlyExpired.length})
              </h3>
              <div className="space-y-2">
                {dayEvents.inventoryNearlyExpired.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-yellow-50 border border-yellow-200 rounded"
                  >
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.details}</p>
                    {item.daysUntilExpiry !== undefined && (
                      <p className="text-xs text-yellow-700 font-semibold mt-1">
                        Expires in {item.daysUntilExpiry} day(s)
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
              <h3 className="font-semibold text-blue-600 text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Work Orders ({dayEvents.workOrders.length})
              </h3>
              <div className="space-y-2">
                {dayEvents.workOrders.map((item) => (
                  <Link
                    key={item.id}
                    href={`/work-orders/${item.id}`}
                    className="block p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.details}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalEvents === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No events scheduled for this date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
