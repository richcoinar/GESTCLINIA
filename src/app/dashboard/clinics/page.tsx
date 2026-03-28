"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope, Building2, Plus, Activity, BrainCircuit,
  Settings, ChevronRight, MapPin, Moon, Sun
} from "lucide-react";
import { ThemeToggle } from "../../../components/ThemeToggle";

interface Clinic {
  id: string; name: string; slug: string; specialty: string | null;
  city: string | null; status: string; created_at: string;
}

export default function ClinicsListPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("clinics")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      setClinics(data || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gradient-surface)" }}>
      {/* Sidebar */}
      <aside className="w-64 border-r p-4 flex flex-col shrink-0"
        style={{ borderColor: "var(--color-border-light)", background: "var(--color-surface-sidebar)" }}>
        <div className="mb-8 px-2">
          <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--gradient-brand)" }}>
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            GEST<span style={{ color: "var(--color-accent)" }}>CLINIA</span>
          </span>
        </Link>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { icon: Activity, label: "Panel", href: "/dashboard" },
            { icon: Building2, label: "Mis Clínicas", href: "/dashboard/clinics", active: true },
            { icon: BrainCircuit, label: "Asistente IA", href: "/dashboard/assistant" },
            { icon: Settings, label: "Configuración", href: "/dashboard/settings" },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
              style={{
                background: item.active ? "var(--color-surface-elevated)" : "transparent",
                color: item.active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                border: item.active ? "1px solid var(--color-border-light)" : "none",
              }}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="pt-4 mt-4 border-t" style={{ borderColor: "var(--color-border-light)" }}>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Mis Clínicas</h1>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Gestiona todas tus clínicas desde aquí
              </p>
            </div>
            <Link href="/dashboard/clinics/new" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nueva Clínica
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card animate-shimmer h-44 rounded-lg" />
              ))}
            </div>
          ) : clinics.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
              <h3 className="text-xl font-semibold mb-2">Aún no tienes clínicas</h3>
              <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                Crea tu primera clínica y configura su asistente virtual, equipo médico y gestión de pacientes.
              </p>
              <Link href="/dashboard/clinics/new"
                className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Crear Mi Primera Clínica
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinics.map((clinic, i) => (
                <motion.div key={clinic.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}>
                  <Link href={`/dashboard/clinics/${clinic.slug}`}
                    className="glass-card p-6 block group h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: "oklch(0.55 0.18 220 / 0.15)" }}>
                        <Building2 className="w-6 h-6" style={{ color: "oklch(0.70 0.15 220)" }} />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: clinic.status === "active" ? "oklch(0.72 0.19 145 / 0.15)" : "oklch(0.78 0.16 80 / 0.15)",
                          color: clinic.status === "active" ? "oklch(0.72 0.19 145)" : "oklch(0.78 0.16 80)",
                        }}>
                        {clinic.status === "active" ? "Activa" : "Pendiente"}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-1 group-hover:text-white transition">{clinic.name}</h3>
                    <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                      {clinic.specialty || "General"}
                    </p>

                    {clinic.city && (
                      <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                        <MapPin className="w-3 h-3" /> {clinic.city}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t flex items-center justify-between"
                      style={{ borderColor: "var(--color-border-light)" }}>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        Creada: {new Date(clinic.created_at).toLocaleDateString("es-AR")}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition"
                        style={{ color: "var(--color-text-muted)" }} />
                    </div>
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
