import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AnatelHeader from '@/components/AnatelHeader';
import AnatelFooter from '@/components/AnatelFooter';
import { CheckCircle2, Shield, Download, Printer, Info, Calendar } from 'lucide-react';

const AnatelEmDiaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cnpj = location.state?.cnpj || '';
  const dadosEmpresa = location.state?.dadosEmpresa || { nome: 'Contribuinte', cnpj };

  const formatarCNPJ = (c) => {
    if (!c) return 'N/A';
    const n = c.replace(/\D/g, '');
    if (n.length !== 14) return c;
    return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8]" style={{ fontFamily: "'Rawline', 'Segoe UI', system-ui, sans-serif" }}>
      <AnatelHeader breadcrumb="Situação Fiscal Regular" />

      {/* Banner verde escuro */}
      <div style={{ backgroundColor: '#168821' }} className="w-full py-6 px-4">
        <div className="max-w-[1200px] mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow">
            <Shield className="w-7 h-7 text-[#168821]" />
          </div>
          <div>
            <p className="text-green-100 text-xs font-bold uppercase tracking-widest mb-0.5">FISTEL Online — Regularizado</p>
            <h1 className="text-white text-xl sm:text-2xl font-bold">Empresa em Dia — Situação Fiscal Regular</h1>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Certificado */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden" data-testid="certificado-em-dia">
                {/* Cabeçalho */}
                <div style={{ backgroundColor: '#071D41' }} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Shield className="w-4 h-4 text-[#FFCD07]" />
                    <span className="font-bold text-sm uppercase tracking-wide">Certificado de Situação Regular</span>
                  </div>
                  <span className="bg-[#168821] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Regular
                  </span>
                </div>

                <div className="p-6">
                  {/* Destaque de quitação */}
                  <div className="border-2 border-[#168821] bg-[#E8F5E9] rounded p-5 mb-6 text-center">
                    <CheckCircle2 className="w-10 h-10 text-[#168821] mx-auto mb-2" />
                    <p className="text-[#168821] font-extrabold text-2xl">TFF 2025 e 2026</p>
                    <p className="text-[#168821] font-bold text-sm uppercase tracking-widest mt-1">QUITADAS</p>
                  </div>

                  {/* Dados */}
                  <table className="w-full text-sm mb-6">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium w-2/5">Contribuinte</td>
                        <td className="py-3 text-[#071D41] font-bold text-xs uppercase text-right">
                          {dadosEmpresa?.nome || 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium">CNPJ</td>
                        <td className="py-3 text-[#071D41] font-bold text-sm text-right">{formatarCNPJ(cnpj)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium">Serviço</td>
                        <td className="py-3 text-[#071D41] font-bold text-sm text-right">SME / FISTEL</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium">Exercícios quitados</td>
                        <td className="py-3 font-bold text-[#168821] text-sm text-right">2025 e 2026</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium">Data de regularização</td>
                        <td className="py-3 text-[#071D41] font-bold text-sm text-right">{dataHoje}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium">Situação</td>
                        <td className="py-3 text-right">
                          <span className="bg-[#E8F5E9] text-[#168821] text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                            Regular
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Próximo vencimento */}
                  <div className="flex items-center gap-3 bg-[#E3F2FD] border border-[#1351B4]/30 rounded p-4">
                    <Calendar className="w-5 h-5 text-[#1351B4] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#1351B4]">Próximo vencimento</p>
                      <p className="text-xs text-[#1351B4] mt-0.5">Próxima taxa TFF devida em <strong>janeiro de 2027</strong></p>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="border-t border-gray-200 px-5 py-4 flex flex-col sm:flex-row gap-3 bg-[#F8F8F8]">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 border border-[#168821] text-[#168821] hover:bg-[#168821] hover:text-white text-sm font-bold px-5 py-2.5 rounded transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir certificado
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium px-5 py-2.5 rounded transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Salvar PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Voltar ao início */}
              <button
                data-testid="btn-voltar-inicio"
                onClick={() => navigate('/anatel')}
                className="w-full bg-[#1351B4] hover:bg-[#0c3d91] text-white font-bold text-sm py-3.5 rounded transition-colors cursor-pointer"
              >
                Voltar ao início
              </button>

              {/* Info */}
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#1351B4]" />
                  <h3 className="text-[#071D41] font-bold text-sm">Informações</h3>
                </div>
                <div className="p-5 space-y-3 text-xs text-gray-600">
                  <p>Central de Atendimento: <strong className="text-[#071D41]">0800 728 9998</strong></p>
                  <p>Seg. a Sex. — 8h às 20h</p>
                  <a href="#" className="text-[#1351B4] hover:underline block">www.gov.br/anatel</a>
                </div>
              </div>

              {/* Resumo de situação */}
              <div className="bg-white border-2 border-[#168821] rounded shadow-sm overflow-hidden">
                <div className="border-b border-[#168821]/30 px-5 py-3" style={{ backgroundColor: '#E8F5E9' }}>
                  <h3 className="text-[#168821] font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Situação Atual
                  </h3>
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">TFF 2025</span>
                    <span className="text-[#168821] font-bold">Quitada</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">TFF 2026</span>
                    <span className="text-[#168821] font-bold">Quitada</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">TFF 2027</span>
                    <span className="text-gray-400 font-medium">Jan/2027</span>
                  </div>
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

export default AnatelEmDiaPage;
