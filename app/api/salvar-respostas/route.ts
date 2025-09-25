import { NextResponse } from "next/server";
import { getConexoes } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Dados recebidos:", data);
    const { pools } = await getConexoes();
    
    // 1. Primeiro salvar na tabela respostas
    console.log("=== SALVANDO RESPOSTA ===");
    console.log("Dados da resposta:", {
      email: data.email,
      estresse1: data.estresse1, estresse2: data.estresse2,
      ansiedade1: data.ansiedade1, ansiedade2: data.ansiedade2,
      burnout1: data.burnout1, burnout2: data.burnout2,
      depressao1: data.depressao1, depressao2: data.depressao2,
      equilibrio: data.equilibrio, apoio: data.apoio,
      desabafo: data.desabafo || ""
    });
    
    const [resultRespostas] = await pools.saude_mental.query(
      `INSERT INTO respostas (email, data_resposta, estresse1, estresse2, 
       ansiedade1, ansiedade2, burnout1, burnout2, depressao1, depressao2, 
       equilibrio, apoio, desabafo) 
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.email,
        data.estresse1, data.estresse2,
        data.ansiedade1, data.ansiedade2,
        data.burnout1, data.burnout2,
        data.depressao1, data.depressao2,
        data.equilibrio, data.apoio,
        data.desabafo || ""
      ]
    );
    
    const respostaId = (resultRespostas as { insertId: number }).insertId;
    console.log("✅ Resposta salva com ID:", respostaId);
    
    // 2. Calcular médias e porcentagens
    const medias = {
      estresse: (parseFloat(data.estresse1) + parseFloat(data.estresse2)) / 2,
      ansiedade: (parseFloat(data.ansiedade1) + parseFloat(data.ansiedade2)) / 2,
      burnout: (parseFloat(data.burnout1) + parseFloat(data.burnout2)) / 2,
      depressao: (parseFloat(data.depressao1) + parseFloat(data.depressao2)) / 2,
      equilibrio: parseFloat(data.equilibrio),
      apoio: parseFloat(data.apoio)
    };
    
    const porcentagens = {
      estresse: Math.round((medias.estresse / 5) * 100),
      ansiedade: Math.round((medias.ansiedade / 5) * 100),
      burnout: Math.round((medias.burnout / 5) * 100),
      depressao: Math.round((medias.depressao / 5) * 100),
      equilibrio: Math.round((medias.equilibrio / 5) * 100),
      apoio: Math.round((medias.apoio / 5) * 100)
    };
    
    // 3. Análise psicológica robusta e dinâmica
    const alerta = [];
    const dicas = [];
    const justificativa = [];
    
    // Análise combinada de múltiplos indicadores
    const indicadoresAltos = Object.entries(porcentagens).filter(([key, value]) => 
      key !== 'equilibrio' && key !== 'apoio' && value >= 70
    );
    
    // ESTRESSE - Análise graduada
    if (porcentagens.estresse >= 85) {
      alerta.push("Estresse em nível crítico - Risco de exaustão física e mental");
      dicas.push("URGENTE: Implemente pausas obrigatórias a cada hora, pratique respiração 4-7-8 (inspire 4s, segure 7s, expire 8s) 3x ao dia. Considere redução temporária da carga de trabalho");
      justificativa.push("Estresse acima de 85% indica sobrecarga do sistema nervoso simpático, podendo levar a sintomas físicos e comprometimento cognitivo");
    } else if (porcentagens.estresse >= 70) {
      alerta.push("Estresse elevado - Atenção para sinais de sobrecarga");
      dicas.push("Identifique os principais estressores e desenvolva estratégias de enfrentamento. Pratique atividades físicas regulares e técnicas de relaxamento muscular progressivo");
      justificativa.push("Níveis de estresse entre 70-84% indicam ativação excessiva do eixo hipotálamo-pituitária-adrenal, requerendo intervenções preventivas");
    } else if (porcentagens.estresse >= 40) {
      dicas.push("Mantenha rotinas de autocuidado e monitore os níveis de estresse. Considere atividades como caminhadas ou meditação");
      justificativa.push("Estresse moderado é normal, mas requer monitoramento para evitar escalada");
    }
    
    // ANSIEDADE - Análise especializada
    if (porcentagens.ansiedade >= 85) {
      alerta.push("Ansiedade severa - Interferência significativa no funcionamento");
      dicas.push("RECOMENDADO: Busque avaliação psicológica. Pratique grounding 5-4-3-2-1 (5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que prova). Evite cafeína e estabeleça rotina de sono regular");
      justificativa.push("Ansiedade acima de 85% pode indicar transtorno de ansiedade generalizada ou ansiedade situacional severa, comprometendo concentração e tomada de decisões");
    } else if (porcentagens.ansiedade >= 70) {
      alerta.push("Ansiedade moderada a alta - Monitoramento necessário");
      dicas.push("Pratique mindfulness diário (10-15min), identifique pensamentos catastróficos e questione sua veracidade. Use técnicas de respiração diafragmática");
      justificativa.push("Ansiedade persistente neste nível pode evoluir para sintomas mais severos se não tratada adequadamente");
    }
    
    // BURNOUT - Análise multidimensional  
    if (porcentagens.burnout >= 85) {
      alerta.push("Burnout severo - Esgotamento profissional crítico");
      dicas.push("ESSENCIAL: Reavalie imediatamente sua carga de trabalho. Converse com RH/gestoria sobre ajustes. Reconecte-se com o propósito do seu trabalho. Considere psicoterapia focada em burnout");
      justificativa.push("Burnout severo indica exaustão emocional, despersonalização e redução da realização pessoal, podendo levar a depressão e problemas de saúde física");
    } else if (porcentagens.burnout >= 70) {
      alerta.push("Sinais importantes de burnout - Intervenção preventiva necessária");
      dicas.push("Estabeleça limites claros de horário de trabalho, delegue tarefas quando possível, busque atividades que tragam prazer fora do trabalho. Pratique a técnica 'duas listas' para priorizar");
      justificativa.push("Burnout neste nível indica início do processo de esgotamento profissional, sendo crucial a intervenção antes da progressão");
    }
    
    // DEPRESSÃO - Análise clínica
    if (porcentagens.depressao >= 85) {
      alerta.push("Indicadores severos de depressão - Avaliação profissional urgente");
      dicas.push("IMPORTANTE: Procure ajuda psicológica/psiquiátrica imediatamente. Mantenha contato com pessoas queridas, estabeleça pequenas metas diárias, pratique ativação comportamental (pequenas atividades prazerosas)");
      justificativa.push("Sintomas depressivos severos podem indicar episódio depressivo maior, requerendo avaliação e possivelmente tratamento farmacológico além da psicoterapia");
    } else if (porcentagens.depressao >= 70) {
      alerta.push("Sintomas depressivos significativos - Acompanhamento recomendado");
      dicas.push("Busque apoio psicológico, mantenha rotina de exercícios leves, pratique gratidão diária (3 coisas boas do dia), evite isolamento social");
      justificativa.push("Sintomas depressivos persistentes podem evoluir para quadros mais graves e impactar significativamente a qualidade de vida");
    }
    
    // EQUILÍBRIO VIDA-TRABALHO
    if (porcentagens.equilibrio <= 30) {
      alerta.push("Desequilíbrio severo vida-trabalho - Risco de esgotamento total");
      dicas.push("CRÍTICO: Estabeleça horários fixos de trabalho, desligue notificações após o expediente, dedique tempo não-negociável para família/lazer. Use técnica Pomodoro no trabalho");
      justificativa.push("Desequilíbrio extremo predispõe ao desenvolvimento de múltiplos problemas de saúde mental e física, além de prejudicar relacionamentos");
    } else if (porcentagens.equilibrio <= 50) {
      alerta.push("Desequilíbrio vida-trabalho preocupante");
      dicas.push("Defina rituais de transição entre trabalho e vida pessoal, pratique o 'não' assertivo para demandas excessivas, agende atividades prazerosas como compromissos importantes");
      justificativa.push("Falta de equilíbrio contribui para o desenvolvimento de estresse crônico e burnout");
    }
    
    // APOIO SOCIAL NO TRABALHO
    if (porcentagens.apoio <= 30) {
      alerta.push("Isolamento severo no ambiente de trabalho - Fator de risco importante");
      dicas.push("Busque construir pelo menos uma relação de confiança no trabalho, participe de eventos da equipe quando possível, comunique suas necessidades de suporte ao gestor de forma assertiva");
      justificativa.push("Falta de suporte social no trabalho é preditor significativo de burnout, depressão e ansiedade ocupacional");
    } else if (porcentagens.apoio <= 50) {
      dicas.push("Fortaleça vínculos profissionais positivos, ofereça ajuda aos colegas (reciprocidade), busque mentores ou grupos de apoio profissional");
      justificativa.push("Suporte social adequado é fator protetor crucial para saúde mental no trabalho");
    }
    
    // Análise avançada do desabafo
    if (data.desabafo && data.desabafo.length > 10) {
      const desabafoLower = data.desabafo.toLowerCase();
      let sentimentoGeral = "neutro";
      
      // Palavras que indicam sofrimento psicológico
      const indicadoresCrise = ["suicid", "morrer", "não aguento", "desistir", "não consigo mais"];
      const indicadoresDepressao = ["tristeza", "vazio", "sem energia", "inútil", "culpa", "desesperança", "sozinho"];
      const indicadoresAnsiedade = ["nervoso", "preocupado", "medo", "pânico", "inquiet", "tensão"];
      const indicadoresBurnout = ["exausto", "esgotado", "sem motivação", "perdeu o sentido"];
      const indicadoresPositivos = ["melhor", "esperança", "conseguindo", "progresso", "grato"];
      
      if (indicadoresCrise.some(palavra => desabafoLower.includes(palavra))) {
        alerta.unshift("⚠️ ATENÇÃO: Desabafo indica possível crise - Busque ajuda profissional imediatamente");
        dicas.unshift("Se você está pensando em se machucar, procure ajuda imediatamente: CVV 188, Psicólogo ou vá ao hospital mais próximo");
        justificativa.push("Expressões de desesperança ou ideação suicida requerem intervenção imediata");
        sentimentoGeral = "crise";
      } else if (indicadoresDepressao.some(palavra => desabafoLower.includes(palavra))) {
        alerta.push("Desabafo revela sinais de sofrimento depressivo");
        dicas.push("Valide seus sentimentos - é normal passar por dificuldades. Busque apoio profissional e de pessoas próximas");
        justificativa.push("Linguagem emocional do desabafo sugere sintomas depressivos que merecem atenção clínica");
        sentimentoGeral = "depressivo";
      } else if (indicadoresAnsiedade.some(palavra => desabafoLower.includes(palavra))) {
        alerta.push("Desabafo demonstra sinais de ansiedade significativa");
        dicas.push("Pratique técnicas de ancoragem no presente, questione pensamentos ansiosos: 'Isso é um fato ou um medo?'");
        justificativa.push("Vocabulário ansioso indica ativação do sistema de alerta, sugerindo necessidade de estratégias de regulação emocional");
        sentimentoGeral = "ansioso";
      } else if (indicadoresBurnout.some(palavra => desabafoLower.includes(palavra))) {
        alerta.push("Desabafo reflete características de burnout/esgotamento");
        dicas.push("Reconecte-se com seus valores pessoais e profissionais. Considere o que ainda faz sentido no seu trabalho");
        justificativa.push("Relato de esgotamento e perda de sentido são características centrais do burnout");
        sentimentoGeral = "esgotado";
      } else if (indicadoresPositivos.some(palavra => desabafoLower.includes(palavra))) {
        dicas.push("É positivo perceber sinais de melhora em seu relato. Continue investindo no que tem funcionado bem");
        justificativa.push("Desabafo contém elementos de esperança e progresso, indicando recursos internos preservados");
        sentimentoGeral = "esperançoso";
      }
      
      // Análise de padrões combinados
      if (sentimentoGeral !== "crise" && indicadoresAltos.length >= 3) {
        alerta.push("Múltiplos indicadores elevados - Síndrome de esgotamento multidimensional");
        dicas.push("Sua situação requer atenção integral. Considere uma abordagem terapêutica que combine cuidado psicológico, reorganização do trabalho e fortalecimento de recursos pessoais");
        justificativa.push("Combinação de estresse, ansiedade e outros fatores indica necessidade de intervenção psicológica multifocal");
      }
    }
    
    // Recomendações preventivas gerais
    if (alerta.length === 0) {
      alerta.push("Indicadores de bem-estar dentro de parâmetros saudáveis");
      dicas.push("Continue cultivando seus recursos de enfrentamento: mantenha rotinas de autocuidado, conexões sociais saudáveis e práticas de regulação emocional. Monitore periodicamente seu bem-estar");
      justificativa.push("Perfil atual sugere boa capacidade de autorregulação e recursos adaptativos preservados");
    } else {
      // Adicionar sempre dica de recursos de apoio
      dicas.push("LEMBRE-SE: Cuidar da saúde mental é tão importante quanto cuidar da saúde física. Recursos disponíveis: CVV 188, psicólogos, psiquiatras, grupos de apoio");
    }
    
    // 4. Salvar análise na tabela analises
    console.log("Salvando análise:", {
      respostaId,
      porcentagens,
      alerta: alerta.join("; "),
      dicas: dicas.join("; "),
      justificativa: justificativa.join("; ")
    });
    
    try {
      console.log("=== TENTANDO SALVAR ANÁLISE ===");
      console.log("Dados para inserção:", {
        respostaId,
        estresse: porcentagens.estresse,
        ansiedade: porcentagens.ansiedade,
        burnout: porcentagens.burnout,
        depressao: porcentagens.depressao,
        equilibrio: porcentagens.equilibrio,
        apoio: porcentagens.apoio,
        alerta: alerta.join("; "),
        dicas: dicas.join("; "),
        justificativa: justificativa.join("; ")
      });
      
      const [insertResult] = await pools.saude_mental.query(
        `INSERT INTO analises (resposta_id, estresse, ansiedade, burnout, depressao, 
         equilibrio, apoio, alerta, dicas, justificativa_ia, data_analise) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          respostaId,
          porcentagens.estresse, porcentagens.ansiedade, porcentagens.burnout,
          porcentagens.depressao, porcentagens.equilibrio, porcentagens.apoio,
          alerta.join("; "), dicas.join("; "), justificativa.join("; ")
        ]
      );
      
      console.log("✅ Análise salva com sucesso! Insert ID:", (insertResult as any).insertId);
    } catch (dbError) {
      console.error("❌ ERRO CRÍTICO ao salvar análise:", dbError);
      console.error("Stack trace:", dbError);
      throw dbError;
    }
    
    // 5. Preparar respostas detalhadas para exibição
    const respostasDetalhadas = [
      { grupo: 'Estresse', perguntas: [
        { texto: 'Tenho me sentido sobrecarregado(a) pelas demandas de trabalho.', resposta: data.estresse1 },
        { texto: 'Tenho dificuldade para relaxar após o expediente.', resposta: data.estresse2 }
      ]},
      { grupo: 'Ansiedade', perguntas: [
        { texto: 'Tenho me sentido preocupado(a) excessivamente com meu desempenho.', resposta: data.ansiedade1 },
        { texto: 'Tenho dificuldade em me concentrar devido a pensamentos acelerados.', resposta: data.ansiedade2 }
      ]},
      { grupo: 'Burnout', perguntas: [
        { texto: 'Ao final do expediente, sinto-me esgotado(a).', resposta: data.burnout1 },
        { texto: 'Tenho perdido o entusiasmo pelo meu trabalho.', resposta: data.burnout2 }
      ]},
      { grupo: 'Depressão', perguntas: [
        { texto: 'Tenho perdido interesse em atividades que antes eram agradáveis.', resposta: data.depressao1 },
        { texto: 'Tenho sentido falta de energia ou motivação para iniciar o dia.', resposta: data.depressao2 }
      ]},
      { grupo: 'Equilíbrio / Apoio', perguntas: [
        { texto: 'Tenho conseguido manter equilíbrio entre vida pessoal e profissional.', resposta: data.equilibrio },
        { texto: 'Sinto que tenho apoio suficiente de colegas e gestores no trabalho.', resposta: data.apoio }
      ]},
      { grupo: 'Desabafo (opcional)', perguntas: [
        { texto: 'Gostaria de compartilhar algo sobre como estou me sentindo:', resposta: data.desabafo || 'Não informado' }
      ]}
    ];

    return NextResponse.json({
      success: true,
      analise: {
        estresse: porcentagens.estresse,
        ansiedade: porcentagens.ansiedade,
        burnout: porcentagens.burnout,
        depressao: porcentagens.depressao,
        equilibrio: porcentagens.equilibrio,
        apoio: porcentagens.apoio,
        alerta: alerta.join("; "),
        dicas: dicas.join("; "),
        justificativa_ia: justificativa.join("; ")
      },
      porcentagens,
      alerta: alerta.join("; "),
      dicas: dicas.join("; "),
      justificativa: justificativa.join("; "),
      respostasDetalhadas
    });
    
  } catch (error) {
    console.error("❌ ERRO CRÍTICO ao salvar respostas:", error);
    console.error("Stack completo:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Erro interno do servidor", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}