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
          <Link href="https://epamig.br" target="_blank" className="text-green-700 hover:underline flex items-center gap-1 text-sm">
            <Globe size={18} /> <span className="hidden md:inline">Site</span>
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
