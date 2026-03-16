import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AnatelHeader from '@/components/AnatelHeader';
import AnatelFooter from '@/components/AnatelFooter';
import { AlertTriangle, Building2, Phone, CheckCircle2, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnatelDebitosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [taxas, setTaxas] = useState(null);
  const [loading, setLoading] = useState(true);
  const dadosEmpresa = location.state?.dadosEmpresa || null;

  useEffect(() => {
    if (!dadosEmpresa) {
      toast.error('Dados não encontrados');
      navigate('/anatel');
      return;
    }
    carregarTaxas();
  }, []);

  const carregarTaxas = async () => {
    try {
      const cnpjLimpo = dadosEmpresa.cnpj?.replace(/\D/g, '') || '';
      const response = await axios.get(`${API}/anatel/taxas/${cnpjLimpo}`);
      setTaxas(response.data);
    } catch (error) {
      console.error('Erro ao carregar taxas:', error);
      toast.error('Erro ao carregar débitos');
    } finally {
      setLoading(false);
    }
  };

  const formatarCNPJ = (c) => {
    if (!c) return 'N/A';
    const n = c.replace(/\D/g, '');
    if (n.length !== 14) return c;
    return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatarValor = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const irParaPagamento = () => {
    navigate('/anatel/pagamento', { state: { dadosEmpresa, taxas } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F8F8]" style={{ fontFamily: "'Rawline', 'Segoe UI', system-ui, sans-serif" }}>
        <AnatelHeader breadcrumb="Débitos FISTEL" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#1351B4]/30 border-t-[#1351B4] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Carregando débitos...</p>
          </div>
        </main>
        <AnatelFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8]" style={{ fontFamily: "'Rawline', 'Segoe UI', system-ui, sans-serif" }}>
      <AnatelHeader breadcrumb="Débitos FISTEL" />

      {/* Banner */}
      <div style={{ backgroundColor: '#1351B4' }} className="w-full py-6 px-4">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[#FFCD07] text-xs font-bold uppercase tracking-widest mb-1">FISTEL Online</p>
          <h1 className="text-white text-xl sm:text-2xl font-bold">Débitos FISTEL — Taxa de Funcionamento</h1>
        </div>
      </div>

      <main className="flex-1 py-8 pb-28">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Coluna principal */}
            <div className="lg:col-span-2 space-y-4">

              {/* Dados do Contribuinte */}
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1351B4]" />
                  <h2 className="text-[#071D41] font-bold text-sm">Dados do Contribuinte</h2>
                </div>
                <div className="p-5">
                  <p className="font-bold text-[#071D41] text-base uppercase mb-4">
                    {dadosEmpresa?.nome || 'N/A'}
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="bg-[#F8F8F8] rounded p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CNPJ</p>
                      <p className="font-bold text-[#071D41] text-xs">{formatarCNPJ(dadosEmpresa?.cnpj)}</p>
                    </div>
                    <div className="bg-[#F8F8F8] rounded p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Serviço</p>
                      <p className="font-bold text-[#071D41] text-xs">SME</p>
                    </div>
                    <div className="bg-[#F8F8F8] rounded p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Situação</p>
                      <p className="font-bold text-red-600 text-xs">IRREGULAR</p>
                    </div>
                  </div>
                  {dadosEmpresa?.telefone && (
                    <div className="mt-3 flex items-center gap-2 bg-[#FFF3CD] border border-[#FFCD07] rounded p-3">
                      <Phone className="w-4 h-4 text-[#856404] flex-shrink-0" />
                      <span className="text-xs text-[#856404]">Linha vinculada: <strong>{dadosEmpresa.telefone}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Débitos */}
              <div className="bg-white border-2 border-red-200 rounded shadow-sm overflow-hidden">
                <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h2 className="text-red-700 font-bold text-sm">Débito em Aberto</h2>
                </div>
                <div className="p-5">
                  {/* Total */}
                  <div className="bg-red-50 border border-red-200 rounded p-5 mb-5 text-center">
                    <p className="text-xs text-red-500 uppercase tracking-wider mb-1 font-medium">Valor Total a Regularizar</p>
                    <p className="text-4xl font-extrabold text-red-700" data-testid="valor-total">
                      {formatarValor(taxas?.total)}
                    </p>
                  </div>

                  {/* Detalhamento por taxa */}
                  {taxas?.taxas?.map((taxa, index) => (
                    <div key={index} className="border border-gray-200 rounded mb-3 overflow-hidden">
                      <div className="bg-[#F8F8F8] border-b border-gray-200 px-4 py-2">
                        <p className="text-xs font-bold text-[#071D41] uppercase tracking-wide">{taxa.tipo}</p>
                      </div>
                      <div className="p-4">
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-gray-100">
                            <tr>
                              <td className="py-2 text-gray-500 text-xs">Período</td>
                              <td className="py-2 text-[#071D41] font-medium text-xs text-right">{taxa.periodo}</td>
                            </tr>
                            <tr>
                              <td className="py-2 text-gray-500 text-xs">Principal</td>
                              <td className="py-2 text-[#071D41] font-medium text-xs text-right">{formatarValor(taxa.principal)}</td>
                            </tr>
                            <tr>
                              <td className="py-2 text-gray-500 text-xs">Multa e acréscimos</td>
                              <td className="py-2 text-red-600 font-medium text-xs text-right">+ {formatarValor(taxa.acrescimos)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#1351B4]" />
                  <h3 className="text-[#071D41] font-bold text-sm">Informações</h3>
                </div>
                <div className="p-5 space-y-3 text-xs text-gray-600">
                  <p className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1351B4] mt-1.5 flex-shrink-0" />
                    A TFF é cobrada anualmente de toda empresa com linha telefônica ativa.
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1351B4] mt-1.5 flex-shrink-0" />
                    O não pagamento implica suspensão do serviço e inscriçãona dívida ativa.
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1351B4] mt-1.5 flex-shrink-0" />
                    O pagamento pode ser realizado via PIX com crédito imediato.
                  </p>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-3">
                  <h3 className="text-[#071D41] font-bold text-sm">Forma de Pagamento</h3>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 p-3 border border-[#32BCAD] rounded bg-[#F0FDFB]">
                    <div className="w-8 h-8 bg-[#32BCAD] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-extrabold">PIX</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">Pagamento via PIX</p>
                      <p className="text-[10px] text-gray-500">Aprovação em minutos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Barra CTA fixa */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-xs text-gray-500">Total a pagar</p>
            <p className="font-extrabold text-[#071D41] text-lg">{formatarValor(taxas?.total)}</p>
          </div>
          <button
            data-testid="btn-regularizar"
            onClick={irParaPagamento}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#1351B4] hover:bg-[#0c3d91] text-white font-bold text-sm px-8 py-3.5 rounded transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            Regularizar Débito
          </button>
        </div>
      </div>

      <AnatelFooter />
    </div>
  );
};

export default AnatelDebitosPage;
