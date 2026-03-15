# Database Schema Reference — CoreInventory

Complete reference for the CoreInventory database schema with detailed field descriptions and relationships.

---

## 📊 Schema Overview

```
Organization (Multi-tenancy root)
├── Users
├── Warehouses
│   └── Locations
│       └── Stocks (Real-time levels)
├── Categories
├── Items
├── Receipts
│   └── Receipt Lines
├── Deliveries
│   └── Delivery Lines
└── Transactions (Audit trail)
```

---

## 1️⃣ Organization (Multi-Tenancy Root)

**Table:** `organization`

**Purpose:** Root entity for multi-tenant isolation. All data belongs to an organization.

| Field      | Type              | Constraints        | Description                            |
| ---------- | ----------------- | ------------------ | -------------------------------------- |
| `id`       | String (CUID)     | PRIMARY KEY        | Unique identifier                      |
| `name`     | String            | NOT NULL           | Organization name (e.g., "Warehouse Inc") |
| `inviteCode` | String          | UNIQUE NOT NULL    | Code for new user invitations          |
| `createdAt` | DateTime         | DEFAULT now()      | Creation timestamp                     |

**Relations:**
- → `users` (1-to-many)
- → `warehouses` (1-to-many)
- → `items` (1-to-many)
- → `categories` (1-to-many)
- → `receipts` (1-to-many)
- → `deliveries` (1-to-many)
- → `transactions` (1-to-many)

**Indexes:**
- `inviteCode` (UNIQUE)

**Example:**

```prisma
{
  id: "cuid-org-001",
  name: "Acme Corporation",
  inviteCode: "ACME-2026",
  createdAt: "2026-03-01T00:00:00Z"
}
```

---

## 2️⃣ User (Authentication & Authorization)

**Table:** `user`

**Purpose:** System users with role-based access control.

| Field           | Type              | Constraints         | Description                         |
| --------------- | ----------------- | ------------------- | ----------------------------------- |
| `id`            | String (CUID)     | PRIMARY KEY         | Unique identifier                   |
| `email`         | String            | UNIQUE NOT NULL     | User email (login credential)       |
| `name`          | String?           | NULLABLE            | User full name                      |
| `password`      | String            | NOT NULL            | Hashed password (bcryptjs)          |
| `role`          | Enum              | NOT NULL, DEFAULT   | SUPER_ADMIN / MANAGER / WAREHOUSE_STAFF |
| `organizationId` | String (FK)      | NOT NULL, INDEX     | Reference to Organization           |
| `verified`      | Boolean           | DEFAULT false       | Email verification status           |
| `createdAt`     | DateTime          | DEFAULT now()       | Creation timestamp                  |
| `updatedAt`     | DateTime          | @updatedAt          | Last modification timestamp         |

**Relations:**
- ← `organization` (many-to-1)
- → `receipts` (1-to-many, createdBy)
- → `deliveries` (1-to-many, createdBy)
- → `transactions` (1-to-many, createdBy)

**Enums:**

```prisma
enum Role {
  SUPER_ADMIN       // Full system access, user management
  MANAGER           // Create receipts/deliveries, manage inventory
  WAREHOUSE_STAFF   // View-only, confirm operations
}
```

**Indexes:**
- `email` (UNIQUE)
- `organizationId`

**Example:**

```prisma
{
  id: "user-001",
  email: "manager@acme.com",
  name: "Alice Manager",
  password: "$2a$10$...", // bcryptjs hash
  role: "MANAGER",
  organizationId: "org-001",
  verified: true,
  createdAt: "2026-03-01T00:00:00Z"
}
```

---

## 3️⃣ Warehouse (Physical Facility)

**Table:** `warehouse`

**Purpose:** Physical facilities (buildings, warehouses, distribution centers).

