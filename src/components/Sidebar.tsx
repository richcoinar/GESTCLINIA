"use client";

import {
  Stethoscope, Building2, CalendarCheck, FileText,
  BrainCircuit, LogOut, Settings, Activity, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "../lib/i18n";
import { createClient } from "../lib/supabase/client";

interface SidebarProps {
  user: any;
  role: string | null;
}

export function Sidebar({ user, role }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isSuperAdmin = role === "super_admin";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { icon: Activity, label: t("dashboard", "nav"), href: "/dashboard" },
    { icon: Building2, label: t("my_clinics", "nav"), href: "/dashboard/clinics" },
    { icon: BrainCircuit, label: t("ai_assistant", "nav"), href: "/dashboard/assistant" },
    { icon: Settings, label: t("settings", "nav"), href: "/dashboard/settings" },
    ...(isSuperAdmin
      ? [{ icon: ShieldCheck, label: t("general_admin", "nav"), href: "/dashboard/admin" }]
      : []),
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r p-4 flex flex-col z-50"
      style={{ borderColor: "var(--color-border-light)", background: "var(--color-surface-sidebar)" }}>
      
      {/* Header: Logo + Theme + Language */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between px-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--gradient-brand)" }}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              GEST<span style={{ color: "var(--color-accent)" }}>CLINIA</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="px-2">
          <LanguageSelector />
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.label} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
              style={{
                background: isActive ? "var(--color-surface-elevated)" : "transparent",
                color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                border: isActive ? "1px solid var(--color-border-light)" : "none",
              }}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-4" style={{ borderColor: "var(--color-border-light)" }}>
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold truncate"
            style={{ background: "var(--gradient-brand)" }}>
            {(user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email || ""}</p>
            {isSuperAdmin && (
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
                {t("general_admin", "nav")}
              </p>
            )}
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full hover:bg-white/5 transition"
          style={{ color: "var(--color-text-muted)" }}>
          <LogOut className="w-4 h-4" /> {t("logout", "nav")}
        </button>
      </div>
    </aside>
  );
}
