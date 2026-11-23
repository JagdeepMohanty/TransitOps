/**
 * Signup, Login & Admin Approval Integration Tests
 *
 * Tests:
 *  1. New email registration
 *  2. Duplicate email registration
 *  3. Valid and invalid form inputs
 *  4. Requested role selection
 *  5. Pending account login
 *  6. Admin approval
 *  7. Approved account login
 *  8. Rejected account login
 *  9. Unauthorized approval attempt
 * 10. Attempt to register as Admin
 * 11. Attempt to modify assigned role through API
 * 12. Existing user login after migration
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';
import prisma from '../src/config/prisma.js';

const PORT = process.env.PORT || 5001;
const BASE = process.env.TEST_API_URL || `http://localhost:${PORT}/api`;

async function req(method, path, body, token) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res  = await fetch(`${BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

describe('Signup, Login and Admin Approval Workflow', () => {
  let adminToken = null;
  let dispatcherToken = null;
  let adminUserId = null;

  const testTimestamp = Date.now();
  const createdUserIds = [];

  before(async () => {
    // Login as Admin (Fleet Manager)
    const adminRes = await req('POST', '/auth/login', {
      email: 'fleet@transitops.com',
      password: 'Fleet@123',
    });
    assert.equal(adminRes.status, 200, 'Admin login failed');
    adminToken = adminRes.body.data.token;
    adminUserId = adminRes.body.data.user.id;

    // Login as Dispatcher
    const dispRes = await req('POST', '/auth/login', {
      email: 'dispatcher@transitops.com',
      password: 'Dispatcher@123',
    });
    assert.equal(dispRes.status, 200, 'Dispatcher login failed');
    dispatcherToken = dispRes.body.data.token;
  });

  after(async () => {
    // Cleanup created test users
    for (const uid of createdUserIds) {
      await prisma.user.deleteMany({ where: { id: uid } });
    }
    await prisma.$disconnect();
  });

  // ── 1. New Email Registration ──────────────────────────────────────────────
  describe('1. New Email Registration', () => {
    it('creates a new user with PENDING status and null roleId', async () => {
      const email = `test-user-reg-${testTimestamp}@example.com`;
      const res = await req('POST', '/auth/register', {
        name: 'Test New User',
        email,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        requestedRole: 'Dispatcher',
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.user);
      assert.equal(res.body.data.user.email, email);
      assert.equal(res.body.data.user.approvalStatus, 'PENDING');
      assert.equal(res.body.data.user.roleId, null);
      assert.equal(res.body.data.user.requestedRole, 'DISPATCHER');

      createdUserIds.push(res.body.data.user.id);
    });
  });

  // ── 2. Duplicate Email Registration ────────────────────────────────────────
  describe('2. Duplicate Email Registration', () => {
    it('rejects registration with existing email with 409 Conflict', async () => {
      const email = `test-user-dup-${testTimestamp}@example.com`;
      const first = await req('POST', '/auth/register', {
        name: 'First Registrant',
        email,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        requestedRole: 'Financial Analyst',
      });
      assert.equal(first.status, 201);
      createdUserIds.push(first.body.data.user.id);

      const second = await req('POST', '/auth/register', {
        name: 'Second Registrant',
        email,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        requestedRole: 'Financial Analyst',
      });
      assert.equal(second.status, 409);
      assert.equal(second.body.success, false);
      assert.match(second.body.message, /already exists/i);
    });
  });

  // ── 3. Valid and Invalid Form Inputs ───────────────────────────────────────
  describe('3. Form Validation', () => {
    it('rejects invalid email format with 400', async () => {
      const res = await req('POST', '/auth/register', {
        name: 'Bad Email User',
        email: 'not-an-email',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        requestedRole: 'Dispatcher',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('rejects short password (< 8 chars) with 400', async () => {
      const res = await req('POST', '/auth/register', {
        name: 'Short Password User',
        email: `test-short-${testTimestamp}@example.com`,
        password: 'Pass1',
        confirmPassword: 'Pass1',
        requestedRole: 'Dispatcher',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('rejects password without numbers with 400', async () => {
      const res = await req('POST', '/auth/register', {
        name: 'No Number User',
        email: `test-nonum-${testTimestamp}@example.com`,
        password: 'PasswordOnly',
        confirmPassword: 'PasswordOnly',
        requestedRole: 'Dispatcher',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('rejects mismatched confirmPassword with 400', async () => {
      const res = await req('POST', '/auth/register', {
        name: 'Mismatch Password User',
        email: `test-mismatch-${testTimestamp}@example.com`,
        password: 'Password@123',
        confirmPassword: 'DifferentPassword@123',
        requestedRole: 'Dispatcher',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('rejects invalid / unsupported requestedRole with 400', async () => {
      const res = await req('POST', '/auth/register', {
        name: 'Invalid Role User',
        email: `test-invrole-${testTimestamp}@example.com`,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        requestedRole: 'SuperAdminMaster',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  // ── 4. Requested Role Selection ────────────────────────────────────────────
  describe('4. Requested Role Selection', () => {
    it('supports selecting Security Officer and normalizes to SAFETY_OFFICER', async () => {
      const res = await req('POST', '/auth/register', {
        name: 'Safety Officer Applicant',
        email: `test-safety-${testTimestamp}@example.com`,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        requestedRole: 'Security Officer',
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.user.requestedRole, 'SAFETY_OFFICER');
      assert.equal(res.body.data.user.approvalStatus, 'PENDING');
      createdUserIds.push(res.body.data.user.id);
    });

    it('supports selecting Financial Analyst and normalizes to FINANCIAL_ANALYST', async () => {
      const res = await req('POST', '/auth/register', {
        name: 'Finance Applicant',
        email: `test-fin-${testTimestamp}@example.com`,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        requestedRole: 'Financial Analyst',
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.user.requestedRole, 'FINANCIAL_ANALYST');
      createdUserIds.push(res.body.data.user.id);
    });
  });

  // ── 5. Pending Account Login Denial ────────────────────────────────────────
  describe('5. Pending Account Login Denial', () => {
    it('denies login to PENDING accounts with 403 and awaiting approval message', async () => {
      const email = `test-pending-login-${testTimestamp}@example.com`;
      const reg = await req('POST', '/auth/register', {
        name: 'Pending Login User',
        email,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        requestedRole: 'Dispatcher',
      });
      assert.equal(reg.status, 201);
      createdUserIds.push(reg.body.data.user.id);

      const loginRes = await req('POST', '/auth/login', {
        email,
        password: 'Password@123',
      });

      assert.equal(loginRes.status, 403);
      assert.equal(loginRes.body.success, false);
      assert.ok(!loginRes.body.data);
      assert.match(loginRes.body.message, /awaiting administrator approval/i);
    });
  });

  // ── 6. Admin Approval ──────────────────────────────────────────────────────
  let userToApproveId = null;
  const userToApproveEmail = `test-approval-${testTimestamp}@example.com`;

  describe('6. Admin Approval', () => {
    before(async () => {
      const reg = await req('POST', '/auth/register', {
        name: 'Applicant To Approve',
        email: userToApproveEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        requestedRole: 'Dispatcher',
      });
      assert.equal(reg.status, 201);
      userToApproveId = reg.body.data.user.id;
      createdUserIds.push(userToApproveId);
    });

    it('allows FLEET_MANAGER to approve user and assign role', async () => {
      const approveRes = await req(
        'POST',
        `/users/${userToApproveId}/approve`,
        { roleId: 2 }, // DISPATCHER role
        adminToken
      );

      assert.equal(approveRes.status, 200);
      assert.equal(approveRes.body.success, true);
      assert.equal(approveRes.body.data.approvalStatus, 'APPROVED');
      assert.equal(approveRes.body.data.roleId, 2);
      assert.ok(approveRes.body.data.approvedAt);
    });

    it('rejects self-approval by an administrator with 400', async () => {
      const selfApprove = await req(
        'POST',
        `/users/${adminUserId}/approve`,
        { roleId: 1 },
        adminToken
      );
      assert.equal(selfApprove.status, 400);
      assert.match(selfApprove.body.message, /cannot self-approve/i);
    });
  });

  // ── 7. Approved Account Login ──────────────────────────────────────────────
  describe('7. Approved Account Login', () => {
    it('allows approved account to log in and obtain valid JWT session', async () => {
      const loginRes = await req('POST', '/auth/login', {
        email: userToApproveEmail,
        password: 'Password@123',
      });

      assert.equal(loginRes.status, 200);
      assert.equal(loginRes.body.success, true);
      assert.ok(loginRes.body.data.token);
      assert.equal(loginRes.body.data.user.role.name, 'DISPATCHER');

      // Verify token with /auth/me
      const meRes = await req('GET', '/auth/me', null, loginRes.body.data.token);
      assert.equal(meRes.status, 200);
      assert.equal(meRes.body.data.email, userToApproveEmail);
      assert.equal(meRes.body.data.approvalStatus, 'APPROVED');
    });
  });

  // ── 8. Rejected Account Login ──────────────────────────────────────────────
  describe('8. Rejected Account Login', () => {
    let rejectedUserId = null;
    const rejectedEmail = `test-rejected-${testTimestamp}@example.com`;

    before(async () => {
      const reg = await req('POST', '/auth/register', {
        name: 'Rejected Applicant',
        email: rejectedEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        requestedRole: 'Financial Analyst',
      });
      assert.equal(reg.status, 201);
      rejectedUserId = reg.body.data.user.id;
      createdUserIds.push(rejectedUserId);

      // Admin rejects user
      const rejRes = await req(
        'POST',
        `/users/${rejectedUserId}/reject`,
        { reason: 'Unverified organizational affiliation' },
        adminToken
      );
      assert.equal(rejRes.status, 200);
      assert.equal(rejRes.body.data.approvalStatus, 'REJECTED');
    });

    it('denies login to REJECTED accounts with 403 and rejection message', async () => {
      const loginRes = await req('POST', '/auth/login', {
        email: rejectedEmail,
        password: 'Password@123',
      });

      assert.equal(loginRes.status, 403);
      assert.equal(loginRes.body.success, false);
      assert.ok(!loginRes.body.data);
      assert.match(loginRes.body.message, /rejected/i);
    });
  });

  // ── 9. Unauthorized Approval Attempt ───────────────────────────────────────
  describe('9. Unauthorized Approval Attempt', () => {
    it('rejects unauthenticated approval request with 401', async () => {
      const res = await req('POST', `/users/${userToApproveId}/approve`, { roleId: 2 });
      assert.equal(res.status, 401);
    });

    it('rejects non-admin (DISPATCHER) approval request with 403', async () => {
      const res = await req(
        'POST',
        `/users/${userToApproveId}/approve`,
        { roleId: 2 },
        dispatcherToken
      );
      assert.equal(res.status, 403);
    });
  });

  // ── 10. Attempt to Register as Admin ────────────────────────────────────────
  describe('10. Attempt to Register as Admin', () => {
    it('strips elevated role payload during signup and sets PENDING with null roleId', async () => {
      const email = `test-fakeadmin-${testTimestamp}@example.com`;
      const res = await req('POST', '/auth/register', {
        name: 'Wannabe Admin',
        email,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        requestedRole: 'Fleet Manager',
        roleId: 1, // Malicious payload attempting self-elevation
        approvalStatus: 'APPROVED', // Malicious payload attempting self-approval
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.user.approvalStatus, 'PENDING');
      assert.equal(res.body.data.user.roleId, null);
      createdUserIds.push(res.body.data.user.id);

      // Verify cannot login without approval
      const loginRes = await req('POST', '/auth/login', {
        email,
        password: 'Password@123',
      });
      assert.equal(loginRes.status, 403);
    });
  });

  // ── 11. Attempt to Modify Assigned Role Through API ─────────────────────────
  describe('11. Attempt to Modify Role Through API', () => {
    it('rejects non-admin attempt to modify roles with 403', async () => {
      const res = await req(
        'PUT',
        `/users/${userToApproveId}/role`,
        { roleId: 1 },
        dispatcherToken
      );
      assert.equal(res.status, 403);
    });

    it('rejects administrator attempt to modify their own role with 400', async () => {
      const res = await req(
        'PUT',
        `/users/${adminUserId}/role`,
        { roleId: 2 },
        adminToken
      );
      assert.equal(res.status, 400);
      assert.match(res.body.message, /cannot modify your own role/i);
    });
  });

  // ── 12. Existing User Login After Migration ────────────────────────────────
  describe('12. Existing User Login After Migration', () => {
    const existingUsers = [
      { email: 'fleet@transitops.com',      password: 'Fleet@123',      expectedRole: 'FLEET_MANAGER'     },
      { email: 'dispatcher@transitops.com', password: 'Dispatcher@123', expectedRole: 'DISPATCHER'        },
      { email: 'safety@transitops.com',     password: 'Safety@123',     expectedRole: 'SAFETY_OFFICER'    },
      { email: 'finance@transitops.com',    password: 'Finance@123',    expectedRole: 'FINANCIAL_ANALYST' },
    ];

    for (const u of existingUsers) {
      it(`allows existing user ${u.email} to log in with role ${u.expectedRole}`, async () => {
        const res = await req('POST', '/auth/login', {
          email: u.email,
          password: u.password,
        });

        assert.equal(res.status, 200, `Failed to login as ${u.email}`);
        assert.equal(res.body.success, true);
        assert.ok(res.body.data.token);
        assert.equal(res.body.data.user.role.name, u.expectedRole);
        assert.equal(res.body.data.user.approvalStatus, 'APPROVED');
      });
    }
  });
});
