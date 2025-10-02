"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ChevronUpDownIcon, XMarkIcon, UserGroupIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { Globe, Mail, Phone, Search, Users, Eye, MapPin, Calendar } from "lucide-react";
import Image from "next/image";
import "./consulta-ramal.css";
import "./modern-styles.css";

interface Colaborador {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo?: string;
  regional_nome?: string;
  departamento_nome?: string;
  divisao_nome?: string;
  assessoria_nome?: string;
  fazenda_nome?: string;
  diretoria_nome?: string;
  gabinete_nome?: string;
}

interface ColaboradorDetalhado {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo?: string;
  regional?: { nome: string } | null;
  departamento?: { nome: string } | null;
  divisao?: { nome: string } | null;
  assessoria?: { nome: string } | null;
  fazenda?: { nome: string } | null;
  diretoria?: { nome: string } | null;
  gabinete?: { nome: string } | null;
}

function HeaderConsultaRamal() {
  return (
    <header className="header-consulta-ramal">
      <div className="header-container">
        <div className="header-left">
          <Image src="/epamig_logo.svg" alt="EPAMIG" className="logo-img" width={48} height={48} />
        </div>
        <div className="header-center">
          <h1 className="header-title">Empresa de Pesquisa Agropecuária de Minas Gerais</h1>
          <p className="header-subtitle">Secretaria de Estado de Agricultura, Pecuária e Abastecimento de Minas Gerais</p>
        </div>
        <div className="header-right header-actions-v2">
          <a 
            href="https://epamig.br" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="header-action-item-v2"
            title="Site Institucional"
            aria-label="Acessar site institucional da EPAMIG"
          >
            <div className="header-icon-btn-v2">
              <Globe size={24} />
            </div>
            <span className="header-action-label-v2" style={{ color: '#111' }}>SITE</span>
          </a>
          <a 
            href="#" 
            className="header-action-item-v2"
            title="Sistema TOTVS"
            aria-label="Acessar sistema TOTVS"
          >
            <div className="header-icon-btn-v2">
              <Image src="/icon_totvs.svg" alt="TOTVS" className="totvs-icon" width={24} height={24} />
            </div>
            <span className="header-action-label-v2" style={{ color: '#111' }}>PORTAL ADM</span>
          </a>
          <a 
            href="mailto:contato@epamig.br" 
            className="header-action-item-v2"
            title="Enviar E-mail"
            aria-label="Enviar e-mail para contato@epamig.br"
          >
            <div className="header-icon-btn-v2">
              <Mail size={24} />
            </div>
            <span className="header-action-label-v2" style={{ color: '#111' }}>E-MAIL</span>
          </a>
        </div>
      </div>
      <div className="header-divider"></div>
    </header>
  );
}

const columnHelper = createColumnHelper<Colaborador>();

