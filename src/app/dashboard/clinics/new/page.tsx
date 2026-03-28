"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useAuth } from "../../../../lib/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Stethoscope, Building2, ArrowLeft, ArrowRight, Loader2,
  Activity, BrainCircuit, Settings, ShieldCheck, UserPlus,
  Shield, Mail
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "../../../../components/ThemeToggle";

const SPECIALTIES = [
  "Medicina General", "Cardiología", "Dermatología", "Endocrinología",
  "Gastroenterología", "Ginecología", "Neurología", "Oftalmología",
  "Oncología", "Ortopedia", "Otorrinolaringología", "Pediatría",
  "Psiquiatría", "Traumatología", "Urología", "Odontología",
  "Kinesiología", "Nutrición", "Psicología", "Clínica Multiespecialidad",
];

export default function NewClinicPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    adminEmail: "",
    aiTone: "professional",
    aiWelcome: "Bienvenido/a. Soy el asistente virtual de la clínica. ¿En qué puedo ayudarle?",
  });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    if (role !== "super_admin") {
      toast.error("Solo los administradores generales pueden crear clínicas");
      router.push("/dashboard");
    }
  }, [authLoading, user, role, router]);

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleCreate = async () => {
    setLoading(true);

    if (!user) { toast.error("Sesión expirada"); return; }

    const slug = generateSlug(form.name) + "-" + Date.now().toString(36);

    // Find admin user by email if provided
    let adminId: string | null = null;
    const adminEmail = form.adminEmail.trim().toLowerCase();

    if (adminEmail) {
      // Look up the user in auth.users via profiles or direct query
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", adminEmail)
        .maybeSingle();

      if (adminProfile) {
        adminId = adminProfile.id;
      }
    }

    const { error } = await supabase.from("clinics").insert({
      owner_id: user.id,
      admin_id: adminId,
      admin_email: adminEmail || null,
      name: form.name,
      slug,
      specialty: form.specialty,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      province: form.province,
      ai_settings: {
        enabled: true,
        tone: form.aiTone,
        specialty_context: form.specialty,
        welcome_message: form.aiWelcome,
        scribe_enabled: true,
      },
    });

    if (error) {
      toast.error("Error al crear la clínica: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("¡Clínica creada exitosamente!");
    router.push("/dashboard/admin");
  };

  const isSuperAdmin = role === "super_admin";

  const navItems = [
    { icon: Activity, label: "Panel", href: "/dashboard" },
    { icon: Building2, label: "Mis Clínicas", href: "/dashboard/clinics", active: true },
    { icon: BrainCircuit, label: "Asistente IA", href: "/dashboard/assistant" },
    { icon: Settings, label: "Configuración", href: "/dashboard/settings" },
    ...(isSuperAdmin
      ? [{ icon: ShieldCheck, label: "Admin General", href: "/dashboard/admin" }]
      : []),
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gradient-surface)" }}>
      {/* Sidebar */}
      <aside className="w-64 border-r p-4 flex flex-col shrink-0"
        style={{ borderColor: "var(--color-border-light)", background: "var(--color-surface-sidebar)" }}>
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--gradient-brand)" }}>
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            GEST<span style={{ color: "var(--color-accent)" }}>CLINIA</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
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
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline"
          style={{ color: "var(--color-text-secondary)" }}>
          <ArrowLeft className="w-4 h-4" /> Volver al Panel Admin
        </Link>

        <motion.div className="max-w-2xl"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Crear Nueva Clínica</h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Paso {step} de 4 — {step === 1 ? "Información Básica" : step === 2 ? "Ubicación y Contacto" : step === 3 ? "Administrador de Clínica" : "Asistente IA"}
          </p>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 h-1 rounded-full transition-all"
                style={{
                  background: s <= step ? "var(--color-accent)" : "var(--color-border)",
                }} />
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  Nombre de la Clínica *
                </label>
                <input id="clinic-name" type="text" value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className="input-field" placeholder="Clínica San Martín" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  Especialidad Principal
                </label>
                <select id="clinic-specialty" value={form.specialty}
                  onChange={(e) => updateForm("specialty", e.target.value)}
                  className="input-field">
                  <option value="">Selecciona una especialidad</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button onClick={() => setStep(2)} disabled={!form.name}
                className="btn-primary flex items-center gap-2"
                style={{ opacity: form.name ? 1 : 0.5 }}>
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Location & Contact */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Teléfono</label>
                  <input type="tel" value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    className="input-field" placeholder="+54 11 1234-5678" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Email</label>
                  <input type="email" value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className="input-field" placeholder="contacto@clinica.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Dirección</label>
                <input type="text" value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  className="input-field" placeholder="Av. Corrientes 1234" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Ciudad</label>
                  <input type="text" value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    className="input-field" placeholder="Buenos Aires" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Provincia</label>
                  <input type="text" value={form.province}
                    onChange={(e) => updateForm("province", e.target.value)}
                    className="input-field" placeholder="CABA" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button onClick={() => setStep(3)} className="btn-primary flex items-center gap-2">
                  Siguiente <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Clinic Admin Assignment */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <UserPlus className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                  <h3 className="font-semibold">Asignar Administrador de Clínica</h3>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
                  El administrador de la clínica podrá gestionar pacientes, citas, personal y configuraciones.
                  Debe ser un usuario registrado en la plataforma.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                      Email del Administrador de Clínica
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "var(--color-text-muted)" }} />
                      <input type="email" value={form.adminEmail}
                        onChange={(e) => updateForm("adminEmail", e.target.value)}
                        className="input-field pl-10"
                        placeholder="admin-clinica@email.com" />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
                      Déjalo vacío si tú mismo administrarás la clínica como Super Admin.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4 flex items-start gap-3" style={{ borderColor: "var(--color-primary)" + "40" }}>
                <Shield className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
                <div>
                  <p className="text-sm font-medium mb-1">Permisos del Admin de Clínica</p>
                  <ul className="text-xs space-y-1" style={{ color: "var(--color-text-secondary)" }}>
                    <li>• Gestión completa de pacientes (CRUD)</li>
                    <li>• Gestión de citas y agenda</li>
                    <li>• Gestión de personal médico</li>
                    <li>• Configuración de la clínica y el asistente IA</li>
                    <li className="font-medium" style={{ color: "var(--color-warning)" }}>
                      • NO puede crear ni eliminar clínicas
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button onClick={() => setStep(4)} className="btn-primary flex items-center gap-2">
                  Siguiente <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: AI Assistant Config */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <BrainCircuit className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                  <h3 className="font-semibold">Configuración del Asistente IA</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                      Tono del Asistente
                    </label>
                    <select value={form.aiTone}
                      onChange={(e) => updateForm("aiTone", e.target.value)}
                      className="input-field">
                      <option value="professional">Profesional</option>
                      <option value="friendly">Amigable</option>
                      <option value="formal">Formal</option>
                      <option value="empathetic">Empático</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                      Mensaje de Bienvenida
                    </label>
                    <textarea value={form.aiWelcome}
                      onChange={(e) => updateForm("aiWelcome", e.target.value)}
                      className="input-field" rows={3}
                      placeholder="Bienvenido/a. Soy el asistente virtual..." />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="btn-ghost flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button onClick={handleCreate} disabled={loading}
                  className="btn-primary flex items-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>Crear Clínica <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
