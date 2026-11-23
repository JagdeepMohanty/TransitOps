# TransitOps — Phase 1: User Signup, Login & Admin Approval Workflow

**Date:** November 2026  
**System:** TransitOps Commercial Fleet & Transportation Management System  
**Document:** `docs/PHASE_1_SIGNUP_APPROVAL.md`  
**Status:** Implemented, Fully Tested & Verified  

---

## 1. Executive Summary

A secure, enterprise-grade user registration and administrator approval workflow was designed and implemented for TransitOps. Previously, the system provided only direct sign-in for pre-seeded accounts.

With this release:
1. Any new user can submit an operational account registration request via the **Sign Up** portal (`/register` and `/signup`).
2. Self-elevation and immediate login bypass are strictly prevented. Newly created accounts receive an immutable `approvalStatus = 'PENDING'` and `roleId = null`.
3. Authorized Fleet Managers can view, approve, reject, and assign/modify RBAC roles via the **User Management & Approvals** console in Settings (`/settings`).
4. Login attempts are gated:
   - **APPROVED**: Granted JWT token and application access.
   - **PENDING**: Denied access with HTTP 403: *"Your account is awaiting administrator approval."*
   - **REJECTED**: Denied access with HTTP 403: *"Your account registration was rejected by an administrator."* (including rejection reason if recorded).
5. All 92 automated integration tests pass across the entire suite (Auth, Vehicles, Drivers, Maintenance, Trips, and Signup/Approval).

---

## 2. Database Changes & Safe Migration

### 2.1 Schema Updates (`server/prisma/schema.prisma`)
The `User` model and an `ApprovalStatus` enum were introduced:

```prisma
enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

model User {
  id              Int            @id @default(autoincrement())
  name            String
  email           String         @unique
  passwordHash    String
  roleId          Int?
  role            Role?          @relation(fields: [roleId], references: [id])
  requestedRole   String?
  approvalStatus  ApprovalStatus @default(PENDING)
  approvedAt      DateTime?
  rejectedAt      DateTime?
  approvedById    Int?
  approvedBy      User?          @relation("UserApprovals", fields: [approvedById], references: [id])
  approvedUsers   User[]         @relation("UserApprovals")
  rejectionReason String?        @db.Text
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([approvalStatus])
  @@map("users")
}
```

### 2.2 Safe Backfill Strategy
Existing users (`fleet@transitops.com`, `dispatcher@transitops.com`, `safety@transitops.com`, `finance@transitops.com`) were safely backfilled without data loss or downtime:
- `approvalStatus` set to `'APPROVED'`.
- `approvedAt` set to timestamp of migration.
- `requestedRole` backfilled to current role (`FLEET_MANAGER`, `DISPATCHER`, etc.).
- Active relations and passwords remained 100% intact.

---

## 3. Endpoints & API Contracts

### 3.1 Authentication Endpoints
- **`POST /api/auth/register`** (alias: **`POST /api/auth/signup`**)
  - **Access:** Public
  - **Body:**
    ```json
    {
      "name": "Vikram Sharma",
      "email": "vikram@example.com",
      "password": "Password@123",
      "confirmPassword": "Password@123",
      "requestedRole": "Dispatcher"
    }
    ```
  - **Validation:**
    - Full name required (min 2 chars).
    - Email required and unique.
    - Password min 8 chars with at least one letter and one digit.
    - `confirmPassword` must match `password`.
    - `requestedRole` must be one of: `'Fleet Manager'`, `'Security Officer'`, `'Dispatcher'`, `'Financial Analyst'`.
  - **Behavior:**
    - Strips any client-provided `roleId` or `approvalStatus`.
    - Creates record with `roleId = null`, `approvalStatus = 'PENDING'`, and normalized `requestedRole`.
    - Returns HTTP 201 Created. Does NOT issue JWT tokens.
  - **Duplicate Handling:**
    - Returns HTTP 409 Conflict: *"A user with this email address already exists"*.

- **`POST /api/auth/login`**
  - **Access:** Public
  - **Behavior:**
    - Authenticates email and bcrypt password.
    - Checks `approvalStatus`:
      - `PENDING` -> HTTP 403 Forbidden (*"Your account is awaiting administrator approval."*).
      - `REJECTED` -> HTTP 403 Forbidden (*"Your account registration was rejected by an administrator. Reason: ..."*).
      - `APPROVED` -> HTTP 200 OK with signed JWT session token.

### 3.2 Administrator Approval Endpoints (`/api/users`)
- **`GET /api/users?approvalStatus=PENDING|APPROVED|REJECTED|all`**
  - **Access:** Authenticated
  - **Behavior:** Lists users filtered by approval state.
- **`POST /api/users/:id/approve`**
  - **Access:** Authenticated (`FLEET_MANAGER` only)
  - **Body:** `{ "roleId": 2 }` or `{ "roleName": "Dispatcher" }`
  - **Behavior:**
    - Rejects self-approval attempts with HTTP 400.
    - Validates target role and assigns `roleId`.
    - Sets `approvalStatus = 'APPROVED'`, `approvedAt = NOW()`, `approvedById = admin.id`.
- **`POST /api/users/:id/reject`**
  - **Access:** Authenticated (`FLEET_MANAGER` only)
  - **Body:** `{ "reason": "Unverified credentials" }`
  - **Behavior:**
    - Rejects self-rejection attempts with HTTP 400.
    - Prevents accidental lockout of the last active `FLEET_MANAGER`.
    - Sets `approvalStatus = 'REJECTED'`, `roleId = null`, `rejectedAt = NOW()`, `rejectionReason`.
- **`PUT /api/users/:id/role`**
  - **Access:** Authenticated (`FLEET_MANAGER` only)
  - **Body:** `{ "roleId": 3 }`
  - **Behavior:** Updates assigned role with safeguards against admin demoting themselves.

