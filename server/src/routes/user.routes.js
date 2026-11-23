import { Router } from 'express';
import {
  getUsers,
  getUserById,
  getRoles,
  createUser,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser,
  changeUserRole,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createUserSchema, updateUserSchema } from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

// List users & roles
router.get('/', getUsers);
router.get('/roles', getRoles);
router.get('/:id', getUserById);

// Admin Approval & Role Assignment (Restricted to FLEET_MANAGER)
router.post('/:id/approve', authorize('FLEET_MANAGER'), approveUser);
router.post('/:id/reject', authorize('FLEET_MANAGER'), rejectUser);
router.put('/:id/role', authorize('FLEET_MANAGER'), changeUserRole);

// Manage users (Restricted to FLEET_MANAGER)
router.post('/', authorize('FLEET_MANAGER'), validate(createUserSchema), createUser);
router.put('/:id', authorize('FLEET_MANAGER'), validate(updateUserSchema), updateUser);
router.delete('/:id', authorize('FLEET_MANAGER'), deleteUser);

export default router;
