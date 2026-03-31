'use client';

import React, { useState } from 'react';
import {
  getDatesInMonth,
  formatDateISO,
  getDayName,
  getEventCountForDate,
  getPrimaryColorForDate,
  DayEvents,
} from '@/lib/calendarUtils';

interface DashboardCalendarProps {
  events: Record<string, DayEvents & { colors: ('red' | 'yellow' | 'blue')[] }>;
  onDateClick?: (date: string, dayEvents: DayEvents) => void;
}

export default function DashboardCalendar({ events, onDateClick }: DashboardCalendarProps) {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

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

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getPriorityColor = (colors: ('red' | 'yellow' | 'blue')[]): string => {
    if (colors.includes('red')) return 'bg-red-500 text-white';
    if (colors.includes('yellow')) return 'bg-yellow-400 text-gray-900';
    if (colors.includes('blue')) return 'bg-blue-500 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  const handleDateClick = (day: number) => {
    const dateStr = formatDateISO(new Date(currentYear, currentMonth, day));
    const dayEvents = events[dateStr];
    if (dayEvents && onDateClick) {
      onDateClick(dateStr, dayEvents);
    }
  };

  // Create grid array with empty slots for days before month starts
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Calendar Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-200 rounded text-sm"
            aria-label="Previous month"
          >
            ←
          </button>
          <h3 className="text-lg font-bold text-gray-800 text-center flex-1">{monthName}</h3>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-200 rounded text-sm"
            aria-label="Next month"
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
      <div className="grid grid-cols-7 gap-1">
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

          const isToday =
            day === now.getDate() &&
            currentMonth === now.getMonth() &&
            currentYear === now.getFullYear();

          return (
            <div
              key={day}
              onClick={() => hasDayEvent && handleDateClick(day)}
              className={`aspect-square flex flex-col items-center justify-center rounded border-2 text-xs cursor-pointer transition-colors
                ${isToday ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}
                ${hasDayEvent ? 'cursor-pointer hover:shadow-md' : 'hover:bg-gray-50'}
              `}
            >
              {/* Day number */}
              <div className="font-semibold text-gray-800">{day}</div>

              {/* Event badge */}
              {hasDayEvent && (
                <div
                  className={`${colorClass} rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5`}
                  title={`${eventCount} event(s)`}
                >
                  {eventCount}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Color Legend */}
      <div className="mt-4 pt-3 border-t border-gray-200">
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
    </div>
  );
}
