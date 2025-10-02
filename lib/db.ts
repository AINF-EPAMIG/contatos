import mysql from "mysql2/promise";

// Conexão com banco central de funcionários
export const funcionariosDB = mysql.createPool({
  host: process.env.DB_FUNC_HOST,
  user: process.env.DB_FUNC_USER,
  password: process.env.DB_FUNC_PASSWORD,
  database: process.env.DB_FUNC_DATABASE || "quadro_funcionarios",
  connectionLimit: 10,
});

// Função utilitária para múltiplas conexões
export async function getConexoes() {
  return {
    pools: {
      quadro_funcionarios: funcionariosDB,
    },
  };
}


