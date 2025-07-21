"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { User, Instagram, Mail, Phone, BookOpenCheck, Edit, Plus } from "lucide-react";
import { useResponsive } from "@/lib/hooks/useResponsive";
import dynamic from "next/dynamic";
import Image from "next/image";

// ============================================================================
// COMPONENTS
// ============================================================================
const CartaoDigitalForm = dynamic(() => import("./CartaoDigitalForm"), {
  loading: () => <p>Carregando...</p>,
  ssr: false
});

// ============================================================================
// TYPES
// ============================================================================
type CartaoDigital = {
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

type UserData = {
  cpf: string;
  name?: string;
  email?: string;
  cargo?: string;
  chapa?: string;
};

// ============================================================================
// UTILITIES
// ============================================================================
function getPrimeiroUltimoNome(nome = ""): string {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1]}`;
}

function getWhatsappUrl(num: string): string {
  const n = num?.replace(/[^\d]/g, "");
  return n ? `https://wa.me/${n}` : "#";
}

function getInstagramUrl(username: string): string {
  if (!username) return "#";
  if (username.startsWith("http")) return username;
  return `https://instagram.com/${username.replace(/^@/, "")}`;
}

export default function MeusDadosPage() {
  const { data: session, status } = useSession();
  const { isMobile, isClient } = useResponsive();
  const user = session?.user as UserData | undefined;

  const [cartao, setCartao] = useState<CartaoDigital | null>(null);
  const [baseUrl, setBaseUrl] = useState(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(process.env.NEXT_PUBLIC_BASE_URL || window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && user?.cpf) {
      fetch(`/api/cartao-digital?cpf=${user.cpf}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Erro na API");
          const text = await res.text();
          if (!text) return setCartao(null);
          const data = JSON.parse(text);
          setCartao(data.cartao || null);
        })
        .catch(() => setCartao(null));
    } else {
      setCartao(null);
    }
  }, [user?.cpf, status]);

  if (status === "loading" || !isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-500 mt-2 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className="min-h-screen p-2 sm:p-4">
      {/* ====================================================================
          CARD INSTITUCIONAL PROFISSIONAL - LAYOUT RESPONSIVO
      ==================================================================== */}
      <div className={`w-full ${isMobile ? 'max-w-sm sm:max-w-md' : 'max-w-4xl'} mx-auto py-4 sm:py-8`}>
        {/* Header Institucional */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-t-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold">Cartão Institucional</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white/20 rounded-xl text-xs sm:text-sm font-medium hover:bg-white/30 transition-all border border-white/30"
            >
              {cartao ? <Edit size={14} className="sm:w-4 sm:h-4" /> : <Plus size={14} className="sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">{cartao ? "Editar" : "Criar"}</span>
            </button>
          </div>
        </div>

        {/* Conteúdo do Card - Layout Responsivo */}
        <div className="bg-white rounded-b-2xl shadow-2xl border border-gray-200">
          {isMobile ? (
            // Layout Mobile - Vertical
            <MobileLayout 
              cartao={cartao}
              user={user}
              baseUrl={baseUrl}
            />
          ) : (
            // Layout Desktop - Horizontal
            <DesktopLayout 
              cartao={cartao}
              user={user}
              baseUrl={baseUrl}
            />
          )}

          {/* Footer Institucional */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>© 2025 EPAMIG</span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MODAL
      ==================================================================== */}
      {showModal && (
        <EditModal 
          cartao={cartao}
          user={user}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

// Layout Mobile - Vertical
function MobileLayout({ 
  cartao, 
  user, 
  baseUrl 
}: { 
  cartao: CartaoDigital | null; 
  user: UserData | undefined; 
  baseUrl: string;
}) {
  return (
    <>
      {/* Profile Section Institucional */}
      <ProfileSection 
        cartao={cartao}
        user={user}
        isMobile={true}
      />

      {/* Links Section */}
      <LinksSection cartao={cartao || { id: 0, cpf: user?.cpf || "", nome: user?.name || "", email: user?.email || "", cargo: user?.cargo || "", foto: null, linkedin: null, whatsapp: null, instagram: null, lattes: null }} isMobile={true} />

      {/* QR Code Section */}
      <QRCodeSection 
        baseUrl={baseUrl || "http://localhost:3000/cartao"}
        cpf={cartao?.cpf || user?.cpf || "12345678900"}
        isMobile={true}
      />
    </>
  );
}

// Layout Desktop - Horizontal
function DesktopLayout({ 
  cartao, 
  user, 
  baseUrl 
}: { 
  cartao: CartaoDigital | null; 
  user: UserData | undefined; 
  baseUrl: string;
}) {
  return (
    <div className="flex">
      {/* Coluna Esquerda - Perfil */}
      <div className="w-1/2 bg-gradient-to-br from-green-600 to-green-700 p-8 text-center">
        <ProfileSection 
          cartao={cartao}
          user={user}
          isMobile={false}
        />
      </div>

      {/* Coluna Direita - Links e QR Code */}
      <div className="w-1/2 p-6 flex flex-col justify-center">
        {/* Links Section */}
        <LinksSection cartao={cartao || { id: 0, cpf: user?.cpf || "", nome: user?.name || "", email: user?.email || "", cargo: user?.cargo || "", foto: null, linkedin: null, whatsapp: null, instagram: null, lattes: null }} isMobile={false} />

        {/* QR Code Section */}
        <QRCodeSection 
          baseUrl={baseUrl || "http://localhost:3000/cartao"}
          cpf={cartao?.cpf || user?.cpf || "12345678900"}
          isMobile={false}
        />
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Profile Section Component
function ProfileSection({ 
  cartao, 
  user,
  isMobile
}: { 
  cartao: CartaoDigital | null; 
  user: UserData | undefined; 
  isMobile: boolean;
}) {
  return (
    <div className={`${isMobile ? 'bg-gradient-to-br from-green-600 to-green-700 px-4 sm:px-6 py-6 sm:py-8' : ''} text-center relative`}>
      {/* Avatar Institucional */}
      <div className={`${isMobile ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-32 h-32'} mx-auto mb-3 sm:mb-4 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden shadow-xl`}>
        {cartao?.foto ? (
          <Image
            src={cartao.foto.startsWith("http") ? cartao.foto : `/uploads/${cartao.foto}`}
            alt="Foto do usuário"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 20%' }}
            width={isMobile ? 96 : 128}
            height={isMobile ? 96 : 128}
          />
        ) : (
          <User size={isMobile ? 32 : 60} className="text-gray-400 sm:w-10 sm:h-10" />
        )}
      </div>

      {/* User Info Institucional */}
      <h2 className={`${isMobile ? 'text-xl sm:text-2xl' : 'text-3xl'} font-bold text-white mb-2`}>
        {getPrimeiroUltimoNome(cartao?.nome || user?.name || "")}
      </h2>
      <p className={`${isMobile ? 'text-sm sm:text-base' : 'text-lg'} text-green-100 mb-3 sm:mb-4 font-medium`}>
        {cartao?.cargo || user?.cargo || ""}
      </p>
      
      {/* Email Badge Institucional */}
      {cartao?.email && (
        <div className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-white/20 rounded-full text-xs sm:text-sm border border-white/30">
          <Mail size={12} className="text-white sm:w-3 sm:h-3" />
          <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">{cartao.email}</span>
        </div>
      )}
    </div>
  );
}

// Links Section Component
function LinksSection({ 
  cartao,
  isMobile
}: { 
  cartao: CartaoDigital; 
  isMobile: boolean;
}) {
  const linkConfigs = [
    {
      hasData: !!cartao.whatsapp,
      href: getWhatsappUrl(cartao.whatsapp || ""),
      icon: Phone,
      text: "WhatsApp",
      bgColor: "bg-green-500 hover:bg-green-600",
      disabledBgColor: "bg-gray-400 cursor-not-allowed"
    },
    {
      hasData: !!cartao.instagram,
      href: getInstagramUrl(cartao.instagram || ""),
      icon: Instagram,
      text: "Instagram",
      bgColor: "bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 hover:opacity-90",
      disabledBgColor: "bg-gray-400 cursor-not-allowed"
    },
    {
      hasData: !!cartao.email,
      href: `mailto:${cartao.email}`,
      icon: Mail,
      text: "E-mail",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      disabledBgColor: "bg-gray-400 cursor-not-allowed"
    },
    {
      hasData: !!cartao.lattes,
      href: cartao.lattes || "#",
      icon: BookOpenCheck,
      text: "Lattes",
      bgColor: "bg-indigo-600 hover:bg-indigo-700",
      disabledBgColor: "bg-gray-400 cursor-not-allowed"
    }
  ];

  if (isMobile) {
    // Layout Mobile - Botões verticais grandes
    return (
      <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
        {linkConfigs.map((link, index) => (
          <a
            key={index}
            href={link.hasData ? link.href : "#"}
            target={link.hasData ? "_blank" : undefined}
            rel={link.hasData ? "noopener noreferrer" : undefined}
            className={`flex items-center gap-2 sm:gap-3 w-full p-3 sm:p-4 rounded-xl text-white font-semibold transition-all text-sm sm:text-base shadow-md ${
              link.hasData ? `${link.bgColor} hover:shadow-lg` : link.disabledBgColor
            }`}
            onClick={link.hasData ? undefined : (e) => e.preventDefault()}
          >
            <link.icon size={18} className="sm:w-5 sm:h-5" />
            <span>{link.text}</span>
          </a>
        ))}
      </div>
    );
  } else {
    // Layout Desktop - Grid de botões compactos
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Contatos</h3>
        <div className="grid grid-cols-2 gap-3">
          {linkConfigs.map((link, index) => (
            <a
              key={index}
              href={link.hasData ? link.href : "#"}
              target={link.hasData ? "_blank" : undefined}
              rel={link.hasData ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-2 p-3 rounded-lg text-white font-medium transition-all text-sm shadow-md ${
                link.hasData ? `${link.bgColor} hover:shadow-lg` : link.disabledBgColor
              }`}
              onClick={link.hasData ? undefined : (e) => e.preventDefault()}
            >
              <link.icon size={16} />
              <span>{link.text}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }
}

// QR Code Section Component
function QRCodeSection({ 
  baseUrl, 
  cpf, 
  isMobile 
}: { 
  baseUrl: string; 
  cpf: string; 
  isMobile: boolean; 
}) {
  if (isMobile) {
    return (
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 text-center border border-gray-100">
          <div className="bg-white rounded-xl p-3 sm:p-4 inline-block shadow-md">
            <QRCode 
              value={`${baseUrl}/cartao/${cpf}`} 
              size={80} 
              className="sm:w-24 sm:h-24"
            />
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mt-3 sm:mt-4 font-medium">
            📱 Escaneie para acessar meu Cartão Institucional
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">QR Code</h3>
        <div className="bg-white rounded-xl p-4 inline-block border border-gray-100">
          <div className="bg-white rounded-lg p-3 shadow-md">
            <QRCode 
              value={`${baseUrl}/cartao/${cpf}`} 
              size={120} 
            />
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-3 font-medium">
          📱 Escaneie para acessar
        </p>
      </div>
    );
  }
}

// Edit Modal Component
function EditModal({ 
  cartao, 
  user, 
  onClose 
}: { 
  cartao: CartaoDigital | null; 
  user: UserData | undefined; 
  onClose: () => void; 
}) {
  // Garantir que user não seja undefined
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {cartao ? "Editar" : "Criar"} Cartão
            </h3>
            <button
              className="text-gray-400 hover:text-gray-600 p-1"
              onClick={onClose}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          <CartaoDigitalForm
            user={user}
            cartao={cartao}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
