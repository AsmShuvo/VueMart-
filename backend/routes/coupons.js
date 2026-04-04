import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/validate', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    const result = await pool.query(
      `SELECT * FROM coupons WHERE code = $1 AND is_active = true AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)`,
      [code]
    );
    if (!result.rows.length) {
      return res.status(400).json({ error: 'Invalid or expired coupon' });
    }
    res.json({ discount_percent: result.rows[0].discount_percent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coupons ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { code, discount_percent, expiry_date } = req.body;
    if (!code || !discount_percent) {
      return res.status(400).json({ error: 'Code and discount percent are required' });
    }
    const result = await pool.query(
      'INSERT INTO coupons (code, discount_percent, expiry_date) VALUES ($1, $2, $3) RETURNING *',
      [code.toUpperCase(), discount_percent, expiry_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Coupon code already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM coupons WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
