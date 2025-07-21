import { NextResponse } from "next/server";
import { getConexoes } from "@/lib/db";
import type { Pool, RowDataPacket } from "mysql2/promise";

interface Usuario extends RowDataPacket {
  id: number;
  email_institucional: string;
  perfil: string;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    }

    const conexoes = await getConexoes();
    const sistemas: unknown[] = [];

    for (const [nome, conn] of Object.entries(conexoes.pools)) {
      try {
        if (conn && typeof (conn as Pool).execute === 'function') {
          const pool = conn as Pool;

          const [rows] = await pool.execute<Usuario[]>(
            "SELECT * FROM usuario WHERE email_institucional = ?",
            [email]
          );

          const usuarios = rows as Usuario[];

          if (usuarios.length > 0) {
            sistemas.push({
              nome: nome.toUpperCase(),
              url: nome === 'sgi' ? "https://sgi.epamig.br" : "https://plataforma.epamig.br",
              permissao: usuarios[0].perfil || "Usuário",
            });
          }
        }
      } catch (err) {
        console.error(`Erro ao consultar banco ${nome}:`, err);
      }
    }

    return NextResponse.json({ sistemas });
  } catch (error) {
    console.error("Erro geral ao processar:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
