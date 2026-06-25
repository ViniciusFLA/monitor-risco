import { NextResponse } from "next/server"
import type { DailyRanking, User, Transaction } from "@/types"
import { mockDailyRanking } from "@/lib/mock-data"

export async function GET(): Promise<NextResponse> {
  try {
    let ranking: DailyRanking | null = null

    try {
      const { getUsers } = await import("@/lib/services/google-sheets")
      const { getTransactions } = await import("@/lib/services/azure-sql")

      const [users, transactions] = await Promise.all([
        getUsers().catch(() => [] as User[]),
        getTransactions().catch(() => [] as Transaction[]),
      ])

      const { runAllRules } = await import("@/lib/engine/rules")
      const result = runAllRules(users, transactions)
      ranking = result.ranking
    } catch {
      ranking = mockDailyRanking
    }

    if (!ranking || (ranking.top_depositantes.length === 0 && ranking.top_sacadores.length === 0)) {
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
