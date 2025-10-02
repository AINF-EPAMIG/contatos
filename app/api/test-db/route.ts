import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Configuração do banco igual à API usuario-completo
const db = mysql.createPool({
  host: process.env.DB_FUNC_HOST || process.env.DB_HOST || "localhost",
  user: process.env.DB_FUNC_USER || process.env.DB_USER || "root",
  password: process.env.DB_FUNC_PASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.DB_FUNC_DATABASE || "quadro_funcionarios",
  connectionLimit: 10,
});

interface CountResult {
  total: number;
}

interface EmailResult {
  email: string;
}

// Forçar rota como dinâmica
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Apenas executar em ambiente de desenvolvimento ou quando explicitamente solicitado
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_TEST_ROUTES) {
      return NextResponse.json({
        success: false,
        error: "Test routes are disabled in production"
      }, { status: 403 });
    }

    console.log("=== Test DB Connection ===");
    
    // Testar conexão
    console.log("Testando conexão com banco...");
    const [rows] = await db.execute("SELECT COUNT(*) as total FROM colaboradores WHERE status = 1") as [CountResult[], unknown];
    
    console.log("Total de colaboradores ativos:", rows[0]?.total);
    
    // Buscar alguns emails para teste
    const [emailRows] = await db.execute(
      "SELECT email FROM colaboradores WHERE status = 1 LIMIT 5"
    ) as [EmailResult[], unknown];
    
    console.log("Emails disponíveis:", emailRows.map((r: EmailResult) => r.email));
    
    return NextResponse.json({
      success: true,
      data: {
        totalColaboradores: rows[0]?.total,
        emailsDisponiveis: emailRows.map((r: EmailResult) => r.email),
        configBanco: {
          host: process.env.DB_FUNC_HOST || process.env.DB_HOST || "localhost",
          database: process.env.DB_FUNC_DATABASE || "quadro_funcionarios",
          user: process.env.DB_FUNC_USER || process.env.DB_USER || "root"
        }
      }
    });

  } catch (error) {
    console.error("Erro no test-db:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido",
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
}