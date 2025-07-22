import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Cria pool fora do handler para performance
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get("cpf");
  const email = searchParams.get("email");
  
  if (!cpf && !email) {
    return NextResponse.json({ error: "CPF ou email obrigatório" }, { status: 400 });
  }

  try {
    let sql: string;
    let params: string[];
    
    if (cpf) {
      sql = "SELECT * FROM cartao_digital WHERE cpf = ? LIMIT 1";
      params = [cpf];
    } else {
      sql = "SELECT * FROM cartao_digital WHERE email = ? LIMIT 1";
      params = [email!];
    }
    
    const [rows] = await db.execute(sql, params) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
    
    if (!rows.length) {
      return NextResponse.json({ cartao: null });
    }
    
    return NextResponse.json({ cartao: rows[0] });
  } catch (error) {
    console.error("Erro na consulta:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, "PUT");
}

async function handleRequest(request: NextRequest, method: "POST" | "PUT") {
  try {
    const formData = await request.formData();
    
    const cpf = formData.get("cpf") as string;
    const nome = formData.get("nome") as string;
    const email = formData.get("email") as string;
    const cargo = formData.get("cargo") as string;
    const linkedin = formData.get("linkedin") as string;
    const whatsapp = formData.get("whatsapp") as string;
    const instagram = formData.get("instagram") as string;
    const lattes = formData.get("lattes") as string;
    const fotoFile = formData.get("foto") as File | null;

    let foto: string | null = null;
    
    // Processa upload da foto se existir
    if (fotoFile && fotoFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      // Cria diretório se não existir
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch {
        // Diretório já existe, continua
      }
      
      const bytes = await fotoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileName = `${Date.now()}-${fotoFile.name}`;
      const filePath = path.join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);
      foto = fileName;
    }

    if (method === "POST") {
      await db.execute(
        "INSERT INTO cartao_digital (cpf, nome, email, cargo, foto, linkedin, whatsapp, instagram, lattes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          cpf,
          nome,
          email,
          cargo,
          foto,
          linkedin || null,
          whatsapp || null,
          instagram || null,
          lattes || null,
        ]
      );
    } else if (method === "PUT") {
      // Atualiza dados
      let sql = "UPDATE cartao_digital SET nome=?, email=?, cargo=?, linkedin=?, whatsapp=?, instagram=?, lattes=?";
      const params: (string | null)[] = [
        nome,
        email,
        cargo,
        linkedin || null,
        whatsapp || null,
        instagram || null,
        lattes || null,
      ];
      if (foto) {
        sql += ", foto=?";
        params.push(foto);
      }
      sql += " WHERE cpf=?";
      params.push(cpf);

      await db.execute(sql, params);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao processar formulário:", error);
    return NextResponse.json(
      { error: "Erro ao salvar dados", details: String(error) },
      { status: 500 }
    );
  }
}