const express = require('express');
const pool = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Listar produtos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.products WHERE active = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM public.products WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar produto (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, price, base_price, image, category, stock } = req.body;
    
    const result = await pool.query(
      `INSERT INTO public.products 
       (name, description, price, base_price, image, category, stock, active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW()) 
       RETURNING *`,
      [name, description, price, base_price, image, category, stock]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar produto (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, base_price, image, category, stock, active } = req.body;
    
    const result = await pool.query(
      `UPDATE public.products 
       SET name = $1, description = $2, price = $3, base_price = $4, 
           image = $5, category = $6, stock = $7, active = $8, updated_at = NOW()
       WHERE id = $9 
       RETURNING *`,
      [name, description, price, base_price, image, category, stock, active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar produto (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM public.products WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;