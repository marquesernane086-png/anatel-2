import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnatelHeader from '@/components/AnatelHeader';
import AnatelFooter from '@/components/AnatelFooter';
import { CheckCircle2, Radio, Download, Calendar } from 'lucide-react';

const AnatelConfirmacaoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Dados com fallback seguro
  const valor = location.state?.valor || 68.86;
  const cnpj = location.state?.cnpj || '';
  const dadosEmpresa = location.state?.dadosEmpresa || { nome: 'Contribuinte', cnpj: cnpj };
  const cpfUtilizado = location.state?.cpfUtilizado || null;
  
  const [mostrarOpcao2026, setMostrarOpcao2026] = useState(true);

  // Valor da taxa 2026 (sem multa)
  const valorTaxa2026 = 57.38;

  const formatarValor = (v) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(v || 0);
  };

  const formatarCNPJ = (c) => {
    if (!c) return 'N/A';
    const numeros = c.replace(/\D/g, '');
    if (numeros.length !== 14) return c;
    return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const regularizar2026 = () => {
    navigate('/anatel/pagamento', {
      state: {
        dadosEmpresa: dadosEmpresa,
        taxas: {
          total: valorTaxa2026,
          taxas: [{
            tipo: "TFF – Taxa de Fiscalização de Funcionamento",
            periodo: "Exercício 2026",
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
    <div className="min-h-screen flex flex-col bg-[#f0f4f8]">
      <AnatelHeader />

      <main className="flex-1 py-8">
        <div className="max-w-lg mx-auto px-4">

          {/* Sucesso */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#168821] rounded-full mb-3">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#071D41]">
              Pagamento Confirmado
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Débito FISTEL exercício 2025 regularizado
            </p>
          </div>

          {/* Comprovante */}
          <Card className="bg-white border-0 shadow-md mb-4 overflow-hidden">
            <div className="bg-[#071D41] px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <Radio className="w-4 h-4" />
                <span className="text-sm font-semibold">Comprovante de Regularização</span>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Contribuinte</span>
                  <span className="font-semibold text-[#071D41] text-right text-xs max-w-[55%] uppercase">
                    {dadosEmpresa?.nome || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">CNPJ</span>
                  <span className="font-semibold text-[#071D41]">{formatarCNPJ(cnpj)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Taxa</span>
                  <span className="font-semibold text-[#071D41]">TFF 2025</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Valor pago</span>
                  <span className="font-bold text-[#168821] text-lg">{formatarValor(valor)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Pagamento</span>
                  <span className="font-semibold text-[#071D41]">PIX</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Data/Hora</span>
                  <span className="font-semibold text-[#071D41]">{dataHoje}</span>
                </div>
              </div>

              <div className="mt-4 bg-[#e8f5e9] rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#168821] flex-shrink-0" />
                <span className="text-xs text-[#168821] font-medium">
                  Baixa no sistema Anatel em até 2 horas úteis
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Opção 2026 */}
          {mostrarOpcao2026 && (
            <Card className="bg-white border-2 border-[#1351b4] shadow-md mb-4 overflow-hidden">
              <div className="bg-[#1351b4] px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-semibold">Taxa TFF 2026</span>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-gray-700 mb-4">
                  Antecipe o pagamento do exercício 2026 e mantenha sua empresa regularizada.
                </p>

                <div className="bg-[#f0f5ff] rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Valor</span>
                    <span className="font-bold text-2xl text-[#1351b4]">{formatarValor(valorTaxa2026)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={regularizar2026}
                  className="w-full bg-[#1351b4] hover:bg-[#0c3d91] text-white font-semibold py-4 cursor-pointer"
                >
                  Pagar TFF 2026
                </Button>

                <button
                  onClick={() => setMostrarOpcao2026(false)}
                  className="w-full text-gray-400 text-xs mt-3 hover:text-gray-600 cursor-pointer"
                >
                  Pagar depois
                </button>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="space-y-3">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="w-full border-[#071D41] text-[#071D41] hover:bg-[#071D41] hover:text-white cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" />
              Salvar comprovante
            </Button>

            <Button
              onClick={() => navigate('/anatel')}
              className="w-full bg-[#071D41] hover:bg-[#0c2d4a] text-white font-semibold py-4 cursor-pointer"
            >
              Voltar ao início
            </Button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Anatel 0800 728 9998 | www.gov.br/anatel
          </p>
        </div>
      </main>

      <AnatelFooter />
    </div>
  );
};

export default AnatelConfirmacaoPage;
