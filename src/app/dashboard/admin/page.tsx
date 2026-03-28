"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useAuth } from "../../../lib/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2, Users, ShieldCheck, Plus,
  ChevronRight, MapPin, Shield, Loader2,
  UserPlus, Trash2, AlertTriangle
} from "lucide-react";
import { Sidebar } from "../../../components/Sidebar";
import { useTranslation } from "../../../lib/i18n";
import { toast } from "sonner";

interface Clinic {
  id: string;
  name: string;
  slug: string;
  specialty: string | null;
  city: string | null;
  status: string;
  admin_email: string | null;
  created_at: string;
}

interface GestAdmin {
  id: string;
  email: string;
  is_protected: boolean;
  created_at: string;
}

export default function AdminPage() {
  const { user, role, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [admins, setAdmins] = useState<GestAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"clinics" | "admins">("clinics");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    if (role !== "super_admin") { router.push("/dashboard"); return; }

    async function loadData() {
      const [clinicsRes, adminsRes] = await Promise.all([
        supabase.from("clinics").select("*").order("created_at", { ascending: false }),
        supabase.from("gestclinia_admins").select("*").order("created_at", { ascending: true }),
      ]);
      setClinics(clinicsRes.data || []);
      setAdmins(adminsRes.data || []);
      setLoading(false);
    }
    loadData();
  }, [authLoading, user, role, router, supabase]);

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      toast.error(t("valid_email_error", "admin"));
      return;
    }
    setAddingAdmin(true);
    const { error } = await supabase.from("gestclinia_admins").insert({
      email: newAdminEmail.toLowerCase().trim(),
      is_protected: false,
    });
    if (error) {
      if (error.code === "23505") {
        toast.error(t("admin_exists_error", "admin"));
      } else {
        toast.error("Error: " + error.message);
      }
    } else {
      toast.success(t("admin_added_success", "admin"));
      setNewAdminEmail("");
      // Reload admins
      const { data } = await supabase.from("gestclinia_admins").select("*").order("created_at", { ascending: true });
      setAdmins(data || []);
    }
    setAddingAdmin(false);
  };

  const handleDeleteAdmin = async (admin: GestAdmin) => {
    if (admin.is_protected) {
      toast.error(t("protected_admin_error", "admin"));
      return;
    }
    if (!confirm(t("delete_admin_confirm", "admin").replace("{email}", admin.email))) return;
    setDeletingId(admin.id);
    const { error } = await supabase.from("gestclinia_admins").delete().eq("id", admin.id);
    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success(t("admin_deleted_success", "admin"));
      setAdmins(admins.filter((a) => a.id !== admin.id));
    }
    setDeletingId(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-surface)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-accent)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gradient-surface)" }}>
      <Sidebar user={user} role={role} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto pl-72">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7" style={{ color: "var(--color-accent)" }} />
            <h1 className="text-2xl font-bold">{t("general_admin_title", "admin")}</h1>
          </div>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
            {t("general_admin_subtitle", "admin")}
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: "clinics" as const, label: t("clinics", "admin"), icon: Building2, count: clinics.length },
              { key: "admins" as const, label: t("administrators", "admin"), icon: Shield, count: admins.length },
            ].map((t_tab) => (
              <button key={t_tab.key} onClick={() => setTab(t_tab.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tab === t_tab.key ? "var(--color-surface-elevated)" : "transparent",
                  color: tab === t_tab.key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  border: tab === t_tab.key ? "1px solid var(--color-border-light)" : "1px solid transparent",
                }}>
                <t_tab.icon className="w-4 h-4" />
                {t_tab.label}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-1"
                  style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-muted)" }}>
                  {t_tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* CLINICS TAB */}
          {tab === "clinics" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t("all_clinics", "admin")}</h2>
                <Link href="/dashboard/clinics/new" className="btn-primary flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> {t("new_clinic", "admin")}
                </Link>
              </div>

              {clinics.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
                  <h3 className="text-xl font-semibold mb-2">{t("no_clinics_title", "admin")}</h3>
                  <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                    {t("no_clinics_subtitle", "admin")}
                  </p>
                  <Link href="/dashboard/clinics/new" className="btn-primary inline-flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> {t("create_first_clinic", "admin")}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clinics.map((clinic, i) => (
                    <motion.div key={clinic.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}>
                      <Link href={`/dashboard/clinics/${clinic.slug}`}
                        className="glass-card p-6 block group h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: "var(--color-primary)" + "26" }}>
                            <Building2 className="w-6 h-6" style={{ color: "var(--color-primary-light)" }} />
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{
                              background: clinic.status === "active" ? "var(--color-success)" + "26" : "var(--color-warning)" + "26",
                              color: clinic.status === "active" ? "var(--color-success)" : "var(--color-warning)",
                            }}>
                            {clinic.status === "active" ? t("active", "admin") : t("pending", "admin")}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1 group-hover:text-white transition">{clinic.name}</h3>
                        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>
                          {clinic.specialty || t("general", "admin")}
                        </p>
                        {clinic.admin_email && (
                          <p className="text-xs flex items-center gap-1 mb-1" style={{ color: "var(--color-text-muted)" }}>
                            <Users className="w-3 h-3" /> {t("admin_label", "admin")}: {clinic.admin_email}
                          </p>
                        )}
                        {clinic.city && (
                          <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                            <MapPin className="w-3 h-3" /> {clinic.city}
                          </p>
                        )}
                        <div className="mt-4 pt-3 border-t flex items-center justify-between"
                          style={{ borderColor: "var(--color-border-light)" }}>
                          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {new Date(clinic.created_at).toLocaleDateString()}
                          </span>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition"
                            style={{ color: "var(--color-text-muted)" }} />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADMINS TAB */}
          {tab === "admins" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">{t("general_administrators", "admin")}</h2>
              </div>

              {/* Add Admin Form */}
              <div className="glass-card p-5 mb-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                  {t("add_new_admin", "admin")}
                </h3>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="nuevo-admin@email.com"
                    className="input-field flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
                  />
                  <button
                    onClick={handleAddAdmin}
                    disabled={addingAdmin}
                    className="btn-primary flex items-center gap-2 text-sm px-5"
                  >
                    {addingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {t("add", "common")}
                  </button>
                </div>
              </div>

              {/* Admins List */}
              <div className="space-y-2">
                {admins.map((admin, i) => (
                  <motion.div key={admin.id}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        background: admin.is_protected ? "var(--color-accent)" + "26" : "var(--color-primary)" + "26",
                        color: admin.is_protected ? "var(--color-accent)" : "var(--color-primary-light)",
                      }}>
                      {admin.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{admin.email}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {t("since", "admin")}: {new Date(admin.created_at).toLocaleDateString()}
                        </p>
                        {admin.is_protected && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                            style={{ background: "var(--color-accent)" + "26", color: "var(--color-accent)" }}>
                            {t("protected", "admin")}
                          </span>
                        )}
                      </div>
                    </div>
                    {admin.is_protected ? (
                      <Shield className="w-5 h-5 shrink-0" style={{ color: "var(--color-accent)" }} />
                    ) : (
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        disabled={deletingId === admin.id}
                        className="p-2 rounded-lg hover:bg-red-500/10 transition shrink-0"
                        title={t("delete_admin", "admin")}
                      >
                        {deletingId === admin.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--color-danger)" }} />
                        ) : (
                          <Trash2 className="w-4 h-4" style={{ color: "var(--color-danger)" }} />
                        )}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="glass-card p-4 mt-6 flex items-start gap-3" style={{ borderColor: "var(--color-warning)" + "40" }}>
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-warning)" }} />
                <div>
                  <p className="text-sm font-medium mb-1">{t("protected_admins_title", "admin")}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {t("protected_admins_desc", "admin")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
