export type AlertLevel = 'baixo' | 'medio' | 'alto' | 'critico';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  dispositivo_id: string;
  ip_ultimo_acesso: string;
  data_cadastro: string;
  status: 'ativo' | 'bloqueado' | 'pendente';
  alteracoes_cadastrais: number;
}

export interface Transaction {
  id: string;
  usuario_id: string;
  tipo: 'deposito' | 'saque' | 'aposta';
  valor: number;
  data: string;
  cupom_id?: string;
  rollover_cumprido?: boolean;
}

export interface Alert {
  id: string;
  usuario_id: string;
  tipo_regra: string;
  nivel: AlertLevel;
  descricao: string;
  data: string;
  valores_relevantes: Record<string, number | string>;
}

export interface DailyRanking {
  data: string;
  top_depositantes: { usuario_id: string; nome: string; total: number }[];
  top_ganhadores: { usuario_id: string; nome: string; saldo: number }[];
  top_sacadores: { usuario_id: string; nome: string; total: number }[];
  maior_crescimento: { usuario_id: string; nome: string; crescimento: number }[];
  contas_alertas: { usuario_id: string; nome: string; alertas_ativos: number }[];
}

export interface DashboardStats {
  total_usuarios: number;
  total_depositos_hoje: number;
  total_saques_hoje: number;
  alertas_ativos: number;
  alertas_criticos: number;
}

export interface ChartData {
  por_nivel: { nivel: AlertLevel; quantidade: number }[];
}
