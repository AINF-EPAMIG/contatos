"use client";
import { Phone, Instagram, Mail, BookOpenCheck } from "lucide-react";
import { CartaoDigital } from "./page";

function getWhatsappUrl(num?: string): string {
  const n = num?.replace(/[^\d]/g, "");
  return n ? `https://wa.me/${n}` : "#";
}
function getInstagramUrl(username?: string): string {
  if (!username) return "#";
  if (username.startsWith("http")) return username;
  return `https://instagram.com/${username.replace(/^@/, "")}`;
}

export default function LinksSection({ cartao, isMobile }: { cartao: CartaoDigital; isMobile: boolean }) {
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
            onClick={link.hasData ? undefined : (e) => { if (!link.hasData) e.preventDefault(); }}
            tabIndex={link.hasData ? 0 : -1}
            aria-disabled={!link.hasData}
          >
            <link.icon size={18} className="sm:w-5 sm:h-5" />
            <span>{link.text}</span>
          </a>
        ))}
      </div>
    );
  } else {
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
              onClick={link.hasData ? undefined : (e) => { if (!link.hasData) e.preventDefault(); }}
              tabIndex={link.hasData ? 0 : -1}
              aria-disabled={!link.hasData}
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