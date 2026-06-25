import { User } from '@/types';

function getMockUsers(): User[] {
  return [
    { id: 'u1', nome: 'Carlos Eduardo Silva', email: 'carlos.silva@email.com', telefone: '(11) 98765-4321', documento: '***.123.456-**', dispositivo_id: 'dev_a1b2', ip_ultimo_acesso: '192.168.1.10', data_cadastro: '2024-01-15', status: 'ativo', alteracoes_cadastrais: 0 },
    { id: 'u2', nome: 'Ana Paula Oliveira', email: 'ana.oliveira@email.com', telefone: '(21) 97654-3210', documento: '***.234.567-**', dispositivo_id: 'dev_c3d4', ip_ultimo_acesso: '192.168.1.20', data_cadastro: '2024-02-20', status: 'ativo', alteracoes_cadastrais: 1 },
    { id: 'u3', nome: 'Roberto Nascimento', email: 'roberto.n@email.com', telefone: '(31) 91234-5678', documento: '***.345.678-**', dispositivo_id: 'dev_a1b2', ip_ultimo_acesso: '192.168.1.10', data_cadastro: '2024-03-10', status: 'ativo', alteracoes_cadastrais: 2 },
    { id: 'u4', nome: 'Fernanda Costa', email: 'fernanda.c@email.com', telefone: '(41) 96543-2109', documento: '***.456.789-**', dispositivo_id: 'dev_e5f6', ip_ultimo_acesso: '192.168.5.50', data_cadastro: '2024-01-25', status: 'bloqueado', alteracoes_cadastrais: 5 },
    { id: 'u5', nome: 'Marcos Vinicius Santos', email: 'marcos.santos@email.com', telefone: '(51) 95432-1098', documento: '***.567.890-**', dispositivo_id: 'dev_g7h8', ip_ultimo_acesso: '192.168.3.30', data_cadastro: '2024-04-01', status: 'ativo', alteracoes_cadastrais: 0 },
    { id: 'u6', nome: 'Juliana Pereira', email: 'juliana.p@email.com', telefone: '(61) 94321-0987', documento: '***.678.901-**', dispositivo_id: 'dev_i9j0', ip_ultimo_acesso: '192.168.1.10', data_cadastro: '2024-04-15', status: 'pendente', alteracoes_cadastrais: 3 },
    { id: 'u7', nome: 'Ricardo Almeida', email: 'ricardo.a@email.com', telefone: '(71) 93210-9876', documento: '***.789.012-**', dispositivo_id: 'dev_k1l2', ip_ultimo_acesso: '192.168.7.70', data_cadastro: '2024-05-01', status: 'ativo', alteracoes_cadastrais: 1 },
    { id: 'u8', nome: 'Patricia Lima', email: 'patricia.l@email.com', telefone: '(81) 92109-8765', documento: '***.890.123-**', dispositivo_id: 'dev_m3n4', ip_ultimo_acesso: '192.168.8.80', data_cadastro: '2024-05-10', status: 'ativo', alteracoes_cadastrais: 0 },
    { id: 'u9', nome: 'Lucas Ferreira', email: 'lucas.f@email.com', telefone: '(91) 91098-7654', documento: '***.901.234-**', dispositivo_id: 'dev_a1b2', ip_ultimo_acesso: '192.168.1.10', data_cadastro: '2024-05-20', status: 'bloqueado', alteracoes_cadastrais: 4 },
    { id: 'u10', nome: 'Cristina Rodrigues', email: 'cristina.r@email.com', telefone: '(12) 90987-6543', documento: '***.012.345-**', dispositivo_id: 'dev_o5p6', ip_ultimo_acesso: '192.168.9.90', data_cadastro: '2024-06-01', status: 'ativo', alteracoes_cadastrais: 0 },
  ];
}

function parseCSVRow(row: string[], headers: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => { obj[h.toLowerCase().trim()] = (row[i] ?? '').trim(); });
  return obj;
}

function mapRowToUser(obj: Record<string, string>): User {
  return {
    id: obj.id ?? '',
    nome: obj.nome ?? '',
    email: obj.email ?? '',
    telefone: obj.telefone ?? '',
    documento: obj.documento ?? obj.cpf ?? '',
    dispositivo_id: obj.dispositivo_id ?? obj.dispositivoid ?? '',
    ip_ultimo_acesso: obj.ip_ultimo_acesso ?? obj.ip ?? '',
    data_cadastro: obj.data_cadastro ?? obj.datacadastro ?? '',
    status: (['ativo', 'bloqueado', 'pendente'].includes(obj.status?.toLowerCase() ?? '') ? obj.status.toLowerCase() : 'ativo') as User['status'],
    alteracoes_cadastrais: parseInt(obj.alteracoes_cadastrais ?? obj.alteracoescadastrais ?? '0', 10),
  };
}

function parseCSV(text: string): User[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const users: User[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim());
    if (row.length === 0 || row.every(c => !c)) continue;
    const obj = parseCSVRow(row, headers);
    users.push(mapRowToUser(obj));
  }

  return users;
}

async function fetchFromPublicSheet(): Promise<User[] | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const gid = process.env.GOOGLE_SHEET_GID;

  if (!sheetId) return null;

  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const text = await res.text();
    return parseCSV(text);
  } catch {
    return null;
  }
}

async function fetchFromPublishedSheet(): Promise<User[] | null> {
  const publishedUrl = process.env.GOOGLE_SHEET_PUBLISHED_URL;
  if (!publishedUrl) return null;

  try {
    const url = publishedUrl.includes('output=csv') ? publishedUrl : `${publishedUrl}&output=csv`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const text = await res.text();
    return parseCSV(text);
  } catch {
    return null;
  }
}

async function fetchWithServiceAccount(): Promise<User[] | null> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) return null;

  try {
    const { google } = await import('googleapis');
    const auth = new google.auth.JWT({
      email,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'A:J' });
    const rows = response.data.values;
    if (!rows || rows.length < 2) return null;

    const headers = rows[0];
    const users: User[] = [];
    for (let i = 1; i < rows.length; i++) {
      const obj = parseCSVRow(rows[i], headers);
      users.push(mapRowToUser(obj));
    }
    return users;
  } catch {
    return null;
  }
}

export async function getUsers(): Promise<User[]> {
  const result = await fetchWithServiceAccount()
    ?? await fetchFromPublishedSheet()
    ?? await fetchFromPublicSheet();

  if (result && result.length > 0) return result;

  console.warn('Google Sheets: usando dados mock (sem credenciais ou planilha inacessivel)');
  return getMockUsers();
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function getUserChanges(usuarioId: string): Promise<number> {
  const user = await getUserById(usuarioId);
  return user?.alteracoes_cadastrais ?? 0;
}
