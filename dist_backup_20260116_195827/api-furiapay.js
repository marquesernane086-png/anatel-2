/**
 * Cliente API FuriaPay para uso direto na aplicação CNPJ
 * Cliente direto para API FuriaPay
 */

(function() {
    'use strict';

    // Configuração
    const API_BASE_URL = window.location.origin; // Usa a mesma origem (localhost:3001)
    const PIX_ENDPOINT = '/api/pix'; // Endpoint principal para gerar PIX

    /**
     * Gerar QR Code PIX via FuriaPay
     * @param {Object} paymentData - Dados do pagamento
     * @param {number} paymentData.amount - Valor do pagamento
     * @param {string} paymentData.description - Descrição do pagamento
     * @param {Object} paymentData.payer - Dados do pagador
     * @param {string} paymentData.payer.name - Nome do pagador
     * @param {string} paymentData.payer.document - CNPJ/CPF do pagador
     * @param {string} paymentData.payer.email - Email do pagador
     * @returns {Promise} Resposta com QR Code e dados do pagamento
     */
    window.gerarPixFuriaPay = async function(paymentData) {
        try {
            console.log('📱 [FuriaPay] Gerando QR Code PIX...', paymentData);

            const response = await fetch(`${API_BASE_URL}${PIX_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: paymentData.amount || 161.80,
                    currency: 'BRL',
                    description: paymentData.description || 'Pagamento DAS CNPJ',
                    payer: {
                        name: paymentData.payer?.name || paymentData.nome || 'Empreendedor CNPJ',
                        document: (paymentData.payer?.document || paymentData.cnpj || '').replace(/\D/g, ''),
                        email: paymentData.payer?.email || paymentData.email || ''
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            console.log('✅ [FuriaPay] QR Code PIX gerado com sucesso:', data);

            // Normalizar resposta FuriaPay para formato esperado
            // QR Code FuriaPay vem em data.pix.qrcode conforme documentação
            const qrCode = data?.pix?.qrcode || 
                          data?.qr_code || 
                          data?.qrcode || 
                          data?.pix_code || 
                          data?.pixCode ||
                          data?.qrCodeResponse?.qrcode;
            
            return {
                id: data.id || data.payment_id || data.transaction_id,
                payment_id: data.id || data.payment_id,
                amount: data.amount || paymentData.amount,
                qrCodeResponse: qrCode ? {
                    qrcode: qrCode
                } : undefined,
                qr_code: qrCode,
                qrcode: qrCode,
                pix_code: qrCode,
                pixCode: qrCode,
                status: data.status || 'waiting_payment',
                ...data
            };

        } catch (error) {
            console.error('❌ [FuriaPay] Erro ao gerar QR Code PIX:', error);
            throw error;
        }
    };

    // Se axios estiver disponível, também expor método para axios
    if (window.axios) {
        window.axios.gerarPixFuriaPay = async function(paymentData) {
            try {
                console.log('📱 [FuriaPay] Gerando QR Code PIX via axios...', paymentData);

                const response = await window.axios.post(`${API_BASE_URL}${PIX_ENDPOINT}`, {
                    amount: paymentData.amount || 161.80,
                    currency: 'BRL',
                    description: paymentData.description || 'Pagamento DAS CNPJ',
                    payer: {
                        name: paymentData.payer?.name || paymentData.nome || 'Empreendedor CNPJ',
                        document: (paymentData.payer?.document || paymentData.cnpj || '').replace(/\D/g, ''),
                        email: paymentData.payer?.email || paymentData.email || ''
                    }
                });

                const data = response.data;
                
                console.log('✅ [FuriaPay] QR Code PIX gerado com sucesso:', data);

                // QR Code FuriaPay vem em data.pix.qrcode conforme documentação
                const qrCode = data?.pix?.qrcode || 
                              data?.qr_code || 
                              data?.qrcode || 
                              data?.pix_code || 
                              data?.pixCode ||
                              data?.qrCodeResponse?.qrcode;

                return {
                    id: data.id || data.payment_id || data.transaction_id,
                    payment_id: data.id || data.payment_id,
                    amount: data.amount || paymentData.amount,
                    qrCodeResponse: qrCode ? {
                        qrcode: qrCode
                    } : undefined,
                    qr_code: qrCode,
                    qrcode: qrCode,
                    pix_code: qrCode,
                    pixCode: qrCode,
                    status: data.status || 'waiting_payment',
                    ...data
                };

            } catch (error) {
                console.error('❌ [FuriaPay] Erro ao gerar QR Code PIX:', error);
                throw error;
            }
        };
    }

    console.log('✅ [FuriaPay] Cliente API carregado - Use window.gerarPixFuriaPay() para gerar PIX');
})();
