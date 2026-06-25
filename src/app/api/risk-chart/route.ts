import { NextResponse } from "next/server"
import type { ChartData, User, Transaction } from "@/types"
import { mockChartData } from "@/lib/mock-data"

export async function GET(): Promise<NextResponse> {
  try {
    let chartData: ChartData | null = null

    try {
      const { getUsers } = await import("@/lib/services/google-sheets")
      const { getTransactions } = await import("@/lib/services/azure-sql")

      const [users, transactions] = await Promise.all([
        getUsers().catch(() => [] as User[]),
        getTransactions().catch(() => [] as Transaction[]),
      ])

      const { runAllRules } = await import("@/lib/engine/rules")
      const result = runAllRules(users, transactions)
      const alerts = result.alerts

      if (alerts.length > 0) {
        const aggregated: Record<string, number> = {}
        for (const alert of alerts) {
          aggregated[alert.nivel] = (aggregated[alert.nivel] ?? 0) + 1
        }

        chartData = {
          por_nivel: [
            { nivel: "critico", quantidade: aggregated.critico ?? 0 },
            { nivel: "alto", quantidade: aggregated.alto ?? 0 },
            { nivel: "medio", quantidade: aggregated.medio ?? 0 },
            { nivel: "baixo", quantidade: aggregated.baixo ?? 0 },
          ],
        }
      }
    } catch {
      chartData = mockChartData
    }

    if (!chartData) {
      chartData = mockChartData
    }

    return NextResponse.json(chartData, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar dados do grafico de risco" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
