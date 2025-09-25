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
    console.log('=== Iniciando busca de análises ===');

    // Primeiro verificar se a conexão funciona
    try {
      await saudeMentalDB.execute('SELECT 1 as test');
      console.log('✅ Conexão com banco OK');
    } catch (connError) {
      console.error('❌ Erro de conexão:', connError);
      throw connError;
    }

    // Buscar todas as análises ordenadas por data decrescente
    const [analises] = await saudeMentalDB.execute<AnaliseRow[]>(
      `SELECT id, resposta_id, estresse, ansiedade, burnout, depressao, equilibrio, apoio, 
              alerta, dicas, justificativa_ia, data_analise 
       FROM analises 
       ORDER BY data_analise DESC`
    );

    console.log(`✅ Encontradas ${analises.length} análises na tabela`);
    if (analises.length > 0) {
      console.log('📋 Primeira análise:', analises[0]);
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