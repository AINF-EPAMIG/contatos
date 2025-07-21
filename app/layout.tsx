// app/layout.tsx

import "@/app/globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata = {
  title: "EPAMIG Conecta",
  description: "Sistema Integrado da EPAMIG",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
