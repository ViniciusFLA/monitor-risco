# Monitor de Risco Operacional — Documentacao

## Visao Geral

Sistema de monitoramento automatico para identificar comportamentos suspeitos, prevenir fraudes e abuso de promocoes em plataforma de apostas.

**Stack:** Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui + Recharts  
**Deploy:** Vercel (producao)  
**URL:** https://monitor-risco.vercel.app  
**Repositorio:** https://github.com/ViniciusFLA/monitor-risco

---

## Fonte de Dados

### Azure SQL Server — CONECTADO

| Campo | Valor |
|-------|-------|
| Server | `prod-wallet-server.database.windows.net` |
| Database | `prod-wallet-api-database` |
| Usuario | `analista_dados` |
| View | `fn_RelatorioTransacoes(@DataInicio datetime2, @DataFim datetime2)` |

**Colunas da view (25):**

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| transactions_history_id | uniqueidentifier | ID do registro |
| transactions_history_transactions_id | uniqueidentifier | ID da transacao |
| transactions_history_player_id | uniqueidentifier | ID do usuario |
| transactions_history_player_name | varchar | Nome do usuario |
| transactions_history_player_username | varchar | Username |
| transactions_history_player_cpf | varchar | CPF |
| transactions_history_codigo_afiliado | varchar | Codigo afiliado |
| transactions_history_provider_id | int | ID do provedor |
| transactions_history_provider_name | varchar | Nome do provedor |
| transactions_history_game_id | int | ID do jogo |
| transactions_history_game_name | varchar | Nome do jogo |
| transactions_history_modality_type | varchar | Modalidade (BINGO, CASINO) |
| transactions_history_amount | decimal | Valor da transacao |
| transactions_history_previous_balance | decimal | Saldo anterior |
| transactions_history_current_balance | decimal | Saldo atual |
| transactions_history_type | varchar | Tipo (DEPOSIT, WITHDRAW, BET, GAIN, BONUS, REFUND_CREDIT) |
| transactions_history_created_at | datetime2 | Data/hora |

**Tipos de transacao e mapeamento interno:**

| Tipo Real | Qtd (jun/2026) | Tipo Interno |
|-----------|----------------|--------------|
| BET | 109.060 | aposta |
| GAIN | 20.842 | ganho |
| DEPOSIT | 181 | deposito |
| BONUS | 55 | bonus |
| WITHDRAW | 23 | saque |
| REFUND_CREDIT | 6 | estorno |

**Periodo de dados disponivel:** 10/02/2026 a 25/06/2026  
**Total DEPOSIT+WITHDRAW:** 325 transacoes | 128 usuarios distintos

---

## Regras de Monitoramento

### Regras Ativas (4)

| # | Regra | Gatilho | Nivel |
|---|-------|---------|-------|
| 1 | Depositos > R$200 | Cada deposito acima de R$200 | Baixo (R$200-1000) / Medio (>R$1000) |
| 2 | Multiplos depositos | >5 depositos em 24h pelo mesmo usuario | Medio |
| 4 | Ganhos anormais | Saldo cresce >2.5x a media da plataforma | Alto |
| 8 | Ranking diario | Top 20 depositantes / ganhadores / sacadores | — |

### Regras Pendentes (4)

| # | Regra | Motivo | Campo faltante na view |
|---|-------|--------|------------------------|
| 3 | Saque pos-deposito | Nao ha visibilidade de rollover | rollover_cumprido |
| 5 | Abuso de cupons | Nao ha visibilidade de cupons | cupom_id |
| 6 | Dispositivos compartilhados | Nao ha visibilidade de devices | dispositivo_id |
| 7 | Alteracoes cadastrais | Nao ha visibilidade de alteracoes | alteracoes_cadastrais |

### Niveis de Risco

