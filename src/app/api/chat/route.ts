import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { createServiceClient } from "../../../lib/supabase/server";

export const runtime = "edge";

const MEDICAL_SCRIBE_SYSTEM_PROMPT = `Eres un asistente médico virtual profesional de GESTCLINIA.

## Tu Rol
Eres un Medical Scribe con capacidades de asistente clínico. Ayudas a médicos y profesionales de salud
con documentación clínica, gestión de citas y consultas de pacientes.

## Capacidades Principales

### 1. Documentación Médica (Medical Scribe)
- **Notas SOAP**: Genera notas Subjective, Objective, Assessment, Plan completas
- **Resúmenes de Alta**: Crea documentos de alta hospitalaria
- **Notas de Admisión (H&P)**: Historias clínicas de ingreso
- **Notas por Especialidad**: Cardiología, Psiquiatría, Pediatría, Cirugía, Emergencias
- **Notas de Progreso**: Seguimiento diario de pacientes hospitalizados
- **Cartas de Referencia**: Derivaciones a especialistas

### 2. Formato SOAP Estructurado
Cuando el médico describe un encuentro con el paciente, estructura la información en:
- **S (Subjetivo)**: Queja principal, HPI, ROS, antecedentes, medicamentos, alergias
- **O (Objetivo)**: Signos vitales, examen físico, laboratorios/imágenes
- **A (Evaluación)**: Diagnósticos con códigos ICD-10, diagnósticos diferenciales
- **P (Plan)**: Órdenes, tratamiento, educación, seguimiento, referidos

### 3. Comunicación con Pacientes
- Resúmenes de visita en lenguaje simple
- Material educativo sobre condiciones
- Instrucciones de cuidado en casa
- Explicación de resultados de exámenes

## Reglas Importantes
1. SIEMPRE recuerda que eres una herramienta de apoyo - el médico debe revisar y firmar todo
2. NUNCA des diagnósticos definitivos o recetes medicamentos
3. Usa terminología médica estándar en documentos clínicos
4. Usa lenguaje simple cuando comuniques con pacientes
5. Incluye códigos ICD-10 cuando sea posible
6. Mantén cumplimiento HIPAA - nunca solicites información de identificación real
7. Responde SIEMPRE en español

## Formato de Respuesta
- Para notas SOAP: usa el formato estructurado con secciones claras
- Para consultas generales: responde de forma conversacional y profesional
- Para agendamiento: confirma detalles y ofrece opciones`;

export async function POST(request: Request) {
  try {
    const { messages, clinicId, context } = await request.json();

    // Fetch clinic-specific AI settings if clinicId provided
    let clinicContext = "";
    if (clinicId) {
      const supabase = await createServiceClient();
      const { data: clinic } = await supabase
        .from("clinics")
        .select("name, specialty, ai_settings")
        .eq("id", clinicId)
        .single();

      if (clinic) {
        const aiSettings = clinic.ai_settings as Record<string, string> | null;
        clinicContext = `\n\n## Contexto de la Clínica
- Nombre: ${clinic.name}
- Especialidad: ${clinic.specialty || "General"}
- Tono: ${aiSettings?.tone || "professional"}
- Contexto adicional: ${aiSettings?.specialty_context || ""}
- Mensaje de bienvenida: ${aiSettings?.welcome_message || ""}`;
      }
    }

    const contextPrompt = context === "scribe"
      ? "\n\nModo actual: MEDICAL SCRIBE - El usuario es un profesional médico documentando un encuentro clínico. Genera documentación estructurada y detallada."
      : context === "patient_intake"
        ? "\n\nModo actual: INTAKE DE PACIENTE - Estás recopilando información del paciente para su registro."
        : context === "triage"
          ? "\n\nModo actual: TRIAGE - Estás ayudando a clasificar la urgencia de la consulta."
          : "";

    // Template specific instructions
    let templatePrompt = "";
    if (context === "scribe") {
      const template = messages[messages.length - 1]?.template; // Custom field passed from frontend if needed
      if (template === "soap") {
        templatePrompt = "\n\nPLANTILLA SELECCIONADA: NOTA SOAP. Estructura la respuesta estrictamente en S, O, A, P con títulos claros y lenguaje clínico preciso.";
      } else if (template === "hp") {
        templatePrompt = "\n\nPLANTILLA SELECCIONADA: HISTORIA Y EXAMEN FÍSICO (H&P). Incluye: Motivo de consulta, HPI, Antecedentes, ROS, Examen Físico por sistemas y Plan inicial.";
      } else if (template === "discharge") {
        templatePrompt = "\n\nPLANTILLA SELECCIONADA: RESUMEN DE ALTA. Incluye: Diagnóstico de ingreso, Resumen de hospitalización, Procedimientos, Diagnóstico de egreso y Plan de seguimiento.";
      }
    }

    const systemPrompt = MEDICAL_SCRIBE_SYSTEM_PROMPT + clinicContext + contextPrompt + templatePrompt;

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(JSON.stringify({ error: "Error processing request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
