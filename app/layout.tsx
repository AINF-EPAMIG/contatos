// app/layout.tsx

import "@/app/globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata = {
  title: "Saúde Mental - EPAMIG",
  description: "Gestão da Saúde Mental EPAMIG",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#025C3E" />
        <link rel="apple-touch-icon" href="/epamig_logo.svg" />
      </head>
      <body>
        <script src="/register-sw.js" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
