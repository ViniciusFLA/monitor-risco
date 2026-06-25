import type { User, Transaction, Alert, DashboardStats, DailyRanking, ChartData } from "@/types"

export const mockUsers: User[] = [
  { id: "u1", nome: "Carlos Eduardo Silva", email: "carlos.silva@email.com", telefone: "(11) 98765-4321", documento: "***.123.456-**", dispositivo_id: "dev_a1b2", ip_ultimo_acesso: "192.168.1.10", data_cadastro: "2024-01-15", status: "ativo", alteracoes_cadastrais: 0 },
  { id: "u2", nome: "Ana Paula Oliveira", email: "ana.oliveira@email.com", telefone: "(21) 97654-3210", documento: "***.234.567-**", dispositivo_id: "dev_c3d4", ip_ultimo_acesso: "192.168.1.20", data_cadastro: "2024-02-20", status: "ativo", alteracoes_cadastrais: 1 },
  { id: "u3", nome: "Roberto Nascimento", email: "roberto.n@email.com", telefone: "(31) 91234-5678", documento: "***.345.678-**", dispositivo_id: "dev_a1b2", ip_ultimo_acesso: "192.168.1.10", data_cadastro: "2024-03-10", status: "ativo", alteracoes_cadastrais: 2 },
  { id: "u4", nome: "Fernanda Costa", email: "fernanda.c@email.com", telefone: "(41) 96543-2109", documento: "***.456.789-**", dispositivo_id: "dev_e5f6", ip_ultimo_acesso: "192.168.5.50", data_cadastro: "2024-01-25", status: "bloqueado", alteracoes_cadastrais: 5 },
  { id: "u5", nome: "Marcos Vinicius Santos", email: "marcos.santos@email.com", telefone: "(51) 95432-1098", documento: "***.567.890-**", dispositivo_id: "dev_g7h8", ip_ultimo_acesso: "192.168.3.30", data_cadastro: "2024-04-01", status: "ativo", alteracoes_cadastrais: 0 },
  { id: "u6", nome: "Juliana Pereira", email: "juliana.p@email.com", telefone: "(61) 94321-0987", documento: "***.678.901-**", dispositivo_id: "dev_i9j0", ip_ultimo_acesso: "192.168.1.10", data_cadastro: "2024-04-15", status: "pendente", alteracoes_cadastrais: 3 },
  { id: "u7", nome: "Ricardo Almeida", email: "ricardo.a@email.com", telefone: "(71) 93210-9876", documento: "***.789.012-**", dispositivo_id: "dev_k1l2", ip_ultimo_acesso: "192.168.7.70", data_cadastro: "2024-05-01", status: "ativo", alteracoes_cadastrais: 1 },
]

