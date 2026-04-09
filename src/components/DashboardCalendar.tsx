'use client';

import React, { useState } from 'react';
import {
  formatDateISO,
  getEventCountForDate,
  DayEvents,
} from '@/lib/calendarUtils';
import CalendarEventPopover from './CalendarEventPopover';
import { useI18n } from '@/contexts/I18nContext';

interface DashboardCalendarProps {
  events: Record<string, DayEvents & { colors: ('red' | 'yellow' | 'blue')[] }>;
}

export default function DashboardCalendar({ events }: DashboardCalendarProps) {
  const { t } = useI18n();
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const dayNames = [
    t('dayNameSun'),
    t('dayNameMon'),
    t('dayNameTue'),
    t('dayNameWed'),
    t('dayNameThu'),
    t('dayNameFri'),
    t('dayNameSat'),
  ];

  const getPriorityColor = (colors: ('red' | 'yellow' | 'blue')[]): string => {
    if (colors.includes('red')) return 'bg-red-500 text-white';
    if (colors.includes('yellow')) return 'bg-yellow-400 text-gray-900';
    if (colors.includes('blue')) return 'bg-blue-500 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  const handleDateClick = (day: number) => {
    const dateStr = formatDateISO(new Date(currentYear, currentMonth, day));
    const dayEvents = events[dateStr];

    if (dayEvents) {
      setSelectedDate(dateStr);
    }
  };

  const getTooltipText = (day: number): string | null => {
    const dateStr = formatDateISO(new Date(currentYear, currentMonth, day));
    const dayEvent = events[dateStr];

    if (!dayEvent) return null;

    const parts: string[] = [];
    if (dayEvent.inventoryExpired.length > 0) {
      parts.push(`${dayEvent.inventoryExpired.length} ${t('calendarExpired')}`);
    }
    if (dayEvent.inventoryNearlyExpired.length > 0) {
      parts.push(`${dayEvent.inventoryNearlyExpired.length} ${t('calendarExpiring')}`);
    }
    if (dayEvent.workOrders.length > 0) {
      parts.push(`${dayEvent.workOrders.length} ${t('calendarWorkOrder')}`);
    }

    return parts.length > 0 ? parts.join(', ') : null;
  };

  // Create grid array with empty slots for days before month starts
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get upcoming events for summary (next 5 dates with events)
  const upcomingEvents = Object.entries(events)
    .filter(([date]) => new Date(date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Calendar Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-200 rounded text-sm transition-colors"
            aria-label={t('previousMonth')}
          >
            ←
          </button>
          <h3 className="text-lg font-bold text-gray-800 text-center flex-1">{monthName}</h3>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-200 rounded text-sm transition-colors"
            aria-label={t('nextMonth')}
          >
            →
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 py-1"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const dateStr = formatDateISO(new Date(currentYear, currentMonth, day));
          const dayEvent = events[dateStr];
          const eventCount = dayEvent ? getEventCountForDate(dayEvent) : 0;
          const colors = dayEvent?.colors || [];
          const hasDayEvent = eventCount > 0;
          const colorClass = getPriorityColor(colors);
          const tooltipText = getTooltipText(day);

          const isToday =
            day === now.getDate() &&
            currentMonth === now.getMonth() &&
            currentYear === now.getFullYear();

          return (
            <div
              key={day}
              className="relative"
              onMouseEnter={() => hasDayEvent && setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <div
                onClick={() => hasDayEvent && handleDateClick(day)}
                className={`aspect-square flex flex-col items-center justify-center rounded border-2 text-xs transition-all
                  ${
                    isToday
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }
                  ${hasDayEvent ? 'cursor-pointer hover:shadow-md' : 'hover:bg-gray-50'}
                `}
              >
                {/* Day number */}
                <div className="font-semibold text-gray-800">{day}</div>

                {/* Event badge */}
                {hasDayEvent && (
                  <div
                    className={`${colorClass} rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 cursor-pointer`}
                  >
                    {eventCount}
                  </div>
                )}
              </div>

              {/* Hover Tooltip */}
              {hoveredDate === dateStr && tooltipText && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 whitespace-nowrap pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                    {tooltipText}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Color Legend & Upcoming Events */}
      <div className="border-t border-gray-200 pt-3">
        {/* Legend */}
        <div className="mb-3">
          <div className="text-xs text-gray-600 font-semibold mb-2">Legend:</div>
          <div className="flex gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Expired</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-gray-600">Expiring Soon</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">Work Orders</span>
            </div>
          </div>
        </div>

        {/* Upcoming Events Summary */}
        {upcomingEvents.length > 0 && (
          <div className="bg-gray-50 rounded p-2.5 border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-2">📅 Upcoming Events:</div>
            <div className="space-y-1.5">
              {upcomingEvents.map(([date, dayEvent]) => {
                const eventDate = new Date(date);
                const dateDisplay = eventDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
                const totalEvents =
                  dayEvent.inventoryExpired.length +
                  dayEvent.inventoryNearlyExpired.length +
                  dayEvent.workOrders.length;

                return (
                  <div
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="text-xs text-gray-700 hover:text-gray-900 cursor-pointer hover:bg-white p-2 rounded transition-colors border border-transparent hover:border-gray-300"
                  >
                    <span className="font-semibold text-gray-800">{dateDisplay}</span>
                    {dayEvent.inventoryExpired.length > 0 && (
                      <span className="inline-block ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                        {dayEvent.inventoryExpired.length} expired
                      </span>
                    )}
                    {dayEvent.inventoryNearlyExpired.length > 0 && (
                      <span className="inline-block ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                        {dayEvent.inventoryNearlyExpired.length} soon
                      </span>
                    )}
                    {dayEvent.workOrders.length > 0 && (
                      <span className="inline-block ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {dayEvent.workOrders.length} WO
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Event Details Popover */}
      {selectedDate && events[selectedDate] && (
        <CalendarEventPopover
          date={selectedDate}
          dayEvents={events[selectedDate]}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
