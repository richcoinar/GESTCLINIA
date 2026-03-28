"use client";

export const dynamic = "force-dynamic";
export const runtime = "edge";

import { useState, useEffect } from "react";
import { createClient } from "../../../../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, UserPlus, Stethoscope } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function NewPatientPage({ params }: { params: Promise<{ slug: string }> }) {
  const [loading, setLoading] = useState(false);
  const [clinicId, setClinicId] = useState("");
  const [slug, setSlug] = useState("");
  const [form, setForm] = useState({
    first_name: "", last_name: "", document_type: "DNI", document_number: "",
    birth_date: "", gender: "", phone: "", email: "", address: "",
    emergency_contact_name: "", emergency_contact_phone: "",
    blood_type: "", allergies: "", chronic_conditions: "",
    current_medications: "", insurance_provider: "", insurance_number: "", notes: "",
  });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    params.then(async (p) => {
      setSlug(p.slug);
      const { data } = await supabase.from("clinics").select("id").eq("slug", p.slug).single();
      if (data) setClinicId(data.id);
    });
  }, [params, supabase]);

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("clinic_patients").insert({
      clinic_id: clinicId,
      first_name: form.first_name,
      last_name: form.last_name,
      document_type: form.document_type,
      document_number: form.document_number || null,
      birth_date: form.birth_date || null,
      gender: form.gender || null,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      emergency_contact_name: form.emergency_contact_name || null,
      emergency_contact_phone: form.emergency_contact_phone || null,
      blood_type: form.blood_type || null,
      allergies: form.allergies ? form.allergies.split(",").map(a => a.trim()) : [],
      chronic_conditions: form.chronic_conditions ? form.chronic_conditions.split(",").map(c => c.trim()) : [],
      current_medications: form.current_medications ? form.current_medications.split(",").map(m => m.trim()) : [],
      insurance_provider: form.insurance_provider || null,
      insurance_number: form.insurance_number || null,
      notes: form.notes || null,
    });

    if (error) {
      toast.error("Error: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Paciente registrado exitosamente");
    router.push(`/dashboard/clinics/${slug}`);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-surface)" }}>
      <nav className="border-b px-6 py-3" style={{ borderColor: "var(--color-border-light)", background: "oklch(0.13 0.01 260 / 0.85)", backdropFilter: "blur(16px)" }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold">GEST<span style={{ color: "oklch(0.70 0.20 160)" }}>CLINIA</span></span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto p-8">
        <Link href={`/dashboard/clinics/${slug}`} className="inline-flex items-center gap-2 text-sm mb-6 hover:underline"
          style={{ color: "var(--color-text-secondary)" }}>
          <ArrowLeft className="w-4 h-4" /> Volver a la Clínica
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Registrar Paciente</h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Completa los datos del nuevo paciente
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <section className="glass-card p-6">
              <h2 className="font-semibold mb-4">Datos Personales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Nombre *</label>
                  <input type="text" value={form.first_name} onChange={(e) => updateForm("first_name", e.target.value)}
                    className="input-field" placeholder="Juan" required />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Apellido *</label>
                  <input type="text" value={form.last_name} onChange={(e) => updateForm("last_name", e.target.value)}
                    className="input-field" placeholder="Pérez" required />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Tipo Documento</label>
                  <select value={form.document_type} onChange={(e) => updateForm("document_type", e.target.value)} className="input-field">
                    <option value="DNI">DNI</option>
                    <option value="CUIL">CUIL</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Nº Documento</label>
                  <input type="text" value={form.document_number} onChange={(e) => updateForm("document_number", e.target.value)}
                    className="input-field" placeholder="12345678" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Fecha de Nacimiento</label>
                  <input type="date" value={form.birth_date} onChange={(e) => updateForm("birth_date", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Género</label>
                  <select value={form.gender} onChange={(e) => updateForm("gender", e.target.value)} className="input-field">
                    <option value="">Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                    <option value="prefer_not_say">Prefiero no decir</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="glass-card p-6">
              <h2 className="font-semibold mb-4">Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Teléfono</label>
                  <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)}
                    className="input-field" placeholder="+54 11 1234-5678" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)}
                    className="input-field" placeholder="paciente@email.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Dirección</label>
                  <input type="text" value={form.address} onChange={(e) => updateForm("address", e.target.value)}
                    className="input-field" placeholder="Av. Corrientes 1234" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Contacto de Emergencia</label>
                  <input type="text" value={form.emergency_contact_name} onChange={(e) => updateForm("emergency_contact_name", e.target.value)}
                    className="input-field" placeholder="Nombre del contacto" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Teléfono de Emergencia</label>
                  <input type="tel" value={form.emergency_contact_phone} onChange={(e) => updateForm("emergency_contact_phone", e.target.value)}
                    className="input-field" placeholder="+54 11 1234-5678" />
                </div>
              </div>
            </section>

            {/* Medical Info */}
            <section className="glass-card p-6">
              <h2 className="font-semibold mb-4">Información Médica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Grupo Sanguíneo</label>
                  <select value={form.blood_type} onChange={(e) => updateForm("blood_type", e.target.value)} className="input-field">
                    <option value="">Seleccionar</option>
                    {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Alergias (separar por coma)</label>
                  <input type="text" value={form.allergies} onChange={(e) => updateForm("allergies", e.target.value)}
                    className="input-field" placeholder="Penicilina, Aspirina" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Condiciones Crónicas</label>
                  <input type="text" value={form.chronic_conditions} onChange={(e) => updateForm("chronic_conditions", e.target.value)}
                    className="input-field" placeholder="Diabetes, Hipertensión" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Medicamentos Actuales</label>
                  <input type="text" value={form.current_medications} onChange={(e) => updateForm("current_medications", e.target.value)}
                    className="input-field" placeholder="Metformina 500mg, Enalapril 10mg" />
                </div>
              </div>
            </section>

            {/* Insurance */}
            <section className="glass-card p-6">
              <h2 className="font-semibold mb-4">Obra Social / Seguro</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Obra Social / Prepaga</label>
                  <input type="text" value={form.insurance_provider} onChange={(e) => updateForm("insurance_provider", e.target.value)}
                    className="input-field" placeholder="OSDE, Swiss Medical" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Nº de Afiliado</label>
                  <input type="text" value={form.insurance_number} onChange={(e) => updateForm("insurance_number", e.target.value)}
                    className="input-field" placeholder="123456789" />
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="glass-card p-6">
              <h2 className="font-semibold mb-4">Observaciones</h2>
              <textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)}
                className="input-field" rows={3} placeholder="Notas adicionales sobre el paciente..." />
            </section>

            <div className="flex gap-3">
              <Link href={`/dashboard/clinics/${slug}`} className="btn-ghost flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Cancelar
              </Link>
              <button type="submit" disabled={loading || !form.first_name || !form.last_name}
                className="btn-primary flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <><UserPlus className="w-4 h-4" /> Registrar Paciente</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
