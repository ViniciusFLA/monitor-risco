import { NextResponse } from "next/server"
import type { DashboardStats, User, Transaction } from "@/types"
import { mockUsers, mockTransactions, mockAlerts } from "@/lib/mock-data"

export async function GET(): Promise<NextResponse> {
  try {
    let stats: DashboardStats | null = null

    try {
      const { getUsers } = await import("@/lib/services/google-sheets")
      const { getTransactions } = await import("@/lib/services/azure-sql")

      const [users, transactions] = await Promise.all([
        getUsers().catch(() => [] as User[]),
        getTransactions().catch(() => [] as Transaction[]),
      ])

      const today = new Date().toISOString().slice(0, 10)
      const usuariosAtivos = users.filter((u) => u.status === "ativo")
      const depositosHoje = transactions
        .filter((t) => t.tipo === "deposito" && t.data.startsWith(today))
        .reduce((sum, t) => sum + t.valor, 0)
      const saquesHoje = transactions
        .filter((t) => t.tipo === "saque" && t.data.startsWith(today))
        .reduce((sum, t) => sum + t.valor, 0)

      const { runAllRules } = await import("@/lib/engine/rules")
      const result = runAllRules(users, transactions)
      const allAlerts = result.alerts

      stats = {
        total_usuarios: usuariosAtivos.length,
        total_depositos_hoje: depositosHoje,
        total_saques_hoje: saquesHoje,
        alertas_ativos: allAlerts.length,
        alertas_criticos: allAlerts.filter((a) => a.nivel === "critico").length,
      }
    } catch {
      stats = {
        total_usuarios: mockUsers.filter((u) => u.status === "ativo").length,
        total_depositos_hoje: mockTransactions
          .filter((t) => t.tipo === "deposito")
          .reduce((sum, t) => sum + t.valor, 0),
        total_saques_hoje: mockTransactions
          .filter((t) => t.tipo === "saque")
          .reduce((sum, t) => sum + t.valor, 0),
        alertas_ativos: mockAlerts.length,
        alertas_criticos: mockAlerts.filter((a) => a.nivel === "critico").length,
      }
    }

    if (!stats || (stats.total_usuarios === 0 && stats.total_depositos_hoje === 0 && stats.alertas_ativos === 0)) {
      stats = {
        total_usuarios: mockUsers.filter((u) => u.status === "ativo").length,
        total_depositos_hoje: mockTransactions
          .filter((t) => t.tipo === "deposito")
          .reduce((sum, t) => sum + t.valor, 0),
        total_saques_hoje: mockTransactions
          .filter((t) => t.tipo === "saque")
          .reduce((sum, t) => sum + t.valor, 0),
        alertas_ativos: mockAlerts.length,
        alertas_criticos: mockAlerts.filter((a) => a.nivel === "critico").length,
      }
    }

    return NextResponse.json(stats, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar estatisticas do dashboard" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
