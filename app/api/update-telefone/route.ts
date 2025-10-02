import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { funcionariosDB } from "@/lib/db";

// Força renderização dinâmica para evitar erro de static rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { telefone } = await req.json();
    
    if (!telefone) {
      return NextResponse.json({ 
        success: false, 
        message: "Telefone é obrigatório" 
      }, { status: 400 });
    }

    // Remover máscara do telefone
    const telefoneLimpo = telefone.replace(/\D/g, "");
    
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      return NextResponse.json({ 
        success: false, 
        message: "Telefone inválido. Use formato (XX) XXXX-XXXX ou (XX) XXXXX-XXXX" 
      }, { status: 400 });
    }

interface SessionWithEmail {
      email: string;
    }

    interface UpdateResult {
      affectedRows: number;
    }

    const email = (session as SessionWithEmail).email;
    
    // Atualizar telefone no banco
    const [result] = await funcionariosDB.query(
      `UPDATE colaboradores 
       SET telefone = ? 
       WHERE email = ? AND status != 0`,
      [telefone, email]
    ) as [UpdateResult, unknown];

    if (!result || result.affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Usuário não encontrado" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Telefone atualizado com sucesso",
      telefone: telefone
    });

  } catch (error) {
    console.error("Erro ao atualizar telefone:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Erro ao atualizar telefone" 
    }, { status: 500 });
  }
}
