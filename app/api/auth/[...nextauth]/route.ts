
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import mysql from "mysql2/promise";

const db = mysql.createPool({
	host: process.env.DB_FUNC_HOST,
	user: process.env.DB_FUNC_USER,
	password: process.env.DB_FUNC_PASSWORD,
	database: process.env.DB_FUNC_DATABASE,
});

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
						throw new Error("Usuário não autorizado");
					}
				} catch (err) {
					console.error("Erro ao buscar dados do Google:", err);
					return {};
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				(session.user as any).chapa = typeof token.chapa === 'string' ? token.chapa : undefined;
				(session.user as any).cpf = typeof token.cpf === 'string' ? token.cpf : undefined;
				(session.user as any).cargo = typeof token.cargo === 'string' ? token.cargo : undefined;
				(session.user as any).tipo = typeof token.tipo === 'string' ? token.tipo : undefined;
			}
			return session;
		},
		async redirect({ url, baseUrl }) {
			if (
				(url === "/login" || url === `${baseUrl}/login` || url === `${baseUrl}/api/auth/signin`)
				&& baseUrl
			) {
				return `${baseUrl}/painel?welcome=1`;
			}
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