"use client"

import { useState } from "react"
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SortableColumn } from "@/components/ui/table"

interface RankingItem {
  name: string
  value: number
  alertLevel?: "baixo" | "medio" | "alto" | "critico"
}

interface RankingTableProps {
  title: string
  data: RankingItem[]
  valueLabel: string
}

const nivelLabels: Record<string, string> = {
  baixo: "Baixo",
  medio: "Medio",
  alto: "Alto",
  critico: "Critico",
}

const nivelTooltips: Record<string, string> = {
  baixo: "Baixo = observe\nAtipico leve, monitorar",
  medio: "Medio = investigue\nPadrao suspeito, merece atencao",
  alto: "Alto = aja\nRisco significativo, acao recomendada",
  critico: "Critico = bloqueie\nFraude provavel, acao imediata",
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

export function RankingTable({ title, data, valueLabel }: RankingTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const columns: SortableColumn[] = [
    { key: "position", label: "#", sortable: false, className: "w-12" },
    { key: "name", label: "Nome" },
    { key: "value", label: valueLabel },
    { key: "status", label: "Status", sortable: false, className: "w-24" },
  ]

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const dir = sortDir === "asc" ? 1 : -1
    if (sortKey === "name") return dir * a.name.localeCompare(b.name)
    if (sortKey === "value") return dir * (a.value - b.value)
    return 0
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader
            columns={columns}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={`${item.name}-${index}`}>
                <TableCell className="text-center text-muted-foreground text-xs">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-mono tabular-nums">
                  {valueLabel.includes("R$")
                    ? formatCurrency(item.value)
                    : `R$ ${formatNumber(item.value)}`}
                </TableCell>
                <TableCell>
                  {item.alertLevel ? (
                    <Badge variant={item.alertLevel} className="text-[10px] px-1.5 cursor-help" title={nivelTooltips[item.alertLevel] ?? ""}>
                      {nivelLabels[item.alertLevel]}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export type { RankingItem }
