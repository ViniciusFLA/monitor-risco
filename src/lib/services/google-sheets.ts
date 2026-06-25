import { User } from '@/types';

interface SheetRow {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  dispositivo_id: string;
  ip_ultimo_acesso: string;
  data_cadastro: string;
  status: string;
  alteracoes_cadastrais: string;
}

function getCredentials() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId || !email || !privateKey) return null;
  return { sheetId, email, privateKey };
}

function mapRowToUser(row: SheetRow): User {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    documento: row.documento,
    dispositivo_id: row.dispositivo_id,
    ip_ultimo_acesso: row.ip_ultimo_acesso,
    data_cadastro: row.data_cadastro,
    status: row.status as User['status'],
    alteracoes_cadastrais: parseInt(row.alteracoes_cadastrais ?? '0', 10),
  };
}

function getMockUsers(): User[] {
  return [
    {
      id: 'u1',
      nome: 'Carlos Eduardo Silva',
      email: 'carlos.silva@email.com',
      telefone: '(11) 98765-4321',
      documento: '***.123.456-**',
      dispositivo_id: 'dev_a1b2',
      ip_ultimo_acesso: '192.168.1.10',
      data_cadastro: '2024-01-15',
      status: 'ativo',
      alteracoes_cadastrais: 0,
    },
    {
      id: 'u2',
      nome: 'Ana Paula Oliveira',
      email: 'ana.oliveira@email.com',
      telefone: '(21) 97654-3210',
      documento: '***.234.567-**',
      dispositivo_id: 'dev_c3d4',
      ip_ultimo_acesso: '192.168.1.20',
      data_cadastro: '2024-02-20',
      status: 'ativo',
      alteracoes_cadastrais: 1,
    },
    {
      id: 'u3',
      nome: 'Roberto Nascimento',
      email: 'roberto.n@email.com',
      telefone: '(31) 91234-5678',
      documento: '***.345.678-**',
      dispositivo_id: 'dev_a1b2',
      ip_ultimo_acesso: '192.168.1.10',
      data_cadastro: '2024-03-10',
      status: 'ativo',
      alteracoes_cadastrais: 2,
    },
    {
      id: 'u4',
      nome: 'Fernanda Costa',
      email: 'fernanda.c@email.com',
      telefone: '(41) 96543-2109',
      documento: '***.456.789-**',
      dispositivo_id: 'dev_e5f6',
      ip_ultimo_acesso: '192.168.5.50',
      data_cadastro: '2024-01-25',
      status: 'bloqueado',
      alteracoes_cadastrais: 5,
    },
    {
      id: 'u5',
      nome: 'Marcos Vinicius Santos',
      email: 'marcos.santos@email.com',
      telefone: '(51) 95432-1098',
      documento: '***.567.890-**',
      dispositivo_id: 'dev_g7h8',
      ip_ultimo_acesso: '192.168.3.30',
      data_cadastro: '2024-04-01',
      status: 'ativo',
      alteracoes_cadastrais: 0,
    },
    {
      id: 'u6',
      nome: 'Juliana Pereira',
      email: 'juliana.p@email.com',
      telefone: '(61) 94321-0987',
      documento: '***.678.901-**',
      dispositivo_id: 'dev_i9j0',
      ip_ultimo_acesso: '192.168.1.10',
      data_cadastro: '2024-04-15',
      status: 'pendente',
      alteracoes_cadastrais: 3,
    },
    {
      id: 'u7',
      nome: 'Ricardo Almeida',
      email: 'ricardo.a@email.com',
      telefone: '(71) 93210-9876',
      documento: '***.789.012-**',
      dispositivo_id: 'dev_k1l2',
      ip_ultimo_acesso: '192.168.7.70',
      data_cadastro: '2024-05-01',
      status: 'ativo',
      alteracoes_cadastrais: 1,
    },
    {
      id: 'u8',
      nome: 'Patricia Lima',
      email: 'patricia.l@email.com',
      telefone: '(81) 92109-8765',
      documento: '***.890.123-**',
      dispositivo_id: 'dev_m3n4',
      ip_ultimo_acesso: '192.168.8.80',
      data_cadastro: '2024-05-10',
      status: 'ativo',
      alteracoes_cadastrais: 0,
    },
    {
      id: 'u9',
      nome: 'Lucas Ferreira',
      email: 'lucas.f@email.com',
      telefone: '(91) 91098-7654',
      documento: '***.901.234-**',
      dispositivo_id: 'dev_a1b2',
      ip_ultimo_acesso: '192.168.1.10',
      data_cadastro: '2024-05-20',
      status: 'bloqueado',
      alteracoes_cadastrais: 4,
    },
    {
      id: 'u10',
      nome: 'Cristina Rodrigues',
      email: 'cristina.r@email.com',
      telefone: '(12) 90987-6543',
      documento: '***.012.345-**',
      dispositivo_id: 'dev_o5p6',
      ip_ultimo_acesso: '192.168.9.90',
      data_cadastro: '2024-06-01',
      status: 'ativo',
      alteracoes_cadastrais: 0,
    },
  ];
}

export async function getUsers(): Promise<User[]> {
  const creds = getCredentials();

  if (!creds) {
    return getMockUsers();
  }

  try {
    const { google } = await import('googleapis');
    const auth = new google.auth.JWT({
      email: creds.email,
      key: creds.privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: creds.sheetId,
      range: 'A:J',
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return [];

    const headers = rows[0];
    const users: User[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const obj: Record<string, string> = {};
      headers.forEach((h: string, idx: number) => {
        obj[h] = row[idx] ?? '';
      });

      users.push(
        mapRowToUser({
          id: obj.id ?? obj.ID ?? obj.Id ?? '',
          nome: obj.nome ?? obj.Nome ?? obj.NOME ?? '',
          email: obj.email ?? obj.Email ?? '',
          telefone: obj.telefone ?? obj.Telefone ?? '',
          documento: obj.documento ?? obj.Documento ?? obj.CPF ?? '',
          dispositivo_id: obj.dispositivo_id ?? obj.dispositivoId ?? '',
          ip_ultimo_acesso: obj.ip_ultimo_acesso ?? obj.ip ?? '',
          data_cadastro: obj.data_cadastro ?? obj.dataCadastro ?? '',
          status: obj.status ?? obj.Status ?? 'ativo',
          alteracoes_cadastrais: obj.alteracoes_cadastrais ?? obj.alteracoesCadastrais ?? '0',
        })
      );
    }

    return users;
  } catch (error) {
    console.error('Erro ao buscar dados do Google Sheets:', error);
    return getMockUsers();
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function getUserChanges(usuarioId: string): Promise<number> {
  const user = await getUserById(usuarioId);
  return user?.alteracoes_cadastrais ?? 0;
}
