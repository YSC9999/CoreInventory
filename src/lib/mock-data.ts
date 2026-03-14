export const kpiData = {
  totalStock: { value: 24847, trend: "+12.5%", isPositive: true },
  lowStockItems: { value: 23, trend: "-5", isPositive: true },
  pendingReceipts: { value: 12, trend: "+3", isPositive: false },
  pendingDeliveries: { value: 8, trend: "Stable", isPositive: true },
  internalTransfers: { value: 5, trend: "+2", isPositive: true },
};

const staticProducts = [
  "Quantum Processor Node", "Plasma Conduit Tube", "Magnetic Containment Field",
  "Optical Sensor Array", "Hyper-drive Capacitor", "Neural Interface Link",
  "Titanium Hull Plating", "Zero-point Energy Cell", "Cryogenic Storage Unit",
  "Thermal Exhaust Port"
];

const staticSkus = [
  "SKU-A7F2K9", "SKU-B3M8L1", "SKU-C5Q9P2", "SKU-D8R4T7", "SKU-E2S6U3",
  "SKU-F9V1W4", "SKU-G6X3Y5", "SKU-H4Z7A1", "SKU-I8B2C6", "SKU-J3D5E9"
];

const staticCategories = ["Electronics", "Mechanical", "Energy", "Sensors", "Structural"];
const staticLocations = ["Sector A-1", "Sector B-2", "Sector C-3", "Sector D-4", "Sector E-5", "Sector A-6", "Sector B-7", "Sector C-8", "Sector D-9", "Sector E-1"];
const staticStatuses = ["In Stock", "In Stock", "Low Stock", "In Stock", "Out of Stock"];

export const productsData = Array.from({ length: 20 }, (_, i) => ({
  id: `PRD-${1000 + i}`,
  name: staticProducts[i % 10] + ` Mk ${Math.floor(i/10) + 1}`,
  sku: staticSkus[i % 10],
  category: staticCategories[i % 5],
  stock: 450 - (i * 23),
  location: staticLocations[i % 10],
  status: staticStatuses[i % 5],
  price: (1000 + i * 150).toFixed(2),
}));

export const activityData = [
  { id: 'ACT-0', time: '14:32', product: staticProducts[0], movement: 'RECEIPT', from: 'External', to: 'WH-Alpha', qty: 42 },
  { id: 'ACT-1', time: '13:15', product: staticProducts[1], movement: 'DELIVERY', from: 'WH-Beta', to: 'External', qty: 18 },
  { id: 'ACT-2', time: '12:48', product: staticProducts[2], movement: 'TRANSFER', from: 'WH-Alpha', to: 'WH-Beta', qty: 25 },
  { id: 'ACT-3', time: '11:22', product: staticProducts[3], movement: 'RECEIPT', from: 'External', to: 'WH-Beta', qty: 35 },
  { id: 'ACT-4', time: '10:05', product: staticProducts[4], movement: 'DELIVERY', from: 'WH-Alpha', to: 'External', qty: 12 },
  { id: 'ACT-5', time: '09:40', product: staticProducts[5], movement: 'TRANSFER', from: 'WH-Beta', to: 'WH-Alpha', qty: 28 },
  { id: 'ACT-6', time: '08:25', product: staticProducts[6], movement: 'RECEIPT', from: 'External', to: 'WH-Beta', qty: 50 },
  { id: 'ACT-7', time: '07:30', product: staticProducts[7], movement: 'DELIVERY', from: 'WH-Alpha', to: 'External', qty: 22 },
];

export const chartData = [
  { name: 'Mon', in: 4000, out: 2400 },
  { name: 'Tue', in: 3000, out: 1398 },
  { name: 'Wed', in: 2000, out: 9800 },
  { name: 'Thu', in: 2780, out: 3908 },
  { name: 'Fri', in: 1890, out: 4800 },
  { name: 'Sat', in: 2390, out: 3800 },
  { name: 'Sun', in: 3490, out: 4300 },
];

export const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Mechanical', value: 300 },
  { name: 'Energy', value: 300 },
  { name: 'Sensors', value: 200 },
  { name: 'Structural', value: 278 },
];

