# 📊 GUIA DE IMPORTAÇÃO - 3 MILHÕES DE CNPJs

## ✅ SISTEMA IMPLEMENTADO

**Arquitetura:**
- 🗄️ MongoDB com índices otimizados
- ⚡ Busca em O(log n) = ~1-5ms por CNPJ
- 📦 Importação em batches de 10.000
- 🔄 API externa como backup

**Performance esperada:**
- 1.000 CNPJs: ~1-2ms por consulta
- 100.000 CNPJs: ~2-3ms por consulta
- 1.000.000 CNPJs: ~3-5ms por consulta
- 3.000.000 CNPJs: ~5-8ms por consulta

---

## 📥 COMO IMPORTAR SEUS 3 MILHÕES DE CNPJs

### MÉTODO 1: Via Script Python (Recomendado)

**1. Prepare seu arquivo CSV:**
```csv
cnpj,nome,situacao
12345678000190,EMPRESA EXEMPLO 1 LTDA,ATIVA
98765432000111,EMPRESA EXEMPLO 2 LTDA,ATIVA
11222333000181,EMPRESA EXEMPLO 3 LTDA,ATIVA
...
```

**2. Execute o script:**
```bash
cd /app/scripts
python importar_cnpjs.py /caminho/para/seus_cnpjs.csv
```

**3. Aguarde:**
- 100k CNPJs: ~30 segundos
- 1M CNPJs: ~5 minutos
- 3M CNPJs: ~15 minutos

---

### MÉTODO 2: Via API REST (Para sistemas externos)

**Importar em batches de 1.000-10.000:**

```bash
# Exemplo: Importar 1.000 CNPJs
curl -X POST http://localhost:8001/api/cnpjs/importar \
  -H "Content-Type: application/json" \
  -d '[
    {"cnpj": "12345678000190", "nome": "Empresa 1", "situacao": "ATIVA"},
    {"cnpj": "98765432000111", "nome": "Empresa 2", "situacao": "ATIVA"},
    ...
  ]'
```

**Para 3 milhões:**
- Divida em 300 requests de 10k cada
- Ou 3.000 requests de 1k cada
- Use script para automatizar

---

### MÉTODO 3: Via JSON

**1. Converta para JSON:**
```json
[
  {"cnpj": "12345678000190", "nome": "Empresa 1", "situacao": "ATIVA"},
  {"cnpj": "98765432000111", "nome": "Empresa 2", "situacao": "ATIVA"}
]
```

**2. Importe:**
```bash
python importar_cnpjs.py dados.json
```

---

### MÉTODO 4: mongoimport (Mais Rápido)

**Para 3M+ registros, use mongoimport nativo:**

```bash
# 1. Converter CSV para formato MongoDB
mongoimport --host localhost:27017 \
  --db test_database \
  --collection cnpjs_database \
  --type csv \
  --file seus_cnpjs.csv \
  --headerline \
  --columnsHaveTypes \
  --fields "cnpj.string(),nome.string(),situacao.string()"

# 2. Criar índices
mongo test_database --eval 'db.cnpjs_database.createIndex({cnpj: 1}, {unique: true})'
```

**Performance:**
- 3M registros: ~3-5 minutos
- Mais rápido que qualquer outro método

---

## 🧪 TESTAR COM DADOS DE EXEMPLO

**Gerar 100k CNPJs de teste:**
```bash
cd /app/scripts
python importar_cnpjs.py --gerar 100000
```

**Gerar 1M CNPJs de teste:**
```bash
python importar_cnpjs.py --gerar 1000000
```

---

## 📊 VERIFICAR IMPORTAÇÃO

**Via API:**
```bash
curl http://localhost:8001/api/cnpjs/stats
```

**Resposta esperada:**
```json
{
  "total_cnpjs": 3000000,
  "por_situacao": [
    {"_id": "ATIVA", "count": 2800000},
    {"_id": "BAIXADA", "count": 150000},
    {"_id": "SUSPENSA", "count": 50000}
  ],
  "formato": "Otimizado para 3M+ registros com índices"
}
```

**Via MongoDB:**
```bash
mongosh test_database --eval "db.cnpjs_database.countDocuments({})"
```

---

## ⚡ PERFORMANCE ESPERADA

**Com índice criado:**
```
Busca por CNPJ específico: 1-5ms
Importação 10k registros: ~3-5 segundos
Importação 100k registros: ~30-60 segundos
Importação 1M registros: ~5-8 minutos
Importação 3M registros: ~15-25 minutos
```

**Espaço em disco:**
```
1M CNPJs: ~100-200 MB
3M CNPJs: ~300-600 MB
Com índices: +20-30%
Total estimado: ~800 MB - 1 GB
```

---

## 🔄 ESTRATÉGIA DE CONSULTA ATUAL

```
1. Buscar no MongoDB (1-5ms)
   ├─ Encontrou? → Retorna dados
   └─ Não encontrou? → Próximo passo

2. Consultar API Externa (500ms-2s)
   ├─ Sucesso? → Salva no MongoDB + Retorna
   └─ Falhou? → Próximo passo

3. Retornar Mockado Genérico
   └─ Sempre retorna algo
```

---

## 📝 FORMATO DO ARQUIVO PARA IMPORTAÇÃO

**CSV (Recomendado):**
```csv
cnpj,nome,situacao
12345678000190,EMPRESA TESTE LTDA,ATIVA
98765432000111,OUTRA EMPRESA LTDA,BAIXADA
11222333000181,CONSULTORIA MEI LTDA,ATIVA
```

**JSON:**
```json
[
  {
    "cnpj": "12345678000190",
    "nome": "EMPRESA TESTE LTDA",
    "situacao": "ATIVA"
  }
]
```

---

## 🚀 PRÓXIMOS PASSOS

**Agora você pode:**

1. **Importar seus 3M de CNPJs:**
   - Prepare arquivo CSV ou JSON
   - Execute script de importação
   - Aguarde conclusão (~15-25 min)

2. **Testar performance:**
   - Consulte CNPJs importados
   - Verifique velocidade (deve ser <10ms)

3. **Deploy:**
   - Fazer backup do MongoDB
   - Deploy na Emergent com banco populado

---

## ❓ ONDE ESTÃO SEUS 3M DE CNPJs?

**Você tem:**
A) Arquivo CSV/Excel pronto  
B) Arquivo JSON  
C) Banco de dados externo  
D) API para buscar  
E) Precisa gerar/obter  

Me avise para eu ajudar na importação! 🎯
