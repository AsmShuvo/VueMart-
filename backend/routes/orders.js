import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { items, coupon_code } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let discount_percent = 0;
    if (coupon_code) {
      const coupon = await client.query(
        `SELECT * FROM coupons WHERE code = $1 AND is_active = true AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)`,
        [coupon_code]
      );
      if (!coupon.rows.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid or expired coupon' });
      }
      discount_percent = coupon.rows[0].discount_percent;
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await client.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      if (!product.rows.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product ${item.product_id} not found` });
      }
      const p = product.rows[0];
      if (p.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Insufficient stock for ${p.name}` });
      }

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
      subtotal += p.price * item.quantity;
      orderItems.push({ product_id: item.product_id, quantity: item.quantity, price: p.price });
    }

    const total = subtotal * (1 - discount_percent / 100);

    const order = await client.query(
      'INSERT INTO orders (user_id, total, coupon_code, discount_percent) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, total.toFixed(2), coupon_code || null, discount_percent]
    );

    for (const item of orderItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.rows[0].id, item.product_id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');

    const fullOrder = await pool.query(
      `SELECT o.*, json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'product_name', p.name, 'image_url', p.image_url)) as items
       FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id
       WHERE o.id = $1 GROUP BY o.id`,
      [order.rows[0].id]
    );

    res.status(201).json(fullOrder.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, COALESCE(json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'product_name', p.name, 'image_url', p.image_url)) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', authenticate, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email,
       COALESCE(json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'product_name', p.name)) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN products p ON oi.product_id = p.id
       GROUP BY o.id, u.name, u.email ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', authenticate, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
