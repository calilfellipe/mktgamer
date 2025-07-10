import { Product } from '../models/Product.js';
import redisClient from '../config/redis.js';

export const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      seller_id: req.user.id
    };

    const product = await Product.create(productData);
    
    // Clear products cache
    await redisClient.del('products:featured');
    await redisClient.del('products:all');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      game: req.query.game,
      featured: req.query.featured === 'true',
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    // Create cache key based on filters
    const cacheKey = `products:${JSON.stringify(filters)}`;
    
    // Try to get from cache first
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      return res.json({ products: JSON.parse(cachedProducts) });
    }

    const products = await Product.findAll(filters);
    
    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(products));

    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try cache first
    const cacheKey = `product:${id}`;
    const cachedProduct = await redisClient.get(cacheKey);
    
    if (cachedProduct) {
      return res.json({ product: JSON.parse(cachedProduct) });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Cache for 10 minutes
    await redisClient.setEx(cacheKey, 600, JSON.stringify(product));

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product belongs to user
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updatedProduct = await Product.updateById(id, req.body);
    
    // Clear cache
    await redisClient.del(`product:${id}`);
    await redisClient.del('products:featured');
    await redisClient.del('products:all');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product belongs to user
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await Product.deleteById(id);
    
    // Clear cache
    await redisClient.del(`product:${id}`);
    await redisClient.del('products:featured');
    await redisClient.del('products:all');

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.findBySeller(req.user.id);
    res.json({ products });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};