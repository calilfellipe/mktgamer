import express from 'express';
import {
  createTransaction,
  getTransaction,
  updateTransactionStatus,
  getMyTransactions,
  handleStripeWebhook
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateRequest, schemas } from '../middlewares/validation.js';

const router = express.Router();

// Webhook route (no auth required)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Protected routes
router.post('/', authenticateToken, validateRequest(schemas.createTransaction), createTransaction);
router.get('/my', authenticateToken, getMyTransactions);
router.get('/:id', authenticateToken, getTransaction);
router.patch('/:id/status', authenticateToken, updateTransactionStatus);

export default router;