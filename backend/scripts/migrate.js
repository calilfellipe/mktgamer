import pool from '../config/database.js';

const migrations = [
  // Users table
  `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar TEXT,
      balance DECIMAL(10,2) DEFAULT 0,
      reputation DECIMAL(3,2) DEFAULT 0,
      verified BOOLEAN DEFAULT false,
      plan VARCHAR(20) DEFAULT 'free',
      total_sales INTEGER DEFAULT 0,
      join_date TIMESTAMP DEFAULT NOW(),
      banned BOOLEAN DEFAULT false,
      ban_reason TEXT,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Products table
  `
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(20) NOT NULL CHECK (category IN ('accounts', 'skins', 'giftcards', 'services')),
      game VARCHAR(50) NOT NULL,
      images JSONB NOT NULL,
      seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      featured BOOLEAN DEFAULT false,
      condition VARCHAR(20) NOT NULL CHECK (condition IN ('new', 'used', 'excellent')),
      tags JSONB,
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deleted')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Transactions table
  `
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(20) NOT NULL,
      stripe_payment_intent_id VARCHAR(255),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'delivered', 'completed', 'cancelled', 'failed')),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Plans table
  `
    CREATE TABLE IF NOT EXISTS plans (
      id VARCHAR(20) PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      features JSONB NOT NULL,
      badge VARCHAR(50),
      color VARCHAR(20),
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Subscriptions table
  `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id VARCHAR(20) NOT NULL REFERENCES plans(id),
      stripe_subscription_id VARCHAR(255),
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Withdrawals table
  `
    CREATE TABLE IF NOT EXISTS withdrawals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL CHECK (amount >= 10.00),
      method VARCHAR(20) NOT NULL CHECK (method IN ('pix', 'bank_transfer')),
      pix_key TEXT,
      bank_data JSONB,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Indexes for better performance
  `
    CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_game ON products(game);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
  `
];

async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...');
    
    for (const migration of migrations) {
      await pool.query(migration);
    }
    
    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();