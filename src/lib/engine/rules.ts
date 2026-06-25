import { Alert, DailyRanking, User, Transaction } from '@/types';
import {
  topDepositantes,
  topGanhadores,
  topSacadores,
  maiorCrescimento,
  contasComAlertas,
} from './rankings';

let alertCounter = 0;

function generateAlertId(): string {
  alertCounter += 1;
  return `alert-${alertCounter}-${Date.now()}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Rule 1: Depositos Acima de R$200.
 * - R$200-R$1000: nivel baixo
 * - >R$1000: nivel medio
 */
export function ruleDepositosAcima200(transactions: Transaction[], users: User[]): Alert[] {
  const userMap = new Map(users.map((u) => [u.id, u.nome]));
  const alerts: Alert[] = [];

  for (const t of transactions) {
    if (t.tipo !== 'deposito' || t.valor <= 200) continue;

    const nivel = t.valor > 1000 ? 'medio' : 'baixo';

    alerts.push({
      id: generateAlertId(),
      usuario_id: t.usuario_id,
      tipo_regra: 'depositos-acima-200',
      nivel,
      descricao: `Deposito de R$ ${t.valor.toFixed(2)} detectado para usuario ${userMap.get(t.usuario_id) ?? t.usuario_id}`,
      data: todayISO(),
      valores_relevantes: { valor: t.valor, transaction_id: t.id },
    });
  }

  return alerts;
}

/**
 * Rule 2: Multiplos Depositos (>5 em 24h).
 */
export function ruleMultiplosDepositos(transactions: Transaction[], users: User[]): Alert[] {
  const userMap = new Map(users.map((u) => [u.id, u.nome]));
  const alerts: Alert[] = [];
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  const userDeposits = new Map<string, Transaction[]>();

  for (const t of transactions) {
    if (t.tipo !== 'deposito') continue;
    const list = userDeposits.get(t.usuario_id) ?? [];
    list.push(t);
    userDeposits.set(t.usuario_id, list);
  }

  for (const [usuarioId, deposits] of userDeposits.entries()) {
    const recentDeposits = deposits.filter((d) => {
      const depositTime = new Date(d.data).getTime();
      return now - depositTime <= twentyFourHours;
    });

    if (recentDeposits.length > 5) {
      const totalValor = recentDeposits.reduce((sum, d) => sum + d.valor, 0);
      alerts.push({
        id: generateAlertId(),
        usuario_id: usuarioId,
        tipo_regra: 'multiplos-depositos',
        nivel: 'medio',
        descricao: `${recentDeposits.length} depositos em 24h para usuario ${userMap.get(usuarioId) ?? usuarioId}`,
        data: todayISO(),
        valores_relevantes: { quantidade: recentDeposits.length, total_valor: totalValor },
      });
    }
  }

  return alerts;
}

/**
 * Rule 3: Saque pos Deposito - saque imediatamente apos rollover concluido.
 */
export function ruleSaquePosDeposito(transactions: Transaction[], users: User[]): Alert[] {
  const userMap = new Map(users.map((u) => [u.id, u.nome]));
  const alerts: Alert[] = [];

  const userTransactions = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const list = userTransactions.get(t.usuario_id) ?? [];
    list.push(t);
    userTransactions.set(t.usuario_id, list);
  }

  for (const [usuarioId, txs] of userTransactions.entries()) {
    txs.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    for (let i = 0; i < txs.length; i++) {
      const tx = txs[i];
      if (tx.tipo !== 'saque' || !tx.rollover_cumprido) continue;

      const saqueTime = new Date(tx.data).getTime();
      const oneHour = 60 * 60 * 1000;

      for (let j = i - 1; j >= 0; j--) {
        const prevTx = txs[j];
        if (prevTx.tipo !== 'deposito') continue;

        const depositTime = new Date(prevTx.data).getTime();
        if (saqueTime - depositTime <= oneHour && prevTx.rollover_cumprido) {
          alerts.push({
            id: generateAlertId(),
            usuario_id: usuarioId,
            tipo_regra: 'saque-pos-deposito',
            nivel: 'alto',
            descricao: `Saque de R$ ${tx.valor.toFixed(2)} logo apos conclusao de rollover para usuario ${userMap.get(usuarioId) ?? usuarioId}`,
            data: todayISO(),
            valores_relevantes: {
              valor_saque: tx.valor,
              valor_deposito: prevTx.valor,
              saque_id: tx.id,
              deposito_id: prevTx.id,
            },
          });
          break;
        }

        if (saqueTime - depositTime > oneHour) break;
      }
    }
  }

  return alerts;
}

/**
 * Rule 4: Ganhos Anormais - crescimento de saldo significativamente acima da media da plataforma.
 */
export function ruleGanhosAnormais(transactions: Transaction[], users: User[], threshold = 2.5): Alert[] {
  const userMap = new Map(users.map((u) => [u.id, u.nome]));
  const alerts: Alert[] = [];

  const userDeposits = new Map<string, number>();
  const userSaques = new Map<string, number>();

  for (const t of transactions) {
    if (t.tipo === 'deposito') {
      userDeposits.set(t.usuario_id, (userDeposits.get(t.usuario_id) ?? 0) + t.valor);
    } else if (t.tipo === 'saque') {
      userSaques.set(t.usuario_id, (userSaques.get(t.usuario_id) ?? 0) + t.valor);
    }
  }

  const crescimentoList: { usuario_id: string; crescimento: number }[] = [];

  for (const usuarioId of new Set([...userDeposits.keys(), ...userSaques.keys()])) {
    const deposited = userDeposits.get(usuarioId) ?? 0;
    const withdrawn = userSaques.get(usuarioId) ?? 0;
    const saldo = deposited - withdrawn;
    const crescimento = deposited > 0 ? (saldo / deposited) * 100 : 0;
    crescimentoList.push({ usuario_id: usuarioId, crescimento });
  }

  const avgCrescimento =
    crescimentoList.length > 0
      ? crescimentoList.reduce((sum, c) => sum + c.crescimento, 0) / crescimentoList.length
      : 0;

  const plataformAverage = Math.max(avgCrescimento, 5);

  for (const entry of crescimentoList) {
    if (entry.crescimento > plataformAverage * threshold) {
      alerts.push({
        id: generateAlertId(),
        usuario_id: entry.usuario_id,
        tipo_regra: 'ganhos-anormais',
        nivel: 'alto',
        descricao: `Crescimento de ${entry.crescimento.toFixed(2)}% significativamente acima da media (${plataformAverage.toFixed(2)}%) para usuario ${userMap.get(entry.usuario_id) ?? entry.usuario_id}`,
        data: todayISO(),
        valores_relevantes: {
          crescimento: Math.round(entry.crescimento * 100) / 100,
          media_plataforma: Math.round(plataformAverage * 100) / 100,
        },
      });
    }
  }

  return alerts;
}

/**
 * Rule 5: Abuso de Cupons - uso recorrente do mesmo cupom pelo mesmo usuario.
 */
export function ruleAbusoCupons(transactions: Transaction[], users: User[]): Alert[] {
  const userMap = new Map(users.map((u) => [u.id, u.nome]));
  const alerts: Alert[] = [];

  const userCoupons = new Map<string, Map<string, number>>();

  for (const t of transactions) {
    if (!t.cupom_id) continue;

    const couponMap = userCoupons.get(t.usuario_id) ?? new Map<string, number>();
    couponMap.set(t.cupom_id, (couponMap.get(t.cupom_id) ?? 0) + 1);
    userCoupons.set(t.usuario_id, couponMap);
  }

  for (const [usuarioId, couponMap] of userCoupons.entries()) {
    for (const [cupomId, count] of couponMap.entries()) {
      if (count > 2) {
        alerts.push({
          id: generateAlertId(),
          usuario_id: usuarioId,
          tipo_regra: 'abuso-cupons',
          nivel: 'medio',
          descricao: `Cupom ${cupomId} utilizado ${count} vezes pelo usuario ${userMap.get(usuarioId) ?? usuarioId}`,
          data: todayISO(),
          valores_relevantes: { utilizacoes: count, cupom_id: cupomId },
        });
      }
    }
  }

  return alerts;
}

/**
 * Rule 6: Dispositivos Compartilhados - multiplas contas usando mesmo dispositivo_id ou IP.
 */
export function ruleDispositivosCompartilhados(users: User[]): Alert[] {
  const alerts: Alert[] = [];
  const SKIP = new Set(['', 'unknown', 'fcbbef4d-e46d-4336-8e09-452afb6e68b6']);
  const dispositivoMap = new Map<string, User[]>();

  for (const user of users) {
    const dev = user.dispositivo_id?.toLowerCase().trim() ?? '';
    if (SKIP.has(dev)) continue;
    const list = dispositivoMap.get(dev) ?? [];
    list.push(user);
    dispositivoMap.set(dev, list);
  }

  for (const [dev, userList] of dispositivoMap.entries()) {
    if (userList.length < 2) continue;

    alerts.push({
      id: generateAlertId(),
      usuario_id: userList[0].id,
      tipo_regra: 'dispositivos-compartilhados',
      nivel: userList.length > 5 ? 'critico' : 'alto',
      descricao: `${userList.length} contas compartilhando dispositivo ${dev}`,
      data: todayISO(),
      valores_relevantes: { total_contas: userList.length, dispositivo_id: dev },
    });
  }

  return alerts.slice(0, 50);
}

/**
 * Rule 7: Alteracoes Cadastrais frequentes (>3 alteracoes).
 */
export function ruleAlteracoesCadastrais(users: User[]): Alert[] {
  const alerts: Alert[] = [];

  for (const user of users) {
    if (user.alteracoes_cadastrais > 3) {
      alerts.push({
        id: generateAlertId(),
        usuario_id: user.id,
        tipo_regra: 'alteracoes-cadastrais',
        nivel: 'medio',
        descricao: `${user.alteracoes_cadastrais} alteracoes cadastrais detectadas para ${user.nome}`,
        data: todayISO(),
        valores_relevantes: {
          total_alteracoes: user.alteracoes_cadastrais,
        },
      });
    }
  }

  return alerts;
}

/**
 * Rule 8: Ranking Diario.
 */
export function ruleRankingDiario(
  transactions: Transaction[],
  users: User[],
  activeAlertCounts: Map<string, number>
): DailyRanking {
  return {
    data: todayISO(),
    top_depositantes: topDepositantes(transactions, users),
    top_ganhadores: topGanhadores(users, transactions),
    top_sacadores: topSacadores(transactions, users),
    maior_crescimento: maiorCrescimento(users, transactions),
    contas_alertas: contasComAlertas(activeAlertCounts, users),
  };
}

/**
 * Runs all risk monitoring rules and returns consolidated alerts and daily ranking.
 */
export function runAllRules(
  users: User[],
  transactions: Transaction[]
): { alerts: Alert[]; ranking: DailyRanking } {
  alertCounter = 0;

  const allAlerts: Alert[] = [
    ...ruleDepositosAcima200(transactions, users),
    ...ruleMultiplosDepositos(transactions, users),
    ...ruleSaquePosDeposito(transactions, users),
    ...ruleGanhosAnormais(transactions, users),
    ...ruleAbusoCupons(transactions, users),
    ...ruleDispositivosCompartilhados(users),
    ...ruleAlteracoesCadastrais(users),
  ].slice(0, 500);

  const activeAlertCounts = new Map<string, number>();
  for (const alert of allAlerts) {
    activeAlertCounts.set(alert.usuario_id, (activeAlertCounts.get(alert.usuario_id) ?? 0) + 1);
  }

  const ranking = ruleRankingDiario(transactions, users, activeAlertCounts);

  return { alerts: allAlerts, ranking };
}
