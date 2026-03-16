import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnatelHeader from '@/components/AnatelHeader';
import AnatelFooter from '@/components/AnatelFooter';
import { AlertTriangle, Building2, Search, Phone, ChevronRight, FileText } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnatelHomePage = () => {
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [dadosEmpresa, setDadosEmpresa] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const consultarCNPJ = async () => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (!cnpjLimpo || cnpjLimpo.length < 11) {
      toast.error('Digite um CNPJ válido');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API}/cnpj/consultar`, { cnpj: cnpjLimpo });
      setDadosEmpresa(response.data);
      setShowResult(true);
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      toast.error('Erro ao consultar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatarCNPJ = (valor) => {
    const n = valor.replace(/\D/g, '');
    if (n.length <= 11) return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const verTaxas = () => {
    if (dadosEmpresa) navigate('/anatel/debitos', { state: { dadosEmpresa } });
  };

  const novaConsulta = () => {
    setCnpj('');
    setDadosEmpresa(null);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8]" style={{ fontFamily: "'Rawline', 'Segoe UI', system-ui, sans-serif" }}>
      <AnatelHeader breadcrumb="Consulta de Débitos FISTEL" />

      {/* Banner principal */}
      <div style={{ backgroundColor: '#1351B4' }} className="w-full py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-xl">
            <p className="text-[#FFCD07] text-xs font-bold uppercase tracking-widest mb-2">
              FISTEL Online
            </p>
            <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2 leading-tight">
              Consulta de Débitos FISTEL
            </h1>
            <p className="text-blue-200 text-sm">
              Taxa de Fiscalização de Funcionamento — Verifique a situação do seu CNPJ junto à ANATEL.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Formulário / Resultado principal */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                {/* Cabeçalho do card */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#1351B4]" />
                  <h2 className="text-[#071D41] font-bold text-base">
                    {showResult ? 'Dados do Contribuinte' : 'Consultar CNPJ / CPF'}
                  </h2>
                </div>

                <div className="p-6">
                  {!showResult ? (
                    <div>
                      <p className="text-gray-600 text-sm mb-5">
                        Informe o CNPJ da empresa para verificar a existência de débitos na Taxa de Fiscalização de Funcionamento (TFF) do FISTEL.
                      </p>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-[#071D41] mb-1.5" htmlFor="cnpj-input">
                          CNPJ da Empresa
                        </label>
                        <input
                          id="cnpj-input"
                          data-testid="cnpj-input"
                          type="text"
                          placeholder="00.000.000/0000-00"
                          value={cnpj}
                          onChange={(e) => setCnpj(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && consultarCNPJ()}
                          className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:border-transparent transition-all"
                        />
                      </div>
                      <button
                        data-testid="btn-consultar"
                        onClick={consultarCNPJ}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-[#1351B4] hover:bg-[#0c3d91] disabled:opacity-60 text-white font-bold text-sm px-6 py-3 rounded transition-colors cursor-pointer w-full sm:w-auto"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Consultando...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            Consultar FISTEL
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Resultado */
                    <div data-testid="resultado-consulta">
                      <div className="flex items-start gap-4 mb-5 pb-5 border-b border-gray-100">
                        <div className="w-12 h-12 bg-[#1351B4] rounded flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wide">Contribuinte</p>
                          <p className="font-bold text-[#071D41] text-base uppercase leading-tight">
                            {dadosEmpresa?.nome || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mb-5">
                        <div className="bg-[#F8F8F8] rounded p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CNPJ</p>
                          <p className="font-bold text-[#071D41] text-sm">
                            {dadosEmpresa?.cnpj ? formatarCNPJ(dadosEmpresa.cnpj) : cnpj}
                          </p>
                        </div>
                        <div className="bg-[#F8F8F8] rounded p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Serviço</p>
                          <p className="font-bold text-[#071D41] text-sm">SME / FISTEL</p>
                        </div>
                      </div>

                      {dadosEmpresa?.telefone && (
                        <div className="flex items-center gap-3 bg-[#F8F8F8] rounded p-4 border border-gray-100 mb-5">
                          <Phone className="w-4 h-4 text-[#1351B4] flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Linha vinculada</p>
                            <p className="font-bold text-[#071D41] text-sm">{dadosEmpresa.telefone}</p>
                          </div>
                        </div>
                      )}

                      {/* Alerta débitos */}
                      <div className="flex items-center gap-3 bg-[#FFF3CD] border border-[#FFCD07] rounded p-4 mb-6">
                        <AlertTriangle className="w-5 h-5 text-[#856404] flex-shrink-0" />
                        <div>
                          <p className="font-bold text-[#856404] text-sm">Débitos FISTEL identificados</p>
                          <p className="text-xs text-[#856404] mt-0.5">Este CNPJ possui taxas em aberto. Regularize para evitar a suspensão do serviço.</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          data-testid="btn-ver-debitos"
                          onClick={verTaxas}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#1351B4] hover:bg-[#0c3d91] text-white font-bold text-sm px-6 py-3 rounded transition-colors cursor-pointer"
                        >
                          Ver Débitos FISTEL
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={novaConsulta}
                          className="flex items-center justify-center text-[#1351B4] hover:underline text-sm font-medium cursor-pointer px-4 py-3"
                        >
                          Nova consulta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar informativa */}
            <div className="space-y-4">
              {/* O que é FISTEL */}
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-3" style={{ backgroundColor: '#1351B4' }}>
                  <h3 className="text-white font-bold text-sm">O que é o FISTEL?</h3>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 text-xs leading-relaxed">
                    O Fundo de Fiscalização das Telecomunicações (FISTEL) é um fundo contábil destinado ao financiamento das atividades de fiscalização do setor.
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1351B4] mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">Cobrada anualmente de toda empresa com linha ativa</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1351B4] mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">O não pagamento implica suspensão do serviço</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1351B4] mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">Inclui TFF (Taxa de Fiscalização de Funcionamento)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Canais de Atendimento */}
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-3">
                  <h3 className="text-[#071D41] font-bold text-sm">Atendimento Anatel</h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1351B4] rounded flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Central de Atendimento</p>
                      <p className="font-bold text-[#071D41] text-sm">0800 728 9998</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Seg. a Sex. — 8h às 20h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnatelFooter />
    </div>
  );
};

export default AnatelHomePage;
