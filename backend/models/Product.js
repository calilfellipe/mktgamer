import pool from '../config/database.js';

export class Product {
  static async create(productData) {
    const { 
      title, description, price, category, game, images, 
      seller_id, condition, tags, featured = false 
    } = productData;
    
    const query = `
      INSERT INTO products (title, description, price, category, game, images, seller_id, featured, condition, tags, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title, description, price, category, game, 
      JSON.stringify(images), seller_id, featured, condition, JSON.stringify(tags)
    ]);
    
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, u.username as seller_username, u.avatar as seller_avatar, 
             u.reputation as seller_reputation, u.verified as seller_verified
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active'
    `;
    
    const params = [];
    let paramCount = 0;

    if (filters.category) {
      paramCount++;
      query += ` AND p.category = $${paramCount}`;
      params.push(filters.category);
    }

    if (filters.game) {
      paramCount++;
      query += ` AND p.game = $${paramCount}`;
      params.push(filters.game);
    }

    if (filters.featured) {
      query += ` AND p.featured = true`;
    }

    if (filters.minPrice) {
      paramCount++;
      query += ` AND p.price >= $${paramCount}`;
      params.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      paramCount++;
      query += ` AND p.price <= $${paramCount}`;
      params.push(filters.maxPrice);
    }

    query += ` ORDER BY p.created_at DESC`;

    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    const result = await pool.query(query, params);
    return result.rows.map(this.formatProduct);
  }

  static async findById(id) {
    const query = `
      SELECT p.*, u.username as seller_username, u.avatar as seller_avatar, 
             u.reputation as seller_reputation, u.verified as seller_verified
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = $1 AND p.status = 'active'
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.formatProduct(result.rows[0]) : null;
  }

  static async updateById(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE products SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  static async deleteById(id) {
    const query = `
      UPDATE products SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findBySeller(sellerId) {
    const query = `
      SELECT * FROM products 
      WHERE seller_id = $1 AND status = 'active'
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [sellerId]);
    return result.rows;
  }

  static formatProduct(row) {
    return {
      ...row,
      images: JSON.parse(row.images || '[]'),
      tags: JSON.parse(row.tags || '[]'),
      seller: {
        id: row.seller_id,
        username: row.seller_username,
        avatar: row.seller_avatar,
        reputation: row.seller_reputation,
        verified: row.seller_verified
      }
    };
  }
}