| Field           | Type              | Constraints         | Description                     |
| --------------- | ----------------- | ------------------- | ------------------------------- |
| `id`            | String (CUID)     | PRIMARY KEY         | Unique identifier               |
| `name`          | String            | NOT NULL            | Warehouse name (e.g., "Main DC") |
| `shortCode`     | String            | NOT NULL, INDEX     | Code for display (e.g., "MW")   |
| `address`       | String?           | NULLABLE            | Physical address                |
| `organizationId` | String (FK)      | NOT NULL, INDEX     | Reference to Organization       |
| `createdAt`     | DateTime          | DEFAULT now()       | Creation timestamp              |

**Relations:**
- ← `organization` (many-to-1)
- → `locations` (1-to-many)
- → `receipts` (1-to-many, receivedAt)
- → `deliveries` (1-to-many, shippedFrom)

**Unique Constraint:**
- `(shortCode, organizationId)` — Short code must be unique per org

**Indexes:**
- `(shortCode, organizationId)` (UNIQUE)
- `organizationId`

**Example:**

```prisma
{
  id: "wh-001",
  name: "Main Warehouse",
  shortCode: "MW",
  address: "123 Storage Lane, City, State",
  organizationId: "org-001",
  createdAt: "2026-03-01T00:00:00Z"
}
```

---

## 4️⃣ Location (Storage Zone)

**Table:** `location`

**Purpose:** Storage locations within warehouses (shelves, racks, zones, bins).

| Field       | Type              | Constraints         | Description               |
| ----------- | ----------------- | ------------------- | ------------------------- |
| `id`        | String (CUID)     | PRIMARY KEY         | Unique identifier         |
| `name`      | String            | NOT NULL            | Location name (e.g., "A-1") |
| `shortCode` | String            | NOT NULL, INDEX     | Display code              |
| `warehouseId` | String (FK)     | NOT NULL, INDEX     | Reference to Warehouse    |
| `createdAt` | DateTime          | DEFAULT now()       | Creation timestamp        |

**Relations:**
- ← `warehouse` (many-to-1)
- → `stocks` (1-to-many)
- → `transactions` (1-to-many, fromLocation)
- → `transactions` (1-to-many, toLocation)

**Unique Constraint:**
- `(shortCode, warehouseId)` — Location code unique per warehouse

**Indexes:**
- `(shortCode, warehouseId)` (UNIQUE)
- `warehouseId`

**Example:**

```prisma
{
  id: "loc-001",
  name: "Shelf A1",
  shortCode: "A1",
  warehouseId: "wh-001",
  createdAt: "2026-03-01T00:00:00Z"
}
```

---

## 5️⃣ Category (Product Classification)

**Table:** `category`

**Purpose:** Organize products into categories for filtering and reporting.

| Field           | Type              | Constraints         | Description           |
| --------------- | ----------------- | ------------------- | --------------------- |
| `id`            | String (CUID)     | PRIMARY KEY         | Unique identifier     |
| `name`          | String            | NOT NULL            | Category name         |
| `organizationId` | String (FK)      | NOT NULL, INDEX     | Reference to Org      |

**Relations:**
- ← `organization` (many-to-1)
- → `items` (1-to-many)

**Unique Constraint:**
- `(name, organizationId)` — Category names unique per org

**Indexes:**
- `(name, organizationId)` (UNIQUE)
- `organizationId`

**Example:**

```prisma
{
  id: "cat-001",
  name: "Electronics",
  organizationId: "org-001"
}
```

---

## 6️⃣ Item (Inventory Product)

**Table:** `item`

**Purpose:** The core inventory item/SKU. Every stock movement is for an item.

| Field           | Type              | Constraints         | Description                          |
| --------------- | ----------------- | ------------------- | ------------------------------------ |
| `id`            | String (CUID)     | PRIMARY KEY         | Unique identifier                    |
| `sku`           | String            | NOT NULL, INDEX     | Stock Keeping Unit (unique per org) |
| `name`          | String            | NOT NULL            | Product name                         |
| `description`   | String?           | NULLABLE            | Long description                     |
| `uom`           | Enum              | DEFAULT "UNIT"      | Unit of Measure                      |
| `minStock`      | Int               | DEFAULT 0           | Minimum stock threshold (reorder point) |
| `categoryId`    | String (FK)?      | NULLABLE, INDEX     | Reference to Category               |
| `organizationId` | String (FK)      | NOT NULL, INDEX     | Reference to Organization            |
| `createdAt`     | DateTime          | DEFAULT now()       | Creation timestamp                   |
| `updatedAt`     | DateTime          | @updatedAt          | Last modification timestamp          |

