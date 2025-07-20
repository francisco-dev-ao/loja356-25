# 🔧 Resolver Erro 400 - Edge Function Multicaixa Express

## ❌ Problema Identificado

A Edge Function `generate-emis-token` está retornando erro **400 (Bad Request)**, impedindo a geração do token EMIS.

## 🔍 Diagnóstico

### **Possíveis Causas:**

1. **Campos obrigatórios faltando** na requisição
2. **Tipo de dados incorreto** (ex: amount como string)
3. **Configuração não carregada** no serviço
4. **Edge Function não deployada** corretamente
5. **Problema de validação** na Edge Function

## ✅ Soluções Implementadas

### 1. **Edge Function Melhorada**

**Arquivo:** `supabase/functions/generate-emis-token/index.ts`

- ✅ Logs detalhados para debug
- ✅ Validação individual de campos
- ✅ Tratamento de erro melhorado
- ✅ Resposta padronizada

### 2. **Serviço com Logs**

**Arquivo:** `src/services/payment/multicaixa-express.ts`

- ✅ Logs dos dados enviados
- ✅ Logs da configuração atual
- ✅ Melhor tratamento de erro

### 3. **Scripts de Debug**

**Arquivos criados:**
- `test_edge_function.js` - Teste da Edge Function
- `debug_multicaixa_express.js` - Debug completo
- `test_emis_modal.html` - Página de teste

## 🚀 Como Resolver

### **Passo 1: Testar Edge Function**

Execute no console do navegador:

```javascript
// Copie e cole o conteúdo de test_edge_function.js
```

### **Passo 2: Debug Completo**

Execute no console do navegador:

```javascript
// Copie e cole o conteúdo de debug_multicaixa_express.js
```

### **Passo 3: Verificar Configuração**

```javascript
// Verificar se a configuração existe
checkConfig().then(config => {
  if (config) {
    console.log('✅ Configuração OK:', config);
  } else {
    console.log('❌ Configuração não encontrada');
  }
});
```

### **Passo 4: Testar Edge Function Diretamente**

```javascript
// Teste direto da Edge Function
testEdgeFunction().then(result => {
  if (result) {
    console.log('✅ Edge Function OK:', result);
  } else {
    console.log('❌ Edge Function falhou');
  }
});
```

## 🔧 Correções Manuais

### **Se a configuração não existir:**

```javascript
// Criar configuração manualmente
createConfig().then(config => {
  console.log('✅ Configuração criada:', config);
});
```

### **Se a Edge Function falhar:**

1. **Verificar se está deployada:**
   ```bash
   supabase functions deploy generate-emis-token
   ```

2. **Verificar logs no Supabase Dashboard:**
   - Acesse: https://supabase.com/dashboard
   - Vá em: Functions → generate-emis-token → Logs

### **Se houver erro de validação:**

Verifique se os dados enviados estão corretos:

```javascript
// Dados esperados
{
  reference: "string (obrigatório)",
  amount: "number > 0 (obrigatório)", 
  token: "string (obrigatório)",
  mobile: "PAYMENT",
  card: "DISABLED", 
  qrCode: "PAYMENT",
  callbackUrl: "string"
}
```

## 📊 Logs Esperados

### **Sucesso:**
```
🚀 Edge Function generate-emis-token iniciada
📋 Método: POST
📥 Body recebido: {...}
📋 Body parseado: {...}
🔍 Validando campos obrigatórios...
✅ Validação passou
🔄 Preparando dados para EMIS API: {...}
📡 Chamando API da EMIS...
📡 Resposta da EMIS API - Status: 200
✅ Token EMIS gerado com sucesso: {...}
📤 Enviando resposta de sucesso: {...}
```

### **Erro de Validação:**
```
❌ Campo reference está faltando
❌ Campo amount inválido: undefined
❌ Campo token está faltando
```

## 🎯 Teste Rápido

### **1. Via Página de Teste:**
```bash
# Abra no navegador
test_emis_modal.html
```

### **2. Via Console:**
```javascript
// Execute este comando no console
debugMulticaixaExpress()
```

### **3. Via Aplicação:**
```bash
npm run dev
# Acesse checkout → Multicaixa Express
```

## 🚨 Troubleshooting

### **Erro: "Missing required field"**
**Solução:** Verificar se a configuração está carregada

### **Erro: "Invalid amount"**
**Solução:** Verificar se o amount é um número positivo

### **Erro: "EMIS API Error"**
**Solução:** Verificar conectividade com a API da EMIS

### **Erro: "Edge Function not found"**
**Solução:** Deployar a Edge Function novamente

## 📋 Checklist de Verificação

- [ ] Edge Function deployada
- [ ] Configuração criada no banco
- [ ] Tabelas existem
- [ ] Dados sendo enviados corretamente
- [ ] Logs mostram sucesso
- [ ] Modal EMIS abre

## 🎉 Resultado Esperado

Após as correções:

```
✅ Edge Function funcionando!
✅ Token EMIS gerado: {id: "..."}
🚀 Modal EMIS aberto com sucesso!
```

---

**🔧 Execute os scripts de debug para identificar e resolver o problema específico!** 