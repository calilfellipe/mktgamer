import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  static async create(userData) {
    const { username, email, password, avatar } = userData;
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));
    
    const query = `
      INSERT INTO users (username, email, password, avatar, balance, reputation, verified, plan, total_sales, join_date)
      VALUES ($1, $2, $3, $4, 0, 0, false, 'free', 0, NOW())
      RETURNING id, username, email, avatar, balance, reputation, verified, plan, total_sales, join_date, created_at
    `;
    
    const result = await pool.query(query, [username, email, hashedPassword, avatar]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, username, email, avatar, balance, reputation, verified, plan, total_sales, join_date, created_at, updated_at
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateById(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE users SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, avatar, balance, reputation, verified, plan, total_sales, join_date, created_at, updated_at
    `;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePlan(userId, planId) {
    const query = `
      UPDATE users SET plan = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, avatar, balance, reputation, verified, plan, total_sales, join_date
    `;
    const result = await pool.query(query, [userId, planId]);
    return result.rows[0];
  }

  static async incrementSales(userId, amount = 1) {
    const query = `
      UPDATE users SET total_sales = total_sales + $2, updated_at = NOW()
      WHERE id = $1
      RETURNING total_sales
    `;
    const result = await pool.query(query, [userId, amount]);
    return result.rows[0];
  }
}