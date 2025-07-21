const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco
    const result = await pool.query(
      'SELECT id, email, name, role FROM auth.users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

const adminOnly = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado - apenas administradores' });
  }
};

module.exports = { authMiddleware, adminOnly };