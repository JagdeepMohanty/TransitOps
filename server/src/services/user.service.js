import bcrypt from 'bcryptjs';
import * as userRepo from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

const SALT_ROUNDS = 12;

export const getAllUsers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};

  if (query.roleId) {
    where.roleId = parseInt(query.roleId, 10);
  }

  if (query.approvalStatus && query.approvalStatus !== 'all') {
    where.approvalStatus = query.approvalStatus.toUpperCase();
  }

  if (query.search) {
    where.OR = [
      { name:  { contains: query.search } },
      { email: { contains: query.search } },
    ];
  }

  const [users, total] = await Promise.all([
    userRepo.findAllUsers(where, skip, limit),
    userRepo.countAllUsers(where),
  ]);

  return paginatedResponse(users, total, page, limit);
};

export const getUserById = async (id) => {
  const user = await userRepo.findUserById(id);
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  return user;
};

export const getRoles = () => userRepo.findAllRoles();

export const createUser = async (data) => {
  const existing = await userRepo.findUserByEmail(data.email.toLowerCase().trim());
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'A user with this email address already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  return userRepo.createUser({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash,
    roleId: data.roleId ? parseInt(data.roleId, 10) : null,
    approvalStatus: 'APPROVED',
    approvedAt: new Date(),
  });
};

export const approveUser = async (id, { roleId, roleName }, currentAdminId) => {
  if (id === currentAdminId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Administrators cannot self-approve their own account');
  }

  const user = await userRepo.findUserById(id);
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');

  let targetRoleId = roleId ? parseInt(roleId, 10) : null;
  if (!targetRoleId && roleName) {
    const roleMap = {
      'Fleet Manager': 'FLEET_MANAGER',
      'FLEET_MANAGER': 'FLEET_MANAGER',
      'Security Officer': 'SAFETY_OFFICER',
      'Safety Officer': 'SAFETY_OFFICER',
      'SAFETY_OFFICER': 'SAFETY_OFFICER',
      'Dispatcher': 'DISPATCHER',
      'DISPATCHER': 'DISPATCHER',
      'Financial Analyst': 'FINANCIAL_ANALYST',
      'FINANCIAL_ANALYST': 'FINANCIAL_ANALYST',
    };
    const enumName = roleMap[roleName] || roleName;
    const foundRole = await userRepo.findRoleByName(enumName);
    if (foundRole) targetRoleId = foundRole.id;
  }

  if (!targetRoleId && user.requestedRole) {
    const foundRole = await userRepo.findRoleByName(user.requestedRole);
    if (foundRole) targetRoleId = foundRole.id;
  }

  if (!targetRoleId) {
    const defaultRole = await userRepo.findRoleByName('DISPATCHER');
    targetRoleId = defaultRole ? defaultRole.id : 2;
  }

  const roleRecord = await userRepo.findRoleById(targetRoleId);
  if (!roleRecord) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid role specified for approval');
  }

  return userRepo.updateUser(id, {
    approvalStatus: 'APPROVED',
    roleId: targetRoleId,
    approvedAt: new Date(),
    rejectedAt: null,
    approvedById: currentAdminId,
    rejectionReason: null,
  });
};

export const rejectUser = async (id, { reason }, currentAdminId) => {
  if (id === currentAdminId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot reject your own administrator account');
  }

  const user = await userRepo.findUserById(id);
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');

  if (user.role?.name === 'FLEET_MANAGER' && user.approvalStatus === 'APPROVED') {
    const activeAdmins = await userRepo.countActiveAdmins();
    if (activeAdmins <= 1) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot reject or revoke the last active administrator');
    }
  }

  return userRepo.updateUser(id, {
    approvalStatus: 'REJECTED',
    roleId: null,
    rejectedAt: new Date(),
    approvedById: currentAdminId,
    rejectionReason: reason || 'Registration rejected by administrator',
  });
};

export const changeUserRole = async (id, { roleId }, currentAdminId) => {
  if (id === currentAdminId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot modify your own role');
  }

  const user = await userRepo.findUserById(id);
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');

  const targetRoleId = parseInt(roleId, 10);
  const roleRecord = await userRepo.findRoleById(targetRoleId);
  if (!roleRecord) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid role specified');
  }

  if (user.role?.name === 'FLEET_MANAGER' && roleRecord.name !== 'FLEET_MANAGER') {
    const activeAdmins = await userRepo.countActiveAdmins();
    if (activeAdmins <= 1) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot demote the last active administrator');
    }
  }

  return userRepo.updateUser(id, { roleId: targetRoleId });
};

export const updateUser = async (id, data, currentUserId) => {
  const user = await userRepo.findUserById(id);
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');

  if (data.email && data.email.toLowerCase().trim() !== user.email) {
    const existing = await userRepo.findUserByEmail(data.email.toLowerCase().trim());
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'A user with this email address already exists');
    }
  }

  // Prevent users from demoting their own admin role to lock themselves out
  if (id === currentUserId && data.roleId && parseInt(data.roleId, 10) !== user.roleId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot modify your own role');
  }

  const updateData = {};
  if (data.name)     updateData.name = data.name.trim();
  if (data.email)    updateData.email = data.email.toLowerCase().trim();
  if (data.roleId)   updateData.roleId = parseInt(data.roleId, 10);
  if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  return userRepo.updateUser(id, updateData);
};

export const deleteUser = async (id, currentUserId) => {
  if (id === currentUserId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot delete your own account');
  }

  const user = await userRepo.findUserById(id);
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');

  if (user.role?.name === 'FLEET_MANAGER' && user.approvalStatus === 'APPROVED') {
    const activeAdmins = await userRepo.countActiveAdmins();
    if (activeAdmins <= 1) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot delete the last active administrator');
    }
  }

  return userRepo.deleteUser(id);
};
