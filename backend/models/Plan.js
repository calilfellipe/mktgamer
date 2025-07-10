import pool from '../config/database.js';

export class Plan {
  static async findAll() {
    const query = `
      SELECT * FROM plans 
      WHERE active = true 
      ORDER BY price ASC
    `;
    
    const result = await pool.query(query);
    return result.rows.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features || '[]')
    }));
  }

  static async findById(id) {
    const query = 'SELECT * FROM plans WHERE id = $1 AND active = true';
    const result = await pool.query(query, [id]);
    
    if (result.rows[0]) {
      return {
        ...result.rows[0],
        features: JSON.parse(result.rows[0].features || '[]')
      };
    }
    
    return null;
  }

  static async createSubscription(subscriptionData) {
    const { user_id, plan_id, stripe_subscription_id, status } = subscriptionData;
    
    const query = `
      INSERT INTO subscriptions (user_id, plan_id, stripe_subscription_id, status, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        plan_id = $2, 
        stripe_subscription_id = $3, 
        status = $4, 
        updated_at = NOW()
      RETURNING *
    `;
    
    const result = await pool.query(query, [user_id, plan_id, stripe_subscription_id, status]);
    return result.rows[0];
  }

  static async findUserSubscription(userId) {
    const query = `
      SELECT s.*, p.name as plan_name, p.price as plan_price, p.features as plan_features
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = $1 AND s.status = 'active'
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows[0]) {
      return {
        ...result.rows[0],
        plan_features: JSON.parse(result.rows[0].plan_features || '[]')
      };
    }
    
    return null;
  }

  static async cancelSubscription(userId) {
    const query = `
      UPDATE subscriptions 
      SET status = 'cancelled', updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}