import * as userService from '../services/user.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  return new ApiResponse(HTTP_STATUS.OK, 'Users retrieved successfully', result).send(res);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(parseInt(req.params.id, 10));
  return new ApiResponse(HTTP_STATUS.OK, 'User retrieved successfully', user).send(res);
});

export const getRoles = asyncHandler(async (req, res) => {
  const roles = await userService.getRoles();
  return new ApiResponse(HTTP_STATUS.OK, 'Roles retrieved successfully', roles).send(res);
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return new ApiResponse(HTTP_STATUS.CREATED, 'User created successfully', user).send(res);
});

export const approveUser = asyncHandler(async (req, res) => {
  const user = await userService.approveUser(
    parseInt(req.params.id, 10),
    req.body,
    req.user?.userId
  );
  return new ApiResponse(HTTP_STATUS.OK, 'User registration approved successfully', user).send(res);
});

export const rejectUser = asyncHandler(async (req, res) => {
  const user = await userService.rejectUser(
    parseInt(req.params.id, 10),
    req.body,
    req.user?.userId
  );
  return new ApiResponse(HTTP_STATUS.OK, 'User registration rejected', user).send(res);
});

export const changeUserRole = asyncHandler(async (req, res) => {
  const user = await userService.changeUserRole(
    parseInt(req.params.id, 10),
    req.body,
    req.user?.userId
  );
  return new ApiResponse(HTTP_STATUS.OK, 'User role updated successfully', user).send(res);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(
    parseInt(req.params.id, 10),
    req.body,
    req.user?.userId
  );
  return new ApiResponse(HTTP_STATUS.OK, 'User updated successfully', user).send(res);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(parseInt(req.params.id, 10), req.user?.userId);
  return new ApiResponse(HTTP_STATUS.OK, 'User deleted successfully').send(res);
});
