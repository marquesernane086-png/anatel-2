# Guia de Hospedagem - Servidor Web-MEI no Linux

Este guia explica como hospedar a aplicação web-mei (server_mei_furiapay.cjs) no servidor Linux.

## 🚀 Instalação Rápida

### Opção 1: Script Automático (Recomendado)

```bash
# 1. Tornar script executável
chmod +x instalar_servidor_web_mei.sh

# 2. Executar instalação (com sudo se necessário)
sudo ./instalar_servidor_web_mei.sh [dominio] [porta]

# Exemplo:
sudo ./instalar_servidor_web_mei.sh seu-dominio.com 3001
```

O script irá automaticamente:
- ✅ Instalar Node.js 20.x
- ✅ Instalar PM2 (gerenciador de processos)
- ✅ Criar diretório `/var/www/mei-web`
- ✅ Copiar arquivos necessários
- ✅ Configurar arquivo `.env`
- ✅ Iniciar servidor com PM2
- ✅ Configurar Nginx como proxy reverso (opcional)
- ✅ Configurar firewall (opcional)

### Opção 2: Instalação Manual

#### 1. Instalar Node.js e PM2

```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2
```

#### 2. Criar Diretório e Copiar Arquivos

```bash
# Criar diretório
sudo mkdir -p /var/www/mei-web/dist
sudo mkdir -p /var/www/mei-web/logs

# Copiar arquivos
sudo cp server_mei_furiapay.cjs /var/www/mei-web/
sudo cp -r dist/* /var/www/mei-web/dist/
sudo cp package.json /var/www/mei-web/  # Se existir

# Configurar permissões
sudo chown -R $USER:$USER /var/www/mei-web
```

#### 3. Configurar Arquivo .env

```bash
cd /var/www/mei-web
cp env_template_completo.txt .env
# Edite o .env conforme necessário
nano .env
```

#### 4. Iniciar Servidor com PM2

```bash
cd /var/www/mei-web

# Iniciar servidor
pm2 start server_mei_furiapay.cjs --name server_mei_furiapay

# Configurar para iniciar no boot
pm2 save
pm2 startup
# Execute o comando que aparecer no terminal
```

## 🔧 Configuração Nginx (Proxy Reverso)

### Configuração Automática

O script `instalar_servidor_web_mei.sh` configura automaticamente o Nginx.

### Configuração Manual

```bash
# Criar configuração Nginx
sudo nano /etc/nginx/sites-available/mei-web
```

Adicione:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    access_log /var/log/nginx/mei-web-access.log;
    error_log /var/log/nginx/mei-web-error.log;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar site:

```bash
sudo ln -s /etc/nginx/sites-available/mei-web /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 📋 Gerenciamento do Servidor

### Comandos PM2

```bash
# Verificar status
pm2 status

# Ver logs
pm2 logs server_mei_furiapay

# Reiniciar servidor
pm2 restart server_mei_furiapay

# Parar servidor
pm2 stop server_mei_furiapay

# Iniciar servidor
pm2 start server_mei_furiapay

# Remover do PM2
pm2 delete server_mei_furiapay

# Monitorar recursos
pm2 monit
```

### Gerenciar Gateway

```bash
cd /var/www/mei-web

# Verificar gateway atual
./verificar_gateway.sh

# Trocar para FuriaPay
./trocar_gateway.sh furiapay

# Trocar para PagLoop
./trocar_gateway.sh pagloop
```

## 🔒 Configurar Firewall

```bash
# Permitir porta Node.js
sudo ufw allow 3001/tcp comment "MEI Web Server"

# Permitir HTTP (se usar Nginx)
sudo ufw allow 80/tcp comment "Nginx HTTP"

# Permitir HTTPS (se configurado)
sudo ufw allow 443/tcp comment "Nginx HTTPS"
```

## 🔄 Atualizar Aplicação

### Método 1: Atualização Manual

```bash
# 1. Parar servidor
pm2 stop server_mei_furiapay

# 2. Fazer backup
sudo cp /var/www/mei-web/server_mei_furiapay.cjs /var/www/mei-web/server_mei_furiapay.cjs.backup

# 3. Copiar novo arquivo
sudo cp server_mei_furiapay.cjs /var/www/mei-web/

# 4. Reiniciar servidor
pm2 restart server_mei_furiapay

# 5. Verificar logs
pm2 logs server_mei_furiapay --lines 50
```

### Método 2: Usar Script de Transferência (Windows → Linux)

```powershell
# No Windows
.\transferir_configuracao_linux.ps1 -SSH_HOST seu-servidor.com -SSH_USER usuario
```

## 🐛 Resolução de Problemas

### Servidor não inicia

```bash
# Verificar logs do PM2
pm2 logs server_mei_furiapay

# Verificar se porta está livre
lsof -i :3001

# Verificar se arquivo .env existe
ls -la /var/www/mei-web/.env
```

### Erro 502 Bad Gateway (Nginx)

```bash
# Verificar se servidor Node.js está rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/mei-web-error.log

# Verificar configuração Nginx
sudo nginx -t
```

### Gateway não funciona

```bash
cd /var/www/mei-web

# Verificar gateway atual
./verificar_gateway.sh

# Verificar credenciais no .env
cat .env | grep PAGLOOP
cat .env | grep FURIAPAY
```

## ✅ Verificação

Após instalação, verifique:

1. **Servidor está rodando:**
   ```bash
   pm2 status
   curl http://localhost:3001
   ```

2. **Gateway configurado:**
   ```bash
   cd /var/www/mei-web
   ./verificar_gateway.sh
   ```

3. **Nginx funcionando (se configurado):**
   ```bash
   curl http://seu-dominio.com
   sudo systemctl status nginx
   ```

4. **Firewall configurado:**
   ```bash
   sudo ufw status
   ```

## 📚 Documentação Adicional

- Ver `ATUALIZAR_LINUX.md` para guia de atualização
- Ver `README_DEPLOY.md` para documentação de deploy
- Ver logs em `/var/www/mei-web/logs/` e `pm2 logs`

## 🔐 Segurança

### Recomendações:

1. **Configurar HTTPS** (usando Let's Encrypt):
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com
   ```

2. **Manter Node.js atualizado:**
   ```bash
   npm install -g npm@latest
   ```

3. **Configurar backup automático:**
   ```bash
   # Adicionar ao crontab
   crontab -e
   # Adicionar linha (backup diário às 2h da manhã):
   0 2 * * * tar -czf /backup/mei-web-$(date +\%Y\%m\%d).tar.gz /var/www/mei-web
   ```

4. **Monitorar logs:**
   ```bash
   pm2 logs server_mei_furiapay --lines 100
   sudo tail -f /var/log/nginx/mei-web-access.log
   ```
