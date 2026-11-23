import prisma from '../config/prisma.js';

const safeSelect = {
  id: true,
  name: true,
  email: true,
  roleId: true,
  role: { select: { id: true, name: true } },
  approvalStatus: true,
  requestedRole: true,
  approvedAt: true,
  rejectedAt: true,
  approvedById: true,
  approvedBy: { select: { id: true, name: true, email: true } },
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
};

// Returns full record including passwordHash — for auth only
export const findUserByEmail = (email) =>
  prisma.user.findUnique({
    where: { email },
    include: { role: { select: { id: true, name: true } } },
  });

// Returns safe shape — no passwordHash
export const findUserById = (id) =>
  prisma.user.findUnique({ where: { id }, select: safeSelect });

// Lightweight existence check used by auth middleware
export const userExists = (id) =>
  prisma.user.findUnique({ where: { id }, select: { id: true } });

export const findAllUsers = (where = {}, skip, limit) =>
  prisma.user.findMany({
    where,
    skip,
    take: limit,
    select: safeSelect,
    orderBy: { createdAt: 'desc' },
  });

export const countAllUsers = (where = {}) => prisma.user.count({ where });

export const countActiveAdmins = () =>
  prisma.user.count({
    where: {
      role: { name: 'FLEET_MANAGER' },
      approvalStatus: 'APPROVED',
    },
  });

export const createUser = (data) =>
  prisma.user.create({
    data,
    select: safeSelect,
  });

export const updateUser = (id, data) =>
  prisma.user.update({
    where: { id },
    data,
    select: safeSelect,
  });

export const deleteUser = (id) =>
  prisma.user.delete({
    where: { id },
    select: { id: true },
  });

export const findAllRoles = () =>
  prisma.role.findMany({ orderBy: { id: 'asc' } });

export const findRoleByName = (name) =>
  prisma.role.findUnique({ where: { name } });

export const findRoleById = (id) =>
  prisma.role.findUnique({ where: { id } });
