# API Reference Guide — CoreInventory

Complete REST API documentation for CoreInventory inventory management system.

---

## 📋 Table of Contents

1. [Base URL & Authentication](#base-url--authentication)
2. [Response Format](#response-format)
3. [Error Handling](#error-handling)
4. [Health Check](#health-check)
5. [Authentication Endpoints](#authentication-endpoints)
6. [Products & Categories](#products--categories)
7. [Warehouse & Stock Management](#warehouse--stock-management)
8. [Operations (Receipts, Deliveries)](#operations-receipts-deliveries)
9. [Transactions & Audit](#transactions--audit)
10. [Dashboard & Reporting](#dashboard--reporting)

---

## Base URL & Authentication

### Base URL

```
http://localhost:3000/api
```

Production:
```
https://coreinventory.example.com/api
```

### Authentication

All endpoints (except `/auth/*` and `/health`) require:

```
Cookie: auth_token=<JWT_TOKEN>
Content-Type: application/json
```

**JWT Token Structure:**

```javascript
{
  userId: string,
  email: string,
  role: "SUPER_ADMIN" | "MANAGER" | "WAREHOUSE_STAFF",
  iat: number,
  exp: number
}
```

---

## Response Format

### Success Response (2xx)

```json
{
  "success": true,
  "data": {
    /* Response payload */
  }
}
```

### Error Response (4xx, 5xx)

```json
{
  "success": false,
  "error": "Descriptive error message",
  "details": "Additional context (optional)"
}
```

---

## Error Handling

| Code | Meaning                  | Cause                              |
| ---- | ------------------------ | ---------------------------------- |
| 200  | OK                       | Successful request                 |
| 201  | Created                  | Resource created successfully      |
| 400  | Bad Request              | Invalid parameters or schema       |
| 401  | Unauthorized             | Missing or invalid token           |
| 403  | Forbidden                | Insufficient permissions           |
| 404  | Not Found                | Resource doesn't exist             |
| 409  | Conflict                 | Duplicate entry (e.g., SKU exists) |
| 500  | Internal Server Error    | Unexpected server error            |

---

## Health Check

### Endpoint

```
GET /api/health
```

### Response

```json
{
  "status": "ok",
  "timestamp": "2026-03-15T10:30:00Z",
  "message": "CoreInventory API is running"
}
```

**Use Case:** Monitor API health, readiness checks

---

## Authentication Endpoints

### Sign Up

```http
POST /api/auth/signup
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123!",
  "inviteCode": "MGR-CORE-2026"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "cuid-123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "MANAGER",
    "verified": false,
    "message": "Signup successful. Please verify your email with OTP."
  }
}
```

**Invite Codes:**

| Code               | Role            |
| ------------------ | --------------- |
| `MGR-CORE-2026`    | MANAGER         |
| `STAFF-INV-2026`   | WAREHOUSE_STAFF |
| Any other code→ | WAREHOUSE_STAFF |

---

### Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "cuid-123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "MANAGER",
    "verified": true,
    "message": "Login successful"
  }
}
```

**Note:** JWT token sent in `auth_token` cookie (HttpOnly, Secure)

---

### Get Current User

```http
GET /api/me
```

**Response (200):**

```json
{
  "user": {
    "id": "cuid-123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "MANAGER"
  }
}
```

---

## Products & Categories

### Get All Products

```http
GET /api/products?search=SKU&category=catId&status=IN_STOCK
```

**Query Parameters:**

| Param      | Type   | Description                                |
| ---------- | ------ | ------------------------------------------ |
| `search`   | string | Search by name or SKU                      |
| `category` | string | Filter by category ID                      |
| `status`   | string | IN_STOCK \| LOW_STOCK \| OUT_OF_STOCK     |
| `limit`    | number | Max results (default: 100)                 |
| `offset`   | number | Pagination offset (default: 0)             |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "item-123",
      "sku": "PROD-001",
      "name": "Widget Pro",
      "description": "High-quality widget",
      "category": {
        "id": "cat-1",
        "name": "Electronics"
      },
      "uom": "UNIT",
      "minStock": 10,
      "totalStock": 150,
      "status": "IN_STOCK",
      "lastMovement": "2026-03-15T10:00:00Z",
      "createdAt": "2026-03-01T00:00:00Z"
    }
  ]
}
```

---

### Create Product

```http
POST /api/products
```

**Request Body:**

```json
{
  "sku": "PROD-002",
  "name": "Widget Plus",
  "description": "Enhanced widget",
  "categoryId": "cat-1",
  "uom": "UNIT",
  "minStock": 5,
  "initialStock": 100,
  "locationId": "loc-123"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "item-124",
    "sku": "PROD-002",
    "name": "Widget Plus",
    "createdAt": "2026-03-15T10:30:00Z"
  }
}
```

---

### Update Product

```http
PUT /api/products/:id
```

**Request Body:**

```json
{
  "name": "Widget Plus Pro",
  "description": "Premium widget",
  "minStock": 8
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "item-124",
    "sku": "PROD-002",
    "name": "Widget Plus Pro"
  }
}
```

---

### Delete Product

```http
DELETE /api/products/:id
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Product archived successfully"
  }
}
```

---

### Get Product Metadata

```http
GET /api/products/meta?organizationId=org-123
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "categories": [
      { "id": "cat-1", "name": "Electronics" },
      { "id": "cat-2", "name": "Stationery" }
    ],
    "locations": [
      {
        "id": "loc-1",
        "name": "Shelf A",
        "warehouse": { "id": "wh-1", "name": "Main" }
      }
    ],
    "statuses": [
      { "value": "ALL", "label": "All stock levels" },
      { "value": "IN_STOCK", "label": "In stock" },
      { "value": "LOW_STOCK", "label": "Low stock" },
      { "value": "OUT_OF_STOCK", "label": "Out of stock" }
    ]
  }
}
```

---

### Get Categories

```http
GET /api/categories?organizationId=org-123
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    { "id": "cat-1", "name": "Electronics" },
    { "id": "cat-2", "name": "Stationery" }
  ]
}
```

---

### Create Category

```http
POST /api/categories
```

**Request Body:**

```json
{
  "name": "Hardware",
  "organizationId": "org-123"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "cat-3",
    "name": "Hardware"
  }
}
```

---

## Warehouse & Stock Management

### Get All Warehouses

```http
GET /api/warehouses?organizationId=org-123
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "wh-1",
      "name": "Main Warehouse",
      "shortCode": "MW",
      "address": "123 Storage Lane",
      "locations": [
        {
          "id": "loc-1",
          "name": "Shelf A1",
          "shortCode": "A1"
        }
      ]
    }
  ]
}
```

---

### Create Warehouse

```http
POST /api/warehouses
```

**Request Body:**

```json
{
  "name": "Branch Warehouse",
  "shortCode": "BW",
  "address": "456 Logistics Ave",
  "organizationId": "org-123"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "wh-2",
    "name": "Branch Warehouse",
    "shortCode": "BW"
  }
}
```

---

### Get Stock by Warehouse

```http
GET /api/stock?warehouseId=wh-1&search=Widget
```

**Query Parameters:**

| Param         | Type   | Description           |
| ------------- | ------ | --------------------- |
| `warehouseId` | string | Filter by warehouse   |
| `search`      | string | Search by item name   |
| `locationId`  | string | Filter by location    |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "stock-1",
      "item": { "id": "item-1", "name": "Widget Pro", "sku": "PROD-001" },
      "location": { "id": "loc-1", "name": "Shelf A1", "warehouse": { "name": "Main" } },
      "quantity": 150
    }
  ]
}
```

---

### Adjust Stock

```http
POST /api/stock/adjust
```

**Request Body:**

```json
{
  "itemId": "item-1",
  "locationId": "loc-1",
  "countedQuantity": 145,
  "reason": "Reconciliation",
  "notes": "Physical count mismatch"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn-1",
      "reference": "ADJ/2026/00001",
      "type": "ADJUSTMENT",
      "quantity": -5,
      "reason": "Reconciliation"
    }
  }
}
```

---

## Operations (Receipts, Deliveries)

### Create Receipt

```http
POST /api/receipts
```

**Request Body:**

```json
{
  "supplierName": "Vendor Inc.",
  "warehouseId": "wh-1",
  "items": [
    {
      "itemId": "item-1",
      "quantity": 50
    },
    {
      "itemId": "item-2",
      "quantity": 30
    }
  ]
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "rec-1",
    "reference": "REC/2026/00001",
    "supplierName": "Vendor Inc.",
    "status": "DRAFT",
    "items": [
      {
        "itemId": "item-1",
        "quantity": 50,
        "item": { "name": "Widget Pro", "sku": "PROD-001" }
      }
    ],
    "createdAt": "2026-03-15T10:30:00Z"
  }
}
```

---

### Get All Receipts

```http
GET /api/receipts?status=DRAFT&warehouseId=wh-1
```

**Query Parameters:**

| Param         | Type   | Description                    |
| ------------- | ------ | ------------------------------ |
| `status`      | string | DRAFT \| WAITING \| READY \| DONE |
| `warehouseId` | string | Filter by warehouse            |
| `search`      | string | Search by reference/supplier   |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "rec-1",
      "reference": "REC/2026/00001",
      "supplierName": "Vendor Inc.",
      "status": "DRAFT",
      "warehouseId": "wh-1",
      "itemCount": 2,
      "totalQuantity": 80,
      "createdAt": "2026-03-15T10:30:00Z"
    }
  ]
}
```

---

### Validate Receipt

```http
POST /api/receipts/:id/validate
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "rec-1",
    "reference": "REC/2026/00001",
    "status": "DONE",
    "message": "Receipt validated. Stock updated.",
    "transactions": [
      {
        "id": "txn-1",
        "reference": "TXN-001",
        "type": "IN",
        "quantity": 50,
        "item": { "name": "Widget Pro" }
      }
    ]
  }
}
```

---

### Create Delivery

```http
POST /api/deliveries
```

**Request Body:**

```json
{
  "destination": "Client Office",
  "warehouseId": "wh-1",
  "items": [
    {
      "itemId": "item-1",
      "quantity": 25
    }
  ]
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "del-1",
    "reference": "DEL/2026/00001",
    "destination": "Client Office",
    "status": "DRAFT",
    "items": [
      {
        "itemId": "item-1",
        "quantity": 25,
        "item": { "name": "Widget Pro", "sku": "PROD-001" }
      }
    ],
    "createdAt": "2026-03-15T10:30:00Z"
  }
}
```

---

### Get All Deliveries

```http
GET /api/deliveries?status=READY&warehouseId=wh-1
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "del-1",
      "reference": "DEL/2026/00001",
      "destination": "Client Office",
      "status": "READY",
      "warehouseId": "wh-1",
      "itemCount": 1,
      "totalQuantity": 25,
      "createdAt": "2026-03-15T10:30:00Z"
    }
  ]
}
```

---

### Validate Delivery

```http
POST /api/deliveries/:id/validate
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "del-1",
    "reference": "DEL/2026/00001",
    "status": "DONE",
    "message": "Delivery validated. Stock deducted.",
    "transactions": [
      {
        "id": "txn-2",
        "reference": "TXN-002",
        "type": "OUT",
        "quantity": -25,
        "item": { "name": "Widget Pro" }
      }
    ]
  }
}
```

---

## Transactions & Audit

### Get Transaction History

```http
GET /api/transactions?type=IN&search=Widget&limit=50
```

**Query Parameters:**

| Param    | Type   | Description                      |
| -------- | ------ | -------------------------------- |
| `type`   | string | IN \| OUT \| TRANSFER \| ADJUSTMENT |
| `search` | string | Search by item name/SKU          |
| `limit`  | number | Max results (default: 300)       |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "txn-1",
      "reference": "TXN-001",
      "type": "IN",
      "quantity": 50,
      "createdAt": "2026-03-15T10:30:00Z",
      "item": {
        "id": "item-1",
        "name": "Widget Pro",
        "sku": "PROD-001"
      },
      "fromLocation": null,
      "toLocation": {
        "id": "loc-1",
        "name": "Shelf A1",
        "warehouse": { "id": "wh-1", "name": "Main" }
      },
      "notes": "Received from Vendor Inc."
    }
  ]
}
```

---

### Create Transfer

```http
POST /api/transfers
```

**Request Body:**

```json
{
  "itemId": "item-1",
  "fromLocationId": "loc-1",
  "toLocationId": "loc-2",
  "quantity": 20,
  "notes": "Stock rebalancing"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "txn-3",
    "reference": "TXN-003",
    "type": "TRANSFER",
    "quantity": 20,
    "item": { "name": "Widget Pro" },
    "fromLocation": { "name": "Shelf A1" },
    "toLocation": { "name": "Shelf B1" }
  }
}
```

---

## Dashboard & Reporting

### Get Dashboard Stats

```http
GET /api/dashboard?warehouseId=wh-1
```

**Query Parameters:**

| Param         | Type   | Description    |
| ------------- | ------ | -------------- |
| `warehouseId` | string | Filter by warehouse |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "totalProducts": 45,
    "lowStockItems": 8,
    "outOfStockItems": 2,
    "pendingReceipts": 3,
    "pendingDeliveries": 5,
    "totalStockValue": 45000,
    "recentTransactions": [
      {
        "id": "txn-1",
        "reference": "TXN-001",
        "type": "IN",
        "item": { "name": "Widget Pro" },
        "quantity": 50,
        "createdAt": "2026-03-15T10:30:00Z"
      }
    ]
  }
}
```

