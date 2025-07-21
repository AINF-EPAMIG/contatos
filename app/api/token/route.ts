import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET = process.env.SECRET_KEY!;

export async function POST(request: NextRequest) {
  const { email, sistema } = await request.json();

  if (!email || !sistema?.url) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const timestamp = Date.now();
  const hash = crypto.createHmac("sha256", SECRET).update(email + timestamp).digest("hex");

  const token = Buffer.from(
    JSON.stringify({ email, tipo: sistema.permissao, ts: timestamp, hash })
  ).toString("base64");
  
  const finalUrl = `${sistema.url}site/login-token?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ url: finalUrl });
}
