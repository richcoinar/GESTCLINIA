"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "../../lib/i18n";
import { LanguageSelector } from "../../components/LanguageSelector";
import { ThemeToggle } from "../../components/ThemeToggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success(t("welcome", "auth"));
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--gradient-surface)" }}>
      {/* Top right controls */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }} />
        </div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-brand)" }}>
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              GEST<span style={{ color: "var(--color-accent)" }}>CLINIA</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">{t("login_title", "auth")}</h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {t("login_subtitle", "auth")}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}>
              {t("email", "auth")}
            </label>
            <div className="relative group">
              <Mail className="input-icon input-icon-left group-focus-within:!text-[var(--color-primary)]" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field has-icon-left"
                placeholder="doctor@clinica.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}>
                {t("password", "auth")}
              </label>
            </div>
            <div className="relative group">
              <Lock className="input-icon input-icon-left group-focus-within:!text-[var(--color-primary)]" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field has-icon-left has-icon-right"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-all z-10"
                style={{ color: "var(--color-text-muted)" }}
                title={showPassword ? t("hide_password", "auth") : t("show_password", "auth")}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-surface-alt" />
              <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {t("remember_me", "auth")}
              </span>
            </label>
            <Link href="/forgot-password" title={t("forgot_password_desc", "auth")}
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--color-accent)" }}>
              {t("forgot_password", "auth")}
            </Link>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {t("login_button", "auth")} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center">

          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {t("no_account", "auth")}{" "}
            <Link href="/register" className="font-medium hover:underline"
              style={{ color: "var(--color-accent)" }}>
              {t("register", "auth")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
