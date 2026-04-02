/**
 * Property Filter Utility Functions
 * Used for filtering properties by status-based categories
 */

import { Property, Inventory, MaintenanceRequest, WorkOrder } from './mockData';

/**
 * Get all properties that have expired warranty items
 * @param properties Array of all properties
 * @param inventory Array of all inventory items
 * @returns Properties with at least one inventory item with expired warranty
 */
export function getPropertiesWithExpiredWarranties(
  properties: Property[],
  inventory: Inventory[]
): Property[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const propertyIdsWithExpiredWarranty = new Set<string>();

  inventory.forEach((item) => {
    item.locations.forEach((location) => {
      const warrantyEnd = new Date(location.warrantyEnd);
      warrantyEnd.setHours(0, 0, 0, 0);
      if (warrantyEnd.getTime() < today.getTime()) {
        propertyIdsWithExpiredWarranty.add(location.propertyId);
      }
    });
  });

  return properties.filter((p) => propertyIdsWithExpiredWarranty.has(p.id));
}

/**
 * Get all properties that have associated maintenance requests
 * @param properties Array of all properties
 * @param maintenanceRequests Array of all maintenance requests
 * @returns Properties with at least one maintenance request
 */
export function getPropertiesWithMaintenanceRequests(
  properties: Property[],
  maintenanceRequests: MaintenanceRequest[]
): Property[] {
  const propertyIdsWithMaintenance = new Set(
    maintenanceRequests.map((m) => m.propertyId)
  );

  return properties.filter((p) => propertyIdsWithMaintenance.has(p.id));
}

/**
 * Get all properties that have associated work orders
 * @param properties Array of all properties
 * @param workOrders Array of all work orders
 * @returns Properties with at least one work order
 */
export function getPropertiesWithWorkOrders(
  properties: Property[],
  workOrders: WorkOrder[]
): Property[] {
  const propertyIdsWithWorkOrder = new Set(
    workOrders.map((w) => w.propertyId)
  );

  return properties.filter((p) => propertyIdsWithWorkOrder.has(p.id));
}
