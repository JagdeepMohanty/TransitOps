import { ApiError } from '../utils/ApiError.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { generateJWT } from '../utils/jwt.js';
import * as userRepo from '../repositories/user.repository.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';

export const login = async (email, password) => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const user = await userRepo.findUserByEmail(normalizedEmail);
  if (!user) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.INVALID_CREDENTIALS);

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.INVALID_CREDENTIALS);

  // Check account approval status
  if (user.approvalStatus === 'PENDING') {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'Your account is awaiting administrator approval.'
    );
  }

  if (user.approvalStatus === 'REJECTED') {
    const reasonText = user.rejectionReason ? ` Reason: ${user.rejectionReason}` : '';
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      `Your account registration was rejected by an administrator.${reasonText}`
    );
  }

  if (user.approvalStatus !== 'APPROVED') {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'Your account is not approved for system access.'
    );
  }

  const token = generateJWT({
    userId: user.id,
    email: user.email,
    role: user.role?.name ?? null,
  });

  const { passwordHash: _omit, ...safeUser } = user;
  return { token, user: safeUser };
};

export const register = async ({ name, email, password, requestedRole }) => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const existing = await userRepo.findUserByEmail(normalizedEmail);
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'A user with this email address already exists');
  }

  // Normalize requested role string into supported project role names
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

  const normalizedRole = roleMap[requestedRole] || 'DISPATCHER';
  const passwordHash = await hashPassword(password);

  // Security: New registrations ALWAYS receive PENDING status and NULL roleId
  // Client cannot self-assign an active role or self-approve.
  const newUser = await userRepo.createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    roleId: null,
    requestedRole: normalizedRole,
    approvalStatus: 'PENDING',
  });

  return {
    user: newUser,
    message: 'Your registration request has been submitted and is awaiting administrator approval.',
  };
};

export const getCurrentUser = async (userId) => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.USER_NOT_FOUND);
  if (user.approvalStatus !== 'APPROVED') {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account is not approved for system access.');
  }
  return user;
};
