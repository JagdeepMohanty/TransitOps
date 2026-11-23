import * as fuelLogRepo from '../repositories/fuelLog.repository.js';
import * as vehicleRepo from '../repositories/vehicle.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

export const getAllFuelLogs = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filters = {};
  if (query.vehicleId) filters.vehicleId = parseInt(query.vehicleId);
  if (query.tripId) filters.tripId = parseInt(query.tripId);
  if (query.startDate || query.endDate) {
    filters.logDate = {};
    if (query.startDate) filters.logDate.gte = new Date(query.startDate);
    if (query.endDate) filters.logDate.lte = new Date(query.endDate);
  }

  const [logs, total] = await Promise.all([
    fuelLogRepo.findAll(filters, skip, limit),
    fuelLogRepo.countAll(filters),
  ]);
  return paginatedResponse(logs, total, page, limit);
};

export const getFuelLogById = async (id) => {
  const log = await fuelLogRepo.findById(id);
  if (!log) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Fuel log record not found.');
  return log;
};

export const createFuelLog = async (data) => {
  const vehicle = await vehicleRepo.findById(data.vehicleId);
  if (!vehicle) throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.VEHICLE_NOT_FOUND);
  return fuelLogRepo.create({
    ...data,
    logDate: new Date(data.logDate),
  });
};

export const updateFuelLog = async (id, data) => {
  const log = await fuelLogRepo.findById(id);
  if (!log) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Fuel log record not found.');

  if (data.vehicleId && data.vehicleId !== log.vehicleId) {
    const vehicle = await vehicleRepo.findById(data.vehicleId);
    if (!vehicle) throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.VEHICLE_NOT_FOUND);
  }

  const payload = { ...data };
  if (data.logDate) {
    payload.logDate = new Date(data.logDate);
  }

  return fuelLogRepo.update(id, payload);
};

export const deleteFuelLog = async (id) => {
  const log = await fuelLogRepo.findById(id);
  if (!log) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Fuel log record not found.');
  return fuelLogRepo.remove(id);
};
