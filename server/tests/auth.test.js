/**
 * Auth Module Integration Tests
 *
 * Runner : node --test tests/auth.test.js
 * Requires a running MySQL instance and running backend server on PORT (default 5001)
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
  const json = await res.json();
  return { status: res.status, body: json };
}

let validToken = null;

describe('Auth Module', () => {

  describe('POST /auth/login — User Authentication', () => {

    it('succeeds with valid credentials', async () => {
      const res = await req('POST', '/auth/login', {
        email: 'fleet@transitops.com',
        password: 'Fleet@123',
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.token, 'Should return a JWT token');
      assert.ok(res.body.data.user, 'Should return user object');
      assert.equal(res.body.data.user.email, 'fleet@transitops.com');
      assert.equal(typeof res.body.data.token, 'string');
      // Ensure password hash is not leaked
      assert.equal(res.body.data.user.passwordHash, undefined);
      validToken = res.body.data.token;
    });

    it('rejects invalid password with 401', async () => {
      const res = await req('POST', '/auth/login', {
        email: 'fleet@transitops.com',
        password: 'WrongPassword!',
      });
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid/i);
    });

    it('rejects non-existent email with 401', async () => {
      const res = await req('POST', '/auth/login', {
        email: 'nonexistent@transitops.com',
        password: 'Fleet@123',
      });
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid/i);
    });

    it('rejects missing password with 400', async () => {
      const res = await req('POST', '/auth/login', {
        email: 'fleet@transitops.com',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('rejects invalid email format with 400', async () => {
      const res = await req('POST', '/auth/login', {
        email: 'not-an-email',
        password: 'Fleet@123',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

  });

  describe('GET /auth/me — Current User Session', () => {

    it('returns current user profile with valid token', async () => {
      assert.ok(validToken, 'Valid token must be present from login test');
      const res = await req('GET', '/auth/me', null, validToken);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.email, 'fleet@transitops.com');
      assert.ok(res.body.data.role);
    });

    it('rejects request with missing token with 401', async () => {
      const res = await req('GET', '/auth/me', null, null);
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('rejects request with malformed / invalid token with 401', async () => {
      const res = await req('GET', '/auth/me', null, 'invalid.bearer.token');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

  });

  describe('POST /auth/logout — User Logout', () => {

    it('returns 200 on logout', async () => {
      const res = await req('POST', '/auth/logout', null, validToken);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });

  });

});

