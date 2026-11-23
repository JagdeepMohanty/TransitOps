import prisma from '../config/prisma.js';

const toNum = (v) => (v == null ? 0 : parseFloat(String(v)));

export const getKpis = async (query = {}) => {
  // Vehicle filters
  const vehicleWhere = {};
  if (query.type)   vehicleWhere.type   = query.type;
  if (query.region) vehicleWhere.region = query.region;
  if (query.status) vehicleWhere.status = query.status;

  // Date filters for logs, maintenance, and trips
  const dateFilter = {};
  if (query.startDate || query.endDate) {
    if (query.startDate) dateFilter.gte = new Date(query.startDate);
    if (query.endDate)   dateFilter.lte = new Date(query.endDate);
  }

  const tripWhere = {};
  if (Object.keys(dateFilter).length > 0) {
    tripWhere.createdAt = dateFilter;
  }
  if (query.driverId) {
    tripWhere.driverId = parseInt(query.driverId, 10);
  }

  const fuelWhere = {};
  if (Object.keys(dateFilter).length > 0) {
    fuelWhere.logDate = dateFilter;
  }

  const maintWhere = {};
  if (Object.keys(dateFilter).length > 0) {
    maintWhere.startDate = dateFilter;
  }

  const expenseWhere = {};
  if (Object.keys(dateFilter).length > 0) {
    expenseWhere.expenseDate = dateFilter;
  }

  const now = new Date();

  const [
    totalVehicles,
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    vehiclesOnTrip,
    retiredVehicles,
    totalDrivers,
    availableDrivers,
    driversOnDuty,
    activeTrips,
    completedTrips,
    pendingTrips,
    cancelledTrips,
    fuelSum,
    maintSum,
    expenseSum,
  ] = await Promise.all([
    // Vehicles
    prisma.vehicle.count({ where: vehicleWhere }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: { not: 'RETIRED' } } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'IN_SHOP' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'ON_TRIP' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'RETIRED' } }),

    // Drivers
    prisma.driver.count(),
    prisma.driver.count({
      where: { status: 'AVAILABLE', licenseExpiryDate: { gt: now } },
    }),
    prisma.driver.count({
      where: { status: { in: ['AVAILABLE', 'ON_TRIP'] } },
    }),

    // Trips
    prisma.trip.count({ where: { ...tripWhere, status: 'DISPATCHED' } }),
    prisma.trip.count({ where: { ...tripWhere, status: 'COMPLETED' } }),
    prisma.trip.count({ where: { ...tripWhere, status: 'DRAFT' } }),
    prisma.trip.count({ where: { ...tripWhere, status: 'CANCELLED' } }),

    // Financials
    prisma.fuelLog.aggregate({
      where: fuelWhere,
      _sum: { cost: true, liters: true },
    }),
    prisma.maintenance.aggregate({
      where: maintWhere,
      _sum: { cost: true },
    }),
    prisma.expense.aggregate({
      where: expenseWhere,
      _sum: { amount: true },
    }),
  ]);

  const nonRetired = activeVehicles;
  const fleetUtilization = nonRetired > 0
    ? parseFloat(((vehiclesOnTrip / nonRetired) * 100).toFixed(2))
    : 0;

  const totalFuelCost = toNum(fuelSum._sum.cost);
  const totalFuelLiters = toNum(fuelSum._sum.liters);
  const totalMaintenanceCost = toNum(maintSum._sum.cost);
  const totalExpenses = toNum(expenseSum._sum.amount);
  const totalOperationalCost = parseFloat((totalFuelCost + totalMaintenanceCost + totalExpenses).toFixed(2));

  return {
    totalVehicles,
    activeVehicles,
    availableVehicles,
    inactiveVehicles: retiredVehicles,
    vehiclesUnderMaintenance: vehiclesInMaintenance,
    vehiclesInMaintenance,
    vehiclesOnTrip,
    totalDrivers,
    availableDrivers,
    driversOnDuty,
    activeTrips,
    completedTrips,
    pendingTrips,
    cancelledTrips,
    totalFuelCost,
    totalFuelLiters,
    totalMaintenanceCost,
    totalExpenses,
    totalOperationalCost,
    fleetUtilization,
  };
};

