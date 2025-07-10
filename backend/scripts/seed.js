import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Insert plans
    const plansQuery = `
      INSERT INTO plans (id, name, price, features, badge, color) VALUES
      ('free', 'Grátis', 0, '["5 anúncios ativos", "Taxa de 15%", "Suporte básico"]', 'Starter', 'gray'),
      ('gamer', 'Gamer', 29, '["+50% visibilidade", "Taxa de 10%", "Suporte prioritário", "Selo Premium"]', 'Popular', 'purple'),
      ('pro', 'Pro Player', 59, '["Anúncios em destaque", "Taxa de 5%", "Relatórios avançados", "Selo Pro"]', 'Recomendado', 'cyan'),
      ('elite', 'Elite', 99, '["Sempre no topo", "Taxa zero", "Selo Top Seller", "Cashback"]', 'Premium', 'green')
      ON CONFLICT (id) DO NOTHING;
    `;
    await pool.query(plansQuery);

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminQuery = `
      INSERT INTO users (username, email, password, verified, role, plan) VALUES
      ('admin', 'admin@gamemarket.com', $1, true, 'admin', 'elite')
      ON CONFLICT (email) DO NOTHING;
    `;
    await pool.query(adminQuery, [adminPassword]);

    // Create sample users
    const userPassword = await bcrypt.hash('password123', 12);
    const usersQuery = `
      INSERT INTO users (username, email, password, avatar, reputation, verified, plan, total_sales) VALUES
      ('GamerPro', 'gamer@example.com', $1, 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 4.8, true, 'pro', 127),
      ('SkinMaster', 'skins@example.com', $1, 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 4.5, true, 'gamer', 89),
      ('AccountDealer', 'accounts@example.com', $1, 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 4.9, true, 'elite', 234)
      ON CONFLICT (email) DO NOTHING;
    `;
    await pool.query(usersQuery, [userPassword]);

    // Get user IDs for products
    const usersResult = await pool.query('SELECT id, username FROM users WHERE role = \'user\'');
    const users = usersResult.rows;

    if (users.length > 0) {
      // Insert sample products
      const productsQuery = `
        INSERT INTO products (title, description, price, category, game, images, seller_id, featured, condition, tags) VALUES
        ('Conta Free Fire Diamante', 'Conta premium com 50.000 diamantes, várias skins raras e personagens desbloqueados.', 89.99, 'accounts', 'Free Fire', '["https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1"]', $1, true, 'excellent', '["diamantes", "skins", "premium"]'),
        ('Skin Valorant Vandal Dragon', 'Skin extremamente rara do Valorant, coleção limitada.', 45.00, 'skins', 'Valorant', '["https://images.pexels.com/photos/1174775/pexels-photo-1174775.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1"]', $2, true, 'new', '["rara", "limitada", "dragon"]'),
        ('Gift Card Steam R$50', 'Gift card original da Steam, válido em toda a plataforma.', 50.00, 'giftcards', 'Steam', '["https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1"]', $3, false, 'new', '["steam", "gift", "digital"]'),
        ('Boost Fortnite Arena', 'Serviço de boost para chegar à divisão Champion na Arena do Fortnite.', 120.00, 'services', 'Fortnite', '["https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1"]', $1, true, 'new', '["boost", "arena", "champion"]'),
        ('Conta Roblox Premium', 'Conta Roblox com Robux e itens exclusivos.', 75.50, 'accounts', 'Roblox', '["https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1"]', $2, false, 'excellent', '["robux", "premium", "exclusivos"]'),
        ('Skin CS:GO AK-47 Redline', 'Skin clássica e popular do CS:GO em ótimo estado.', 35.00, 'skins', 'CS:GO', '["https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1"]', $3, true, 'used', '["ak47", "redline", "classica"]')
      `;
      await pool.query(productsQuery, [users[0].id, users[1].id, users[2].id]);
    }

    console.log('✅ Database seeded successfully!');
    console.log('📧 Admin login: admin@gamemarket.com / admin123');
    console.log('📧 Test user: gamer@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();