"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, RefreshCw, Copy, Check } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "../../lib/i18n";
import { LanguageSelector } from "../../components/LanguageSelector";
import { ThemeToggle } from "../../components/ThemeToggle";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(() => {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghjkmnpqrstuvwxyz";
    const digits = "23456789";
    const special = "!@#$%&*_+";
    const required = [
      upper[Math.floor(Math.random() * upper.length)],
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      digits[Math.floor(Math.random() * digits.length)],
      special[Math.floor(Math.random() * special.length)],
    ];
    const charset = upper + lower + digits + special;
    const remaining = Array.from({ length: 5 }, () =>
      charset[Math.floor(Math.random() * charset.length)]
    );
    return [...required, ...remaining].sort(() => Math.random() - 0.5).join("");
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useTranslation();

  useEffect(() => {
    // Generate initial password but don't show it as plain text if user wants privacy
    // (Though for registration showing it initially is often helpful)
  }, []);

  const generatePassword = () => {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghjkmnpqrstuvwxyz";
    const digits = "23456789";
    const special = "!@#$%&*_+";
    const required = [
      upper[Math.floor(Math.random() * upper.length)],
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      digits[Math.floor(Math.random() * digits.length)],
      special[Math.floor(Math.random() * special.length)],
    ];
    const charset = upper + lower + digits + special;
    const remaining = Array.from({ length: 5 }, () =>
      charset[Math.floor(Math.random() * charset.length)]
    );
    const all = [...required, ...remaining].sort(() => Math.random() - 0.5).join("");
    setPassword(all);
    setConfirmPassword(all); // Sync confirm password when generated
    setCopied(false);
    setShowPassword(true);
    setShowConfirm(true);
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success(t("password_copied", "auth"));
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error(t("copy_failed", "auth"));
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: t("weak", "auth"), color: "var(--color-danger)" };
    if (score <= 3) return { label: t("medium", "auth"), color: "var(--color-warning)" };
    return { label: t("strong", "auth"), color: "var(--color-success)" };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(t("passwords_mismatch", "auth"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("password_too_short", "auth"));
      return;
    }

    setLoading(true);

    const { data: { session }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/send-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: fullName, password }),
      });
    } catch (err) {
      console.error("Error sending welcome email", err);
    }

    if (!session) {
      toast.info(
        t("check_email", "auth"),
        { duration: 8000 }
      );
    } else {
      toast.success(t("account_created", "auth"));
    }

    router.push("/login");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--gradient-surface)" }}>
      {/* Top right controls */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }} />
      </div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 animate-fade-in-up">
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
          <h1 className="text-2xl font-bold mb-1">{t("register_title", "auth")}</h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {t("register_subtitle", "auth")}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}>
              {t("full_name", "auth")}
            </label>
            <div className="relative group">
              <User className="input-icon input-icon-left group-focus-within:!text-[var(--color-primary)]" />
              <input id="register-name" type="text" value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field has-icon-left" placeholder="Dr. Juan Pérez" required />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}>
              {t("email", "auth")}
            </label>
            <div className="relative group">
              <Mail className="input-icon input-icon-left group-focus-within:!text-[var(--color-primary)]" />
              <input id="register-email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field has-icon-left" placeholder="doctor@clinica.com" required />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}>
                {t("secure_password", "auth")}
              </label>
              <div className="flex items-center gap-1">
                {/* Copiar */}
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="p-1 hover:bg-white/10 rounded transition-all text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  title={t("copy_password", "auth")}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {/* Nueva contraseña */}
                <button
                  type="button"
                  onClick={generatePassword}
                  className="p-1 hover:bg-white/10 rounded transition-all text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  title={t("generate_new", "auth")}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="relative group">
              <Lock className="input-icon input-icon-left group-focus-within:!text-[var(--color-primary)]" />
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field has-icon-left has-icon-right"
                placeholder={t("min_characters", "auth")}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-all z-10"
                style={{ color: "var(--color-text-muted)" }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Indicador de fuerza */}
            {strength && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: strength.label === "Débil" ? "33%" : strength.label === "Media" ? "66%" : "100%",
                      background: strength.color,
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}>
              {t("confirm_password", "auth")}
            </label>
            <div className="relative group">
              <Lock className="input-icon input-icon-left group-focus-within:!text-[var(--color-primary)]" />
              <input
                id="register-confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field has-icon-left has-icon-right"
                style={{
                  borderColor: passwordsMismatch
                    ? "var(--color-danger)"
                    : passwordsMatch
                    ? "var(--color-success)"
                    : undefined,
                }}
                placeholder={t("repeat_password", "auth")}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-all z-10"
                style={{ color: "var(--color-text-muted)" }}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="text-[11px] mt-1 font-medium" style={{ color: "var(--color-danger)" }}>
                {t("passwords_mismatch", "auth")}
              </p>
            )}
            {passwordsMatch && (
              <p className="text-[11px] mt-1 font-medium" style={{ color: "var(--color-success)" }}>
                ✓ {t("passwords_match", "auth")}
              </p>
            )}
          </div>

          <button id="register-submit" type="submit" disabled={loading || passwordsMismatch}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            style={{ opacity: passwordsMismatch ? 0.5 : 1 }}>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>{t("create_account", "auth")} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {t("already_have_account", "auth")}{" "}
            <Link href="/login" className="font-medium hover:underline"
              style={{ color: "var(--color-accent)" }}>
              {t("login", "auth")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
