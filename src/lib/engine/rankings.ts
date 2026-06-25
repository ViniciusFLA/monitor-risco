import { Transaction, User } from '@/types';

interface UserBalance {
  usuario_id: string;
  nome: string;
  saldo: number;
}

interface UserGrowth {
  usuario_id: string;
  nome: string;
  crescimento: number;
}

interface RankingEntry {
  usuario_id: string;
  nome: string;
  total: number;
}

interface AlertAccount {
  usuario_id: string;
  nome: string;
  alertas_ativos: number;
}

/**
 * Calculates current balance for each user based on transaction history.
 */
export function calculateBalances(users: User[], transactions: Transaction[]): UserBalance[] {
  const userMap = new Map(users.map((u) => [u.id, u.nome]));
  const balanceMap = new Map<string, number>();

  for (const t of transactions) {
    const current = balanceMap.get(t.usuario_id) ?? 0;

    if (t.tipo === 'deposito') {
      balanceMap.set(t.usuario_id, current + t.valor);
    } else if (t.tipo === 'saque') {
      balanceMap.set(t.usuario_id, current - t.valor);
    }
    // apostas nao afetam saldo diretamente (saem do saldo via stake)
  }

  return Array.from(balanceMap.entries()).map(([usuario_id, saldo]) => ({
    usuario_id,
    nome: userMap.get(usuario_id) ?? 'Desconhecido',
    saldo,
  }));
}

/**
 * Calculates balance growth percentage for each user over time.
 */
export function calculateGrowth(users: User[], transactions: Transaction[]): UserGrowth[] {
  const userMap = new Map(users.map((u) => [u.id, u.nome]));
  const growthMap = new Map<string, { depositado: number; sacado: number }>();

  for (const t of transactions) {
    const entry = growthMap.get(t.usuario_id) ?? { depositado: 0, sacado: 0 };

    if (t.tipo === 'deposito') {
      entry.depositado += t.valor;
    } else if (t.tipo === 'saque') {
      entry.sacado += t.valor;
    }

    growthMap.set(t.usuario_id, entry);
  }

  return Array.from(growthMap.entries()).map(([usuario_id, entry]) => {
    const saldo = entry.depositado - entry.sacado;
    const crescimento = entry.depositado > 0 ? (saldo / entry.depositado) * 100 : 0;

    return {
      usuario_id,
      nome: userMap.get(usuario_id) ?? 'Desconhecido',
      crescimento: Math.round(crescimento * 100) / 100,
    };
  });
}

/**
 * Returns top N depositors by total deposit amount.
 */
export function topDepositantes(transactions: Transaction[], users: User[], limit = 20): RankingEntry[] {
  const userMap = new Map(users.map((u) => [u.id, u.nome]));
  const depositMap = new Map<string, number>();

  for (const t of transactions) {
    if (t.tipo !== 'deposito') continue;
    depositMap.set(t.usuario_id, (depositMap.get(t.usuario_id) ?? 0) + t.valor);
  }

  return Array.from(depositMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([usuario_id, total]) => ({
      usuario_id,
      nome: userMap.get(usuario_id) ?? 'Desconhecido',
      total,
    }));
}

/**
 * Returns top N users with highest current balance (ganhadores).
 */
export function topGanhadores(users: User[], transactions: Transaction[], limit = 20): { usuario_id: string; nome: string; saldo: number }[] {
  const balances = calculateBalances(users, transactions);
  return balances
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, limit)
    .map((b) => ({ usuario_id: b.usuario_id, nome: b.nome, saldo: b.saldo }));
}

/**
 * Returns top N withdrawers by total withdrawal amount.
 */
export function topSacadores(transactions: Transaction[], users: User[], limit = 20): RankingEntry[] {
  const userMap = new Map(users.map((u) => [u.id, u.nome]));
  const saqueMap = new Map<string, number>();

  for (const t of transactions) {
    if (t.tipo !== 'saque') continue;
    saqueMap.set(t.usuario_id, (saqueMap.get(t.usuario_id) ?? 0) + t.valor);
  }

  return Array.from(saqueMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([usuario_id, total]) => ({
      usuario_id,
      nome: userMap.get(usuario_id) ?? 'Desconhecido',
      total,
    }));
}

/**
 * Returns top N users with highest balance growth.
 */
export function maiorCrescimento(users: User[], transactions: Transaction[], limit = 20): { usuario_id: string; nome: string; crescimento: number }[] {
  const growth = calculateGrowth(users, transactions);
  return growth
    .sort((a, b) => b.crescimento - a.crescimento)
    .slice(0, limit)
    .map((g) => ({ usuario_id: g.usuario_id, nome: g.nome, crescimento: g.crescimento }));
}

/**
 * Returns users with active alerts, sorted by count.
 */
export function contasComAlertas(activeAlertCounts: Map<string, number>, users: User[], limit = 20): AlertAccount[] {
  const userMap = new Map(users.map((u) => [u.id, u.nome]));

  return Array.from(activeAlertCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([usuario_id, alertas_ativos]) => ({
      usuario_id,
      nome: userMap.get(usuario_id) ?? 'Desconhecido',
      alertas_ativos,
    }));
}
