import sql from 'mssql';
import fs from 'fs';
import path from 'path';

const config = {
  server: 'prod-wallet-server.database.windows.net',
  database: 'prod-wallet-api-database',
  user: 'analista_dados',
  password: 'A@n@list@Vinicius!',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectTimeout: 15000,
  },
};

function normalizeType(raw) {
  switch (raw) {
    case 'DEPOSIT': return 'deposito';
    case 'WITHDRAW': return 'saque';
    case 'BET': return 'aposta';
    case 'GAIN': return 'ganho';
    case 'BONUS': return 'bonus';
    case 'REFUND_CREDIT': return 'estorno';
    default: return 'aposta';
  }
}

function mapRowToTransaction(row) {
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

function extractUsers(rows) {
  const userMap = new Map();
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

async function main() {
  console.log('Conectando ao Azure SQL...');
  await sql.connect(config);
  console.log('Conectado!');

  console.log('Buscando dados do periodo completo...');
  const result = await sql.query(
    `SELECT * FROM fn_RelatorioTransacoes('2020-01-01', '2030-12-31') WHERE transactions_history_type IN ('DEPOSIT','WITHDRAW')`
  );

  const rows = result.recordset;
  console.log(`${rows.length} transacoes encontradas.`);

  const transactions = rows.map(mapRowToTransaction);
  const users = extractUsers(rows);
  console.log(`${users.length} usuarios distintos.`);

  const data = { users, transactions, exportado_em: new Date().toISOString() };

  const outDir = path.resolve('src/lib/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'azure-export.json');
  fs.writeFileSync(outPath, JSON.stringify(data));
  console.log(`Exportado para ${outPath}`);
  console.log(`Tamanho: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);

  await sql.close();
  process.exit(0);
}

main().catch(e => {
  console.error('ERRO:', e.message);
  process.exit(1);
});