**Relations:**
- ← `organization` (many-to-1)
- ← `category` (many-to-1, optional)
- → `stocks` (1-to-many)
- → `receiptLines` (1-to-many)
- → `deliveryLines` (1-to-many)
- → `transactions` (1-to-many)

**Enums:**

```prisma
enum UnitOfMeasure {
  UNIT      // Individual items
  KG        // Kilograms (weight)
  LITRE     // Liters (volume)
  BOX       // Box/Case
  METRE     // Meters (length)
}
```

**Unique Constraint:**
- `(sku, organizationId)` — SKU must be unique per org

**Indexes:**
- `(sku, organizationId)` (UNIQUE)
- `organizationId`
- `categoryId`

**Example:**

```prisma
{
  id: "item-001",
  sku: "PROD-2026-001",
  name: "Widget Pro",
  description: "High-quality widget for industrial use",
  uom: "UNIT",
  minStock: 10,
  categoryId: "cat-001",
  organizationId: "org-001",
  createdAt: "2026-03-01T00:00:00Z"
}
```

---

## 7️⃣ Stock (Real-time Inventory Level)

**Table:** `stock`

**Purpose:** Real-time quantity of each item at each location.

**CRITICAL:** `Stock.quantity` is **calculated automatically** from transactions and is the source of truth for inventory levels.

| Field      | Type              | Constraints         | Description                |
| ---------- | ----------------- | ------------------- | -------------------------- |
| `id`       | String (CUID)     | PRIMARY KEY         | Unique identifier          |
| `itemId`   | String (FK)       | NOT NULL, INDEX     | Reference to Item          |
| `locationId` | String (FK)     | NOT NULL, INDEX     | Reference to Location      |
| `quantity` | Int               | DEFAULT 0           | Current stock level        |

**Relations:**
- ← `item` (many-to-1)
- ← `location` (many-to-1)

**Unique Constraint:**
- `(itemId, locationId)` — Only one stock record per item/location pair

**Indexes:**
- `(itemId, locationId)` (UNIQUE)
- `itemId`
- `locationId`

**Auto-Calculation Logic:**

```
quantity = SUM(
  CASE transaction.type
    WHEN 'IN'          THEN +transaction.quantity
    WHEN 'OUT'         THEN -transaction.quantity
    WHEN 'TRANSFER'    AND fromLocationId == locationId THEN -quantity
                       AND toLocationId == locationId THEN +quantity
    WHEN 'ADJUSTMENT'  THEN variance
  END
  WHERE item.id = Stock.itemId
    AND location.id = Stock.locationId
)
```

**Example:**

```prisma
{
  id: "stock-001",
  itemId: "item-001",
  locationId: "loc-001",
  quantity: 150  // Result of all transactions
}
```

---

## 8️⃣ Receipt (Inbound Shipment)

**Table:** `receipt`

**Purpose:** Incoming shipment record. Groups related received items.

| Field         | Type              | Constraints         | Description                           |
| ------------- | ----------------- | ------------------- | ------------------------------------- |
| `id`          | String (CUID)     | PRIMARY KEY         | Unique identifier                     |
| `reference`   | String            | NOT NULL, INDEX     | Auto-gen: REC/YYYY/NNNNN              |
| `supplierName` | String           | NULLABLE            | Vendor/supplier name                  |
| `status`      | Enum              | NOT NULL, DEFAULT   | DRAFT → WAITING → READY → DONE        |
| `warehouseId` | String (FK)       | NOT NULL, INDEX     | Where goods received                  |
| `createdBy`   | String (FK)       | NOT NULL, INDEX     | User who created receipt              |
| `organizationId` | String (FK)    | NOT NULL, INDEX     | Reference to Organization             |
| `createdAt`   | DateTime          | DEFAULT now()       | Creation timestamp                    |
| `updatedAt`   | DateTime          | @updatedAt          | Last modification timestamp           |

