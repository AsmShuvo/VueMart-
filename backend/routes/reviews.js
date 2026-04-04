import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/:productId', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const purchased = await pool.query(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status != 'cancelled'`,
      [req.user.id, productId]
    );
    if (!purchased.rows.length) {
      return res.status(403).json({ error: 'You can only review products you have purchased' });
    }

    const existing = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );
    if (existing.rows.length) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const result = await pool.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, productId, rating, comment]
    );

    const review = await pool.query(
      'SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = $1',
      [result.rows[0].id]
    );

    res.status(201).json(review.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
