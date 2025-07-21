const express = require('express');
const pool = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Listar pedidos do usuário
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, oi.product_id, oi.quantity, oi.price, p.name as product_name
       FROM public.orders o 
       LEFT JOIN public.order_items oi ON o.id = oi.order_id
       LEFT JOIN public.products p ON oi.product_id = p.id
       WHERE o.user_id = $1 
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    
    // Agrupar itens por pedido
    const ordersMap = {};
    result.rows.forEach(row => {
      if (!ordersMap[row.id]) {
        ordersMap[row.id] = {
          id: row.id,
          user_id: row.user_id,
          total: row.total,
          status: row.status,
          payment_method: row.payment_method,
          payment_reference: row.payment_reference,
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: []
        };
      }
      
      if (row.product_id) {
        ordersMap[row.id].items.push({
          product_id: row.product_id,
          product_name: row.product_name,
          quantity: row.quantity,
          price: row.price
        });
      }
    });
    
    const orders = Object.values(ordersMap);
    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todos os pedidos (admin only)
router.get('/admin/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, oi.product_id, oi.quantity, oi.price, p.name as product_name, pr.name as user_name
       FROM public.orders o 
       LEFT JOIN public.order_items oi ON o.id = oi.order_id
       LEFT JOIN public.products p ON oi.product_id = p.id
       LEFT JOIN public.profiles pr ON o.user_id = pr.id
       ORDER BY o.created_at DESC`
    );
    
    // Agrupar itens por pedido
    const ordersMap = {};
    result.rows.forEach(row => {
      if (!ordersMap[row.id]) {
        ordersMap[row.id] = {
          id: row.id,
          user_id: row.user_id,
          user_name: row.user_name,
          total: row.total,
          status: row.status,
          payment_method: row.payment_method,
          payment_reference: row.payment_reference,
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: []
        };
      }
      
      if (row.product_id) {
        ordersMap[row.id].items.push({
          product_id: row.product_id,
          product_name: row.product_name,
          quantity: row.quantity,
          price: row.price
        });
      }
    });
    
    const orders = Object.values(ordersMap);
    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar pedido
router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { items, total, payment_method, coupon_code } = req.body;
    
    // Criar pedido
    const orderResult = await client.query(
      `INSERT INTO public.orders 
       (user_id, total, status, payment_method, coupon_code, created_at, updated_at) 
       VALUES ($1, $2, 'pending', $3, $4, NOW(), NOW()) 
       RETURNING *`,
      [req.user.id, total, payment_method, coupon_code]
    );
    
    const order = orderResult.rows[0];
    
    // Criar itens do pedido
    for (const item of items) {
      await client.query(
        `INSERT INTO public.order_items 
         (order_id, product_id, quantity, price, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [order.id, item.product_id, item.quantity, item.price]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// Atualizar status do pedido
router.put('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE public.orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar referência de pagamento
router.put('/:id/payment-reference', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_reference } = req.body;
    
    const result = await pool.query(
      'UPDATE public.orders SET payment_reference = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [payment_reference, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar referência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;