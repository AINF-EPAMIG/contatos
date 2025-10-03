import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import mysql from "mysql2/promise";

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

// Em desenvolvimento, logar NEXTAUTH_URL e redirect esperado para ajudar debug
if (process.env.NODE_ENV === 'development') {
  try {
    const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'http://localhost:3000';
    const redirectExample = `${base.replace(/\/$/, '')}/api/auth/callback/google`;
    console.log('DEBUG NextAuth - NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('DEBUG NextAuth - exemplo de redirect_uri esperado:', redirectExample);
  } catch (e) {
    // ignore
  }
}

const handler = NextAuth({
  // Ativa logs detalhados em desenvolvimento para diagnosticar problemas de callback/redirect
  debug: process.env.NODE_ENV === 'development',
  // Em dev, mostrar qual NEXTAUTH_URL está sendo usado para construir redirect_uris
  ...(process.env.NODE_ENV === 'development' ? { events: { signIn: async (message) => { console.log('NextAuth signIn event:', message); } } } : {}),
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
            "SELECT * FROM colaboradores WHERE email = ? AND status = 1 LIMIT 1",
            [token.email]
          ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
          const userDb = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
          if (userDb) {
            token.chapa = userDb.chapa;
            token.cpf = userDb.cpf;
            token.cargo = userDb.cargo;
            token.tipo = userDb.tipo;
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
