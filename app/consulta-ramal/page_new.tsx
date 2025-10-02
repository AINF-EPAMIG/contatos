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
import { ChevronUpDownIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Globe, Mail, Phone } from "lucide-react";
import Image from "next/image";
import "./consulta-ramal.css";

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
              <Globe size={22} />
            </div>
            <span className="header-action-label-v2">SITE</span>
          </a>
          <a 
            href="#" 
            className="header-action-item-v2"
            title="Sistema TOTVS"
            aria-label="Acessar sistema TOTVS"
          >
            <div className="header-icon-btn-v2">
              <Image src="/icon_totvs.svg" alt="TOTVS" className="totvs-icon" width={22} height={22} />
            </div>
            <span className="header-action-label-v2">PORTAL ADM</span>
          </a>
          <a 
            href="mailto:contato@epamig.br" 
            className="header-action-item-v2"
            title="Enviar E-mail"
            aria-label="Enviar e-mail para contato@epamig.br"
          >
            <div className="header-icon-btn-v2">
              <Mail size={22} />
            </div>
            <span className="header-action-label-v2">E-MAIL</span>
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

  useEffect(() => {
    fetch("/api/consulta-ramal")
      .then((response) => response.json())
      .then((data) => {
        setColaboradores(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Erro ao carregar colaboradores:", error);
        setColaboradores([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const columns = useMemo(() => [
    columnHelper.accessor("nome", {
      header: ({ column }) => (
        <button
          className="table-header-btn"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome Completo
          <ChevronUpDownIcon className="sort-icon" />
        </button>
      ),
      cell: ({ getValue }) => (
        <div className="name-cell">
          <div className="avatar">
            {getValue()?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <span className="name-text">{getValue()}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "lotacao",
      header: "Lotação",
      cell: ({ row }) => (
        <div className="lotacao-cell">
          <button
            onClick={() => handleOpenModal(row.original)}
            className="ver-detalhes-btn"
          >
            Ver Detalhes
          </button>
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <button
          className="table-header-btn"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          E-mail Corporativo
          <ChevronUpDownIcon className="sort-icon" />
        </button>
      ),
      cell: ({ getValue }) => (
        <a href={`mailto:${getValue()}`} className="email-link">
          {getValue()}
        </a>
      ),
    }),
    columnHelper.accessor((row) => row.regional_nome || row.departamento_nome || row.divisao_nome || row.fazenda_nome || "Não informado", {
      id: "unidade",
      header: ({ column }) => (
        <button
          className="table-header-btn"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Unidade
          <ChevronUpDownIcon className="sort-icon" />
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="unit-badge">{getValue()}</span>
      ),
    }),
    columnHelper.accessor("telefone", {
      header: "Telefone",
      cell: ({ getValue }) => (
        <div className="phone-cell">
          <Phone size={16} className="phone-icon" />
          <span>{getValue()}</span>
        </div>
      ),
    }),
  ], []);

  const handleOpenModal = async (colaborador: Colaborador) => {
    setIsModalOpen(true);
    setSelectedColaborador(null);
    
    try {
      const response = await fetch('/api/usuario-detalhes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: colaborador.email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedColaborador(data.colaborador);
      } else {
        console.error('Erro ao buscar detalhes:', data.message);
        setSelectedColaborador({
          id: colaborador.id,
          nome: colaborador.nome,
          email: colaborador.email,
          telefone: colaborador.telefone,
          cargo: colaborador.cargo,
        });
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setSelectedColaborador({
        id: colaborador.id,
        nome: colaborador.nome,
        email: colaborador.email,
        telefone: colaborador.telefone,
        cargo: colaborador.cargo,
      });
    } finally {
      // Modal loading completed
    }
  };

  const filteredData = useMemo(() => {
    if (!Array.isArray(colaboradores)) {
      return [];
    }
    
    return colaboradores.filter((colaborador) => {
      const matchesGlobal = globalFilter === "" || 
        colaborador.nome?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        colaborador.email?.toLowerCase().includes(globalFilter.toLowerCase());
      
      const unit = colaborador.regional_nome || colaborador.departamento_nome || colaborador.divisao_nome || colaborador.fazenda_nome || "";
      const matchesUnit = unitFilter === "" || unit.toLowerCase().includes(unitFilter.toLowerCase());
      
      return matchesGlobal && matchesUnit;
    });
  }, [colaboradores, globalFilter, unitFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const uniqueUnits = useMemo(() => {
    if (!Array.isArray(colaboradores)) {
      return [];
    }
    
    const units = new Set<string>();
    colaboradores.forEach(c => {
      const unit = c.regional_nome || c.departamento_nome || c.divisao_nome || c.fazenda_nome;
      if (unit) units.add(unit);
    });
    return Array.from(units).sort();
  }, [colaboradores]);

  return (
    <div className="page-wrapper">
      <HeaderConsultaRamal />
      
      <main className="main-content">
        <div className="content-container">
          <div className="filters-section">
            <div className="filters-header">
              <p className="filters-subtitle">Contatos dos Colaboradores da EPAMIG</p>
              <h1 className="filters-title">Sistema de consulta e gerenciamento de contatos corporativos</h1>
            </div>
            
            <div className="filters-controls">
              <div className="filter-group">
                <div className="search-input-wrapper">
                  <MagnifyingGlassIcon className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou e-mail..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="search-input"
                  />
                  {globalFilter && (
                    <button
                      onClick={() => setGlobalFilter("")}
                      className="clear-search-btn"
                      title="Limpar busca"
                    >
                      <XMarkIcon className="clear-icon" />
                    </button>
                  )}
                </div>
              </div>
            
              <div className="filter-group">
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="unit-select"
                >
                  <option value="">Todas as unidades</option>
                  {uniqueUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {(globalFilter || unitFilter) && (
                <div className="filter-actions">
                  <button
                    onClick={() => {
                      setGlobalFilter("");
                      setUnitFilter("");
                    }}
                    className="clear-filters-btn"
                  >
                    <XMarkIcon className="clear-icon" />
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="table-container">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <h3>Carregando colaboradores...</h3>
                <p>Aguarde enquanto carregamos os dados dos colaboradores.</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="modern-table">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th key={header.id} className="table-header">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row, index) => (
                        <tr key={row.id} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="table-cell">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredData.length === 0 && colaboradores.length > 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h3>Nenhum colaborador encontrado</h3>
                    <p>Nenhum colaborador encontrado com os filtros aplicados.</p>
                    <p>Tente ajustar os termos de busca ou filtros.</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="results-info">
            {!isLoading && (
              <>Exibindo {filteredData.length} de {colaboradores.length} colaboradores</>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Detalhes */}
      {isModalOpen && selectedColaborador && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedColaborador.nome}</h2>
              {selectedColaborador.cargo && <p className="modal-subtitle">{selectedColaborador.cargo}</p>}
            </div>
            <div className="modal-body">
              {/* Informações de Contato */}
              <div className="modal-section">
                <h3 className="section-title">Informações de Contato</h3>
                <div className="info-grid">
                  {selectedColaborador.email && (
                    <div className="info-item">
                      <Mail size={18} className="info-icon" />
                      <div className="info-content">
                        <span className="info-label">E-mail</span>
                        <a href={`mailto:${selectedColaborador.email}`} className="info-value info-link">
                          {selectedColaborador.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedColaborador.telefone && (
                    <div className="info-item">
                      <Phone size={18} className="info-icon" />
                      <div className="info-content">
                        <span className="info-label">Telefone</span>
                        <a href={`tel:${selectedColaborador.telefone}`} className="info-value info-link">
                          {selectedColaborador.telefone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lotação */}
              {(selectedColaborador.regional?.nome || selectedColaborador.departamento?.nome || selectedColaborador.divisao?.nome || selectedColaborador.assessoria?.nome || selectedColaborador.fazenda?.nome || selectedColaborador.diretoria?.nome || selectedColaborador.gabinete?.nome) && (
                <div className="modal-section">
                  <h3 className="section-title">Lotação</h3>
                  <div className="info-grid-lotacao">
                    {selectedColaborador.regional?.nome && (
                      <div className="info-item-lotacao">
                        <div className="info-badge">Regional</div>
                        <p className="info-value-simple">{selectedColaborador.regional.nome}</p>
                      </div>
                    )}
                    {selectedColaborador.departamento?.nome && (
                      <div className="info-item-lotacao">
                        <div className="info-badge">Departamento</div>
                        <p className="info-value-simple">{selectedColaborador.departamento.nome}</p>
                      </div>
                    )}
                    {selectedColaborador.divisao?.nome && (
                      <div className="info-item-lotacao">
                        <div className="info-badge">Divisão</div>
                        <p className="info-value-simple">{selectedColaborador.divisao.nome}</p>
                      </div>
                    )}
                    {selectedColaborador.assessoria?.nome && (
                      <div className="info-item-lotacao">
                        <div className="info-badge">Assessoria</div>
                        <p className="info-value-simple">{selectedColaborador.assessoria.nome}</p>
                      </div>
                    )}
                    {selectedColaborador.fazenda?.nome && (
                      <div className="info-item-lotacao">
                        <div className="info-badge">Fazenda</div>
                        <p className="info-value-simple">{selectedColaborador.fazenda.nome}</p>
                      </div>
                    )}
                    {selectedColaborador.diretoria?.nome && (
                      <div className="info-item-lotacao">
                        <div className="info-badge">Diretoria</div>
                        <p className="info-value-simple">{selectedColaborador.diretoria.nome}</p>
                      </div>
                    )}
                    {selectedColaborador.gabinete?.nome && (
                      <div className="info-item-lotacao">
                        <div className="info-badge">Gabinete</div>
                        <p className="info-value-simple">{selectedColaborador.gabinete.nome}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="modal-close-btn"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <footer className="page-footer">
        <div className="footer-content">
          <p>&copy; 2025 EPAMIG - ASTI</p>
        </div>
      </footer>
    </div>
  );
}
