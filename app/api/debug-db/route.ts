import { NextResponse } from "next/server";
import { saudeMentalDB } from "@/lib/db";

export async function GET() {
  try {
    console.log('🧪 === TESTE DE DIAGNÓSTICO DO BANCO ===');
    
    // 1. Testar conexão básica
    const [testConn] = await saudeMentalDB.execute('SELECT 1 as test');
    console.log('✅ Conexão com banco funcionando');
    
    // 2. Listar tabelas disponíveis
    const [tables] = await saudeMentalDB.execute('SHOW TABLES');
    console.log('📋 Tabelas disponíveis:', tables);
    
    // 3. Verificar estrutura da tabela respostas
    try {
      const [respostasStructure] = await saudeMentalDB.execute('DESCRIBE respostas');
      console.log('🏗️ Estrutura tabela respostas:', respostasStructure);
    } catch (err) {
      console.log('❌ Tabela respostas não encontrada');
    }
    
    // 4. Verificar estrutura da tabela analises
    try {
      const [analisesStructure] = await saudeMentalDB.execute('DESCRIBE analises');
      console.log('🏗️ Estrutura tabela analises:', analisesStructure);
    } catch (err) {
      console.log('❌ Tabela analises não encontrada');
    }
    
    // 5. Contar registros
    try {
      const [countRespostas] = await saudeMentalDB.execute('SELECT COUNT(*) as total FROM respostas');
      const [countAnalises] = await saudeMentalDB.execute('SELECT COUNT(*) as total FROM analises');
      console.log('📊 Total respostas:', countRespostas[0].total);
      console.log('📊 Total análises:', countAnalises[0].total);
    } catch (err) {
      console.log('❌ Erro ao contar registros:', err.message);
    }
    
    // 6. Mostrar últimas análises se existirem
    try {
      const [ultimasAnalises] = await saudeMentalDB.execute(
        'SELECT * FROM analises ORDER BY data_analise DESC LIMIT 3'
      );
      console.log('🕐 Últimas análises:', ultimasAnalises);
    } catch (err) {
      console.log('❌ Erro ao buscar últimas análises:', err.message);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Diagnóstico concluído - verifique os logs do servidor'
    });
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}