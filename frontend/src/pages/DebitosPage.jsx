import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GovBrHeader from '@/components/GovBrHeader';
import GovBrFooter from '@/components/GovBrFooter';
import { AlertTriangle, DollarSign, Calendar, CheckCircle2, XCircle, Shield, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DebitosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dadosEmpresa, setDadosEmpresa] = useState(null);
  const [debitos, setDebitos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dados = location.state?.dadosEmpresa;
    
    if (!dados) {
      toast.error('Dados da empresa não encontrados');
      navigate('/');
      return;
    }
    
    setDadosEmpresa(dados);
    carregarDebitos(dados.cnpj);
  }, [location, navigate]);

  const carregarDebitos = async (cnpj) => {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      const response = await axios.get(`${API}/cnpj/${cnpjLimpo}/debitos`);
      setDebitos(response.data);
    } catch (error) {
      console.error('Erro ao carregar débitos:', error);
      toast.error('Erro ao carregar débitos');
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const irParaPagamento = () => {
    navigate('/pagamento', { 
      state: { 
        dadosEmpresa,
        debitos 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando débitos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <GovBrHeader />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          
          {/* Alertas */}
          <div className="space-y-4 mb-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 font-bold">
                ATENÇÃO: Débitos podem resultar em cancelamento do MEI! Falta de pagamento gera multas, dívida ativa e <span className="text-red-900 font-extrabold">perda da sua chave pix e conta bancária</span>.
              </AlertDescription>
            </Alert>

            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <AlertDescription className="text-orange-800 font-semibold">
                Valores incluem juros e multas. Quanto mais tempo passar, maior será o valor.
              </AlertDescription>
            </Alert>
          </div>

          {/* Situação dos Débitos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0c326f]">
                <Calendar className="w-5 h-5" />
                Situação dos seus débitos
              </CardTitle>
              <CardDescription>
                Meses em aberto identificados para regularização.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Total em Aberto */}
          <Card className="mb-6 border-2 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 text-[#0c326f] font-bold text-sm mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Total em aberto</span>
                  </div>
                  <p className="text-4xl font-black text-gray-900">
                    {formatarValor(debitos?.total || 161.80)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">
                    {debitos?.quantidade_meses || 2} meses
                  </p>
                  <p className="text-sm text-blue-600 font-semibold">
                    Com juros e multa
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Débitos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg">
                Débitos DAS em Aberto - 2026
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debitos?.debitos?.map((debito, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{debito.mes}</p>
                        <p className="text-sm text-gray-600">{formatarValor(debito.valor)}</p>
                      </div>
                    </div>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded">
                      {debito.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prazo Limitado */}
          <Alert className="border-red-200 bg-red-100 mb-6">
            <Clock className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-bold">
              Prazo limitado! Após o prazo, seu MEI será cancelado automaticamente.
            </AlertDescription>
          </Alert>

          {/* Consequências e Benefícios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 text-base">
                  <AlertTriangle className="w-5 h-5" />
                  Consequências
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• <strong>Multas e juros</strong> diários</li>
                  <li>• <strong>Dívida ativa</strong> da União</li>
                  <li>• <strong>Cancelamento</strong> do MEI</li>
                  <li>• <strong>Perda de benefícios</strong></li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600 text-base">
                  <Shield className="w-5 h-5" />
                  Benefícios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Evita multas adicionais</li>
                  <li>• MEI ativo e protegido</li>
                  <li>• Preserva benefícios</li>
                  <li>• Continuidade das atividades</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Formas de Pagamento */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-[#0c326f] font-bold text-sm mb-2">
                <TrendingUp className="w-5 h-5" />
                <span>Formas de pagamento:</span>
              </div>
              <p className="text-gray-800 text-sm font-bold">
                • PIX <span className="font-normal">instantâneo</span>
              </p>
            </CardContent>
          </Card>

          {/* Botão Regularizar */}
          <Button
            data-testid="regularizar-btn"
            onClick={irParaPagamento}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg shadow-lg"
            style={{ backgroundColor: 'rgb(124, 179, 66)' }}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Regularizar agora e evitar cancelamento
            </span>
          </Button>
          
          <p className="text-center text-sm text-[#0c326f] font-semibold mt-4">
            Clique para ser direcionado ao sistema de pagamento oficial
          </p>
        </div>
      </main>
      
      <GovBrFooter />
    </div>
  );
};

export default DebitosPage;