export const receiptsData = [
  { id: 'RC-2000', date: '2026-03-14', supplier: 'OmniCorp', status: 'Done', itemsCount: 12 },
  { id: 'RC-2001', date: '2026-03-13', supplier: 'CyberDyne', status: 'Ready', itemsCount: 8 },
  { id: 'RC-2002', date: '2026-03-12', supplier: 'Weyland-Yutani', status: 'Waiting', itemsCount: 5 },
  { id: 'RC-2003', date: '2026-03-11', supplier: 'Stark Industries', status: 'Done', itemsCount: 15 },
  { id: 'RC-2004', date: '2026-03-10', supplier: 'OmniCorp', status: 'Draft', itemsCount: 3 },
  { id: 'RC-2005', date: '2026-03-09', supplier: 'CyberDyne', status: 'Ready', itemsCount: 9 },
  { id: 'RC-2006', date: '2026-03-08', supplier: 'Weyland-Yutani', status: 'Done', itemsCount: 11 },
  { id: 'RC-2007', date: '2026-03-07', supplier: 'Stark Industries', status: 'Waiting', itemsCount: 7 },
  { id: 'RC-2008', date: '2026-03-06', supplier: 'OmniCorp', status: 'Done', itemsCount: 14 },
  { id: 'RC-2009', date: '2026-03-05', supplier: 'CyberDyne', status: 'Ready', itemsCount: 6 },
];

export const deliveriesData = [
  { id: 'DL-3000', date: '2026-03-14', customer: 'Tyrell Corp', status: 'Done', itemsCount: 8 },
  { id: 'DL-3001', date: '2026-03-13', customer: 'Massive Dynamic', status: 'Ready', itemsCount: 5 },
  { id: 'DL-3002', date: '2026-03-12', customer: 'Umbrella Corp', status: 'Waiting', itemsCount: 3 },
  { id: 'DL-3003', date: '2026-03-11', customer: 'UAC', status: 'Done', itemsCount: 7 },
  { id: 'DL-3004', date: '2026-03-10', customer: 'Tyrell Corp', status: 'Draft', itemsCount: 2 },
  { id: 'DL-3005', date: '2026-03-09', customer: 'Massive Dynamic', status: 'Ready', itemsCount: 6 },
  { id: 'DL-3006', date: '2026-03-08', customer: 'Umbrella Corp', status: 'Done', itemsCount: 4 },
  { id: 'DL-3007', date: '2026-03-07', customer: 'UAC', status: 'Waiting', itemsCount: 5 },
  { id: 'DL-3008', date: '2026-03-06', customer: 'Tyrell Corp', status: 'Done', itemsCount: 9 },
  { id: 'DL-3009', date: '2026-03-05', customer: 'Massive Dynamic', status: 'Ready', itemsCount: 3 },
];

