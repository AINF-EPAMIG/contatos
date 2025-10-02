import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
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
        fullToken: token
      }
    });

  } catch (error) {
    console.error("Erro no test-auth:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    }, { status: 500 });
  }
}