import { NextResponse } from "next/server"
import type { DailyRanking } from "@/types"
import { mockDailyRanking } from "@/lib/mock-data"

export async function GET(): Promise<NextResponse> {
  try {
    let ranking: DailyRanking | null = null

    try {
      const { getData } = await import("@/lib/services/azure-sql")

      const { users, transactions } = await getData()

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
