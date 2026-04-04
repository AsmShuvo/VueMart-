import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, adminOnly, async (req, res) => {
  try {
    const totalSales = await pool.query(
      `SELECT COALESCE(SUM(total), 0) as total_sales, COUNT(*) as total_orders FROM orders WHERE status != 'cancelled'`
    );

    const ordersPerDay = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count, SUM(total) as revenue
       FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at) ORDER BY date`
    );

    const topProducts = await pool.query(
      `SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as revenue
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id WHERE o.status != 'cancelled'
       GROUP BY p.id, p.name ORDER BY total_sold DESC LIMIT 5`
    );

    const revenueByCategory = await pool.query(
      `SELECT p.category, SUM(oi.quantity * oi.price) as revenue
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id WHERE o.status != 'cancelled'
       GROUP BY p.category ORDER BY revenue DESC`
    );

    const totalCustomers = await pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`);
    const totalProducts = await pool.query(`SELECT COUNT(*) as count FROM products`);

    res.json({
      total_sales: totalSales.rows[0].total_sales,
      total_orders: totalSales.rows[0].total_orders,
      total_customers: totalCustomers.rows[0].count,
      total_products: totalProducts.rows[0].count,
      orders_per_day: ordersPerDay.rows,
      top_products: topProducts.rows,
      revenue_by_category: revenueByCategory.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
