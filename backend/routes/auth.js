const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se usuário já existe
    const existingUser = await pool.query(
      'SELECT id FROM auth.users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const result = await pool.query(
      'INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES ($1, $2, NOW(), NOW(), NOW()) RETURNING id',
      [email, hashedPassword]
    );

    const userId = result.rows[0].id;

    // Criar perfil
    await pool.query(
      'INSERT INTO public.profiles (id, name, role, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
      [userId, name, 'customer']
    );

    // Gerar token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: { id: userId, email, name, role: 'customer' },
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const result = await pool.query(
      `SELECT u.id, u.email, u.encrypted_password, p.name, p.role 
       FROM auth.users u 
       JOIN public.profiles p ON u.id = p.id 
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.encrypted_password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

// Atualizar perfil
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    
    await pool.query(
      'UPDATE public.profiles SET name = $1, updated_at = NOW() WHERE id = $2',
      [name, req.user.id]
    );

    res.json({ message: 'Perfil atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;