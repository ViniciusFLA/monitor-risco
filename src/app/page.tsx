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

      try {
        const [statsRes, alertsRes, rankingsRes, chartRes] = await Promise.all([
          fetch("/api/stats").then((r) => r.json()),
          fetch("/api/alerts").then((r) => r.json()),
          fetch("/api/rankings").then((r) => r.json()),
          fetch("/api/risk-chart").then((r) => r.json()),
        ])

        setStats({
          total_usuarios: statsRes.total_usuarios ?? 0,
          total_depositos_hoje: statsRes.total_depositos_hoje ?? 0,
          total_saques_hoje: statsRes.total_saques_hoje ?? 0,
          alertas_ativos: statsRes.alertas_ativos ?? 0,
          alertas_criticos: statsRes.alertas_criticos ?? 0,
        })

        const alertList: AlertData[] = (alertsRes as Array<Record<string, unknown>>).map((a, i) => ({
          id: i + 1,
          nivel: (a.nivel as AlertData["nivel"]) ?? "baixo",
          regra: String(a.descricao ?? ""),
          usuario: String(a.usuario_id ?? ""),
          timestamp: String(a.data ?? ""),
          valores: (a.valores_relevantes as Record<string, number | undefined>) ?? {},
        }))
        setAlerts(alertList)

        setRiskChart(
          (chartRes.por_nivel as RiskChartData[]) ?? [
            { nivel: "critico", quantidade: 0 },
            { nivel: "alto", quantidade: 0 },
            { nivel: "medio", quantidade: 0 },
            { nivel: "baixo", quantidade: 0 },
          ]
        )

        const r = rankingsRes as Record<string, Array<{ nome: string; total?: number; saldo?: number }>>
        setRankings({
          top_depositantes: (r.top_depositantes ?? []).map((d) => ({
            name: d.nome,
            value: d.total ?? 0,
          })),
          top_ganhadores: (r.top_ganhadores ?? []).map((g) => ({
            name: g.nome,
            value: g.saldo ?? 0,
          })),
          top_sacadores: (r.top_sacadores ?? []).map((s) => ({
            name: s.nome,
            value: s.total ?? 0,
          })),
        })
      } catch {
        // mantem estados vazios
      }

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
            : alerts.length === 0
            ? (
                <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                  Nenhum alerta ativo no momento
                </div>
              )
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
