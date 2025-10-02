import { NextResponse } from "next/server";
import { getConexoes } from "@/lib/db";

// Força renderização dinâmica para evitar erro de static rendering
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ exists: false });
  }
  try {
    const { pools } = await getConexoes();
    const [rows] = await pools.quadro_funcionarios.query(
      "SELECT 1 FROM colaboradores WHERE LOWER(email) = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );
    return NextResponse.json({ exists: Array.isArray(rows) && rows.length > 0 });
  } catch (e) {
    const msg = typeof e === 'object' && e && 'message' in e ? (e as { message: string }).message : String(e);
    return NextResponse.json({ exists: false, error: msg });
  }
}
