import prisma from '../config/prisma.js';
import * as vehicleRepo from '../repositories/vehicle.repository.js';
import * as fuelLogRepo from '../repositories/fuelLog.repository.js';
import * as maintenanceRepo from '../repositories/maintenance.repository.js';
import * as expenseRepo from '../repositories/expense.repository.js';
import { calcFuelEfficiency, calcVehicleROI } from '../utils/calculations.js';
import { exportToCsv } from '../utils/csv.js';

const toNum = (val) => (val == null ? 0 : parseFloat(String(val)));

export const getReports = async (query = {}) => {
  const filters = {};
  if (query.vehicleId) filters.id = parseInt(query.vehicleId, 10);
  if (query.type) filters.type = query.type;
  if (query.status) filters.status = query.status;

  const dateFilter = {};
  if (query.startDate || query.endDate) {
    if (query.startDate) dateFilter.gte = new Date(query.startDate);
    if (query.endDate)   dateFilter.lte = new Date(query.endDate);
  }

  const [vehicles, drivers, trips, fuelLogs, maintenanceLogs, expenses] = await Promise.all([
    // 1. Vehicle Fleet
    prisma.vehicle.findMany({
      where: filters,
      include: {
        trips: Object.keys(dateFilter).length > 0 ? { where: { createdAt: dateFilter } } : true,
        fuelLogs: Object.keys(dateFilter).length > 0 ? { where: { logDate: dateFilter } } : true,
        maintenanceLogs: Object.keys(dateFilter).length > 0 ? { where: { startDate: dateFilter } } : true,
      },
    }),

    // 2. Drivers
    prisma.driver.findMany({
      include: {
        trips: true,
      },
      orderBy: { name: 'asc' },
    }),

    // 3. Trips History
    prisma.trip.findMany({
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),

    // 4. Fuel Logs
    prisma.fuelLog.findMany({
      where: Object.keys(dateFilter).length > 0 ? { logDate: dateFilter } : {},
      include: { vehicle: true, trip: true },
      orderBy: { logDate: 'desc' },
    }),

    // 5. Maintenance
    prisma.maintenance.findMany({
      where: Object.keys(dateFilter).length > 0 ? { startDate: dateFilter } : {},
      include: { vehicle: true },
      orderBy: { startDate: 'desc' },
    }),

    // 6. Expenses
    prisma.expense.findMany({
      where: Object.keys(dateFilter).length > 0 ? { expenseDate: dateFilter } : {},
      include: { vehicle: true, trip: true },
      orderBy: { expenseDate: 'desc' },
    }),
  ]);

  // Fleet utilization: ON_TRIP / non-retired × 100
  const onTripCount = vehicles.filter(v => v.status === 'ON_TRIP').length;
  const nonRetiredCount = vehicles.filter(v => v.status !== 'RETIRED').length;
  const fleetUtilization = nonRetiredCount > 0
    ? parseFloat(((onTripCount / nonRetiredCount) * 100).toFixed(2))
    : 0;

  // Vehicle Performance Reports
  const vehicleReports = await Promise.all(
    vehicles.map(async (vehicle) => {
      const [fuelSum, maintenanceSum, otherSum] = await Promise.all([
        fuelLogRepo.sumByVehicle(vehicle.id),
        maintenanceRepo.sumByVehicle(vehicle.id),
        expenseRepo.sumOtherByVehicle(vehicle.id),
      ]);

      const totalLiters          = toNum(fuelSum._sum.liters);
      const totalFuelCost        = toNum(fuelSum._sum.cost);
      const totalMaintenanceCost = toNum(maintenanceSum._sum.cost);
      const totalOtherCost       = toNum(otherSum._sum.amount);
      const operationalCost      = parseFloat((totalFuelCost + totalMaintenanceCost + totalOtherCost).toFixed(2));

      const totalDistance = vehicle.trips.reduce(
        (sum, t) => sum + toNum(t.actualDistance ?? t.plannedDistance),
        0
      );
      const totalRevenue = vehicle.trips.reduce(
        (sum, t) => sum + toNum(t.revenue),
        0
      );
      const acquisitionCost = toNum(vehicle.acquisitionCost);

      return {
        vehicleId:            vehicle.id,
        registrationNumber:   vehicle.registrationNumber,
        vehicleName:          vehicle.name,
        type:                 vehicle.type,
        status:               vehicle.status,
        odometer:             toNum(vehicle.odometer),
        totalTrips:           vehicle.trips.length,
        completedTrips:       vehicle.trips.filter(t => t.status === 'COMPLETED').length,
        totalDistance:        parseFloat(totalDistance.toFixed(2)),
        totalLiters:          parseFloat(totalLiters.toFixed(2)),
        totalFuelCost:        parseFloat(totalFuelCost.toFixed(2)),
        totalMaintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
        totalOtherCost:       parseFloat(totalOtherCost.toFixed(2)),
        operationalCost,
        fuelEfficiency:       calcFuelEfficiency(totalDistance, totalLiters),
        totalRevenue:         parseFloat(totalRevenue.toFixed(2)),
        roi:                  calcVehicleROI(totalRevenue, totalMaintenanceCost, totalFuelCost, totalOtherCost, acquisitionCost),
      };
    })
  );

  // Driver Performance Reports
  const driverReports = drivers.map((driver) => {
    const totalAssignedTrips = driver.trips.length;
    const completedTrips = driver.trips.filter(t => t.status === 'COMPLETED').length;
    const cancelledTrips = driver.trips.filter(t => t.status === 'CANCELLED').length;
    const totalDistance = driver.trips.reduce((s, t) => s + toNum(t.actualDistance ?? t.plannedDistance), 0);
    const completionRate = totalAssignedTrips > 0
      ? parseFloat(((completedTrips / totalAssignedTrips) * 100).toFixed(1))
      : 100.0;

    return {
      driverId: driver.id,
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      status: driver.status,
      safetyScore: driver.safetyScore ?? 100,
      totalAssignedTrips,
      completedTrips,
      cancelledTrips,
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      completionRate,
      licenseExpiryDate: driver.licenseExpiryDate,
    };
  });

  // Monthly Operational Summary
  const monthlyMap = {};
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (const t of trips) {
    const d = new Date(t.createdAt);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        key,
        month: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        trips: 0,
        revenue: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        expenseCost: 0,
      };
    }
    monthlyMap[key].trips += 1;
    monthlyMap[key].revenue += toNum(t.revenue);
  }

  for (const f of fuelLogs) {
    const d = new Date(f.logDate);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyMap[key]) monthlyMap[key].fuelCost += toNum(f.cost);
  }

  for (const m of maintenanceLogs) {
    const d = new Date(m.startDate);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyMap[key]) monthlyMap[key].maintenanceCost += toNum(m.cost);
  }

  for (const e of expenses) {
    const d = new Date(e.expenseDate);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyMap[key]) monthlyMap[key].expenseCost += toNum(e.amount);
  }

  const monthlyReport = Object.values(monthlyMap)
    .sort((a, b) => b.key.localeCompare(a.key))
    .map(m => ({
      ...m,
      revenue: Math.round(m.revenue),
      fuelCost: Math.round(m.fuelCost),
      maintenanceCost: Math.round(m.maintenanceCost),
      expenseCost: Math.round(m.expenseCost),
      netOperatingProfit: Math.round(m.revenue - (m.fuelCost + m.maintenanceCost + m.expenseCost)),
    }));

  return {
    fleetUtilization,
    vehicles: vehicleReports,
    drivers: driverReports,
    trips: trips.map(t => ({
      id: t.id,
      tripNumber: t.tripNumber,
      source: t.source,
      destination: t.destination,
      status: t.status,
      vehicle: t.vehicle?.registrationNumber,
      driver: t.driver?.name,
      cargoWeight: toNum(t.cargoWeight),
      plannedDistance: toNum(t.plannedDistance),
      actualDistance: toNum(t.actualDistance),
      revenue: toNum(t.revenue),
      createdAt: t.createdAt,
    })),
    fuelLogs: fuelLogs.map(f => ({
      id: f.id,
      vehicle: f.vehicle?.registrationNumber,
      liters: toNum(f.liters),
      cost: toNum(f.cost),
      odometer: toNum(f.odometer),
      logDate: f.logDate,
    })),
    maintenanceLogs: maintenanceLogs.map(m => ({
      id: m.id,
      vehicle: m.vehicle?.registrationNumber,
      type: m.maintenanceType,
      status: m.status,
      cost: toNum(m.cost),
      startDate: m.startDate,
      endDate: m.endDate,
    })),
    expenses: expenses.map(e => ({
      id: e.id,
      vehicle: e.vehicle?.registrationNumber,
      type: e.type,
      amount: toNum(e.amount),
      description: e.description,
      expenseDate: e.expenseDate,
    })),
    monthlyReport,
  };
};

