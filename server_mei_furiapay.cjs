/**
 * Servidor combinado: Aplicação MEI + Gateway FuriaPay e PagLoop
 * Serve a aplicação MEI e faz proxy para API FuriaPay ou PagLoop na porta 3001
 * Suporta FuriaPay e PagLoop
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Carregar variáveis de ambiente do arquivo .env
try {
    require('dotenv').config();
} catch (e) {
    // Se dotenv não estiver instalado, tentar carregar manualmente
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            // Ignorar linhas vazias e comentários
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const match = trimmedLine.match(/^([^#=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let value = match[2].trim();
                    // Remover aspas se houver
                    value = value.replace(/^["']|["']$/g, '');
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            }
        });
        console.log('📋 [ENV] Arquivo .env carregado manualmente');
    } else {
        console.warn('⚠️  [ENV] Arquivo .env não encontrado');
    }
}

const PORT = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist');

// Configuração FuriaPay
// Conforme furiapay-documentacao.txt
// Base URL: https://api.furiapaybr.com/v1
const FURIAPAY_BASE_URL = process.env.FURIAPAY_BASE_URL || 'https://api.furiapaybr.com/v1';
// Credenciais conforme documentação furiapay-documentacao.txt
const FURIAPAY_PUBLIC_KEY = process.env.FURIAPAY_PUBLIC_KEY || process.env.FURIAPAY_API_KEY || 'pk_cMmhlkRfDeCcnGBY12v7W9hxKqW7ZAuGjOMWM_h4-FhH0g6J';
const FURIAPAY_SECRET_KEY = process.env.FURIAPAY_SECRET_KEY || process.env.FURIAPAY_API_SECRET || 'sk_s4IOHhQftIH2G3I-GzgqFg52rE8y0Pg5UzT-kIxDUEvQJUHO';
// Limite PIX: R$ 1.500,00 (150000 centavos)
const FURIAPAY_PIX_LIMIT = 150000;

// Configuração PagLoop
// Conforme arquivo antigo: deploy_mei_web_v19\dist\assets\index-BSZkHrwn.js
const PAGLOOP_BASE_URL = process.env.PAGLOOP_BASE_URL || 'https://api.pagloop.tech';
const PAGLOOP_CLIENT_ID = process.env.PAGLOOP_CLIENT_ID || process.env.PAGLOOP_API_KEY || '';
const PAGLOOP_CLIENT_SECRET = process.env.PAGLOOP_CLIENT_SECRET || process.env.PAGLOOP_API_SECRET || '';

// Debug: verificar se credenciais foram carregadas
if (!PAGLOOP_CLIENT_ID || !PAGLOOP_CLIENT_SECRET) {
    console.warn('⚠️  [PagLoop] Credenciais não encontradas nas variáveis de ambiente');
    console.warn('   PAGLOOP_CLIENT_ID:', PAGLOOP_CLIENT_ID ? 'OK' : 'VAZIO');
    console.warn('   PAGLOOP_CLIENT_SECRET:', PAGLOOP_CLIENT_SECRET ? 'OK' : 'VAZIO');
} else {
    console.log('✅ [PagLoop] Credenciais carregadas do .env');
}

// Função para ler gateway do arquivo .gateway
function obterGatewayAtivo() {
    const gatewayFile = path.join(__dirname, '.gateway');
    if (fs.existsSync(gatewayFile)) {
        try {
            const gateway = fs.readFileSync(gatewayFile, 'utf8').trim();
            if (gateway === 'furiapay' || gateway === 'pagloop') {
                console.log(`📋 [Gateway] Lendo arquivo .gateway: ${gateway}`);
                return gateway;
            } else {
                console.warn(`⚠️  [Gateway] Valor inválido no arquivo .gateway: "${gateway}". Usando padrão: furiapay`);
            }
        } catch (error) {
            console.warn('⚠️  [Gateway] Erro ao ler arquivo .gateway:', error.message);
        }
    } else {
        console.log('📋 [Gateway] Arquivo .gateway não encontrado. Usando padrão: furiapay');
    }
    return 'furiapay'; // Padrão
}

// Função auxiliar para criar requisição FuriaPay conforme documentação
// Formato conforme furiapay-documentacao.txt
function criarRequisicaoFuriaPay(amount, description, payer) {
    // Garantir que amount é um número válido
    let amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
        amountValue = 161.80; // Valor padrão
    }
    
    // Converter para centavos (multiplicar por 100 e arredondar)
    const amountInCents = Math.round(amountValue * 100);
    
    // Validar conversão
    if (amountInCents <= 0) {
        throw new Error(`Valor inválido: ${amount} (convertido para ${amountInCents} centavos)`);
    }
    
    // Limpar documento (remover pontos, traços, espaços)
    // payer.document pode ser string ou já estar limpo
    let documentClean = '';
    if (payer && payer.document) {
        if (typeof payer.document === 'string') {
            documentClean = payer.document.replace(/\D/g, '');
        } else if (typeof payer.document === 'object' && payer.document.number) {
            documentClean = payer.document.number.replace(/\D/g, '');
        } else {
            documentClean = String(payer.document).replace(/\D/g, '');
        }
    }
    
    // Se documento vazio, usar padrão
    if (!documentClean || documentClean.length === 0) {
        documentClean = '00000000000000'; // CNPJ padrão
    }
    
    // Determinar tipo de documento (CPF tem 11 dígitos, CNPJ tem 14)
    const documentType = documentClean.length === 11 ? 'cpf' : 'cnpj';
    
    // Limpar telefone (remover parênteses, traços, espaços)
    let phoneClean = '';
    if (payer && (payer.phoneNumber || payer.phone)) {
        phoneClean = String(payer.phoneNumber || payer.phone).replace(/\D/g, '');
    }
    if (!phoneClean || phoneClean.length < 10) {
        phoneClean = '11999999999'; // Telefone padrão
    }
    
    // Construir requisição conforme documentação FuriaPay
    const requestBody = {
        amount: amountInCents,  // Valor em centavos (obrigatório)
        paymentMethod: 'pix',  // PIX conforme documentação (obrigatório)
        customer: {           // Objeto customer (obrigatório)
            name: (payer && payer.name) || 'Empreendedor CNPJ',
            email: (payer && payer.email) || '',
            document: {       // Documento precisa ser objeto com type e number
                type: documentType,
                number: documentClean
            },
            phoneNumber: phoneClean  // Telefone sem formatação
        },
        items: [               // Array de itens (obrigatório)
            {
                title: description || 'Pagamento DAS CNPJ',  // title (não name)
                unitPrice: amountInCents,                    // unitPrice em centavos
                quantity: 1,
                tangible: false  // false para produtos digitais/serviços
            }
        ]
    };
    
    return requestBody;
}

// Função auxiliar para criar headers de autenticação Basic
// Usa Public Key e Secret Key conforme documentação FuriaPay
function criarHeadersFuriaPay(publicKey, secretKey) {
    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`
    };
}

// Função auxiliar para criar requisição PagLoop conforme implementação original
// Formato conforme deploy_mei_web_v16\dist\assets\index-JzOyYWMx.js
// Xg=i=>{const s=i?.nome||"Empreendedor MEI",r=i?.cnpj?i.cnpj.replace(/\D/g,""):"00000000000000";
// return{amount:161.8,external_id:Qg(),clientCallbackUrl:"https://meu-site-mei.com/callback",payer:{name:s,email:"contato@mei-regular.com.br",document:r}}}
function criarRequisicaoPagLoop(amount, description, payer) {
    // Gerar external_id único (formato: mei_timestamp_random)
    const external_id = `mei_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Limpar documento (remover pontos, traços, espaços)
    const documentClean = ((payer && payer.document) || '').replace(/\D/g, '') || '00000000000000';
    
    // Email fixo conforme código original
    const email = 'contato@mei-regular.com.br';
    
    // Nome do pagador
    const name = (payer && payer.name) || 'Empreendedor MEI';
    
    // Validar documento (CPF 11 dígitos ou CNPJ 14 dígitos)
    let documentFinal = documentClean;
    if (documentFinal.length < 11) {
        documentFinal = '00000000000000'; // CNPJ padrão
    } else if (documentFinal.length === 11) {
        // É CPF, mas PagLoop pode precisar de CNPJ, usar CNPJ padrão se necessário
        // Manter CPF se for aceito
    } else if (documentFinal.length > 14) {
        documentFinal = documentFinal.substring(0, 14); // Truncar para CNPJ
    }
    
    // Garantir que amount é um número válido
    let amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
        amountValue = 161.80; // Valor padrão
    }
    
    // Formato da requisição PagLoop (apenas campos essenciais que a API aceita)
    // Removidos: currency, payment_method, description (podem causar erro)
    const requestBody = {
        amount: amountValue,  // Valor em reais (não centavos) - número válido
        external_id: external_id,  // ID externo único (obrigatório)
        clientCallbackUrl: "https://meu-site-mei.com/callback",  // URL de callback (obrigatório)
        payer: {
            name: name,  // Nome do pagador
            email: email,  // Email fixo conforme original
            document: documentFinal  // CPF ou CNPJ (apenas números)
        }
    };
    
    console.log(`📋 [PagLoop] Criando requisição com parâmetros (formato correto):`, JSON.stringify(requestBody, null, 2));
    
    return requestBody;
}

// Função para autenticar PagLoop e obter token
async function autenticarPagLoop() {
    if (!PAGLOOP_CLIENT_ID || !PAGLOOP_CLIENT_SECRET) {
        throw new Error('Credenciais PagLoop não configuradas (PAGLOOP_CLIENT_ID e PAGLOOP_CLIENT_SECRET)');
    }
    
    const authUrl = new URL(`${PAGLOOP_BASE_URL}/api/auth/login`);
    const authBody = JSON.stringify({
        client_id: PAGLOOP_CLIENT_ID,
        client_secret: PAGLOOP_CLIENT_SECRET
    });
    
    const options = {
        hostname: authUrl.hostname,
        port: authUrl.port || 443,
        path: authUrl.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(authBody)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const response = JSON.parse(data);
                        const token = response.access_token || response.token;
                        if (token) {
                            resolve(token);
                        } else {
                            reject(new Error('Token não retornado na autenticação PagLoop'));
                        }
                    } catch (e) {
                        reject(new Error(`Erro ao parsear resposta de autenticação PagLoop: ${e.message}`));
                    }
                } else {
                    reject(new Error(`Falha na autenticação PagLoop: Status ${res.statusCode}`));
                }
            });
        });
        req.on('error', reject);
        req.write(authBody);
        req.end();
    });
}

// Endpoints FuriaPay - endpoint correto primeiro
// Conforme furiapay-documentacao.txt: 
// Base URL: https://api.furiapaybr.com/v1
// Endpoint: POST /transactions (o /v1 já está na base URL)
const FURIAPAY_ENDPOINTS = [
    '/transactions',               // Endpoint CORRETO conforme documentação (BASE_URL já tem /v1)
    // Endpoints alternativos (caso a base URL não tenha /v1)
    '/v1/transactions',            // Alternativo caso base URL seja sem /v1
    '/api/v1/transactions',        // Alternativo com api/
    '/api/transactions'            // Alternativo sem v1
];

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer(async (req, res) => {
    // CORS headers para todas as respostas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Usar WHATWG URL API
    const baseUrl = `http://${req.headers.host || 'localhost'}`;
    const parsedUrl = new URL(req.url, baseUrl);
    const pathname = parsedUrl.pathname;
    const queryParams = Object.fromEntries(parsedUrl.searchParams);
    
    // ============================================
    // ENDPOINT PARA SINCRONIZAR GATEWAY (FRONTEND)
    // ============================================
    
    // Rota para obter gateway ativo (usado pelo frontend para sincronizar)
    if (pathname === '/api/gateway/current' && req.method === 'GET') {
        const activeGateway = obterGatewayAtivo();
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end(JSON.stringify({ 
            success: true, 
            gateway: activeGateway,
            message: `Gateway ativo: ${activeGateway}`
        }));
        return;
    }
    
    // ============================================
    // ROTAS DO GATEWAY FURIAPAY - APENAS FURIAPAY
    // ============================================
    
    // INTERCEPTAR CHAMADAS /api/payments/deposit - Converter para gateway ativo
    // O código compilado ainda chama /api/payments/deposit
    // Esta rota intercepta e converte para o gateway ativo (FuriaPay ou PagLoop)
    if (pathname === '/api/payments/deposit' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                // Validar se body não está vazio
                if (!body || body.trim() === '') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Body da requisição vazio' }));
                    return;
                }
                
                // Tentar parsear JSON
                let data;
                try {
                    data = JSON.parse(body);
                } catch (parseError) {
                    console.error('❌ [ERRO] Erro ao parsear JSON:', parseError.message);
                    console.error('   Body recebido:', body.substring(0, 200)); // Primeiros 200 caracteres
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Erro ao parsear JSON', 
                        details: parseError.message,
                        bodyPreview: body.substring(0, 200)
                    }));
                    return;
                }
                
                // Obter gateway ativo do arquivo .gateway
                const activeGateway = obterGatewayAtivo();
                console.log(`🔄 [Gateway] Interceptando /api/payments/deposit. Gateway ativo: ${activeGateway}`, data);
                
                // Converter dados para formato comum
                const amount = data.amount || data.value || 161.80;
                // Mapear dados conforme formato original PagLoop (nome, cnpj)
                const payer = {
                    name: ((data.payer && data.payer.name) || data.nome || 'Empreendedor MEI'),
                    document: (((data.payer && data.payer.document) || data.cnpj || data.document || '').replace(/\D/g, '')) || '00000000000000',
                    email: ((data.payer && data.payer.email) || data.email || 'contato@mei-regular.com.br')
                };
                
                let responseData;
                let statusCode;
                
                if (activeGateway === 'pagloop') {
                    // Usar PagLoop
                    console.log('💰 [PagLoop] Gerando QR Code PIX:', { amount, payer: payer.name });
                    
                    // Autenticar PagLoop
                    let token;
                    try {
                        token = await autenticarPagLoop();
                        console.log('✅ [PagLoop] Autenticado com sucesso');
                    } catch (error) {
                        console.error('❌ [PagLoop] Erro na autenticação:', error.message);
                        throw new Error(`Falha na autenticação PagLoop: ${error.message}`);
                    }
                    
                    // Criar requisição PagLoop
                    const requestBody = criarRequisicaoPagLoop(amount, data.description || 'Pagamento DAS CNPJ', payer);
                    const requestData = JSON.stringify(requestBody);
                    
                    const targetUrl = new URL(`${PAGLOOP_BASE_URL}/api/payments/deposit`);
                    const options = {
                        hostname: targetUrl.hostname,
                        port: targetUrl.port || 443,
                        path: targetUrl.pathname,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'Content-Length': Buffer.byteLength(requestData)
                        }
                    };
                    
                    const result = await new Promise((resolve, reject) => {
                        const proxyReq = https.request(options, (proxyRes) => {
                            let responseBody = '';
                            proxyRes.on('data', (chunk) => { responseBody += chunk; });
                            proxyRes.on('end', () => {
                                if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
                                    try {
                                        resolve({ statusCode: proxyRes.statusCode, data: JSON.parse(responseBody) });
                                    } catch (e) {
                                        resolve({ statusCode: proxyRes.statusCode, data: responseBody });
                                    }
                                } else {
                                    reject(new Error(`Status ${proxyRes.statusCode}: ${responseBody}`));
                                }
                            });
                        });
                        proxyReq.on('error', reject);
                        proxyReq.write(requestData);
                        proxyReq.end();
                    });
                    
                    responseData = result.data;
                    statusCode = result.statusCode;
                    
                    // Log da resposta completa da PagLoop para debug
                    console.log(`📋 [PagLoop] Resposta completa da API:`, JSON.stringify(responseData, null, 2));
                    
                    // Normalizar resposta PagLoop conforme formato original
                    // Formato PagLoop: responseData.qrCodeResponse.qrcode e responseData.qrCodeResponse.transactionId
                    // Ou: responseData.pixCopiaCola (alternativa)
                    
                    let qrCode = null;
                    let transactionId = null;
                    
                    // Verificar formato principal: qrCodeResponse (formato mais comum do PagLoop)
                    if (responseData && responseData.qrCodeResponse) {
                        // Extrair QR code do qrCodeResponse
                        if (typeof responseData.qrCodeResponse === 'string') {
                            qrCode = responseData.qrCodeResponse;
                        } else if (typeof responseData.qrCodeResponse === 'object') {
                            qrCode = responseData.qrCodeResponse.qrcode || 
                                    responseData.qrCodeResponse.qr_code ||
                                    responseData.qrCodeResponse.code ||
                                    responseData.qrCodeResponse.emv ||
                                    responseData.qrCodeResponse.pixCopiaCola ||
                                    responseData.qrCodeResponse.pix_copia_cola;
                            
                            transactionId = responseData.qrCodeResponse.transactionId || 
                                           responseData.qrCodeResponse.transaction_id ||
                                           responseData.qrCodeResponse.id ||
                                           responseData.qrCodeResponse.transactionId;
                        }
                    }
                    
                    // Alternativa: pixCopiaCola (usado quando não tem qrCodeResponse)
                    if (!qrCode && responseData && responseData.pixCopiaCola) {
                        qrCode = responseData.pixCopiaCola;
                    }
                    
                    // Alternativa: pix_copia_cola (formato com underscore)
                    if (!qrCode && responseData && responseData.pix_copia_cola) {
                        qrCode = responseData.pix_copia_cola;
                    }
                    
                    // Fallback: tentar outros formatos possíveis na raiz
                    if (!qrCode && responseData) {
                        qrCode = responseData.qr_code || 
                                responseData.qrcode || 
                                responseData.qrCode || 
                                responseData.pix_code ||
                                responseData.pixCode ||
                                responseData.emv ||
                                (responseData.pix && responseData.pix.qrcode) ||
                                (responseData.data && responseData.data.qr_code) ||
                                (responseData.data && responseData.data.qrcode) ||
                                (responseData.result && responseData.result.qrcode);
                    }
                    
                    // Se qrCode for um objeto, tentar extrair o código
                    if (qrCode && typeof qrCode === 'object') {
                        qrCode = qrCode.qrcode || qrCode.qr_code || qrCode.code || qrCode.emv || qrCode.pixCopiaCola || JSON.stringify(qrCode);
                    }
                    
                    // Limpar o QR code (remover espaços extras, quebras de linha, etc.)
                    if (qrCode && typeof qrCode === 'string') {
                        qrCode = qrCode.trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '').replace(/\s+/g, '');
                    }
                    
                    // Log detalhado para debug
                    console.log(`🔍 [PagLoop] Debug QR Code:`);
                    console.log(`   - Tipo: ${typeof qrCode}`);
                    console.log(`   - Encontrado: ${qrCode ? 'SIM' : 'NAO'}`);
                    if (qrCode) {
                        console.log(`   - Preview: ${qrCode.substring(0, 100)}...`);
                        console.log(`   - Tamanho: ${qrCode.length} caracteres`);
                    }
                    
                    // Obter payment ID (preferir transactionId do qrCodeResponse, depois outros)
                    const paymentId = transactionId || 
                                    (responseData && responseData.id) || 
                                    (responseData && responseData.payment_id) || 
                                    (responseData && responseData.transaction_id) ||
                                    (responseData && responseData.qrCodeResponse && responseData.qrCodeResponse.transactionId);
                    
                    console.log(`📱 [PagLoop] QR Code extraído: ${qrCode ? (qrCode.substring(0, 50) + '...') : 'NÃO ENCONTRADO'}`);
                    console.log(`📋 [PagLoop] Transaction ID: ${paymentId}`);
                    
                    // Normalizar resposta no formato esperado pelo frontend
                    // Formato original PagLoop usa: qrCodeResponse: { qrcode: "...", transactionId: "..." }
                    responseData = {
                        id: paymentId,
                        payment_id: paymentId,
                        transaction_id: paymentId,
                        amount: amount,
                        qrCodeResponse: qrCode ? {
                            qrcode: qrCode,
                            transactionId: paymentId
                        } : undefined,
                        qr_code: qrCode,
                        qrcode: qrCode,
                        pix_code: qrCode,
                        pixCode: qrCode,
                        pixCopiaCola: qrCode, // Formato alternativo
                        status: (responseData && responseData.status) || 'waiting_payment',
                        ...responseData
                    };
                    
                    if (qrCode) {
                        console.log(`✅ [PagLoop] QR Code PIX gerado com sucesso via interceptação!`);
                    } else {
                        console.warn(`⚠️  [PagLoop] QR Code não encontrado na resposta!`);
                    }
                    
                    // Enviar resposta PagLoop
                    res.writeHead(statusCode || 200, {
                        'Content-Type': 'application/json'
                    });
                    res.end(JSON.stringify(responseData));
                    
                } else {
                    // Usar FuriaPay (padrão)
                    console.log('📱 [FuriaPay] Gerando QR Code PIX:', { amount, payer: payer.name });
                    
                    const targetUrl = FURIAPAY_BASE_URL;
                    const requestBody = criarRequisicaoFuriaPay(amount, data.description || 'Pagamento DAS CNPJ', payer);
                    const requestData = JSON.stringify(requestBody);
                    
                    let lastError = null;
                    let success = false;
                    
                    for (const endpoint of FURIAPAY_ENDPOINTS) {
                        try {
                        const targetUrlObj = new URL(targetUrl);
                        const headers = criarHeadersFuriaPay(FURIAPAY_PUBLIC_KEY, FURIAPAY_SECRET_KEY);
                        headers['Content-Length'] = Buffer.byteLength(requestData);
                        
                        const options = {
                            hostname: targetUrlObj.hostname,
                            port: targetUrlObj.port || (targetUrlObj.protocol === 'https:' ? 443 : 80),
                            path: endpoint,
                            method: 'POST',
                            headers: headers
                        };
                        
                        const result = await new Promise((resolve, reject) => {
                            const proxyReq = https.request(options, (proxyRes) => {
                                let responseData = '';
                                
                                proxyRes.on('data', (chunk) => {
                                    responseData += chunk;
                                });
                                
                                proxyRes.on('end', () => {
                                    if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
                                        try {
                                            const jsonData = JSON.parse(responseData);
                                            resolve({ statusCode: proxyRes.statusCode, data: jsonData, endpoint });
                                        } catch (e) {
                                            resolve({ statusCode: proxyRes.statusCode, data: responseData, endpoint });
                                        }
                                    } else {
                                        reject(new Error(`Status ${proxyRes.statusCode}: ${responseData}`));
                                    }
                                });
                            });
                            
                            proxyReq.on('error', reject);
                            proxyReq.write(requestData);
                            proxyReq.end();
                        });
                        
                        // Normalizar resposta FuriaPay para formato compatível com código React
                        const responseDataResult = result.data;
                        const paymentId = (responseDataResult && responseDataResult.id) || (responseDataResult && responseDataResult.payment_id) || (responseDataResult && responseDataResult.transaction_id);
                        // QR Code FuriaPay vem em responseData.pix.qrcode conforme documentação
                        const qrCode = (responseDataResult && responseDataResult.pix && responseDataResult.pix.qrcode) || 
                                      (responseDataResult && responseDataResult.qr_code) || 
                                      (responseDataResult && responseDataResult.qrcode) || 
                                      (responseDataResult && responseDataResult.qrCode) || 
                                      (responseDataResult && responseDataResult.pix_code) || 
                                      (responseDataResult && responseDataResult.pixCode);
                        
                        // Formato de resposta compatível com código React (normalizado para FuriaPay)
                        const normalizedResponse = {
                            id: paymentId,
                            payment_id: paymentId,
                            transaction_id: paymentId,
                            amount: amount,
                            qrCodeResponse: qrCode ? {
                                qrcode: qrCode
                            } : undefined,
                            qr_code: qrCode,
                            qrcode: qrCode,
                            pix_code: qrCode,
                            pixCode: qrCode,
                            status: (responseDataResult && responseDataResult.status) || 'pending',
                            ...responseDataResult
                        };
                        
                        res.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        res.end(JSON.stringify(normalizedResponse));
                        
                        console.log(`✅ [FuriaPay] QR Code PIX gerado com sucesso via interceptação! Endpoint usado: ${endpoint}`);
                        success = true;
                        break;
                    } catch (error) {
                        lastError = error;
                            console.log(`❌ Endpoint ${endpoint} falhou:`, error.message);
                            if (error.message.includes('404')) {
                                console.log(`   [INFO] Endpoint ${endpoint} não existe na API FuriaPay`);
                            }
                            continue;
                        }
                    }
                    
                    if (!success) {
                        throw lastError || new Error('Nenhum endpoint funcionou');
                    }
                }
                
            } catch (error) {
                console.error(`❌ Erro ao processar pagamento (Gateway: ${obterGatewayAtivo()}):`, error);
                res.writeHead(500, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({
                    success: false,
                    error: error.message,
                    details: error.toString()
                }));
            }
        });
        
        return;
    }
    
    // Rota principal para gerar PIX - chamada direta da tela MEI
    if ((pathname === '/api/pix' || pathname === '/api/payment' || pathname === '/api/furiapay/pix') && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                
                // Aceitar dados em diferentes formatos (compatibilidade)
                // IMPORTANTE: amount vem em reais do frontend, criarRequisicaoFuriaPay converte para centavos
                let amount = data.amount || data.value || 161.80;
                
                // Garantir que amount é um número (pode vir como string)
                amount = parseFloat(amount);
                if (isNaN(amount) || amount <= 0) {
                    amount = 161.80; // Valor padrão
                }
                
                const currency = data.currency || 'BRL';
                const description = data.description || 'Pagamento DAS MEI';
                
                // Normalizar dados do pagador
                let payer = data.payer || {};
                
                // Se payer não for um objeto, criar um
                if (typeof payer !== 'object' || Array.isArray(payer)) {
                    payer = {};
                }
                
                // Preencher dados do pagador com fallbacks
                payer.name = payer.name || data.nome || data.name || 'Empreendedor MEI';
                payer.email = payer.email || data.email || '';
                
                // Normalizar documento (pode vir como string ou objeto)
                if (payer.document && typeof payer.document === 'object') {
                    // Se já for objeto {type, number}, usar diretamente
                    payer.document = (payer.document.number || '').replace(/\D/g, '') || payer.document;
                } else {
                    // Se for string, limpar e usar
                    payer.document = ((payer.document || data.cnpj || data.document || '').replace(/\D/g, ''));
                }
                
                const publicKey = data.publicKey || data.apiKey || FURIAPAY_PUBLIC_KEY;
                const secretKey = data.secretKey || data.apiSecret || FURIAPAY_SECRET_KEY;
                const clientBaseUrl = data.baseUrl || FURIAPAY_BASE_URL;
                
                console.log('📋 [FuriaPay] Dados recebidos do frontend:', {
                    amount: amount,
                    amountType: typeof amount,
                    payer: {
                        name: payer.name,
                        document: payer.document ? (payer.document.substring(0, 5) + '...') : 'VAZIO',
                        email: payer.email || 'VAZIO'
                    }
                });
                
                const targetUrl = clientBaseUrl;
                const requestBody = criarRequisicaoFuriaPay(amount, description || 'Pagamento DAS CNPJ', payer);
                
                // Log da requisição formatada
                console.log('📤 [FuriaPay] Requisição formatada para API:', {
                    amount: requestBody.amount,
                    amountInCents: requestBody.amount,
                    paymentMethod: requestBody.paymentMethod,
                    customer: {
                        name: requestBody.customer.name,
                        documentType: requestBody.customer.document.type,
                        documentNumber: requestBody.customer.document.number ? (requestBody.customer.document.number.substring(0, 5) + '...') : 'VAZIO',
                        email: requestBody.customer.email || 'VAZIO'
                    },
                    itemsCount: requestBody.items ? requestBody.items.length : 0
                });
                const requestData = JSON.stringify(requestBody);
                
                console.log('📱 [FuriaPay] Gerando QR Code PIX:', { 
                    amount, 
                    description, 
                    payer: payer.name,
                    baseUrl: targetUrl,
                    publicKey: publicKey ? publicKey.substring(0, 20) + '...' : 'NAO_CONFIGURADO'
                });
                
                // Verificar se credenciais estão configuradas
                if (!publicKey || !secretKey || publicKey.trim() === '' || secretKey.trim() === '') {
                    throw new Error('Credenciais FuriaPay não configuradas! Configure FURIAPAY_PUBLIC_KEY e FURIAPAY_SECRET_KEY no .env');
                }
                
                let lastError = null;
                let success = false;
                
                for (const endpoint of FURIAPAY_ENDPOINTS) {
                    try {
                        // Log do endpoint sendo tentado
                        console.log(`🔄 [FuriaPay] Tentando endpoint: ${endpoint}`);
                        
                        const targetUrlObj = new URL(targetUrl);
                        const headers = criarHeadersFuriaPay(publicKey || FURIAPAY_PUBLIC_KEY, secretKey || FURIAPAY_SECRET_KEY);
                        headers['Content-Length'] = Buffer.byteLength(requestData);
                        
                        const options = {
                            hostname: targetUrlObj.hostname,
                            port: targetUrlObj.port || (targetUrlObj.protocol === 'https:' ? 443 : 80),
                            path: endpoint,
                            method: 'POST',
                            headers: headers
                        };
                        
                        const result = await new Promise((resolve, reject) => {
                            const proxyReq = https.request(options, (proxyRes) => {
                                let responseData = '';
                                
                                proxyRes.on('data', (chunk) => {
                                    responseData += chunk;
                                });
                                
                                proxyRes.on('end', () => {
                                    if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
                                        try {
                                            const jsonData = JSON.parse(responseData);
                                            resolve({ statusCode: proxyRes.statusCode, data: jsonData, endpoint });
                                        } catch (e) {
                                            resolve({ statusCode: proxyRes.statusCode, data: responseData, endpoint });
                                        }
                                    } else {
                                        reject(new Error(`Status ${proxyRes.statusCode}: ${responseData}`));
                                    }
                                });
                            });
                            
                            proxyReq.on('error', reject);
                            proxyReq.write(requestData);
                            proxyReq.end();
                        });
                        
                        // Normalizar resposta FuriaPay para formato esperado pela tela MEI
                        const responseData = result.data;
                        const paymentId = (responseData && responseData.id) || (responseData && responseData.payment_id) || (responseData && responseData.transaction_id);
                        // QR Code FuriaPay vem em responseData.pix.qrcode conforme documentação
                        const qrCode = (responseData && responseData.pix && responseData.pix.qrcode) || 
                                      (responseData && responseData.qr_code) || 
                                      (responseData && responseData.qrcode) || 
                                      (responseData && responseData.qrCode) || 
                                      (responseData && responseData.pix_code) || 
                                      (responseData && responseData.pixCode);
                        
                        // Formato de resposta compatível com código React
                        const normalizedResponse = {
                            id: paymentId,
                            payment_id: paymentId,
                            transaction_id: paymentId,
                            amount: amount,
                            qrCodeResponse: qrCode ? {
                                qrcode: qrCode
                            } : undefined,
                            qr_code: qrCode,
                            qrcode: qrCode,
                            pix_code: qrCode,
                            pixCode: qrCode,
                            status: (responseData && responseData.status) || 'pending',
                            ...responseData
                        };
                        
                        res.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        res.end(JSON.stringify(normalizedResponse));
                        
                        success = true;
                        break;
                    } catch (error) {
                        lastError = error;
                        continue;
                    }
                }
                
                if (!success) {
                    throw lastError || new Error('Nenhum endpoint funcionou');
                }
                
            } catch (error) {
                console.error('❌ Erro ao criar pagamento PIX:', error);
                
                // Determinar status code apropriado
                let statusCode = 500;
                if (error.message && error.message.includes('Status 405')) {
                    statusCode = 405;
                } else if (error.message && error.message.includes('Status 404')) {
                    statusCode = 404;
                } else if (error.message && error.message.includes('Status 401')) {
                    statusCode = 401;
                } else if (error.message && error.message.includes('Status 400')) {
                    statusCode = 400;
                }
                
                res.writeHead(statusCode, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({
                    success: false,
                    error: error.message || 'Erro desconhecido',
                    details: error.toString(),
                    statusCode: statusCode
                }));
            }
        });
        
        return;
    }
    
    // Rota alternativa para criar pagamento FuriaPay
    if (pathname === '/api/furiapay/payment' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { amount, currency, description, payer, publicKey, secretKey, apiKey, apiSecret, baseUrl: clientBaseUrl, paymentMethod } = data;
                const furiaPublicKey = publicKey || apiKey || FURIAPAY_PUBLIC_KEY;
                const furiaSecretKey = secretKey || apiSecret || FURIAPAY_SECRET_KEY;
                
                const targetUrl = clientBaseUrl || FURIAPAY_BASE_URL;
                const requestBody = criarRequisicaoFuriaPay(amount, description || 'Pagamento DAS CNPJ', payer || {});
                const requestData = JSON.stringify(requestBody);
                
                let lastError = null;
                let success = false;
                
                for (const endpoint of FURIAPAY_ENDPOINTS) {
                    try {
                        const targetUrlObj = new URL(targetUrl);
                        const headers = criarHeadersFuriaPay(publicKey || FURIAPAY_PUBLIC_KEY, secretKey || FURIAPAY_SECRET_KEY);
                        headers['Content-Length'] = Buffer.byteLength(requestData);
                        
                        const options = {
                            hostname: targetUrlObj.hostname,
                            port: targetUrlObj.port || (targetUrlObj.protocol === 'https:' ? 443 : 80),
                            path: endpoint,
                            method: 'POST',
                            headers: headers
                        };
                        
                        const result = await new Promise((resolve, reject) => {
                            const proxyReq = https.request(options, (proxyRes) => {
                                let responseData = '';
                                
                                proxyRes.on('data', (chunk) => {
                                    responseData += chunk;
                                });
                                
                                proxyRes.on('end', () => {
                                    if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
                                        try {
                                            const jsonData = JSON.parse(responseData);
                                            resolve({ statusCode: proxyRes.statusCode, data: jsonData, endpoint });
                                        } catch (e) {
                                            resolve({ statusCode: proxyRes.statusCode, data: responseData, endpoint });
                                        }
                                    } else {
                                        reject(new Error(`Status ${proxyRes.statusCode}: ${responseData}`));
                                    }
                                });
                            });
                            
                            proxyReq.on('error', reject);
                            proxyReq.write(requestData);
                            proxyReq.end();
                        });
                        
                        // Normalizar resposta FuriaPay para formato esperado pela tela MEI
                        const responseData = result.data;
                        const paymentId = (responseData && responseData.id) || (responseData && responseData.payment_id) || (responseData && responseData.transaction_id);
                        // QR Code FuriaPay vem em responseData.pix.qrcode conforme documentação
                        const qrCode = (responseData && responseData.pix && responseData.pix.qrcode) || 
                                      (responseData && responseData.qr_code) || 
                                      (responseData && responseData.qrcode) || 
                                      (responseData && responseData.qrCode) || 
                                      (responseData && responseData.pix_code) || 
                                      (responseData && responseData.pixCode);
                        
                        // Formato de resposta compatível com código React
                        const normalizedResponse = {
                            id: paymentId,
                            payment_id: paymentId,
                            transaction_id: paymentId,
                            amount: amount,
                            qrCodeResponse: qrCode ? {
                                qrcode: qrCode
                            } : undefined,
                            qr_code: qrCode,
                            qrcode: qrCode,
                            pix_code: qrCode,
                            pixCode: qrCode,
                            status: (responseData && responseData.status) || 'pending',
                            ...responseData
                        };
                        
                        res.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        res.end(JSON.stringify(normalizedResponse));
                        
                        success = true;
                        break;
                    } catch (error) {
                        lastError = error;
                        continue;
                    }
                }
                
                if (!success) {
                    throw lastError || new Error('Nenhum endpoint funcionou');
                }
                
            } catch (error) {
                res.writeHead(500, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({
                    success: false,
                    error: error.message
                }));
            }
        });
        
        return;
    }
    
    // Rota para verificar status
    if (pathname.startsWith('/api/furiapay/status/') && req.method === 'GET') {
        const paymentId = pathname.split('/').pop();
        const publicKey = queryParams.publicKey || queryParams.apiKey || FURIAPAY_PUBLIC_KEY;
        const secretKey = queryParams.secretKey || queryParams.apiSecret || FURIAPAY_SECRET_KEY;
        const baseUrl = queryParams.baseUrl || FURIAPAY_BASE_URL;
        
        const targetUrl = baseUrl;
        const endpoint = `/transactions/${paymentId}`;  // GET /transactions/{id} conforme documentação
        
        const targetUrlObj = new URL(targetUrl);
        const headers = criarHeadersFuriaPay(publicKey, secretKey);
        const options = {
            hostname: targetUrlObj.hostname,
            port: targetUrlObj.port || (targetUrlObj.protocol === 'https:' ? 443 : 80),
            path: endpoint,
            method: 'GET',
            headers: headers
        };
        
        const proxyReq = https.request(options, (proxyRes) => {
            let responseData = '';
            
            proxyRes.on('data', (chunk) => {
                responseData += chunk;
            });
            
            proxyRes.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    res.writeHead(proxyRes.statusCode, {
                        'Content-Type': 'application/json'
                    });
                    res.end(JSON.stringify({
                        success: true,
                        data: jsonData
                    }));
                } catch (e) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    res.end(JSON.stringify({
                        success: true,
                        data: responseData
                    }));
                }
            });
        });
        
        proxyReq.on('error', (error) => {
            res.writeHead(500, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        });
        
        proxyReq.end();
        return;
    }
    
    // ============================================
    // SERVER ARQUIVOS ESTÁTICOS DA APLICAÇÃO MEI
    // ============================================
    
    // Se não for uma rota de API, servir arquivos estáticos
    let filePath = path.join(distDir, pathname === '/' ? 'index.html' : pathname);
    
    // Verificar se o arquivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Arquivo não encontrado - SPA fallback: servir index.html
            fs.readFile(path.join(distDir, 'index.html'), (error, content) => {
                if (error) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 - Arquivo não encontrado');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                }
            });
        } else {
            // Arquivo existe - servir normalmente
            const extname = String(path.extname(filePath)).toLowerCase();
            const contentType = mimeTypes[extname] || 'application/octet-stream';
            
            fs.readFile(filePath, (error, content) => {
                if (error) {
                    res.writeHead(500);
                    res.end('Erro ao ler arquivo: ' + error.code);
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor MEI + Gateway FuriaPay rodando em http://localhost:${PORT}`);
    console.log(`📡 Endpoints FuriaPay:`);
    console.log(`   POST http://localhost:${PORT}/api/payments/deposit - Intercepta e converte para FuriaPay`);
    console.log(`   POST http://localhost:${PORT}/api/pix - Gerar QR Code PIX (direto)`);
    console.log(`   POST http://localhost:${PORT}/api/payment - Gerar QR Code PIX (alternativa)`);
    console.log(`   POST http://localhost:${PORT}/api/furiapay/pix - Gerar QR Code PIX (alternativa)`);
    console.log(`   POST http://localhost:${PORT}/api/furiapay/payment - Gerar QR Code PIX (alternativa)`);
    console.log(`   GET  http://localhost:${PORT}/api/furiapay/status/:id - Verificar status`);
    console.log(`\n🌐 Aplicação MEI disponível em: http://localhost:${PORT}`);
    console.log(`\n✅ Gateway FuriaPay configurado!`);
    console.log(`🔄 Interceptação ativa!`);
    console.log(`⚠️  Configure FURIAPAY_PUBLIC_KEY e FURIAPAY_SECRET_KEY no .env`);
    console.log(`    (ou FURIAPAY_API_KEY e FURIAPAY_API_SECRET para compatibilidade)`);
});
