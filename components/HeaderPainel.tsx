"use client"

import { signOut, useSession } from "next-auth/react"
import { LogOut } from "lucide-react"

export default function HeaderPainel() {
  const { data: session } = useSession()

  return (
    <header className="bg-green-700 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <div className="font-bold text-lg">EPAMIG</div>

      {session && (
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 text-sm bg-green-800 hover:bg-green-900 px-3 py-1.5 rounded"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      )}
    </header>
  )
}
