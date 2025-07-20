# Integração Multicaixa Express

Este documento descreve a integração completa do módulo de pagamento Multicaixa Express no projeto React/TypeScript com Supabase.

## 📋 Visão Geral

A integração do Multicaixa Express permite processar pagamentos online através do gateway EMIS (Empresa Interbancária de Serviços) de Angola, oferecendo suporte a:

- Pagamentos com cartão (Visa, Mastercard)
- Pagamentos móveis (Multicaixa Express)
- Pagamentos via QR Code
- Callbacks automáticos de confirmação

## 🏗️ Arquitetura

### Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Pagamentos**: Multicaixa Express (EMIS)
- **Estado**: React Hooks + Context API

### Estrutura de Arquivos

```
src/
├── components/
│   ├── checkout/
│   │   ├── MulticaixaExpressPayment.tsx    # Componente de pagamento
│   │   └── PaymentMethods.tsx              # Seleção de métodos
│   └── admin/
│       └── settings/
│           └── MulticaixaExpressSettingsTab.tsx  # Configurações admin
├── services/
│   └── payment/
│       └── multicaixa-express.ts           # Serviço de pagamento
├── hooks/
│   └── admin/
│       └── use-multicaixa-express-config.ts # Hook de configuração
└── pages/
    └── Checkout.tsx                        # Página de checkout

supabase/
├── migrations/
│   └── 20250520000000_create_multicaixa_express_tables.sql
└── functions/
    └── multicaixa-express-callback/
        └── index.ts                        # Edge Function para callbacks
```

## 🗄️ Banco de Dados

### Tabelas Criadas

#### `multicaixa_express_config`
Configuração do gateway de pagamento.

```sql
CREATE TABLE multicaixa_express_config (
    id SERIAL PRIMARY KEY,
    frame_token TEXT NOT NULL,
    callback_url TEXT NOT NULL,
    success_url TEXT NOT NULL,
    error_url TEXT NOT NULL,
    css_url TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `multicaixa_express_payments`
Registro de pagamentos processados.

```sql
CREATE TABLE multicaixa_express_payments (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    reference TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT DEFAULT 'multicaixa_express',
    emis_token TEXT,
    emis_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

#### `multicaixa_express_callbacks`
Log de callbacks recebidos.

```sql
CREATE TABLE multicaixa_express_callbacks (
    id SERIAL PRIMARY KEY,
    raw_data TEXT NOT NULL,
    payment_reference TEXT,
    amount DECIMAL(10,2),
    status TEXT,
    ip_address INET,
    processed_successfully BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Instalação

### 1. Executar Migrações

```bash
cd loja356-25
supabase db push
```

### 2. Deploy das Edge Functions

```bash
supabase functions deploy multicaixa-express-callback
```

### 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env`:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Multicaixa Express (opcional - pode ser configurado via admin)
VITE_MULTICAIXA_FRAME_TOKEN=seu_frame_token
VITE_MULTICAIXA_CALLBACK_URL=https://seu-dominio.com/api/multicaixa-callback
```

## ⚙️ Configuração

### 1. Acesso ao Painel Administrativo

1. Acesse `/admin/dashboard`
2. Navegue para "Configurações"
3. Selecione a aba "Multicaixa Express"

### 2. Configuração Básica

#### Frame Token
- Obtenha junto ao EMIS (Empresa Interbancária de Serviços)
- É o token de autenticação para a API

#### URLs de Callback
- **Callback URL**: URL onde o Multicaixa Express enviará notificações
- **Success URL**: URL de redirecionamento em caso de sucesso
- **Error URL**: URL de redirecionamento em caso de erro

#### Taxa de Comissão
- Percentual de comissão sobre os pagamentos (opcional)

### 3. URLs Recomendadas

```javascript
// Para desenvolvimento local
Callback: http://localhost:5173/api/multicaixa-callback
Success: http://localhost:5173/checkout/success
Error: http://localhost:5173/checkout/error

// Para produção
Callback: https://seu-dominio.com/api/multicaixa-callback
Success: https://seu-dominio.com/checkout/success
Error: https://seu-dominio.com/checkout/error
```

## 💳 Uso no Frontend

### 1. Seleção do Método de Pagamento

O componente `PaymentMethods` já inclui a opção Multicaixa Express:

```tsx
<PaymentMethods 
  paymentMethod={paymentMethod} 
  onSelectPaymentMethod={handleSelectPaymentMethod} 
/>
```

### 2. Processamento do Pagamento

O componente `MulticaixaExpressPayment` gerencia todo o fluxo:

```tsx
<MulticaixaExpressPayment
  amount={finalTotal}
  description={`Pedido ${orderId}`}
  orderId={orderId}
  onSuccess={(response) => {
    // Redirecionar para sucesso
    navigate('/checkout/success');
  }}
  onError={(error) => {
    toast.error(`Erro no pagamento: ${error}`);
  }}
/>
```

### 3. Fluxo de Pagamento

1. **Seleção**: Usuário escolhe Multicaixa Express
2. **Geração**: Sistema gera token EMIS
3. **Redirecionamento**: Usuário é redirecionado para o gateway
4. **Pagamento**: Usuário completa o pagamento
5. **Callback**: Gateway notifica o sistema
6. **Confirmação**: Sistema atualiza status e envia email

## 🔧 API e Serviços

### MulticaixaExpressService

Classe principal para gerenciar pagamentos:

```typescript
import { multicaixaExpressService } from '@/services/payment/multicaixa-express';

// Gerar token de pagamento
const response = await multicaixaExpressService.generateEmisToken(
  orderId,
  amount,
  description
);

// Buscar pagamento por referência
const payment = await multicaixaExpressService.getPaymentByReference(reference);

// Atualizar status
await multicaixaExpressService.updatePaymentStatus(paymentId, 'completed');
```

### Edge Function

A função `multicaixa-express-callback` processa callbacks:

- Recebe notificações do Multicaixa Express
- Atualiza status dos pagamentos
- Envia emails de confirmação
- Registra logs para auditoria

## 📊 Monitoramento

### Estatísticas no Painel Admin

O painel administrativo exibe:

- Total de pagamentos
- Pagamentos pendentes
- Pagamentos concluídos
- Pagamentos falhados
- Valor total processado

### Logs de Callback

Todos os callbacks são registrados na tabela `multicaixa_express_callbacks` com:

- Dados brutos recebidos
- IP de origem
- Status de processamento
- Timestamp

## 🔒 Segurança

### Row Level Security (RLS)

As tabelas implementam RLS:

- **Configuração**: Apenas admins podem gerenciar
- **Pagamentos**: Usuários veem apenas seus próprios
- **Callbacks**: Apenas sistema pode inserir

### Validação de Callbacks

- Verificação de IP (opcional)
- Validação de assinatura (se disponível)
- Logs completos para auditoria

## 🧪 Testes

### Teste de Conexão

Use o botão "Testar Conexão" no painel admin para verificar:

- Validade do Frame Token
- Acessibilidade das URLs
- Resposta da API EMIS

### Teste de Callback

Para testar callbacks localmente:

```bash
# Simular callback de sucesso
curl -X POST http://localhost:54321/functions/v1/multicaixa-express-callback \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "TEST-123",
    "amount": 100,
    "status": "ACCEPTED"
  }'
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. "Configuração não encontrada"
- Verifique se a configuração foi salva no painel admin
- Confirme se `is_active = true`

