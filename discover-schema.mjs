// Script para descobrir tabelas e colunas do Azure SQL
// Uso: node discover-schema.mjs

import sql from 'mssql';

const config = {
  server: 'prod-wallet-server.database.windows.net',
  database: 'wallet-api-database',
  user: 'analista_dados',
  password: 'A@n@list@Vinicius!',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectTimeout: 15000,
  },
};

async function main() {
  try {
    console.log('Conectando ao Azure SQL...');
    await sql.connect(config);
    console.log('Conectado!\n');

    const tables = await sql.query(
      "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
    );

    for (const t of tables.recordset) {
      console.log(`\n=== ${t.TABLE_SCHEMA}.${t.TABLE_NAME} ===`);

      const cols = await sql.query(
        `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = '${t.TABLE_SCHEMA}' AND TABLE_NAME = '${t.TABLE_NAME}' 
         ORDER BY ORDINAL_POSITION`
      );

      for (const c of cols.recordset) {
        const len = c.CHARACTER_MAXIMUM_LENGTH ? `(${c.CHARACTER_MAXIMUM_LENGTH})` : '';
        console.log(`  ${c.COLUMN_NAME.padEnd(30)} ${c.DATA_TYPE}${len}`);
      }

      // Mostra as primeiras 3 linhas de cada tabela
      try {
        const sample = await sql.query(
          `SELECT TOP 3 * FROM [${t.TABLE_SCHEMA}].[${t.TABLE_NAME}]`
        );
        if (sample.recordset.length > 0) {
          console.log(`  --- Exemplo (${sample.recordset.length} linhas):`);
          for (const row of sample.recordset) {
            const preview = {};
            for (const key of Object.keys(row).slice(0, 8)) {
              const val = row[key];
              preview[key] = typeof val === 'string' && val.length > 50 ? val.slice(0, 50) + '...' : val;
            }
            console.log(`  ${JSON.stringify(preview)}`);
          }
        }
      } catch {
        // ignora erro de sample
      }
    }

    await sql.close();
    console.log('\nDescoberta concluida.');
  } catch (e) {
    console.error('ERRO:', e.message);
    if (e.message.includes('firewall')) {
      console.log('\nO IP atual nao esta liberado no firewall do Azure SQL.');
      console.log('Acesse: Azure Portal > prod-wallet-server > Networking > Firewall');
    }
    process.exit(1);
  }
}

main();
