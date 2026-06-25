import { Transaction, User } from '@/types';

interface TransactionFilters {
  usuario_id?: string;
  tipo?: string;
  data_inicio?: string;
  data_fim?: string;
}

type RawRow = Record<string, unknown>;

function getConnectionConfig() {
  const server = process.env.AZURE_SQL_SERVER;
  const database = process.env.AZURE_SQL_DATABASE;
  const user = process.env.AZURE_SQL_USER;
  const password = process.env.AZURE_SQL_PASSWORD;

  if (!server || !database || !user || !password) return null;
  return { server, database, user, password };
}

function normalizeType(raw: string): Transaction['tipo'] {
  switch (raw) {
    case 'DEPOSIT':
      return 'deposito';
    case 'WITHDRAW':
      return 'saque';
    case 'BET':
      return 'aposta';
    case 'GAIN':
      return 'ganho';
    case 'BONUS':
      return 'bonus';
    case 'REFUND_CREDIT':
      return 'estorno';
    default:
      return 'aposta';
  }
}

function mapRowToTransaction(row: RawRow): Transaction {
  return {
    id: String(row.transactions_history_id ?? ''),
    usuario_id: String(row.transactions_history_player_id ?? ''),
    tipo: normalizeType(String(row.transactions_history_type ?? '')),
    valor: Number(row.transactions_history_amount ?? 0),
    data: row.transactions_history_created_at instanceof Date
      ? row.transactions_history_created_at.toISOString()
      : String(row.transactions_history_created_at ?? new Date().toISOString()),
  };
}

function extractUsers(rows: RawRow[]): User[] {
  const userMap = new Map<string, User>();

  for (const row of rows) {
    const id = String(row.transactions_history_player_id ?? '');
    if (!id || userMap.has(id)) continue;

    userMap.set(id, {
      id,
      nome: String(row.transactions_history_player_name ?? ''),
      email: '',
      telefone: '',
      documento: String(row.transactions_history_player_cpf ?? ''),
      dispositivo_id: '',
      ip_ultimo_acesso: '',
      data_cadastro: '',
      status: 'ativo',
      alteracoes_cadastrais: 0,
    });
  }

  return Array.from(userMap.values());
}

async function queryAzure(filters?: TransactionFilters): Promise<{ transactions: Transaction[]; users: User[] }> {
  const config = getConnectionConfig();
  if (!config) {
    return { transactions: [], users: [] };
  }

  const sql = await import('mssql');

  try {
    const pool = await sql.connect({
      server: config.server,
      database: config.database,
      user: config.user,
      password: config.password,
      options: { encrypt: true, trustServerCertificate: false },
    });

    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const dataInicio = filters?.data_inicio ?? thirtyDaysAgo;
    const dataFim = filters?.data_fim ?? today;

    const request = pool.request();
    request.input('DataInicio', dataInicio);
    request.input('DataFim', dataFim);

    let query = 'SELECT * FROM fn_RelatorioTransacoes(@DataInicio, @DataFim)';

    const conditions: string[] = [];

    if (filters?.usuario_id) {
      conditions.push('transactions_history_player_id = @UsuarioId');
      request.input('UsuarioId', filters.usuario_id);
    }

    if (filters?.tipo) {
      const tipoMap: Record<string, string> = {
        deposito: 'DEPOSIT',
        saque: 'WITHDRAW',
        aposta: 'BET',
        ganho: 'GAIN',
        bonus: 'BONUS',
        estorno: 'REFUND_CREDIT',
      };
      const realTipo = tipoMap[filters.tipo] ?? filters.tipo.toUpperCase();
      conditions.push('transactions_history_type = @Tipo');
      request.input('Tipo', realTipo);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await request.query(query);
    const rows = result.recordset as RawRow[];
    const transactions = rows.map(mapRowToTransaction);
    const users = extractUsers(rows);

    return { transactions, users };
  } catch (error) {
    console.error('Erro ao buscar dados do Azure SQL:', error);
    return { transactions: [], users: [] };
  }
}

export async function getData(filters?: TransactionFilters): Promise<{ users: User[]; transactions: Transaction[] }> {
  return queryAzure(filters);
}

export async function getUsers(): Promise<User[]> {
  const { users } = await queryAzure();
  return users;
}

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  const { transactions } = await queryAzure(filters);
  return transactions;
}

export async function getTransactionsByUser(usuarioId: string): Promise<Transaction[]> {
  return getTransactions({ usuario_id: usuarioId });
}

export async function getDepositsToday(): Promise<Transaction[]> {
  const today = new Date().toISOString().slice(0, 10);
  return getTransactions({ tipo: 'deposito', data_inicio: today });
}

export async function getSaquesToday(): Promise<Transaction[]> {
  const today = new Date().toISOString().slice(0, 10);
  return getTransactions({ tipo: 'saque', data_inicio: today });
}
