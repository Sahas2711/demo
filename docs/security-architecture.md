# Security Architecture Document

## Overview
Defines security model for Inventra based on HLD.

---

## 1. Authentication

- JWT-based authentication
- Access Token (15–30 min)
- Refresh Token (7 days)

---

## 2. Authorization

Role-Based Access Control (RBAC):

| Role | Access |
|------|-------|
| Admin | Full |
| Staff | Billing + Customer |
| Viewer | Read-only |

---

## 3. Password Security

- BCrypt hashing (strength 12)
- No plaintext storage

---

## 4. API Security

- HTTPS (TLS 1.3)
- Rate limiting
- Input validation

---

## 5. Data Protection

- AES-256 encryption (at rest)
- Encrypted backups
- No hardcoded secrets

---

## 6. Application Security

- SQL Injection prevention (Hibernate)
- XSS protection
- CSRF protection
- CSP headers

---

## 7. Token Security

- Stored in httpOnly cookies
- Secure + SameSite=Strict
- Token rotation enabled

---

## 8. Audit & Monitoring

- All critical actions logged
- Audit table maintained

---

## 9. Brute Force Protection

- Failed login tracking
- Account lock after threshold

---

## 10. Database Security

- Foreign key constraints
- Unique constraints
- Indexed queries

---

## 11. Secrets Management

- Environment variables
- No secrets in code

---

## 12. Compliance Considerations

- GST data protection
- User privacy

---

## Future Enhancements

- OAuth2 / SSO
- Multi-factor authentication