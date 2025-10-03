"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Footer from "@/components/footer";
import Image from "next/image";
import "./painel.css";

const MenuPrincipal = dynamic(() => import("@/components/MenuPrincipal"), { ssr: false });
const HeaderPainel = dynamic(() => import("@/components/HeaderPainel"), { ssr: false });

interface UsuarioCompleto {
  id: number; nome: string; email: string; cargo: string; telefone: string;
  regional: { id: number; nome: string } | null;
  departamento: { id: number; nome: string } | null;
  divisao: { id: number; nome: string } | null;
  assessoria: { id: number; nome: string } | null;
  fazenda: { id: number; nome: string } | null;
  diretoria: { id: number; nome: string } | null;
  gabinete: { id: number; nome: string } | null;
}

export default function PainelPage(){
  const { data: session } = useSession();
  const [usuario,setUsuario] = useState<UsuarioCompleto|null>(null);
  const [carregando,setCarregando] = useState(true);
  const [modalOpen,setModalOpen] = useState(false);
  const [telefoneEdit,setTelefoneEdit] = useState("");
  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);
  const [scale,setScale] = useState(1);
  const cardRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    function ajustar(){
      const card = cardRef.current; if(!card) return;
      const pad=32; const w=window.innerWidth-pad; const h=window.innerHeight-pad;
      const r=card.getBoundingClientRect();
      const s=Math.min(1,w/r.width,h/r.height);
      setScale(prev=> Math.abs(prev-s)>0.01? Number(s.toFixed(3)): prev);
    }
    ajustar();
    const ro=new ResizeObserver(()=>ajustar()); if(cardRef.current) ro.observe(cardRef.current);
    window.addEventListener('resize',ajustar);
    return ()=>{ window.removeEventListener('resize',ajustar); ro.disconnect(); };
  },[]);

  useEffect(()=>{
    if(!session?.user?.email){ setCarregando(false); return; }
    fetch("/api/usuario-completo").then(r=>r.json()).then(d=>{ if(d.success) setUsuario(d.usuario); }).finally(()=>setCarregando(false));
  },[session]);

  useEffect(()=>{ if(usuario?.telefone) setTelefoneEdit(usuario.telefone); },[usuario]);

  const percentualCompleto = (()=>{
    if(!usuario) return 0; const campos=[usuario.telefone,usuario.email,usuario.regional?.nome,usuario.assessoria?.nome];
    const preenchidos = campos.filter(Boolean).length; return Math.round(preenchidos/campos.length*100);
  })();

  function maskTelefone(v:string){
    v=v.replace(/\D/g,"");
    if(v.length<=10){return v.replace(/(\d{2})(\d{4})(\d{0,4})/,(_,a,b,c)=>c?`(${a}) ${b}-${c}`: b?`(${a}) ${b}`: a?`(${a}`:"");}
    return v.replace(/(\d{2})(\d{5})(\d{0,4})/,(_,a,b,c)=>c?`(${a}) ${b}-${c}`: b?`(${a}) ${b}`: a?`(${a}`:"");
  }

  async function handleSaveTelefone(e:React.FormEvent){
    e.preventDefault(); setLoading(true);
    try{ const r= await fetch("/api/update-telefone",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({telefone:telefoneEdit})}); const d=await r.json(); if(d.success){ setSuccess(true); setTimeout(()=>{ setModalOpen(false); setSuccess(false); window.location.reload(); },1200);} else alert(d.message||"Erro"); }
    catch{ alert("Erro ao conectar"); } finally{ setLoading(false); }
  }

  if(carregando) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-[#025C3E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-600 font-semibold">Carregando dados...</p></div></div>;

  return (
    <div className="flex-1 flex flex-col">
      <MenuPrincipal />
      <HeaderPainel />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
      <div className="flex-1">
        <div className="app-wrapper">
        <div className="card-scale-wrapper" style={{transform:`scale(${scale})`, width: scale<1? `${100/scale}%`:'100%'}}>
          <div className="main-card" ref={cardRef}>
            <div className="header-epamig">
              <div className="header-content">
                <div className="header-left">
                  <div className="brand-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="4" fill="#fff" stroke="#025C3E" strokeWidth="2"/><circle cx="8" cy="12" r="3" fill="#4A9A54" /><rect x="13" y="10" width="6" height="2" rx="1" fill="#025C3E"/><rect x="13" y="14" width="6" height="2" rx="1" fill="#025C3E"/></svg>
                  </div>
                  <div className="header-info">
                    <h1>Contato Institucional EPAMIG</h1>
                    <p>Mantenha sua conectividade institucional sempre atualizada</p>
                  </div>
                </div>
                <div className="header-right">
                  <div className="perfil-completude">
                    <div className="perfil-completude-label">Perfil completo: {percentualCompleto}%</div>
                    <div className="perfil-completude-bar"><div className="perfil-completude-fill" style={{width:`${percentualCompleto}%`}}/></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="cartao-container">
              <div className="cartao-institucional">
                <div className="cartao-header">
                  <div className="cartao-avatar">
                    {session?.user?.image ? <Image src={session.user.image} alt="Foto" className="avatar-image" width={60} height={60}/> : <span className="avatar-initial">{usuario?.nome?.charAt(0).toUpperCase()||'U'}</span>}
                  </div>
                  <div className="cartao-header-info">
                    <h2 className="cartao-nome">{usuario?.nome||'Usuário'}</h2>
                    {usuario?.cargo && <p className="cartao-cargo">{usuario.cargo}</p>}
                  </div>
                  <button className="cartao-btn-atualizar" onClick={()=>setModalOpen(true)}><i className="fas fa-edit"/> Atualizar Dados</button>
                </div>
                <div className="cartao-body">
                  {usuario?.telefone && (
                    <div className="info-card">
                      <div className="info-icon">
                        <i className="fas fa-phone" style={{fontSize: '1.4rem'}}></i>
                      </div>
                      <div className="info-content">
                        <div className="info-label">TELEFONE</div>
                        <div className="info-value">{usuario.telefone}</div>
                      </div>
                    </div>
                  )}
                  {usuario?.email && (
                    <div className="info-card">
                      <div className="info-icon">
                        <i className="fas fa-envelope" style={{fontSize: '1.4rem'}}></i>
                      </div>
                      <div className="info-content">
                        <div className="info-label">E-MAIL</div>
                        <div className="info-value">{usuario.email}</div>
                      </div>
                    </div>
                  )}
                  {usuario?.regional?.nome && (
                    <div className="info-card">
                      <div className="info-icon">
                        <i className="fas fa-map-marker-alt" style={{fontSize: '1.4rem'}}></i>
                      </div>
                      <div className="info-content">
                        <div className="info-label">REGIONAL</div>
                        <div className="info-value">{usuario.regional.nome}</div>
                      </div>
                    </div>
                  )}
                  {usuario?.assessoria?.nome && (
                    <div className="info-card">
                      <div className="info-icon">
                        <i className="fas fa-users" style={{fontSize: '1.4rem'}}></i>
                      </div>
                      <div className="info-content">
                        <div className="info-label">ASSESSORIA</div>
                        <div className="info-value">{usuario.assessoria.nome}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <Footer />
      {modalOpen && (
        <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) setModalOpen(false); }}>
          <div className="modal-content">
            <div className="modal-header"><div className="modal-icon"><i className="fas fa-phone-alt"/></div><h3>Atualize seu Contato</h3></div>
            <div className="modal-body">
              {success && <div className="success-message"><i className="fas fa-check-circle"/><span>Telefone atualizado!</span></div>}
              <form onSubmit={handleSaveTelefone}>
                <div className="form-group">
                  <label className="form-label" htmlFor="telefone">Seu Telefone Institucional</label>
                  <div className="input-wrapper">
                    <input id="telefone" type="text" className="form-input" value={telefoneEdit} onChange={e=>setTelefoneEdit(maskTelefone(e.target.value))} placeholder="(31) 99999-9999" required />
                    <i className="fas fa-phone input-icon"/>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={()=>setModalOpen(false)}><i className="fas fa-times"/> Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}><i className="fas fa-save"/> {loading?"Salvando...":"Salvar"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
