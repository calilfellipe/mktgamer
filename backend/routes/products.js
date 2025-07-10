import express from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
} from '../controllers/productController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateRequest, schemas } from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.post('/', authenticateToken, validateRequest(schemas.createProduct), createProduct);
router.patch('/:id', authenticateToken, validateRequest(schemas.updateProduct), updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);
router.get('/my/products', authenticateToken, getMyProducts);

export default router;