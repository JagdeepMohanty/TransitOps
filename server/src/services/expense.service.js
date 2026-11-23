import * as expenseRepo from '../repositories/expense.repository.js';
import * as vehicleRepo from '../repositories/vehicle.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

export const getAllExpenses = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filters = {};
  if (query.vehicleId) filters.vehicleId = parseInt(query.vehicleId);
  if (query.type) filters.type = query.type;
  if (query.tripId) filters.tripId = parseInt(query.tripId);
  if (query.startDate || query.endDate) {
    filters.expenseDate = {};
    if (query.startDate) filters.expenseDate.gte = new Date(query.startDate);
    if (query.endDate) filters.expenseDate.lte = new Date(query.endDate);
  }

  const [expenses, total] = await Promise.all([
    expenseRepo.findAll(filters, skip, limit),
    expenseRepo.countAll(filters),
  ]);
  return paginatedResponse(expenses, total, page, limit);
};

export const getExpenseById = async (id) => {
  const expense = await expenseRepo.findById(id);
  if (!expense) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Expense record not found.');
  return expense;
};

export const createExpense = async (data) => {
  const vehicle = await vehicleRepo.findById(data.vehicleId);
  if (!vehicle) throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.VEHICLE_NOT_FOUND);
  return expenseRepo.create({
    ...data,
    expenseDate: new Date(data.expenseDate),
  });
};

export const updateExpense = async (id, data) => {
  const expense = await expenseRepo.findById(id);
  if (!expense) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Expense record not found.');

  if (data.vehicleId && data.vehicleId !== expense.vehicleId) {
    const vehicle = await vehicleRepo.findById(data.vehicleId);
    if (!vehicle) throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.VEHICLE_NOT_FOUND);
  }

  const payload = { ...data };
  if (data.expenseDate) {
    payload.expenseDate = new Date(data.expenseDate);
  }

  return expenseRepo.update(id, payload);
};

export const deleteExpense = async (id) => {
  const expense = await expenseRepo.findById(id);
  if (!expense) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Expense record not found.');
  return expenseRepo.remove(id);
};
