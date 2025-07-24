import { NextRequest, NextResponse } from "next/server";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import FormDataNode from "form-data";

// Função para sanitizar o nome do arquivo
function sanitizeFilename(filename: string): string {
  let sanitized = filename.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  sanitized = sanitized.replace(/\s+/g, "_");
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!sanitized.includes(".")) sanitized += ".jpg";
  return sanitized;
}

// Configuração do MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
});

// Tipagem dos campos do cartão
type CartaoDigital = {
  id?: number;
  cpf: string;
  nome: string;
  email: string;
  cargo: string;
  foto?: string | null;
  linkedin?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  lattes?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    // _method não é mais utilizado, só serve para backend diferenciar PUT/POST se quiser
    // const method = formData.get("_method") === "PUT" ? "PUT" : "POST";
    return await handleCartao(formData);
  } catch (error) {
    console.error("❌ Erro no POST EXTERNO:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get("cpf");
  const email = searchParams.get("email");

  if (!cpf && !email) {
    return NextResponse.json(
      { error: "CPF ou email obrigatório" },
      { status: 400 }
    );
  }

  try {
    const query = cpf
      ? "SELECT * FROM cartao_digital WHERE cpf = ? LIMIT 1"
      : "SELECT * FROM cartao_digital WHERE email = ? LIMIT 1";

    const [rows] = await db.execute<RowDataPacket[]>(query, [cpf || email]);
    return NextResponse.json({ cartao: rows[0] || null });
  } catch (error) {
    console.error("❌ Erro no GET:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor", detail: String(error) },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCartao(formData: FormData) {
  const campos: Array<keyof CartaoDigital> = [
    "cpf", "nome", "email", "cargo", "linkedin",
    "whatsapp", "instagram", "lattes"
  ];
  const values: Record<string, string> = {};
  for (const campo of campos) {
    const val = formData.get(campo);
    values[campo] = typeof val === "string" ? val : "";
  }

  if (!values.cpf || !values.nome || !values.email || !values.cargo) {
    return NextResponse.json(
      { error: "Campos obrigatórios ausentes" },
      { status: 400 }
    );
  }

  // --- Upload da foto para Yii2 ---
  let fotoNome: string | null = null;
  const fotoField = formData.get("foto") as File | null;

  if (
    fotoField &&
    typeof fotoField === "object" &&
    "arrayBuffer" in fotoField &&
    "name" in fotoField &&
    typeof fotoField.name === "string" &&
    fotoField.size > 0
  ) {
    const ext = fotoField.name.split(".").pop()?.toLowerCase() || "";
    if (!["jpg", "jpeg", "png"].includes(ext)) {
      return NextResponse.json(
        { error: "Apenas arquivos JPG ou PNG são permitidos" },
        { status: 400 }
      );
    }
    try {
      const safeName = sanitizeFilename(fotoField.name);

      const buffer = Buffer.from(await fotoField.arrayBuffer());
      // Usando o form-data do node para multipart
      const formFoto = new FormDataNode();
      formFoto.append("foto", buffer, {
        filename: safeName,
        contentType: fotoField.type || "application/octet-stream",
      });

      const urlUpload =
        process.env.YII2_UPLOAD_URL ||
        "https://epamigsistema.com/quadro_funcionarios/web/servidor/upload-foto";

      const uploadResponse = await fetch(urlUpload, {
        method: "POST",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: formFoto as any, // FormData do node, ok for edge/serverless
        headers: formFoto.getHeaders(),
      });

      const raw = await uploadResponse.text();
      let json: { success?: boolean; url?: string; file?: string; message?: string };
      try {
        json = JSON.parse(raw);
      } catch {
        throw new Error(`Resposta do PHP não é JSON: ${raw}`);
      }

      if (json.success && (json.url || json.file)) {
        fotoNome = json.file ?? (json.url?.split("/fotos/")[1] || null);
      } else {
        return NextResponse.json(
          { error: "Erro ao enviar imagem", detail: json.message },
          { status: 500 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: "Erro no upload", detail: String(e) },
        { status: 500 }
      );
    }
  }

  // --- Salvar no MySQL ---
  try {
    let updateSql = `UPDATE cartao_digital SET nome = ?, email = ?, cargo = ?, linkedin = ?, whatsapp = ?, instagram = ?, lattes = ?`;
    const updateParams = [
      values.nome,
      values.email,
      values.cargo,
      values.linkedin || null,
      values.whatsapp || null,
      values.instagram || null,
      values.lattes || null,
    ];
    if (fotoNome) {
      updateSql += `, foto = ?`;
      updateParams.push(fotoNome);
    }
    updateSql += ` WHERE cpf = ?`;
    updateParams.push(values.cpf);

    const [updateResult] = await db.execute<ResultSetHeader>(updateSql, updateParams);

    if (updateResult.affectedRows === 0) {
      await db.execute<ResultSetHeader>(
        "INSERT INTO cartao_digital (cpf, nome, email, cargo, foto, linkedin, whatsapp, instagram, lattes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          values.cpf,
          values.nome,
          values.email,
          values.cargo,
          fotoNome,
          values.linkedin || null,
          values.whatsapp || null,
          values.instagram || null,
          values.lattes || null,
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao salvar dados", detail: String(error) },
      { status: 500 }
    );
  }
}
