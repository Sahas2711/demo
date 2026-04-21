# Frontend Integration Audit

## Goal

This document tracks how much static or frontend-only data still exists in the application and what has been integrated with the backend.

## Summary

The frontend is already integrated with the backend for most business flows:

- Auth: integrated
- Inventory: integrated
- Customers: integrated
- Billing / invoices: integrated
- Reports / analytics / dashboards: integrated through backend invoice, customer, and inventory APIs

The only major business area that is still not fully backend-integrated is:

- User Management: still frontend-seeded because the backend does not expose user listing, update, delete, activate/deactivate, or profile-management endpoints

## Static Data Audit

| Area | Frontend Status | Backend API Available | Result |
|---|---|---|---|
| Login / Register | Live API | Yes | Integrated |
| Admin Inventory | Live API | Yes | Integrated |
| Staff Products | Live API | Yes | Integrated |
| Customer pages | Live API | Yes | Integrated |
| Billing pages | Live API | Yes | Integrated |
| Staff Create Invoice | Live API | Yes | Integrated |
| Admin Dashboard cards/chart/tables | Derived from live API data | Yes | Integrated |
| Viewer Dashboard | Derived from live API data | Yes | Integrated |
| Reports / Analytics | Derived from live API data | Yes | Integrated |
| User Management | Uses `SEED_USERS` in frontend | No | Blocked by missing backend API |
| Test mocks under `src/test/mocks` | Test-only | Not applicable | Expected, not production data |

## Remaining Static / Mock Sources

### 1. User management seed data

File:

- [frontend/src/component/users/userData.ts](/e:/Projects/Inventra/inventra/frontend/src/component/users/userData.ts:1)

Current behavior:

- `UserManagementPage` starts from `SEED_USERS`
- Create, edit, and delete operations are local state only
- No backend persistence exists for this page today

Reason it is not fully integrated:

- Backend currently exposes only:
  - `/api/v1/auth/*`
  - `/api/v1/products`, `/api/v1/categories`, `/api/v1/inventory*`
  - `/api/v1/customers*`
  - `/api/v1/invoices*`
- There is no backend endpoint for:
  - get all users
  - get one user
  - create admin/staff/viewer user from admin panel
  - update user profile/role/status
  - delete/deactivate user

## What Was Completed In This Pass

### Build fixes

- Added `@` path alias support in TypeScript and Vite
- Fixed strict TypeScript issues that were breaking `npm run build`
- Restored missing exports and auth helpers expected by the test suite
- Removed a few unused values/imports that were failing strict checks

### Integration cleanup

- Replaced some leftover frontend-only type dependencies with API-native types in:
  - inventory page
  - staff products page
  - dashboard inventory table
  - inventory table full
- Kept reports, analytics, dashboards, billing, customer, and inventory views driven by live backend responses

## Verification

Build verification completed successfully on April 21, 2026 with:

```bash
npm run build
```

Result:

- Build passed
- Vite reported a large chunk-size warning only
- No TypeScript build errors remain

## Backend Work Still Needed For Full Integration

To fully complete User Management, the backend needs endpoints such as:

- `GET /api/v1/users`
- `GET /api/v1/users/{id}`
- `POST /api/v1/users`
- `PUT /api/v1/users/{id}`
- `PATCH /api/v1/users/{id}/status`
- `DELETE /api/v1/users/{id}` or soft-delete/deactivate support

Recommended response fields:

- `id`
- `name`
- `email`
- `phone`
- `role`
- `active`
- `createdAt`

## Final Status

- Production business modules are integrated with backend APIs
- Static data in production flows is now limited mainly to User Management seed data
- Full completion of that final integration depends on backend user-management endpoints
