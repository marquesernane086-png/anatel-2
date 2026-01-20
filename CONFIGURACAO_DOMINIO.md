# 🌐 CONFIGURAÇÃO DO DOMÍNIO: cnpj-atualize.com

## ✅ SEU DOMÍNIO: cnpj-atualize.com

---

## 📋 GUIA PASSO A PASSO - CLOUDFLARE + EMERGENT

### PASSO 1: CONFIGURAR CLOUDFLARE

1. **Login na Cloudflare:**
   - Acesse: https://dash.cloudflare.com

2. **Adicionar Site:**
   - Clique em "Add a Site"
   - Digite: **cnpj-atualize.com**
   - Escolha plano: **Free** (proteção DDoS incluída!)
   - Continue

3. **Cloudflare vai escanear seu DNS** (~30 segundos)

4. **Nameservers da Cloudflare** serão exibidos:
   ```
   Exemplo:
   alice.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```

5. **Ir no registrador do domínio** (onde você comprou cnpj-atualize.com):
   - Encontre "DNS Settings" ou "Nameservers"
   - **Substitua** os nameservers atuais pelos da Cloudflare
   - Salvar

6. **Aguardar propagação:** 5 minutos - 24 horas

---

### PASSO 2: CONECTAR À EMERGENT

1. **Na interface da Emergent:**
   - Encontre seu deployment: `site-analise-1`
   - Clique em **"Link domain"**
   - Digite: **cnpj-atualize.com**
   - Clique em **"Entri"**

2. **Emergent vai fornecer instruções**, algo como:
   ```
   Adicione estes registros DNS:
   
   Type: CNAME
   Name: @
   Content: site-analise-1.emergent.host
   ```

3. **Voltar para Cloudflare Dashboard:**
   - Menu lateral → **DNS**
   - **Delete** todos os registros A antigos
   - Clique em **"Add record"**

4. **Adicionar registro CNAME:**
   ```
   Type: CNAME
   Name: @ (ou cnpj-atualize.com)
   Target: site-analise-1.emergent.host
   Proxy status: 🟠 Proxied (IMPORTANTE!)
   TTL: Auto
   ```

5. **Adicionar www também (opcional):**
   ```
   Type: CNAME
   Name: www
   Target: site-analise-1.emergent.host
   Proxy status: 🟠 Proxied
   ```

6. **Salvar** → Aguardar 5-15 minutos

---

### PASSO 3: ATIVAR PROTEÇÃO DDoS

**Já está ativa automaticamente quando:**
- ✅ Usa nameservers da Cloudflare
- ✅ Proxy está ativo (🟠 nuvem laranja)

**Configurações adicionais recomendadas:**

1. **SSL/TLS:**
   ```
   Menu → SSL/TLS → Overview
   Encryption mode: Full (Strict)
   ```

2. **Always Use HTTPS:**
   ```
   Menu → SSL/TLS → Edge Certificates
   Always Use HTTPS: ON
   ```

3. **Bot Fight Mode:**
   ```
   Menu → Security → Bots
   Bot Fight Mode: ON
   ```

4. **Security Level:**
   ```
   Menu → Security → Settings
   Security Level: High
   ```

5. **Se estiver sob ataque:**
   ```
   Menu → Security → Settings
   Security Level: "I'm Under Attack"
   ```

---

### PASSO 4: VERIFICAR

**Após propagação DNS (5-15 min):**

1. **Testar URL:**
   ```
   https://cnpj-atualize.com
   ```
   Deve carregar a aplicação MEI!

2. **Testar com CNPJ:**
   ```
   https://cnpj-atualize.com/?cnpj=12345678000190
   ```

3. **Testar Dashboard:**
   ```
   https://cnpj-atualize.com/dashboard
   (Login: mei2025 / Fl@mengo10)
   ```

---

### 🛡️ PROTEÇÃO DDoS ATIVADA

**Cloudflare Free protege contra:**
- ✅ DDoS Layer 3/4 (ilimitado)
- ✅ DDoS Layer 7 (HTTP floods)
- ✅ Ataques de bots
- ✅ SQL injection
- ✅ XSS attacks

**Monitoramento:**
```
Menu → Analytics → Security
Ver ataques bloqueados em tempo real
```

---

### 📊 URLS FINAIS

**Produção:**
```
https://cnpj-atualize.com              → Home
https://cnpj-atualize.com/debitos      → Débitos
https://cnpj-atualize.com/pagamento    → Pagamento
https://cnpj-atualize.com/login        → Login Admin
https://cnpj-atualize.com/dashboard    → Dashboard (protegido)
```

**Com proteção DDoS Cloudflare ativa!** 🛡️

---

### ⚠️ IMPORTANTE

**Antes do deploy final:**
1. ✅ Faça re-deploy na Emergent
2. ✅ Configure domínio na Emergent
3. ✅ Configure DNS na Cloudflare
4. ✅ Aguarde propagação
5. ✅ Teste todas as URLs

**Custos:**
- Cloudflare Free: R$ 0/mês
- Emergent Deploy: 50 créditos/mês
- Domínio: ~R$ 40-80/ano

---

## ✅ PRÓXIMO PASSO

**Você já tem o domínio cnpj-atualize.com?**
- Se SIM: Siga os passos acima
- Se NÃO: Compre primeiro em Registro.br ou Namecheap

**Quer que eu te guie passo a passo pela configuração?** 🚀
