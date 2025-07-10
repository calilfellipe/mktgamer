import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getProfile, 
  updateProfile 
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateRequest, schemas } from '../middlewares/validation.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validateRequest(schemas.register), register);
router.post('/login', authLimiter, validateRequest(schemas.login), login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.patch('/profile', authenticateToken, updateProfile);

export default router;