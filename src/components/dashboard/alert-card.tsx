"use client"

import { Clock, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AlertData {
  id: number
  nivel: "baixo" | "medio" | "alto" | "critico"
  regra: string
  usuario: string
  valores: {
    saque?: number
    deposito?: number
    limite?: number
    saldo?: number
    valor?: number
    [key: string]: number | undefined
  }
  timestamp: string
}

interface AlertCardProps {
  alert: AlertData
  onClick?: (alert: AlertData) => void
}

const nivelLabels: Record<string, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
  critico: "Crítico",
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export function AlertCard({ alert, onClick }: AlertCardProps) {
  const nivelLabel = nivelLabels[alert.nivel] ?? alert.nivel

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:border-primary/50"
      )}
      onClick={() => onClick?.(alert)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant={alert.nivel}>{nivelLabel}</Badge>
              <span className="text-xs text-muted-foreground truncate">
                {alert.regra}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="size-3" />
                {alert.usuario}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {new Date(alert.timestamp).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            {alert.valores.saque !== undefined && (
              <p className="text-sm font-mono tabular-nums">
                {formatCurrency(alert.valores.saque)}
              </p>
            )}
            {alert.valores.limite !== undefined && (
              <p className="text-[10px] text-muted-foreground">
                Limite: {formatCurrency(alert.valores.limite)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export type { AlertData }
