import { NextResponse } from 'next/server';
import { saudeMentalDB } from '@/lib/db';

export async function GET() {
  try {
    console.log('🧪 === TESTE SIMPLIFICADO DE BUSCA ===');
    
    // 1. Testar conexão básica
    const [testConn] = await saudeMentalDB.execute('SELECT 1 as test');
    console.log('✅ Conexão OK');
    
    // 2. Contar análises
    const [countResult] = await saudeMentalDB.execute('SELECT COUNT(*) as total FROM analises');
    const total = (countResult as any)[0].total;
    console.log('📊 Total de análises na tabela:', total);
    
    // 3. Buscar apenas IDs e data_analise para teste
    const [simpleAnalises] = await saudeMentalDB.execute(
      'SELECT id, resposta_id, data_analise FROM analises ORDER BY data_analise DESC LIMIT 5'
    );
    console.log('📋 Primeiras 5 análises (simples):', simpleAnalises);
    
    // 4. Testar busca completa
    const [fullAnalises] = await saudeMentalDB.execute(`
      SELECT id, resposta_id, estresse, ansiedade, burnout, depressao, equilibrio, apoio, 
             alerta, dicas, justificativa_ia, data_analise 
      FROM analises 
      ORDER BY data_analise DESC LIMIT 3
    `);
    console.log('📋 Análises completas:', fullAnalises);
    
    return NextResponse.json({
      success: true,
      message: 'Teste de busca concluído',
      totalAnalises: total,
      sampleAnalises: fullAnalises
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}