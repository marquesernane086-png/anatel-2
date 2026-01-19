# Guia de Atualização - Servidor Linux

Este guia explica como aplicar as alterações feitas no servidor Windows para o servidor Linux.

## 📋 Alterações Aplicadas

### Principais melhorias:
1. **Suporte completo PagLoop** - Configuração correta do gateway PagLoop
2. **Carregamento automático do .env** - Variáveis de ambiente carregadas automaticamente
3. **Formato correto da requisição PagLoop** - Conforme implementação original
4. **Normalização da resposta PagLoop** - QR code extraído corretamente
5. **Scripts de gerenciamento** - Trocar e verificar gateway

## 🚀 Como Aplicar as Mudanças

### Opção 1: Script Automático (Recomendado)

1. **Copie os arquivos atualizados para o servidor Linux:**
   ```bash
   # No servidor Linux
   scp usuario@seu-servidor:/caminho/server_mei_furiapay.cjs .
   scp usuario@seu-servidor:/caminho/trocar_gateway.sh .
   scp usuario@seu-servidor:/caminho/verificar_gateway.sh .
   scp usuario@seu-servidor:/caminho/atualizar_servidor_linux.sh .
   scp usuario@seu-servidor:/caminho/env_template_completo.txt .
   ```

2. **Execute o script de atualização:**
   ```bash
   chmod +x atualizar_servidor_linux.sh
   ./atualizar_servidor_linux.sh
   ```

O script irá:
- ✅ Verificar/criar arquivo `.env` com credenciais PagLoop
- ✅ Tornar scripts executáveis
- ✅ Verificar configurações

### Opção 2: Manual

1. **Atualizar `server_mei_furiapay.cjs`:**
   ```bash
   # Substitua o arquivo server_mei_furiapay.cjs pelo atualizado
   ```

2. **Configurar arquivo `.env`:**
   ```bash
   # Se não existir, copie do template
   cp env_template_completo.txt .env
   
   # Adicione as credenciais PagLoop (se não estiverem)
   cat >> .env << 'EOF'
   
   # Configuração PagLoop
   PAGLOOP_BASE_URL=https://api.pagloop.tech
   PAGLOOP_CLIENT_ID=alessandroduarte_4B462F8C
   PAGLOOP_CLIENT_SECRET=d87e326077fbb73ee50504fd45bdc85724034e519feda58b800d96ffb1366889944c3121389e2481dd236c67f0e2dc92e9a1
   EOF
   ```

3. **Tornar scripts executáveis:**
   ```bash
   chmod +x trocar_gateway.sh
   chmod +x verificar_gateway.sh
   ```

## 🔄 Reiniciar Servidor

Após aplicar as mudanças, reinicie o servidor:

```bash
# Parar servidor atual
pkill -f "node server_mei_furiapay.cjs"

# Iniciar servidor
nohup node server_mei_furiapay.cjs > server.log 2>&1 &

# Ou usando PM2 (se instalado)
pm2 restart server_mei_furiapay
```

## 📝 Comandos Úteis

### Verificar gateway atual:
```bash
./verificar_gateway.sh
```

### Trocar gateway:
```bash
# Para FuriaPay
./trocar_gateway.sh furiapay

# Para PagLoop
./trocar_gateway.sh pagloop
```

### Verificar logs do servidor:
```bash
tail -f server.log
```

## ✅ Verificação

Após aplicar as mudanças, verifique:

1. **Arquivo `.env` existe e tem credenciais PagLoop:**
   ```bash
   grep PAGLOOP .env
   ```

2. **Servidor está rodando:**
   ```bash
   lsof -i :3001
   ```

3. **Gateway configurado:**
   ```bash
   cat .gateway
   ```

4. **Testar PagLoop:**
   ```bash
   curl -X POST http://localhost:3001/api/payments/deposit \
     -H "Content-Type: application/json" \
     -d '{"amount": 161.80, "payer": {"name": "Teste", "document": "12345678000190"}}'
   ```

## 🔧 Arquivos Modificados

- `server_mei_furiapay.cjs` - Suporte PagLoop completo, carregamento .env
- `.env` - Credenciais PagLoop adicionadas
- `trocar_gateway.sh` - Script para trocar gateway (novo)
- `verificar_gateway.sh` - Script para verificar gateway (novo)
- `atualizar_servidor_linux.sh` - Script de atualização (novo)

## 📚 Documentação Adicional

- Ver `env_template_completo.txt` para configuração completa do .env
- Ver `README_FURIAPAY.md` para documentação FuriaPay
- Ver logs em `server.log` para debug

## ⚠️ Notas Importantes

1. **Backup:** Sempre faça backup antes de atualizar:
   ```bash
   cp server_mei_furiapay.cjs server_mei_furiapay.cjs.backup
   cp .env .env.backup
   ```

2. **Variáveis de Ambiente:** O servidor agora carrega automaticamente do `.env`
   - Se `dotenv` não estiver instalado, o carregamento é manual
   - As credenciais devem estar no arquivo `.env`

3. **Reiniciar Servidor:** Sempre reinicie o servidor após mudanças no `.env`

4. **Permissões:** Certifique-se de que os scripts têm permissão de execução:
   ```bash
   chmod +x *.sh
   ```
