import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, me, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const loginLimiter = rateLimit({
  windowMs:        15 * 60 * 1000, // 15 minutes
  max:             20,              // 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders:   false,
  skip:            () => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again in 15 minutes.',
      errors:  [],
    });
  },
});

const router = Router();

router.post('/login',    loginLimiter, validate(loginSchema), login);
router.post('/register', loginLimiter, validate(registerSchema), register);
router.post('/signup',   loginLimiter, validate(registerSchema), register);
router.get('/me',        authenticate, me);
router.post('/logout',   authenticate, logout);

export default router;
