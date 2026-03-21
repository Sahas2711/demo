# API Versioning Strategy

## Overview

This document explains how we handle API versioning in the Inventra backend. The goal is simple — make sure existing clients keep working even when we make changes or add new features.

---

## Objectives

- Keep older API versions working when new ones are released
- Add new features without breaking what already works
- Follow a consistent versioning pattern across all endpoints
- Allow clients to migrate to newer versions at their own pace

---

## Versioning Approach

We use **URI-based versioning** for all REST APIs. The version number is part of the URL, so it's always clear which version is being used.

### Format:

```
/api/v{version}/{resource}
```

### Examples:

```
/api/v1/auth/register
/api/v1/auth/login
/api/v1/products
/api/v2/products
```

---

## Versioning Rules

### Major Version Change (v1 → v2)

A new version is created when:
- The API contract changes in a way that breaks existing clients
- Request or response structures are modified
- Required fields are added or removed
- Authentication or authorization mechanisms change

---

### Minor Updates (No Version Change Needed)

These changes do NOT need a new version:
- Adding optional fields to responses
- Adding new endpoints
- Performance improvements
- Internal refactoring

---

## Backward Compatibility Policy

- Older API versions remain available even after newer versions are released
- Current clients can keep working without needing any updates
- Frontend applications and third-party integrations will not be affected by version changes
- Changes are introduced in a way that avoids breaking existing functionality

---

## Deprecation Strategy

When an API version is being phased out:

1. It will be marked as deprecated in the response headers
2. Clients will be notified ahead of time
3. A sunset date will be set — the version stays available until that date

### Deprecation Headers Example:

```
Deprecation: true
Sunset: 2026-06-01
```

---

## Current API Versioning

All current endpoints are on version **v1**:

### Authentication APIs

```
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Example Future Upgrade

```
POST /api/v2/auth/login
```

---

## Versioning and Security

- Versioning applies to all secured endpoints
- JWT-based authentication stays the same across versions
- Role-Based Access Control (RBAC) is maintained across all versions
- If a security change breaks existing behavior, it will be released as a new version

---

## Testing Strategy

- Each API version is tested independently
- Regression tests make sure older versions still work after new ones are added
- Version-specific test cases are kept and maintained

---

## Documentation Strategy

- Each API version has its own documentation
- Swagger/OpenAPI reflects the versioned endpoints

### Example:

```
/v1/api-docs
/v2/api-docs
```

---

## Migration Strategy

When a new version is introduced:

1. Deploy the new version alongside the existing one
2. Keep both versions running at the same time
3. Notify all stakeholders
4. Gradually move clients over to the new version
5. Deprecate and remove the old version after the sunset period

---

## Best Practices

- Avoid breaking changes within the same version
- Use clear and consistent naming conventions
- Always include the version in the API path
- Keep documentation up to date for each version
- Make sure transitions between versions are smooth for clients

---

## Summary

| Aspect                  | Strategy Used        |
|-------------------------|----------------------|
| Versioning Method       | URI-based (/api/v1)  |
| Breaking Changes        | New version          |
| Backward Compatibility  | Maintained           |
| Deprecation Policy      | Gradual removal      |
| Documentation           | Version-specific     |

---

## Conclusion

This versioning strategy keeps the Inventra backend stable and easy to evolve over time. New features can be added, old ones can be retired — all without disrupting the clients that depend on the system.