export const ledgerData = [
  { id: 'LDG-5000', timestamp: '2026-03-14 14:30:45', product: 'Quantum Processor Node', type: 'IN', fromLoc: 'Zone-1', toLoc: 'Zone-2', qty: 42 },
  { id: 'LDG-5001', timestamp: '2026-03-14 13:15:20', product: 'Plasma Conduit Tube', type: 'OUT', fromLoc: 'Zone-2', toLoc: 'Zone-5', qty: 18 },
  { id: 'LDG-5002', timestamp: '2026-03-14 12:45:10', product: 'Magnetic Containment Field', type: 'TRANSFER', fromLoc: 'Zone-3', toLoc: 'Zone-1', qty: 25 },
  { id: 'LDG-5003', timestamp: '2026-03-14 11:20:30', product: 'Optical Sensor Array', type: 'IN', fromLoc: 'Zone-4', toLoc: 'Zone-3', qty: 35 },
  { id: 'LDG-5004', timestamp: '2026-03-14 10:05:15', product: 'Hyper-drive Capacitor', type: 'OUT', fromLoc: 'Zone-1', toLoc: 'Zone-2', qty: 12 },
  { id: 'LDG-5005', timestamp: '2026-03-14 09:40:00', product: 'Neural Interface Link', type: 'TRANSFER', fromLoc: 'Zone-2', toLoc: 'Zone-4', qty: 28 },
  { id: 'LDG-5006', timestamp: '2026-03-14 08:25:50', product: 'Titanium Hull Plating', type: 'IN', fromLoc: 'Zone-5', toLoc: 'Zone-1', qty: 50 },
  { id: 'LDG-5007', timestamp: '2026-03-14 07:30:25', product: 'Zero-point Energy Cell', type: 'OUT', fromLoc: 'Zone-1', toLoc: 'Zone-3', qty: 22 },
  { id: 'LDG-5008', timestamp: '2026-03-13 16:15:40', product: 'Cryogenic Storage Unit', type: 'TRANSFER', fromLoc: 'Zone-3', toLoc: 'Zone-5', qty: 15 },
  { id: 'LDG-5009', timestamp: '2026-03-13 15:50:35', product: 'Thermal Exhaust Port', type: 'IN', fromLoc: 'Zone-2', toLoc: 'Zone-4', qty: 33 },
  { id: 'LDG-5010', timestamp: '2026-03-13 14:30:10', product: 'Quantum Processor Node', type: 'OUT', fromLoc: 'Zone-4', toLoc: 'Zone-2', qty: 19 },
  { id: 'LDG-5011', timestamp: '2026-03-13 13:15:45', product: 'Plasma Conduit Tube', type: 'IN', fromLoc: 'Zone-1', toLoc: 'Zone-3', qty: 26 },
  { id: 'LDG-5012', timestamp: '2026-03-13 12:00:20', product: 'Magnetic Containment Field', type: 'TRANSFER', fromLoc: 'Zone-5', toLoc: 'Zone-1', qty: 44 },
  { id: 'LDG-5013', timestamp: '2026-03-13 11:30:55', product: 'Optical Sensor Array', type: 'OUT', fromLoc: 'Zone-2', toLoc: 'Zone-3', qty: 11 },
  { id: 'LDG-5014', timestamp: '2026-03-13 10:45:30', product: 'Hyper-drive Capacitor', type: 'IN', fromLoc: 'Zone-4', toLoc: 'Zone-5', qty: 38 },
  { id: 'LDG-5015', timestamp: '2026-03-13 09:20:15', product: 'Neural Interface Link', type: 'IN', fromLoc: 'Zone-1', toLoc: 'Zone-2', qty: 27 },
  { id: 'LDG-5016', timestamp: '2026-03-13 08:55:40', product: 'Titanium Hull Plating', type: 'OUT', fromLoc: 'Zone-3', toLoc: 'Zone-4', qty: 16 },
  { id: 'LDG-5017', timestamp: '2026-03-13 07:30:25', product: 'Zero-point Energy Cell', type: 'TRANSFER', fromLoc: 'Zone-5', toLoc: 'Zone-2', qty: 32 },
  { id: 'LDG-5018', timestamp: '2026-03-12 16:10:50', product: 'Cryogenic Storage Unit', type: 'IN', fromLoc: 'Zone-2', toLoc: 'Zone-1', qty: 21 },
  { id: 'LDG-5019', timestamp: '2026-03-12 15:45:35', product: 'Thermal Exhaust Port', type: 'OUT', fromLoc: 'Zone-4', toLoc: 'Zone-3', qty: 29 },
];

export const warehousesData = [
  { id: 'WH-1', name: 'Alpha Hub', location: 'New New York', capacity: 100000, used: 85400, status: 'Active' },
  { id: 'WH-2', name: 'Beta Storage', location: 'Neo Tokyo', capacity: 50000, used: 21000, status: 'Active' },
  { id: 'WH-3', name: 'Gamma Facility', location: 'Luna City', capacity: 150000, used: 142000, status: 'Warning' },
  { id: 'WH-4', name: 'Delta Depot', location: 'Mars Prime', capacity: 75000, used: 12000, status: 'Active' },
  { id: 'WH-5', name: 'Epsilon Node', location: 'Europa Point', capacity: 25000, used: 24500, status: 'Critical' },
  { id: 'WH-6', name: 'Zeta Base', location: 'Titan Station', capacity: 300000, used: 50000, status: 'Active' },
];

export const adjustmentsData = [
  { id: 'ADJ-6000', date: '2026-03-14', product: 'Quantum Processor Node', location: 'Zone-1', expectedQty: 100, countedQty: 98, status: 'Done', difference: -2 },
  { id: 'ADJ-6001', date: '2026-03-14', product: 'Plasma Conduit Tube', location: 'Zone-2', expectedQty: 80, countedQty: 82, status: 'Done', difference: 2 },
  { id: 'ADJ-6002', date: '2026-03-13', product: 'Magnetic Containment Field', location: 'Zone-3', expectedQty: 120, countedQty: 115, status: 'In Progress', difference: -5 },
  { id: 'ADJ-6003', date: '2026-03-13', product: 'Optical Sensor Array', location: 'Zone-4', expectedQty: 95, countedQty: 95, status: 'Done', difference: 0 },
  { id: 'ADJ-6004', date: '2026-03-12', product: 'Hyper-drive Capacitor', location: 'Zone-5', expectedQty: 70, countedQty: 69, status: 'Done', difference: -1 },
  { id: 'ADJ-6005', date: '2026-03-12', product: 'Neural Interface Link', location: 'Zone-1', expectedQty: 110, countedQty: 112, status: 'Done', difference: 2 },
  { id: 'ADJ-6006', date: '2026-03-11', product: 'Titanium Hull Plating', location: 'Zone-2', expectedQty: 90, countedQty: 88, status: 'Cancelled', difference: -2 },
  { id: 'ADJ-6007', date: '2026-03-11', product: 'Zero-point Energy Cell', location: 'Zone-3', expectedQty: 75, countedQty: 77, status: 'Draft', difference: 2 },
  { id: 'ADJ-6008', date: '2026-03-10', product: 'Cryogenic Storage Unit', location: 'Zone-4', expectedQty: 105, countedQty: 103, status: 'Done', difference: -2 },
  { id: 'ADJ-6009', date: '2026-03-10', product: 'Thermal Exhaust Port', location: 'Zone-5', expectedQty: 85, countedQty: 86, status: 'In Progress', difference: 1 },
];

