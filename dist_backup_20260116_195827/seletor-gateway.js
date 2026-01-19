/**
 * Seletor de Gateway de Pagamento
 * Permite alternar entre FuriaPay e PagLoop
 */

(function() {
    'use strict';

    // Verificar gateway atual do localStorage
    const gatewayAtual = localStorage.getItem('payment_provider') || 'furiapay';

    // Função para criar o seletor visual
    function criarSeletorGateway() {
        // Criar container do seletor
        const container = document.createElement('div');
        container.id = 'gateway-selector';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: 2px solid #e0e0e0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // Título
        const titulo = document.createElement('div');
        titulo.textContent = 'Gateway de Pagamento';
        titulo.style.cssText = 'font-weight: bold; margin-bottom: 10px; color: #333; font-size: 14px;';

        // Container dos botões
        const botoesContainer = document.createElement('div');
        botoesContainer.style.cssText = 'display: flex; gap: 8px;';

        // Botão FuriaPay
        const btnFuriaPay = document.createElement('button');
        btnFuriaPay.textContent = 'FuriaPay';
        btnFuriaPay.id = 'btn-furiapay';
        btnFuriaPay.style.cssText = `
            padding: 8px 16px;
            border: 2px solid ${gatewayAtual === 'furiapay' ? '#28a745' : '#ccc'};
            background: ${gatewayAtual === 'furiapay' ? '#28a745' : 'white'};
            color: ${gatewayAtual === 'furiapay' ? 'white' : '#333'};
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: ${gatewayAtual === 'furiapay' ? 'bold' : 'normal'};
            transition: all 0.3s;
        `;

        // Botão PagLoop
        const btnPagLoop = document.createElement('button');
        btnPagLoop.textContent = 'PagLoop';
        btnPagLoop.id = 'btn-pagloop';
        btnPagLoop.style.cssText = `
            padding: 8px 16px;
            border: 2px solid ${gatewayAtual === 'pagloop' ? '#007bff' : '#ccc'};
            background: ${gatewayAtual === 'pagloop' ? '#007bff' : 'white'};
            color: ${gatewayAtual === 'pagloop' ? 'white' : '#333'};
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: ${gatewayAtual === 'pagloop' ? 'bold' : 'normal'};
            transition: all 0.3s;
        `;

        // Indicador de status
        const status = document.createElement('div');
        status.id = 'gateway-status';
        status.textContent = `Ativo: ${gatewayAtual === 'furiapay' ? 'FuriaPay' : 'PagLoop'}`;
        status.style.cssText = 'margin-top: 10px; font-size: 12px; color: #666; text-align: center;';

        // Event listeners
        btnFuriaPay.addEventListener('click', () => {
            alternarGateway('furiapay');
            atualizarVisual(btnFuriaPay, btnPagLoop, status, 'furiapay');
        });

        btnPagLoop.addEventListener('click', () => {
            alternarGateway('pagloop');
            atualizarVisual(btnFuriaPay, btnPagLoop, status, 'pagloop');
        });

        // Hover effects
        btnFuriaPay.addEventListener('mouseenter', function() {
            if (gatewayAtual !== 'furiapay') {
                this.style.background = '#f0f0f0';
            }
        });
        btnFuriaPay.addEventListener('mouseleave', function() {
            if (gatewayAtual !== 'furiapay') {
                this.style.background = 'white';
            }
        });

        btnPagLoop.addEventListener('mouseenter', function() {
            if (gatewayAtual !== 'pagloop') {
                this.style.background = '#f0f0f0';
            }
        });
        btnPagLoop.addEventListener('mouseleave', function() {
            if (gatewayAtual !== 'pagloop') {
                this.style.background = 'white';
            }
        });

        // Montar estrutura
        botoesContainer.appendChild(btnFuriaPay);
        botoesContainer.appendChild(btnPagLoop);
        container.appendChild(titulo);
        container.appendChild(botoesContainer);
        container.appendChild(status);

        return container;
    }

    // Função para atualizar visual dos botões
    function atualizarVisual(btnFuriaPay, btnPagLoop, status, gateway) {
        if (gateway === 'furiapay') {
            btnFuriaPay.style.border = '2px solid #28a745';
            btnFuriaPay.style.background = '#28a745';
            btnFuriaPay.style.color = 'white';
            btnFuriaPay.style.fontWeight = 'bold';
            
            btnPagLoop.style.border = '2px solid #ccc';
            btnPagLoop.style.background = 'white';
            btnPagLoop.style.color = '#333';
            btnPagLoop.style.fontWeight = 'normal';
        } else {
            btnFuriaPay.style.border = '2px solid #ccc';
            btnFuriaPay.style.background = 'white';
            btnFuriaPay.style.color = '#333';
            btnFuriaPay.style.fontWeight = 'normal';
            
            btnPagLoop.style.border = '2px solid #007bff';
            btnPagLoop.style.background = '#007bff';
            btnPagLoop.style.color = 'white';
            btnPagLoop.style.fontWeight = 'bold';
        }
        
        status.textContent = `Ativo: ${gateway === 'furiapay' ? 'FuriaPay' : 'PagLoop'}`;
        status.style.color = gateway === 'furiapay' ? '#28a745' : '#007bff';
    }

    // Função para alternar gateway
    function alternarGateway(gateway) {
        localStorage.setItem('payment_provider', gateway);
        console.log(`🔄 [Gateway] Alternado para: ${gateway}`);
        
        // Disparar evento customizado para outros scripts
        window.dispatchEvent(new CustomEvent('gateway-changed', {
            detail: { gateway: gateway }
        }));

        // Mostrar notificação
        mostrarNotificacao(`Gateway alterado para: ${gateway === 'furiapay' ? 'FuriaPay' : 'PagLoop'}`);
    }

    // Função para mostrar notificação
    function mostrarNotificacao(mensagem) {
        const notificacao = document.createElement('div');
        notificacao.textContent = mensagem;
        notificacao.style.cssText = `
            position: fixed;
            top: 70px;
            right: 10px;
            z-index: 10001;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
            font-size: 13px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // Adicionar animação CSS se não existir
        if (!document.getElementById('gateway-selector-styles')) {
            const style = document.createElement('style');
            style.id = 'gateway-selector-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notificacao);

        // Remover após 3 segundos
        setTimeout(() => {
            notificacao.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notificacao.parentNode) {
                    notificacao.parentNode.removeChild(notificacao);
                }
            }, 300);
        }, 3000);
    }

    // Função para obter gateway atual
    window.getPaymentGateway = function() {
        return localStorage.getItem('payment_provider') || 'furiapay';
    };

    // Função para definir gateway
    window.setPaymentGateway = function(gateway) {
        if (gateway === 'furiapay' || gateway === 'pagloop') {
            alternarGateway(gateway);
            
            // Atualizar visual se o seletor existir
            const container = document.getElementById('gateway-selector');
            if (container) {
                const btnFuriaPay = document.getElementById('btn-furiapay');
                const btnPagLoop = document.getElementById('btn-pagloop');
                const status = document.getElementById('gateway-status');
                if (btnFuriaPay && btnPagLoop && status) {
                    atualizarVisual(btnFuriaPay, btnPagLoop, status, gateway);
                }
            }
        }
    };

    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            const container = criarSeletorGateway();
            document.body.appendChild(container);
            console.log('✅ [Gateway] Seletor de gateway carregado');
        });
    } else {
        const container = criarSeletorGateway();
        document.body.appendChild(container);
        console.log('✅ [Gateway] Seletor de gateway carregado');
    }

    console.log(`✅ [Gateway] Gateway atual: ${gatewayAtual}`);
})();
