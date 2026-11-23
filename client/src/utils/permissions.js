/**
 * Role & Permission definitions for TransitOps commercial platform
 */
export const ROLES = {
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export const PERMISSIONS = {
  // Vehicles
  VIEW_VEHICLES: 'vehicles:view',
  CREATE_VEHICLES: 'vehicles:create',
  EDIT_VEHICLES: 'vehicles:edit',
  DELETE_VEHICLES: 'vehicles:delete',

  // Drivers
  VIEW_DRIVERS: 'drivers:view',
  CREATE_DRIVERS: 'drivers:create',
  EDIT_DRIVERS: 'drivers:edit',
  DELETE_DRIVERS: 'drivers:delete',

  // Trips
  VIEW_TRIPS: 'trips:view',
  CREATE_TRIPS: 'trips:create',
  DISPATCH_TRIPS: 'trips:dispatch',
  COMPLETE_TRIPS: 'trips:complete',
  CANCEL_TRIPS: 'trips:cancel',

  // Maintenance
  VIEW_MAINTENANCE: 'maintenance:view',
  CREATE_MAINTENANCE: 'maintenance:create',
  CLOSE_MAINTENANCE: 'maintenance:close',

  // Finance & Fuel
  VIEW_FINANCE: 'finance:view',
  CREATE_EXPENSES: 'expenses:create',
  CREATE_FUEL_LOGS: 'fuel:create',
  VIEW_REPORTS: 'reports:view',
};

const ROLE_PERMISSIONS = {
  [ROLES.FLEET_MANAGER]: Object.values(PERMISSIONS),
  [ROLES.DISPATCHER]: [
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.VIEW_TRIPS,
    PERMISSIONS.CREATE_TRIPS,
    PERMISSIONS.DISPATCH_TRIPS,
    PERMISSIONS.COMPLETE_TRIPS,
    PERMISSIONS.CANCEL_TRIPS,
    PERMISSIONS.VIEW_MAINTENANCE,
  ],
  [ROLES.SAFETY_OFFICER]: [
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.EDIT_DRIVERS,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.CREATE_MAINTENANCE,
    PERMISSIONS.CLOSE_MAINTENANCE,
    PERMISSIONS.VIEW_TRIPS,
  ],
  [ROLES.FINANCIAL_ANALYST]: [
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.CREATE_EXPENSES,
    PERMISSIONS.CREATE_FUEL_LOGS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_TRIPS,
  ],
};

/**
 * Checks if a given role has a specific permission.
 */
export function hasPermission(userRole, permission) {
  if (!userRole) return false;
  const roleName = typeof userRole === 'string' ? userRole : userRole?.name;
  const allowed = ROLE_PERMISSIONS[roleName];
  if (!allowed) return false;
  return allowed.includes(permission);
}

export default {
  ROLES,
  PERMISSIONS,
  hasPermission,
};

