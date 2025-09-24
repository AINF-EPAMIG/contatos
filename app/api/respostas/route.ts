import { NextRequest, NextResponse } from "next/server";
import { getConexoes } from "@/lib/db";

// Verifica se já existe resposta para o email no dia atual
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
  }
  const conexoes = await getConexoes();
  const conn = conexoes.pools.saude_mental;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const [rows] = await conn.execute(
    `SELECT id FROM respostas WHERE email = ? AND data_resposta >= ? AND data_resposta < ? LIMIT 1`,
    [email, today, tomorrow]
  );
  return NextResponse.json({ exists: Array.isArray(rows) && rows.length > 0 });
}
