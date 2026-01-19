#!/bin/bash
# Script para diagnosticar e corrigir problemas com geração de QR Code no servidor Linux
# Execute diretamente no servidor: chmod +x diagnosticar_qrcode.sh && ./diagnosticar_qrcode.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

REMOTE_PATH="${1:-/var/www/mei-web}"

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  DIAGNOSTICAR QR CODE${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${CYAN}Caminho: $REMOTE_PATH${NC}"
echo ""

cd "$REMOTE_PATH" || { echo -e "${RED}Erro: Diretorio $REMOTE_PATH nao encontrado!${NC}"; exit 1; }

# 1. Verificar se servidor Node.js está rodando
echo -e "${CYAN}[1/8] Verificando servidor Node.js...${NC}"
if ps aux | grep -v grep | grep -q "server_mei_furiapay"; then
    echo -e "${GREEN}[OK] Servidor Node.js esta rodando${NC}"
    ps aux | grep -v grep | grep "server_mei_furiapay"
else
    echo -e "${RED}[ERRO] Servidor Node.js NAO esta rodando!${NC}"
    echo -e "${YELLOW}Iniciando servidor...${NC}"
    nohup node server_mei_furiapay.cjs > server.log 2>&1 &
    sleep 3
    if ps aux | grep -v grep | grep -q "server_mei_furiapay"; then
        echo -e "${GREEN}[OK] Servidor Node.js iniciado${NC}"
    else
        echo -e "${RED}[ERRO] Falha ao iniciar servidor Node.js${NC}"
    fi
fi
echo ""

# 2. Verificar porta 3001
echo -e "${CYAN}[2/8] Verificando porta 3001...${NC}"
if ss -tuln 2>/dev/null | grep -q ":3001" || netstat -tuln 2>/dev/null | grep -q ":3001"; then
    echo -e "${GREEN}[OK] Porta 3001 esta em uso${NC}"
    ss -tuln 2>/dev/null | grep ":3001" || netstat -tuln 2>/dev/null | grep ":3001"
else
    echo -e "${YELLOW}[AVISO] Porta 3001 nao esta em uso${NC}"
fi
echo ""

# 3. Verificar arquivo .env e credenciais
echo -e "${CYAN}[3/8] Verificando credenciais no .env...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}[OK] Arquivo .env existe${NC}"
    echo ""
    echo "Credenciais configuradas:"
    grep -E "FURIAPAY_PUBLIC_KEY|FURIAPAY_SECRET_KEY|PAGLOOP_CLIENT_ID|PAGLOOP_CLIENT_SECRET" .env | grep -v "^#" || echo -e "${YELLOW}Nenhuma credencial encontrada${NC}"
    
    if ! grep -qE "^FURIAPAY_PUBLIC_KEY=|^FURIAPAY_SECRET_KEY=|^PAGLOOP_CLIENT_ID=|^PAGLOOP_CLIENT_SECRET=" .env; then
        echo -e "${RED}[ERRO] Credenciais nao configuradas no .env!${NC}"
    else
        echo -e "${GREEN}[OK] Credenciais encontradas${NC}"
    fi
else
    echo -e "${RED}[ERRO] Arquivo .env nao encontrado!${NC}"
    echo -e "${YELLOW}Criando arquivo .env basico...${NC}"
    cat > .env << 'EOF'
# Configuração de API de Pagamento
PAYMENT_PROVIDER=furiapay

# Configuração FuriaPay
FURIAPAY_BASE_URL=https://api.furiapaybr.com/v1
FURIAPAY_PUBLIC_KEY=pk_cMmhlkRfDeCcnGBY12v7W9hxKqW7ZAuGjOMWM_h4-FhH0g6J
FURIAPAY_SECRET_KEY=sk_s4IOHhQftIH2G3I-GzgqFg52rE8y0Pg5UzT-kIxDUEvQJUHO

# Configuração PagLoop
PAGLOOP_BASE_URL=https://api.pagloop.tech
PAGLOOP_CLIENT_ID=alessandroduarte_4B462F8C
PAGLOOP_CLIENT_SECRET=d87e326077fbb73ee50504fd45bdc85724034e519feda58b800d96ffb1366889944c3121389e2481dd236c67f0e2dc92e9a1
EOF
    echo -e "${GREEN}[OK] Arquivo .env criado${NC}"
fi
echo ""

# 4. Verificar gateway ativo
echo -e "${CYAN}[4/8] Verificando gateway ativo...${NC}"
if [ -f ".gateway" ]; then
    GATEWAY=$(cat .gateway)
    echo -e "${GREEN}Gateway ativo: $GATEWAY${NC}"
else
    echo -e "${YELLOW}Arquivo .gateway nao encontrado. Usando padrao: furiapay${NC}"
    GATEWAY="furiapay"
fi
echo ""

# 5. Verificar se servidor carrega .env
echo -e "${CYAN}[5/8] Verificando se servidor carrega .env...${NC}"
if grep -q "require.*dotenv\|dotenv.*config" server_mei_furiapay.cjs; then
    echo -e "${GREEN}[OK] Servidor tem suporte ao .env${NC}"
else
    echo -e "${RED}[ERRO] Servidor pode nao estar carregando .env!${NC}"
    echo -e "${YELLOW}Adicionando require('dotenv').config() no inicio do arquivo...${NC}"
    if ! grep -q "require.*dotenv" server_mei_furiapay.cjs; then
        sed -i "1i require('dotenv').config();" server_mei_furiapay.cjs
        echo -e "${GREEN}[OK] require('dotenv').config() adicionado${NC}"
    fi
fi
echo ""

# 6. Verificar logs do servidor
echo -e "${CYAN}[6/8] Verificando logs do servidor (ultimas 20 linhas)...${NC}"
if [ -f "server.log" ]; then
    echo "Ultimas 20 linhas do log:"
    tail -20 server.log
    
    if tail -20 server.log | grep -qi "error\|erro\|ERRO"; then
        echo ""
        echo -e "${YELLOW}[AVISO] Erros encontrados nos logs!${NC}"
    fi
    if tail -20 server.log | grep -q "Credenciais.*nao configuradas"; then
        echo -e "${RED}[ERRO] Credenciais nao configuradas nos logs!${NC}"
    fi
    if tail -20 server.log | grep -qE "404|405|400|500"; then
        echo -e "${YELLOW}[AVISO] Erros HTTP encontrados nos logs!${NC}"
    fi
else
    echo -e "${YELLOW}[AVISO] Arquivo de log nao encontrado${NC}"
fi
echo ""

# 7. Testar API de geração de QR Code
echo -e "${CYAN}[7/8] Testando API de geracao de QR Code...${NC}"
TEST_RESPONSE=$(curl -s -X POST http://localhost:3001/api/payments/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount":16180,"description":"Teste QR Code"}' 2>&1)

if [ $? -eq 0 ]; then
    echo "Resposta da API:"
    echo "$TEST_RESPONSE" | head -20
    
    if echo "$TEST_RESPONSE" | grep -qi "qrcode\|qr_code\|qrCode"; then
        echo ""
        echo -e "${GREEN}[OK] API esta gerando QR Code${NC}"
    elif echo "$TEST_RESPONSE" | grep -qi "error\|ERROR\|Error"; then
        echo ""
        echo -e "${RED}[ERRO] API retornou erro!${NC}"
    else
        echo ""
        echo -e "${YELLOW}[AVISO] Resposta da API nao contem QR Code${NC}"
    fi
else
    echo -e "${RED}[ERRO] Falha ao conectar na API (porta 3001)${NC}"
    echo -e "${YELLOW}Verifique se o servidor Node.js esta rodando${NC}"
fi
echo ""

# 8. Verificar configuração do servidor
echo -e "${CYAN}[8/8] Verificando configuracao do servidor...${NC}"
echo "Configuracao encontrada:"
grep -i "FURIAPAY\|PAGLOOP" server_mei_furiapay.cjs | head -5 || echo -e "${YELLOW}Nenhuma configuracao encontrada${NC}"
echo ""

# Resumo
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  DIAGNOSTICO CONCLUIDO${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Proximos passos:${NC}"
echo ""
echo "1. Se servidor nao esta rodando:"
echo "   nohup node server_mei_furiapay.cjs > server.log 2>&1 &"
echo ""
echo "2. Se credenciais nao estao configuradas:"
echo "   nano .env"
echo "   # Adicione FURIAPAY_PUBLIC_KEY e FURIAPAY_SECRET_KEY"
echo ""
echo "3. Se gateway esta incorreto:"
echo "   ./trocar_gateway.sh furiapay"
echo "   OU"
echo "   ./trocar_gateway.sh pagloop"
echo ""
echo "4. Para ver logs em tempo real:"
echo "   tail -f server.log"
echo ""
echo "5. Para reiniciar servidor:"
echo "   pkill -f server_mei_furiapay"
echo "   nohup node server_mei_furiapay.cjs > server.log 2>&1 &"
echo ""
