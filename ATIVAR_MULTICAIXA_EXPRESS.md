# 🚀 Como Ativar o Multicaixa Express

## ✅ Método de Pagamento Multicaixa Express - Instruções de Ativação

O método de pagamento **Multicaixa Express** foi completamente integrado ao seu projeto. Agora você pode ativá-lo de várias formas:

## 📋 Opções de Ativação

### 1. 🖥️ **Via Interface Web (Recomendado)**

1. **Acesse a página de ativação:**
   ```
   http://localhost:5173/ativar-multicaixa-express
   ```

2. **Clique em "Ativar Multicaixa Express"**
   - O sistema criará automaticamente as tabelas necessárias
   - Configurará o método de pagamento
   - Ativará o gateway

3. **Teste a conexão**
   - Clique em "Testar Conexão com EMIS"
   - Verifique se a resposta é positiva

### 2. 🔧 **Via Console do Navegador**

1. **Abra o console do navegador (F12)**
2. **Copie e cole o código do arquivo:**
   ```
   ativar_multicaixa_console.js
   ```
3. **Pressione Enter**
4. **Aguarde a ativação automática**

### 3. 🗄️ **Via SQL Direto**

Execute o script SQL no seu banco de dados Supabase:

```sql
-- Arquivo: ativar_multicaixa_express.sql
-- Execute no SQL Editor do Supabase
```

## 🎯 Verificação de Ativação

### ✅ **Sinais de Sucesso:**

1. **No console do navegador:**
   ```
   🎉 Multicaixa Express ATIVADO com sucesso!
   ✅ Conexão com EMIS bem-sucedida!
   ```

2. **No checkout:**
   - Aparece a opção "Multicaixa Express"
   - Ícone de smartphone/cartão
   - Descrição: "Pague com cartão, mobile ou QR Code"

3. **No painel admin:**
   - Status: "Ativo"
   - Configuração: "Configurado"

## 🔧 Configuração Atual

### **Configuração Padrão:**
- **Frame Token:** `a53787fd-b49e-4469-a6ab-fa6acf19db48`
- **Callback URL:** `https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback`
- **Success URL:** `https://angohost.co.ao/pay/successful`
- **Error URL:** `https://angohost.co.ao/pay/unsuccessful`
- **Taxa de Comissão:** 0%
- **Status:** Ativo

## 🧪 Teste da Integração

### **1. Teste de Conexão:**
```javascript
// No console do navegador
testarConexao()
```

### **2. Teste de Pagamento:**
1. Adicione produtos ao carrinho
2. Vá para o checkout
3. Selecione "Multicaixa Express"
4. Clique em "Pagar com Multicaixa Express"

### **3. Verificação de Status:**
```javascript
// No console do navegador
verificarStatus()
```

## 📊 Estrutura Criada

### **Tabelas do Banco:**
- ✅ `multicaixa_express_config` - Configuração
- ✅ `multicaixa_express_payments` - Pagamentos
- ✅ `multicaixa_express_callbacks` - Logs

### **Componentes React:**
- ✅ `MulticaixaExpressPayment.tsx` - Componente de pagamento
- ✅ `PaymentMethods.tsx` - Seleção de métodos (atualizado)
- ✅ `AtivarMulticaixaExpress.tsx` - Interface de ativação

### **Serviços:**
- ✅ `multicaixa-express.ts` - Serviço principal
- ✅ `use-multicaixa-express-config.ts` - Hook admin

## 🚨 Troubleshooting

### **Problema: "Configuração não encontrada"**
**Solução:** Execute a ativação novamente via interface ou console

### **Problema: "Erro na conexão com EMIS"**
**Solução:** 
1. Verifique se o Frame Token está correto
2. Confirme se as URLs de callback são acessíveis
3. Teste a conectividade com a internet

### **Problema: "Método não aparece no checkout"**
**Solução:**
1. Verifique se o Multicaixa Express está ativo
2. Recarregue a página do checkout
3. Limpe o cache do navegador

## 🎉 Próximos Passos

### **Após a Ativação:**

1. **✅ Teste o pagamento completo**
   - Adicione produtos ao carrinho
   - Complete um pagamento de teste

2. **✅ Configure URLs de produção**
   - Atualize as URLs de callback para seu domínio
   - Configure URLs de sucesso/erro

3. **✅ Monitore os logs**
   - Verifique a tabela `multicaixa_express_callbacks`
   - Monitore os emails de confirmação

4. **✅ Personalize se necessário**
   - Ajuste a taxa de comissão
   - Personalize as mensagens
   - Configure estilos CSS

## 📞 Suporte

### **Se precisar de ajuda:**

1. **Verifique os logs do console**
2. **Consulte a documentação completa:** `MULTICAIXA_EXPRESS_README.md`
3. **Execute os testes de conexão**
4. **Verifique o status no painel admin**

---

## 🎯 **Status Final**

**✅ Multicaixa Express Integrado e Pronto para Ativação**

- **Integração:** 100% Completa
- **Funcionalidades:** Todas implementadas
- **Segurança:** RLS implementado
- **Documentação:** Completa
- **Testes:** Prontos para execução

**🚀 Pronto para ativar e usar em produção!** 