export const mockTransactions: Transaction[] = [
  { id: "t1", usuario_id: "u1", tipo: "deposito", valor: 500, data: new Date().toISOString(), rollover_cumprido: false },
  { id: "t2", usuario_id: "u1", tipo: "deposito", valor: 1200, data: new Date().toISOString(), rollover_cumprido: true },
  { id: "t3", usuario_id: "u2", tipo: "deposito", valor: 350, data: new Date().toISOString(), rollover_cumprido: false },
  { id: "t4", usuario_id: "u2", tipo: "saque", valor: 280, data: new Date().toISOString(), rollover_cumprido: true },
  { id: "t5", usuario_id: "u3", tipo: "deposito", valor: 8000, data: new Date().toISOString(), rollover_cumprido: false },
  { id: "t6", usuario_id: "u3", tipo: "deposito", valor: 2000, data: new Date().toISOString(), rollover_cumprido: false },
  { id: "t7", usuario_id: "u4", tipo: "deposito", valor: 180, data: new Date().toISOString(), rollover_cumprido: false },
  { id: "t8", usuario_id: "u4", tipo: "saque", valor: 2500, data: new Date().toISOString(), rollover_cumprido: true },
  { id: "t9", usuario_id: "u5", tipo: "deposito", valor: 45000, data: new Date().toISOString(), rollover_cumprido: false },
  { id: "t10", usuario_id: "u5", tipo: "saque", valor: 12000, data: new Date().toISOString(), rollover_cumprido: false },
  { id: "t11", usuario_id: "u6", tipo: "deposito", valor: 650, data: new Date().toISOString(), rollover_cumprido: false },
  { id: "t12", usuario_id: "u7", tipo: "deposito", valor: 15000, data: new Date().toISOString(), rollover_cumprido: true },
  { id: "t13", usuario_id: "u7", tipo: "saque", valor: 18000, data: new Date().toISOString(), rollover_cumprido: true },
  { id: "t14", usuario_id: "u3", tipo: "deposito", valor: 400, data: new Date().toISOString() },
  { id: "t15", usuario_id: "u3", tipo: "deposito", valor: 350, data: new Date().toISOString() },
  { id: "t16", usuario_id: "u3", tipo: "deposito", valor: 500, data: new Date().toISOString() },
  { id: "t17", usuario_id: "u1", tipo: "deposito", valor: 300, data: new Date().toISOString() },
  { id: "t18", usuario_id: "u1", tipo: "deposito", valor: 250, data: new Date().toISOString() },
  { id: "t19", usuario_id: "u1", tipo: "deposito", valor: 400, data: new Date().toISOString() },
  { id: "t20", usuario_id: "u1", tipo: "saque", valor: 4500, data: new Date().toISOString(), rollover_cumprido: true },
  { id: "t21", usuario_id: "u2", tipo: "deposito", valor: 9500, data: new Date().toISOString(), rollover_cumprido: false },
  { id: "t22", usuario_id: "u5", tipo: "deposito", valor: 11000, data: new Date().toISOString(), rollover_cumprido: true },
]

export const mockAlerts: Alert[] = [
  { id: "alt_001", usuario_id: "u3", tipo_regra: "depositos-acima-200", nivel: "critico", descricao: "Deposito de R$ 8000,00 detectado e multiplos depositos em 24h.", data: new Date().toISOString().slice(0, 10), valores_relevantes: { valor: 8000 } },
  { id: "alt_002", usuario_id: "u3", tipo_regra: "multiplos-depositos", nivel: "critico", descricao: "6 depositos em 24h totalizando R$ 11250,00.", data: new Date().toISOString().slice(0, 10), valores_relevantes: { quantidade: 6, total_valor: 11250 } },
  { id: "alt_003", usuario_id: "u5", tipo_regra: "depositos-acima-200", nivel: "alto", descricao: "Deposito de R$ 45000,00 excede limite de perfil.", data: new Date().toISOString().slice(0, 10), valores_relevantes: { valor: 45000 } },
  { id: "alt_004", usuario_id: "u7", tipo_regra: "saque-pos-deposito", nivel: "alto", descricao: "Saque de R$ 18000,00 logo apos conclusao de rollover.", data: new Date().toISOString().slice(0, 10), valores_relevantes: { valor_saque: 18000, valor_deposito: 15000 } },
  { id: "alt_005", usuario_id: "u4", tipo_regra: "alteracoes-cadastrais", nivel: "medio", descricao: "5 alteracoes cadastrais detectadas.", data: new Date().toISOString().slice(0, 10), valores_relevantes: { total_alteracoes: 5 } },
  { id: "alt_006", usuario_id: "u3", tipo_regra: "saque-pos-deposito", nivel: "alto", descricao: "Saque de R$ 12000,00 apos rollover.", data: new Date().toISOString().slice(0, 10), valores_relevantes: { valor_saque: 12000 } },
  { id: "alt_007", usuario_id: "u6", tipo_regra: "alteracoes-cadastrais", nivel: "baixo", descricao: "3 alteracoes cadastrais detectadas.", data: new Date().toISOString().slice(0, 10), valores_relevantes: { total_alteracoes: 3 } },
  { id: "alt_008", usuario_id: "u1", tipo_regra: "multiplos-depositos", nivel: "medio", descricao: "5 depositos em 24h totalizando R$ 2650,00.", data: new Date().toISOString().slice(0, 10), valores_relevantes: { quantidade: 5, total_valor: 2650 } },
  { id: "alt_009", usuario_id: "u3", tipo_regra: "dispositivos-compartilhados", nivel: "critico", descricao: "Dispositivo dev_a1b2 compartilhado entre Roberto Nascimento e Carlos Eduardo Silva.", data: new Date().toISOString().slice(0, 10), valores_relevantes: { usuario_1: "u1", usuario_2: "u3", dispositivo_id: "dev_a1b2" } },
]