export default function ConsultaRamalPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorDetalhado | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const fetchColaboradorDetalhes = async (email: string) => {
    setIsLoadingDetails(true);
    
    try {
      // Buscar dados básicos da lista primeiro para garantir que sempre temos algo
      const colaboradorBasico = colaboradores.find(c => c.email === email);
      
      if (!colaboradorBasico) {
        console.error('Colaborador não encontrado na lista');
        setIsLoadingDetails(false);
        return;
      }

      // Definir dados básicos imediatamente para evitar null
      const dadosBasicos = {
        ...colaboradorBasico,
        regional: colaboradorBasico.regional_nome ? { nome: colaboradorBasico.regional_nome } : null,
        departamento: colaboradorBasico.departamento_nome ? { nome: colaboradorBasico.departamento_nome } : null,
        divisao: colaboradorBasico.divisao_nome ? { nome: colaboradorBasico.divisao_nome } : null,
        assessoria: colaboradorBasico.assessoria_nome ? { nome: colaboradorBasico.assessoria_nome } : null,
        fazenda: colaboradorBasico.fazenda_nome ? { nome: colaboradorBasico.fazenda_nome } : null,
        diretoria: colaboradorBasico.diretoria_nome ? { nome: colaboradorBasico.diretoria_nome } : null,
        gabinete: colaboradorBasico.gabinete_nome ? { nome: colaboradorBasico.gabinete_nome } : null,
      };
      
      setSelectedColaborador(dadosBasicos);

      const response = await fetch('/api/usuario-detalhes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro HTTP:', response.status, errorText);
        // Manter dados básicos já definidos
        return;
      }

      const data = await response.json();
      console.log('Dados recebidos da API:', data);
      
      if (data.success && data.colaborador) {
        console.log('Detalhes carregados com sucesso para:', colaboradorBasico.nome);
        setSelectedColaborador({
          ...data.colaborador,
          nome: colaboradorBasico.nome, // Força o uso do nome da tabela
          email: colaboradorBasico.email, // Garante consistência do email também
          telefone: colaboradorBasico.telefone, // Garante consistência do telefone
        });
      }
      // Se API falhar, mantém dados básicos já definidos
      
    } catch (error) {
      console.error('=== ERRO ao buscar detalhes do colaborador ===');
      console.error('Erro:', error);
      
      // Em caso de erro, garantir que ainda temos dados básicos
      const colaboradorBasico = colaboradores.find(c => c.email === email);
      if (colaboradorBasico) {
        console.log('Usando dados básicos para:', colaboradorBasico.nome);
        setSelectedColaborador({
          ...colaboradorBasico,
          regional: colaboradorBasico.regional_nome ? { nome: colaboradorBasico.regional_nome } : null,
          departamento: colaboradorBasico.departamento_nome ? { nome: colaboradorBasico.departamento_nome } : null,
          divisao: colaboradorBasico.divisao_nome ? { nome: colaboradorBasico.divisao_nome } : null,
          assessoria: colaboradorBasico.assessoria_nome ? { nome: colaboradorBasico.assessoria_nome } : null,
          fazenda: colaboradorBasico.fazenda_nome ? { nome: colaboradorBasico.fazenda_nome } : null,
          diretoria: colaboradorBasico.diretoria_nome ? { nome: colaboradorBasico.diretoria_nome } : null,
          gabinete: colaboradorBasico.gabinete_nome ? { nome: colaboradorBasico.gabinete_nome } : null,
        });
      }
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetch("/api/consulta-ramal")
      .then((response) => response.json())
      .then((data) => {
        // Garantir que sempre seja um array
        setColaboradores(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Erro ao carregar colaboradores:", error);
        setColaboradores([]); // Em caso de erro, definir array vazio
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const unidades = useMemo(() => {
    const set = new Set(colaboradores.map(c => c.regional_nome || c.departamento_nome || c.divisao_nome || c.assessoria_nome || c.fazenda_nome || c.diretoria_nome || c.gabinete_nome));
    return Array.from(set).filter(Boolean);
  }, [colaboradores]);

  const filteredRows = useMemo(() => {
    return colaboradores.filter(c => {
      const nomeMatch = c.nome.toLowerCase().includes(globalFilter.toLowerCase());
      const unidadeMatch = unitFilter ? (
        c.regional_nome === unitFilter ||
        c.departamento_nome === unitFilter ||
        c.divisao_nome === unitFilter ||
        c.assessoria_nome === unitFilter ||
        c.fazenda_nome === unitFilter ||
        c.diretoria_nome === unitFilter ||
        c.gabinete_nome === unitFilter
      ) : true;
      return nomeMatch && unidadeMatch;
    });
  }, [colaboradores, globalFilter, unitFilter]);

  const columns = useMemo(() => [
    columnHelper.accessor("nome", {
      header: ({ column }) => (
        <button 
          className="modern-header-btn" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span className="header-text">Nome Completo</span>
          <ChevronUpDownIcon className="sort-icon" />
        </button>
      ),
      cell: ({ getValue }) => (
        <div className="modern-name-cell">
          <div className="avatar-modern">
            <span className="avatar-text">{getValue()?.charAt(0)?.toUpperCase() || "?"}</span>
          </div>
          <div className="name-info">
            <span className="name-primary">{getValue()}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <button 
          className="modern-header-btn" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Mail className="header-icon" />
          <span className="header-text">E-mail</span>
          <ChevronUpDownIcon className="sort-icon" />
        </button>
      ),
      cell: ({ getValue }) => (
        <div className="contact-cell">
          <a href={`mailto:${getValue()}`} className="contact-link email-link">
            <Mail className="contact-icon" style={{ color: '#025C3E' }} />
            <span className="contact-text">{getValue()}</span>
          </a>
        </div>
      ),
    }),
    columnHelper.accessor("telefone", {
      header: ({ column }) => (
        <button 
          className="modern-header-btn" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Phone className="header-icon" />
          <span className="header-text">Telefone</span>
          <ChevronUpDownIcon className="sort-icon" />
        </button>
      ),
      cell: ({ getValue }) => (
        <div className="contact-cell">
          <a href={`tel:${getValue()}`} className="contact-link phone-link">
            <Phone className="contact-icon" />
            <span className="contact-text">{getValue()}</span>
          </a>
        </div>
      ),
    }),
    columnHelper.accessor("regional_nome", {
      header: () => (
        <div className="modern-header">
          <MapPin className="header-icon" />
          <span className="header-text">Unidade</span>
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="unit-cell">
          <span className="unit-text">{getValue()}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="header-text">Ações</span>,
      cell: ({ row }) => (
        <div className="action-cell">
          <button 
            className="action-btn primary"
            onClick={async (e) => { 
              e.stopPropagation(); 
              setIsModalOpen(true);
              await fetchColaboradorDetalhes(row.original.email); 
            }}
            title="Ver detalhes do colaborador"
          >
            <Eye className="action-icon" />
            <span className="action-text">Detalhes</span>
          </button>
        </div>
      ),
    }),
  ], [setSelectedColaborador, setIsModalOpen]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <HeaderConsultaRamal />
      <div className="hero-section">
        <div className="hero-content-minimal">
          <div className="hero-text-minimal">
            <h1 className="hero-title-minimal">
              <UserGroupIcon className="hero-icon-minimal" />
              Contato dos Colaboradores da EPAMIG
            </h1>
            <p className="hero-subtitle-minimal">
              Sistema inteligente de consulta e gerenciamento de contatos corporativos
            </p>
          </div>
        </div>
      </div>
      <div className="search-section">
        <div className="search-container">
          <div className="search-filters-group">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Pesquisar por nome..."
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
              />
              {globalFilter && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setGlobalFilter('')}
                >
                  <XMarkIcon className="clear-icon" />
                </button>
              )}
            </div>
            
            <div className="unit-select-wrapper">
              <MapPin className="unit-select-icon" />
              <select
                className="unit-select"
                value={unitFilter}
                onChange={e => setUnitFilter(e.target.value)}
              >
                <option value="">Todas as unidades</option>
                {unidades.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          
          <div className="filter-controls">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Visualização em tabela"
              >
                <svg className="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 10h18M3 16h18" />
                </svg>
                <span className="view-text">Tabela</span>
              </button>
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Visualização em cartões"
              >
                <svg className="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span className="view-text">Cartões</span>
              </button>
            </div>
          </div>
        </div>

      </div>
      <div className="content-section">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Carregando colaboradores...</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="table-wrapper">
            <div className="table-header-info">
              <span className="results-count">
                {filteredRows.length} colaborador{filteredRows.length !== 1 ? 'es' : ''} encontrado{filteredRows.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="modern-table-container">
              <table className="modern-table">
                <thead className="table-head">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="header-row">
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="header-cell">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="table-body">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`data-row ${index % 2 === 0 ? 'even' : 'odd'}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="data-cell">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid-view">
            <div className="grid-header-info">
              <span className="results-count">
                {filteredRows.length} colaborador{filteredRows.length !== 1 ? 'es' : ''} encontrado{filteredRows.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="cards-grid">
              {filteredRows.map((colaborador) => (
                <div key={colaborador.id} className="colaborador-card">
                  <div className="card-header">
                    <div className="card-avatar">
                      <span className="avatar-text">{colaborador.nome.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="card-name">
                      <h3 className="name-title">{colaborador.nome}</h3>
                      {colaborador.cargo && <p className="name-subtitle">{colaborador.cargo}</p>}
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="contact-item">
                      <Mail className="contact-icon-card" />
                      <a href={`mailto:${colaborador.email}`} className="contact-link-card">
                        {colaborador.email}
                      </a>
                    </div>
                    <div className="contact-item">
                      <Phone className="contact-icon-card" />
                      <a href={`tel:${colaborador.telefone}`} className="contact-link-card">
                        {colaborador.telefone}
                      </a>
                    </div>
                    {colaborador.regional_nome && (
                      <div className="contact-item">
                        <MapPin className="contact-icon-card" />
                        <span className="unit-name">{colaborador.regional_nome}</span>
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button 
                      className="card-btn"
                      onClick={async () => {
                        setIsModalOpen(true);
                        await fetchColaboradorDetalhes(colaborador.email);
                      }}
                    >
                      <Eye className="btn-icon-card" />
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {isLoadingDetails ? (
              <div className="modal-loading">
                <div className="loading-spinner"></div>
                <p>Carregando detalhes...</p>
              </div>
            ) : selectedColaborador ? (
              <>
                <div className="modal-header">
                  <h2 className="modal-title">{selectedColaborador.nome}</h2>
                  {selectedColaborador.cargo && (
                    <p className="modal-subtitle">{selectedColaborador.cargo}</p>
                  )}
                </div>
                <div className="modal-body">
                  <div className="modal-section">
                    <h3 className="section-title">Informações de Contato</h3>
                    <div className="info-card-unico info-card-unico-visual">
                      <div className="info-list" style={{ padding: '16px 8px' }}>
                        {selectedColaborador.email && (
                          <div className="info-row" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
                            <Mail size={18} className="info-icon info-icon-spaced" style={{ marginRight: '12px', color: '#025C3E' }} />
                            <div className="info-label-value">
                              <span className="info-label" style={{ color: '#222', fontWeight: 500 }}>E-mail:</span>
                              <span className="info-value" style={{ color: '#222', marginLeft: 6 }}>{selectedColaborador.email}</span>
                            </div>
                          </div>
                        )}
                        {selectedColaborador.telefone && (
                          <div className="info-row" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
                            <Phone size={18} className="info-icon info-icon-spaced" style={{ marginRight: '12px' }} />
                            <div className="info-label-value">
                              <span className="info-label" style={{ color: '#222', fontWeight: 500 }}>Telefone:</span>
                              <span className="info-value" style={{ color: '#222', marginLeft: 6 }}>{selectedColaborador.telefone}</span>
                            </div>
                          </div>
                        )}
                        {selectedColaborador.regional && selectedColaborador.regional.nome && (
                          <div className="info-row" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
                            <MapPin size={18} className="info-icon info-icon-spaced" style={{ marginRight: '12px' }} />
                            <div className="info-label-value">
                              <span className="info-label" style={{ color: '#222', fontWeight: 500 }}>Regional:</span>
                              <span className="info-value" style={{ color: '#222', marginLeft: 6 }}>{selectedColaborador.regional.nome}</span>
                            </div>
                          </div>
                        )}
                        {selectedColaborador.fazenda && selectedColaborador.fazenda.nome && (
                          <div className="info-row" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
                            <BuildingOfficeIcon className="info-icon info-icon-spaced" style={{ width: 18, height: 18, marginRight: '12px' }} />
                            <div className="info-label-value">
                              <span className="info-label" style={{ color: '#222', fontWeight: 500 }}>Fazenda:</span>
                              <span className="info-value" style={{ color: '#222', marginLeft: 6 }}>{selectedColaborador.fazenda.nome}</span>
                            </div>
                          </div>
                        )}
                        {selectedColaborador.diretoria && selectedColaborador.diretoria.nome && (
                          <div className="info-row" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
                            <BuildingOfficeIcon className="info-icon info-icon-spaced" style={{ width: 18, height: 18, marginRight: '12px' }} />
                            <div className="info-label-value">
                              <span className="info-label" style={{ color: '#222', fontWeight: 500 }}>Diretoria:</span>
                              <span className="info-value" style={{ color: '#222', marginLeft: 6 }}>{selectedColaborador.diretoria.nome}</span>
                            </div>
                          </div>
                        )}
                        {selectedColaborador.departamento && selectedColaborador.departamento.nome && (
                          <div className="info-row" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
                            <Calendar className="info-icon info-icon-spaced" style={{ width: 18, height: 18, marginRight: '12px' }} />
                            <div className="info-label-value">
                              <span className="info-label" style={{ color: '#222', fontWeight: 500 }}>Departamento:</span>
                              <span className="info-value" style={{ color: '#222', marginLeft: 6 }}>{selectedColaborador.departamento.nome}</span>
                            </div>
                          </div>
                        )}
                        {selectedColaborador.divisao && selectedColaborador.divisao.nome && (
                          <div className="info-row" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
                            <Users className="info-icon info-icon-spaced" style={{ width: 18, height: 18, marginRight: '12px' }} />
                            <div className="info-label-value">
                              <span className="info-label" style={{ color: '#222', fontWeight: 500 }}>Divisão:</span>
                              <span className="info-value" style={{ color: '#222', marginLeft: 6 }}>{selectedColaborador.divisao.nome}</span>
                            </div>
                          </div>
                        )}
                        {selectedColaborador.assessoria && selectedColaborador.assessoria.nome && (
                          <div className="info-row" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
                            <Mail className="info-icon info-icon-spaced" style={{ width: 18, height: 18, marginRight: '12px' }} />
                            <div className="info-label-value">
                              <span className="info-label" style={{ color: '#222', fontWeight: 500 }}>Assessoria:</span>
                              <span className="info-value" style={{ color: '#222', marginLeft: 6 }}>{selectedColaborador.assessoria.nome}</span>
                            </div>
                          </div>
                        )}
                        {selectedColaborador.gabinete && selectedColaborador.gabinete.nome && (
                          <div className="info-row" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
                            <BuildingOfficeIcon className="info-icon info-icon-spaced" style={{ width: 18, height: 18, marginRight: '12px' }} />
                            <div className="info-label-value">
                              <span className="info-label" style={{ color: '#222', fontWeight: 500 }}>Gabinete:</span>
                              <span className="info-value" style={{ color: '#222', marginLeft: 6 }}>{selectedColaborador.gabinete.nome}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="modal-close-btn"
                  >
                    Fechar
                  </button>
                </div>
              </>
            ) : (
              <div className="modal-error">
                <p>Erro ao carregar detalhes do colaborador.</p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="modal-close-btn"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <footer className="page-footer fixed-footer">
        <div className="footer-content">
          <p>&copy; 2025 EPAMIG - ASTI</p>
        </div>
      </footer>
    </div>
  );
}
