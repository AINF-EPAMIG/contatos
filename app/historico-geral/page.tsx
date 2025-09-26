"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import HeaderPainel from "@/components/HeaderPainel";
import MenuPrincipal from "@/components/MenuPrincipal";

interface AnaliseCompleta {
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
  nome: string;
  cargo: string;
  email: string;
  desabafo: string;
}

export default function HistoricoGeralPage() {
  const [analises, setAnalises] = useState<AnaliseCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnalise, setSelectedAnalise] = useState<AnaliseCompleta | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  // Estados dos filtros
  const [filtroColaborador, setFiltroColaborador] = useState("");
  const [filtroEstresse, setFiltroEstresse] = useState({ min: 0, max: 100 });
  const [filtroAnsiedade, setFiltroAnsiedade] = useState({ min: 0, max: 100 });
  const [filtroBurnout, setFiltroBurnout] = useState({ min: 0, max: 100 });
  const [filtroDepressao, setFiltroDepressao] = useState({ min: 0, max: 100 });
  const [filtroEquilibrio, setFiltroEquilibrio] = useState({ min: 0, max: 100 });

  // Usar useMemo para otimizar a aplicação de filtros
  const analisesFiltered = useMemo(() => {
    if (analises.length === 0) {
      return [];
    }

    let filtered = [...analises];

    // Filtro por colaborador
    if (filtroColaborador) {
      filtered = filtered.filter(analise => 
        analise.nome?.toLowerCase().includes(filtroColaborador.toLowerCase()) ||
        analise.email?.toLowerCase().includes(filtroColaborador.toLowerCase())
      );
    }

    // Filtros por porcentagem
    filtered = filtered.filter(analise => 
      analise.estresse >= filtroEstresse.min && analise.estresse <= filtroEstresse.max &&
      analise.ansiedade >= filtroAnsiedade.min && analise.ansiedade <= filtroAnsiedade.max &&
      analise.burnout >= filtroBurnout.min && analise.burnout <= filtroBurnout.max &&
      analise.depressao >= filtroDepressao.min && analise.depressao <= filtroDepressao.max &&
      analise.equilibrio >= filtroEquilibrio.min && analise.equilibrio <= filtroEquilibrio.max
    );

    return filtered;
  }, [analises, filtroColaborador, filtroEstresse, filtroAnsiedade, filtroBurnout, filtroDepressao, filtroEquilibrio]);

  const fetchAnalises = useCallback(async (force = false) => {
    // Evitar requisições muito frequentes (mínimo 5 segundos entre requests, exceto quando forçado)
    const now = Date.now();
    if (!force && now - lastFetch < 5000) {
      return;
    }

    // Só mostrar loading se não temos dados ainda, senão usa refreshing
    if (analises.length === 0) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError("");
    
    try {
      // Adiciona timestamp para evitar qualquer cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/historico-analises?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Só atualizar se os dados realmente mudaram
      if (JSON.stringify(data) !== JSON.stringify(analises)) {
        setAnalises(data);
        setLastUpdate(new Date());
      }
      setError("");
      setLastFetch(now);
    } catch (err) {
      setError(`Erro ao conectar com o servidor: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [analises, lastFetch]);

  useEffect(() => {
    // Carregar dados imediatamente ao montar o componente (força a primeira busca)
    fetchAnalises(true);

    // Buscar dados quando a página ganha foco (usuário volta para a aba)
    const handleFocus = () => {
      fetchAnalises();
    };

    // Buscar dados quando a aba se torna visível
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAnalises();
      }
    };

    // Buscar dados quando a conexão é restaurada
    const handleOnline = () => {
      setIsOnline(true);
      fetchAnalises(true); // Força busca quando volta online
    };

    // Detectar quando fica offline
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Verificar status inicial
    setIsOnline(navigator.onLine);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchAnalises]);

  const limparFiltros = () => {
    setFiltroColaborador("");
    setFiltroEstresse({ min: 0, max: 100 });
    setFiltroAnsiedade({ min: 0, max: 100 });
    setFiltroBurnout({ min: 0, max: 100 });
    setFiltroDepressao({ min: 0, max: 100 });
    setFiltroEquilibrio({ min: 0, max: 100 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (valor: number) => {
    if (valor >= 85) return 'text-red-600 bg-red-50';
    if (valor >= 70) return 'text-orange-600 bg-orange-50';
    if (valor >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const openModal = (analise: AnaliseCompleta) => {
    setSelectedAnalise(analise);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAnalise(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[80px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#025C3E] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico geral...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[80px] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow">
          <p className="text-red-600 mb-4">❌ {error}</p>
          <button 
            onClick={() => fetchAnalises()}
            className="px-4 py-2 bg-[#025C3E] text-white rounded-lg hover:bg-[#038a5e] transition-all"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header Fixo */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <HeaderPainel />
      </div>
      
      {/* Menu Fixo */}
      <div className="fixed top-[80px] left-0 right-0 z-40 w-full">
        <MenuPrincipal />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 pt-[140px] px-2 sm:px-4 max-w-full overflow-hidden">
        <div className="w-full h-[calc(100vh-140px)] flex flex-col overflow-hidden">
          <div className="bg-white rounded-t-2xl shadow-lg flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Header */}
            <div className="bg-[#025C3E] text-white p-3 sm:p-4 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">📊 Histórico Geral de Análises</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-75">
                      Atualizado: {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isOnline && (
                      <span className="text-xs bg-red-500 bg-opacity-20 text-red-100 px-2 py-0.5 rounded">
                        Offline
                      </span>
                    )}
                    {refreshing && (
                      <div className="flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white opacity-75"></div>
                      </div>
                    )}
                  </div>
                </div>
                {loading && analises.length === 0 && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm">Carregando...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Filtros */}
            <div className="p-2 sm:p-3 lg:p-4 bg-gray-50 border-b flex-shrink-0 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4">
                {/* Filtro por Colaborador */}
                <div className="lg:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">🔍 Buscar Colaborador</label>
                  <input
                    type="text"
                    value={filtroColaborador}
                    onChange={(e) => setFiltroColaborador(e.target.value)}
                    placeholder="Nome ou email..."
                    className="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#025C3E] focus:border-[#025C3E] min-w-0"
                  />
                </div>

                {/* Filtros de Porcentagem */}
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2">
                  {[
                    { label: 'Estresse', state: filtroEstresse, setState: setFiltroEstresse },
                    { label: 'Ansiedade', state: filtroAnsiedade, setState: setFiltroAnsiedade },
                    { label: 'Burnout', state: filtroBurnout, setState: setFiltroBurnout },
                    { label: 'Depressão', state: filtroDepressao, setState: setFiltroDepressao },
                    { label: 'Equilíbrio', state: filtroEquilibrio, setState: setFiltroEquilibrio }
                  ].map((filtro) => (
                    <div key={filtro.label} className="text-center min-w-0">
                      <label className="block text-xs font-semibold text-gray-700 mb-1 truncate">{filtro.label}</label>
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={filtro.state.min}
                          onChange={(e) => filtro.setState({ ...filtro.state, min: parseInt(e.target.value) })}
                          className="w-full h-1 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={filtro.state.max}
                          onChange={(e) => filtro.setState({ ...filtro.state, max: parseInt(e.target.value) })}
                          className="w-full h-1 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-xs text-gray-600 truncate">{filtro.state.min}%-{filtro.state.max}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {analisesFiltered.length} de {analises.length} análises
                  {loading && analises.length === 0 && <span className="text-orange-600 ml-2">(Carregando...)</span>}
                  {refreshing && analises.length > 0 && <span className="text-blue-600 ml-2">(Atualizando...)</span>}
                  {error && <span className="text-red-600 ml-2">(Erro!)</span>}
                </p>
                <button
                  onClick={limparFiltros}
                  className="px-2 py-1 bg-gray-600 text-white text-xs sm:text-sm rounded-lg hover:bg-gray-700 transition-all flex-shrink-0"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="p-2 sm:p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-gray-50 flex-shrink-0 overflow-hidden">
              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm text-center min-w-0">
                <p className="text-xs text-gray-600 truncate">Estresse</p>
                <p className="text-sm sm:text-lg font-bold text-red-600">
                  {(() => {
                    if (analisesFiltered.length === 0) return '0%';
                    const soma = analisesFiltered.reduce((acc, a) => acc + (Number(a.estresse) || 0), 0);
                    const media = Math.round(soma / analisesFiltered.length);
                    return `${media}%`;
                  })()}
                </p>
              </div>
              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm text-center min-w-0">
                <p className="text-xs text-gray-600 truncate">Ansiedade</p>
                <p className="text-sm sm:text-lg font-bold text-orange-600">
                  {(() => {
                    if (analisesFiltered.length === 0) return '0%';
                    const soma = analisesFiltered.reduce((acc, a) => acc + (Number(a.ansiedade) || 0), 0);
                    const media = Math.round(soma / analisesFiltered.length);
                    return `${media}%`;
                  })()}
                </p>
              </div>
              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm text-center min-w-0">
                <p className="text-xs text-gray-600 truncate">Burnout</p>
                <p className="text-sm sm:text-lg font-bold text-yellow-600">
                  {(() => {
                    if (analisesFiltered.length === 0) return '0%';
                    const soma = analisesFiltered.reduce((acc, a) => acc + (Number(a.burnout) || 0), 0);
                    const media = Math.round(soma / analisesFiltered.length);
                    return `${media}%`;
                  })()}
                </p>
              </div>
              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm text-center min-w-0">
                <p className="text-xs text-gray-600 truncate">Depressão</p>
                <p className="text-sm sm:text-lg font-bold text-purple-600">
                  {(() => {
                    if (analisesFiltered.length === 0) return '0%';
                    const soma = analisesFiltered.reduce((acc, a) => acc + (Number(a.depressao) || 0), 0);
                    const media = Math.round(soma / analisesFiltered.length);
                    return `${media}%`;
                  })()}
                </p>
              </div>
              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm text-center min-w-0">
                <p className="text-xs text-gray-600 truncate">Equilíbrio</p>
                <p className="text-sm sm:text-lg font-bold text-green-600">
                  {(() => {
                    if (analisesFiltered.length === 0) return '0%';
                    const soma = analisesFiltered.reduce((acc, a) => acc + (Number(a.equilibrio) || 0), 0);
                    const media = Math.round(soma / analisesFiltered.length);
                    return `${media}%`;
                  })()}
                </p>
              </div>
            </div>

            {/* Tabela Desktop */}
            <div className="hidden lg:block flex-1 overflow-hidden min-h-0">
              <div className="h-full overflow-y-auto overflow-x-hidden">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="w-[20%] px-2 py-2 text-left text-xs font-semibold text-gray-700 truncate">Colaborador</th>
                      <th className="w-[12%] px-2 py-2 text-left text-xs font-semibold text-gray-700 truncate">Data/Hora</th>
                      <th className="w-[8%] px-2 py-2 text-center text-xs font-semibold text-gray-700 truncate">Estresse</th>
                      <th className="w-[8%] px-2 py-2 text-center text-xs font-semibold text-gray-700 truncate">Ansiedade</th>
                      <th className="w-[8%] px-2 py-2 text-center text-xs font-semibold text-gray-700 truncate">Burnout</th>
                      <th className="w-[8%] px-2 py-2 text-center text-xs font-semibold text-gray-700 truncate">Depressão</th>
                      <th className="w-[8%] px-2 py-2 text-center text-xs font-semibold text-gray-700 truncate">Equilíbrio</th>
                      <th className="w-[20%] px-2 py-2 text-left text-xs font-semibold text-gray-700 truncate">Desabafo</th>
                      <th className="w-[8%] px-2 py-2 text-center text-xs font-semibold text-gray-700 truncate">IA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analisesFiltered.map((analise) => (
                      <tr key={analise.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-2 py-2 overflow-hidden">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-xs truncate" title={analise.nome}>{analise.nome}</p>
                            <p className="text-xs text-gray-600 truncate" title={analise.cargo}>{analise.cargo}</p>
                            <p className="text-xs text-gray-500 truncate" title={analise.email}>{analise.email}</p>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-600 overflow-hidden">
                          <div className="truncate" title={formatDate(analise.data_analise)}>
                            {new Date(analise.data_analise).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center overflow-hidden">
                          <span className={`inline-block px-1 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(analise.estresse)}`}>
                            {analise.estresse}%
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center overflow-hidden">
                          <span className={`inline-block px-1 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(analise.ansiedade)}`}>
                            {analise.ansiedade}%
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center overflow-hidden">
                          <span className={`inline-block px-1 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(analise.burnout)}`}>
                            {analise.burnout}%
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center overflow-hidden">
                          <span className={`inline-block px-1 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(analise.depressao)}`}>
                            {analise.depressao}%
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center overflow-hidden">
                          <span className={`inline-block px-1 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(100 - analise.equilibrio)}`}>
                            {analise.equilibrio}%
                          </span>
                        </td>
                        <td className="px-2 py-2 overflow-hidden">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-600 truncate" title={analise.desabafo}>
                              {analise.desabafo || 'Sem desabafo'}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center overflow-hidden">
                          <button
                            onClick={() => openModal(analise)}
                            className="px-1 py-0.5 bg-[#025C3E] text-white text-xs rounded hover:bg-[#038a5e] transition-all"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards Mobile/Tablet */}
            <div className="lg:hidden flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
              {analisesFiltered.map((analise) => (
                <div key={analise.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm min-w-0">
                  <div className="flex justify-between items-start mb-2 min-w-0">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="font-semibold text-gray-900 text-sm truncate" title={analise.nome}>{analise.nome}</h3>
                      <p className="text-xs text-gray-600 truncate" title={analise.cargo}>{analise.cargo}</p>
                      <p className="text-xs text-gray-500 truncate" title={analise.email}>{analise.email}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {new Date(analise.data_analise).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 mb-2 overflow-hidden">
                    <div className="text-center min-w-0">
                      <p className="text-xs text-gray-600 truncate">Estresse</p>
                      <span className={`inline-block px-1 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(analise.estresse)}`}>
                        {analise.estresse}%
                      </span>
                    </div>
                    <div className="text-center min-w-0">
                      <p className="text-xs text-gray-600 truncate">Ansiedade</p>
                      <span className={`inline-block px-1 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(analise.ansiedade)}`}>
                        {analise.ansiedade}%
                      </span>
                    </div>
                    <div className="text-center min-w-0">
                      <p className="text-xs text-gray-600 truncate">Burnout</p>
                      <span className={`inline-block px-1 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(analise.burnout)}`}>
                        {analise.burnout}%
                      </span>
                    </div>
                    <div className="text-center min-w-0">
                      <p className="text-xs text-gray-600 truncate">Depressão</p>
                      <span className={`inline-block px-1 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(analise.depressao)}`}>
                        {analise.depressao}%
                      </span>
                    </div>
                    <div className="text-center min-w-0">
                      <p className="text-xs text-gray-600 truncate">Equilíbrio</p>
                      <span className={`inline-block px-1 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(100 - analise.equilibrio)}`}>
                        {analise.equilibrio}%
                      </span>
                    </div>
                    <div className="text-center min-w-0">
                      <p className="text-xs text-gray-600 truncate">Apoio</p>
                      <span className={`inline-block px-1 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(100 - analise.apoio)}`}>
                        {analise.apoio}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-start gap-2 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 mb-1">Desabafo:</p>
                        <p className="text-xs text-gray-800 truncate" title={analise.desabafo}>
                          {analise.desabafo || 'Sem desabafo'}
                        </p>
                      </div>
                      <button
                        onClick={() => openModal(analise)}
                        className="px-2 py-1 bg-[#025C3E] text-white text-xs rounded hover:bg-[#038a5e] transition-all flex-shrink-0"
                      >
                        Ver IA
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {analisesFiltered.length === 0 && analises.length > 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg">Nenhuma análise encontrada com os filtros aplicados</p>
                <p className="text-gray-500 text-sm mt-2">
                  Tente ajustar os filtros ou limpar para ver todas as análises
                </p>
              </div>
            )}
            
            {/* Empty State - Sem dados */}
            {analises.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <p className="text-gray-600 text-lg">Nenhuma análise encontrada</p>
                <p className="text-gray-500 text-sm mt-2">
                  As análises aparecerão aqui conforme os colaboradores respondem aos questionários
                </p>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Análise IA */}
      {modalOpen && selectedAnalise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="bg-[#025C3E] text-white p-3 sm:p-4 flex justify-between items-center">
              <h2 className="text-sm sm:text-lg font-bold truncate mr-2">🤖 Análise IA</h2>
              <button
                onClick={closeModal}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-sm sm:text-lg font-bold transition-all flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(85vh-120px)]">
              {/* Info do Colaborador */}
              <div className="mb-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{selectedAnalise.nome}</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedAnalise.cargo}</p>
                <p className="text-xs text-gray-500 truncate">{selectedAnalise.email}</p>
              </div>

              {/* Data da Análise */}
              <div className="mb-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">📅 Data da Análise</label>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">{formatDate(selectedAnalise.data_analise)}</p>
                </div>
              </div>

              {/* Alerta */}
              <div className="mb-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">⚠️ Alerta</label>
                <div className="p-2 sm:p-3 bg-red-50 rounded-lg border-l-2 sm:border-l-4 border-red-400">
                  <p className="text-xs sm:text-sm text-red-800">{selectedAnalise.alerta}</p>
                </div>
              </div>

              {/* Dicas */}
              <div className="mb-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">💡 Dicas e Recomendações</label>
                <div className="p-2 sm:p-3 bg-green-50 rounded-lg border-l-2 sm:border-l-4 border-green-400">
                  <p className="text-xs sm:text-sm text-green-800 whitespace-pre-line">{selectedAnalise.dicas}</p>
                </div>
              </div>

              {/* Justificativa IA */}
              <div className="mb-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">🧠 Justificativa da IA</label>
                <div className="p-2 sm:p-3 bg-purple-50 rounded-lg border-l-2 sm:border-l-4 border-purple-400">
                  <p className="text-xs sm:text-sm text-purple-800 whitespace-pre-line">{selectedAnalise.justificativa_ia}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-sm sm:text-base"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}