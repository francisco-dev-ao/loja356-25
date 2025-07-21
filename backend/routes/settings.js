const express = require('express');
const pool = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Buscar configurações
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.settings WHERE id = $1',
      ['company-settings']
    );
    
    if (result.rows.length === 0) {
      return res.json({}); // Retorna objeto vazio se não há configurações
    }
    
    res.json(result.rows[0].data);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar configurações (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const settingsData = req.body;
    
    const result = await pool.query(
      `INSERT INTO public.settings (id, data, created_at, updated_at) 
       VALUES ('company-settings', $1, NOW(), NOW()) 
       ON CONFLICT (id) 
       DO UPDATE SET data = $1, updated_at = NOW() 
       RETURNING *`,
      [JSON.stringify(settingsData)]
    );
    
    res.json(result.rows[0].data);
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar configurações Multicaixa Express
router.get('/multicaixa-express', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.multicaixa_express_config ORDER BY created_at DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return res.json({ is_active: false });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar config Multicaixa Express:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar configurações Multicaixa Express (admin only)
router.post('/multicaixa-express', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { frame_token, pos_id, return_url, is_active } = req.body;
    
    const result = await pool.query(
      `INSERT INTO public.multicaixa_express_config 
       (frame_token, pos_id, return_url, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING *`,
      [frame_token, pos_id, return_url, is_active]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar config Multicaixa Express:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;