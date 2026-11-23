/**
 * Maintenance Module Integration Tests
 *
 * Runner : node --test tests/maintenance.test.js
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
let vehicleId;
let maintenanceId;
const TEST_REG = 'TEST-MAINT-VEH';

before(async () => {
  // Clean up any previous test leftovers
  await prisma.maintenance.deleteMany({
    where: { vehicle: { registrationNumber: TEST_REG } },
  });
  await prisma.vehicle.deleteMany({ where: { registrationNumber: TEST_REG } });

  // Login as Fleet Manager
  const loginRes = await req('POST', '/auth/login', {
    email: 'fleet@transitops.com',
    password: 'Fleet@123',
  });
  assert.equal(loginRes.status, 200);
  token = loginRes.body.data.token;

  // Create test vehicle
  const vRes = await req('POST', '/vehicles', {
    registrationNumber: TEST_REG,
    name: 'Maint Test Vehicle',
    type: 'Truck',
    maxLoadCapacity: 8000,
    acquisitionCost: 400000,
    odometer: 10000,
  }, token);
  assert.equal(vRes.status, 201);
  vehicleId = vRes.body.data.id;
});

after(async () => {
  // Cleanup in proper order
  await prisma.maintenance.deleteMany({
    where: { vehicleId },
  });
  await prisma.vehicle.deleteMany({ where: { id: vehicleId } });
  await prisma.$disconnect();
});

describe('Maintenance Module', () => {

  describe('POST /maintenance — Create Maintenance Log', () => {

    it('creates a maintenance log and sets vehicle status to IN_SHOP', async () => {
      const res = await req('POST', '/maintenance', {
        vehicleId,
        maintenanceType: 'Oil Change & Brake Service',
        description: 'Scheduled 10,000 km routine maintenance',
        cost: 4500,
        startDate: new Date().toISOString(),
      }, token);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.id);
      assert.equal(res.body.data.status, 'ACTIVE');
      assert.equal(Number(res.body.data.cost), 4500);
      maintenanceId = res.body.data.id;

      // Verify vehicle status became IN_SHOP
      const vRes = await req('GET', `/vehicles/${vehicleId}`, null, token);
      assert.equal(vRes.body.data.status, 'IN_SHOP');
    });

    it('rejects invalid vehicleId with 400 or 404', async () => {
      const res = await req('POST', '/maintenance', {
        vehicleId: 999999,
        maintenanceType: 'Engine Repair',
        cost: 1000,
        startDate: new Date().toISOString(),
      }, token);

      assert.ok(res.status >= 400);
      assert.equal(res.body.success, false);
    });

    it('rejects missing maintenanceType with 400', async () => {
      const res = await req('POST', '/maintenance', {
        vehicleId,
        cost: 1000,
        startDate: new Date().toISOString(),
      }, token);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

  });

  describe('GET /maintenance — List Maintenance Logs', () => {

    it('returns paginated maintenance logs', async () => {
      const res = await req('GET', '/maintenance?page=1&limit=10', null, token);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.data));
      assert.ok(res.body.data.pagination);
    });

  });

  describe('GET /maintenance/:id — Get Maintenance Details', () => {

    it('returns maintenance log by id', async () => {
      assert.ok(maintenanceId, 'maintenanceId must exist');
      const res = await req('GET', `/maintenance/${maintenanceId}`, null, token);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, maintenanceId);
      assert.equal(res.body.data.vehicleId, vehicleId);
    });

    it('returns 404 for non-existent maintenance id', async () => {
      const res = await req('GET', '/maintenance/999999', null, token);
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

  });

  describe('PUT /maintenance/:id — Update Maintenance Log', () => {

    it('updates maintenance description and cost', async () => {
      assert.ok(maintenanceId, 'maintenanceId must exist');
      const res = await req('PUT', `/maintenance/${maintenanceId}`, {
        description: 'Updated routine maintenance description',
        cost: 5200,
      }, token);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.description, 'Updated routine maintenance description');
      assert.equal(Number(res.body.data.cost), 5200);
    });

  });

  describe('POST /maintenance/:id/close — Close Maintenance Log', () => {

    it('closes maintenance log and restores vehicle to AVAILABLE', async () => {
      assert.ok(maintenanceId, 'maintenanceId must exist');
      const res = await req('POST', `/maintenance/${maintenanceId}/close`, {
        endDate: new Date().toISOString(),
        cost: 5200,
        notes: 'Service successfully completed, test drive passed',
      }, token);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'COMPLETED');
      assert.ok(res.body.data.endDate);

      // Verify vehicle status is restored to AVAILABLE
      const vRes = await req('GET', `/vehicles/${vehicleId}`, null, token);
      assert.equal(vRes.body.data.status, 'AVAILABLE');
    });

  });

});
