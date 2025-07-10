import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import redisClient from '../config/redis.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = await User.create({ username, email, password, avatar });
    const token = generateToken(user.id);

    // Cache user session
    await redisClient.setEx(`user:${user.id}`, 3600, JSON.stringify(user));

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        reputation: user.reputation,
        verified: user.verified,
        plan: user.plan
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    // Cache user session
    const userSession = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      reputation: user.reputation,
      verified: user.verified,
      plan: user.plan
    };
    
    await redisClient.setEx(`user:${user.id}`, 3600, JSON.stringify(userSession));

    res.json({
      message: 'Login successful',
      user: userSession,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  try {
    // Remove user session from cache
    await redisClient.del(`user:${req.user.id}`);
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Try to get from cache first
    const cachedUser = await redisClient.get(`user:${req.user.id}`);
    
    if (cachedUser) {
      return res.json({ user: JSON.parse(cachedUser) });
    }

    // If not in cache, get from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      reputation: user.reputation,
      verified: user.verified,
      plan: user.plan,
      total_sales: user.total_sales,
      join_date: user.join_date
    };

    // Cache the user profile
    await redisClient.setEx(`user:${user.id}`, 3600, JSON.stringify(userProfile));

    res.json({ user: userProfile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['username', 'avatar'];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const updatedUser = await User.updateById(req.user.id, updates);
    
    // Update cache
    await redisClient.del(`user:${req.user.id}`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        reputation: updatedUser.reputation,
        verified: updatedUser.verified,
        plan: updatedUser.plan
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};