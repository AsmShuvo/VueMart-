import pool from './pool.js';
import { initDB } from './init.js';
import bcrypt from 'bcryptjs';

async function seed() {
  await initDB();

  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  await pool.query(`
    INSERT INTO users (name, email, password, role) VALUES
    ('Admin User', 'admin@vuemart.com', $1, 'admin'),
    ('John Doe', 'john@example.com', $2, 'customer'),
    ('Jane Smith', 'jane@example.com', $2, 'customer')
    ON CONFLICT (email) DO NOTHING
  `, [adminPassword, customerPassword]);

  await pool.query(`
    INSERT INTO products (name, description, price, stock, category, image_url) VALUES
    ('Wireless Headphones', 'Premium noise-canceling wireless headphones with 30hr battery', 149.99, 50, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
    ('Running Shoes', 'Lightweight breathable running shoes for daily training', 89.99, 100, 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'),
    ('Laptop Stand', 'Ergonomic aluminum laptop stand with adjustable height', 49.99, 75, 'Accessories', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'),
    ('Cotton T-Shirt', 'Soft premium cotton t-shirt available in multiple colors', 24.99, 200, 'Clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'),
    ('Smart Watch', 'Fitness tracking smartwatch with heart rate monitor', 199.99, 30, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
    ('Backpack', 'Water-resistant backpack with laptop compartment', 59.99, 60, 'Accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'),
    ('Coffee Maker', 'Programmable drip coffee maker with thermal carafe', 79.99, 40, 'Home', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'),
    ('Desk Lamp', 'LED desk lamp with adjustable brightness and color temperature', 34.99, 90, 'Home', 'https://images.unsplash.com/photo-1507473885765-e6ed057ab793?w=500'),
    ('Yoga Mat', 'Non-slip exercise yoga mat with carrying strap', 29.99, 120, 'Fitness', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'),
    ('Sunglasses', 'Polarized UV protection sunglasses with premium frame', 69.99, 80, 'Accessories', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'),
    ('Bluetooth Speaker', 'Portable waterproof bluetooth speaker with deep bass', 39.99, 65, 'Electronics', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'),
    ('Leather Wallet', 'Genuine leather bifold wallet with RFID blocking', 44.99, 55, 'Accessories', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500')
    ON CONFLICT DO NOTHING
  `);

  await pool.query(`
    INSERT INTO coupons (code, discount_percent, expiry_date, is_active) VALUES
    ('WELCOME10', 10, '2026-12-31', true),
    ('SAVE20', 20, '2026-06-30', true),
    ('SUMMER15', 15, '2026-08-31', true)
    ON CONFLICT (code) DO NOTHING
  `);

  console.log('Database seeded successfully');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