export const mockDashboardStats: DashboardStats = {
  total_usuarios: 7,
  total_depositos_hoje: 94130,
  total_saques_hoje: 37280,
  alertas_ativos: 9,
  alertas_criticos: 3,
}

export const mockDailyRanking: DailyRanking = {
  data: new Date().toISOString().split("T")[0],
  top_depositantes: [
    { usuario_id: "u5", nome: "Marcos Vinicius Santos", total: 56000 },
    { usuario_id: "u7", nome: "Ricardo Almeida", total: 15000 },
    { usuario_id: "u3", nome: "Roberto Nascimento", total: 11250 },
    { usuario_id: "u2", nome: "Ana Paula Oliveira", total: 9850 },
    { usuario_id: "u1", nome: "Carlos Eduardo Silva", total: 2650 },
  ],
  top_ganhadores: [
    { usuario_id: "u5", nome: "Marcos Vinicius Santos", saldo: 33000 },
    { usuario_id: "u1", nome: "Carlos Eduardo Silva", saldo: 1150 },
    { usuario_id: "u2", nome: "Ana Paula Oliveira", saldo: 9570 },
    { usuario_id: "u3", nome: "Roberto Nascimento", saldo: 11250 },
    { usuario_id: "u6", nome: "Juliana Pereira", saldo: 650 },
  ],
  top_sacadores: [
    { usuario_id: "u7", nome: "Ricardo Almeida", total: 18000 },
    { usuario_id: "u5", nome: "Marcos Vinicius Santos", total: 12000 },
    { usuario_id: "u1", nome: "Carlos Eduardo Silva", total: 4500 },
    { usuario_id: "u4", nome: "Fernanda Costa", total: 2500 },
    { usuario_id: "u2", nome: "Ana Paula Oliveira", total: 280 },
  ],
  maior_crescimento: [
    { usuario_id: "u5", nome: "Marcos Vinicius Santos", crescimento: 73.3 },
    { usuario_id: "u2", nome: "Ana Paula Oliveira", crescimento: 97.1 },
    { usuario_id: "u3", nome: "Roberto Nascimento", crescimento: 46.4 },
    { usuario_id: "u1", nome: "Carlos Eduardo Silva", crescimento: 53.2 },
    { usuario_id: "u6", nome: "Juliana Pereira", crescimento: 100.0 },
  ],
  contas_alertas: [
    { usuario_id: "u3", nome: "Roberto Nascimento", alertas_ativos: 4 },
    { usuario_id: "u5", nome: "Marcos Vinicius Santos", alertas_ativos: 1 },
    { usuario_id: "u7", nome: "Ricardo Almeida", alertas_ativos: 1 },
    { usuario_id: "u4", nome: "Fernanda Costa", alertas_ativos: 1 },
    { usuario_id: "u1", nome: "Carlos Eduardo Silva", alertas_ativos: 1 },
  ],
}

export const mockChartData: ChartData = {
  por_nivel: [
    { nivel: "critico", quantidade: 3 },
    { nivel: "alto", quantidade: 3 },
    { nivel: "medio", quantidade: 2 },
    { nivel: "baixo", quantidade: 1 },
  ],
}
