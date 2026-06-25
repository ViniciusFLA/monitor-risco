"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RiskChart } from "@/components/dashboard/risk-chart"
import { AlertCard } from "@/components/dashboard/alert-card"
import { RankingTable } from "@/components/dashboard/ranking-table"
import type { AlertData } from "@/components/dashboard/alert-card"
import type { RiskChartData } from "@/components/dashboard/risk-chart"
import type { RankingItem } from "@/components/dashboard/ranking-table"

interface StatsData {
  total_usuarios: number
  total_depositos_hoje: number
  total_saques_hoje: number
  alertas_ativos: number
  alertas_criticos: number
}

interface RankingsData {
  top_depositantes: RankingItem[]
  top_ganhadores: RankingItem[]
  top_sacadores: RankingItem[]
}

const MOCK_STATS: StatsData = {
  total_usuarios: 12847,
  total_depositos_hoje: 1458320,
  total_saques_hoje: 987650,
  alertas_ativos: 23,
  alertas_criticos: 5,
}

const MOCK_ALERTS: AlertData[] = [
  {
    id: 1,
    nivel: "critico",
    regra: "Saque acima do limite diário de R$ 10.000",
    usuario: "João Silva",
    valores: { saque: 50000, limite: 10000 },
    timestamp: "2026-06-24T10:30:00Z",
  },
  {
    id: 2,
    nivel: "alto",
    regra: "Depósito suspeito em conta inativa",
    usuario: "Maria Santos",
    valores: { deposito: 75000, saldo: 1200 },
    timestamp: "2026-06-24T09:45:00Z",
  },
  {
    id: 3,
    nivel: "medio",
    regra: "Múltiplas transações em sequência rápida",
    usuario: "Pedro Costa",
    valores: { valor: 15000 },
    timestamp: "2026-06-24T09:30:00Z",
  },
  {
    id: 4,
    nivel: "baixo",
    regra: "Alteração de dados cadastrais",
    usuario: "Ana Oliveira",
    valores: {},
    timestamp: "2026-06-24T09:15:00Z",
  },
  {
    id: 5,
    nivel: "critico",
    regra: "Conta bloqueada por atividade fraudulenta",
    usuario: "Carlos Souza",
    valores: { saque: 120000, limite: 5000 },
    timestamp: "2026-06-24T08:00:00Z",
  },
  {
    id: 6,
    nivel: "alto",
    regra: "Transferência para conta sinalizada",
    usuario: "Fernanda Lima",
    valores: { valor: 45000 },
    timestamp: "2026-06-24T07:30:00Z",
  },
  {
    id: 7,
    nivel: "medio",
    regra: "Login de localização incomum",
    usuario: "Ricardo Alves",
    valores: {},
    timestamp: "2026-06-24T07:00:00Z",
  },
  {
    id: 8,
    nivel: "critico",
    regra: "Volume anormal de saques em 1 hora",
    usuario: "Juliana Rocha",
    valores: { saque: 95000, limite: 20000 },
    timestamp: "2026-06-24T06:45:00Z",
  },
  {
    id: 9,
    nivel: "baixo",
    regra: "Atualização de perfil de risco",
    usuario: "Gabriel Martins",
    valores: {},
    timestamp: "2026-06-24T06:30:00Z",
  },
  {
    id: 10,
    nivel: "medio",
    regra: "Tentativa de saque sem saldo",
    usuario: "Lucia Ferreira",
    valores: { saque: 5000, saldo: 1200 },
    timestamp: "2026-06-24T06:00:00Z",
  },
]

const MOCK_RANKINGS: RankingsData = {
  top_depositantes: [
    { name: "Maria Santos", value: 250000, alertLevel: "baixo" },
    { name: "João Silva", value: 198500, alertLevel: "critico" },
    { name: "Ana Oliveira", value: 175000, alertLevel: "baixo" },
    { name: "Pedro Costa", value: 162300, alertLevel: "medio" },
    { name: "Carlos Souza", value: 148900, alertLevel: "critico" },
    { name: "Fernanda Lima", value: 135600, alertLevel: "alto" },
    { name: "Ricardo Alves", value: 124700, alertLevel: "baixo" },
    { name: "Juliana Rocha", value: 112400, alertLevel: "critico" },
  ],
  top_ganhadores: [
    { name: "Gabriel Martins", value: 89200, alertLevel: "baixo" },
    { name: "Lucia Ferreira", value: 67500, alertLevel: "medio" },
    { name: "Rafael Dias", value: 54300 },
    { name: "Camila Nunes", value: 48900, alertLevel: "baixo" },
    { name: "Bruno Oliveira", value: 42100 },
    { name: "Amanda Costa", value: 38700, alertLevel: "alto" },
    { name: "Diego Santos", value: 35400 },
    { name: "Patricia Lima", value: 32100, alertLevel: "baixo" },
  ],
  top_sacadores: [
    { name: "João Silva", value: 50000, alertLevel: "critico" },
    { name: "Juliana Rocha", value: 95000, alertLevel: "critico" },
    { name: "Carlos Souza", value: 120000, alertLevel: "critico" },
    { name: "Fernanda Lima", value: 45000, alertLevel: "alto" },
    { name: "Lucia Ferreira", value: 5000, alertLevel: "medio" },
    { name: "Pedro Costa", value: 15000, alertLevel: "medio" },
    { name: "Rafael Dias", value: 8200 },
    { name: "Amanda Costa", value: 6400 },
  ],
}

const MOCK_RISK_CHART: RiskChartData[] = [
  { nivel: "baixo", quantidade: 12 },
  { nivel: "medio", quantidade: 8 },
  { nivel: "alto", quantidade: 6 },
  { nivel: "critico", quantidade: 5 },
]

type Tab = "depositantes" | "ganhadores" | "sacadores"

const tabConfig: { key: Tab; label: string; dataKey: keyof RankingsData }[] = [
  { key: "depositantes", label: "Depositantes", dataKey: "top_depositantes" },
  { key: "ganhadores", label: "Ganhadores", dataKey: "top_ganhadores" },
  { key: "sacadores", label: "Sacadores", dataKey: "top_sacadores" },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [rankings, setRankings] = useState<RankingsData | null>(null)
  const [riskChart, setRiskChart] = useState<RiskChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("depositantes")

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await new Promise((r) => setTimeout(r, 600))

      setStats(MOCK_STATS)
      setAlerts(MOCK_ALERTS)
      setRankings(MOCK_RANKINGS)
      setRiskChart(MOCK_RISK_CHART)
      setLoading(false)
    }

    loadData()
  }, [])

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento de risco operacional em tempo real
          </p>
        </div>
      </div>

      <StatsCards data={stats} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="rounded-xl border bg-card animate-pulse h-[380px]" />
          ) : (
            <RiskChart data={riskChart} />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Alertas Recentes</h2>
            <span className="text-xs text-muted-foreground">
              {loading ? "--" : `${alerts.length} alertas`}
            </span>
          </div>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border bg-card h-[88px] animate-pulse"
                />
              ))
            : alerts
                .slice(0, 10)
                .map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Rankings</h2>
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            {tabConfig.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="rounded-xl border bg-card h-[400px] animate-pulse" />
        ) : (
          rankings && (
            <RankingTable
              title={tabConfig.find((t) => t.key === activeTab)!.label}
              data={rankings[tabConfig.find((t) => t.key === activeTab)!.dataKey]}
              valueLabel="R$ Total"
            />
          )
        )}
      </div>
    </div>
  )
}
