/**
 * Vehicle Module Integration Tests
 *
 * Runner : node --test tests/vehicles.test.js
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
let createdVehicleId;
const TEST_REG = 'TEST-VEH-999';

before(async () => {
  // Clean up any previous test leftovers
  await prisma.vehicle.deleteMany({ where: { registrationNumber: TEST_REG } });

  // Login as Fleet Manager
  const loginRes = await req('POST', '/auth/login', {
    email: 'fleet@transitops.com',
    password: 'Fleet@123',
  });
  assert.equal(loginRes.status, 200);
  token = loginRes.body.data.token;
});

after(async () => {
  // Cleanup test vehicles
  await prisma.vehicle.deleteMany({ where: { registrationNumber: TEST_REG } });
  await prisma.$disconnect();
});

describe('Vehicle Module', () => {

  describe('POST /vehicles — Create Vehicle', () => {

    it('creates a new vehicle with valid data', async () => {
      const res = await req('POST', '/vehicles', {
        registrationNumber: TEST_REG,
        name: 'Unit-999 Hauler',
        model: 'Heavy Duty 2024',
        type: 'Truck',
        region: 'North',
        maxLoadCapacity: 12000,
        acquisitionCost: 850000,
        odometer: 1500,
      }, token);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.id);
      assert.equal(res.body.data.registrationNumber, TEST_REG);
      assert.equal(res.body.data.status, 'AVAILABLE');
      createdVehicleId = res.body.data.id;
    });

    it('rejects duplicate registrationNumber with 409', async () => {
      const res = await req('POST', '/vehicles', {
        registrationNumber: TEST_REG,
        name: 'Duplicate Truck',
        type: 'Truck',
        maxLoadCapacity: 5000,
        acquisitionCost: 300000,
      }, token);

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /already exists/i);
    });

    it('rejects missing required fields with 400', async () => {
      const res = await req('POST', '/vehicles', {
        registrationNumber: 'TEST-INVALID',
      }, token);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('rejects non-positive maxLoadCapacity with 400', async () => {
      const res = await req('POST', '/vehicles', {
        registrationNumber: 'TEST-CAP',
        name: 'Bad Cap Truck',
        type: 'Truck',
        maxLoadCapacity: -50,
        acquisitionCost: 100000,
      }, token);

      assert.equal(res.status, 400);
    });

  });

  describe('GET /vehicles — List Vehicles', () => {

    it('returns paginated vehicle list', async () => {
      const res = await req('GET', '/vehicles?page=1&limit=10', null, token);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.data));
      assert.ok(res.body.data.pagination);
      assert.ok(res.body.data.pagination.total >= 1);
    });

    it('filters vehicles by search registration number', async () => {
      const res = await req('GET', `/vehicles?search=${TEST_REG}`, null, token);
      assert.equal(res.status, 200);
      assert.ok(res.body.data.data.some(v => v.registrationNumber === TEST_REG));
    });

  });

  describe('GET /vehicles/available — Available Vehicles', () => {

    it('returns only AVAILABLE vehicles', async () => {
      const res = await req('GET', '/vehicles/available', null, token);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      for (const v of res.body.data) {
        assert.equal(v.status, 'AVAILABLE');
      }
    });

  });

  describe('GET /vehicles/:id — Get Vehicle Details', () => {

    it('returns vehicle by id', async () => {
      const res = await req('GET', `/vehicles/${createdVehicleId}`, null, token);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, createdVehicleId);
      assert.equal(res.body.data.registrationNumber, TEST_REG);
    });

    it('returns 404 for non-existent vehicle id', async () => {
      const res = await req('GET', '/vehicles/999999', null, token);
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

  });

  describe('PUT /vehicles/:id — Update Vehicle', () => {

    it('updates vehicle name and odometer', async () => {
      const res = await req('PUT', `/vehicles/${createdVehicleId}`, {
        name: 'Unit-999 Updated',
        odometer: 2500,
      }, token);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Unit-999 Updated');
      assert.equal(Number(res.body.data.odometer), 2500);
    });

  });

  describe('DELETE /vehicles/:id — Delete Vehicle', () => {

    it('deletes vehicle by id', async () => {
      const res = await req('DELETE', `/vehicles/${createdVehicleId}`, null, token);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });

    it('returns 404 after deletion', async () => {
      const res = await req('GET', `/vehicles/${createdVehicleId}`, null, token);
      assert.equal(res.status, 404);
    });

  });

});

