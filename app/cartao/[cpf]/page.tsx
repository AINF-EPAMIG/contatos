import { notFound } from "next/navigation";
import Image from "next/image";
import { User, Mail } from "lucide-react";
import LinksSection from "./LinksSection";

// Tipos
export type CartaoDigital = {
  id: number;
  cpf: string;
  nome: string;
  email: string;
  cargo: string;
  foto: string | null;
  linkedin: string | null;
  whatsapp: string | null;
  instagram: string | null;
  lattes: string | null;
};

interface CartaoPageProps {
  params: { cpf: string };
}

// Busca dados do cartão institucional pela API interna
async function getCartaoByCpf(cpf: string): Promise<CartaoDigital | null> {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const baseUrl = isProd
      ? process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
      : "http://localhost:3000";
    console.log("Ambiente:", process.env.NODE_ENV);
    console.log("baseUrl usado:", baseUrl);
    const url = `${baseUrl}/api/cartao-digital?cpf=${cpf}`;
    console.log("Buscando cartão em:", url);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      console.error("Erro ao buscar cartão:", res.status, text);
      return null;
    }
    const data = await res.json();
    return data.cartao || null;
  } catch (err) {
    console.error("Erro inesperado em getCartaoByCpf:", err);
    return null;
  }
}

export default async function CartaoPage({ params }: CartaoPageProps) {
  const cartao = await getCartaoByCpf(params.cpf);
  if (!cartao) return notFound();

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md mx-auto py-4 sm:py-8">
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-t-2xl shadow-lg flex flex-col items-center">
          <Image src="/logo_branca.svg" alt="Logo EPAMIG" width={120} height={32} className="h-10 sm:h-12 mb-2 w-auto" style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.15))' }} priority />
          <h1 className="text-lg sm:text-xl font-bold">Cartão Institucional</h1>
        </div>
        <div className="bg-white rounded-b-2xl shadow-2xl border border-gray-200">
          <ProfileSection cartao={cartao} isMobile={true} />
          <LinksSection cartao={cartao} isMobile={true} />
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>© 2025 EPAMIG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPrimeiroUltimoNome(nome = ""): string {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1]}`;
}  
   
   
function ProfileSection({ cartao, isMobile }: { cartao: CartaoDigital; isMobile: boolean }) {
  return (
    <div className={`${isMobile ? 'bg-gradient-to-br from-green-600 to-green-700 px-4 sm:px-6 py-6 sm:py-8' : ''} text-center relative`}>
      <div className={`${isMobile ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-32 h-32'} mx-auto mb-3 sm:mb-4 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden shadow-xl`}>
        {cartao?.foto ? (
          <Image
            src={cartao.foto.startsWith("http") ? cartao.foto : `/uploads/${cartao.foto}`}
            alt="Foto do usuário"
            width={isMobile ? 96 : 128}
            height={isMobile ? 96 : 128}
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 20%' }}
            priority
          />
        ) : (
          <User size={isMobile ? 32 : 60} className="text-gray-400 sm:w-10 sm:h-10" />
        )}
      </div>
      <h2 className={`${isMobile ? 'text-xl sm:text-2xl' : 'text-3xl'} font-bold text-white mb-2`}>
        {getPrimeiroUltimoNome(cartao?.nome || "")}
      </h2>
      <p className={`${isMobile ? 'text-sm sm:text-base' : 'text-lg'} text-green-100 mb-3 sm:mb-4 font-medium`}>
        {cartao?.cargo || ""}
      </p>
      {cartao?.email && (
        <div className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-white/20 rounded-full text-xs sm:text-sm border border-white/30">
          <Mail size={12} className="text-white sm:w-3 sm:h-3" />
          <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">{cartao.email}</span>
        </div>
      )}
    </div>
  );
} 