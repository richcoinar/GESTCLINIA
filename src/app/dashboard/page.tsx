"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useAuth } from "../../lib/hooks";
import { useRouter } from "next/navigation";
import {
  Building2, Users, CalendarCheck, FileText,
  Plus, ChevronRight, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sidebar } from "../../components/Sidebar";
import { useTranslation } from "../../lib/i18n";

interface Clinic {
  id: string;
  name: string;
  slug: string;
  specialty: string | null;
  status: string;
  admin_email: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const { user, role, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    async function loadData() {
      if (!user) {
        router.push("/login");
        return;
      }

      let query = supabase
        .from("clinics")
        .select("*")
        .order("created_at", { ascending: false });

      // Super admins see all clinics; clinic admins see only their assigned ones; owners see theirs
      if (role === "super_admin") {
        // No filter - see all
      } else if (role === "clinic_admin") {
        query = query.eq("admin_id", user.id);
      } else {
        query = query.eq("owner_id", user.id);
      }

      const { data: clinicsData } = await query;
      setClinics(clinicsData || []);
      setLoading(false);
    }

    loadData();
  }, [authLoading, user, role, supabase, router]);

  const isSuperAdmin = role === "super_admin";

  const quickStats = [
    { icon: Building2, label: t("clinics", "dashboard.stats"), value: clinics.length, color: "var(--color-primary)" },
    { icon: Users, label: t("patients", "dashboard.stats"), value: "—", color: "var(--color-accent)" },
    { icon: CalendarCheck, label: t("appointments", "dashboard.stats"), value: "—", color: "var(--color-warning)" },
    { icon: FileText, label: t("records", "dashboard.stats"), value: "—", color: "var(--color-danger)" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gradient-surface)" }}>
      <Sidebar user={user} role={role} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto pl-72">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold">
              {isSuperAdmin 
                ? t("super_admin", "dashboard") 
                : `${t("welcome", "dashboard")}, ${(user?.email || "").split("@")[0]}`}
            </h1>
            {isSuperAdmin && (
              <Link href="/dashboard/admin"
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition"
                style={{ background: "var(--color-accent)" + "20", color: "var(--color-accent)" }}>
                <ShieldCheck className="w-4 h-4" /> {t("general_admin", "nav")}
              </Link>
            )}
          </div>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
            {isSuperAdmin 
              ? t("global_management", "dashboard") 
              : t("clinic_management", "dashboard")}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, i) => (
              <motion.div key={stat.label} className="glass-card p-5"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}>
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
                <div className="text-xs uppercase tracking-wider"
                  style={{ color: "var(--color-text-muted)" }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Clinics List */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {isSuperAdmin ? t("all_clinics", "admin") : t("my_clinics", "nav")}
            </h2>
            {isSuperAdmin && (
              <Link href="/dashboard/clinics/new"
                className="btn-primary text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> {t("new_clinic", "admin")}
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="glass-card p-6 animate-pulse h-32 rounded-lg"
                  style={{ background: "var(--color-surface-elevated)" }} />
              ))}
            </div>
          ) : clinics.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4"
                style={{ color: "var(--color-text-muted)" }} />
              <h3 className="text-lg font-semibold mb-2">
                {isSuperAdmin ? t("no_clinics_title", "admin") : t("no_clinics_assigned", "dashboard")}
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                {isSuperAdmin
                  ? t("no_clinics_subtitle", "admin")
                  : t("contact_admin_assign", "dashboard")}
              </p>
              {isSuperAdmin && (
                <Link href="/dashboard/clinics/new"
                  className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> {t("create_first_clinic", "admin")}
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clinics.map((clinic, i) => (
                <motion.div key={clinic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}>
                  <Link href={`/dashboard/clinics/${clinic.slug}`}
                    className="glass-card p-6 flex items-center gap-4 group block h-full">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-primary)" + "26" }}>
                      <Building2 className="w-6 h-6" style={{ color: "var(--color-primary-light)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{clinic.name}</h3>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {clinic.specialty || t("general", "admin")} • {clinic.status === "active" ? t("active", "admin") : t("pending", "admin")}
                        {isSuperAdmin && clinic.admin_email && ` • Admin: ${clinic.admin_email}`}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition"
                      style={{ color: "var(--color-text-muted)" }} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
