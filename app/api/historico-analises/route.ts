import { NextResponse } from 'next/server';
import { saudeMentalDB, funcionariosDB } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface AnaliseRow extends RowDataPacket {
  id: number;
  resposta_id: number;
  estresse: number;
  ansiedade: number;
  burnout: number;
  depressao: number;
  equilibrio: number;
  apoio: number;
  alerta: string;
  dicas: string;
  justificativa_ia: string;
  data_analise: string;
}

interface RespostaRow extends RowDataPacket {
  id: number;
  email: string;
  desabafo: string;
}

interface ColaboradorRow extends RowDataPacket {
  nome: string;
  cargo: string;
}

export async function GET() {
  try {
    console.log('=== DIAGNÓSTICO COMPLETO - HISTÓRICO ANÁLISES ===');
    console.log('🔧 Configurações do banco:');
    console.log('- Host:', process.env.DB_HOST);
    console.log('- User:', process.env.DB_USER);
    console.log('- Database:', process.env.DB_DATABASE);

    // Primeiro verificar se a conexão funciona
    try {
      await saudeMentalDB.execute('SELECT 1 as test');
      console.log('✅ Conexão com banco OK');
    } catch (connError) {
      console.error('❌ Erro de conexão:', connError);
      throw connError;
    }

    // Verificar se a tabela existe
    try {
      const [tables] = await saudeMentalDB.execute('SHOW TABLES LIKE "analises"');
      console.log('🏗️ Tabela analises existe:', (tables as RowDataPacket[]).length > 0);
    } catch (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
    }

    // Contar total de registros
    try {
      const [count] = await saudeMentalDB.execute('SELECT COUNT(*) as total FROM analises');
      console.log('📊 Total de análises na tabela:', (count as RowDataPacket[])[0].total);
    } catch (countError) {
      console.error('❌ Erro ao contar registros:', countError);
    }

    // Buscar todas as análises ordenadas por data decrescente
    const [analises] = await saudeMentalDB.execute<AnaliseRow[]>(
      `SELECT id, resposta_id, estresse, ansiedade, burnout, depressao, equilibrio, apoio, 
              alerta, dicas, justificativa_ia, data_analise 
       FROM analises 
       ORDER BY data_analise DESC`
    );

    console.log(`✅ Query executada - Encontradas ${analises.length} análises`);
    if (analises.length > 0) {
      console.log('📋 Primeira análise encontrada:', {
        id: analises[0].id,
        resposta_id: analises[0].resposta_id,
        data_analise: analises[0].data_analise
      });
    } else {
      console.log('⚠️ NENHUMA ANÁLISE ENCONTRADA - Verificando respostas...');
      try {
        const [respostas] = await saudeMentalDB.execute('SELECT COUNT(*) as total FROM respostas');
        console.log('📊 Total de respostas na tabela:', (respostas as RowDataPacket[])[0].total);
      } catch (err) {
        console.error('❌ Erro ao verificar respostas:', err);
      }
    }

    const analisesCompletas = [];

    // Para cada análise, buscar dados do colaborador
    for (const analise of analises) {
      try {
        // Buscar email e desabafo pela resposta_id
        const [respostas] = await saudeMentalDB.execute<RespostaRow[]>(
          'SELECT id, email, desabafo FROM respostas WHERE id = ?',
          [analise.resposta_id]
        );

        if (respostas.length === 0) {
          console.log(`Resposta não encontrada para ID: ${analise.resposta_id}`);
          continue;
        }

        const email = respostas[0].email;
        const desabafo = respostas[0].desabafo;
        console.log(`Email encontrado: ${email}`);

        // Buscar nome e cargo no banco quadro_funcionarios
        const [colaboradores] = await funcionariosDB.execute<ColaboradorRow[]>(
          'SELECT nome, cargo FROM colaboradores WHERE email = ?',
          [email]
        );

        if (colaboradores.length === 0) {
          console.log(`Colaborador não encontrado para email: ${email}`);
          // Adicionar com dados padrão se não encontrar o colaborador
          analisesCompletas.push({
            id: analise.id,
            resposta_id: analise.resposta_id,
            estresse: analise.estresse,
            ansiedade: analise.ansiedade,
            burnout: analise.burnout,
            depressao: analise.depressao,
            equilibrio: analise.equilibrio,
            apoio: analise.apoio,
            alerta: analise.alerta,
            dicas: analise.dicas,
            justificativa_ia: analise.justificativa_ia,
            data_analise: analise.data_analise,
            nome: 'Usuário não identificado',
            cargo: 'N/A',
            email: email,
            desabafo: desabafo
          });
          continue;
        }

        const colaborador = colaboradores[0];

        // Adicionar análise completa
        analisesCompletas.push({
          id: analise.id,
          resposta_id: analise.resposta_id,
          estresse: analise.estresse,
          ansiedade: analise.ansiedade,
          burnout: analise.burnout,
          depressao: analise.depressao,
          equilibrio: analise.equilibrio,
          apoio: analise.apoio,
          alerta: analise.alerta,
          dicas: analise.dicas,
          justificativa_ia: analise.justificativa_ia,
          data_analise: analise.data_analise,
          nome: colaborador.nome,
          cargo: colaborador.cargo,
          email: email,
          desabafo: desabafo
        });

        console.log(`Análise completa adicionada para: ${colaborador.nome}`);

      } catch (error) {
        console.error(`Erro ao processar análise ${analise.id}:`, error);
        continue;
      }
    }

    console.log(`=== Concluído: ${analisesCompletas.length} análises processadas ===`);

    return NextResponse.json({
      success: true,
      analises: analisesCompletas,
      total: analisesCompletas.length
    });

  } catch (error) {
    console.error('Erro na API de histórico:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor ao buscar histórico',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}