#### 2. "Erro ao gerar token"
- Verifique se o Frame Token está correto
- Confirme se as URLs de callback são acessíveis

#### 3. "Callback não recebido"
- Verifique se a URL de callback está correta
- Confirme se o servidor pode receber requisições POST
- Verifique logs da Edge Function

#### 4. "Pagamento não atualizado"
- Verifique se a referência está correta
- Confirme se o callback foi processado
- Verifique logs de erro

### Logs Úteis

```bash
# Logs da Edge Function
supabase functions logs multicaixa-express-callback

# Logs do banco de dados
supabase db logs

# Logs do frontend (console do navegador)
# Verifique Network tab para requisições
```

## 📞 Suporte

### EMIS (Empresa Interbancária de Serviços)
- **Website**: https://emis.co.ao
- **Email**: suporte@emis.co.ao
- **Telefone**: +244 222 000 000

### Documentação da API
- **Portal**: https://pagamentonline.emis.co.ao
- **Documentação**: Disponível no portal EMIS

## 🔄 Atualizações

### Versão 1.0.0
- ✅ Integração básica do Multicaixa Express
- ✅ Componentes React/TypeScript
- ✅ Painel administrativo
- ✅ Edge Functions para callbacks
- ✅ Sistema de logs e auditoria
- ✅ Emails de confirmação automáticos

### Próximas Versões
- 🔄 Suporte a múltiplas moedas
- 🔄 Relatórios avançados
- 🔄 Integração com outros gateways
- 🔄 Sistema de reembolso
- 🔄 Notificações push

---

**Nota**: Esta integração foi desenvolvida especificamente para o mercado angolano e utiliza o gateway oficial do Multicaixa Express através do EMIS. 