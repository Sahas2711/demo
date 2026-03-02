# 🏗️ Inventra – Inventory Management System

> A Production-Grade Retail Inventory & Billing Platform built using Spring Boot, React, PostgreSQL, and Docker.

---

## 📌 Project Overview

Inventra is a web-based inventory and billing management system designed specifically for small-to-medium building material retailers.

The system digitizes manual billing, automates GST calculations, tracks real-time inventory, and provides actionable business insights through reports and dashboards.

---

## 🎯 Key Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication
- Refresh token rotation
- Role-Based Access Control (Admin, Staff, Viewer)
- BCrypt password hashing

### 🧾 Billing Management
- Automatic GST calculation (CGST, SGST, IGST)
- Invoice generation (< 5 seconds)
- PDF invoice export
- Transactional integrity (@Transactional)

### 📦 Inventory Management
- Full CRUD operations for products
- Real-time stock update after sales
- Category management
- Low-stock alerts

### 👤 Customer Management
- Customer record maintenance
- GSTIN validation
- Purchase history tracking

### 📊 Reporting & Analytics
- Daily / Weekly / Monthly sales reports
- GST summary reports
- Revenue trend tracking
- Inventory insights

---

## 🏛️ Architecture Overview

Inventra follows a **Monolithic Three-Tier Architecture**:

```

Client (React)
↓
Spring Boot API (Business Logic)
↓
PostgreSQL Database

```

Deployment includes:

- Nginx Reverse Proxy
- Docker Containerization
- CI/CD Pipeline
- Monitoring & Logging

---

## 🧰 Tech Stack

### 🔹 Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS / Material UI
- React PDF

### 🔹 Backend
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Hibernate ORM
- JWT Authentication
- BCrypt

### 🔹 Database
- PostgreSQL 15
- HikariCP Connection Pool

### 🔹 DevOps
- Docker
- Docker Compose
- GitHub Actions / Jenkins
- Nginx
- Prometheus + Grafana

---

## 📂 Project Structure

```

inventra/
│
├── backend/
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .github/workflows/
└── README.md

````

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/inventra.git
cd inventra
````

---

### 2️⃣ Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on:

```
http://localhost:8080
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🐳 Docker Setup (Recommended)

### Build & Run Entire Stack

```bash
docker-compose up --build
```

Services:

* Frontend
* Backend
* PostgreSQL
* Redis (optional)
* Nginx

---

## 🔄 CI/CD Pipeline

Pipeline Stages:

1. Code Commit
2. CI Trigger
3. Unit & Integration Testing
4. Static Code Analysis (SonarQube)
5. Security Scan
6. Docker Image Build
7. Push to Registry
8. Staging Deployment
9. QA Approval Gate
10. Production Deployment

---

## 🔐 Security Measures

* TLS 1.3 encryption
* JWT-based stateless authentication
* Role-Based Access Control
* SQL Injection prevention via Hibernate
* Input validation layer
* Rate limiting (Redis / Bucket4j)
* Structured audit logging

---

## 📈 Non-Functional Requirements

| Category         | Target  |
| ---------------- | ------- |
| API Response     | < 500ms |
| Page Load        | < 3 sec |
| Uptime           | 99.5%   |
| Concurrent Users | 500     |
| Product Capacity | 10,000  |

---

## 📊 Monitoring & Logging

* Structured logging
* Log level segregation
* Audit log table
* Prometheus metrics
* Grafana dashboards
* Alerting system

---

## 🛡️ Risk Mitigation

* Transactional integrity for billing
* Foreign key constraints
* Automated testing
* Security scanning in CI
* Zero-downtime rolling deployments

---

## 📅 Roadmap

### Phase 2

* Mobile App
* Barcode Integration
* Supplier Module

### Phase 3

* Multi-Branch Support
* Tally Integration
* AI Forecasting

---

## 👥 Stakeholders

* Admin (Owner)
* Staff (Billing Operator)
* Viewer (Accountant)

---

## 📜 License

This project is developed for academic and enterprise demonstration purposes.

---

## 🏁 Conclusion

Inventra is a production-grade retail inventory system designed to eliminate manual billing inefficiencies, ensure GST compliance, and enable data-driven retail growth.

---

```

---

