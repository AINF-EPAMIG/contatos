// Função utilitária para múltiplas conexões (mock simples)
export async function getConexoes() {
  return {
    pools: {
      saude_mental: saudeMentalDB,
      quadro_funcionarios: funcionariosDB,
    },
  };
}
import mysql from "mysql2/promise";

// Conexão com banco central de funcionários
export const funcionariosDB = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "quadro_funcionarios",
});

// Conexão com banco de saúde mental
export const saudeMentalDB = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "saude_mental",
});
