"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, LayoutDashboard, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/alertas",
    label: "Alertas",
    icon: AlertTriangle,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border">
        <div className="flex items-center justify-center size-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Shield className="size-4" />
        </div>
        <span className="font-semibold text-sm tracking-tight">
          Monitor de Risco
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/50">
          <div className="size-2 rounded-full bg-emerald-500" />
          Sistema operacional
        </div>
      </div>
    </aside>
  )
}
