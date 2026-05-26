# Tiles & Sanitary Management System ERP

A robust, enterprise-grade Laravel + ReactJS based ERP system for tiles and sanitary product trading, billing, inventory control, delivery slip coordination, and partial payments tracking.

---

## 1. Software Requirements Specification (SRS)

### 1.1 Purpose
This document defines the functional and non-functional requirements, scope, business rules, and architecture for the Tiles & Sanitary Management System. It acts as the single source of truth for the codebase implementation.

### 1.2 Product Goals
* **Unified Operations**: Centralize product catalogs, multiple warehouses, stock balances, customers/dealers, and financial transactions.
* **Smart Unit Conversion**: Seamlessly convert between boxes, pieces, and square feet (SFT) per product.
* **Flexible Sales Workflows**: Track quotation status transitions, invoice generation, partial shipments, and progressive due collections.
* **Responsive Visual Interfaces**: Offer an optimized experience across desktop monitors and mobile/tablet devices.

### 1.3 Scope of Release 1
* **In-Scope**:
  * Cookie-based Session Auth (Laravel Sanctum) and Role-Based Access Control (Admin, Manager, Sales, Warehouse, Accounts, Delivery).
  * Category and Product Catalog Management with image uploads.
  * Multi-Warehouse Inventory tracking with an immutable transaction Ledger.
  * Per-product conversion formulas (e.g., box to piece/SFT).
  * Quotation Builder (draft, sent, approved, rejected, converted to invoice).
  * Invoice & Billing generator with PDF layout rendering.
  * Delivery Slip builder and status dispatch tracker.
  * Payment ledger tracking advance, partial, and complete collections with dynamic outstanding calculations.
  * Audit logging of all critical actions (price changes, adjustments, stock overrides).
* **Out-of-Scope**:
  * Double-entry bookkeeping ledger module (accounting ledger).
  * Hardware barcode integration (scanners).
  * Auto-procurement / Vendor purchase order generation.
  * Native iOS/Android apps.

### 1.4 Business Rules
1. **Immutable Inventory Ledger**: Stock levels cannot be directly updated without an audit-logged transaction record (e.g., invoice sale, manual adjustment, delivery dispatch).
2. **Stock Reservation**: Stock is *reserved* immediately when an invoice is confirmed. It is physically *deducted* from the warehouse when a delivery slip is dispatched.
3. **Line-item Taxes**: Tax rates are defined per product line-item to support varying tax structures, then aggregated for the invoice grand total.
4. **Recalculated Dues**: Invoice payment state (`unpaid`, `partially_paid`, `paid`) and outstanding balances must be recalculated atomically after each payment transaction.
5. **No Negative Stock**: Transactions leading to negative stock are blocked unless overridden by users with Admin/Manager privileges.

---

## 2. Relational Database Schema (ER Diagram)

Below is the database relationship structure. It is designed to optimize read speed via a derived `stock_balances` table while preserving absolute transaction history via `stock_ledgers`.

