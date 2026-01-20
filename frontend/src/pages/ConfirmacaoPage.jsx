import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GovBrHeader from '@/components/GovBrHeader';
import GovBrFooter from '@/components/GovBrFooter';
import { CheckCircle2, Home, Printer, Shield } from 'lucide-react';

const ConfirmacaoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [valor, setValor] = React.useState(0);
  const [cnpj, setCnpj] = React.useState('');
  const [dataHora, setDataHora] = React.useState('');

  useEffect(() => {
    const valorPago = location.state?.valor || 0;
    const cnpjPago = location.state?.cnpj || '';
    
    if (!valorPago) {
      navigate('/');
      return;
    }
    
    setValor(valorPago);
    setCnpj(cnpjPago);
    setDataHora(new Date().toLocaleString('pt-BR'));
  }, [location, navigate]);

  const formatarValor = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const imprimirComprovante = () => {
    window.print();
  };

  const voltarInicio = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      <GovBrHeader />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="max-w-2xl w-full shadow-2xl border-green-200">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Seu pagamento foi processado com sucesso
            </p>

            <Card className="bg-gray-50 mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className="font-bold text-green-600 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Confirmado
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-600">Valor:</span>
                    <span className="font-bold text-gray-900 text-xl">
                      {formatarValor(valor)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-600">CNPJ:</span>
                    <span className="font-semibold text-gray-900">
                      {cnpj}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3">
                    <span className="font-medium text-gray-600">Data/Hora:</span>
                    <span className="font-semibold text-gray-900">
                      {dataHora}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-green-200 bg-green-50 mb-6">
              <AlertDescription className="text-green-900">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-bold mb-2">Obrigado pelo pagamento!</p>
                    <p className="text-sm">
                      Seus débitos DAS foram quitados. O cancelamento automático do seu CNPJ foi evitado.
                      A baixa será processada automaticamente em até 30 minutos.
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                data-testid="voltar-inicio-btn"
                onClick={voltarInicio}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-base"
              >
                <Home className="w-5 h-5 mr-2" />
                Voltar ao Início
              </Button>
              
              <Button
                data-testid="imprimir-btn"
                onClick={imprimirComprovante}
                variant="outline"
                className="flex-1 font-semibold py-6 text-base"
              >
                <Printer className="w-5 h-5 mr-2" />
                Imprimir Comprovante
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Pagamento processado com segurança
            </p>
          </CardContent>
        </Card>
      </main>
      
      <GovBrFooter />
    </div>
  );
};

export default ConfirmacaoPage;
