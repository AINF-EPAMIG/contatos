"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/painel");
    }
  }, [status, router]);

  if (status === "loading") {
    return null;
  }

  return (
    <div
      className="min-h-screen min-w-screen flex flex-col items-center justify-start bg-cover bg-center pt-6"
      style={{ backgroundImage: "url('/rh.png')" }}
    >
      {/* Mensagem de boas-vindas */}
      {showWelcome && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-800 px-6 py-3 rounded-xl shadow-lg animate-fade-in">
          Bem-vindo(a) à plataforma!
        </div>
      )}
      {/* Título fora do card */}
      <div className="flex items-center w-full justify-center mt-0 mb-6">
        <div className="h-10 border-l-4 border-green-600 mr-3 rounded-sm" />
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Saúde Mental</h1>
      </div>
      {/* Card central de login */}
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-xl flex flex-col items-center gap-8 w-full max-w-md text-center mx-4">
        {/* Logo EPAMIG */}
        <Image
          src="/epamig.svg"
          alt="EPAMIG"
          width={200}
          height={70}
          priority
        />

        {/* Botão de Login com Google */}
        <button
          onClick={() => signIn("google")}
          className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md border hover:bg-gray-100 transition"
        >
          {/* Ícone Google inline */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="24px"
            height="24px"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.3 16.1 18.8 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4 24 4 16.2 4 9.4 8.4 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.5 0 10.5-2.1 14.3-5.7l-6.6-5.4C29.7 34.9 27 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.4 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.7 5.1l.1.1 6.6 5.4C41.9 35.4 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z"
            />
          </svg>
          <span className="font-medium text-gray-700">
            Login e-mail epamig.br
          </span>
        </button>
      </div>
    </div>

  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <HomeContent />
    </Suspense>
  );
}
