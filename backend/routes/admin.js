import express from 'express';
import {
  getDashboardStats,
  getUsers,
  banUser,
  unbanUser,
  verifyUser,
  getTransactions
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);
router.patch('/users/:id/verify', verifyUser);
router.get('/transactions', getTransactions);

export default router;