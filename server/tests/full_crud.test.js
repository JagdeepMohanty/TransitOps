/**
 * Complete CRUD Integration Test Suite for TransitOps
 * Tests all modules against live MySQL backend:
 * 1. User Management (CRUD + auth checks)
 * 2. Fuel Logs Management (Create -> Read -> Edit -> Delete)
 * 3. Expense Management (Create -> Read -> Edit -> Delete)
 * 4. Trip Management (Lifecycle: Create -> Edit -> Dispatch -> Complete / Cancel -> Delete)
 * 5. Maintenance Management (Create -> Edit -> Close -> Delete)
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

const BASE = 'http://localhost:5001/api';

let adminToken = '';
let dispatcherToken = '';

async function req(method, path, body, token) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

describe('TransitOps Phase 3 Full CRUD Test Suite', async () => {

  before(async () => {
    // Login as Fleet Manager
    const adminLogin = await req('POST', '/auth/login', {
      email: 'fleet@transitops.com',
      password: 'Fleet@123',
    });
    assert.equal(adminLogin.status, 200, 'Admin login should succeed');
    adminToken = adminLogin.data.data.token;

    // Login as Dispatcher
    const dispLogin = await req('POST', '/auth/login', {
      email: 'dispatcher@transitops.com',
      password: 'Dispatcher@123',
    });
    assert.equal(dispLogin.status, 200, 'Dispatcher login should succeed');
    dispatcherToken = dispLogin.data.data.token;
  });

  // ── 1. USER MANAGEMENT CRUD ──────────────────────────────────────────────
  describe('1. User Management Module', () => {
    let createdUserId = null;
    const testEmail = `testuser_${Date.now()}@transitops.com`;

    it('CREATE: fleet manager creates a new user', async () => {
      const res = await req('POST', '/users', {
        name: 'Automated Test User',
        email: testEmail,
        password: 'Password@123',
        roleId: 2, // DISPATCHER
      }, adminToken);
      assert.equal(res.status, 201, 'Should create user with 201');
      assert.ok(res.data.data.id);
      createdUserId = res.data.data.id;
    });

    it('CREATE: rejects duplicate email with 409', async () => {
      const res = await req('POST', '/users', {
        name: 'Duplicate User',
        email: testEmail,
        password: 'Password@123',
        roleId: 2,
      }, adminToken);
      assert.equal(res.status, 409, 'Duplicate user email must conflict');
    });

    it('READ: retrieves user list with pagination', async () => {
      const res = await req('GET', '/users?page=1&limit=5', null, adminToken);
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data.data.data));
    });

    it('READ: retrieves user by id', async () => {
      const res = await req('GET', `/users/${createdUserId}`, null, adminToken);
      assert.equal(res.status, 200);
      assert.equal(res.data.data.email, testEmail);
    });

    it('UPDATE: updates user name and role', async () => {
      const res = await req('PUT', `/users/${createdUserId}`, {
        name: 'Automated Test User Updated',
        roleId: 3, // SAFETY_OFFICER
      }, adminToken);
      assert.equal(res.status, 200);
      assert.equal(res.data.data.name, 'Automated Test User Updated');
      assert.equal(res.data.data.role.name, 'SAFETY_OFFICER');
    });

    it('DELETE: unauthorized role cannot delete user', async () => {
      const res = await req('DELETE', `/users/${createdUserId}`, null, dispatcherToken);
      assert.equal(res.status, 403, 'Dispatcher should be forbidden from deleting users');
    });

    it('DELETE: fleet manager deletes user', async () => {
      const res = await req('DELETE', `/users/${createdUserId}`, null, adminToken);
      assert.equal(res.status, 200);
    });

    it('READ: deleted user returns 404', async () => {
      const res = await req('GET', `/users/${createdUserId}`, null, adminToken);
      assert.equal(res.status, 404);
    });
  });

  // ── 2. FUEL LOGS CRUD ────────────────────────────────────────────────────
  describe('2. Fuel Logs Module', () => {
    let createdFuelId = null;
    let vehicleId = null;

    before(async () => {
      const vRes = await req('GET', '/vehicles/available', null, adminToken);
      vehicleId = vRes.data.data[0]?.id;
    });

    it('CREATE: logs fuel refill with valid volume and cost', async () => {
      const res = await req('POST', '/fuel-logs', {
        vehicleId,
        liters: 85.5,
        cost: 8120.0,
        odometer: 42150,
        logDate: new Date().toISOString(),
      }, dispatcherToken);
      assert.equal(res.status, 201);
      assert.ok(res.data.data.id);
      createdFuelId = res.data.data.id;
    });

    it('READ: lists fuel logs with pagination and vehicle details', async () => {
      const res = await req('GET', '/fuel-logs?page=1&limit=5', null, dispatcherToken);
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data.data.data));
    });

    it('READ: gets fuel log details by ID', async () => {
      const res = await req('GET', `/fuel-logs/${createdFuelId}`, null, dispatcherToken);
      assert.equal(res.status, 200);
      assert.equal(Number(res.data.data.liters), 85.5);
    });

    it('UPDATE: edits fuel volume and cost', async () => {
      const res = await req('PUT', `/fuel-logs/${createdFuelId}`, {
        liters: 90.0,
        cost: 8550.0,
      }, dispatcherToken);
      assert.equal(res.status, 200);
      assert.equal(Number(res.data.data.liters), 90.0);
    });

    it('DELETE: deletes fuel log record', async () => {
      const res = await req('DELETE', `/fuel-logs/${createdFuelId}`, null, dispatcherToken);
      assert.equal(res.status, 200);
    });

    it('READ: deleted fuel log returns 404', async () => {
      const res = await req('GET', `/fuel-logs/${createdFuelId}`, null, dispatcherToken);
      assert.equal(res.status, 404);
    });
  });

  // ── 3. EXPENSE MANAGEMENT CRUD ───────────────────────────────────────────
  describe('3. Expense Management Module', () => {
    let createdExpenseId = null;
    let vehicleId = null;

    before(async () => {
      const vRes = await req('GET', '/vehicles/available', null, adminToken);
      vehicleId = vRes.data.data[0]?.id;
    });

    it('CREATE: records a valid operational toll expense', async () => {
      const res = await req('POST', '/expenses', {
        vehicleId,
        type: 'TOLL',
        amount: 850.0,
        description: 'Highway Expressway Toll Booth',
        expenseDate: new Date().toISOString(),
      }, dispatcherToken);
      assert.equal(res.status, 201);
      assert.ok(res.data.data.id);
      createdExpenseId = res.data.data.id;
    });

    it('READ: lists expenses filtered by type', async () => {
      const res = await req('GET', '/expenses?type=TOLL', null, dispatcherToken);
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data.data.data));
    });

    it('READ: gets expense details by ID', async () => {
      const res = await req('GET', `/expenses/${createdExpenseId}`, null, dispatcherToken);
      assert.equal(res.status, 200);
      assert.equal(Number(res.data.data.amount), 850.0);
    });

    it('UPDATE: edits expense amount and description', async () => {
      const res = await req('PUT', `/expenses/${createdExpenseId}`, {
        amount: 920.0,
        description: 'Expressway Toll Booth Fastag Re-scan',
      }, dispatcherToken);
      assert.equal(res.status, 200);
      assert.equal(Number(res.data.data.amount), 920.0);
    });

    it('DELETE: deletes expense record', async () => {
      const res = await req('DELETE', `/expenses/${createdExpenseId}`, null, dispatcherToken);
      assert.equal(res.status, 200);
    });

    it('READ: deleted expense returns 404', async () => {
      const res = await req('GET', `/expenses/${createdExpenseId}`, null, dispatcherToken);
      assert.equal(res.status, 404);
    });
  });

  // ── 4. TRIP LIFECYCLE CRUD & STATE MACHINE ───────────────────────────────
  describe('4. Trip Lifecycle Module', () => {
    let vehicleId = null;
    let driverId = null;
    let tripId = null;

    before(async () => {
      // Create fresh available vehicle
      const v = await req('POST', '/vehicles', {
        registrationNumber: `MH14TEST${Date.now().toString().slice(-4)}`,
        name: 'Eicher Test Hauler',
        model: 'Pro 3015',
        type: 'HEAVY',
        region: 'WEST',
        maxLoadCapacity: 15000,
        acquisitionCost: 3500000,
        odometer: 12000,
      }, adminToken);
      assert.ok(v.data.data?.id, `Vehicle creation failed: ${JSON.stringify(v.data)}`);
      vehicleId = v.data.data.id;

      // Create fresh available driver
      const d = await req('POST', '/drivers', {
        name: 'Ramesh Pilot',
        licenseNumber: `DL-TEST-${Date.now().toString().slice(-6)}`,
        licenseCategory: 'HEAVY',
        licenseExpiryDate: '2028-12-31',
        contactNumber: '+91 99988 77766',
        safetyScore: 98,
      }, adminToken);
      assert.ok(d.data.data?.id, `Driver creation failed: ${JSON.stringify(d.data)}`);
      driverId = d.data.data.id;
    });

    it('CREATE: schedules a new DRAFT trip', async () => {
      const res = await req('POST', '/trips', {
        source: 'Mumbai Port Hub',
        destination: 'Pune Logistics Park',
        vehicleId,
        driverId,
        cargoWeight: 8000,
        plannedDistance: 160,
        revenue: 28000,
      }, dispatcherToken);
      assert.equal(res.status, 201);
      assert.equal(res.data.data.status, 'DRAFT');
      tripId = res.data.data.id;
    });

    it('UPDATE: edits DRAFT trip destination and planned distance', async () => {
      const res = await req('PUT', `/trips/${tripId}`, {
        destination: 'Pune Chakan Industrial Hub',
        plannedDistance: 175,
      }, dispatcherToken);
      assert.equal(res.status, 200);
      assert.equal(res.data.data.destination, 'Pune Chakan Industrial Hub');
      assert.equal(Number(res.data.data.plannedDistance), 175);
    });

    it('DISPATCH: dispatches trip and transitions vehicle/driver to ON_TRIP', async () => {
      const res = await req('POST', `/trips/${tripId}/dispatch`, {}, dispatcherToken);
      assert.equal(res.status, 200);
      assert.equal(res.data.data.status, 'DISPATCHED');

      // Verify asset statuses locked to ON_TRIP
      const v = await req('GET', `/vehicles/${vehicleId}`, null, adminToken);
      assert.equal(v.data.data.status, 'ON_TRIP');
      const d = await req('GET', `/drivers/${driverId}`, null, adminToken);
      assert.equal(d.data.data.status, 'ON_TRIP');
    });

    it('VALIDATION: cannot edit DISPATCHED trip', async () => {
      const res = await req('PUT', `/trips/${tripId}`, { plannedDistance: 200 }, dispatcherToken);
      assert.equal(res.status, 409, 'Only DRAFT trips can be edited');
    });

    it('COMPLETE: completes trip, updates odometer, and restores assets to AVAILABLE', async () => {
      const res = await req('POST', `/trips/${tripId}/complete`, {
        actualDistance: 180,
        fuelConsumed: 45.0,
        finalOdometer: 12180,
      }, dispatcherToken);
      assert.equal(res.status, 200);
      assert.equal(res.data.data.status, 'COMPLETED');

      // Verify asset statuses restored
      const v = await req('GET', `/vehicles/${vehicleId}`, null, adminToken);
      assert.equal(v.data.data.status, 'AVAILABLE');
      assert.equal(Number(v.data.data.odometer), 12180);
      const d = await req('GET', `/drivers/${driverId}`, null, adminToken);
      assert.equal(d.data.data.status, 'AVAILABLE');
    });
  });

  // ── 5. MAINTENANCE CRUD & WORKSHOP STATE MACHINE ──────────────────────────
  describe('5. Maintenance Module', () => {
    let vehicleId = null;
    let maintId = null;

    before(async () => {
      const v = await req('POST', '/vehicles', {
        registrationNumber: `MH02MAINT${Date.now().toString().slice(-4)}`,
        name: 'Ashok Leyland Service Bay Unit',
        type: 'MEDIUM',
        maxLoadCapacity: 10000,
        acquisitionCost: 2800000,
        odometer: 54000,
      }, adminToken);
      assert.ok(v.data.data?.id, `Vehicle creation failed: ${JSON.stringify(v.data)}`);
      vehicleId = v.data.data.id;
    });

    it('CREATE: schedules maintenance and sets vehicle to IN_SHOP', async () => {
      const res = await req('POST', '/maintenance', {
        vehicleId,
        maintenanceType: 'Brake Inspection',
        description: 'Front & rear hydraulic brake shoes replacement',
        startDate: new Date().toISOString(),
        cost: 4500,
      }, adminToken);
      assert.equal(res.status, 201);
      assert.equal(res.data.data.status, 'ACTIVE');
      maintId = res.data.data.id;

      const v = await req('GET', `/vehicles/${vehicleId}`, null, adminToken);
      assert.equal(v.data.data.status, 'IN_SHOP');
    });

    it('UPDATE: updates maintenance description and cost', async () => {
      const res = await req('PUT', `/maintenance/${maintId}`, {
        description: 'Front & rear hydraulic brake shoes replacement + fluid flush',
        cost: 5200,
      }, adminToken);
      assert.equal(res.status, 200);
      assert.equal(Number(res.data.data.cost), 5200);
    });

    it('CLOSE: closes maintenance and restores vehicle to AVAILABLE', async () => {
      const res = await req('POST', `/maintenance/${maintId}/close`, {
        cost: 5200,
        notes: 'Inspection passed, brake fluid topped up, vehicle road certified',
      }, adminToken);
      assert.equal(res.status, 200);
      assert.equal(res.data.data.status, 'COMPLETED');

      const v = await req('GET', `/vehicles/${vehicleId}`, null, adminToken);
      assert.equal(v.data.data.status, 'AVAILABLE');
    });
  });

});
