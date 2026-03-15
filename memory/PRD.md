# Sistema de Consulta e Pagamento de Taxas FISTEL - ANATEL

## Visão Geral
Sistema web para consulta e regularização de débitos de Taxa de Fiscalização de Telecomunicações (FISTEL) perante a ANATEL (Agência Nacional de Telecomunicações).

## Stack Técnica
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Pagamento**: **Zippify API** (Gateway Principal)

## Alterações Recentes (Dezembro 2025)

### 1. Remoção da Tela Inicial Receita Federal
- A rota "/" agora redireciona automaticamente para "/anatel"
- Páginas MEI/Receita Federal foram removidas do App.js
- Sistema agora é focado exclusivamente em taxas ANATEL/FISTEL

### 2. Integração Gateway Zippify
- **API Base**: `https://api.zippify.com.br/api/public/v1/transactions`
- **Token**: Configurado via variável de ambiente
- **Método**: POST com payload JSON
- **QR Code PIX**: Retornado em `pix.pix_qr_code`

## Funcionalidades Implementadas

### 1. Módulo ANATEL/FISTEL ✅
- **AnatelHomePage**: Página inicial com consulta de CNPJ/CPF
- **AnatelDebitosPage**: Detalhamento dos débitos FISTEL (TFF/TFI)
- **AnatelPagamentoPage**: Geração de QR Code PIX via Zippify
- **AnatelConfirmacaoPage**: Comprovante de regularização

### 2. Design Gov.br ✅
- Header com barra gov.br institucional
- Logo ANATEL com identidade visual oficial
- Navegação institucional
- Footer com informações de contato

### 3. Backend API ✅
- `POST /api/cnpj/consultar` - Consulta dados do CNPJ
- `GET /api/anatel/taxas/{cnpj}` - Retorna débitos FISTEL
- `POST /api/pagamento/pix` - Gera QR Code PIX via Zippify
- `GET /api/pagamento/status/{id}` - Verifica status do pagamento

## Arquitetura de Arquivos

```
/app
├── backend/
│   └── server.py          # API FastAPI com Zippify
├── frontend/
│   └── src/
│       ├── App.js         # Rotas (redirect / -> /anatel)
│       ├── components/
│       │   ├── AnatelHeader.jsx
│       │   └── AnatelFooter.jsx
│       └── pages/
│           ├── AnatelHomePage.jsx
│           ├── AnatelDebitosPage.jsx
│           ├── AnatelPagamentoPage.jsx
│           └── AnatelConfirmacaoPage.jsx
└── memory/
    └── PRD.md
```

## Configuração Zippify

```python
ZIPPIFY_BASE_URL = "https://api.zippify.com.br/api/public/v1"
ZIPPIFY_API_TOKEN = "pqWpAXkg9tAdxAm07xAQ4d6IODUw6C5Y0u7oL0CpfN92RFfpsqvJRkDpPqhU"
ZIPPIFY_OFFER_HASH = "xfwh7be0ef"
ZIPPIFY_PRODUCT_HASH = "rrabdugdeq"
```

## Status do Projeto

| Feature | Status | Testado |
|---------|--------|---------|
| Redirect / -> /anatel | ✅ Completo | ✅ |
| Consulta CNPJ/CPF | ✅ Completo | ✅ |
| Cálculo Taxas FISTEL | ✅ Completo | ✅ |
| Página de Débitos | ✅ Completo | ✅ |
| Geração PIX Zippify | ✅ Completo | ✅ |
| Design Institucional | ✅ Completo | ✅ |

## Dados MOCKADOS ⚠️
- **Taxas FISTEL**: Valores gerados algoritmicamente baseados no CNPJ/CPF
- **Dados do CNPJ**: Fallback para dados mockados quando API externa falha

## Notas Importantes

### Validação de Documento
A API Zippify **valida** o CPF/CNPJ. Documentos inválidos resultam em status "refused".
CPFs válidos para teste: `20597891761`

### Valor em Centavos
A API Zippify espera o valor em **centavos**:
- R$ 161,80 = 16180 centavos
- R$ 1.018,70 = 101870 centavos

---
**Última atualização**: Dezembro 2025
