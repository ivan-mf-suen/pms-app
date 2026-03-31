import { Inventory, WorkOrder } from './mockData';

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  items: {
    id: string;
    name: string;
    daysUntilExpiry?: number;
    type: 'inventory_expired' | 'inventory_nearly_expired' | 'work_order';
    details: string;
  }[];
  colors: ('red' | 'yellow' | 'blue')[];
}

export interface DayEvents {
  inventoryExpired: CalendarEvent['items'];
  inventoryNearlyExpired: CalendarEvent['items'];
  workOrders: CalendarEvent['items'];
}

/**
 * Get inventory events with expiration dates
 * Returns map of date (YYYY-MM-DD) to list of inventory items expiring on that date
 */
export function getInventoryExpirationEvents(inventory: Inventory[]): Record<string, CalendarEvent['items']> {
  const events: Record<string, CalendarEvent['items']> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  inventory.forEach((item) => {
    item.locations.forEach((location) => {
      const warrantyDate = new Date(location.warrantyEnd);
      warrantyDate.setHours(0, 0, 0, 0);
      
      const daysUntilExpiry = Math.floor((warrantyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const dateStr = location.warrantyEnd; // Format: YYYY-MM-DD
      
      // Only include items that are expired or expiring within 30 days
      if (daysUntilExpiry <= 30) {
        if (!events[dateStr]) {
          events[dateStr] = [];
        }
        
        events[dateStr].push({
          id: location.id,
          name: `${item.brand} ${item.model}`,
          daysUntilExpiry,
          type: daysUntilExpiry < 0 ? 'inventory_expired' : 'inventory_nearly_expired',
          details: `Location: ${location.address} | Warranty End: ${location.warrantyEnd}`,
        });
      }
    });
  });

  return events;
}

/**
 * Get work order events created within ±90 days
 * Returns map of date (YYYY-MM-DD) to list of work orders created on that date
 */
export function getWorkOrderEvents(workOrders: WorkOrder[]): Record<string, CalendarEvent['items']> {
  const events: Record<string, CalendarEvent['items']> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const ninetyDaysLater = new Date(today);
  ninetyDaysLater.setDate(ninetyDaysLater.getDate() + 90);

  workOrders.forEach((wo) => {
    const createdDate = new Date(wo.createdDate);
    createdDate.setHours(0, 0, 0, 0);
    
    // Only include work orders created within ±90 days
    if (createdDate.getTime() >= ninetyDaysAgo.getTime() && createdDate.getTime() <= ninetyDaysLater.getTime()) {
      const dateStr = wo.createdDate; // Format: YYYY-MM-DD
      
      if (!events[dateStr]) {
        events[dateStr] = [];
      }
      
      events[dateStr].push({
        id: wo.id,
        name: `${wo.controlNumber}`,
        type: 'work_order',
        details: `${wo.description} | Status: ${wo.status}`,
      });
    }
  });

  return events;
}

/**
 * Merge inventory and work order events into unified map by date
 */
export function mergeCalendarEvents(
  inventory: Inventory[],
  workOrders: WorkOrder[]
): Record<string, DayEvents & { date: string; colors: ('red' | 'yellow' | 'blue')[] }> {
  const inventoryEvents = getInventoryExpirationEvents(inventory);
  const workOrderEvents = getWorkOrderEvents(workOrders);
  
  const allDates = new Set([...Object.keys(inventoryEvents), ...Object.keys(workOrderEvents)]);
  const merged: Record<string, DayEvents & { date: string; colors: ('red' | 'yellow' | 'blue')[] }> = {};

  allDates.forEach((date) => {
    const inventoryExpired = (inventoryEvents[date] || []).filter((item) => item.type === 'inventory_expired');
    const inventoryNearlyExpired = (inventoryEvents[date] || []).filter((item) => item.type === 'inventory_nearly_expired');
    const workOrders = workOrderEvents[date] || [];

    const colors: ('red' | 'yellow' | 'blue')[] = [];
    if (inventoryExpired.length > 0) colors.push('red');
    if (inventoryNearlyExpired.length > 0) colors.push('yellow');
    if (workOrders.length > 0) colors.push('blue');

    merged[date] = {
      date,
      inventoryExpired,
      inventoryNearlyExpired,
      workOrders,
      colors,
    };
  });

  return merged;
}

/**
 * Get total event count for a specific date
 */
export function getEventCountForDate(dayEvents: DayEvents): number {
  return dayEvents.inventoryExpired.length + dayEvents.inventoryNearlyExpired.length + dayEvents.workOrders.length;
}

/**
 * Get primary color for date (red > yellow > blue)
 */
export function getPrimaryColorForDate(colors: ('red' | 'yellow' | 'blue')[]): 'red' | 'yellow' | 'blue' | null {
  if (colors.includes('red')) return 'red';
  if (colors.includes('yellow')) return 'yellow';
  if (colors.includes('blue')) return 'blue';
  return null;
}

/**
 * Get all dates in a given month
 */
export function getDatesInMonth(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get day of week name (0 = Sunday, 6 = Saturday)
 */
export function getDayName(dayIndex: number, locale: string = 'en-US'): string {
  const date = new Date(2024, 0, dayIndex + 1); // Use arbitrary date
  return date.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase();
}
