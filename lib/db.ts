import mysql from "mysql2/promise";

const pools: Record<string, any> = {};

const bancos = [
  { nome: "sgi", descricao: "SGI WEB" },
  { nome: "plataforma", descricao: "Plataforma de Pesquisa 2.0" },
];

export async function getConexoes() {
  if (Object.keys(pools).length > 0) {
    return montarRetorno();
  }

  for (const banco of bancos) {
    try {
      const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: banco.nome,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      const [rows] = await pool.query("SHOW TABLES LIKE 'usuario'");
      if ((rows as any[]).length > 0) {
        pools[banco.nome] = pool;
      } else {
        console.warn(`Banco '${banco.nome}' ignorado: tabela 'usuario' não existe.`);
      }
    } catch (err) {
      console.error(`Erro ao conectar ao banco '${banco.nome}':`, err);
    }
  }

  return montarRetorno();
}

function montarRetorno() {
  const sistemasDisponiveis = Object.keys(pools).map((db) => {
    const bancoInfo = bancos.find((b) => b.nome === db);
    return {
      nome: bancoInfo ? bancoInfo.descricao : `Sistema (${db})`,
      database: db,
      permissao: 'Usuário Padrão',
    };
  });

  return { pools, sistemasDisponiveis };
}
