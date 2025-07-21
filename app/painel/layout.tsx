import { ReactNode } from "react";
import MobileHeader from "@/components/ui/MobileHeader";
import MobileMenu from "@/components/ui/MobileMenu";

export default function PainelLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col">
      <MobileHeader />
      <section className="flex-1 flex flex-col pb-20 px-2">
        <div className="w-full max-w-full md:max-w-2xl mx-auto py-4">
          {children}
        </div>
      </section>
      <MobileMenu /> {/* <-- IMPORTANTE: fica fora da section! */}
    </main>
  );
}