export const moveHistoryData = [
  { id: 'MOV-8000', dateTime: '2026-03-14 14:32:00', type: 'RECEIPT', fromWarehouse: 'Vendor', toWarehouse: 'WH-Alpha', product: 'Quantum Processor Node', qty: 42, operator: 'Alex Johnson', reference: 'REF-1042' },
  { id: 'MOV-8001', dateTime: '2026-03-14 13:15:30', type: 'DELIVERY', fromWarehouse: 'WH-Beta', toWarehouse: 'Customer', product: 'Plasma Conduit Tube', qty: 18, operator: 'Sarah Connor', reference: 'REF-2015' },
  { id: 'MOV-8002', dateTime: '2026-03-14 12:48:45', type: 'TRANSFER', fromWarehouse: 'WH-Alpha', toWarehouse: 'WH-Beta', product: 'Magnetic Containment Field', qty: 25, operator: 'John Smith', reference: 'REF-3089' },
  { id: 'MOV-8003', dateTime: '2026-03-14 11:22:15', type: 'RECEIPT', fromWarehouse: 'Vendor', toWarehouse: 'WH-Beta', product: 'Optical Sensor Array', qty: 35, operator: 'Alex Johnson', reference: 'REF-1567' },
  { id: 'MOV-8004', dateTime: '2026-03-14 10:05:50', type: 'DELIVERY', fromWarehouse: 'WH-Alpha', toWarehouse: 'Customer', product: 'Hyper-drive Capacitor', qty: 12, operator: 'Sarah Connor', reference: 'REF-2234' },
  { id: 'MOV-8005', dateTime: '2026-03-14 09:40:20', type: 'TRANSFER', fromWarehouse: 'WH-Beta', toWarehouse: 'WH-Alpha', product: 'Neural Interface Link', qty: 28, operator: 'John Smith', reference: 'REF-3456' },
  { id: 'MOV-8006', dateTime: '2026-03-14 08:25:35', type: 'RECEIPT', fromWarehouse: 'Vendor', toWarehouse: 'WH-Beta', product: 'Titanium Hull Plating', qty: 50, operator: 'Alex Johnson', reference: 'REF-1789' },
  { id: 'MOV-8007', dateTime: '2026-03-14 07:30:10', type: 'DELIVERY', fromWarehouse: 'WH-Alpha', toWarehouse: 'Customer', product: 'Zero-point Energy Cell', qty: 22, operator: 'Sarah Connor', reference: 'REF-2890' },
  { id: 'MOV-8008', dateTime: '2026-03-13 16:15:25', type: 'TRANSFER', fromWarehouse: 'WH-Beta', toWarehouse: 'WH-Alpha', product: 'Cryogenic Storage Unit', qty: 15, operator: 'John Smith', reference: 'REF-3111' },
  { id: 'MOV-8009', dateTime: '2026-03-13 15:50:40', type: 'RECEIPT', fromWarehouse: 'Vendor', toWarehouse: 'WH-Alpha', product: 'Thermal Exhaust Port', qty: 33, operator: 'Alex Johnson', reference: 'REF-1222' },
  { id: 'MOV-8010', dateTime: '2026-03-13 14:30:55', type: 'DELIVERY', fromWarehouse: 'WH-Beta', toWarehouse: 'Customer', product: 'Quantum Processor Node', qty: 19, operator: 'Sarah Connor', reference: 'REF-2333' },
  { id: 'MOV-8011', dateTime: '2026-03-13 13:15:30', type: 'TRANSFER', fromWarehouse: 'WH-Alpha', toWarehouse: 'WH-Beta', product: 'Plasma Conduit Tube', qty: 26, operator: 'John Smith', reference: 'REF-3444' },
  { id: 'MOV-8012', dateTime: '2026-03-13 12:00:15', type: 'RECEIPT', fromWarehouse: 'Vendor', toWarehouse: 'WH-Beta', product: 'Magnetic Containment Field', qty: 44, operator: 'Alex Johnson', reference: 'REF-1555' },
  { id: 'MOV-8013', dateTime: '2026-03-13 11:30:45', type: 'DELIVERY', fromWarehouse: 'WH-Alpha', toWarehouse: 'Customer', product: 'Optical Sensor Array', qty: 11, operator: 'Sarah Connor', reference: 'REF-2666' },
  { id: 'MOV-8014', dateTime: '2026-03-13 10:45:20', type: 'TRANSFER', fromWarehouse: 'WH-Beta', toWarehouse: 'WH-Alpha', product: 'Hyper-drive Capacitor', qty: 38, operator: 'John Smith', reference: 'REF-3777' },
  { id: 'MOV-8015', dateTime: '2026-03-13 09:20:35', type: 'RECEIPT', fromWarehouse: 'Vendor', toWarehouse: 'WH-Alpha', product: 'Neural Interface Link', qty: 27, operator: 'Alex Johnson', reference: 'REF-1888' },
  { id: 'MOV-8016', dateTime: '2026-03-13 08:55:50', type: 'DELIVERY', fromWarehouse: 'WH-Beta', toWarehouse: 'Customer', product: 'Titanium Hull Plating', qty: 16, operator: 'Sarah Connor', reference: 'REF-2999' },
  { id: 'MOV-8017', dateTime: '2026-03-13 07:30:10', type: 'TRANSFER', fromWarehouse: 'WH-Alpha', toWarehouse: 'WH-Beta', product: 'Zero-point Energy Cell', qty: 32, operator: 'John Smith', reference: 'REF-3000' },
  { id: 'MOV-8018', dateTime: '2026-03-12 16:10:25', type: 'RECEIPT', fromWarehouse: 'Vendor', toWarehouse: 'WH-Beta', product: 'Cryogenic Storage Unit', qty: 21, operator: 'Alex Johnson', reference: 'REF-1111' },
  { id: 'MOV-8019', dateTime: '2026-03-12 15:45:40', type: 'DELIVERY', fromWarehouse: 'WH-Alpha', toWarehouse: 'Customer', product: 'Thermal Exhaust Port', qty: 29, operator: 'Sarah Connor', reference: 'REF-2222' },
];

