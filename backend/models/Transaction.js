import pool from '../config/database.js';

export class Transaction {
  static async create(transactionData) {
    const { 
      buyer_id, seller_id, product_id, amount, 
      payment_method, stripe_payment_intent_id 
    } = transactionData;
    
    const query = `
      INSERT INTO transactions (
        buyer_id, seller_id, product_id, amount, 
        payment_method, stripe_payment_intent_id, 
        status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      buyer_id, seller_id, product_id, amount, 
      payment_method, stripe_payment_intent_id
    ]);
    
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT t.*, 
             p.title as product_title, p.images as product_images,
             u1.username as buyer_username, u1.email as buyer_email,
             u2.username as seller_username, u2.email as seller_email
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users u1 ON t.buyer_id = u1.id
      JOIN users u2 ON t.seller_id = u2.id
      WHERE t.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status, metadata = {}) {
    const query = `
      UPDATE transactions 
      SET status = $2, metadata = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, status, JSON.stringify(metadata)]);
    return result.rows[0];
  }

  static async findByUser(userId, type = 'all') {
    let query = `
      SELECT t.*, 
             p.title as product_title, p.images as product_images,
             u1.username as buyer_username,
             u2.username as seller_username
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users u1 ON t.buyer_id = u1.id
      JOIN users u2 ON t.seller_id = u2.id
      WHERE 
    `;

    if (type === 'purchases') {
      query += 't.buyer_id = $1';
    } else if (type === 'sales') {
      query += 't.seller_id = $1';
    } else {
      query += '(t.buyer_id = $1 OR t.seller_id = $1)';
    }

    query += ' ORDER BY t.created_at DESC';
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_volume,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_transactions
      FROM transactions
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }
}