# Customer Management Schema

##  Overview
The Customer Management module is responsible for storing and managing customer-related data, including personal details, GST information, and purchase history.

It is designed to support:
- Customer record management
- GST-compliant billing
- Purchase history tracking
- Efficient reporting and querying

---

##  Database Design

### 1. Customers Table

Stores basic customer information.

```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100),
    address TEXT,
    gstin VARCHAR(20),
    customer_type VARCHAR(20) DEFAULT 'REGULAR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Fields Description

| Field         | Description                         |
| ------------- | ----------------------------------- |
| customer_id   | Unique identifier for each customer |
| name          | Customer name                       |
| phone         | Unique contact number               |
| email         | Customer email (optional)           |
| address       | Customer address                    |
| gstin         | GST number (for business customers) |
| customer_type | REGULAR or BUSINESS                 |
| created_at    | Record creation timestamp           |
| updated_at    | Last update timestamp               |

---

### 2. Invoices Table

Stores billing information for each transaction.

```sql
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    customer_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    gst_amount DECIMAL(10,2),
    final_amount DECIMAL(10,2) NOT NULL,
    payment_mode VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

#### Fields Description

| Field        | Description             |
| ------------ | ----------------------- |
| invoice_id   | Unique invoice ID       |
| customer_id  | Reference to customer   |
| total_amount | Total amount before GST |
| gst_amount   | GST calculated          |
| final_amount | Total amount after GST  |
| payment_mode | CASH / UPI / CARD       |
| created_at   | Invoice creation time   |

---

### 3. Invoice Items Table

Stores product-level details for each invoice.

```sql
CREATE TABLE invoice_items (
    item_id SERIAL PRIMARY KEY,
    invoice_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2),
    gst_rate DECIMAL(5,2),

    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
);
```

#### Fields Description

| Field      | Description          |
| ---------- | -------------------- |
| item_id    | Unique item ID       |
| invoice_id | Reference to invoice |
| product_id | Reference to product |
| quantity   | Quantity of product  |
| price      | Price per unit       |
| gst_rate   | GST percentage       |

---

## 🔗 Entity Relationship

```
Customer (1) ──── (M) Invoice ──── (M) Invoice_Items
```

- One customer can have multiple invoices  
- One invoice can have multiple items  

---

## ⚙️ Design Decisions

### 1. Normalization
- Data is normalized to avoid redundancy  
- Customer data is stored separately from transactions  

### 2. GST Handling
- GSTIN is stored only for business customers  
- GST is calculated per invoice  

### 3. Scalability
- Separate tables ensure efficient querying  
- Supports reporting and analytics  

### 4. Data Integrity
- Foreign key constraints maintain relationships  
- Unique constraint on phone prevents duplicates  

---

