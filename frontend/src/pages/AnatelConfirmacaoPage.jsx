import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AnatelHeader from '@/components/AnatelHeader';
import AnatelFooter from '@/components/AnatelFooter';
import { CheckCircle2, Download, Calendar, Info, Printer } from 'lucide-react';

const AnatelConfirmacaoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const valor = location.state?.valor || 68.86;
  const cnpj = location.state?.cnpj || '';
  const dadosEmpresa = location.state?.dadosEmpresa || { nome: 'Contribuinte', cnpj };
  const cpfUtilizado = location.state?.cpfUtilizado || null;

  const [mostrarOpcao2026, setMostrarOpcao2026] = useState(true);
  const valorTaxa2026 = 57.38;

  const formatarValor = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const formatarCNPJ = (c) => {
    if (!c) return 'N/A';
    const n = c.replace(/\D/g, '');
    if (n.length !== 14) return c;
    return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const regularizar2026 = () => {
    navigate('/anatel/pagamento', {
      state: {
        dadosEmpresa,
        taxas: {
          total: valorTaxa2026,
          taxas: [{
            tipo: 'TFF – Taxa de Fiscalização de Funcionamento',
            periodo: 'Exercício 2026',
            principal: valorTaxa2026,
            acrescimos: 0,
            total_item: valorTaxa2026
          }]
        },
        exercicio2026: true,
        cpfAnterior: cpfUtilizado
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8]" style={{ fontFamily: "'Rawline', 'Segoe UI', system-ui, sans-serif" }}>
      <AnatelHeader breadcrumb="Comprovante de Regularização" />

      {/* Banner verde */}
      <div style={{ backgroundColor: '#168821' }} className="w-full py-6 px-4">
        <div className="max-w-[1200px] mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow">
            <CheckCircle2 className="w-7 h-7 text-[#168821]" />
          </div>
          <div>
            <p className="text-green-100 text-xs font-bold uppercase tracking-widest mb-0.5">Pagamento Confirmado</p>
            <h1 className="text-white text-xl sm:text-2xl font-bold">Débito FISTEL exercício 2025 regularizado</h1>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Comprovante */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden" data-testid="comprovante">
                {/* Cabeçalho do comprovante */}
                <div style={{ backgroundColor: '#071D41' }} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#FFCD07]" />
                    <span className="font-bold text-sm uppercase tracking-wide">Comprovante de Regularização FISTEL</span>
                  </div>
                  <span className="text-green-300 text-xs font-bold">QUITADO</span>
                </div>

                <div className="p-6">
                  {/* Tabela de dados */}
                  <table className="w-full text-sm mb-5">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium w-2/5">Contribuinte</td>
                        <td className="py-3 text-[#071D41] font-bold text-xs uppercase text-right">{dadosEmpresa?.nome || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium">CNPJ</td>
                        <td className="py-3 text-[#071D41] font-bold text-sm text-right">{formatarCNPJ(cnpj)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium">Taxa</td>
                        <td className="py-3 text-[#071D41] font-bold text-sm text-right">TFF 2025</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium">Modalidade</td>
                        <td className="py-3 text-[#071D41] font-bold text-sm text-right">Pagamento via PIX</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium">Data / Hora</td>
                        <td className="py-3 text-[#071D41] font-bold text-sm text-right">{dataHoje}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-xs font-medium">Valor pago</td>
                        <td className="py-3 font-extrabold text-xl text-[#168821] text-right" data-testid="valor-pago">
                          {formatarValor(valor)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Aviso de baixa */}
                  <div className="flex items-center gap-3 bg-[#E8F5E9] border border-[#A5D6A7] rounded p-4">
                    <CheckCircle2 className="w-5 h-5 text-[#168821] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#168821]">Regularização confirmada</p>
                      <p className="text-xs text-[#2E7D32] mt-0.5">Baixa no sistema ANATEL em até 2 horas úteis</p>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="border-t border-gray-200 px-5 py-4 flex flex-col sm:flex-row gap-3 bg-[#F8F8F8]">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 border border-[#071D41] text-[#071D41] hover:bg-[#071D41] hover:text-white text-sm font-bold px-5 py-2.5 rounded transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium px-5 py-2.5 rounded transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Salvar comprovante
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar — Opção 2026 + Info */}
            <div className="space-y-4">
              {/* Card Pagar 2026 */}
              {mostrarOpcao2026 && (
                <div className="bg-white border-2 border-[#1351B4] rounded shadow-sm overflow-hidden">
                  <div style={{ backgroundColor: '#1351B4' }} className="px-5 py-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FFCD07]" />
                    <span className="text-white font-bold text-sm">Antecipar TFF 2026</span>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Mantenha sua empresa regularizada antecipando o pagamento do exercício 2026 sem multas.
                    </p>
                    <div className="bg-[#F0F5FF] border border-[#1351B4]/20 rounded p-4 mb-4 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Valor 2026</p>
                      <p className="text-3xl font-extrabold text-[#1351B4]">{formatarValor(valorTaxa2026)}</p>
                      <p className="text-xs text-green-600 font-medium mt-1">Sem multa ou acréscimos</p>
                    </div>
                    <button
                      data-testid="btn-pagar-2026"
                      onClick={regularizar2026}
                      className="w-full bg-[#1351B4] hover:bg-[#0c3d91] text-white font-bold text-sm py-3 rounded transition-colors cursor-pointer mb-2"
                    >
                      Pagar TFF 2026 agora
                    </button>
                    <button
                      onClick={() => setMostrarOpcao2026(false)}
                      className="w-full text-gray-400 hover:text-gray-600 text-xs py-1.5 transition-colors cursor-pointer"
                    >
                      Pagar depois
                    </button>
                  </div>
                </div>
              )}

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

              {!mostrarOpcao2026 && (
                <button
                  onClick={() => navigate('/anatel')}
                  className="w-full bg-[#071D41] hover:bg-[#0c2d4a] text-white font-bold text-sm py-3 rounded transition-colors cursor-pointer"
                >
                  Voltar ao início
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <AnatelFooter />
    </div>
  );
};

export default AnatelConfirmacaoPage;
