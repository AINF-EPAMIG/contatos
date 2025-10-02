import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Força renderização dinâmica para evitar erro de static rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Apenas executar em ambiente de desenvolvimento ou quando explicitamente solicitado
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_TEST_ROUTES) {
      return NextResponse.json({
        success: false,
        error: "Test routes are disabled in production"
      }, { status: 403 });
    }

    console.log("=== Test Auth API ===");
    
    // Verificar cookies
    console.log("Cookies:", req.cookies.getAll());
    
    // Obter token JWT
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    console.log("Token completo:", token);
    
    return NextResponse.json({
      success: true,
      data: {
        hasToken: !!token,
        email: token?.email,
        name: token?.name,
        tokenKeys: token ? Object.keys(token) : [],
        fullToken: process.env.NODE_ENV === 'development' ? token : undefined
      }
    });

  } catch (error) {
    console.error("Erro no test-auth:", error);
    return NextResponse.json({ 
      success: false, 
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : "Erro desconhecido") : "Internal server error"
    }, { status: 500 });
  }
}