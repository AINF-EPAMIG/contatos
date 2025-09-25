const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testando conexão com banco de dados...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'saude_mental'
    });
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar se tabela analises existe
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('📋 Tabelas disponíveis:', tables);
    
    // Verificar estrutura da tabela analises
    try {
      const [structure] = await connection.execute("DESCRIBE analises");
      console.log('🏗️ Estrutura da tabela analises:', structure);
    } catch (err) {
      console.log('❌ Tabela analises não encontrada:', err.message);
    }
    
    // Verificar quantos registros existem
    try {
      const [count] = await connection.execute("SELECT COUNT(*) as total FROM analises");
      console.log('📊 Total de análises na tabela:', count[0].total);
    } catch (err) {
      console.log('❌ Erro ao contar registros:', err.message);
    }
    
    // Verificar últimos registros
    try {
      const [recent] = await connection.execute("SELECT * FROM analises ORDER BY data_analise DESC LIMIT 3");
      console.log('🕒 Últimas análises:', recent);
    } catch (err) {
      console.log('❌ Erro ao buscar registros recentes:', err.message);
    }
    
    await connection.end();
    console.log('🔚 Conexão encerrada');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  }
}

testConnection();