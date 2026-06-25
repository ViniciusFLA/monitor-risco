import { NextResponse } from "next/server"
import type { DailyRanking } from "@/types"
import { mockDailyRanking } from "@/lib/mock-data"

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const data_inicio = searchParams.get("data_inicio") ?? undefined
    const data_fim = searchParams.get("data_fim") ?? undefined

    let ranking: DailyRanking | null = null

    try {
      const { getData } = await import("@/lib/services/azure-sql")

      const { users, transactions } = await getData({ data_inicio, data_fim })

      if (users.length === 0 && transactions.length === 0) {
        ranking = mockDailyRanking
      } else {
        const { runAllRules } = await import("@/lib/engine/rules")
        const result = runAllRules(users, transactions)
        ranking = result.ranking
      }
    } catch {
      ranking = mockDailyRanking
    }

    return NextResponse.json(ranking, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar rankings diarios" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
