import { NextResponse } from "next/server";
import { funcionariosDB } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await funcionariosDB.query(`
      SELECT 
        c.id,
        c.nome,
        c.email,
        c.cargo,
        c.telefone,
        c.regional_id,
        c.departamento_id,
        c.divisao_id,
        c.assessoria_id,
        c.fazenda_id,
        c.diretoria_id,
        c.gabinete_id,
        r.nome_regional       AS regional_nome,
        d.nome_departamento   AS departamento_nome,
        dv.nome_divisao       AS divisao_nome,
        a.nome_assessoria     AS assessoria_nome,
        f.nome_fazenda        AS fazenda_nome,
        dir.nome_diretoria    AS diretoria_nome,
        g.nome_gabinete       AS gabinete_nome
      FROM colaboradores c
      LEFT JOIN regional r ON c.regional_id = r.id
      LEFT JOIN departamentos d ON c.departamento_id = d.id
      LEFT JOIN divisao dv ON c.divisao_id = dv.id
      LEFT JOIN assessoria a ON c.assessoria_id = a.id
      LEFT JOIN fazenda f ON c.fazenda_id = f.id
      LEFT JOIN diretoria dir ON c.diretoria_id = dir.id
      LEFT JOIN gabinete g ON c.gabinete_id = g.id
      WHERE c.status = 1 AND c.telefone IS NOT NULL AND c.telefone != ''
      GROUP BY c.id
      ORDER BY c.nome ASC
    `);
    
    // Retornar apenas o array de colaboradores
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erro ao consultar colaboradores:", error);
    return NextResponse.json({ success: false, message: "Erro ao consultar colaboradores" }, { status: 500 });
  }
}
