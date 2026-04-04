import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, category, min_price, max_price } = req.query;
    let query = `
      SELECT p.*, COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
    `;
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }
    if (min_price) {
      params.push(min_price);
      conditions.push(`p.price >= $${params.length}`);
    }
    if (max_price) {
      params.push(max_price);
      conditions.push(`p.price <= $${params.length}`);
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' GROUP BY p.id ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/top-selling', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(DISTINCT r.id) as review_count,
       COALESCE(SUM(oi.quantity), 0) as total_sold
       FROM products p
       LEFT JOIN reviews r ON p.id = r.product_id
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
       GROUP BY p.id ORDER BY total_sold DESC, avg_rating DESC LIMIT 6`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
    res.json(result.rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await pool.query(
      `SELECT p.*, COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as review_count
       FROM products p LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.id = $1 GROUP BY p.id`,
      [req.params.id]
    );
    if (!product.rows.length) return res.status(404).json({ error: 'Product not found' });

    const reviews = await pool.query(
      `SELECT r.*, u.name as user_name FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({ ...product.rows[0], reviews: reviews.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, description, price, stock, category, image_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, description, price, stock || 0, category, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;
    const result = await pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, stock=$4, category=$5, image_url=$6
       WHERE id=$7 RETURNING *`,
      [name, description, price, stock, category, image_url, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE product_id = $1', [req.params.id]);
    await pool.query('DELETE FROM order_items WHERE product_id = $1', [req.params.id]);
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
