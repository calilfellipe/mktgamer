import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import pool from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get transaction stats
    const transactionStats = await Transaction.getStats();
    
    // Get user stats
    const userStatsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN plan != 'free' THEN 1 END) as premium_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
      FROM users
    `;
    const userStatsResult = await pool.query(userStatsQuery);
    const userStats = userStatsResult.rows[0];

    // Get product stats
    const productStatsQuery = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_products,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_products_30d
      FROM products
    `;
    const productStatsResult = await pool.query(productStatsQuery);
    const productStats = productStatsResult.rows[0];

    // Get revenue stats
    const revenueStatsQuery = `
      SELECT 
        SUM(amount * 0.15) as total_revenue,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN amount * 0.15 ELSE 0 END) as revenue_30d,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN amount * 0.15 ELSE 0 END) as revenue_7d
      FROM transactions
      WHERE status = 'completed'
    `;
    const revenueStatsResult = await pool.query(revenueStatsQuery);
    const revenueStats = revenueStatsResult.rows[0];

    res.json({
      stats: {
        transactions: transactionStats,
        users: userStats,
        products: productStats,
        revenue: revenueStats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, plan, verified } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, username, email, avatar, reputation, verified, plan, total_sales, join_date, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (username ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (plan) {
      paramCount++;
      query += ` AND plan = $${paramCount}`;
      params.push(plan);
    }

    if (verified !== undefined) {
      paramCount++;
      query += ` AND verified = $${paramCount}`;
      params.push(verified === 'true');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (username ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (plan) {
      countParamCount++;
      countQuery += ` AND plan = $${countParamCount}`;
      countParams.push(plan);
    }

    if (verified !== undefined) {
      countParamCount++;
      countQuery += ` AND verified = $${countParamCount}`;
      countParams.push(verified === 'true');
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalUsers = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const query = `
      UPDATE users 
      SET banned = true, ban_reason = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, banned, ban_reason
    `;

    const result = await pool.query(query, [id, reason]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User banned successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE users 
      SET banned = false, ban_reason = NULL, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, banned
    `;

    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User unbanned successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.updateById(id, { verified: true });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User verified successfully',
      user
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, user_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, 
             p.title as product_title,
             u1.username as buyer_username,
             u2.username as seller_username
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users u1 ON t.buyer_id = u1.id
      JOIN users u2 ON t.seller_id = u2.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    if (user_id) {
      paramCount++;
      query += ` AND (t.buyer_id = $${paramCount} OR t.seller_id = $${paramCount})`;
      params.push(user_id);
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};