import { NextRequest, NextResponse } from "next/server";
import { funcionariosDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "E-mail é obrigatório" }, { status: 400 });
    }

    const [rows] = await funcionariosDB.execute(
      `SELECT 
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
      WHERE c.email = ? AND c.status = 1`,
      [email]
    );

interface ColaboradorDetalhes {
      id: number;
      nome: string;
      email: string;
      cargo: string;
      telefone: string;
      foto_perfil: string;
      regional_nome: string;
      departamento_nome: string;
      divisao_nome: string;
      assessoria_nome: string;
      fazenda_nome: string;
      diretoria_nome: string;
      gabinete_nome: string;
    }

    const colaborador = (rows as ColaboradorDetalhes[])[0];

    if (!colaborador) {
      return NextResponse.json({ success: false, message: "Colaborador não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      colaborador: {
        id: colaborador.id,
        nome: colaborador.nome,
        email: colaborador.email,
        telefone: colaborador.telefone,
        cargo: colaborador.cargo,
        regional: colaborador.regional_nome ? { nome: colaborador.regional_nome } : null,
        departamento: colaborador.departamento_nome ? { nome: colaborador.departamento_nome } : null,
        divisao: colaborador.divisao_nome ? { nome: colaborador.divisao_nome } : null,
        assessoria: colaborador.assessoria_nome ? { nome: colaborador.assessoria_nome } : null,
        fazenda: colaborador.fazenda_nome ? { nome: colaborador.fazenda_nome } : null,
        diretoria: colaborador.diretoria_nome ? { nome: colaborador.diretoria_nome } : null,
        gabinete: colaborador.gabinete_nome ? { nome: colaborador.gabinete_nome } : null,
      }
    });

  } catch (error) {
    console.error("Erro ao buscar colaborador:", error);
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 });
  }
}