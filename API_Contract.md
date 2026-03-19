# Inventra – API Contract Specification

---

## 1. Overview
This document defines the API contract for the Inventra Inventory & Billing System.

It specifies:
- Endpoints
- Request/response formats
- Authentication rules
- Error handling

---

## 2. Base URL
http://localhost:8080/api/v1

---

## 3. Authentication & Authorization

Authentication mechanism: JWT (JSON Web Token)

Header Format:
Authorization: Bearer <access_token>

Access Rules:
- Auth APIs: Public
- User APIs: Admin only
- Customer APIs: Admin, Staff

---

## 4. Standard Response Format

Success Response:
{
  "status": "success",
  "data": {},
  "message": "Optional message"
}

Error Response:
{
  "status": "error",
  "message": "Error description"
}

---

## 5. HTTP Status Codes
- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error

---

## 6. Authentication APIs

POST /auth/register

Request:
{
  "username": "john",
  "password": "password123",
  "role": "STAFF"
}

---

POST /auth/login

Request:
{
  "username": "john",
  "password": "password123"
}

Response:
{
  "status": "success",
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}

---

Other Auth APIs:
- POST /auth/refresh
- POST /auth/logout
- POST /auth/password/forgot
- GET /auth/password/validate?token=abc123
- POST /auth/password/reset

---

## 7. User Management APIs
- GET /users
- GET /users/{id}

PUT /users/{id}

Request:
{
  "username": "updatedName",
  "role": "ADMIN"
}

- DELETE /users/{id}

---

## 8. Customer APIs

POST /customers

Request:
{
  "name": "ABC Traders",
  "phone": "9876543210",
  "gstin": "27ABCDE1234F1Z5"
}

- GET /customers
- GET /customers/{id}
- PUT /customers/{id}
- DELETE /customers/{id}

---

## 9. Validation Rules
- Username must be unique
- Password minimum 8 characters
- GSTIN must follow valid format
- Phone must be 10 digits
- Role must be ADMIN, STAFF, or VIEWER

---

## 10. Security Considerations
- BCrypt password hashing
- JWT expiration and refresh token rotation
- Input validation
- SQL Injection prevention using ORM

---

## 11. Future APIs
- Product APIs
- Inventory APIs
- Billing APIs
- Reporting APIs