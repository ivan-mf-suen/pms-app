// Mock data for Property Management System demo

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: 'apartment' | 'house' | 'commercial' | 'duplex';
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  purchasePrice: number;
  currentValue: number;
  status: 'available' | 'occupied' | 'maintenance' | 'vacant';
  imageUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  status: 'active' | 'inactive' | 'pending';
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed' | 'canceled';
  createdDate: string;
  completedDate?: string;
  estimatedCost: number;
  actualCost?: number;
}

export interface Payment {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface LocationInfo {
  id: string;
  address: string;
  quantity: number;
  lastVerified: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  propertyId: string;
  installDate: string;
  warrantyEnd: string;
  status: 'active' | 'inactive' | 'retired';
}

export interface Inventory {
  id: string;
  brand: string;
  model: string;
  hp?: number;
  type: 'hvac' | 'electrical' | 'plumbing' | 'structural' | 'appliance' | 'other';
  locations: LocationInfo[];
}

export interface AuditLogEntry {
  id: string;
  action: 'create' | 'update' | 'remark' | 'status_change';
  actor: string;
  timestamp: string;
  entityType: 'work_order';
  entityId: string;
  changes?: Record<string, unknown>;
  description?: string;
}

export interface Remark {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface WorkOrder {
  id: string;
  controlNumber: string;
  propertyId: string;
  inventoryIds: string[];
  status: 'open' | 'in_progress' | 'completed' | 'on_hold';
  createdDate: string;
  completedDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  financials: {
    original: number;
    voApproved: number;
    contingency: number;
  };
  remarks: Remark[];
  auditLog: AuditLogEntry[];
}

export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  base64Content?: string;
  propertyId?: string;
  workOrderId?: string;
  uploadDate: string;
}

export interface Notification {
  id: string;
  type: 'warranty' | 'maintenance' | 'payment';
  title: string;
  message: string;
  relatedInventoryId?: string;
  relatedWorkOrderId?: string;
  createdDate: string;
  readStatus: boolean;
  targetRole: 'admin' | 'manager' | 'user' | 'all';
}

export const mockProperties: Property[] = [
  {
    id: 'prop-001',
    address: '123 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 850,
    purchasePrice: 150000,
    currentValue: 175000,
    status: 'occupied',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
  },
  {
    id: 'prop-002',
    address: '456 Maple Avenue',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62702',
    type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1500,
    purchasePrice: 250000,
    currentValue: 280000,
    status: 'occupied',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
  },
  {
    id: 'prop-003',
    address: '789 Pine Road',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62703',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 650,
    purchasePrice: 120000,
    currentValue: 135000,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
  },
  {
    id: 'prop-004',
    address: '321 Elm Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62704',
    type: 'duplex',
    bedrooms: 4,
    bathrooms: 2,
    squareFeet: 1800,
    purchasePrice: 350000,
    currentValue: 385000,
    status: 'occupied',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  },
  {
    id: 'prop-005',
    address: '654 Cedar Lane',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62705',
    type: 'commercial',
    bedrooms: 0,
    bathrooms: 1,
    squareFeet: 2000,
    purchasePrice: 400000,
    currentValue: 450000,
    status: 'occupied',
    imageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop',
  },
];

export const mockTenants: Tenant[] = [
  {
    id: 'tenant-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '217-555-0101',
    propertyId: 'prop-001',
    leaseStartDate: '2023-01-15',
    leaseEndDate: '2025-01-14',
    monthlyRent: 1200,
    status: 'active',
  },
  {
    id: 'tenant-002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '217-555-0102',
    propertyId: 'prop-002',
    leaseStartDate: '2022-06-01',
    leaseEndDate: '2026-05-31',
    monthlyRent: 1800,
    status: 'active',
  },
  {
    id: 'tenant-003',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '217-555-0103',
    propertyId: 'prop-004',
    leaseStartDate: '2023-08-15',
    leaseEndDate: '2025-08-14',
    monthlyRent: 2200,
    status: 'active',
  },
  {
    id: 'tenant-004',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '217-555-0104',
    propertyId: 'prop-005',
    leaseStartDate: '2023-03-01',
    leaseEndDate: '2026-02-28',
    monthlyRent: 3500,
    status: 'active',
  },
];

export const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'maint-001',
    propertyId: 'prop-001',
    title: 'Fix leaky kitchen faucet',
    description: 'Kitchen faucet is dripping water at night',
    priority: 'medium',
    status: 'open',
    createdDate: '2024-03-15',
    estimatedCost: 150,
  },
  {
    id: 'maint-002',
    propertyId: 'prop-002',
    title: 'Replace air filter',
    description: 'HVAC system needs air filter replacement',
    priority: 'low',
    status: 'completed',
    createdDate: '2024-02-28',
    completedDate: '2024-03-05',
    estimatedCost: 50,
    actualCost: 45,
  },
  {
    id: 'maint-003',
    propertyId: 'prop-001',
    title: 'Roof inspection',
    description: 'Tenant reported water leak during last rain',
    priority: 'urgent',
    status: 'in_progress',
    createdDate: '2024-03-10',
    estimatedCost: 1200,
  },
  {
    id: 'maint-004',
    propertyId: 'prop-004',
    title: 'Paint exterior walls',
    description: 'Exterior paint is peeling and needs refresh',
    priority: 'low',
    status: 'open',
    createdDate: '2024-03-12',
    estimatedCost: 3500,
  },
  {
    id: 'maint-005',
    propertyId: 'prop-005',
    title: 'Fix parking lot pothole',
    description: 'Large pothole in parking lot creating safety hazard',
    priority: 'high',
    status: 'in_progress',
    createdDate: '2024-03-14',
    estimatedCost: 800,
  },
];