**Relations:**
- ← `warehouse` (many-to-1)
- ← `user` (many-to-1, createdBy)
- ← `organization` (many-to-1)
- → `receiptLines` (1-to-many)

**Enums:**

```prisma
enum OperationStatus {
  DRAFT       // Initial state, being planned
  WAITING     // Awaiting physical goods
  READY       // Goods received, ready for validation
  DONE        // Validated, stock updated
  CANCELED    // Operation canceled
}
```

**Status Flow:**

```
Creation: DRAFT → (Preview)
Submission: WAITING → (Wait for goods/trucks)
Receipt: READY → (Physical goods arrived)
Validation: DONE ✓
Cancelation: → CANCELED (any state)
```

**Indexes:**
- `reference`
- `warehouseId`
- `createdBy`
- `organizationId`

**Example:**

```prisma
{
  id: "rec-001",
  reference: "REC/2026/00001",
  supplierName: "Global Supplies Ltd",
  status: "DONE",
  warehouseId: "wh-001",
  createdBy: "user-001",
  organizationId: "org-001",
  createdAt: "2026-03-15T10:00:00Z"
}
```

---

## 9️⃣ ReceiptLine (Receipt Detail)

**Table:** `receiptline`

**Purpose:** Individual line item in a receipt (what items, how many).

| Field       | Type              | Constraints         | Description                    |
| ----------- | ----------------- | ------------------- | ------------------------------ |
| `id`        | String (CUID)     | PRIMARY KEY         | Unique identifier              |
| `itemId`    | String (FK)       | NOT NULL, INDEX     | Reference to Item              |
| `receiptId` | String (FK)       | NOT NULL, INDEX     | Reference to Receipt           |
| `quantity`  | Int               | NOT NULL            | Quantity received              |
| `createdAt` | DateTime          | DEFAULT now()       | Creation timestamp             |

**Relations:**
- ← `item` (many-to-1)
- ← `receipt` (many-to-1)

**Indexes:**
- `itemId`
- `receiptId`

**Example:**

```prisma
{
  id: "rcvl-001",
  itemId: "item-001",
  receiptId: "rec-001",
  quantity: 50,
  createdAt: "2026-03-15T10:00:00Z"
}
```

---

## 🔟 Delivery (Outbound Shipment)

**Table:** `delivery`

**Purpose:** Outgoing shipment record. Groups related shipped items.

| Field         | Type              | Constraints         | Description                           |
| ------------- | ----------------- | ------------------- | ------------------------------------- |
| `id`          | String (CUID)     | PRIMARY KEY         | Unique identifier                     |
| `reference`   | String            | NOT NULL, INDEX     | Auto-gen: DEL/YYYY/NNNNN              |
| `destination` | String            | NULLABLE            | Customer/destination address          |
| `status`      | Enum              | NOT NULL, DEFAULT   | DRAFT → WAITING → READY → DONE        |
| `warehouseId` | String (FK)       | NOT NULL, INDEX     | Source warehouse                      |
| `createdBy`   | String (FK)       | NOT NULL, INDEX     | User who created delivery             |
| `organizationId` | String (FK)    | NOT NULL, INDEX     | Reference to Organization             |
| `createdAt`   | DateTime          | DEFAULT now()       | Creation timestamp                    |
| `updatedAt`   | DateTime          | @updatedAt          | Last modification timestamp           |

**Relations:**
- ← `warehouse` (many-to-1)
- ← `user` (many-to-1, createdBy)
- ← `organization` (many-to-1)
- → `deliveryLines` (1-to-many)

