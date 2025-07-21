"use client";
import { useSession } from "next-auth/react";
import { User, FileText, Truck, IdCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useResponsive } from "@/lib/hooks/useResponsive";

// Menu dinâmico de módulos
const modulos = [
  { label: "Contratos", icon: <FileText />, href: "/painel/contratos" },
  { label: "Transporte", icon: <Truck />, href: "/painel/transporte" },
  { label: "Meus Dados", icon: <IdCard />, href: "/painel/meus-dados" },
];

function getPrimeiroUltimoNome(nome: string = ""): string {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1]}`;
}

export default function PainelPage() {
  const { data: session } = useSession();
  const { isClient } = useResponsive();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const user = session?.user as {
    name?: string;
    email?: string;
    chapa?: string;
    cargo?: string;
  } | undefined;

  useEffect(() => {
    const fetchUserPhoto = async () => {
      if (user?.email) {
        try {
          const response = await fetch(`/api/cartao-digital?email=${encodeURIComponent(user.email)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.cartao && data.cartao.foto) {
              setUserPhoto(`/uploads/${data.cartao.foto}`);
            }
          }
        } catch (error) {
          console.log("Erro ao carregar foto:", error);
        }
      }
    };
    fetchUserPhoto();
  }, [user?.email]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Bloco do Usuário */}
      <div className="bg-gradient-to-r from-[#3A8144] to-[#6DB08D] rounded-xl shadow mb-4 px-4 py-3 flex items-center gap-3 w-full">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/30 overflow-hidden shadow-lg">
            {userPhoto ? (
              <img src={userPhoto} alt="Foto do usuário" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <User className="text-white" size={28} />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-white leading-tight truncate">
            {getPrimeiroUltimoNome(user?.name || "Usuário")}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span className="text-white/90 text-xs md:text-sm font-medium">
              Cargo: {user?.cargo || "N/A"}
            </span>
            <span className="text-white/90 text-xs md:text-sm font-medium">
              Chapa: {user?.chapa || "N/A"}
            </span>
            <span className="text-white/90 text-xs md:text-sm font-medium">
              {user?.email || "Email não informado"}
            </span>
          </div>
        </div>
      </div>

      {/* MENU DINÂMICO DE MÓDULOS */}
      <div className="bg-white rounded-xl shadow w-full">
        {modulos.map((mod, idx) => (
          <a
            key={mod.href}
            href={mod.href}
            className="flex items-center gap-4 px-4 py-4 hover:bg-epamig-100 transition border-b last:border-b-0 w-full"
          >
            <span className="text-epamig-600">{mod.icon}</span>
            <span className="font-medium text-base text-gray-800">{mod.label}</span>
          </a>
        ))}
      </div>
    </>
  );
}