export const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    propertyId: 'prop-001',
    tenantId: 'tenant-001',
    amount: 1200,
    dueDate: '2024-04-01',
    paidDate: '2024-03-31',
    status: 'paid',
  },
  {
    id: 'pay-002',
    propertyId: 'prop-002',
    tenantId: 'tenant-002',
    amount: 1800,
    dueDate: '2024-04-01',
    paidDate: '2024-04-02',
    status: 'paid',
  },
  {
    id: 'pay-003',
    propertyId: 'prop-001',
    tenantId: 'tenant-001',
    amount: 1200,
    dueDate: '2024-05-01',
    status: 'pending',
  },
  {
    id: 'pay-004',
    propertyId: 'prop-004',
    tenantId: 'tenant-003',
    amount: 2200,
    dueDate: '2024-04-01',
    status: 'overdue',
  },
  {
    id: 'pay-005',
    propertyId: 'prop-005',
    tenantId: 'tenant-004',
    amount: 3500,
    dueDate: '2024-04-01',
    paidDate: '2024-04-01',
    status: 'paid',
  },
];

export const mockInventory: Inventory[] = [
  {
    id: 'inv-001',
    brand: 'Carrier',
    model: 'AquaEdge 19DV',
    hp: 15,
    type: 'hvac',
    locations: [
      {
        id: 'loc-001-1',
        address: '123 Oak St - Basement',
        quantity: 1,
        lastVerified: '2026-02-20',
        condition: 'excellent',
        propertyId: 'prop-001',
        installDate: '2019-05-15',
        warrantyEnd: '2026-05-15',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-002',
    brand: 'Rheem',
    model: 'Performance Tank Water Heater',
    hp: 5,
    type: 'appliance',
    locations: [
      {
        id: 'loc-002-1',
        address: '123 Oak St - Utility Room',
        quantity: 1,
        lastVerified: '2026-02-22',
        condition: 'excellent',
        propertyId: 'prop-001',
        installDate: '2020-08-20',
        warrantyEnd: '2026-08-20',
        status: 'active',
      },
      {
        id: 'loc-002-2',
        address: '456 Maple Ave - Backup Storage',
        quantity: 1,
        lastVerified: '2026-02-15',
        condition: 'good',
        propertyId: 'prop-002',
        installDate: '2021-03-10',
        warrantyEnd: '2027-03-10',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-003',
    brand: 'Trane',
    model: 'XR15',
    hp: 10,
    type: 'hvac',
    locations: [
      {
        id: 'loc-003-1',
        address: '456 Maple Ave - Attic',
        quantity: 1,
        lastVerified: '2026-02-18',
        condition: 'good',
        propertyId: 'prop-002',
        installDate: '2018-03-10',
        warrantyEnd: '2025-03-10',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-004',
    brand: 'Lennox',
    model: 'SL280V',
    hp: 8,
    type: 'hvac',
    locations: [
      {
        id: 'loc-004-1',
        address: '456 Maple Ave - Basement',
        quantity: 1,
        lastVerified: '2026-02-19',
        condition: 'fair',
        propertyId: 'prop-002',
        installDate: '2017-11-22',
        warrantyEnd: '2024-11-22',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-005',
    brand: 'Kohler',
    model: 'Bancroft Toilet',
    type: 'plumbing',
    locations: [
      {
        id: 'loc-005-1',
        address: '789 Pine Rd - Bathroom',
        quantity: 2,
        lastVerified: '2026-02-21',
        condition: 'excellent',
        propertyId: 'prop-003',
        installDate: '2021-06-15',
        warrantyEnd: '2026-06-15',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-006',
    brand: 'Moen',
    model: '8246 Faucet',
    type: 'plumbing',
    locations: [
      {
        id: 'loc-006-1',
        address: '789 Pine Rd - Kitchen',
        quantity: 1,
        lastVerified: '2026-02-20',
        condition: 'excellent',
        propertyId: 'prop-003',
        installDate: '2020-12-01',
        warrantyEnd: '2026-12-01',
        status: 'active',
      },
      {
        id: 'loc-006-2',
        address: '789 Pine Rd - Bathroom',
        quantity: 2,
        lastVerified: '2026-02-20',
        condition: 'good',
        propertyId: 'prop-003',
        installDate: '2021-01-15',
        warrantyEnd: '2027-01-15',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-007',
    brand: 'Generac',
    model: 'PWRcell',
    hp: 20,
    type: 'electrical',
    locations: [
      {
        id: 'loc-007-1',
        address: '321 Elm St - Garage',
        quantity: 1,
        lastVerified: '2026-02-19',
        condition: 'excellent',
        propertyId: 'prop-004',
        installDate: '2022-02-14',
        warrantyEnd: '2027-02-14',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-008',
    brand: 'Siemens',
    model: 'SL Breaker Panel',
    type: 'electrical',
    locations: [
      {
        id: 'loc-008-1',
        address: '321 Elm St - Main',
        quantity: 1,
        lastVerified: '2026-02-20',
        condition: 'good',
        propertyId: 'prop-004',
        installDate: '2019-09-05',
        warrantyEnd: '2026-09-05',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-009',
    brand: 'York',
    model: 'TECL Rooftop',
    hp: 12,
    type: 'hvac',
    locations: [
      {
        id: 'loc-009-1',
        address: '654 Cedar Lane - Roof',
        quantity: 1,
        lastVerified: '2026-02-20',
        condition: 'good',
        propertyId: 'prop-005',
        installDate: '2018-07-30',
        warrantyEnd: '2025-07-30',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-010',
    brand: 'American Standard',
    model: 'Platinum',
    hp: 18,
    type: 'hvac',
    locations: [
      {
        id: 'loc-010-1',
        address: '654 Cedar Lane - Roof',
        quantity: 1,
        lastVerified: '2026-02-21',
        condition: 'excellent',
        propertyId: 'prop-005',
        installDate: '2019-01-12',
        warrantyEnd: '2026-01-12',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-011',
    brand: 'Pentair',
    model: 'Residential Water Pump',
    hp: 3,
    type: 'plumbing',
    locations: [
      {
        id: 'loc-011-1',
        address: '123 Oak St - Basement',
        quantity: 1,
        lastVerified: '2026-02-20',
        condition: 'good',
        propertyId: 'prop-001',
        installDate: '2021-04-22',
        warrantyEnd: '2026-04-22',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-012',
    brand: 'Lutron',
    model: 'Palladiom',
    type: 'electrical',
    locations: [
      {
        id: 'loc-012-1',
        address: '456 Maple Ave - Main',
        quantity: 1,
        lastVerified: '2026-02-19',
        condition: 'excellent',
        propertyId: 'prop-002',
        installDate: '2020-09-10',
        warrantyEnd: '2025-09-10',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-013',
    brand: 'Bradford White',
    model: 'Commerical Water Heater',
    hp: 8,
    type: 'appliance',
    locations: [
      {
        id: 'loc-013-1',
        address: '654 Cedar Lane - Basement',
        quantity: 1,
        lastVerified: '2026-02-20',
        condition: 'good',
        propertyId: 'prop-005',
        installDate: '2019-06-05',
        warrantyEnd: '2026-06-05',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-014',
    brand: 'Honeywell',
    model: 'T9 Thermostat',
    type: 'hvac',
    locations: [
      {
        id: 'loc-014-1',
        address: '789 Pine Rd - Wall',
        quantity: 3,
        lastVerified: '2026-02-22',
        condition: 'excellent',
        propertyId: 'prop-003',
        installDate: '2022-01-18',
        warrantyEnd: '2027-01-18',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-015',
    brand: 'Grohe',
    model: 'Mesh Tap',
    type: 'plumbing',
    locations: [
      {
        id: 'loc-015-1',
        address: '321 Elm St - Kitchen',
        quantity: 1,
        lastVerified: '2026-02-20',
        condition: 'excellent',
        propertyId: 'prop-004',
        installDate: '2021-10-30',
        warrantyEnd: '2026-10-30',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-016',
    brand: 'Eaton',
    model: 'CH Main Breaker',
    type: 'electrical',
    locations: [
      {
        id: 'loc-016-1',
        address: '789 Pine Rd - Main',
        quantity: 1,
        lastVerified: '2026-02-19',
        condition: 'good',
        propertyId: 'prop-003',
        installDate: '2020-03-15',
        warrantyEnd: '2025-03-15',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-017',
    brand: 'Daikin',
    model: 'Ductless Mini-Split',
    hp: 12,
    type: 'hvac',
    locations: [
      {
        id: 'loc-017-1',
        address: '123 Oak St - Living Room',
        quantity: 1,
        lastVerified: '2026-02-21',
        condition: 'excellent',
        propertyId: 'prop-001',
        installDate: '2022-08-25',
        warrantyEnd: '2027-08-25',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-018',
    brand: 'Navien',
    model: 'Tankless WH',
    hp: 6,
    type: 'appliance',
    locations: [
      {
        id: 'loc-018-1',
        address: '456 Maple Ave - Utility',
        quantity: 1,
        lastVerified: '2026-02-20',
        condition: 'good',
        propertyId: 'prop-002',
        installDate: '2021-05-11',
        warrantyEnd: '2026-05-11',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-019',
    brand: 'Rinnai',
    model: 'Tankless V94',
    type: 'appliance',
    locations: [
      {
        id: 'loc-019-1',
        address: '654 Cedar Lane - Utility',
        quantity: 1,
        lastVerified: '2026-02-21',
        condition: 'excellent',
        propertyId: 'prop-005',
        installDate: '2020-10-08',
        warrantyEnd: '2025-10-08',
        status: 'active',
      },
    ],
  },
  {
    id: 'inv-020',
    brand: 'Wolf',
    model: 'Professional Range',
    type: 'appliance',
    locations: [
      {
        id: 'loc-020-1',
        address: '321 Elm St - Kitchen',
        quantity: 1,
        lastVerified: '2026-02-19',
        condition: 'excellent',
        propertyId: 'prop-004',
        installDate: '2021-02-20',
        warrantyEnd: '2026-02-20',
        status: 'active',
      },
    ],
  },
];

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo-001',
    controlNumber: 'WO-2026-0001',
    propertyId: 'prop-001',
    inventoryIds: ['inv-001', 'inv-002'],
    status: 'completed',
    createdDate: '2026-01-10',
    completedDate: '2026-01-25',
    priority: 'high',
    description: 'HVAC system inspection and filter replacement',
    financials: {
      original: 2500,
      voApproved: 2200,
      contingency: 300,
    },
    remarks: [
      {
        id: 'rem-001',
        text: 'Initial inspection revealed worn bearings in compressor. Approved reduced scope.',
        author: 'manager@pms.com',
        timestamp: '2026-01-10T10:30:00Z',
      },
      {
        id: 'rem-002',
        text: 'Filter replaced, system tested and operating normally.',
        author: 'admin@pms.com',
        timestamp: '2026-01-25T16:45:00Z',
      },
    ],
    auditLog: [
      {
        id: 'audit-001',
        action: 'create',
        actor: 'manager@pms.com',
        timestamp: '2026-01-10T09:00:00Z',
        entityType: 'work_order',
        entityId: 'wo-001',
        description: 'Work order created',
      },
      {
        id: 'audit-002',
        action: 'update',
        actor: 'admin@pms.com',
        timestamp: '2026-01-15T12:00:00Z',
        entityType: 'work_order',
        entityId: 'wo-001',
        changes: { status: 'in_progress' },
      },
    ],
  },
  {
    id: 'wo-002',
    controlNumber: 'WO-2026-0002',
    propertyId: 'prop-002',
    inventoryIds: ['inv-003'],
    status: 'in_progress',
    createdDate: '2026-02-01',
    priority: 'urgent',
    description: 'Emergency roof leak repair - water damage in attic',
    financials: {
      original: 5000,
      voApproved: 4800,
      contingency: 1200,
    },
    remarks: [
      {
        id: 'rem-003',
        text: 'Tenant reported water leak during rainfall. Roof inspection scheduled.',
        author: 'demo@pms.com',
        timestamp: '2026-02-01T14:20:00Z',
      },
      {
        id: 'rem-004',
        text: 'Contractor found multiple damaged shingles and flashing issues.',
        author: 'manager@pms.com',
        timestamp: '2026-02-05T11:15:00Z',
      },
    ],
    auditLog: [
      {
        id: 'audit-003',
        action: 'create',
        actor: 'demo@pms.com',
        timestamp: '2026-02-01T14:00:00Z',
        entityType: 'work_order',
        entityId: 'wo-002',
      },
      {
        id: 'audit-004',
        action: 'status_change',
        actor: 'manager@pms.com',
        timestamp: '2026-02-05T09:00:00Z',
        entityType: 'work_order',
        entityId: 'wo-002',
        changes: { status: 'in_progress' },
      },
    ],
  },
  {
    id: 'wo-003',
    controlNumber: 'WO-2026-0003',
    propertyId: 'prop-004',
    inventoryIds: ['inv-007', 'inv-008'],
    status: 'open',
    createdDate: '2026-02-10',
    priority: 'high',
    description: 'Electrical panel upgrade and generator installation',
    financials: {
      original: 8500,
      voApproved: 8200,
      contingency: 2000,
    },
    remarks: [
      {
        id: 'rem-005',
        text: 'Estimate provided by licensed electrician. Awaiting approval.',
        author: 'manager@pms.com',
        timestamp: '2026-02-10T10:00:00Z',
      },
    ],
    auditLog: [
      {
        id: 'audit-005',
        action: 'create',
        actor: 'manager@pms.com',
        timestamp: '2026-02-10T09:30:00Z',
        entityType: 'work_order',
        entityId: 'wo-003',
      },
    ],
  },
  {
    id: 'wo-004',
    controlNumber: 'WO-2026-0004',
    propertyId: 'prop-005',
    inventoryIds: ['inv-009', 'inv-013'],
    status: 'completed',
    createdDate: '2026-01-20',
    completedDate: '2026-02-15',
    priority: 'medium',
    description: 'Routine maintenance and cleaning of commercial HVAC system',
    financials: {
      original: 1800,
      voApproved: 1800,
      contingency: 200,
    },
    remarks: [
      {
        id: 'rem-006',
        text: 'Scheduled preventive maintenance per annual contract.',
        author: 'admin@pms.com',
        timestamp: '2026-01-20T08:00:00Z',
      },
      {
        id: 'rem-007',
        text: 'System cleaned, filters replaced, all components operating optimally.',
        author: 'manager@pms.com',
        timestamp: '2026-02-15T17:30:00Z',
      },
    ],
    auditLog: [
      {
        id: 'audit-006',
        action: 'create',
        actor: 'admin@pms.com',
        timestamp: '2026-01-20T07:45:00Z',
        entityType: 'work_order',
        entityId: 'wo-004',
      },
    ],
  },
  {
    id: 'wo-005',
    controlNumber: 'WO-2026-0005',
    propertyId: 'prop-001',
    inventoryIds: ['inv-005'],
    status: 'in_progress',
    createdDate: '2026-02-12',
    priority: 'medium',
    description: 'Plumbing repair - replace damaged toilet',
    financials: {
      original: 1200,
      voApproved: 1500,
      contingency: 400,
    },
    remarks: [
      {
        id: 'rem-008',
        text: 'Tenant reported toilet leak. Plumber scheduled for inspection.',
        author: 'demo@pms.com',
        timestamp: '2026-02-12T09:45:00Z',
      },
      {
        id: 'rem-009',
        text: 'Found internal valve failure. Approved upgrade to commercial-grade fixture.',
        author: 'manager@pms.com',
        timestamp: '2026-02-18T13:20:00Z',
      },
    ],
    auditLog: [
      {
        id: 'audit-007',
        action: 'create',
        actor: 'demo@pms.com',
        timestamp: '2026-02-12T09:30:00Z',
        entityType: 'work_order',
        entityId: 'wo-005',
      },
      {
        id: 'audit-008',
        action: 'update',
        actor: 'manager@pms.com',
        timestamp: '2026-02-18T13:15:00Z',
        entityType: 'work_order',
        entityId: 'wo-005',
        changes: { 'financials.voApproved': 1500, contingency: 400 },
      },
    ],
  },
  {
    id: 'wo-006',
    controlNumber: 'WO-2026-0006',
    propertyId: 'prop-003',
    inventoryIds: ['inv-014'],
    status: 'open',
    createdDate: '2026-02-18',
    priority: 'low',
    description: 'Thermostat programming update and energy efficiency audit',
    financials: {
      original: 600,
      voApproved: 600,
      contingency: 100,
    },
    remarks: [
      {
        id: 'rem-010',
        text: 'Client requested optimization of heating/cooling settings.',
        author: 'admin@pms.com',
        timestamp: '2026-02-18T15:00:00Z',
      },
    ],
    auditLog: [
      {
        id: 'audit-009',
        action: 'create',
        actor: 'admin@pms.com',
        timestamp: '2026-02-18T14:45:00Z',
        entityType: 'work_order',
        entityId: 'wo-006',
      },
    ],
  },
  {
    id: 'wo-007',
    controlNumber: 'WO-2026-0007',
    propertyId: 'prop-002',
    inventoryIds: ['inv-004', 'inv-012'],
    status: 'on_hold',
    createdDate: '2026-02-14',
    priority: 'high',
    description: 'HVAC system diagnostics - humidifier replacement',
    financials: {
      original: 3200,
      voApproved: 2800,
      contingency: 600,
    },
    remarks: [
      {
        id: 'rem-011',
        text: 'Initial quote provided. Awaiting tenant approval for scope.',
        author: 'manager@pms.com',
        timestamp: '2026-02-14T11:30:00Z',
      },
      {
        id: 'rem-012',
        text: 'Tenant on vacation. Work on hold until they return.',
        author: 'admin@pms.com',
        timestamp: '2026-02-17T10:00:00Z',
      },
    ],
    auditLog: [
      {
        id: 'audit-010',
        action: 'create',
        actor: 'manager@pms.com',
        timestamp: '2026-02-14T11:15:00Z',
        entityType: 'work_order',
        entityId: 'wo-007',
        description: 'Work order created',
      },
    ],
  },
  {
    id: 'wo-008',
    controlNumber: 'WO-2026-0008',
    propertyId: 'prop-004',
    inventoryIds: ['inv-015'],
    status: 'completed',
    createdDate: '2026-01-28',
    completedDate: '2026-02-08',
    priority: 'low',
    description: 'Kitchen faucet replacement - cosmetic upgrade',
    financials: {
      original: 850,
      voApproved: 850,
      contingency: 150,
    },
    remarks: [
      {
        id: 'rem-013',
        text: 'Tenant requested modern faucet upgrade. Approved within budget.',
        author: 'demo@pms.com',
        timestamp: '2026-01-28T14:00:00Z',
      },
      {
        id: 'rem-014',
        text: 'Installation completed successfully. Tenant satisfied with result.',
        author: 'manager@pms.com',
        timestamp: '2026-02-08T12:45:00Z',
      },
    ],
    auditLog: [
      {
        id: 'audit-011',
        action: 'create',
        actor: 'demo@pms.com',
        timestamp: '2026-01-28T13:45:00Z',
        entityType: 'work_order',
        entityId: 'wo-008',
      },
    ],
  },
  {
    id: 'wo-009',
    controlNumber: 'WO-2026-0009',
    propertyId: 'prop-005',
    inventoryIds: ['inv-010'],
    status: 'open',
    createdDate: '2026-02-16',
    priority: 'urgent',
    description: 'HVAC unit A/C condenser replacement - refrigerant leak',
    financials: {
      original: 6800,
      voApproved: 6500,
      contingency: 1500,
    },
    remarks: [
      {
        id: 'rem-015',
        text: 'Customer reported refrigerant leak detected. Unit shutoff for safety.',
        author: 'manager@pms.com',
        timestamp: '2026-02-16T09:15:00Z',
      },
      {
        id: 'rem-016',
        text: 'EPA certification required for refrigerant handling. Specialist contractor quote obtained.',
        author: 'admin@pms.com',
        timestamp: '2026-02-19T16:30:00Z',
      },
    ],
    auditLog: [
      {
        id: 'audit-012',
        action: 'create',
        actor: 'manager@pms.com',
        timestamp: '2026-02-16T09:00:00Z',
        entityType: 'work_order',
        entityId: 'wo-009',
      },
    ],
  },
  {
    id: 'wo-010',
    controlNumber: 'WO-2026-0010',
    propertyId: 'prop-001',
    inventoryIds: ['inv-017'],
    status: 'in_progress',
    createdDate: '2026-02-11',
    priority: 'medium',
    description: 'Mini-split system diagnostics and filter cleaning',
    financials: {
      original: 950,
      voApproved: 950,
      contingency: 250,
    },
    remarks: [
      {
        id: 'rem-017',
        text: 'Scheduled routine maintenance visit.',
        author: 'admin@pms.com',
        timestamp: '2026-02-11T08:30:00Z',
      },
    ],
    auditLog: [
      {
        id: 'audit-013',
        action: 'create',
        actor: 'admin@pms.com',
        timestamp: '2026-02-11T08:15:00Z',
        entityType: 'work_order',
        entityId: 'wo-010',
      },
    ],
  },
];

export const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    name: 'Property_Inspection_Report_Prop001.pdf',
    size: 2457000,
    type: 'application/pdf',
    propertyId: 'prop-001',
    uploadDate: '2026-02-10',
  },
  {
    id: 'doc-002',
    name: 'WO2026_0002_Roof_Estimate.pdf',
    size: 1856000,
    type: 'application/pdf',
    workOrderId: 'wo-002',
    uploadDate: '2026-02-05',
  },
  {
    id: 'doc-003',
    name: 'Insurance_Claim_Photos.zip',
    size: 15360000,
    type: 'application/zip',
    propertyId: 'prop-002',
    uploadDate: '2026-02-08',
  },
  {
    id: 'doc-004',
    name: 'HVAC_Maintenance_Contract_2026.pdf',
    size: 987000,
    type: 'application/pdf',
    propertyId: 'prop-005',
    uploadDate: '2026-01-15',
  },
  {
    id: 'doc-005',
    name: 'Warranty_Certificates_Bundle.xlsx',
    size: 1245000,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploadDate: '2026-02-01',
  },
  {
    id: 'doc-006',
    name: 'WO2026_0003_Permits_Electrical.pdf',
    size: 2102000,
    type: 'application/pdf',
    workOrderId: 'wo-003',
    uploadDate: '2026-02-12',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'warranty',
    title: 'Warranty Expiration Alert',
    message: 'Carrier HVAC (AquaEdge 19DV) warranty expires in 65 days',
    relatedInventoryId: 'inv-001',
    createdDate: '2026-02-20',
    readStatus: false,
    targetRole: 'manager',
  },
  {
    id: 'notif-002',
    type: 'warranty',
    title: 'Warranty Expiration Alert',
    message: 'Trane HVAC (XR15) warranty expires in 12 days',
    relatedInventoryId: 'inv-003',
    createdDate: '2026-02-28',
    readStatus: false,
    targetRole: 'manager',
  },
  {
    id: 'notif-003',
    type: 'warranty',
    title: 'Warranty Expired',
    message: 'Lennox HVAC (SL280V) warranty expired on 2024-11-22',
    relatedInventoryId: 'inv-004',
    createdDate: '2026-02-28',
    readStatus: true,
    targetRole: 'admin',
  },
  {
    id: 'notif-004',
    type: 'warranty',
    title: 'Warranty Expiration Alert',
    message: 'York HVAC (TECL Rooftop) warranty expires in 45 days',
    relatedInventoryId: 'inv-009',
    createdDate: '2026-02-15',
    readStatus: false,
    targetRole: 'manager',
  },
  {
    id: 'notif-005',
    type: 'warranty',
    title: 'Warranty Expiration Alert',
    message: 'Rinnai Tankless WH warranty expires in 67 days',
    relatedInventoryId: 'inv-019',
    createdDate: '2026-02-02',
    readStatus: true,
    targetRole: 'manager',
  },
  {
    id: 'notif-006',
    type: 'maintenance',
    title: 'Work Order Completed',
    message: 'WO-2026-0001 HVAC inspection completed. Review details.',
    relatedWorkOrderId: 'wo-001',
    createdDate: '2026-01-25',
    readStatus: true,
    targetRole: 'all',
  },
  {
    id: 'notif-007',
    type: 'warranty',
    title: 'Warranty Expiration Alert',
    message: 'Siemens Breaker Panel warranty expires in 73 days',
    relatedInventoryId: 'inv-008',
    createdDate: '2026-02-10',
    readStatus: false,
    targetRole: 'admin',
  },
  {
    id: 'notif-008',
    type: 'maintenance',
    title: 'Urgent Work Order',
    message: 'WO-2026-0009 HVAC condenser replacement - refrigerant leak. Requires immediate attention.',
    relatedWorkOrderId: 'wo-009',
    createdDate: '2026-02-16',
    readStatus: false,
    targetRole: 'admin',
  },
  {
    id: 'notif-009',
    type: 'warranty',
    title: 'Warranty Expiration Alert',
    message: 'Lutron Light Panel warranty expires in 76 days',
    relatedInventoryId: 'inv-012',
    createdDate: '2026-02-05',
    readStatus: false,
    targetRole: 'manager',
  },
  {
    id: 'notif-010',
    type: 'payment',
    title: 'Overdue Payment',
    message: 'Rent payment for prop-004 is overdue. Amount due: $2,200',
    createdDate: '2026-02-12',
    readStatus: true,
    targetRole: 'admin',
  },
  {
    id: 'notif-011',
    type: 'warranty',
    title: 'Warranty Expiration Alert',
    message: 'Kohler Bancroft Toilet warranty expires in 88 days',
    relatedInventoryId: 'inv-005',
    createdDate: '2026-01-20',
    readStatus: true,
    targetRole: 'manager',
  },
  {
    id: 'notif-012',
    type: 'maintenance',
    title: 'Work Order Update',
    message: 'WO-2026-0002 roof repair in progress. Update posted.',
    relatedWorkOrderId: 'wo-002',
    createdDate: '2026-02-05',
    readStatus: true,
    targetRole: 'all',
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'admin@pms.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: 'user-002',
    email: 'manager@pms.com',
    password: 'manager123',
    name: 'Property Manager',
    role: 'manager',
  },
  {
    id: 'user-003',
    email: 'demo@pms.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'user',
  },
];
