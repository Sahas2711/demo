# Coding Standards & Contribution Guidelines  
Project: Inventra – Inventory Management System

---

## 1. Purpose
This document defines the coding standards, development practices, and contribution workflow for the Inventra project.

The goal is to ensure:
- Consistent code quality
- Maintainable architecture
- Smooth collaboration among team members

---

## 2. Tech Stack Context
Frontend: React 18, TypeScript, Vite  
Backend: Spring Boot 3, Spring Security, JPA/Hibernate  
Database: PostgreSQL  
DevOps: Docker, Docker Compose  

---

## 3. Backend Coding Standards

Naming:
- Classes: PascalCase (InvoiceService)
- Variables: camelCase (invoiceService)

Architecture:
- Controller → Service → Repository (strict separation)
- No business logic in controllers

DTO:
- Use DTOs, do not expose entities

Transactions:
- Use @Transactional for billing and stock updates

---

## 4. Frontend Coding Standards
- Use functional components only
- Use React hooks
- Follow feature-based folder structure
- Keep business logic separate from UI

---

## 5. API Standards
- RESTful endpoints (/api/products, /api/invoices)
- Use proper HTTP methods (GET, POST, PUT, DELETE)

Response Format:
{
  "status": "success",
  "data": {},
  "message": ""
}

---

## 6. Database Standards
- Use snake_case for table names
- Maintain normalization
- Use foreign keys

Critical:
Store unit_price, gst_percentage, gst_amount in invoice_items

---

## 7. Security Guidelines
- Use JWT authentication
- Role-based access control
- BCrypt password hashing
- Validate all inputs

---

## 8. Error Handling
- Use global exception handler
- Return meaningful errors

Example:
{
  "status": "error",
  "message": "Invalid product ID"
}

---

## 9. Git Workflow

Branch Naming:
- feature/<name>
- bugfix/<name>

Commits:
- feat: add feature
- fix: bug fix

Rules:
- No direct push to main
- PR required

---

## 10. Contribution Process
1. Create branch
2. Implement changes
3. Test locally
4. Create PR
5. Get approval
6. Merge

---

## 11. Testing Guidelines
- Unit testing for backend
- Manual testing for billing, GST, inventory
- Validate stock deduction and invoice totals

---

## 12. Docker & Environment
- Use Dockerfile for services
- Use docker-compose
- Store configs in .env
- Do not hardcode secrets

---

## 13. Code Review
- Check readability
- Ensure proper architecture
- Follow security practices

---

## 14. General Principles
- Keep code simple
- Avoid over-engineering
- Follow DRY (Don’t Repeat Yourself)
- Write maintainable code