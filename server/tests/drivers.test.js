/**
 * Driver Module Integration Tests
 *
 * Runner : node --test tests/drivers.test.js
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

let token;
let createdDriverId;
const TEST_LIC = 'TEST-DRV-LIC-777';

before(async () => {
  // Clean up any previous test leftovers
  await prisma.driver.deleteMany({ where: { licenseNumber: TEST_LIC } });

  // Login as Fleet Manager
  const loginRes = await req('POST', '/auth/login', {
    email: 'fleet@transitops.com',
    password: 'Fleet@123',
  });
  assert.equal(loginRes.status, 200);
  token = loginRes.body.data.token;
});

after(async () => {
  // Cleanup test drivers
  await prisma.driver.deleteMany({ where: { licenseNumber: TEST_LIC } });
  await prisma.$disconnect();
});

describe('Driver Module', () => {

  describe('POST /drivers — Create Driver', () => {

    it('creates a new driver with valid details', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const res = await req('POST', '/drivers', {
        name: 'John Doe Testing',
        licenseNumber: TEST_LIC,
        licenseCategory: 'Heavy Vehicle',
        licenseExpiryDate: futureDate.toISOString().split('T')[0],
        contactNumber: '9876543210',
        safetyScore: 95,
      }, token);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.id);
      assert.equal(res.body.data.licenseNumber, TEST_LIC);
      assert.equal(res.body.data.status, 'AVAILABLE');
      createdDriverId = res.body.data.id;
    });

    it('rejects duplicate licenseNumber with 409', async () => {
      const res = await req('POST', '/drivers', {
        name: 'Another Driver',
        licenseNumber: TEST_LIC,
        licenseCategory: 'Heavy Vehicle',
        licenseExpiryDate: '2028-01-01',
        contactNumber: '9876543211',
      }, token);

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /already exists/i);
    });

    it('rejects invalid licenseExpiryDate with 400', async () => {
      const res = await req('POST', '/drivers', {
        name: 'Invalid Driver',
        licenseNumber: 'TEST-LIC-INV',
        licenseCategory: 'Heavy Vehicle',
        licenseExpiryDate: 'not-a-date',
        contactNumber: '9876543210',
      }, token);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

  });

  describe('GET /drivers — List Drivers', () => {

    it('returns paginated driver list', async () => {
      const res = await req('GET', '/drivers?page=1&limit=10', null, token);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.data));
      assert.ok(res.body.data.pagination);
    });

    it('searches drivers by name or license', async () => {
      const res = await req('GET', `/drivers?search=${TEST_LIC}`, null, token);
      assert.equal(res.status, 200);
      assert.ok(res.body.data.data.some(d => d.licenseNumber === TEST_LIC));
    });

  });

  describe('GET /drivers/available — Available Drivers', () => {

    it('returns only AVAILABLE drivers', async () => {
      const res = await req('GET', '/drivers/available', null, token);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      for (const d of res.body.data) {
        assert.equal(d.status, 'AVAILABLE');
      }
    });

  });

  describe('GET /drivers/:id — Get Driver Details', () => {

    it('returns driver by id', async () => {
      const res = await req('GET', `/drivers/${createdDriverId}`, null, token);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, createdDriverId);
      assert.equal(res.body.data.licenseNumber, TEST_LIC);
    });

    it('returns 404 for unknown driver id', async () => {
      const res = await req('GET', '/drivers/999999', null, token);
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

  });

  describe('PUT /drivers/:id — Update Driver', () => {

    it('updates driver contact and safety score', async () => {
      const res = await req('PUT', `/drivers/${createdDriverId}`, {
        contactNumber: '9123456780',
        safetyScore: 98,
      }, token);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.contactNumber, '9123456780');
      assert.equal(res.body.data.safetyScore, 98);
    });

  });

  describe('DELETE /drivers/:id — Delete Driver', () => {

    it('deletes driver by id', async () => {
      const res = await req('DELETE', `/drivers/${createdDriverId}`, null, token);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });

    it('returns 404 after driver is deleted', async () => {
      const res = await req('GET', `/drivers/${createdDriverId}`, null, token);
      assert.equal(res.status, 404);
    });

  });

});

