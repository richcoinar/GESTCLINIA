"use client";

import { useState } from "react";
import { Stethoscope, Mail, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
    toast.success("Correo de recuperación enviado");
  };

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
          <h1 className="text-2xl font-bold mb-1">Recuperar Contraseña</h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Te enviaremos un enlace para restablecerla
          </p>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--color-success)" + "1a" }}>
              <Mail className="w-8 h-8" style={{ color: "var(--color-success)" }} />
            </div>
            <h2 className="text-lg font-semibold mb-2">Revisa tu correo</h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
              Por favor revisa tu bandeja de entrada o carpeta de spam.
            </p>
            <Link href="/login"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              <ArrowLeft className="w-4 h-4" /> Volver a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--color-text-secondary)" }}>
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] transition-colors group-focus-within:text-[var(--color-primary)]" />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="doctor@clinica.com"
                  required
                />
              </div>
            </div>

            <button
              id="reset-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Enviar Enlace <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm hover:underline" style={{ color: "var(--color-accent)" }}>
                Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
