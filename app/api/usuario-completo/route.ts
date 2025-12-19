import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mysql from "mysql2/promise";

// Força renderização dinâmica para evitar erro de static rendering
export const dynamic = 'force-dynamic';

interface UsuarioCompleto {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  telefone: string;
  foto_perfil: string;
  regional_id: number;
  regional_nome: string;
  departamento_id: number;
  departamento_nome: string;
  divisao_id: number;
  divisao_nome: string;
  assessoria_id: number;
  assessoria_nome: string;
  fazenda_id: number;
  fazenda_nome: string;
  diretoria_id: number;
  diretoria_nome: string;
  gabinete_id: number;
  gabinete_nome: string;
}

interface EmailUser {
  email: string;
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

// Usar a mesma conexão do NextAuth para consistência
const db = mysql.createPool({
  host: process.env.DB_FUNC_HOST || process.env.DB_HOST || "localhost",
  user: process.env.DB_FUNC_USER || process.env.DB_USER || "root",
  password: process.env.DB_FUNC_PASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.DB_FUNC_DATABASE || "quadro_funcionarios",
});

export async function GET(req: NextRequest) {
  try {
    console.log("=== API usuario-completo ===");
    
    // Debug: verificar variáveis de ambiente
    console.log("ENV check:", {
      hasDBFuncHost: !!process.env.DB_FUNC_HOST,
      hasDBFuncUser: !!process.env.DB_FUNC_USER,
      hasDBFuncPassword: !!process.env.DB_FUNC_PASSWORD,
      hasDBFuncDatabase: !!process.env.DB_FUNC_DATABASE,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
    });
    
    // Obter token JWT do NextAuth
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    console.log("Token:", token);

    if (!token?.email) {
      console.log("Não autenticado - token:", token);
      return NextResponse.json({ 
        success: false, 
        error: "Não autenticado", 
        debug: { hasToken: !!token, email: token?.email } 
      }, { status: 401 });
    }

    const email = token.email;
    console.log("Email do usuário:", email);

    // Buscar dados completos do colaborador com JOINs nas tabelas relacionadas
    console.log("Executando query SQL para email:", email);
    
    const [rows] = await db.execute(`
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
      LEFT JOIN regional r       ON c.regional_id = r.id
      LEFT JOIN departamentos d  ON c.departamento_id = d.id
      LEFT JOIN divisao dv       ON c.divisao_id = dv.id
      LEFT JOIN assessoria a     ON c.assessoria_id = a.id
      LEFT JOIN fazenda f        ON c.fazenda_id = f.id
      LEFT JOIN diretoria dir    ON c.diretoria_id = dir.id
      LEFT JOIN gabinete g       ON c.gabinete_id = g.id
      WHERE c.email = ?
        AND c.status = 1
    `, [email]) as [UsuarioCompleto[], unknown];

    console.log("Query executada. Rows:", rows);
    console.log("Número de registros:", rows?.length || 0);

    if (!rows || rows.length === 0) {
      console.log("Usuário não encontrado para email:", email);
      
      // Verificar se existe usuário com email diferente para debug
      const [allUsers] = await db.execute(
        "SELECT email FROM colaboradores WHERE status = 1"
      ) as [EmailUser[], unknown];
      console.log("Emails disponíveis (amostra):", allUsers.map((u: EmailUser) => u.email));
      
      return NextResponse.json({ 
        success: false, 
        error: "Usuário não encontrado",
        debug: { 
          searchedEmail: email,
          availableEmails: allUsers.map((u: EmailUser) => u.email)
        }
      }, { status: 404 });
    }

    const usuario = rows[0];
    console.log("Dados do usuário encontrado:", usuario);

    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        telefone: sanitizarTelefone(usuario.telefone),
        regional: {
          id: usuario.regional_id,
          nome: usuario.regional_nome
        },
        departamento: {
          id: usuario.departamento_id,
          nome: usuario.departamento_nome
        },
        divisao: {
          id: usuario.divisao_id,
          nome: usuario.divisao_nome
        },
        assessoria: {
          id: usuario.assessoria_id,
          nome: usuario.assessoria_nome
        },
        fazenda: {
          id: usuario.fazenda_id,
          nome: usuario.fazenda_nome
        },
        diretoria: {
          id: usuario.diretoria_id,
          nome: usuario.diretoria_nome
        },
        gabinete: {
          id: usuario.gabinete_id,
          nome: usuario.gabinete_nome
        }
      }
    });

  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar dados do usuário" }, { status: 500 });
  }
}
