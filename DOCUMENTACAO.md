# Monitor de Risco Operacional — Documentação

## Visão Geral

Sistema de monitoramento automático por IA para identificar comportamentos suspeitos, prevenir fraudes e abuso de promoções em plataforma de apostas.

**Stack:** Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui + Recharts  
**Deploy:** Vercel (produção)  
**URL:** https://monitor-risco.vercel.app  
**Repositório:** https://github.com/ViniciusFLA/monitor-risco

---

## Fontes de Dados

### 1. Google Sheets (Cadastro de Usuários) — CONECTADO
- **Planilha:** `https://docs.google.com/spreadsheets/d/1jGA297iefjWFTLbXZxrhsNAugjGjQLNuXXjIFzPVB10/edit?gid=1463888907`
- **Status:** 316 usuários carregados em produção
- **Acesso:** Planilha configurada como "Qualquer pessoa com o link > Leitor"
- **Mapeamento de colunas (real → sistema):**
  | Coluna Sheet | Campo Sistema |
  |-------------|---------------|
  | code | id |
  | nome | nome |
  | email | email |
  | cellphone | telefone |
  | cpf | documento |
  | device_id | dispositivo_id |
  | created_at | data_cadastro |
  | status | status (ACTIVE→ativo) |

### 2. Azure SQL Server (Transações) — PENDENTE
- **Server:** `prod-wallet-server.database.windows.net`
- **Database:** `wallet-api-database`
- **Usuário:** `analista_dados`
- **Senha:** `A@n@list@Vinicius!`
- **Status:** Firewall bloqueando acesso. Precisa liberar.

---

## O Que Fazer no Trabalho (IP Liberado no Azure)

### Passo 1: Liberar Firewall
No Azure Portal:
1. Acesse o SQL Server `prod-wallet-server`
2. Menu **Networking** → **Firewall**
3. Adicione seu IP atual como regra
4. Marque **"Allow Azure services and resources to access this server"** (para o Vercel funcionar)

### Passo 2: Descobrir Schema das Tabelas
No terminal, dentro da pasta do projeto:
```bash
node discover-schema.mjs
```
Este script conecta no Azure SQL e lista todas as tabelas + colunas.
**Se não funcionar, execute:**
```bash
npm install mssql
node discover-schema.mjs
```

### Passo 3: Atualizar Mapeamento
Após rodar o script, compartilhe a saída. O mapeamento das transações precisa ser ajustado em:
- `src/lib/services/azure-sql.ts`

As funções que precisam de queries reais:
- `getTransactions(filters?)` — busca transações
- `getTransactionsByUser(usuarioId)` — transações por usuário
- `getDepositsToday()` — depósitos do dia
- `getSaquesToday()` — saques do dia

### Passo 4: Deploy
Após ajustar o mapeamento:
```bash
npm run typecheck
npm run build
git add -A
git commit -m "feat: mapeamento real Azure SQL"
git push origin main
vercel --prod --yes
```

---

## Regras de Monitoramento (8 Regras)

| # | Regra | Gatilho | Nível |
|---|-------|---------|-------|
| 1 | Depósitos > R$200 | Valor > R$200 | Baixo (200-1000) / Médio (>1000) |
| 2 | Múltiplos depósitos | >5 depósitos em 24h | Médio |
| 3 | Saque pós-depósito | Saque logo após rollover | Alto |
| 4 | Ganhos anormais | Crescimento >2.5x média | Alto |
| 5 | Abuso de cupons | Mesmo cupom >2x por usuário | Médio |
| 6 | Dispositivos compartilhados | Múltiplas contas mesmo device_id | Crítico |
| 7 | Alterações cadastrais | >3 mudanças de dados | Médio |
| 8 | Ranking diário | Top 20 depositantes/ganhadores/sacadores | — |

**Níveis:** Baixo → Médio → Alto → Crítico

---

## Estrutura do Projeto

```
src/
  types/index.ts              # Interfaces: User, Transaction, Alert, DailyRanking
  lib/
    services/
      google-sheets.ts        # Leitura da planilha (CSV público)
      azure-sql.ts            # Conexão Azure SQL (mock até liberar firewall)
    engine/
      rules.ts                # Motor das 8 regras de risco
      rankings.ts             # Cálculo de rankings (top 20)
    mock-data.ts              # Dados mock usados como fallback
  app/
    api/
      stats/route.ts          # GET /api/stats — dashboard stats
      alerts/route.ts         # GET /api/alerts — lista de alertas
      rankings/route.ts       # GET /api/rankings — rankings diários
      risk-chart/route.ts     # GET /api/risk-chart — dados do gráfico
    page.tsx                  # Dashboard principal
    alertas/page.tsx          # Página de alertas
    layout.tsx                # Layout com sidebar
  components/
    dashboard/
      stats-cards.tsx         # Cards de estatísticas
      alert-card.tsx          # Card de alerta individual
      ranking-table.tsx       # Tabela de ranking
      risk-chart.tsx          # Gráfico de barras (Recharts)
    layout/
      sidebar.tsx             # Barra lateral
    ui/                       # Componentes shadcn/ui
```

---

## Variáveis de Ambiente (Vercel)

Já configuradas em produção:

| Variável | Valor |
|----------|-------|
| GOOGLE_SHEET_ID | 1jGA297iefjWFTLbXZxrhsNAugjGjQLNuXXjIFzPVB10 |
| GOOGLE_SHEET_GID | 1463888907 |
| AZURE_SQL_SERVER | prod-wallet-server.database.windows.net |
| AZURE_SQL_DATABASE | wallet-api-database |
| AZURE_SQL_USER | analista_dados |
| AZURE_SQL_PASSWORD | A@n@list@Vinicius! |

---

## Comandos Úteis

```bash
npm run dev          # Desenvolvimento local (localhost:3000)
npm run build        # Build de produção
npm run typecheck    # Verificar tipos TypeScript
npm run lint         # ESLint
npm test             # Testes E2E (Playwright)
vercel --prod --yes  # Deploy produção
```

---

## Estado Atual (24/06/2026)

| Componente | Status |
|-----------|--------|
| Google Sheets | ✅ Conectado — 316 usuários |
| Azure SQL | ❌ Firewall bloqueando |
| Motor de Regras | ✅ Pronto e calibrado |
| API Endpoints | ✅ 4 rotas funcionando |
| Dashboard | ✅ No ar com dados mock |
| Deploy Vercel | ✅ https://monitor-risco.vercel.app |

---

## Próximo Passo

Conectar no Azure SQL do trabalho (IP liberado), descobrir as tabelas de transação e mapear as colunas reais em `src/lib/services/azure-sql.ts`.
