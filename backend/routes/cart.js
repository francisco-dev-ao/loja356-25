const express = require('express');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Buscar carrinho do usuário
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.user_carts WHERE user_id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.json({ items: [], total: 0 });
    }
    
    res.json(result.rows[0].cart_data);
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar carrinho do usuário
router.post('/', authMiddleware, async (req, res) => {
  try {
    const cartData = req.body;
    
    const result = await pool.query(
      `INSERT INTO public.user_carts (user_id, cart_data, updated_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (user_id) 
       DO UPDATE SET cart_data = $2, updated_at = NOW() 
       RETURNING *`,
      [req.user.id, JSON.stringify(cartData)]
    );
    
    res.json(result.rows[0].cart_data);
  } catch (error) {
    console.error('Erro ao salvar carrinho:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Limpar carrinho do usuário
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM public.user_carts WHERE user_id = $1',
      [req.user.id]
    );
    
    res.json({ message: 'Carrinho limpo com sucesso' });
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;