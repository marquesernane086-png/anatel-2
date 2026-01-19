/**
 * Script para interceptar chamadas de API e redirecionar para gateway configurado
 * Suporta FuriaPay e PagLoop
 * DEVE SER CARREGADO ANTES DO CÓDIGO REACT
 */

(function() {
    'use strict';

    console.log('🔄 [Interceptador] Carregando interceptador de gateway...');

    // Usar a mesma porta do servidor (3001) - servidor combinado CNPJ + Gateway
    const PROXY_URL = window.location.origin; // Usa a mesma origem (localhost:3001)
    const FURIAPAY_BASE_URL = 'https://app.furiapaybr.com';
    const PAGLOOP_BASE_URL = 'https://api.pagloop.tech';
    
    // Obter gateway atual
    function getCurrentGateway() {
        return localStorage.getItem('payment_provider') || 'furiapay';
    }
    
    console.log('🔄 [Interceptador] Configurado para usar:', PROXY_URL);
    console.log('🔄 [Interceptador] Gateway atual:', getCurrentGateway());

    // Função para converter dados para FuriaPay
    function converterParaFuriaPay(data) {
        return {
            amount: data.amount || data.value || 161.80,
            currency: 'BRL',
            description: data.description || 'Pagamento DAS CNPJ',
            paymentMethod: 'pix',
            payer: {
                name: data.payer?.name || data.nome || 'Empreendedor CNPJ',
                document: data.payer?.document || data.cnpj?.replace(/\D/g, '') || data.document?.replace(/\D/g, '') || '',
                email: data.payer?.email || data.email || ''
            },
            apiKey: localStorage.getItem('furiapay_api_key') || '',
            baseUrl: FURIAPAY_BASE_URL
        };
    }

    // Interceptar fetch - DEVE SER FEITO IMEDIATAMENTE
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // Verificar se é uma chamada que precisa ser convertida para FuriaPay
        let urlString = typeof url === 'string' ? url : (url?.url || url?.href || String(url) || '');
        
        // Verificar TODAS as possíveis referências à PagLoop
        const isPagLoopCall = urlString.includes('/api/payments/deposit') || 
                             urlString.includes('api.pagloop.tech') ||
                             urlString.includes('pagloop.tech') ||
                             urlString.toLowerCase().includes('pagloop') ||
                             (urlString.match(/https?:\/\/[^\/]*pagloop/i));
        
        if (isPagLoopCall) {
            console.log('🔄 [Interceptador] BLOQUEANDO chamada PagLoop (fetch):', urlString);
            
            // FORÇAR conversão para FuriaPay - BLOQUEAR PagLoop completamente
            let newUrl = `${PROXY_URL}/api/payments/deposit`;
            let newOptions = { ...options };
            
        // Se gateway é FuriaPay e chamada é PagLoop, converter
        const gateway = getCurrentGateway();
        if (gateway === 'furiapay' && isPagLoopCall) {
            // Redirecionar para rota que o servidor intercepta e converte para FuriaPay
            newUrl = `${PROXY_URL}/api/payments/deposit`;
            
            console.log('🔄 [Interceptador] Convertendo PagLoop -> FuriaPay:', urlString, '->', newUrl);
            
            // Ajustar body se existir
            if (options.body) {
                try {
                    const bodyData = typeof options.body === 'string' 
                        ? JSON.parse(options.body) 
                        : options.body;
                    
                    // Converter formato antigo para FuriaPay
                    const furiapayData = converterParaFuriaPay(bodyData);
                    
                    newOptions.body = JSON.stringify(furiapayData);
                    newOptions.headers = {
                        ...newOptions.headers,
                        'Content-Type': 'application/json'
                    };
                } catch (e) {
                    console.error('Erro ao converter body:', e);
                }
            }
        } else if (gateway === 'furiapay' && url.includes('/api/payments/') && url.match(/\/api\/payments\/([^\/]+)/)) {
            // Verificar status - redirecionar para proxy FuriaPay
            const paymentId = url.match(/\/api/payments\/([^\/]+)/)[1];
            newUrl = `${PROXY_URL}/api/furiapay/status/${paymentId}?apiKey=${localStorage.getItem('furiapay_api_key') || ''}&baseUrl=${FURIAPAY_BASE_URL}`;
        } else if (gateway === 'pagloop' && isPagLoopCall) {
            // Gateway é PagLoop e chamada é PagLoop - permitir chamada direta ou via proxy
            console.log(`✅ [Interceptador] Gateway PagLoop ativo - permitindo chamada direta`);
            // Não alterar URL - deixar chamada PagLoop passar normalmente
            newUrl = url;
        }
            
            console.log('✅ [Interceptador] Redirecionando para:', newUrl);
                // Fazer requisição interceptada
                return originalFetch(newUrl, newOptions)
                .then(response => {
                    // Ajustar resposta se necessário
                    if (response.ok) {
                        return response.clone().json().then(data => {
                            // Normalizar resposta FuriaPay para formato esperado
                            // QR Code FuriaPay vem em data.pix.qrcode conforme documentação
                            const qrCode = data?.pix?.qrcode || 
                                          data?.data?.qr_code || 
                                          data?.qr_code || 
                                          data?.qrcode || 
                                          data?.qrCode || 
                                          data?.pixCode ||
                                          data?.data?.qrcode;
                            
                            const normalizedData = {
                                ...data,
                                id: data.id || data.data?.id || data.paymentId || data.payment_id,
                                payment_id: data.id || data.data?.id || data.paymentId || data.payment_id,
                                qrCodeResponse: qrCode ? {
                                    qrcode: qrCode
                                } : undefined,
                                qr_code: qrCode,
                                qrcode: qrCode,
                                pix_code: qrCode,
                                pixCode: qrCode
                            };
                            
                            return new Response(JSON.stringify(normalizedData), {
                                status: response.status,
                                statusText: response.statusText,
                                headers: response.headers
                            });
                        }).catch(() => response);
                    }
                    return response;
                });
            } else {
                // Gateway PagLoop - deixar passar normalmente
                return originalFetch(url, options);
            }
        }
        
        // Chamada normal (não precisa conversão)
        return originalFetch(url, options);
    };

    // Interceptar axios - interceptar TODAS as instâncias possíveis
    function interceptarAxios(axiosInstance, nome = 'axios') {
        if (!axiosInstance || !axiosInstance.interceptors) {
            console.warn(`⚠️ [Interceptador] ${nome} não tem interceptors`);
            return;
        }

        if (axiosInstance.__furiapay_interceptado) {
            return; // Já foi interceptado
        }

        console.log(`✅ [Interceptador] Interceptando ${nome}...`);
        
        // Interceptar requisições
        axiosInstance.interceptors.request.use(
            config => {
                const url = config.url || '';
                const gateway = getCurrentGateway();
                
                // Verificar se é chamada PagLoop
                const isPagLoopCall = url.includes('/api/payments/deposit') || 
                                     url.includes('api.pagloop.tech') ||
                                     url.includes('pagloop.tech') ||
                                     url.toLowerCase().includes('pagloop') ||
                                     (url.match(/https?:\/\/[^\/]*pagloop/i));
                
                // Se gateway é FuriaPay e chamada é PagLoop, converter
                if (isPagLoopCall && gateway === 'furiapay') {
                    console.log(`🔄 [Interceptador] Convertendo PagLoop para FuriaPay (${nome}):`, url);
                    
                    // Converter para FuriaPay via servidor local
                    config.url = `${PROXY_URL}/api/payments/deposit`;
                        console.log('🔄 [Interceptador] Convertendo para FuriaPay (axios):', url, '->', config.url);
                        
                        // Converter dados
                        if (config.data) {
                            config.data = converterParaFuriaPay(config.data);
                        }
                    } else if (url.includes('/api/payments/')) {
                        const paymentId = url.match(/\/api\/payments\/([^\/]+)/)?.[1];
                        if (paymentId) {
                            config.url = `${PROXY_URL}/api/furiapay/status/${paymentId}?apiKey=${localStorage.getItem('furiapay_api_key') || ''}&baseUrl=${FURIAPAY_BASE_URL}`;
                        }
                    }
                    
                    console.log(`✅ [Interceptador] URL interceptada (${nome}):`, config.url);
                }
                
                return config;
            },
            error => Promise.reject(error)
        );

        // Marcar como interceptado
        axiosInstance.__furiapay_interceptado = true;
        
        // Adicionar interceptor de resposta
        adicionarInterceptorResposta(axiosInstance, nome);
    }

    // Interceptar axios imediatamente se já estiver disponível
    if (window.axios) {
        interceptarAxios(window.axios, 'window.axios');
    }
    if (window.Ce) {
        interceptarAxios(window.Ce, 'window.Ce');
    }

    // Interceptar axios quando for carregado (usando Object.defineProperty)
    const originalAxios = window.axios;
    Object.defineProperty(window, 'axios', {
        get: function() {
            return originalAxios;
        },
        set: function(newAxios) {
            interceptarAxios(newAxios, 'axios (novo)');
            Object.defineProperty(window, 'axios', {
                value: newAxios,
                writable: true,
                configurable: true
            });
        },
        configurable: true
    });

    // Interceptar métodos axios diretamente se disponível
    if (window.axios) {
        const originalPost = window.axios.post;
        const originalGet = window.axios.get;
        
        if (originalPost) {
            window.axios.post = function(url, data, config) {
                const urlString = typeof url === 'string' ? url : String(url || '');
                const isPagLoopCall = urlString.includes('/api/payments/deposit') || 
                                     urlString.includes('api.pagloop.tech') ||
                                     urlString.includes('pagloop.tech') ||
                                     urlString.toLowerCase().includes('pagloop') ||
                                     (urlString.match(/https?:\/\/[^\/]*pagloop/i));
                
                if (isPagLoopCall) {
                    console.log('🔄 [Interceptador] Convertendo axios.post para FuriaPay:', url);
                    const originalUrl = url;
                    url = `${PROXY_URL}/api/payments/deposit`;
                    
                    // Converter dados se necessário
                    if (data && typeof data === 'object') {
                        data = converterParaFuriaPay(data);
                    }
                    
                    console.log('✅ [Interceptador] Redirecionando:', originalUrl, '->', url);
                }
                return originalPost.call(this, url, data, config);
            };
        }
        
        if (originalGet) {
            window.axios.get = function(url, config) {
                if (typeof url === 'string' && url.includes('api.pagloop.tech')) {
                    console.log('🔄 [Interceptador] Convertendo axios.get para FuriaPay:', url);
                    if (url.includes('/api/payments/')) {
                        const paymentId = url.match(/\/api\/payments\/([^\/]+)/)?.[1];
                        if (paymentId) {
                            url = `${PROXY_URL}/api/furiapay/status/${paymentId}?apiKey=${localStorage.getItem('furiapay_api_key') || ''}&baseUrl=${FURIAPAY_BASE_URL}`;
                        }
                    }
                }
                return originalGet.call(this, url, config);
            };
        }
    }

    // Função para adicionar interceptor de resposta
    function adicionarInterceptorResposta(axiosInstance, nome = 'axios') {
        if (!axiosInstance || !axiosInstance.interceptors) return;
        
        axiosInstance.interceptors.response.use(
            response => {
                if (response.config?.url && (response.config.url.includes('furiapay') || response.config.url.includes('payments/deposit'))) {
                    // Normalizar resposta FuriaPay para formato esperado
                    // QR Code FuriaPay vem em data.pix.qrcode conforme documentação
                    if (response.data) {
                        const data = response.data.data || response.data;
                        const qrCode = data?.pix?.qrcode || 
                                      data?.qr_code || 
                                      data?.qrcode || 
                                      data?.qrCode || 
                                      data?.pixCode;
                        
                        response.data = {
                            ...data,
                            id: data.id || data.paymentId || data.payment_id,
                            payment_id: data.id || data.paymentId || data.payment_id,
                            qrCodeResponse: qrCode ? {
                                qrcode: qrCode
                            } : undefined,
                            qr_code: qrCode,
                            qrcode: qrCode,
                            pix_code: qrCode,
                            pixCode: qrCode
                        };
                    }
                }
                return response;
            },
            error => Promise.reject(error)
        );
    }

    // Aguardar axios ser carregado e interceptar novamente
    let tentativas = 0;
    const verificarAxios = setInterval(() => {
        tentativas++;
        if (window.axios && !window.axios.__furiapay_interceptado) {
            interceptarAxios(window.axios, 'axios (tardio)');
            window.axios.__furiapay_interceptado = true;
        }
        if (window.Ce && !window.Ce.__furiapay_interceptado) {
            interceptarAxios(window.Ce, 'Ce (tardio)');
            window.Ce.__furiapay_interceptado = true;
        }
        if (tentativas > 50) { // 5 segundos
            clearInterval(verificarAxios);
        }
    }, 100);

    console.log('✅ [Interceptador] Interceptador de API FuriaPay carregado');
    console.log('🔄 [Interceptador] Monitorando carregamento de axios...');
})();