| Nivel | Cor | Significado | Acao | Exemplo de gatilho |
|-------|-----|-------------|------|---------------------|
| Baixo | Azul | Comportamento atipico leve | Observar | Deposito de R$250 |
| Medio | Amarelo | Padrao suspeito, merece atencao | Investigar | 6 depositos no mesmo dia |
| Alto | Laranja | Risco significativo | Agir | Ganhos >2.5x media da plataforma |
| Critico | Vermelho | Fraude provavel | Bloquear | 5+ contas no mesmo dispositivo |

### Como cada regra define o nivel

| Regra | Baixo | Medio | Alto | Critico |
|-------|-------|-------|------|---------|
| Depositos > R$200 | R$200 a R$1000 | > R$1000 | — | — |
| Multiplos depositos | — | >5 em 24h | — | — |
| Ganhos anormais | — | — | >2.5x media | — |
| Dispositivos compartilhados* | — | — | 2-5 contas | >5 contas |

*\*Regra desativada*

---

## Dashboard

### Secoes

| Secao | Descricao |
|-------|-----------|
| **Filtro de data** | Dois campos (Inicio/Fim) + botao Filtrar. Por padrao, ultimos 30 dias |
| **Stats Cards** | Total usuarios, depositos, saques, alertas ativos/criticos no periodo |
| **Legenda de niveis** | Badges coloridos com tooltips explicando cada nivel de risco |
| **Grafico de risco** | Barras com distribuicao de alertas por nivel (baixo/medio/alto/critico) |
| **Alertas recentes** | Lista de alertas disparados no periodo com badge, descricao, usuario, valor |
| **Rankings** | 3 abas: Depositantes (R$ total), Ganhadores (saldo liquido), Sacadores (R$ total). Top 20 |

### Tooltips

Ao passar o mouse sobre qualquer badge de nivel (legenda, alertas, rankings), aparece:
- Significado do nivel
- Acao recomendada
- Exemplo de gatilho

---

## APIs

Todas aceitam parametros opcionais `?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD` para filtrar por periodo.

| Rota | Descricao | Retorno |
|------|-----------|---------|
| `GET /api/stats` | Estatisticas do dashboard | `{ total_usuarios, total_depositos_hoje, total_saques_hoje, alertas_ativos, alertas_criticos }` |
| `GET /api/alerts` | Lista de alertas (+ `?nivel=` e `?usuario_id=`) | `Alert[]` |
| `GET /api/rankings` | Rankings diarios | `DailyRanking` (top 20 de cada categoria) |
| `GET /api/risk-chart` | Dados do grafico de risco | `{ por_nivel: [{ nivel, quantidade }] }` |

### Fallback

Cada API segue a seguinte cadeia:
1. Azure SQL (conexao direta) — se falhar:
2. JSON estatico (`src/lib/data/azure-export.json`) — se falhar:
3. Dados mock (apenas quando nao ha dados nenhum)

---

## Estrutura do Projeto

```
src/
  types/index.ts                   # Interfaces: User, Transaction, Alert, DailyRanking, ChartData
  lib/
    services/
      azure-sql.ts                 # Conexao Azure SQL + fallback JSON estatico
      google-sheets.ts             # NAO USADO (mantido para referencia)
    engine/
      rules.ts                     # Motor das 8 regras (4 ativas)
      rankings.ts                  # Calculo de rankings (top 20)
    data/
      azure-export.json            # Dados exportados (fallback estatico)
    mock-data.ts                   # Dados mock (fallback final)
    utils.ts                       # Utilitarios (cn)
  app/
    api/
      stats/route.ts               # GET /api/stats
      alerts/route.ts              # GET /api/alerts
      rankings/route.ts            # GET /api/rankings
      risk-chart/route.ts          # GET /api/risk-chart
    page.tsx                       # Dashboard principal
    alertas/page.tsx               # Pagina de alertas (placeholder)
    layout.tsx                     # Layout com sidebar
  components/
    dashboard/
      stats-cards.tsx              # Cards de estatisticas
      alert-card.tsx               # Card de alerta individual
      ranking-table.tsx            # Tabela de ranking
      risk-chart.tsx               # Grafico de barras (Recharts)
    layout/
      sidebar.tsx                  # Barra lateral
    ui/                            # Componentes shadcn/ui
scripts/
  export-data.mjs                  # Exporta dados do Azure SQL para JSON
  discover-schema.mjs              # Descobre tabelas/views do Azure SQL
```

