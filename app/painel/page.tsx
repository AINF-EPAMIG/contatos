"use client";
import dynamic from "next/dynamic";
const MenuPrincipal = dynamic(() => import("@/components/MenuPrincipal"), { ssr: false });

import HeaderPainel from "@/components/HeaderPainel";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function PainelPage() {
  const { data: session } = useSession();
  const nome = session?.user?.name || session?.user?.email || "Usuário";
  const email = session?.user?.email;
  const [respondeuHoje, setRespondeuHoje] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);
  const grupos = [
    {
      grupo: 'Estresse',
      perguntas: [
        { name: 'estresse1', texto: 'Tenho me sentido sobrecarregado(a) pelas demandas de trabalho.' },
        { name: 'estresse2', texto: 'Tenho dificuldade para relaxar após o expediente.' },
      ]
    },
    {
      grupo: 'Ansiedade',
      perguntas: [
        { name: 'ansiedade1', texto: 'Tenho me sentido preocupado(a) excessivamente com meu desempenho.' },
        { name: 'ansiedade2', texto: 'Tenho dificuldade em me concentrar devido a pensamentos acelerados.' },
      ]
    },
    {
      grupo: 'Burnout',
      perguntas: [
        { name: 'burnout1', texto: 'Ao final do expediente, sinto-me esgotado(a).' },
        { name: 'burnout2', texto: 'Tenho perdido o entusiasmo pelo meu trabalho.' },
      ]
    },
    {
      grupo: 'Depressão',
      perguntas: [
        { name: 'depressao1', texto: 'Tenho perdido interesse em atividades que antes eram agradáveis.' },
        { name: 'depressao2', texto: 'Tenho sentido falta de energia ou motivação para iniciar o dia.' },
      ]
    },
    {
      grupo: 'Equilíbrio / Apoio',
      perguntas: [
        { name: 'equilibrio', texto: 'Tenho conseguido manter equilíbrio entre vida pessoal e profissional.' },
        { name: 'apoio', texto: 'Sinto que tenho apoio suficiente de colegas e gestores no trabalho.' },
      ]
    },
    {
      grupo: 'Desabafo (opcional)',
      perguntas: [
        { name: 'desabafo', texto: 'Gostaria de compartilhar algo sobre como estou me sentindo:' },
      ]
    },
  ];
  const [abaAtiva, setAbaAtiva] = useState(0);
  type FormDataType = {
    desabafo: string;
    [key: string]: string;
  };
  const [formData, setFormData] = useState<FormDataType>({ desabafo: "" });
  const [resultado, setResultado] = useState<{
    analise: {
      estresse: number;
      ansiedade: number;
      burnout: number;
      depressao: number;
      equilibrio: number;
      apoio: number;
      alerta: string;
      dicas: string;
      justificativa_ia: string;
    };
    porcentagens: { [key: string]: number };
    respostasDetalhadas?: Array<{
      grupo: string;
      perguntas: Array<{
        texto: string;
        resposta: string;
      }>;
    }>;
    alerta: string;
    dicas: string;
    justificativa: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const dadosParaEnvio = {
        email,
        estresse1: formData.estresse1 || "0",
        estresse2: formData.estresse2 || "0", 
        ansiedade1: formData.ansiedade1 || "0",
        ansiedade2: formData.ansiedade2 || "0",
        burnout1: formData.burnout1 || "0",
        burnout2: formData.burnout2 || "0",
        depressao1: formData.depressao1 || "0",
        depressao2: formData.depressao2 || "0",
        equilibrio: formData.equilibrio || "0",
        apoio: formData.apoio || "0",
        desabafo: formData.desabafo || ""
      };

      console.log("Dados para envio:", dadosParaEnvio);

      const response = await fetch('/api/salvar-respostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaEnvio)
      });

      const result = await response.json();
      console.log("Resultado do servidor:", result);
      
      if (result.success) {
        console.log('✅ Resposta salva com sucesso!');
        console.log('📊 Porcentagens:', result.porcentagens);
        console.log('📋 Respostas detalhadas:', result.respostasDetalhadas);
        console.log('🚨 Alertas:', result.alerta);
        console.log('💡 Dicas:', result.dicas);
        
        setResultado({
          analise: result.analise,
          porcentagens: result.porcentagens,
          respostasDetalhadas: result.respostasDetalhadas,
          alerta: result.alerta,
          dicas: result.dicas,
          justificativa: result.justificativa
        });
        setShowForm(false);
      } else {
        console.error("Erro do servidor:", result);
        alert('Erro ao salvar respostas: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!email) return;
    fetch(`/api/respostas?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => setRespondeuHoje(data.exists))
      .catch(() => setRespondeuHoje(false));
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px] flex flex-col">
      <MenuPrincipal />
      <HeaderPainel />
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full flex flex-col items-center mt-4 mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-[#025C3E] text-center">
            Bem-vindo(a), {nome}.
          </h3>
          {/* Texto removido conforme solicitado */}
          {respondeuHoje === false && !showForm && (
            <button
              className="mt-6 px-6 py-3 bg-[#025C3E] text-white rounded-lg font-semibold shadow hover:bg-[#038a5e] transition-all"
              type="button"
              onClick={() => setShowForm(true)}
            >
              Registrar meu bem-estar hoje
            </button>
          )}
          {resultado && (
            <div className="w-full max-w-4xl bg-white rounded-2xl p-8 flex flex-col gap-6 border border-[#b2dfdb]">
              <h2 className="text-2xl font-bold text-[#025C3E] text-center mb-4">
                📊 Sua Análise de Bem-Estar
              </h2>
              
              {/* Porcentagens */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(resultado.porcentagens).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-xl text-center">
                    <p className="text-sm text-gray-600 capitalize">{key}</p>
                    <p className="text-2xl font-bold text-[#025C3E]">{String(value)}%</p>
                  </div>
                ))}
              </div>

              {/* Respostas Detalhadas */}
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl mb-4">
                <h3 className="font-bold text-gray-800 mb-4">📝 Suas Respostas:</h3>
                <div className="space-y-4">
                  {resultado.respostasDetalhadas?.map((grupo: {
                    grupo: string;
                    perguntas: Array<{
                      texto: string;
                      resposta: string;
                    }>;
                  }, idx: number) => (
                    <div key={idx} className="mb-4">
                      <h4 className="font-semibold text-[#025C3E] mb-3 text-sm">{grupo.grupo}</h4>
                      {grupo.perguntas.map((pergunta, pIdx: number) => (
                        <div key={pIdx} className="border-l-4 border-[#025C3E] pl-4 mb-3">
                          <div className="mb-2 text-sm">
                            <p className="text-gray-700 mb-1">{pergunta.texto}</p>
                            <p className="font-semibold text-gray-900">
                              {grupo.grupo === 'Desabafo (opcional)' 
                                ? `"${pergunta.resposta}"` 
                                : `Resposta: ${pergunta.resposta}/5`
                              }
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerta */}
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                <h3 className="font-bold text-orange-800 mb-2">🚨 Alertas:</h3>
                <p className="text-orange-700">{resultado.alerta}</p>
              </div>

              {/* Dicas */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                <h3 className="font-bold text-green-800 mb-2">💡 Dicas Personalizadas:</h3>
                <p className="text-green-700">{resultado.dicas}</p>
              </div>

              {/* Justificativa */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <h3 className="font-bold text-blue-800 mb-2">🤖 Como chegamos a essa conclusão:</h3>
                <p className="text-blue-700">{resultado.justificativa}</p>
              </div>

              <button
                onClick={() => {setResultado(null); setRespondeuHoje(true);}}
                className="mt-4 px-6 py-3 bg-[#025C3E] text-white rounded-xl font-semibold hover:bg-[#038a5e] transition-all"
              >
                Finalizar
              </button>
            </div>
          )}
          
          {showForm && (
            <>
              <div className="w-full max-w-xl flex justify-between text-xs text-gray-500 mb-4">
                <span>0 = Nunca</span>
                <span>5 = Sempre</span>
              </div>
              <form 
                className="w-full max-w-3xl bg-white rounded-2xl p-8 flex flex-col gap-8 border border-[#b2dfdb] transition-all duration-300 overflow-x-hidden"
                onSubmit={(e) => e.preventDefault()}
              >
                {/* Abas do wizard - visual melhorado, bordas mais arredondadas */}
                <div className="flex gap-1 justify-center w-full mb-8 bg-white rounded-2xl p-1 border border-[#b2dfdb] flex-nowrap">
                  {grupos.map((g, idx) => (
                    <button
                      type="button"
                      key={g.grupo}
                      className={`px-2 py-1 text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                        abaAtiva === idx
                          ? 'bg-[#e0f2f1] text-[#025C3E] border-[#025C3E] shadow-sm'
                          : 'bg-white text-gray-400 border-transparent hover:text-[#025C3E]'
                      } rounded-xl min-w-[90px] sm:min-w-[110px]`}
                      onClick={() => setAbaAtiva(idx)}
                      tabIndex={-1}
                    >
                      {g.grupo}
                    </button>
                  ))}
                </div>
                {/* Conteúdo da aba ativa */}
                <fieldset className="border border-[#b2dfdb] rounded-2xl p-6 bg-white transition-all duration-300">
                  <legend className="font-extrabold text-[#038a5e] mb-6 text-xl tracking-wide uppercase">{grupos[abaAtiva].grupo}</legend>
                  <div className="flex flex-col gap-8">
                    {grupos[abaAtiva].perguntas.map((p) => (
                      p.name === 'desabafo' ? (
                        <div key={p.name}>
                          <label className="block font-bold text-[#038a5e] mb-2 text-lg">{p.texto}</label>
                          <textarea
                            name="desabafo"
                            rows={4}
                            className="w-full border border-[#b2dfdb] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#038a5e] focus:outline-none resize-none bg-white text-gray-800 placeholder:text-gray-400"
                            placeholder="Gostaria de compartilhar algo sobre como estou me sentindo:"
                            value={formData.desabafo || ""}
                            onChange={e => setFormData(f => ({ ...f, desabafo: e.target.value }))}
                          ></textarea>
                        </div>
                      ) : (
                        <label key={p.name} className="block text-base font-semibold text-[#025C3E]">
                          <span className="block mb-3 text-lg text-[#025C3E]">{p.texto}</span>
                          <div className="flex gap-4 justify-center">
                            {[0,1,2,3,4,5].map((val) => (
                              <label key={val} className={`flex flex-col items-center text-xs cursor-pointer transition-all duration-200 ${Number(formData[p.name]) === val ? 'scale-110' : ''}`}>
                                <input
                                  type="radio"
                                  name={p.name}
                                  value={val}
                                  required={p.name !== 'desabafo'}
                                  className="accent-[#038a5e] w-7 h-7 border border-[#b2dfdb] focus:ring-2 focus:ring-[#038a5e] bg-white"
                                  checked={Number(formData[p.name]) === val}
                                  onChange={e => setFormData(f => ({ ...f, [p.name]: e.target.value }))}
                                />
                                <span className={`mt-2 font-bold ${Number(formData[p.name]) === val ? 'text-[#038a5e]' : 'text-gray-500'}`}>{val}</span>
                              </label>
                            ))}
                          </div>
                        </label>
                      )
                    ))}
                  </div>
                </fieldset>
                {/* Avançar/Voltar ou finalizar */}
                <div className="flex justify-between mt-8 gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex flex-col items-center justify-center text-sm min-w-[90px] shadow-sm disabled:opacity-50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAbaAtiva(a => Math.max(0, a - 1));
                    }}
                    disabled={abaAtiva === 0}
                  >
                    <span className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mb-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                      Voltar
                    </span>
                  </button>
                  {abaAtiva < grupos.length - 1 ? (
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full bg-[#025C3E] text-white font-bold hover:bg-[#038a5e] transition-all text-sm flex flex-col items-center justify-center min-w-[90px] shadow-sm disabled:opacity-50"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setAbaAtiva(a => Math.min(grupos.length - 1, a + 1));
                      }}
                      disabled={grupos[abaAtiva].perguntas.some(p => p.name !== 'desabafo' && (!formData[p.name] || formData[p.name] === ""))}
                    >
                      <span className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mb-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                        Avançar
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full bg-[#025C3E] text-white font-extrabold hover:bg-[#038a5e] transition-all text-sm tracking-wide border-2 border-[#b2dfdb] flex flex-col items-center justify-center min-w-[90px] shadow-sm disabled:opacity-50"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(e);
                      }}
                      disabled={loading}
                    >
                      <span className="flex flex-col items-center justify-center">
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mb-1">
                            <circle cx="12" cy="12" r="10" stroke="#b2dfdb" strokeWidth="2" fill="none" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" stroke="#fff" strokeWidth="2" />
                          </svg>
                        )}
                        {loading ? "Analisando..." : "Enviar respostas"}
                      </span>
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
        {/* Conteúdo do painel pode ser adicionado aqui */}
      </main>
    </div>
  );
}
