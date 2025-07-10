import express from 'express';
import {
  getPlans,
  subscribeToPlan,
  cancelSubscription,
  getMySubscription
} from '../controllers/planController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPlans);

// Protected routes
router.post('/subscribe', authenticateToken, subscribeToPlan);
router.post('/cancel', authenticateToken, cancelSubscription);
router.get('/my-subscription', authenticateToken, getMySubscription);

export default router;