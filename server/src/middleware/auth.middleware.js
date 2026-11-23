import { verifyJWT } from '../utils/jwt.js';
import { findUserById } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    const token = header.slice(7);
    let payload;
    try {
      payload = verifyJWT(token);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Session expired, please log in again'
          : 'Invalid token';
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
    }

    // Confirm the user exists and is approved in the database
    const user = await findUserById(payload.userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User no longer exists');
    }

    if (user.approvalStatus !== 'APPROVED') {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account is not approved for system access');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role?.name ?? null,
    };
    next();
  } catch (err) {
    next(err);
  }
};
