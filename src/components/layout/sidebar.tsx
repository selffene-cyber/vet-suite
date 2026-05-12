"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/company", label: "Empresa" },
  { href: "/users", label: "Usuarios" },
  { href: "/tutors", label: "Tutores" },
  { href: "/patients", label: "Pacientes" },
  { href: "/veterinarians", label: "Médicos Veterinarios" },
  { href: "/medicines", label: "Medicamentos" },
  { href: "/prescriptions/new", label: "Nueva Receta" },
  { href: "/history", label: "Historial Recetas" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          P
        </div>
        <span className="text-lg font-bold text-foreground">PiwiSuite Vet</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors touch-target",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
            MV
          </div>
          <div className="text-xs">
            <p className="font-medium">Dr. Ejemplo</p>
            <p className="text-muted-foreground">Administrador</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}