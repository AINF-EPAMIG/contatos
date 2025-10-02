// components/Header.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { Globe, User } from "lucide-react"
import { signIn, signOut, useSession } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-md z-50 w-full">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image src="/epamig_logo.svg" alt="EPAMIG Logo" width={120} height={40} priority />
          <div className="hidden md:block">
            <h1 className="text-green-700 font-semibold text-sm md:text-lg">
              Empresa de Pesquisa Agropecuária de Minas Gerais
            </h1>
            <p className="text-gray-700 text-xs font-medium">
              Secretaria de Estado de Agricultura, Pecuária e Abastecimento
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="https://www.epamig.br" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline flex items-center gap-1 text-sm">
            <Globe size={18} /> <span className="hidden md:inline">Site Oficial</span>
          </Link>
          <Link href="https://mail.google.com/mail/u/0/#inbox" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline flex items-center gap-1 text-sm">
            {/* Ícone de e-mail */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5h-9A2.5 2.5 0 005 6v12a2.5 2.5 0 002.5 2.5h9A2.5 2.5 0 0019 18V6a2.5 2.5 0 00-2.5-2.5zM5 6l7 6 7-6" /></svg>
            <span className="hidden md:inline">E-mail</span>
          </Link>
          <Link href="https://empresade125369.rm.cloudtotvs.com.br/Corpore.Net/Login.aspx" target="_blank" rel="noopener noreferrer" className="text-orange-700 hover:underline flex items-center gap-1 text-sm">
            {/* Ícone de portal ADM */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v.01M6.938 4.938a10 10 0 1110.124 0M12 2v2m0 16v2m8-10h2M2 12H4" /></svg>
            <span className="hidden md:inline">Portal ADM</span>
          </Link>
          {session ? (
            <button
              onClick={() => signOut()}
              className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 text-sm flex items-center gap-1"
            >
              <User size={18} /> Sair
            </button>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 text-sm flex items-center gap-1"
            >
              <User size={18} /> Login Google
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
