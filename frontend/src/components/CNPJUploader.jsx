import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, CheckCircle2, AlertCircle, Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CNPJUploader = ({ onComplete }) => {
  const [arquivo, setArquivo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [dragging, setDragging] = useState(false);

  // Polling do status de importação
  React.useEffect(() => {
    if (!uploading) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API}/cnpjs/importacao/status`);
        setStatus(response.data);

        if (!response.data.em_andamento && response.data.progresso === 100) {
          setUploading(false);
          toast.success('Importação concluída!');
          if (onComplete) onComplete();
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 2000); // Verificar a cada 2 segundos

    return () => clearInterval(interval);
  }, [uploading, onComplete]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    validarArquivo(file);
  };

  const validarArquivo = (file) => {
    if (!file) return;

    // Validar extensão
    const extensao = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'json'].includes(extensao)) {
      toast.error('Apenas arquivos CSV ou JSON são aceitos');
      return;
    }

    // Validar tamanho (máx 500MB)
    const tamanhoMB = file.size / (1024 * 1024);
    if (tamanhoMB > 500) {
      toast.error(`Arquivo muito grande: ${tamanhoMB.toFixed(2)} MB. Máximo: 500 MB`);
      return;
    }

    setArquivo(file);
    toast.success(`Arquivo selecionado: ${file.name} (${tamanhoMB.toFixed(2)} MB)`);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    validarArquivo(file);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const fazerUpload = async () => {
    if (!arquivo) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }

    setUploading(true);
    setStatus({
      em_andamento: true,
      progresso: 0,
      total_processados: 0,
      total_importados: 0,
      total_erros: 0,
      mensagem: 'Enviando arquivo...'
    });

    try {
      const formData = new FormData();
      formData.append('file', arquivo);

      const response = await axios.post(`${API}/cnpjs/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(response.data.message);
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload. Tente novamente.');
      setUploading(false);
      setStatus(null);
    }
  };

  const formatarNumero = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  return (
    <Card className="border-2 border-dashed border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Importar CNPJs em Massa
        </CardTitle>
        <CardDescription>
          Suporta até 9 milhões de registros em CSV ou JSON (máx 500MB)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Área de Drop */}
        <div
          data-testid="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
            dragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv,.json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          
          {arquivo ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <File className="w-5 h-5" />
                <span className="font-semibold">{arquivo.name}</span>
              </div>
              <p className="text-sm text-gray-500">
                {(arquivo.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 font-medium mb-2">
                Arraste seu arquivo aqui ou clique para selecionar
              </p>
              <p className="text-sm text-gray-500">
                CSV ou JSON • Máximo 500MB • Até 9 milhões de registros
              </p>
            </div>
          )}
        </div>

        {/* Formato Esperado */}
        <Alert>
          <AlertDescription className="text-sm">
            <strong>Formato CSV esperado:</strong>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
cnpj,nome,situacao
12345678000190,EMPRESA EXEMPLO LTDA,ATIVA
98765432000111,OUTRA EMPRESA LTDA,ATIVA
            </pre>
          </AlertDescription>
        </Alert>

        {/* Botão Upload */}
        <Button
          data-testid="upload-btn"
          onClick={fazerUpload}
          disabled={!arquivo || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Importando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Iniciar Importação
            </span>
          )}
        </Button>

        {/* Status da Importação */}
        {status && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Progresso:</span>
                <span className="font-bold text-blue-600">{status.progresso}%</span>
              </div>

              <Progress value={status.progresso} className="h-3" />

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Processados</p>
                  <p className="font-bold text-gray-900">{formatarNumero(status.total_processados)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Importados</p>
                  <p className="font-bold text-green-600">{formatarNumero(status.total_importados)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Erros</p>
                  <p className="font-bold text-red-600">{formatarNumero(status.total_erros)}</p>
                </div>
              </div>

              <p className="text-sm text-gray-700 text-center">
                {status.mensagem}
              </p>

              {status.progresso === 100 && !status.em_andamento && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Importação finalizada com sucesso!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default CNPJUploader;
