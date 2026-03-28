"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Escuchar cambios en la sesión para asegurar que el flujo de recuperación es reconocido
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery flow active");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    toast.success("Contraseña actualizada exitosamente");

    // Redirigir al dashboard después de 3 segundos
    setTimeout(() => router.push("/dashboard"), 3000);
  };

  // Fuerza de la contraseña
  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: "Débil", color: "var(--color-danger)" };
    if (score <= 3) return { label: "Media", color: "var(--color-warning)" };
    return { label: "Fuerte", color: "var(--color-success)" };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--gradient-surface)" }}>
        <div className="glass-card w-full max-w-md p-8 relative z-10 text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--color-success)" + "26" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "var(--color-success)" }} />
          </div>
          <h2 className="text-xl font-bold mb-2">¡Contraseña Actualizada!</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Tu contraseña ha sido cambiada de forma segura. Serás redirigido al panel principal en unos segundos.
          </p>
          <Link href="/dashboard"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            Ir al Panel Principal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--gradient-surface)" }}>
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
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: "var(--color-primary)" + "26" }}>
            <ShieldCheck className="w-6 h-6" style={{ color: "var(--color-primary-light)" }} />
          </div>
          <h1 className="text-2xl font-bold mb-1">Nueva Contraseña</h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Elige una contraseña segura para tu cuenta
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}>
              Nueva Contraseña
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] transition-colors group-focus-within:text-[var(--color-primary)]" />
              <input
                id="update-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-11"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-all text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
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
                <span className="text-xs font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}>
              Confirmar Contraseña
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] transition-colors group-focus-within:text-[var(--color-primary)]" />
              <input
                id="update-confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-10 pr-11"
                style={{
                  borderColor: passwordsMismatch
                    ? "var(--color-danger)"
                    : passwordsMatch
                    ? "var(--color-success)"
                    : undefined,
                }}
                placeholder="Repite tu contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-all text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                title={showConfirm ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>
                Las contraseñas no coinciden
              </p>
            )}
            {passwordsMatch && (
              <p className="text-xs mt-1" style={{ color: "var(--color-success)" }}>
                ✓ Las contraseñas coinciden
              </p>
            )}
          </div>

          <button
            id="update-submit"
            type="submit"
            disabled={loading || passwordsMismatch}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            style={{ opacity: passwordsMismatch ? 0.5 : 1 }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Actualizar Contraseña <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm hover:underline"
            style={{ color: "var(--color-text-muted)" }}>
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