```mermaid
erDiagram
    users ||--o{ role_user : has
    roles ||--o{ role_user : has
    categories ||--o{ products : classifies
    products ||--o{ product_units : converts
    products ||--o{ stock_ledgers : records
    products ||--o{ stock_balances : has
    warehouses ||--o{ stock_ledgers : logs
    warehouses ||--o{ stock_balances : stores
    customers ||--o{ quotations : requests
    customers ||--o{ invoices : receives
    quotations ||--o{ quotation_items : contains
    quotations ||--o{ invoices : converts_to
    invoices ||--o{ invoice_items : contains
    invoices ||--o{ deliveries : triggers
    invoices ||--o{ payments : clears
    deliveries ||--o{ delivery_items : ships
    invoice_items ||--o{ delivery_items : maps_to
    users ||--o{ activity_logs : triggers

    users {
        bigint id PK
        string name
        string email
        string password
        timestamp email_verified_at
        timestamp created_at
        timestamp updated_at
    }

    roles {
        bigint id PK
        string name
        string slug UNIQUE
        timestamp created_at
        timestamp updated_at
    }

    role_user {
        bigint role_id FK
        bigint user_id FK
    }

    categories {
        bigint id PK
        string name
        bigint parent_id FK
        boolean status
        timestamp created_at
        timestamp updated_at
    }

    products {
        bigint id PK
        string name
        string sku UNIQUE
        bigint category_id FK
        string brand
        string image_path
        string base_unit
        string barcode
        text remarks
        boolean status
        timestamp created_at
        timestamp updated_at
    }

    product_units {
        bigint id PK
        bigint product_id FK
        string from_unit
        string to_unit
        decimal conversion_factor
        timestamp created_at
        timestamp updated_at
    }

    warehouses {
        bigint id PK
        string name
        string code UNIQUE
        string location
        boolean status
        timestamp created_at
        timestamp updated_at
    }

    stock_balances {
        bigint id PK
        bigint product_id FK
        bigint warehouse_id FK
        decimal physical_qty
        decimal reserved_qty
        timestamp updated_at
    }

    stock_ledgers {
        bigint id PK
        bigint product_id FK
        bigint warehouse_id FK
        decimal qty_in
        decimal qty_out
        string unit
        decimal base_qty_in
        decimal base_qty_out
        string reference_type
        bigint reference_id
        bigint created_by FK
        text remarks
        timestamp created_at
    }

    customers {
        bigint id PK
        string name
        string type "customer, dealer"
        string phone
        string email
        string company
        text billing_address
        text shipping_address
        decimal credit_limit
        boolean status
        timestamp created_at
        timestamp updated_at
    }

    quotations {
        bigint id PK
        string quotation_number UNIQUE
        bigint customer_id FK
        date date
        string status "draft, sent, approved, rejected, converted"
        decimal subtotal
        decimal discount
        decimal tax
        decimal grand_total
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
    }

    quotation_items {
        bigint id PK
        bigint quotation_id FK
        bigint product_id FK
        decimal quantity
        string unit
        decimal unit_price
        decimal tax_rate
        decimal tax_amount
        decimal subtotal
        timestamp created_at
        timestamp updated_at
    }

    invoices {
        bigint id PK
        string invoice_number UNIQUE
        bigint customer_id FK
        bigint quotation_id FK "nullable"
        date date
        string status "unpaid, partially_paid, paid, cancelled"
        decimal subtotal
        decimal discount
        decimal tax
        decimal grand_total
        decimal paid_amount
        decimal due_amount
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
    }

    invoice_items {
        bigint id PK
        bigint invoice_id FK
        bigint product_id FK
        decimal quantity
        string unit
        decimal unit_price
        decimal tax_rate
        decimal tax_amount
        decimal subtotal
        timestamp created_at
        timestamp updated_at
    }

    deliveries {
        bigint id PK
        string delivery_number UNIQUE
        bigint invoice_id FK
        date delivery_date
        string vehicle_reference
        string driver_name
        string status "pending, dispatched, delivered, cancelled"
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
    }

    delivery_items {
        bigint id PK
        bigint delivery_id FK
        bigint invoice_item_id FK
        decimal quantity_shipped
        string unit
        timestamp created_at
        timestamp updated_at
    }

    payments {
        bigint id PK
        string payment_number UNIQUE
        bigint invoice_id FK
        decimal amount
        string payment_method "cash, card, bank_transfer, cheque, upi"
        date payment_date
        string reference_number
        text note
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
    }

    activity_logs {
        bigint id PK
        bigint user_id FK
        string action
        string logable_type
        bigint logable_id
        text description
        string ip_address
        timestamp created_at
    }
```

---

## 3. REST API v1 Specification

All API endpoints reside under `/api/v1/` and enforce JSON requests/responses.

### 3.1 Authentication
* `POST /login`: Authenticate standard user sessions. Returns JSON response containing user profile details.
* `POST /logout`: Invalidate session credentials and clear tokens.
* `POST /register`: Registers new system users.
* `GET /user`: Returns authenticated user with their associated list of roles and permissions.

### 3.2 Master Data Management
* `GET /categories`: Paginated categories listing with filter criteria.
* `POST /categories`: Create category details. (Manager/Admin only)
* `PUT /categories/{id}`: Modify category details. (Manager/Admin only)
* `DELETE /categories/{id}`: Soft delete category.
* `GET /products`: Paginated product lists. Filters include category, brand, and search keywords.
* `POST /products`: Registers brand new items, uploads images, and stores metadata parameters.
* `PUT /products/{id}`: Modify fields on a product.
* `POST /products/{id}/units`: Set/edit mathematical unit conversion constraints.
* `GET /customers`: Returns paginated customers/dealers list.
* `POST /customers`: Creates records for new buyers or dealers.
* `PUT /customers/{id}`: Edit customer contact parameters.

### 3.3 Inventory & Warehouse Operations
* `GET /warehouses`: Lists storage/warehouse sites.
* `POST /warehouses`: Registers new storage locations.
* `GET /inventory/ledger`: Transaction audit history table of all stock operations.
* `GET /inventory/balances`: Returns real-time stock balances (physical vs. reserved) across warehouses.
* `POST /inventory/adjust`: Manual adjustment entry (e.g., breakage/loss logs) tracking.

### 3.4 Quotations & Sales
* `GET /quotations`: List of customer quotations. Filterable by code, user, and status.
* `POST /quotations`: Draft new quotation layout with line items.
* `PUT /quotations/{id}/status`: Set quotation status to `sent`, `approved`, `rejected`.
* `POST /quotations/{id}/convert`: Convert approved quotation directly to invoice layout.

### 3.5 Invoices & Deliveries
* `GET /invoices`: Returns invoice summaries including paid/due amounts.
* `POST /invoices`: Build new invoices directly (triggers stock reservation rules).
* `GET /invoices/{id}/pdf`: Generate print-ready PDF invoice.
* `GET /deliveries`: Fetch details of delivery slips and status updates.
* `POST /deliveries`: Generate dispatch slips against invoice items (triggers physical stock deduction).
* `PUT /deliveries/{id}/status`: Transition status from `pending` -> `dispatched` -> `delivered`.

