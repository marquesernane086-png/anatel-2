/**
 * Script para monitorar confirmação de pagamento FuriaPay
 * Conforme documentação: furiapay-documentacao.txt
 */

(function() {
    'use strict';

    const API_PROVIDER = 'furiapay';
    const FURIAPAY_BASE_URL = 'https://api.furiapaybr.com/v1'; // Base URL conforme documentação
    const PROXY_URL = window.location.origin; // Servidor local na porta 3001

    // Função para redirecionar para página de confirmação
    function redirecionarParaConfirmacao(paymentData) {
        try {
            const dados = {
                amount: paymentData.amount || paymentData.value || 161.80,
                date: new Date().toISOString(),
                status: 'confirmado'
            };
            
            localStorage.setItem('lastPayment', JSON.stringify(dados));
            
            const params = new URLSearchParams({
                amount: dados.amount.toString(),
                status: 'confirmed'
            });
            
            window.location.href = `/pagamento-confirmado.html?${params.toString()}`;
        } catch (error) {
            console.error('Erro ao redirecionar para confirmação:', error);
        }
    }

    // Função para verificar status do pagamento via FuriaPay
    async function verificarStatusFuriaPay(paymentId, maxAttempts = 120) {
        if (!paymentId) {
            console.warn('ID do pagamento não fornecido');
            return;
        }
        
        let attempts = 0;
        let intervaloId = null;
        
        const checkStatus = async () => {
            if (attempts >= maxAttempts) {
                console.log('⏱️ Tempo máximo de monitoramento atingido');
                if (intervaloId) clearInterval(intervaloId);
                return;
            }
            
            attempts++;
            console.log(`🔍 [FuriaPay] Verificando status do pagamento ${paymentId} (tentativa ${attempts}/${maxAttempts})...`);
            
            const axiosInstance = window.axios || window.Ce;
            
            if (axiosInstance && paymentId) {
                try {
                    // Usar endpoint correto conforme documentação: GET /transactions/{id}
                    const endpoints = [
                        `${PROXY_URL}/api/furiapay/status/${paymentId}`,  // Via servidor local (porta 3001)
                        `${FURIAPAY_BASE_URL}/transactions/${paymentId}`  // Direto na API FuriaPay (pode dar CORS)
                    ];
                    
                    let response = null;
                    let successfulEndpoint = null;
                    
                    // Headers - autenticação será feita pelo servidor local
                    const headers = {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    };
                    
                    // Tentar cada endpoint
                    for (const endpoint of endpoints) {
                        try {
                            console.log(`📡 [FuriaPay] Tentando: ${endpoint}`);
                            response = await axiosInstance.get(endpoint, { headers });
                            
                            if (response && response.data) {
                                successfulEndpoint = endpoint;
                                console.log(`✅ [FuriaPay] Resposta recebida: ${endpoint}`);
                                console.log('📋 [FuriaPay] Dados:', JSON.stringify(response.data, null, 2));
                                break;
                            }
                        } catch (error) {
                            if (error.response && error.response.status !== 404) {
                                console.log(`❌ [FuriaPay] Endpoint ${endpoint} erro ${error.response?.status}`);
                            }
                            continue;
                        }
                    }
                    
                    if (response && response.data) {
                        const data = response.data.data || response.data;
                        
                        // Verificar status conforme documentação FuriaPay
                        // Status possíveis: waiting_payment, paid, approved, refused, cancelled
                        const status = data?.status || 
                                     data?.payment_status || 
                                     data?.state || 
                                     data?.transaction_status;
                        
                        const amount = data?.amount || 
                                     data?.paidAmount ||
                                     data?.value || 
                                     1;
                        
                        console.log(`📊 [FuriaPay] Status: "${status}" | Valor: R$ ${(amount / 100).toFixed(2)}`);
                        
                        // Status completos conforme documentação FuriaPay (paid, approved)
                        const statusCompletos = [
                            'paid', 'pago',
                            'approved', 'aproved',
                            'completed', 'complete',
                            'confirmed', 'confirmado',
                            'success', 'sucesso',
                            'settled', 'liquidado'
                        ];
                        
                        const statusNormalizado = String(status || '').toLowerCase().trim();
                        const pagamentoCompleto = statusCompletos.some(s => 
                            statusNormalizado.includes(s.toLowerCase()) || 
                            statusNormalizado === s.toLowerCase()
                        );
                        
                        if (pagamentoCompleto) {
                            console.log('✅✅✅ [FuriaPay] PAGAMENTO COMPLETO! Redirecionando...');
                            
                            if (intervaloId) clearInterval(intervaloId);
                            
                            localStorage.setItem('pagamento_status', 'completo');
                            
                            redirecionarParaConfirmacao({
                                id: paymentId,
                                amount: amount,
                                status: status
                            });
                            
                            return;
                        } else {
                            console.log(`⏳ [FuriaPay] Status: "${status}". Verificando novamente em 2s...`);
                        }
                    } else {
                        console.log('⚠️ [FuriaPay] Nenhuma resposta válida recebida');
                    }
                } catch (error) {
                    console.log('❌ [FuriaPay] Erro ao verificar:', error.message);
                }
            }
        };
        
        console.log(`🚀 [FuriaPay] Iniciando monitoramento do pagamento ${paymentId}...`);
        const intervaloId = setInterval(checkStatus, 2000); // Verificar a cada 2 segundos
        checkStatus(); // Verificar imediatamente
        
        window._furiapayMonitorInterval = intervaloId;
    }

    // Interceptar chamadas da API FuriaPay
    const interceptarAPIFuriaPay = () => {
        const axiosInstance = window.axios || window.Ce;
        
        if (axiosInstance && axiosInstance.interceptors) {
            axiosInstance.interceptors.response.use(
                response => {
                    if (response && response.config && response.config.url) {
                        const url = response.config.url;
                        const data = response.data;
                        
                        // Verificar se é resposta da FuriaPay
                        if (url.includes('furiapay') || url.includes('transactions')) {
                            console.log('🔵 [FuriaPay] Resposta detectada:', url, data);
                            
                            // Verificar se pagamento foi completado
                            const status = data?.status || data?.data?.status;
                            const statusCompletos = ['paid', 'approved', 'completed'];
                            const statusNormalizado = String(status || '').toLowerCase().trim();
                            
                            if (statusCompletos.some(s => statusNormalizado.includes(s.toLowerCase()))) {
                                console.log('✅✅✅ [FuriaPay] Pagamento completo detectado na resposta!');
                                
                                const paymentId = data?.id || 
                                                data?.data?.id || 
                                                data?.transaction_id ||
                                                localStorage.getItem('furiapay_payment_id');
                                
                                if (paymentId) {
                                    localStorage.setItem('furiapay_payment_id', paymentId);
                                    localStorage.setItem('pagamento_status', 'completo');
                                    redirecionarParaConfirmacao({
                                        id: paymentId,
                                        amount: data?.amount || data?.data?.amount,
                                        status: status
                                    });
                                }
                            }
                            
                            // Salvar ID do pagamento se presente
                            const paymentId = data?.id || 
                                            data?.data?.id || 
                                            data?.transaction_id ||
                                            data?.payment_id;
                            
                            if (paymentId) {
                                localStorage.setItem('furiapay_payment_id', paymentId);
                                console.log('📝 [FuriaPay] ID do pagamento salvo:', paymentId);
                                
                                // Iniciar monitoramento se não estiver monitorando
                                if (!window._furiapayMonitorInterval) {
                                    verificarStatusFuriaPay(paymentId);
                                }
                            }
                        }
                    }
                    
                    return response;
                },
                error => Promise.reject(error)
            );
        }
    };

    // Inicializar interceptação quando axios estiver disponível
    if (window.axios || window.Ce) {
        interceptarAPIFuriaPay();
    } else {
        // Aguardar axios carregar
        const checkAxios = setInterval(() => {
            if (window.axios || window.Ce) {
                interceptarAPIFuriaPay();
                clearInterval(checkAxios);
            }
        }, 100);
    }

    // Verificar se há pagamento já confirmado ao carregar a página
    const paymentId = localStorage.getItem('furiapay_payment_id');
    if (paymentId) {
        console.log('🔍 [FuriaPay] Verificando pagamento salvo:', paymentId);
        setTimeout(() => {
            verificarStatusFuriaPay(paymentId);
        }, 1000);
    }

    // Expor função globalmente para uso manual
    window.verificarStatusFuriaPay = verificarStatusFuriaPay;

    console.log('✅ [FuriaPay] Script de monitoramento carregado');
})();
