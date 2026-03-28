"use client";

export const dynamic = "force-dynamic";
export const runtime = "edge";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import {
  Send, BrainCircuit, FileText, Activity,
  Loader2, Trash2, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar } from "../../../components/Sidebar";
import { useTranslation } from "../../../lib/i18n";
import { useAuth } from "../../../lib/hooks";

export default function AssistantPage() {
  const { user, role } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState("general");
  const [template, setTemplate] = useState("none");
  const scrollRef = useRef<HTMLDivElement>(null);

  const TRANSLATED_MODES = [
    { id: "general", label: t("mode_general", "assistant"), icon: BrainCircuit, desc: t("mode_general_desc", "assistant") },
    { id: "scribe", label: t("mode_scribe", "assistant"), icon: FileText, desc: t("mode_scribe_desc", "assistant") },
    { id: "patient_intake", label: t("mode_intake", "assistant"), icon: Activity, desc: t("mode_intake_desc", "assistant") },
  ];

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    body: { 
      context: mode,
      template: template,
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Handle auto-submit after template change
  useEffect(() => {
    if (template !== "none" && input) {
      const event = { preventDefault: () => {} } as unknown as React.FormEvent<HTMLFormElement>;
      handleSubmit(event);
      setTemplate("none"); // Reset after sending
    }
  }, [template, input, handleSubmit]);

  function handleQuickAction(text: string, templateId: string = "none") {
    setInput(text);
    setTemplate(templateId);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gradient-surface)" }}>
      <Sidebar user={user} role={role} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden pl-64">
        {/* Header */}
        <header className="border-b px-6 py-3 flex items-center justify-between shrink-0"
          style={{ borderColor: "var(--color-border-light)", background: "var(--color-surface-sidebar)", backdropFilter: "blur(8px)" }}>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
            <div>
              <h1 className="text-sm font-semibold">{t("assistant_ia", "assistant")} — {TRANSLATED_MODES.find(m => m.id === mode)?.label}</h1>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {TRANSLATED_MODES.find(m => m.id === mode)?.desc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 overflow-hidden">
              {TRANSLATED_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); setTemplate("none"); }}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    mode === m.id 
                    ? "bg-white/10 text-[var(--color-accent)]" 
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <button onClick={() => setMessages([])}
              className="btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3">
              <Trash2 className="w-3.5 h-3.5" /> {t("clear", "common")}
            </button>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.length === 0 && (
            <motion.div className="text-center py-20"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <BrainCircuit className="w-16 h-16 mx-auto mb-4"
                style={{ color: "var(--color-primary)" + "4D" }} />
              <h2 className="text-xl font-semibold mb-2">{t("medical_assistant_title", "assistant")}</h2>
              <p className="text-sm max-w-md mx-auto mb-8"
                style={{ color: "var(--color-text-secondary)" }}>
                {mode === "scribe"
                  ? t("scribe_intro", "assistant")
                  : mode === "patient_intake"
                    ? t("intake_intro", "assistant")
                    : t("general_intro", "assistant")}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {mode === "scribe" ? (
                  <>
                    <QuickAction text={t("quick_soap", "assistant")} onClick={() => handleQuickAction(t("prompt_soap", "assistant"), "soap")} />
                    <QuickAction text={t("quick_hp", "assistant")} onClick={() => handleQuickAction(t("prompt_hp", "assistant"), "hp")} />
                    <QuickAction text={t("quick_discharge", "assistant")} onClick={() => handleQuickAction(t("prompt_discharge", "assistant"), "discharge")} />
                  </>
                ) : (
                  <>
                    <QuickAction text={t("quick_how_works", "assistant")} onClick={() => handleQuickAction(t("prompt_how_works", "assistant"))} />
                    <QuickAction text={t("quick_schedule", "assistant")} onClick={() => handleQuickAction(t("prompt_schedule", "assistant"))} />
                    <QuickAction text={t("quick_my_clinics", "assistant")} onClick={() => handleQuickAction(t("prompt_my_clinics", "assistant"))} />
                  </>
                )}
              </div>
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}>
              <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "text-white"
                  : "text-white/90"
              }`}
                style={{
                  background: m.role === "user"
                    ? "var(--gradient-brand)"
                    : "var(--color-surface-elevated)",
                  border: m.role === "assistant" ? "1px solid var(--color-border)" : "none",
                }}>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-3"
                style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--color-accent)" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t px-6 py-4 shrink-0" style={{ borderColor: "var(--color-border-light)" }}>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={mode === "scribe"
                ? t("placeholder_scribe", "assistant")
                : t("placeholder_general", "assistant")}
              className="input-field flex-1"
            />
            <button type="submit" disabled={isLoading || !input.trim()}
              className="btn-primary px-4 flex items-center gap-2"
              style={{ opacity: !input.trim() ? 0.5 : 1 }}>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function QuickAction({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
      style={{
        background: "var(--color-primary)" + "1A",
        border: "1px solid " + "var(--color-primary)" + "4D",
        color: "var(--color-primary-light)",
      }}>
      {text}
    </button>
  );
}