export const exportReportsCsv = async (query = {}) => {
  const reportType = query.type || 'vehicles';
  const data = await getReports(query);

  if (reportType === 'drivers') {
    const fields = ['driverId', 'name', 'licenseNumber', 'licenseCategory', 'status', 'safetyScore', 'totalAssignedTrips', 'completedTrips', 'completionRate', 'totalDistance'];
    return exportToCsv(fields, data.drivers);
  }

  if (reportType === 'trips') {
    const fields = ['id', 'source', 'destination', 'status', 'vehicle', 'driver', 'cargoWeight', 'plannedDistance', 'actualDistance', 'revenue', 'createdAt'];
    return exportToCsv(fields, data.trips);
  }

  if (reportType === 'fuel') {
    const fields = ['id', 'vehicle', 'liters', 'cost', 'odometer', 'logDate'];
    return exportToCsv(fields, data.fuelLogs);
  }

  if (reportType === 'maintenance') {
    const fields = ['id', 'vehicle', 'type', 'status', 'cost', 'startDate', 'endDate'];
    return exportToCsv(fields, data.maintenanceLogs);
  }

  if (reportType === 'expenses') {
    const fields = ['id', 'vehicle', 'type', 'amount', 'description', 'expenseDate'];
    return exportToCsv(fields, data.expenses);
  }

  if (reportType === 'monthly') {
    const fields = ['month', 'trips', 'revenue', 'fuelCost', 'maintenanceCost', 'expenseCost', 'netOperatingProfit'];
    return exportToCsv(fields, data.monthlyReport);
  }

  // Default vehicles
  const fields = [
    'vehicleId', 'registrationNumber', 'vehicleName', 'type', 'status',
    'totalTrips', 'totalDistance', 'totalLiters', 'totalFuelCost',
    'totalMaintenanceCost', 'totalOtherCost', 'operationalCost',
    'fuelEfficiency', 'totalRevenue', 'roi',
  ];
  return exportToCsv(fields, data.vehicles);
};
