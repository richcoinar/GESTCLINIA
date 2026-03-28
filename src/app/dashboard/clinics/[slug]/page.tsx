"use client";

export const dynamic = "force-dynamic";
export const runtime = "edge";

import * as React from "react";
import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Building2, Users, CalendarCheck, FileText,
  Plus, ArrowLeft, Activity, Settings,
  ChevronRight, Search, Clock, UserPlus, Loader2
} from "lucide-react";

interface Clinic {
  id: string; name: string; slug: string; specialty: string | null;
  phone: string | null; email: string | null; address: string | null;
  city: string | null; status: string; ai_settings: Record<string, unknown>;
}

interface Patient {
  id: string; first_name: string; last_name: string;
  document_number: string | null; phone: string | null;
  email: string | null; status: string; created_at: string;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  service_name: string | null;
  status: string;
  notes: string | null;
  clinic_patients: { first_name: string; last_name: string } | null;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  specialty: string | null;
  status: string;
}

type TabKey = "overview" | "patients" | "appointments" | "staff" | "records" | "settings";

import { Sidebar } from "../../../../components/Sidebar";
import { useTranslation } from "../../../../lib/i18n";
import { useAuth } from "../../../../lib/hooks";

export default function ClinicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { user, role } = useAuth();
  const { t } = useTranslation();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [tab, setTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [slug, setSlug] = useState("");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    params.then((p) => {
      setSlug(p.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    
    async function loadData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { router.push("/login"); return; }

      const { data: clinicData } = await supabase
        .from("clinics")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!clinicData) {
        toast.error(t("clinic_not_found", "dashboard"));
        router.push("/dashboard");
        return;
      }

      setClinic(clinicData);

      // Load related data in parallel
      const [patientsRes, appointmentsRes, staffRes] = await Promise.all([
        supabase.from("clinic_patients").select("*").eq("clinic_id", clinicData.id).order("created_at", { ascending: false }),
        supabase.from("clinic_appointments").select("*, clinic_patients(first_name, last_name)").eq("clinic_id", clinicData.id).order("start_time", { ascending: false }).limit(50),
        supabase.from("clinic_staff").select("*").eq("clinic_id", clinicData.id).order("name", { ascending: true }),
      ]);

      setPatients(patientsRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setStaff(staffRes.data || []);
      setLoading(false);
    }

    loadData();
  }, [slug, supabase, router, t]);

  const tabs: { key: TabKey; label: string; icon: typeof Building2 }[] = [
    { key: "overview", label: t("tabs.overview", "clinic_detail"), icon: Activity },
    { key: "patients", label: t("tabs.patients", "clinic_detail"), icon: Users },
    { key: "appointments", label: t("tabs.appointments", "clinic_detail"), icon: CalendarCheck },
    { key: "staff", label: t("tabs.staff", "clinic_detail"), icon: Users },
    { key: "records", label: t("tabs.records", "clinic_detail"), icon: FileText },
    { key: "settings", label: t("tabs.settings", "clinic_detail"), icon: Settings },
  ];

  const filteredPatients = patients.filter(
    (p) => `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
      || p.document_number?.includes(search)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg-primary)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-accent)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gradient-surface)" }}>
      <Sidebar user={user} role={role} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto pl-72">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm mb-4 hover:underline"
          style={{ color: "var(--color-text-secondary)" }}>
          <ArrowLeft className="w-4 h-4" /> {t("my_clinics", "nav")}
        </Link>

        {/* Inner layout with header and tabs */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--color-primary)" + "26" }}>
                <Building2 className="w-6 h-6" style={{ color: "var(--color-primary-light)" }} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold truncate">{clinic?.name}</h1>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {clinic?.specialty || t("general", "admin")} • {clinic?.city || "—"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {tabs.map((tabItem) => (
                <button
                  key={tabItem.key}
                  onClick={() => setTab(tabItem.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    tab === tabItem.key
                      ? "bg-white/10 text-[var(--color-text-primary)] shadow-sm border border-white/10"
                      : "text-[var(--color-text-secondary)] hover:bg-white/5"
                  }`}
                >
                  <tabItem.icon className="w-4 h-4" />
                  {tabItem.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[60vh]">
            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: t("patients", "dashboard.stats"), value: patients.length, icon: Users, color: "var(--color-primary)" },
                    { label: t("appointments", "dashboard.stats"), value: appointments.length, icon: CalendarCheck, color: "var(--color-accent)" },
                    { label: t("staff", "tabs"), value: staff.length, icon: Users, color: "var(--color-warning)" },
                    { label: t("records", "tabs"), value: "—", icon: FileText, color: "var(--color-danger)" },
                  ].map((s, i) => (
                    <motion.div key={s.label} className="glass-card p-5"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}>
                      <s.icon className="w-5 h-5 mb-3" style={{ color: s.color }} />
                      <div className="text-2xl font-bold">{s.value}</div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                        {s.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4">{t("clinic_info", "clinic_detail")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                    {[
                      { label: t("specialty", "admin"), value: clinic?.specialty || t("general", "admin") },
                      { label: t("email", "auth"), value: clinic?.email || "—" },
                      { label: t("phone", "auth"), value: clinic?.phone || "—" },
                      { label: t("city", "admin"), value: clinic?.city || "—" },
                      { label: t("address", "clinic_detail"), value: clinic?.address || "—" },
                      { label: t("status", "settings"), value: clinic?.status === "active" ? t("active", "settings") : t("pending", "admin") },
                    ].map((info) => (
                      <div key={info.label} className="space-y-1">
                        <span className="block text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--color-text-muted)" }}>
                          {info.label}
                        </span>
                        <span className="font-medium">{info.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PATIENTS TAB */}
            {tab === "patients" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{t("patients", "dashboard.stats")}</h2>
                  <Link href={`/dashboard/clinics/${slug}/patients/new`}
                    className="btn-primary text-sm flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> {t("new_patient", "clinic_detail")}
                  </Link>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--color-text-muted)" }} />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-10" placeholder={t("search_placeholder", "clinic_detail")} />
                </div>

                {filteredPatients.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
                    <h3 className="text-lg font-semibold mb-2">{t("no_patients", "clinic_detail")}</h3>
                    <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                      {t("no_patients_desc", "clinic_detail")}
                    </p>
                    <Link href={`/dashboard/clinics/${slug}/patients/new`}
                      className="btn-primary inline-flex items-center gap-2 text-sm px-6">
                      <UserPlus className="w-4 h-4" /> {t("register_patient", "clinic_detail")}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredPatients.map((p, i) => (
                      <motion.div key={p.id}
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}>
                        <Link href={`/dashboard/clinics/${slug}/patients/${p.id}`}
                          className="glass-card p-4 flex items-center gap-4 group block h-full">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: "var(--color-primary)" + "26", color: "var(--color-primary-light)" }}>
                            {p.first_name[0]}{p.last_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{p.first_name} {p.last_name}</h3>
                            <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                              {p.document_number || "—"} • {p.phone || "—"}
                            </p>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
                            style={{
                              background: p.status === "active" ? "var(--color-success)" + "26" : "var(--color-danger)" + "26",
                              color: p.status === "active" ? "var(--color-success)" : "var(--color-danger)",
                            }}>
                            {p.status === "active" ? t("active", "settings") : t("inactive", "clinic_detail")}
                          </span>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition"
                            style={{ color: "var(--color-text-muted)" }} />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* APPOINTMENTS TAB */}
            {tab === "appointments" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{t("appointments", "dashboard.stats")}</h2>
                  <Link href={`/dashboard/clinics/${slug}/appointments/new`}
                    className="btn-primary text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" /> {t("new_appointment", "clinic_detail")}
                  </Link>
                </div>

                {appointments.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <CalendarCheck className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
                    <h3 className="text-lg font-semibold mb-2">{t("no_appointments", "clinic_detail")}</h3>
                    <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                      {t("no_appointments_desc", "clinic_detail")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {appointments.map((a, i) => (
                      <motion.div key={a.id} className="glass-card p-4 flex items-center gap-4"
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                           style={{ background: "var(--color-accent)" + "15" }}>
                          <Clock className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm">{a.service_name || t("general_consultation", "clinic_detail")}</h3>
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {a.clinic_patients?.first_name} {a.clinic_patients?.last_name} •{" "}
                            {new Date(a.start_time).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full font-bold uppercase"
                          style={{
                            background: a.status === "completed" ? "var(--color-success)" + "26"
                              : a.status === "cancelled" ? "var(--color-danger)" + "26"
                              : "var(--color-primary)" + "26",
                            color: a.status === "completed" ? "var(--color-success)"
                              : a.status === "cancelled" ? "var(--color-danger)"
                              : "var(--color-primary)",
                          }}>
                          {t(`status_${a.status}`, "clinic_detail")}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STAFF TAB */}
            {tab === "staff" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{t("tabs.staff", "clinic_detail")}</h2>
                  <Link href={`/dashboard/clinics/${slug}/staff/new`}
                    className="btn-primary text-sm flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> {t("add_staff", "clinic_detail")}
                  </Link>
                </div>

                {staff.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
                    <h3 className="text-lg font-semibold mb-2">{t("no_staff", "clinic_detail")}</h3>
                    <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                      {t("no_staff_desc", "clinic_detail")}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staff.map((s) => (
                      <div key={s.id} className="glass-card p-4 flex items-center gap-4 hover:border-white/20 transition">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ background: "var(--color-accent)" + "26", color: "var(--color-accent)" }}>
                          {s.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {s.role}
                            {s.specialty ? ` • ${s.specialty}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* RECORDS TAB */}
            {tab === "records" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-bold mb-6">{t("clinic_history", "clinic_detail")}</h2>
                <div className="glass-card p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8" style={{ color: "var(--color-text-muted)" }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t("access_from_patient", "clinic_detail")}</h3>
                  <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                    {t("access_from_patient_desc", "clinic_detail")}
                  </p>
                  <button onClick={() => setTab("patients")} className="btn-primary px-6 text-sm">
                    {t("view_patients", "clinic_detail")}
                  </button>
                </div>
              </motion.div>
            )}

            {/* SETTINGS TAB - Navigate via router */}
            {tab === "settings" && (
              <SettingsRedirect slug={slug} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SettingsRedirect({ slug }: { slug: string }) {
  const router = useRouter();
  const redirected = React.useRef(false);

  React.useEffect(() => {
    if (slug && !redirected.current) {
      redirected.current = true;
      router.push(`/dashboard/clinics/${slug}/settings`);
    }
  }, [slug, router]);

  return (
    <div className="flex h-[40vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: "var(--color-accent)" }} />
        <p className="text-sm font-medium">Cargando configuración...</p>
      </div>
    </div>
  );
}
