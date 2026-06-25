import { NextResponse, type NextRequest } from "next/server"
import type { Alert, AlertLevel } from "@/types"
import { mockAlerts } from "@/lib/mock-data"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl
    const nivel = searchParams.get("nivel") as AlertLevel | null
    const usuario_id = searchParams.get("usuario_id")

    let alerts: Alert[] = []

    try {
      const { getData } = await import("@/lib/services/azure-sql")

      const { users, transactions } = await getData()

      if (users.length === 0 && transactions.length === 0) {
        alerts = mockAlerts
      } else {
        const { runAllRules } = await import("@/lib/engine/rules")
        const result = runAllRules(users, transactions)
        alerts = result.alerts
      }
    } catch {
      alerts = mockAlerts
    }

    if (nivel) {
      alerts = alerts.filter((a) => a.nivel === nivel)
    }

    if (usuario_id) {
      alerts = alerts.filter((a) => a.usuario_id === usuario_id)
    }

    return NextResponse.json(alerts, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar alertas" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
