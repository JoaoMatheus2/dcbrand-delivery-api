const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// POST /api/admin/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validação simples (depois você integra com DB)
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha obrigatórios' });
    }
    
    // Credencial hardcoded temporária
    const ADMIN_EMAIL = 'admin@dcbrand.com';
    const ADMIN_PASSWORD = '123456';
    
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Gerar JWT
    const token = jwt.sign(
      { email, id: '6678c00c00000000000000001' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: { email }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;