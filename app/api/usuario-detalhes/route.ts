import { NextRequest, NextResponse } from "next/server";
import { funcionariosDB } from "@/lib/db";

// Força renderização dinâmica para evitar erro de static rendering
export const dynamic = 'force-dynamic';

interface ColaboradorDetalhes {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  telefone: string;
  regional_nome: string;
  departamento_nome: string;
  divisao_nome: string;
  assessoria_nome: string;
  fazenda_nome: string;
  diretoria_nome: string;
  gabinete_nome: string;
}

// Função para sanitizar telefone
function sanitizarTelefone(telefone: unknown): string {
  if (!telefone || typeof telefone !== 'string') return '';
  
  // Remove espaços, caracteres especiais e mantém apenas números
  const telefoneLimpo = String(telefone)
    .trim()
    .replace(/[^\d().\s-]/g, '') // Remove caracteres inválidos
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
  
  // Se não tiver nenhum dígito, retorna vazio
  if (!/\d/.test(telefoneLimpo)) return '';
  
  return telefoneLimpo;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Iniciando busca de detalhes do colaborador ===');
    
    const { email } = await request.json();

    if (!email) {
      console.log('Erro: E-mail não fornecido');
      return NextResponse.json({ success: false, message: "E-mail é obrigatório" }, { status: 400 });
    }

    console.log('Buscando detalhes para o email:', email);

    // Teste de conexão
    try {
      await funcionariosDB.execute('SELECT 1');
      console.log('Conexão com banco de dados OK');
    } catch (connError) {
      console.error('Erro de conexão com banco:', connError);
      return NextResponse.json({ 
        success: false, 
        message: "Erro de conexão com banco de dados" 
      }, { status: 500 });
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
      WHERE c.email = ? AND c.status = 1
      LIMIT 1`,
      [email]
    );

    console.log('Resultado da query:', { 
      rowCount: Array.isArray(rows) ? rows.length : 0,
      email: email 
    });

    const colaborador = (rows as ColaboradorDetalhes[])[0];

    if (!colaborador) {
      console.log('Colaborador não encontrado para o email:', email);
      return NextResponse.json({ success: false, message: "Colaborador não encontrado" }, { status: 404 });
    }

    console.log('Colaborador encontrado:', colaborador.nome);

    const response = { 
      success: true, 
      colaborador: {
        id: colaborador.id,
        nome: colaborador.nome,
        email: colaborador.email,
        telefone: sanitizarTelefone(colaborador.telefone),
        cargo: colaborador.cargo,
        regional: colaborador.regional_nome ? { nome: colaborador.regional_nome } : null,
        departamento: colaborador.departamento_nome ? { nome: colaborador.departamento_nome } : null,
        divisao: colaborador.divisao_nome ? { nome: colaborador.divisao_nome } : null,
        assessoria: colaborador.assessoria_nome ? { nome: colaborador.assessoria_nome } : null,
        fazenda: colaborador.fazenda_nome ? { nome: colaborador.fazenda_nome } : null,
        diretoria: colaborador.diretoria_nome ? { nome: colaborador.diretoria_nome } : null,
        gabinete: colaborador.gabinete_nome ? { nome: colaborador.gabinete_nome } : null,
      }
    };

    console.log('=== Busca de detalhes concluída com sucesso ===');
    return NextResponse.json(response);

  } catch (error) {
    console.error("=== Erro ao buscar colaborador ===");
    console.error("Erro detalhado:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'N/A');
    
    return NextResponse.json({ 
      success: false, 
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}