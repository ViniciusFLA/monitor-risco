"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface RiskChartData {
  nivel: string
  quantidade: number
}

interface RiskChartProps {
  data: RiskChartData[]
}

const nivelColors: Record<string, string> = {
  baixo: "#38bdf8",
  medio: "#fbbf24",
  alto: "#fb923c",
  critico: "#ef4444",
}

const nivelLabels: Record<string, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
  critico: "Crítico",
}

export function RiskChart({ data }: RiskChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alertas por Nível</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            Nenhum dado de alertas disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Alertas por Nível</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="nivel"
              tickFormatter={(value: string) => nivelLabels[value] ?? value}
              tick={{ fontSize: 12, fill: "oklch(0.556 0 0)" }}
              axisLine={{ stroke: "oklch(0.922 0 0)" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "oklch(0.556 0 0)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "oklch(0.97 0 0)" }}
              contentStyle={{
                borderRadius: "0.5rem",
                border: "1px solid oklch(0.922 0 0)",
                background: "oklch(1 0 0)",
                fontSize: "0.875rem",
              }}
              formatter={(value) => [value, "Alertas"] as [React.ReactNode, string]}
              labelFormatter={(label) =>
                `Nivel ${nivelLabels[label as string] ?? label}`
              }
            />
            <Bar dataKey="quantidade" radius={[4, 4, 0, 0]} maxBarSize={64}>
              {data.map((entry) => (
                <Cell
                  key={entry.nivel}
                  fill={nivelColors[entry.nivel] ?? "#6b7280"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export type { RiskChartData }
