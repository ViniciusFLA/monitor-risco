import { Transaction } from '@/types';

interface TransactionFilters {
  usuario_id?: string;
  tipo?: Transaction['tipo'];
  data_inicio?: string;
  data_fim?: string;
}

function getConnectionConfig() {
  const server = process.env.AZURE_SQL_SERVER;
  const database = process.env.AZURE_SQL_DATABASE;
  const user = process.env.AZURE_SQL_USER;
  const password = process.env.AZURE_SQL_PASSWORD;

  if (!server || !database || !user || !password) return null;
  return { server, database, user, password };
}

function getMockTransactions(): Transaction[] {
  return [
    {
      id: 't1',
      usuario_id: 'u1',
      tipo: 'deposito',
      valor: 500,
      data: new Date().toISOString(),
      rollover_cumprido: false,
    },
    {
      id: 't2',
      usuario_id: 'u1',
      tipo: 'deposito',
      valor: 1200,
      data: new Date().toISOString(),
      rollover_cumprido: true,
    },
    {
      id: 't3',
      usuario_id: 'u2',
      tipo: 'deposito',
      valor: 350,
      data: new Date().toISOString(),
      rollover_cumprido: false,
    },
    {
      id: 't4',
      usuario_id: 'u2',
      tipo: 'saque',
      valor: 280,
      data: new Date().toISOString(),
      rollover_cumprido: true,
    },
    {
      id: 't5',
      usuario_id: 'u3',
      tipo: 'deposito',
      valor: 8000,
      data: new Date().toISOString(),
      rollover_cumprido: false,
    },
    {
      id: 't6',
      usuario_id: 'u3',
      tipo: 'aposta',
      valor: 500,
      data: new Date(Date.now() - 3600000).toISOString(),
      cupom_id: 'CUPOM10',
    },
    {
      id: 't7',
      usuario_id: 'u3',
      tipo: 'deposito',
      valor: 2000,
      data: new Date(Date.now() - 7200000).toISOString(),
      rollover_cumprido: false,
    },
    {
      id: 't8',
      usuario_id: 'u4',
      tipo: 'deposito',
      valor: 180,
      data: new Date().toISOString(),
      rollover_cumprido: false,
    },
    {
      id: 't9',
      usuario_id: 'u4',
      tipo: 'saque',
      valor: 2500,
      data: new Date().toISOString(),
      rollover_cumprido: true,
    },
    {
      id: 't10',
      usuario_id: 'u5',
      tipo: 'deposito',
      valor: 100,
      data: new Date().toISOString(),
      rollover_cumprido: false,
    },
    {
      id: 't11',
      usuario_id: 'u6',
      tipo: 'deposito',
      valor: 450,
      data: new Date().toISOString(),
      rollover_cumprido: false,
    },
    {
      id: 't12',
      usuario_id: 'u7',
      tipo: 'deposito',
      valor: 15000,
      data: new Date().toISOString(),
      rollover_cumprido: true,
    },
    {
      id: 't13',
      usuario_id: 'u7',
      tipo: 'saque',
      valor: 18000,
      data: new Date().toISOString(),
      rollover_cumprido: true,
    },
    {
      id: 't14',
      usuario_id: 'u8',
      tipo: 'deposito',
      valor: 300,
      data: new Date(Date.now() - 3600000).toISOString(),
      rollover_cumprido: false,
      cupom_id: 'CUPOM10',
    },
    {
      id: 't15',
      usuario_id: 'u8',
      tipo: 'deposito',
      valor: 220,
      data: new Date(Date.now() - 5400000).toISOString(),
      cupom_id: 'CUPOM10',
    },
    {
      id: 't16',
      usuario_id: 'u1',
      tipo: 'deposito',
      valor: 300,
      data: new Date(Date.now() - 1800000).toISOString(),
      cupom_id: 'CUPOM50',
    },
    {
      id: 't17',
      usuario_id: 'u1',
      tipo: 'deposito',
      valor: 250,
      data: new Date(Date.now() - 900000).toISOString(),
      cupom_id: 'CUPOM50',
    },
    {
      id: 't18',
      usuario_id: 'u1',
      tipo: 'deposito',
      valor: 400,
      data: new Date(Date.now() - 600000).toISOString(),
      cupom_id: 'CUPOM50',
    },
    {
      id: 't19',
      usuario_id: 'u9',
      tipo: 'deposito',
      valor: 600,
      data: new Date().toISOString(),
      rollover_cumprido: false,
    },
    {
      id: 't20',
      usuario_id: 'u10',
      tipo: 'deposito',
      valor: 5000,
      data: new Date().toISOString(),
      rollover_cumprido: false,
    },
    {
      id: 't21',
      usuario_id: 'u3',
      tipo: 'aposta',
      valor: 1000,
      data: new Date(Date.now() - 1800000).toISOString(),
      cupom_id: 'CUPOM10',
    },
    {
      id: 't22',
      usuario_id: 'u3',
      tipo: 'aposta',
      valor: 1500,
      data: new Date(Date.now() - 900000).toISOString(),
      cupom_id: 'CUPOM10',
    },
    {
      id: 't23',
      usuario_id: 'u3',
      tipo: 'aposta',
      valor: 2000,
      data: new Date(Date.now() - 600000).toISOString(),
      cupom_id: 'CUPOM10',
    },
    {
      id: 't24',
      usuario_id: 'u1',
      tipo: 'deposito',
      valor: 200,
      data: new Date(Date.now() - 2400000).toISOString(),
      rollover_cumprido: true,
    },
    {
      id: 't25',
      usuario_id: 'u1',
      tipo: 'saque',
      valor: 2000,
      data: new Date().toISOString(),
      rollover_cumprido: true,
    },
    {
      id: 't26',
      usuario_id: 'u9',
      tipo: 'deposito',
      valor: 150,
      data: new Date(Date.now() - 3600000).toISOString(),
      cupom_id: 'CUPOM10',
    },
    {
      id: 't27',
      usuario_id: 'u9',
      tipo: 'deposito',
      valor: 350,
      data: new Date(Date.now() - 7200000).toISOString(),
      cupom_id: 'CUPOM10',
    },
    {
      id: 't28',
      usuario_id: 'u3',
      tipo: 'deposito',
      valor: 400,
      data: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 't29',
      usuario_id: 'u3',
      tipo: 'deposito',
      valor: 350,
      data: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 't30',
      usuario_id: 'u3',
      tipo: 'deposito',
      valor: 500,
      data: new Date(Date.now() - 5400000).toISOString(),
    },
  ];
}

function mapRowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: String(row.id ?? row.ID ?? row.Id ?? ''),
    usuario_id: String(row.usuario_id ?? row.UsuarioId ?? row.usuarioId ?? ''),
    tipo: String(row.tipo ?? row.Tipo ?? 'deposito') as Transaction['tipo'],
    valor: Number(row.valor ?? row.Valor ?? 0),
    data: String(row.data ?? row.Data ?? new Date().toISOString()),
    cupom_id: row.cupom_id != null ? String(row.cupom_id) : undefined,
    rollover_cumprido: row.rollover_cumprido != null ? Boolean(row.rollover_cumprido) : undefined,
  };
}

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  const config = getConnectionConfig();

  if (!config) {
    const mockData = getMockTransactions();
    if (!filters) return mockData;

    return mockData.filter((t) => {
      if (filters.usuario_id && t.usuario_id !== filters.usuario_id) return false;
      if (filters.tipo && t.tipo !== filters.tipo) return false;
      if (filters.data_inicio && t.data < filters.data_inicio) return false;
      if (filters.data_fim && t.data > filters.data_fim) return false;
      return true;
    });
  }

  try {
    const sql = await import('mssql');

    let query = 'SELECT * FROM Transacoes WHERE 1=1';
    const params: { name: string; value: unknown }[] = [];

    if (filters?.usuario_id) {
      query += ' AND usuario_id = @usuarioId';
      params.push({ name: 'usuarioId', value: filters.usuario_id });
    }
    if (filters?.tipo) {
      query += ' AND tipo = @tipo';
      params.push({ name: 'tipo', value: filters.tipo });
    }
    if (filters?.data_inicio) {
      query += ' AND data >= @dataInicio';
      params.push({ name: 'dataInicio', value: filters.data_inicio });
    }
    if (filters?.data_fim) {
      query += ' AND data <= @dataFim';
      params.push({ name: 'dataFim', value: filters.data_fim });
    }

    const pool = await sql.connect({
      server: config.server,
      database: config.database,
      user: config.user,
      password: config.password,
      options: { encrypt: true, trustServerCertificate: false },
    });

    const request = pool.request();
    for (const p of params) {
      request.input(p.name, p.value);
    }

    const result = await request.query(query);
    return result.recordset.map(mapRowToTransaction);
  } catch (error) {
    console.error('Erro ao buscar transacoes do Azure SQL:', error);
    return [];
  }
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