export const transfersData = [
  { id: 'TRF-4000', date: '2026-03-14', fromWarehouse: 'WH-Alpha', toWarehouse: 'WH-Beta', status: 'Done', itemsCount: 12 },
  { id: 'TRF-4001', date: '2026-03-14', fromWarehouse: 'WH-Beta', toWarehouse: 'Gamma Facility', status: 'Ready', itemsCount: 8 },
  { id: 'TRF-4002', date: '2026-03-13', fromWarehouse: 'Gamma Facility', toWarehouse: 'WH-Alpha', status: 'Waiting', itemsCount: 5 },
  { id: 'TRF-4003', date: '2026-03-13', fromWarehouse: 'WH-Alpha', toWarehouse: 'WH-Beta', status: 'Done', itemsCount: 15 },
  { id: 'TRF-4004', date: '2026-03-12', fromWarehouse: 'WH-Beta', toWarehouse: 'Gamma Facility', status: 'Draft', itemsCount: 3 },
  { id: 'TRF-4005', date: '2026-03-12', fromWarehouse: 'Gamma Facility', toWarehouse: 'WH-Alpha', status: 'Ready', itemsCount: 9 },
  { id: 'TRF-4006', date: '2026-03-11', fromWarehouse: 'WH-Alpha', toWarehouse: 'WH-Beta', status: 'Done', itemsCount: 11 },
  { id: 'TRF-4007', date: '2026-03-11', fromWarehouse: 'WH-Beta', toWarehouse: 'Gamma Facility', status: 'Waiting', itemsCount: 7 },
  { id: 'TRF-4008', date: '2026-03-10', fromWarehouse: 'Gamma Facility', toWarehouse: 'WH-Alpha', status: 'Done', itemsCount: 14 },
  { id: 'TRF-4009', date: '2026-03-10', fromWarehouse: 'WH-Alpha', toWarehouse: 'WH-Beta', status: 'Ready', itemsCount: 6 },
];