**Status Flow:** Same as Receipt (DRAFT → WAITING → READY → DONE / CANCELED)

**Indexes:**
- `reference`
- `warehouseId`
- `createdBy`
- `organizationId`

**Example:**

```prisma
{
  id: "del-001",
  reference: "DEL/2026/00001",
  destination: "Client Site A, 789 Commerce Park",
  status: "DONE",
  warehouseId: "wh-001",
  createdBy: "user-001",
  organizationId: "org-001",
  createdAt: "2026-03-15T11:00:00Z"
}
```

---

## 1️⃣1️⃣ DeliveryLine (Delivery Detail)

**Table:** `deliveryline`

**Purpose:** Individual line item in a delivery (what items, how many).

| Field       | Type              | Constraints         | Description                    |
| ----------- | ----------------- | ------------------- | ------------------------------ |
| `id`        | String (CUID)     | PRIMARY KEY         | Unique identifier              |
| `itemId`    | String (FK)       | NOT NULL, INDEX     | Reference to Item              |
| `deliveryId` | String (FK)      | NOT NULL, INDEX     | Reference to Delivery          |
| `quantity`  | Int               | NOT NULL            | Quantity to ship               |
| `createdAt` | DateTime          | DEFAULT now()       | Creation timestamp             |

**Relations:**
- ← `item` (many-to-1)
- ← `delivery` (many-to-1)

**Indexes:**
- `itemId`
- `deliveryId`

**Example:**

```prisma
{
  id: "dvl-001",
  itemId: "item-001",
  deliveryId: "del-001",
  quantity: 25,
  createdAt: "2026-03-15T11:00:00Z"
}
```

---

## 1️⃣2️⃣ Transaction (Audit Trail)

**Table:** `transaction`

**Purpose:** Complete audit trail of all inventory movements. Immutable record.

| Field          | Type              | Constraints         | Description                        |
| -------------- | ----------------- | ------------------- | ---------------------------------- |
| `id`           | String (CUID)     | PRIMARY KEY         | Unique identifier                  |
| `reference`    | String            | NOT NULL, INDEX     | Transaction reference              |
| `type`         | Enum              | NOT NULL, INDEX     | IN / OUT / TRANSFER / ADJUSTMENT  |
| `itemId`       | String (FK)       | NOT NULL, INDEX     | Reference to Item                  |
| `quantity`     | Int               | NOT NULL            | Signed quantity (positive/negative) |
| `fromLocationId` | String (FK)?    | NULLABLE, INDEX     | Source location (for TRANSFER)     |
| `toLocationId` | String (FK)?      | NULLABLE, INDEX     | Destination location               |
| `reason`       | String?           | NULLABLE            | Adjustment reason (for ADJUSTMENT) |
| `notes`        | String?           | NULLABLE            | Additional notes                   |
| `createdBy`    | String (FK)       | NOT NULL, INDEX     | User who recorded transaction      |
| `organizationId` | String (FK)     | NOT NULL, INDEX     | Reference to Organization          |
| `createdAt`    | DateTime          | DEFAULT now()       | Transaction timestamp              |

**Relations:**
- ← `item` (many-to-1)
- ← `location` (many-to-1, fromLocation)
- ← `location` (many-to-1, toLocation)
- ← `user` (many-to-1, createdBy)
- ← `organization` (many-to-1)

**Enums:**

```prisma
enum TransactionType {
  IN          // Inbound: Receipt validation → stock ++
  OUT         // Outbound: Delivery validation → stock --
  TRANSFER    // Internal: From location to location
  ADJUSTMENT  // Manual: Physical count reconciliation
}
```

**Quantity Logic:**

| Type       | Quantity Sign | Meaning                |
| ---------- | ------------- | ---------------------- |
| `IN`       | Positive (+)  | Stock increased        |
| `OUT`      | Negative (-)  | Stock decreased        |
| `TRANSFER` | Positive (+)  | At toLocation, negative (-) at fromLocation |
| `ADJUSTMENT` | ±           | Variance from count    |

