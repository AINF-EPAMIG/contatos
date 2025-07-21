import { NextRequest, NextResponse } from "next/server";
import { getConexoes } from "@/lib/db";

// Mapa de nomes de sistemas → Nome amigável + URLs base
const sistemaConfigs: Record<string, { nome: string; url: string }> = {
  sgi: { nome: "SGI WEB", url: "http://localhost/sgi/web/" },
  plataforma: { nome: "Plataforma de Pesquisa 2.0 ", url: "http://localhost/plataforma/web/" },
  financeiro: { nome: "Financeiro - Gestão Financeira", url: "http://localhost/financeiro/web/" },
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    const { pools } = await getConexoes(); // ✅ Correto agora usando pools

    const sistemas: any[] = [];

    for (const [nome, pool] of Object.entries(pools)) {
      try {
        const [rows] = await pool.query(
          "SELECT * FROM usuario WHERE email_institucional = ?",
          [email]
        );

        if (Array.isArray(rows) && rows.length > 0) {
          // 🔥 Para cada permissão diferente no mesmo sistema, cria uma entrada única
          for (const row of rows as any[]) {
            sistemas.push({
              nome: sistemaConfigs[nome]?.nome || `Sistema (${nome})`,
              url: sistemaConfigs[nome]?.url || `http://localhost/${nome}/web/`,
              database: nome,
              permissao: row.tipo || "Usuário Padrão",
            });
          }
        }
      } catch (err) {
        console.error(`Erro ao consultar ${nome}:`, err);
      }
    }

    return NextResponse.json({ sistemas });
  } catch (error) {
    console.error("Erro geral na API /api/painel:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
