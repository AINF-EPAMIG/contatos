import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import mysql from "mysql2/promise";
import { saudeMentalDB } from "@/lib/db";

// Banco de autenticação: quadro_funcionarios
const db = mysql.createPool({
  host: process.env.DB_FUNC_HOST,
  user: process.env.DB_FUNC_USER,
  password: process.env.DB_FUNC_PASSWORD,
  database: process.env.DB_FUNC_DATABASE,
});

type UserJwtPayload = {
  chapa?: string;
  cpf?: string;
  cargo?: string;
  tipo?: string;
  [key: string]: unknown;
};

function getUserField(user: unknown, field: string): string | undefined {
  if (user && typeof user === "object" && field in user) {
    return (user as Record<string, unknown>)[field] as string | undefined;
  }
  return undefined;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.chapa = getUserField(user, "chapa");
        token.cpf = getUserField(user, "cpf");
        token.cargo = getUserField(user, "cargo");
        token.tipo = getUserField(user, "tipo");
      }
      
      if (account?.provider === "google" && token.email) {
        try {
          // Verifica se existe colaborador ativo
          const [rows] = await db.execute(
            "SELECT * FROM colaboradores WHERE email = ? AND status_colaborador = 1 LIMIT 1",
            [token.email]
          ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
          const userDb = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
          if (userDb) {
            token.chapa = userDb.chapa;
            token.cpf = userDb.cpf;
            token.cargo = userDb.cargo;
            token.tipo = userDb.tipo;
            // Verifica perfil especial na tabela usuario do banco saude_mental
            try {
              const [usuarios] = await saudeMentalDB.execute(
                "SELECT * FROM usuario WHERE email = ? LIMIT 1",
                [token.email]
              ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
              const usuario = Array.isArray(usuarios) && usuarios.length > 0 ? usuarios[0] : null;
              if (usuario) {
                token.tipo = usuario.tipo || null;
              }
            } catch (err) {
              console.error("Erro ao buscar perfil especial:", err);
              token.perfilEspecial = null;
            }
          } else {
            // Se não encontrar usuário válido, não autentica
            throw new Error("Usuário não autorizado");
          }
        } catch (err) {
          console.error("Erro ao buscar dados do Google:", err);
          // Invalida o token se não autorizado
          return {};
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as UserJwtPayload).chapa = typeof token.chapa === 'string' ? token.chapa : undefined;
        (session.user as UserJwtPayload).cpf = typeof token.cpf === 'string' ? token.cpf : undefined;
        (session.user as UserJwtPayload).cargo = typeof token.cargo === 'string' ? token.cargo : undefined;
        (session.user as UserJwtPayload).tipo = typeof token.tipo === 'string' ? token.tipo : undefined;
        (session.user as UserJwtPayload).perfilEspecial = token.perfilEspecial ?? undefined;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Se está indo para /login ou para /api/auth/signin e já está autenticado, manda para o painel
      if (
        (url === "/login" || url === `${baseUrl}/login` || url === `${baseUrl}/api/auth/signin`)
        && baseUrl
      ) {
        return `${baseUrl}/painel?welcome=1`;
      }
      // Se é uma rota interna (inclusive /painel, /, etc)
      if (url.startsWith(baseUrl) || url.startsWith("/")) {
        return url;
      }
      return baseUrl;
    }

  },

  pages: {
    signIn: "/login",
  },
  
  session: {
    strategy: "jwt",
  },
  
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