**Indexes:**
- `reference`
- `type`
- `itemId`
- `fromLocationId`
- `toLocationId`
- `createdBy`
- `organizationId`

**Example:**

```prisma
{
  id: "txn-001",
  reference: "TXN-001",
  type: "IN",
  itemId: "item-001",
  quantity: 50,
  fromLocationId: null,
  toLocationId: "loc-001",
  reason: null,
  notes: "Received from Vendor Inc.",
  createdBy: "user-001",
  organizationId: "org-001",
  createdAt: "2026-03-15T10:30:00Z"
}
```

---

## Data Integrity Rules

### Foreign Key Constraints

All foreign keys cascade on delete:

```prisma
organization @relation(... onDelete: Cascade)
warehouse @relation(... onDelete: Cascade)
location @relation(... onDelete: Cascade)
item @relation(... onDelete: Cascade)
```

### Stock Calculation Constraints

1. Stock is calculated from transactions
2. No direct updates to Stock table outside transaction creation
3. Stock qty must be ≥ 0 always
4. Negative qty delivery must check: requested qty ≤ current stock

### Receipt/Delivery Validation

1. Can only validate if status = READY
2. Validation creates IN/OUT transactions for each line
3. Use `@transaction` to ensure atomicity
4. On error, rollback entire operation

### Transaction Immutability

1. Transactions are append-only
2. No updates or deletes to transaction records
3. Corrections done via ADJUSTMENT transactions
4. Audit trail is permanent

---

## Indexing Strategy

### Performance Indexes

```prisma
// Organization & User lookups
organization.inviteCode          // UNIQUE for invites
user.email                       // UNIQUE for auth
user.organizationId              // Multi-tenant filtering

// Warehouse & Location queries
warehouse.(organizationId, name) // Find warehouses in org
location.warehouseId             // List locations in warehouse

// Item & Stock queries
item.(sku, organizationId)       // UNIQUE for SKU lookup
item.organizationId              // List items in org
stock.(itemId, locationId)       // Direct fast lookups

// Receipt/Delivery queries
receipt.reference                // Fast lookup by receiptnumber
receipt.warehouseId              // Filter by warehouse
delivery.reference               // Fast lookup
delivery.warehouseId             // Filter by warehouse

// Transaction auditing
transaction.type                 // Filter by IN/OUT/etc
transaction.createdAt            // Time-range queries
transaction.reference            // Lookup
```

---

## Backup & Recovery

### Critical Tables for Backup (Priority Order)

1. **transaction** — Audit trail (immutable, append-only)
2. **receipt, receiptLine** — Historical records
3. **delivery, deliveryLine** — Historical records
4. **item, stock** — Current state depends on these
5. **organization, user, warehouse, location, category** — Configuration

### Point-in-Time Recovery

Because Stock is calculated from Transactions, you can:
1. Restore database to any point in time
2. Re-calculate Stock from Transaction history
3. Verify data integrity

---

## Query Patterns

### Get Current Stock at Location

```sql
SELECT quantity FROM stock
WHERE itemId = $1 AND locationId = $2;
```

### Get Full Item History

```sql
SELECT * FROM transaction
WHERE itemId = $1
ORDER BY createdAt DESC;
```

### Get Low Stock Items

```sql
SELECT i.*, s.quantity
FROM item i
JOIN stock s ON i.id = s.itemId
WHERE i.minStock > 0 AND s.quantity < i.minStock
AND i.organizationId = $1;
```

### Get Pending Receipts

```sql
SELECT * FROM receipt
WHERE status IN ('DRAFT', 'WAITING', 'READY')
AND warehouseId = $1
ORDER BY createdAt DESC;
```

---

## Schema Version

- **Version:** 1.0.0
- **Last Updated:** 2026-03-15
- **PostgreSQL Version:** 12+
- **Prisma Version:** 5.22.0

---

*For schema updates, see `/prisma/migrations/` folder.*