---

## 4. Security & Access Control Enforcement

1. **Client Role Untrusted:**
   - Any `roleId`, `role`, or `approvalStatus` injected into the signup payload is ignored.
   - The user's selection is stored purely as `requestedRole` for admin review.
2. **Backend Authentication Guard (`auth.middleware.js`):**
   - Every protected route verifies that `user.approvalStatus === 'APPROVED'` against the live MySQL database on every request.
   - If an account is suspended or rejected after token issuance, subsequent API calls are blocked immediately with HTTP 403.
3. **RBAC Endpoint Authorization (`role.middleware.js`):**
   - Approval, rejection, and role-change routes enforce `authorize('FLEET_MANAGER')`.
   - Dispatchers, safety officers, financial analysts, and unauthenticated callers receive HTTP 403/401.
4. **Admin Lockout Protection:**
   - Administrators cannot delete or demote their own account.
   - The system prevents deleting, rejecting, or demoting the last active `FLEET_MANAGER` in the database.

---

## 5. Frontend Interfaces

1. **Sign In Page (`/login`):**
   - Includes navigation link: *"Need an account? Register for Access"*.
   - Displays dedicated amber alert box when login is rejected due to pending status: *"Approval Pending: Your account is awaiting administrator approval."*
   - Displays dedicated rose alert box when login is rejected due to rejected status.
2. **Sign Up Page (`/register`, `/signup`):**
   - Full Name, Email, Password, Confirm Password, and Requested Role dropdown.
   - Live password policy requirements checklist.
   - Instant duplicate email error detection.
   - Success submission state with clear details of the pending approval process and a button to return to Sign In.
3. **User Management & Approval Console (`/settings`):**
   - Status tab strip: **All Users**, **Pending Approvals (with live badge)**, **Approved**, **Rejected**.
   - Displays User avatar, Name, Email, Approval Status badge, Requested Role, Assigned Role, Registration Date.
   - Interactive action controls:
     - **Approve**: Triggers `ApprovalModal` to select/confirm the assigned role.
     - **Reject**: Triggers `ApprovalModal` with optional rejection reason.
     - **Role**: Allows instant reassignment of approved roles.

---

## 6. Automated Test Results

Test runner executed across all suites:
```bash
node --test tests/auth.test.js tests/vehicles.test.js tests/drivers.test.js tests/maintenance.test.js tests/trips.test.js tests/signup_approval.test.js
```

### Verified Test Matrix

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| 1 | New email registration | HTTP 201, `approvalStatus: PENDING`, `roleId: null` | ✅ PASS |
| 2 | Duplicate email registration | HTTP 409 Conflict with duplicate email message | ✅ PASS |
| 3 | Invalid email format | HTTP 400 Bad Request | ✅ PASS |
| 4 | Short password (< 8 chars) | HTTP 400 Bad Request | ✅ PASS |
| 5 | Password without numbers | HTTP 400 Bad Request | ✅ PASS |
| 6 | Mismatched confirmPassword | HTTP 400 Bad Request | ✅ PASS |
| 7 | Unsupported requested role | HTTP 400 Bad Request | ✅ PASS |
| 8 | Requested role: Security Officer | HTTP 201, normalized to `SAFETY_OFFICER` | ✅ PASS |
| 9 | Requested role: Financial Analyst | HTTP 201, normalized to `FINANCIAL_ANALYST` | ✅ PASS |
| 10 | Pending account login | HTTP 403 Forbidden, *"Your account is awaiting administrator approval."* | ✅ PASS |
| 11 | Admin approval (`roleId: 2`) | HTTP 200 OK, `approvalStatus: APPROVED`, `roleId: 2` | ✅ PASS |
| 12 | Admin self-approval attempt | HTTP 400 Bad Request, *"Administrators cannot self-approve"* | ✅ PASS |
| 13 | Approved account login | HTTP 200 OK, returns signed JWT and `DISPATCHER` profile | ✅ PASS |
| 14 | Approved account `/auth/me` | HTTP 200 OK, returns approved session | ✅ PASS |
| 15 | Admin user rejection | HTTP 200 OK, `approvalStatus: REJECTED` with reason | ✅ PASS |
| 16 | Rejected account login | HTTP 403 Forbidden, *"Your account registration was rejected"* | ✅ PASS |
| 17 | Unauthenticated approval attempt | HTTP 401 Unauthorized | ✅ PASS |
| 18 | Non-admin (Dispatcher) approval attempt | HTTP 403 Forbidden | ✅ PASS |
| 19 | Attempt to register as Admin | Role/status stripped, created as `PENDING` with `roleId: null` | ✅ PASS |
| 20 | Non-admin attempt to modify roles | HTTP 403 Forbidden | ✅ PASS |
| 21 | Admin attempt to demote own role | HTTP 400 Bad Request, *"cannot modify your own role"* | ✅ PASS |
| 22 | Existing user `fleet@transitops.com` login | HTTP 200 OK, `FLEET_MANAGER`, `APPROVED` | ✅ PASS |
| 23 | Existing user `dispatcher@transitops.com` login | HTTP 200 OK, `DISPATCHER`, `APPROVED` | ✅ PASS |
| 24 | Existing user `safety@transitops.com` login | HTTP 200 OK, `SAFETY_OFFICER`, `APPROVED` | ✅ PASS |
| 25 | Existing user `finance@transitops.com` login | HTTP 200 OK, `FINANCIAL_ANALYST`, `APPROVED` | ✅ PASS |

**Total Suite Metrics:**
- **Suites:** 46
- **Total Tests:** 92
- **Pass:** 92
- **Fail:** 0
- **Cancelled:** 0
- **Duration:** ~10.45s
