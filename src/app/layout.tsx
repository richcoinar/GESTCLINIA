import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "GESTCLINIA — Gestión Inteligente de Clínicas",
  description:
    "Plataforma moderna de gestión de clínicas con asistentes virtuales para documentación médica, agendamiento y administración.",
  keywords: [
    "gestión clínica",
    "asistente médico virtual",
    "documentación clínica",
    "SOAP notes",
    "medical scribe",
  ],
  openGraph: {
    title: "GESTCLINIA",
    description: "Tu plataforma de gestión clínica inteligente.",
    url: "https://gestclinia.publicalogratis.com",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem("theme");
                  if (savedTheme === "light") {
                    document.documentElement.classList.add("light");
                  } else {
                    document.documentElement.classList.remove("light");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.16 0.015 260)",
              border: "1px solid oklch(0.28 0.02 260)",
              color: "oklch(0.95 0.01 260)",
            },
          }}
        />
      </body>
    </html>
  );
}
