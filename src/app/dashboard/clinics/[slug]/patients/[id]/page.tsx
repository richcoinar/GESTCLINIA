"use client";

export const dynamic = "force-dynamic";
export const runtime = "edge";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "../../../../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import {
  ArrowLeft, Stethoscope, FileText, Plus, User,
  Heart, Pill, AlertTriangle, Clock, Loader2, Send,
  BrainCircuit, ChevronDown, ChevronUp, Check,
} from "lucide-react";
import { ThemeToggle } from "../../../../../../components/ThemeToggle";

interface Patient {
  id: string; first_name: string; last_name: string; document_number: string | null;
  birth_date: string | null; gender: string | null; phone: string | null;
  email: string | null; address: string | null; blood_type: string | null;
  allergies: string[]; chronic_conditions: string[]; current_medications: string[];
  insurance_provider: string | null; insurance_number: string | null;
  emergency_contact_name: string | null; emergency_contact_phone: string | null;
  notes: string | null;
}

interface MedicalRecord {
  id: string; record_type: string; title: string | null; content: string | null;
  subjective: Record<string, unknown> | null; objective: Record<string, unknown> | null;
  assessment: Record<string, unknown> | null; plan: Record<string, unknown> | null;
  ai_generated: boolean; signed: boolean; encounter_date: string; created_at: string;
  clinic_staff: { name: string } | null;
}

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewNote, setShowNewNote] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [patientId, setPatientId] = useState("");
  const [clinicId, setClinicId] = useState("");

  const supabase = createClient();
  const router = useRouter();

  // AI Medical Scribe Chat
  const { messages, input, handleInputChange, handleSubmit, isLoading: aiLoading, setMessages } = useChat({
    api: "/api/chat",
    body: { context: "scribe", clinicId },
    onFinish: () => {
      // After AI generates a note, offer to save it
      toast.info("Nota generada. Puedes revisarla y guardarla.", { duration: 5000 });
    },
  });

  useEffect(() => {
    params.then((p) => {
      setSlug(p.slug);
      setPatientId(p.id);
    });
  }, [params]);

  const loadData = useCallback(async () => {
    const { data: clinic } = await supabase.from("clinics").select("id").eq("slug", slug).single();
    if (clinic) setClinicId(clinic.id);

    const { data: patientData } = await supabase
      .from("clinic_patients").select("*").eq("id", patientId).single();
    if (!patientData) { 
      toast.error("Paciente no encontrado"); 
      router.push(`/dashboard/clinics/${slug}`); 
      return; 
    }
    setPatient(patientData);

    const { data: recordsData } = await supabase
      .from("medical_records")
      .select("*, clinic_staff(name)")
      .eq("patient_id", patientId)
      .order("encounter_date", { ascending: false });
    setRecords(recordsData || []);
    setLoading(false);
  }, [patientId, slug, supabase, router]);

  useEffect(() => {
    if (patientId && slug) {
      Promise.resolve().then(() => loadData());
    }
  }, [patientId, slug, loadData]);

  const saveAINote = async (content: string) => {
    const { error } = await supabase.from("medical_records").insert({
      clinic_id: clinicId,
      patient_id: patientId,
      record_type: "soap",
      title: `Nota SOAP — ${patient?.first_name} ${patient?.last_name}`,
      content,
      ai_generated: true,
      ai_draft: content,
    });

    if (error) { toast.error("Error al guardar: " + error.message); return; }
    toast.success("Nota guardada exitosamente");
    loadData();
    setShowNewNote(false);
    setMessages([]);
  };

  const calcAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-surface)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-accent)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-surface)" }}>
      {/* Top bar */}
      <nav className="border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: "var(--color-border-light)", background: "var(--color-surface-sidebar)", backdropFilter: "blur(16px)" }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold">GEST<span style={{ color: "var(--color-accent)" }}>CLINIA</span></span>
        </Link>
        <ThemeToggle />
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <Link href={`/dashboard/clinics/${slug}`} className="inline-flex items-center gap-2 text-sm mb-6 hover:underline"
          style={{ color: "var(--color-text-secondary)" }}>
          <ArrowLeft className="w-4 h-4" /> Volver a la Clínica
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info Sidebar */}
          <div className="space-y-4">
            <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ background: "var(--color-primary)" + "26", color: "var(--color-primary-light)" }}>
                  {patient.first_name[0]}{patient.last_name[0]}
                </div>
                <div>
                  <h1 className="text-xl font-bold">{patient.first_name} {patient.last_name}</h1>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {patient.document_number || "Sin documento"}
                    {patient.birth_date && ` • ${calcAge(patient.birth_date)} años`}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {patient.phone && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" style={{ color: "var(--color-text-muted)" }} />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.blood_type && (
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5" style={{ color: "var(--color-danger)" }} />
                    <span>Grupo: {patient.blood_type}</span>
                  </div>
                )}
                {patient.insurance_provider && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" style={{ color: "var(--color-text-muted)" }} />
                    <span>{patient.insurance_provider} — {patient.insurance_number}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Allergies & Conditions */}
            {(patient.allergies.length > 0 || patient.chronic_conditions.length > 0) && (
              <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {patient.allergies.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      style={{ color: "var(--color-danger)" }}>
                      <AlertTriangle className="w-3.5 h-3.5" /> Alergias
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.allergies.map((a) => (
                        <span key={a} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "var(--color-danger)" + "26", color: "var(--color-danger)" }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {patient.chronic_conditions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "var(--color-warning)" }}>Condiciones Crónicas</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.chronic_conditions.map((c) => (
                        <span key={c} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "var(--color-warning)" + "26", color: "var(--color-warning)" }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Medications */}
            {patient.current_medications.length > 0 && (
              <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                  style={{ color: "var(--color-primary)" }}>
                  <Pill className="w-3.5 h-3.5" /> Medicamentos Actuales
                </h3>
                <ul className="space-y-1 text-sm">
                  {patient.current_medications.map((m) => (
                    <li key={m} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-primary)" }} />
                      {m}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Records & Scribe */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Historial Clínico</h2>
              <button onClick={() => setShowNewNote(!showNewNote)}
                className="btn-primary text-sm flex items-center gap-2">
                {showNewNote ? "Cancelar" : <><Plus className="w-4 h-4" /> Nueva Nota</>}
              </button>
            </div>

            {/* AI Scribe Section */}
            {showNewNote && (
              <motion.div className="glass-card p-5" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                  <h3 className="font-semibold">Medical Scribe — Nota IA</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
                  Describe el encuentro clínico con {patient.first_name} y el asistente generará la nota SOAP.
                </p>

                {/* Chat messages */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {messages.map((m) => (
                    <div key={m.id} className={`${m.role === "user" ? "text-right" : ""}`}>
                      <div className={`inline-block max-w-[85%] rounded-xl px-3 py-2 text-sm`}
                        style={{
                          background: m.role === "user" ? "var(--gradient-brand)" : "var(--color-surface-alt)",
                          border: m.role === "assistant" ? "1px solid var(--color-border)" : "none",
                        }}>
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="text-left">
                    <div className="inline-block rounded-xl px-3 py-2"
                        style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}>
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--color-accent)" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Save button when AI has responded */}
                {messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
                  <button onClick={() => saveAINote(messages[messages.length - 1].content)}
                    className="mb-3 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition hover:scale-105"
                    style={{ background: "var(--color-success)" + "26", color: "var(--color-success)" }}>
                    <Check className="w-3.5 h-3.5" /> Guardar Nota en Historial
                  </button>
                )}

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input type="text" value={input} onChange={handleInputChange}
                    className="input-field flex-1 text-sm"
                    placeholder={`Ej: Paciente ${patient.first_name} consulta por dolor de cabeza...`} />
                  <button type="submit" disabled={aiLoading || !input.trim()}
                    className="btn-primary px-3" style={{ opacity: !input.trim() ? 0.5 : 1 }}>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* Records List */}
            {records.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
                <h3 className="text-lg font-semibold mb-2">Sin registros médicos</h3>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Usa el Medical Scribe para crear la primera nota clínica.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((r, i) => (
                  <motion.div key={r.id} className="glass-card overflow-hidden"
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <button onClick={() => setExpandedRecord(expandedRecord === r.id ? null : r.id)}
                      className="w-full p-4 flex items-center gap-4 text-left">
                      <FileText className="w-5 h-5 shrink-0" style={{ color: r.ai_generated ? "var(--color-accent)" : "var(--color-primary)" }} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {r.title || `${r.record_type.toUpperCase()} Note`}
                        </h3>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(r.encounter_date).toLocaleDateString("es-AR")}
                          {r.clinic_staff && ` • ${r.clinic_staff.name}`}
                          {r.ai_generated && " • IA"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.signed && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: "var(--color-success)" + "26", color: "var(--color-success)" }}>
                            Firmada
                          </span>
                        )}
                        {expandedRecord === r.id
                          ? <ChevronUp className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                          : <ChevronDown className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />}
                      </div>
                    </button>

                    {expandedRecord === r.id && (
                      <motion.div className="border-t px-4 py-4"
                        style={{ borderColor: "var(--color-border-light)" }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed"
                          style={{ color: "var(--color-text-secondary)" }}>
                          {r.content || "Sin contenido detallado."}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
