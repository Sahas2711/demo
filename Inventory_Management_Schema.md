# Inventory Management Schema

## Overview
The Inventory Management module is responsible for managing product data, tracking stock levels, and maintaining a history of inventory changes.

It supports product catalog management, real-time stock tracking, inventory updates after billing, stock movement auditing, and low stock monitoring.

---

## Database Design

### 1. Categories Table
Stores product category information.

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

#### Fields Description

| Field        | Description                          |
|-------------|--------------------------------------|
| category_id | Unique category identifier           |
| name        | Category name                        |
| description | Category description (optional)      |

---

### 2. Products Table
Stores product details and current stock information.

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,

    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    gst_percentage DECIMAL(5,2) NOT NULL CHECK (gst_percentage >= 0),

    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reorder_level INT NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

#### Fields Description

| Field            | Description                          |
|------------------|--------------------------------------|
| product_id       | Unique product identifier            |
| name             | Product name                         |
| description      | Product description                  |
| category_id      | Reference to product category        |
| unit_price       | Default selling price                |
| gst_percentage   | Default GST rate                     |
| stock_quantity   | Current available stock              |
| reorder_level    | Threshold for low stock alerts       |
| created_at       | Record creation timestamp            |
| updated_at       | Last update timestamp                |

---

### 3. Inventory Transactions Table
Tracks all stock movements (inflow and outflow).

CREATE TABLE inventory_transactions (
    transaction_id SERIAL PRIMARY KEY,

    product_id INT NOT NULL,

    transaction_type VARCHAR(10) NOT NULL
        CHECK (transaction_type IN ('IN', 'OUT', 'ADJUSTMENT')),

    quantity INT NOT NULL CHECK (quantity > 0),

    reference_type VARCHAR(20)
        CHECK (reference_type IN ('SALE', 'PURCHASE', 'MANUAL')),

    reference_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
);

#### Fields Description

| Field            | Description                          |
|------------------|--------------------------------------|
| transaction_id   | Unique transaction identifier        |
| product_id       | Reference to product                 |
| transaction_type | IN / OUT / ADJUSTMENT                |
| quantity         | Quantity changed                     |
| reference_type   | SALE / PURCHASE / MANUAL             |
| reference_id     | Related record ID                    |
| created_at       | Transaction timestamp                |

---

## Entity Relationship
Categories (1) -> Products (M) -> Inventory Transactions (M)

Products are also linked to Invoice Items for billing.

---

## Design Decisions

### Stock Tracking Strategy
Current stock is stored in products.stock_quantity and all changes are logged in inventory_transactions.

### Inventory Auditability
All stock movements are recorded for traceability.

### Pricing Strategy
Default price is stored in products, while actual transaction price is stored in invoice_items.

### Low Stock Monitoring
Reorder level is used to identify low stock.

### Data Integrity
Foreign keys ensure valid relationships.

---

## Important Notes
Stock updates must update both products table and inventory_transactions table.