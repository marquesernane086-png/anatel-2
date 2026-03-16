import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnatelHeader from '@/components/AnatelHeader';
import AnatelFooter from '@/components/AnatelFooter';
import { CheckCircle2, Radio, Download, Shield, Star } from 'lucide-react';

const AnatelEmDiaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cnpj = location.state?.cnpj || '';
  const dadosEmpresa = location.state?.dadosEmpresa || null;

  const formatarCNPJ = (c) => {
    const numeros = c.replace(/\D/g, '');
    return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8]">
      <AnatelHeader />

      <main className="flex-1 py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6">

          {/* Ícone de Sucesso Grande */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-green-100 rounded-full mb-6 shadow-lg">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-green-700 mb-3">
              Empresa em Dia!
            </h1>
            <p className="text-gray-600 text-lg">
              Parabéns! Sua empresa está regularizada junto à ANATEL
            </p>
          </div>

          {/* Card Principal */}
          <Card className="border-2 border-green-400 bg-white shadow-xl mb-6">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 rounded-t-lg text-white py-5">
              <CardTitle className="flex items-center justify-center gap-3 text-xl">
                <Shield className="w-7 h-7" />
                Certificado de Regularidade FISTEL
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              {/* Selo de Regularidade */}
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-600 rounded-full p-3">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-green-800 font-bold text-lg mb-2">
                  SITUAÇÃO FISCAL REGULAR
                </p>
                <p className="text-green-700 text-sm">
                  Taxa de Fiscalização de Funcionamento (TFF)
                </p>
                <p className="text-green-700 text-sm font-bold">
                  Exercícios 2025 e 2026 - QUITADOS
                </p>
              </div>

              {/* Dados da Empresa */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-500">Contribuinte:</span>
                  <span className="font-bold text-gray-900 uppercase text-right max-w-[60%]">
                    {dadosEmpresa?.nome || 'N/A'}
                  </span>
                </div>
                {cnpj && (
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-500">CNPJ:</span>
                    <span className="font-bold text-gray-900">{formatarCNPJ(cnpj)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-500">Serviço:</span>
                  <span className="font-bold text-gray-900">SME – Serviço Móvel Empresarial</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-500">Exercícios Regularizados:</span>
                  <span className="font-bold text-green-700">2025 e 2026</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-500">Data da Regularização:</span>
                  <span className="font-bold text-gray-900">{dataHoje}</span>
                </div>
              </div>

              {/* Mensagem de Sucesso */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <Radio className="w-5 h-5 inline mr-2 text-blue-600" />
                <strong>Importante:</strong> Guarde este comprovante. A próxima taxa TFF será devida apenas em <strong>janeiro de 2027</strong>.
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="space-y-3">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors cursor-pointer flex items-center gap-2 py-5"
            >
              <Download className="w-5 h-5" />
              Salvar Certificado
            </Button>

            <Button
              onClick={() => navigate('/anatel')}
              className="w-full bg-[#003580] hover:bg-[#002a66] text-white font-bold py-5 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                Voltar ao início
              </span>
            </Button>
          </div>

          {/* Nota de Rodapé */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Em caso de dúvidas: Anatel 0800 728 9998 | www.gov.br/anatel
          </p>
        </div>
      </main>

      <AnatelFooter />
    </div>
  );
};

export default AnatelEmDiaPage;
