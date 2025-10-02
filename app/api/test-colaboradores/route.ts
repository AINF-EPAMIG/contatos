import { NextResponse } from "next/server";
import { funcionariosDB } from "@/lib/db";

interface DatabaseRow {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  telefone: string;
  status: number;
  regional_id: number;
  regional_nome: string;
}

export async function GET() {
  try {
    console.log("=== API test-colaboradores ===");
    
    // Buscar todos os colaboradores ativos
    const [rows] = await funcionariosDB.query(`
      SELECT 
        c.id,
        c.nome,
        c.email,
        c.cargo,
        c.telefone,
        c.status,
        c.regional_id,
        r.nome_regional AS regional_nome
      FROM colaboradores c
      LEFT JOIN regional r ON c.regional_id = r.id
      LIMIT 10
    `) as [DatabaseRow[], unknown];

    console.log("Colaboradores encontrados:", rows);

    return NextResponse.json({
      success: true,
      total: rows?.length || 0,
      colaboradores: rows || []
    });

  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return NextResponse.json({ 
      error: "Erro ao buscar colaboradores",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}