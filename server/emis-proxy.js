const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Proxy para EMIS API
app.post('/api/emis-proxy', async (req, res) => {
  try {
    console.log('🔄 Proxy EMIS - Dados recebidos:', req.body);

    // Validar campos obrigatórios
    const { reference, amount, token } = req.body;
    if (!reference || !amount || !token) {
      return res.status(400).json({
        error: 'Missing required fields: reference, amount, token'
      });
    }

    // Fazer requisição para EMIS
    const response = await axios.post(
      'https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000, // 10 segundos timeout
      }
    );

    console.log('✅ EMIS Response Success:', response.data);
    res.status(200).json(response.data);

  } catch (error) {
    console.error('❌ Proxy Error:', error.response?.data || error.message);
    
    if (error.response) {
      // Erro da API da EMIS
      res.status(error.response.status).json({
        error: `EMIS API Error: ${error.response.status}`,
        details: error.response.data
      });
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      res.status(408).json({
        error: 'Request timeout',
        details: 'EMIS API took too long to respond'
      });
    } else {
      // Erro interno
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 EMIS Proxy Server running on port ${PORT}`);
  console.log(`📡 Proxy endpoint: http://localhost:${PORT}/api/emis-proxy`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 