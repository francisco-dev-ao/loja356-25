# Office365 Backend API

Backend Node.js/Express para o sistema Office365 Store.

## Instalação

```bash
cd backend
npm install
```

## Configuração

1. Configure as variáveis de ambiente no arquivo `.env`:

```
DB_HOST=38.242.226.105
DB_PORT=5432
DB_USER=office365bd
DB_PASS=Bayathu60@@
DB_NAME=office365bd

JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

PORT=3001
```

2. Execute as migrações SQL no seu banco PostgreSQL para criar as tabelas necessárias.

## Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário atual
- `PUT /api/auth/profile` - Atualizar perfil

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto por ID
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/:id` - Atualizar produto (admin)
- `DELETE /api/products/:id` - Deletar produto (admin)

### Pedidos
- `GET /api/orders` - Listar pedidos do usuário
- `GET /api/orders/admin/all` - Listar todos os pedidos (admin)
- `POST /api/orders` - Criar pedido
- `PUT /api/orders/:id/status` - Atualizar status (admin)
- `PUT /api/orders/:id/payment-reference` - Atualizar referência de pagamento

### Carrinho
- `GET /api/cart` - Buscar carrinho do usuário
- `POST /api/cart` - Salvar carrinho
- `DELETE /api/cart` - Limpar carrinho

### Configurações
- `GET /api/settings` - Buscar configurações
- `POST /api/settings` - Salvar configurações (admin)
- `GET /api/settings/multicaixa-express` - Config Multicaixa Express
- `POST /api/settings/multicaixa-express` - Salvar config Multicaixa Express (admin)

### Email
- `POST /api/email/send-order-confirmation` - Enviar confirmação de pedido
- `POST /api/email/test-smtp` - Testar configuração SMTP

## Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer <jwt_token>
```

## Status de Resposta

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor