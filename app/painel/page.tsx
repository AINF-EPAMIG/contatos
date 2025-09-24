"use client";


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

  useEffect(() => {
    if (!email) return;
    fetch(`/api/respostas?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => setRespondeuHoje(data.exists))
      .catch(() => setRespondeuHoje(false));
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px] flex flex-col">
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
          {showForm && (
            <>
              <div className="w-full max-w-xl flex justify-between text-xs text-gray-500 mb-4">
                <span>0 = Nunca</span>
                <span>5 = Sempre</span>
              </div>
              <form className="w-full max-w-3xl bg-white rounded-2xl p-8 flex flex-col gap-8 border border-[#b2dfdb] transition-all duration-300 overflow-x-hidden">
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
                                  required={abaAtiva === grupos.findIndex(g => g.perguntas.some(q => q.name === p.name))}
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
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    className="px-7 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center gap-2 text-base"
                    onClick={() => setAbaAtiva(a => Math.max(0, a - 1))}
                    disabled={abaAtiva === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Voltar
                  </button>
                  {abaAtiva < grupos.length - 1 ? (
                    <button
                      type="button"
                      className="px-7 py-3 rounded-xl bg-[#025C3E] text-white font-bold hover:bg-[#038a5e] transition-all text-base flex items-center gap-2"
                      onClick={() => setAbaAtiva(a => Math.min(grupos.length - 1, a + 1))}
                      disabled={grupos[abaAtiva].perguntas.some(p => p.name !== 'desabafo' && formData[p.name] === undefined)}
                    >
                      Avançar
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-10 py-3 rounded-xl bg-[#025C3E] text-white font-extrabold hover:bg-[#038a5e] transition-all text-lg tracking-wide border-2 border-[#b2dfdb]"
                    >
                      Enviar respostas
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
