# Billing & Invoice Data Model Design

## Overview
This document defines the database schema for billing and invoice management in Inventra.

The design ensures:
- GST compliance (CGST, SGST, IGST)
- Transactional integrity
- High performance for invoice generation (<5 sec)
- Auditability

---

## Core Entities

### 1. Invoice

| Field | Type | Constraints |
|------|------|------------|
| id | UUID | PK |
| invoice_number | VARCHAR | UNIQUE, NOT NULL |
| customer_id | UUID | FK |
| total_amount | DECIMAL | NOT NULL |
| gst_total | DECIMAL | NOT NULL |
| discount | DECIMAL | DEFAULT 0 |
| final_amount | DECIMAL | NOT NULL |
| status | ENUM | (PAID, CANCELLED) |
| created_at | TIMESTAMP | NOT NULL |

---

### 2. Invoice_Items

| Field | Type | Constraints |
|------|------|------------|
| id | UUID | PK |
| invoice_id | UUID | FK |
| product_id | UUID | FK |
| quantity | INT | NOT NULL |
| price | DECIMAL | NOT NULL |
| gst_rate | DECIMAL | NOT NULL |
| gst_amount | DECIMAL | NOT NULL |
| total_price | DECIMAL | NOT NULL |

---

### 3. Customer

| Field | Type | Constraints |
|------|------|------------|
| id | UUID | PK |
| name | VARCHAR | NOT NULL |
| phone | VARCHAR | NOT NULL |
| gstin | VARCHAR | UNIQUE |
| address | TEXT | |

---

### 4. Product

| Field | Type | Constraints |
|------|------|------------|
| id | UUID | PK |
| name | VARCHAR | NOT NULL |
| category | VARCHAR | |
| price | DECIMAL | NOT NULL |
| gst_rate | DECIMAL | NOT NULL |
| stock_quantity | INT | NOT NULL |

---

## Relationships

- One Invoice → Many Invoice_Items
- One Product → Many Invoice_Items
- One Customer → Many Invoices

---

## GST Calculation Logic


GST Amount = (Price × Quantity × GST Rate) / 100
Final Amount = Subtotal + GST - Discount


Supports:
- CGST + SGST (intra-state)
- IGST (inter-state)

---

## Constraints & Rules

- Invoice number must be unique
- Stock must be reduced after successful transaction
- Transaction must be atomic (@Transactional)
- No negative stock allowed

---

## Indexing Strategy

- invoice_number (UNIQUE INDEX)
- customer_id (INDEX)
- created_at (INDEX)
- product_id (INDEX)

---

## Audit Logging

Every invoice operation logs:

- user_id
- action (CREATE / UPDATE / CANCEL)
- old_value (JSONB)
- new_value (JSONB)
- timestamp

---

## Future Enhancements

- Partial payments
- Credit notes
- Multi-branch invoices