---

## Variaveis de Ambiente

Configuradas no Vercel (producao) e no `.env.local` (local):

| Variavel | Valor |
|----------|-------|
| AZURE_SQL_SERVER | prod-wallet-server.database.windows.net |
| AZURE_SQL_DATABASE | prod-wallet-api-database |
| AZURE_SQL_USER | analista_dados |
| AZURE_SQL_PASSWORD | A@n@list@Vinicius! |

---

## Exportacao de Dados

O Azure SQL bloqueia IPs externos (Vercel). Por isso, os dados sao exportados localmente (onde o IP esta liberado) e commitados como JSON estatico.

```bash
node scripts/export-data.mjs
```

Isso gera `src/lib/data/azure-export.json` com usuarios e transacoes do periodo completo.

### Periodo exportado

O script consulta de `2020-01-01` ate `2030-12-31` (periodo completo disponivel), filtrando apenas `DEPOSIT` e `WITHDRAW` (tipos usados pelas regras ativas).

---

## Distribuicao para Terceiros

### Arquivos de distribuicao

| Arquivo | Funcao |
|---------|--------|
| `criar-pacote.bat` | Gera ZIP com tudo necessario para enviar |
| `setup.bat` | Configuracao inicial (npm install + vercel login) |
| `update.bat` | Atualiza dados (exporta Azure + deploy Vercel) |
| `LEIA-ME.txt` | Instrucoes para o usuario final |

### Fluxo para o usuario final

1. Recebe o ZIP e extrai em `C:\monitor-risco`
2. Executa `setup.bat` (uma vez) — instala dependencias, faz login no Vercel
3. Executa `update.bat` (sempre que quiser atualizar) — exporta Azure SQL + deploy

### Pre-requisitos para o usuario final

- Windows
- Node.js LTS instalado
- Estar na rede do escritorio (IP liberado no Azure SQL)
- Ser adicionado ao time do Vercel (`team_YyUn47dMYmGCKAts47hgljDc`)

---

## Comandos Uteis

```bash
npm run dev              # Desenvolvimento local (localhost:3000)
npm run build            # Build de producao
npm run typecheck        # Verificar tipos TypeScript
npm run lint             # ESLint
npm test                 # Testes E2E (Playwright)
vercel --prod --yes      # Deploy producao
node scripts/export-data.mjs   # Exportar dados do Azure SQL
node discover-schema.mjs       # Descobrir schema do banco
```

---

## Estado Atual (25/06/2026)

| Componente | Status |
|-----------|--------|
| Azure SQL | Conectado (view fn_RelatorioTransacoes) |
| Google Sheets | Removido |
| Motor de Regras | 4 ativas, 4 pendentes |
| APIs | 4 rotas com dados reais + fallback estatico |
| Dashboard | No ar com filtro de data, rankings, alertas, tooltips |
| Deploy Vercel | https://monitor-risco.vercel.app |
| Distribuicao | Scripts setup.bat / update.bat prontos |

---

## Pendencias

| Pendencia | Impacto | Solucao |
|-----------|---------|---------|
| Firewall Azure bloqueia Vercel | Dados precisam ser exportados manualmente | Ativar "Allow Azure services" no Azure Portal |
| Regras 3, 5, 6, 7 desativadas | Menos cobertura de risco | Acesso a tabelas com dispositivo_id, cupom_id, rollover |
| Dados exportados so tem DEPOSIT/WITHDRAW | Ranking de ganhadores mostra so saldo de deposito/saque | Incluir BET/GAIN no export se necessario |
