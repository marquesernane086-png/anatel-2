import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AnatelHeader from '@/components/AnatelHeader';
import AnatelFooter from '@/components/AnatelFooter';
import { AlertTriangle, Building2, Phone, Radio, CheckCircle2 } from 'lucide-react';
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
    const numeros = c.replace(/\D/g, '');
    if (numeros.length !== 14) return c;
    return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatarValor = (v) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(v || 0);
  };

  const irParaPagamento = () => {
    navigate('/anatel/pagamento', {
      state: { dadosEmpresa, taxas }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f0f4f8]">
        <AnatelHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-[#1351b4]/30 border-t-[#1351b4] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Carregando débitos...</p>
          </div>
        </main>
        <AnatelFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8]">
      <AnatelHeader />

      <main className="flex-1 py-6 pb-28">
        <div className="max-w-lg mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-[#071D41]">Débitos FISTEL</h1>
            <p className="text-sm text-gray-500">Taxa de Fiscalização de Funcionamento</p>
          </div>

          {/* Dados do Contribuinte */}
          <Card className="bg-white border-0 shadow-md mb-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-[#1351b4] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Contribuinte</p>
                  <p className="font-semibold text-[#071D41] text-sm uppercase truncate">
                    {dadosEmpresa?.nome || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">CNPJ</p>
                  <p className="font-semibold text-[#071D41] text-xs">
                    {formatarCNPJ(dadosEmpresa?.cnpj)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Serviço</p>
                  <p className="font-semibold text-[#071D41] text-xs">SME</p>
                </div>
              </div>

              {dadosEmpresa?.telefone && (
                <div className="mt-3 bg-[#fff3cd] border border-[#ffc107] rounded-lg p-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#856404]" />
                  <span className="text-sm text-[#856404]">
                    Linha: <strong>{dadosEmpresa.telefone}</strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Valor Total */}
          <Card className="bg-white border-2 border-[#dc3545] shadow-md mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-[#dc3545]" />
                <span className="font-semibold text-[#dc3545]">Débito em Aberto</span>
              </div>
              
              <div className="bg-[#f8d7da] rounded-lg p-4 text-center">
                <p className="text-xs text-[#721c24] mb-1">Valor Total</p>
                <p className="text-3xl font-bold text-[#721c24]">
                  {formatarValor(taxas?.total)}
                </p>
              </div>

              {/* Detalhamento */}
              {taxas?.taxas?.map((taxa, index) => (
                <div key={index} className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-[#071D41] mb-2">{taxa.tipo}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Período</span>
                      <span className="text-[#071D41]">{taxa.periodo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Principal</span>
                      <span className="text-[#071D41]">{formatarValor(taxa.principal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Acréscimos</span>
                      <span className="text-[#dc3545]">+ {formatarValor(taxa.acrescimos)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Info FISTEL */}
          <Card className="bg-[#e3f2fd] border-0 shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Radio className="w-4 h-4 text-[#1351b4] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#1351b4]">
                  A TFF é cobrada anualmente de toda empresa com linha telefônica ativa. 
                  O não pagamento implica em suspensão do serviço.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formas de Pagamento */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
              <div className="w-6 h-6 bg-[#32bcad] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">PIX</span>
            </div>
          </div>
        </div>
      </main>

      {/* Botão Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={irParaPagamento}
            className="w-full bg-[#1351b4] hover:bg-[#0c3d91] text-white font-semibold h-12 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Regularizar Débito
            </span>
          </Button>
        </div>
      </div>

      <AnatelFooter />
    </div>
  );
};

export default AnatelDebitosPage;