---

## Rate Limiting

Not currently implemented but planned:

- 100 requests per minute per user
- 1000 requests per hour per API key
- Backoff: `Retry-After` header will indicate seconds

---

## Webhooks (Future)

Not yet implemented. Will support:

- `receipt.validated`
- `delivery.validated`
- `stock.low`
- `transaction.created`

---

## Code Examples

### cURL

```bash
# Get products
curl -X GET http://localhost:3000/api/products \
  -H "Cookie: auth_token=<TOKEN>"

# Create product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<TOKEN>" \
  -d '{
    "sku": "PROD-003",
    "name": "New Widget",
    "categoryId": "cat-1"
  }'
```

### JavaScript/Fetch

```javascript
// Get products
const response = await fetch('/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Create product
const createResponse = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    sku: 'PROD-003',
    name: 'New Widget',
    categoryId: 'cat-1'
  })
});
```

### Python

```python
import requests

headers = {'Cookie': f'auth_token={token}'}

# Get products
response = requests.get('http://localhost:3000/api/products', headers=headers)
products = response.json()

# Create product
data = {
    'sku': 'PROD-003',
    'name': 'New Widget',
    'categoryId': 'cat-1'
}
response = requests.post('http://localhost:3000/api/products', 
                        json=data, headers=headers)
product = response.json()
```

---

## Changelog

| Version | Date       | Changes        |
| ------- | ---------- | -------------- |
| 1.0.0   | 2026-03-15 | Initial release |

---

**Last Updated:** March 15, 2026
