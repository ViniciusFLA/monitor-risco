import { cn } from "@/lib/utils"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
}

function Table({ className, children, ...props }: TableProps) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

interface SortableColumn {
  key: string
  label: string
  sortable?: boolean
  className?: string
}

interface TableHeaderProps {
  columns: SortableColumn[]
  sortKey: string | null
  sortDir: "asc" | "desc"
  onSort: (key: string) => void
}

function TableHeader({ columns, sortKey, sortDir, onSort }: TableHeaderProps) {
  return (
    <thead data-slot="table-header" className="[&_tr]:border-b">
      <tr
        data-slot="table-row"
        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
      >
        {columns.map((col) => (
          <th
            key={col.key}
            data-slot="table-head"
            className={cn(
              "h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
              col.sortable !== false && "cursor-pointer select-none",
              col.className
            )}
            onClick={() => {
              if (col.sortable !== false) onSort(col.key)
            }}
          >
            <div className="inline-flex items-center gap-1">
              {col.label}
              {col.sortable !== false && (
                <span className="size-4">
                  {sortKey === col.key ? (
                    sortDir === "asc" ? (
                      <ArrowUp className="size-3.5" />
                    ) : (
                      <ArrowDown className="size-3.5" />
                    )
                  ) : (
                    <ArrowUpDown className="size-3.5 opacity-40" />
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    >
      {children}
    </tbody>
  )
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
}

function TableRow({ className, children, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
}

export { Table, TableHeader, TableBody, TableRow, TableCell }
export type { SortableColumn }
