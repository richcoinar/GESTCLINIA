"use client";

export const dynamic = "force-dynamic";
export const runtime = "edge";

import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import {
  User, Mail, Shield, Save, Loader2, LogOut, CheckCircle2,
  AlertCircle, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "../../../components/Sidebar";
import { useTranslation } from "../../../lib/i18n";
import { useAuth } from "../../../lib/hooks";

export default function SettingsPage() {
  const { user: authUser, role } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ email?: string; id?: string; created_at?: string } | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        setProfile(profile);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function handleSave() {
    if (!user || !profile) return;
    setSaving(true);
    setMessage(null);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setMessage({ type: "error", text: t("profile_update_error", "settings") });
    } else {
      setMessage({ type: "success", text: t("profile_update_success", "settings") });
    }
    setSaving(false);
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg-primary)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-accent)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gradient-surface)" }}>
      <Sidebar user={authUser} role={role} />

      <main className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto pl-72">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">{t("settings_title", "settings")}</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            {t("settings_subtitle", "settings")}
          </p>
        </header>

        <div className="space-y-8">
          {/* Section: Profile */}
          <section className="rounded-2xl border p-6 space-y-6 shadow-sm"
            style={{ borderColor: "var(--color-border-light)", background: "var(--color-surface)" }}>
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
              <h2 className="text-lg font-semibold">{t("personal_profile", "settings")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider px-1"
                  style={{ color: "var(--color-text-muted)" }}>{t("full_name_label", "settings")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={profile?.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder={t("full_name_placeholder", "settings")}
                    className="input-field pl-10 w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider px-1"
                  style={{ color: "var(--color-text-muted)" }}>{t("email_label_readonly", "settings")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="input-field pl-10 w-full bg-white/5 opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={saving}
                onClick={handleSave}
                className="btn-primary flex items-center gap-2 px-6"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {t("save_changes", "settings")}
              </button>
            </div>
          </section>

          {/* Section: Account Summary */}
          <section className="rounded-2xl border p-6 shadow-sm"
            style={{ borderColor: "var(--color-border-light)", background: "var(--color-surface)" }}>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
              <h2 className="text-lg font-semibold">{t("account_details", "settings")}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard
                label={t("plan", "settings")}
                value="Premium Alpha"
                icon={CheckCircle2}
                color="var(--color-accent)"
              />
              <StatCard
                label={t("status", "settings")}
                value={t("active", "settings")}
                icon={Shield}
                color="var(--color-primary)"
              />
              <StatCard
                label={t("since", "settings")}
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "---"}
                icon={Activity}
                color="var(--color-secondary)"
              />
            </div>
          </section>

          {/* Section: Notifications (Placeholder) */}
          <section className="rounded-2xl border p-6 opacity-60 shadow-sm"
            style={{ borderColor: "var(--color-border-light)", background: "var(--color-surface)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-white/40">🔔</span>
                <div>
                  <h2 className="text-lg font-semibold text-white/40">{t("notifications", "settings")}</h2>
                  <p className="text-xs text-white/40">{t("notifications_soon", "settings")}</p>
                </div>
              </div>
              <div className="w-10 h-5 rounded-full bg-white/10 relative">
                <div className="w-4 h-4 rounded-full bg-white/20 absolute left-0.5 top-0.5" />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t flex justify-between items-center"
          style={{ borderColor: "var(--color-border-light)" }}>
          <p className="text-xs text-white/40">{t("user_id", "settings")}: {user?.id}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" /> {t("logout", "common")}
          </button>
        </div>
      </main>

      {/* Notifications overlay */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl"
            style={{
              background: "var(--color-surface-elevated)",
              borderColor: message.type === "success" ? "var(--color-success)" : "var(--color-danger)",
            }}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" style={{ color: "var(--color-success)" }} />
            ) : (
              <AlertCircle className="w-5 h-5" style={{ color: "var(--color-danger)" }} />
            )}
            <span className="text-sm font-medium">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-2 text-white/40 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="p-4 rounded-xl border bg-white/5" style={{ borderColor: "var(--color-border-light)" }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </span>
      </div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