### 3.6 Payments & Financial Ledger
* `GET /payments`: View historical transactions.
* `POST /payments`: Record customer collection payment (cash, check, card, UPI). Updates invoice outstanding balance.

### 3.7 Audits & Reports
* `GET /reports/sales`: Retrieve sales revenue totals filterable by dates.
* `GET /reports/stock`: Valuation lists, quantities, and low stock thresholds.
* `GET /reports/outstanding`: Outlines debtor balances and credit limits.
* `GET /reports/export`: Generates downloadable CSV exports for reporting templates.

---

## 4. Page-by-Page React UI Plan

The React frontend utilizes **React Router v7** and styled elements with **Bootstrap v5** and **Tailwind CSS**.

1. **Dashboard (`/dashboard`)**:
   * Header containing user menu, logout, and notifications.
   * KPI stat grid cards showing: *Sales Revenue*, *Outstanding Dues*, *Dispatched Orders*, *Low Stock Items count*.
   * Interactive chart tracking sales collections vs. outstanding balances over months.
2. **Product Catalog (`/products`)**:
   * Grid display containing product cards with image previews, category labels, and base units.
   * "Add Product" drawer/modal with forms for name, SKU, image uploads, category, and unit conversion details.
3. **Inventory Management (`/inventory`)**:
   * Multi-warehouse filter tabs.
   * Searchable ledger tracking all stock movement logs (In/Out/Balance).
   * Manual inventory adjust modal recording stock adjustment reasons.
4. **Quotations Builder (`/quotations`)**:
   * Master-detail invoice compiler allowing users to add/delete lines, input discounts, and select items.
   * Action buttons to print quotation sheet or click "Approve & Convert" to push quotation data to invoices.
5. **Invoices & Billing (`/invoices`)**:
   * Color-coded listing based on payment status: Green (`paid`), Yellow (`partially_paid`), Red (`unpaid`).
   * "Record Payment" prompt to process incoming transactions easily.
6. **Deliveries Dispatch (`/deliveries`)**:
   * List of delivery manifests with status milestones (`dispatched`, `delivered`).
   * Details view includes delivery vehicle registration number and driver credentials.
7. **Due Settlements (`/payments`)**:
   * Lists debtors showing outstanding payment balances.
   * "Record Payment" modal containing input fields for payment method, reference transaction numbers, and notes.
8. **Reports & Exports (`/reports`)**:
   * Interface to run report queries and filter results by category, date range, or warehouse.
   * Action buttons to export files directly to Excel spreadsheets or print formatted PDFs.

---

## 5. Laravel Module Structure

The backend application organizes models, controllers, and domain logic modules as follows:

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   └── v1/
│   │   │       ├── CategoryController.php
│   │   │       ├── ProductController.php
│   │   │       ├── InventoryController.php
│   │   │       ├── QuotationController.php
│   │   │       ├── InvoiceController.php
│   │   │       ├── DeliveryController.php
│   │   │       ├── PaymentController.php
│   │   │       └── ReportController.php
│   │   └── AuthController.php
│   └── Requests/
│       ├── StoreProductRequest.php
│       ├── StoreInvoiceRequest.php
│       └── StorePaymentRequest.php
├── Models/
│   ├── User.php
│   ├── Role.php
│   ├── Category.php
│   ├── Product.php
│   ├── ProductUnit.php
│   ├── Warehouse.php
│   ├── StockBalance.php
│   ├── StockLedger.php
│   ├── Customer.php
│   ├── Quotation.php
│   ├── QuotationItem.php
│   ├── Invoice.php
│   ├── InvoiceItem.php
│   ├── Delivery.php
│   ├── DeliveryItem.php
│   └── Payment.php
└── Services/
    ├── InventoryService.php
    ├── InvoiceService.php
    ├── PaymentService.php
    └── ReportingService.php
```

---

## 6. Development Roadmap & Estimation

The implementation is broken down into structured phases over a total estimated duration of 20 days:

```
| Phase   | Tasks                                                          | Estimated Duration |
|---------|----------------------------------------------------------------|--------------------|
| Phase 1 | Database Migrations, Models, seeders, user roles & UI layout   | 3 Days             |
| Phase 2 | Categories, Products, Unit conversions, Warehouses & Stock API | 4 Days             |
| Phase 3 | Quotations & Invoice processing backend with stock reserving   | 4 Days             |
| Phase 4 | Payments ledger, outstanding dues tracker & Delivery dispatch   | 4 Days             |
| Phase 5 | Report aggregation (sales, dues), PDF layout generation, CSV   | 3 Days             |
| Phase 6 | System testing, code cleanups, performance index optimization  | 2 Days             |
```

---

## 7. Setup & Run Locally

### Requirements
* PHP ^8.2
* Node.js ^18
* Composer
* MySQL or PostgreSQL Database

### Installation Steps
1. Clone the project and copy `.env.example` to `.env`. Configure your database credentials.
2. Run the main setup script to install dependencies, run migrations, and compile assets:
   ```bash
   composer run setup
   ```
3. Start the development server (runs PHP server, Vite, and queues concurrently):
   ```bash
   composer run dev
   ```