export const getAnalyticsCharts = async (query = {}) => {
  // 1. Fleet status distribution
  const vehicles = await prisma.vehicle.findMany({
    select: { status: true, type: true, id: true, registrationNumber: true },
  });

  const fleetStatusCounts = {};
  for (const v of vehicles) {
    fleetStatusCounts[v.status] = (fleetStatusCounts[v.status] || 0) + 1;
  }
  const fleetStatusDistribution = Object.entries(fleetStatusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // 2. Trip status distribution
  const trips = await prisma.trip.findMany({
    select: { status: true, createdAt: true, actualDistance: true, revenue: true, fuelConsumed: true },
  });

  const tripStatusCounts = {};
  for (const t of trips) {
    tripStatusCounts[t.status] = (tripStatusCounts[t.status] || 0) + 1;
  }
  const tripStatusDistribution = Object.entries(tripStatusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // 3. Monthly trends (Trips, Expenses, Fuel, Maintenance)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrendsMap = {};

  const getMonthKey = (d) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // Populate monthly trips
  for (const t of trips) {
    const key = getMonthKey(t.createdAt);
    if (!key) continue;
    if (!monthlyTrendsMap[key]) {
      const monthIdx = parseInt(key.split('-')[1], 10) - 1;
      monthlyTrendsMap[key] = {
        key,
        month: MONTHS[monthIdx],
        trips: 0,
        completedTrips: 0,
        fuelCost: 0,
        fuelLiters: 0,
        maintenanceCost: 0,
        expenseCost: 0,
      };
    }
    monthlyTrendsMap[key].trips += 1;
    if (t.status === 'COMPLETED') monthlyTrendsMap[key].completedTrips += 1;
  }

  // Populate monthly fuel logs
  const fuelLogs = await prisma.fuelLog.findMany({
    select: { logDate: true, cost: true, liters: true },
  });
  for (const f of fuelLogs) {
    const key = getMonthKey(f.logDate);
    if (!key) continue;
    if (!monthlyTrendsMap[key]) {
      const monthIdx = parseInt(key.split('-')[1], 10) - 1;
      monthlyTrendsMap[key] = {
        key,
        month: MONTHS[monthIdx],
        trips: 0,
        completedTrips: 0,
        fuelCost: 0,
        fuelLiters: 0,
        maintenanceCost: 0,
        expenseCost: 0,
      };
    }
    monthlyTrendsMap[key].fuelCost += toNum(f.cost);
    monthlyTrendsMap[key].fuelLiters += toNum(f.liters);
  }

  // Populate monthly maintenance
  const maintenanceLogs = await prisma.maintenance.findMany({
    select: { startDate: true, cost: true },
  });
  for (const m of maintenanceLogs) {
    const key = getMonthKey(m.startDate);
    if (!key) continue;
    if (!monthlyTrendsMap[key]) {
      const monthIdx = parseInt(key.split('-')[1], 10) - 1;
      monthlyTrendsMap[key] = {
        key,
        month: MONTHS[monthIdx],
        trips: 0,
        completedTrips: 0,
        fuelCost: 0,
        fuelLiters: 0,
        maintenanceCost: 0,
        expenseCost: 0,
      };
    }
    monthlyTrendsMap[key].maintenanceCost += toNum(m.cost);
  }

  // Populate monthly expenses
  const expenses = await prisma.expense.findMany({
    select: { expenseDate: true, amount: true, type: true },
  });
  for (const e of expenses) {
    const key = getMonthKey(e.expenseDate);
    if (!key) continue;
    if (!monthlyTrendsMap[key]) {
      const monthIdx = parseInt(key.split('-')[1], 10) - 1;
      monthlyTrendsMap[key] = {
        key,
        month: MONTHS[monthIdx],
        trips: 0,
        completedTrips: 0,
        fuelCost: 0,
        fuelLiters: 0,
        maintenanceCost: 0,
        expenseCost: 0,
      };
    }
    monthlyTrendsMap[key].expenseCost += toNum(e.amount);
  }

  const monthlyTrends = Object.values(monthlyTrendsMap)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(m => ({
      ...m,
      fuelCost: Math.round(m.fuelCost),
      fuelLiters: Math.round(m.fuelLiters),
      maintenanceCost: Math.round(m.maintenanceCost),
      expenseCost: Math.round(m.expenseCost),
      totalCost: Math.round(m.fuelCost + m.maintenanceCost + m.expenseCost),
    }));

  // 4. Vehicle-wise expense comparison (Top 8 vehicles)
  const vehicleExpenseComparison = await Promise.all(
    vehicles.slice(0, 8).map(async (v) => {
      const [f, m, e] = await Promise.all([
        prisma.fuelLog.aggregate({ where: { vehicleId: v.id }, _sum: { cost: true } }),
        prisma.maintenance.aggregate({ where: { vehicleId: v.id }, _sum: { cost: true } }),
        prisma.expense.aggregate({ where: { vehicleId: v.id }, _sum: { amount: true } }),
      ]);
      const fuel = toNum(f._sum.cost);
      const maintenance = toNum(m._sum.cost);
      const other = toNum(e._sum.amount);
      return {
        vehicle: v.registrationNumber,
        fuel,
        maintenance,
        other,
        total: Math.round(fuel + maintenance + other),
      };
    })
  );

  return {
    fleetStatusDistribution,
    tripStatusDistribution,
    monthlyTrends,
    vehicleExpenseComparison,
  };
};
