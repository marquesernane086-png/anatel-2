import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnatelHeader from '@/components/AnatelHeader';
import AnatelFooter from '@/components/AnatelFooter';
import { CheckCircle2, Radio, Download, Share2 } from 'lucide-react';

const AnatelConfirmacaoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const valor = location.state?.valor || 0;
  const cnpj = location.state?.cnpj || '';

  const formatarValor = (v) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(v);
  };

  const formatarCNPJ = (c) => {
    const numeros = c.replace(/\D/g, '');
    return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8]">
      <AnatelHeader />

      <main className="flex-1 py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6">

          {/* Ícone de Sucesso */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-gray-600 text-sm">
              Seu débito FISTEL foi regularizado com sucesso junto à Anatel
            </p>
          </div>

          {/* Recibo */}
          <Card className="border border-gray-200 bg-white shadow-lg mb-6">
            <CardHeader className="bg-[#003580] rounded-t-lg text-white py-4">
              <CardTitle className="flex items-center justify-center gap-2 text-base">
                <Radio className="w-5 h-5" />
                Comprovante de Regularização FISTEL
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Órgão:</span>
                  <span className="font-bold text-gray-900">ANATEL</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Tipo de Taxa:</span>
                  <span className="font-bold text-gray-900">TFF – Taxa de Fiscalização de Funcionamento</span>
                </div>
                {cnpj && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">CNPJ:</span>
                    <span className="font-bold text-gray-900">{formatarCNPJ(cnpj)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Valor pago:</span>
                  <span className="font-black text-green-700 text-lg">{formatarValor(valor)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Forma de pagamento:</span>
                  <span className="font-bold text-gray-900">PIX</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Data/Hora:</span>
                  <span className="font-bold text-gray-900">{dataHoje}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                <strong>Situação:</strong> Débito FISTEL regularizado. A baixa no sistema Anatel será processada em até 2 horas úteis.
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="space-y-3">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="w-full border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Salvar comprovante
            </Button>

            <Button
              onClick={() => navigate('/anatel')}
              className="w-full text-white font-bold py-4 cursor-pointer"
              style={{ backgroundColor: '#003580' }}
            >
              <span className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                Voltar ao início
              </span>
            </Button>
          </div>

          {/* Nota de Rodapé */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Em caso de dúvidas: Anatel 0800 728 9998 | www.gov.br/anatel
          </p>
        </div>
      </main>

      <AnatelFooter />
    </div>
  );
};

export default AnatelConfirmacaoPage;
