import React from 'react';
import { HardHat, Shield, Building2, MapPin, Target } from 'lucide-react';
import { formatNumberBR } from '../utils/formatters';

interface HeaderProps {
  currentRole: 'Admin' | 'Engenheiro' | 'Almoxarifado' | 'Consulta';
  onRoleChange: (role: 'Admin' | 'Engenheiro' | 'Almoxarifado' | 'Consulta') => void;
  metaCBUQ: number;
  producaoRealizada: number;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, metaCBUQ, producaoRealizada }) => {
  return (
    <header className="bg-asphalt-900 border-b border-asphalt-800 text-asphalt-100 px-6 py-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Logotipo Oficial da Plínio Cavalcanti + Identificação da Obra */}
        <div className="flex items-center gap-5">
          
          {/* LOGO OFICIAL DA EMPRESA (imagem LOGO.jpg enviada no projeto) */}
          <div className="bg-white p-2.5 rounded-xl shadow-lg border border-asphalt-700 flex items-center justify-center h-14 shrink-0 transition-transform hover:scale-[1.02]">
            <img
              src="/logo-plinio-cavalcanti.jpg"
              alt="Plínio Cavalcanti Engenharia e Construções"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/LOGO.jpg';
              }}
            />
          </div>

          <div className="h-10 w-px bg-asphalt-800 hidden sm:block"></div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-amber-500/10 text-safety-amber font-bold border border-amber-500/30">
                CONSTRUTORA PLÍNIO CAVALCANTI LTDA
              </span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Obra Ativa
              </span>
            </div>
            
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-1 font-mono">
              <span>OBRA 177/25</span>
              <span className="text-asphalt-500 font-normal">|</span>
              <span className="text-asphalt-200">CONTROLE E GESTÃO DE AGREGADOS CBUQ</span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-asphalt-400 mt-1 font-sans">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-safety-amber" />
                BR-423/PE — Trecho Lajedo-PE → Garanhuns-PE
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-asphalt-400" />
                Serviço: Pavimentação e Produção CBUQ (Faixa C DNIT)
              </span>
            </div>
          </div>

        </div>

        {/* Lado Direito: Meta, Progresso & Perfil de Usuário */}
        <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 border-asphalt-800 pt-3 lg:pt-0 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Card de Meta da Obra */}
          <div className="bg-asphalt-950/80 border border-asphalt-800 rounded-lg px-4 py-2 flex items-center gap-3">
            <div className="p-2 rounded bg-amber-500/10 text-safety-amber">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-asphalt-400 font-medium">Meta Prevista</div>
              <div className="text-sm font-bold text-white font-mono">{formatNumberBR(metaCBUQ, 0)} m³ <span className="text-xs font-normal text-asphalt-400">CBUQ</span></div>
            </div>
          </div>

          {/* Seletor de Nível de Usuário (RBAC) */}
          <div className="bg-asphalt-950/80 border border-asphalt-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-400" />
            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-semibold text-asphalt-400">Perfil Ativo</label>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-safety-amber focus:outline-none cursor-pointer"
              >
                <option value="Admin" className="bg-asphalt-900 text-white">Administrador (Total)</option>
                <option value="Engenheiro" className="bg-asphalt-900 text-white">Engenheiro (Produção/Traço)</option>
                <option value="Almoxarifado" className="bg-asphalt-900 text-white">Almoxarifado (Lançamento)</option>
                <option value="Consulta" className="bg-asphalt-900 text-white">Consulta (Somente Leitura)</option>
              </select>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
