"use client";

import { motion } from "framer-motion";
import {
  Stethoscope,
  BrainCircuit,
  Building2,
  CalendarCheck,
  FileText,
  Shield,
  ArrowRight,
  Sparkles,
  Users,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Building2,
      title: t("landing.features.multi_clinic"),
      description: t("landing.features.multi_clinic_desc"),
    },
    {
      icon: BrainCircuit,
      title: t("landing.features.ai_assistant"),
      description: t("landing.features.ai_assistant_desc"),
    },
    {
      icon: FileText,
      title: t("landing.features.medical_scribe"),
      description: t("landing.features.medical_scribe_desc"),
    },
    {
      icon: CalendarCheck,
      title: t("landing.features.scheduling"),
      description: t("landing.features.scheduling_desc"),
    },
    {
      icon: Shield,
      title: t("landing.features.hipaa"),
      description: t("landing.features.hipaa_desc"),
    },
    {
      icon: Users,
      title: t("landing.features.patients"),
      description: t("landing.features.patients_desc"),
    },
  ];

  const stats = [
    { value: "∞", label: t("landing.stats.clinics") },
    { value: "IA", label: t("landing.stats.assistant") },
    { value: "24/7", label: t("landing.stats.availability") },
    { value: "HIPAA", label: t("landing.stats.compliance") },
  ];

  const steps = [
    {
      step: t("landing.steps.step_1_title"),
      title: t("landing.steps.step_1_name"),
      desc: t("landing.steps.step_1_desc"),
    },
    {
      step: t("landing.steps.step_2_title"),
      title: t("landing.steps.step_2_name"),
      desc: t("landing.steps.step_2_desc"),
    },
    {
      step: t("landing.steps.step_3_title"),
      title: t("landing.steps.step_3_name"),
      desc: t("landing.steps.step_3_desc"),
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden">
      {/* ====== NAVBAR ====== */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border-light)]"
        style={{ background: "oklch(0.13 0.01 260 / 0.85)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-brand)" }}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              GEST<span style={{ color: "oklch(0.70 0.20 160)" }}>CLINIA</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden lg:flex items-center gap-6">
              <a href="#features" className="text-sm text-[var(--color-text-secondary)] hover:text-white transition">
                {t("landing.nav.features")}
              </a>
              <a href="#how-it-works" className="text-sm text-[var(--color-text-secondary)] hover:text-white transition">
                {t("landing.nav.how_it_works")}
              </a>
            </div>

            <div className="flex items-center gap-2 border-l border-[var(--color-border-light)] pl-4">
              <LanguageSelector />
              <ThemeToggle />
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="btn-ghost text-sm">
                {t("landing.nav.login")}
              </Link>
              <Link href="/register" className="btn-primary text-sm flex items-center gap-2">
                {t("landing.nav.start_free")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ====== HERO ====== */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, oklch(0.55 0.18 220), transparent 70%)" }} />
          <div className="absolute top-40 right-1/4 w-72 h-72 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, oklch(0.70 0.20 160), transparent 70%)" }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-medium"
              style={{
                background: "oklch(0.55 0.18 220 / 0.15)",
                border: "1px solid oklch(0.55 0.18 220 / 0.3)",
                color: "oklch(0.75 0.12 220)",
              }}>
              <Sparkles className="w-4 h-4" />
              {t("landing.hero.badge")}
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("landing.hero.title_1")}{" "}
            <span className="block"
              style={{
                background: "linear-gradient(135deg, oklch(0.65 0.15 220), oklch(0.75 0.18 160))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              {t("landing.hero.title_2")}
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10"
            style={{ color: "var(--color-text-secondary)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("landing.hero.description")}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/register" className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2">
              {t("landing.hero.cta_primary")} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#how-it-works" className="btn-ghost text-base px-8 py-3 flex items-center justify-center gap-2">
              <Activity className="w-5 h-5" />
              {t("landing.hero.cta_secondary")}
            </Link>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          className="max-w-4xl mx-auto mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="glass-card text-center py-5 px-4">
              <div className="text-2xl font-bold mb-1"
                style={{ color: "oklch(0.70 0.20 160)" }}>
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ====== FEATURES ====== */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("landing.features.title")}
            </h2>
            <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
              {t("landing.features.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "oklch(0.55 0.18 220 / 0.15)" }}>
                  <feature.icon className="w-5 h-5" style={{ color: "oklch(0.70 0.15 220)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6"
        style={{ background: "oklch(0.10 0.005 260)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("landing.steps.title")}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-5xl font-black mb-4"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.55 0.18 220 / 0.4), oklch(0.70 0.20 160 / 0.4))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="py-24 px-4 sm:px-6">
        <motion.div
          className="max-w-3xl mx-auto glass-card p-10 sm:p-14 text-center animate-pulse-glow"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Stethoscope className="w-12 h-12 mx-auto mb-6" style={{ color: "oklch(0.70 0.20 160)" }} />
          <h2 className="text-3xl font-bold mb-4">
            {t("landing.cta.title")}
          </h2>
          <p className="text-base mb-8" style={{ color: "var(--color-text-secondary)" }}>
            {t("landing.cta.description")}
          </p>
          <Link href="/register" className="btn-primary text-base px-10 py-3.5 inline-flex items-center gap-2">
            {t("landing.cta.button")} <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t py-8 px-4 sm:px-6"
        style={{ borderColor: "var(--color-border-light)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" style={{ color: "oklch(0.70 0.20 160)" }} />
            <span className="text-sm font-semibold">GESTCLINIA</span>
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            © {new Date().getFullYear()} GESTCLINIA. {t("landing.footer.tagline")}
          </p>
        </div>
      </footer>
    </main>
  );
}
