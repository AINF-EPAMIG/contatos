import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "ChapaCPF",
      credentials: {
        chapa: { label: "Chapa", type: "text" },
        cpf: { label: "CPF", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.chapa || !credentials?.cpf) return null;
        try {
          const [rows] = await db.execute(
            "SELECT * FROM colaboradores WHERE chapa = ? AND cpf = ? LIMIT 1",
            [credentials.chapa, credentials.cpf]
          ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
          
          const user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
          if (!user) return null;
          
          return {
            id: user.id,
            name: user.nome,
            email: user.email,
            chapa: user.chapa,
            cpf: user.cpf,
            cargo: user.cargo,
            tipo: user.tipo,
          };
        } catch (err) {
          console.error("Erro na autenticação:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.chapa = (user as any).chapa;
        token.cpf = (user as any).cpf;
        token.cargo = (user as any).cargo;
        token.tipo = (user as any).tipo;
      }
      
      if (account?.provider === "google" && token.email) {
        try {
          const [rows] = await db.execute(
            "SELECT * FROM colaboradores WHERE email = ? LIMIT 1",
            [token.email]
          ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
          
          const userDb = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
          if (userDb) {
            token.chapa = userDb.chapa;
            token.cpf = userDb.cpf;
            token.cargo = userDb.cargo;
            token.tipo = userDb.tipo;
          }
        } catch (err) {
          console.error("Erro ao buscar dados do Google:", err);
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).chapa = token.chapa;
        (session.user as any).cpf = token.cpf;
        (session.user as any).cargo = token.cargo;
        (session.user as any).tipo = token.tipo;
      }
      return session;
    },

   async redirect({ url, baseUrl }) {
  // Se está indo para /login ou para /api/auth/signin e já está autenticado, manda para o painel
  if (
    (url === "/login" || url === `${baseUrl}/login` || url === `${baseUrl}/api/auth/signin`)
    && baseUrl
  ) {
    return `${baseUrl}/painel`;
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
