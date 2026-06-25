"use client"

import { Users, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface StatsData {
  total_usuarios: number
  total_depositos_hoje: number
  total_saques_hoje: number
  alertas_ativos: number
  alertas_criticos: number
}

interface StatsCardsProps {
  data: StatsData | null
  loading?: boolean
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR").format(value)

interface CardDef {
  key: keyof NonNullable<StatsCardsProps["data"]> & string
  title: string
  icon: typeof Users
  format: (value: number) => string
  color: string
  bg: string
  extra?: boolean
}

const cards: CardDef[] = [
  {
    key: "total_usuarios",
    title: "Total de Usuários",
    icon: Users,
    format: formatNumber,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    key: "total_depositos_hoje",
    title: "Depósitos Hoje",
    icon: ArrowDownCircle,
    format: formatCurrency,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    key: "total_saques_hoje",
    title: "Saques Hoje",
    icon: ArrowUpCircle,
    format: formatCurrency,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/20",
  },
  {
    key: "alertas_ativos",
    title: "Alertas Ativos",
    icon: AlertTriangle,
    format: formatNumber,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    extra: true,
  },
]

export function StatsCards({ data, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.key}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={cn("rounded-lg p-2 animate-pulse", card.bg)}>
                  <card.icon className={cn("size-5", card.color)} />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        }
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.key}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={cn("rounded-lg p-2", card.bg)}>
                  <card.icon className={cn("size-5", card.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className="text-sm text-muted-foreground">--</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        }
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const value = data[card.key]
        return (
          <Card key={card.key}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={cn("rounded-lg p-2", card.bg)}>
                  <card.icon className={cn("size-5", card.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {card.format(value as number)}
                  </p>
                  {card.extra && data.alertas_criticos > 0 && (
                    <p className="text-xs text-red-500 font-medium">
                      {data.alertas_criticos} criticos
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
