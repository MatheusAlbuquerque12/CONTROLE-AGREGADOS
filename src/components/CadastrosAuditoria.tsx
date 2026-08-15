import React, { useState } from 'react';
import { Building, ShieldCheck, UserCheck, History, Plus } from 'lucide-react';
import { Usuario, AuditLog, Obra } from '../types';

interface CadastrosAuditoriaProps {
  usuarios: Usuario[];
  auditLogs: AuditLog[];
  obra: Obra | undefined;
}

export const CadastrosAuditoria: React.FC<CadastrosAuditoriaProps> = ({ usuarios, auditLogs, obra }) => {
  const [activeSubTab, setActiveSubTab] = useState<'obras' | 'usuarios' | 'auditoria'>('obras');

  return (
    <div className="space-y-6">
      
      {/* HEADER DO MÓDULO */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Building className="w-5 h-5 text-safety-amber" />
            Cadastros Multi-Obras, Usuários & Log de Auditoria
          </h2>
          <p className="text-xs text-asphalt-400 mt-1">
            Governança da plataforma, controle de permissões por perfil e rastreabilidade total das operações.
          </p>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex gap-2 font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('obras')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeSubTab === 'obras'
              ? 'bg-safety-amber text-asphalt-950'
              : 'bg-asphalt-900 text-asphalt-300 border border-asphalt-800'
          }`}
        >
          1. Gestão de Obras / Centros de Custo
        </button>
        <button
          onClick={() => setActiveSubTab('usuarios')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeSubTab === 'usuarios'
              ? 'bg-safety-amber text-asphalt-950'
              : 'bg-asphalt-900 text-asphalt-300 border border-asphalt-800'
          }`}
        >
          2. Usuários & Permissões (RBAC)
        </button>
        <button
          onClick={() => setActiveSubTab('auditoria')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeSubTab === 'auditoria'
              ? 'bg-safety-amber text-asphalt-950'
              : 'bg-asphalt-900 text-asphalt-300 border border-asphalt-800'
          }`}
        >
          3. Trilha de Auditoria (Logs)
        </button>
      </div>

      {/* CONTEÚDO SUB-TAB OBRAS */}
      {activeSubTab === 'obras' && obra && (
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-6 shadow-lg space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-asphalt-800 pb-3">
            <Building className="w-4 h-4 text-safety-amber" />
            Empreendimentos Cadastrados no Sistema (Multi-Obras)
          </h3>

          <div className="bg-asphalt-950 border border-amber-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-safety-amber">CENTRO DE CUSTO: {obra.centro_custo}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                {obra.status}
              </span>
            </div>
            <div className="text-sm font-bold text-white">{obra.nome_obra}</div>
            <div className="text-asphalt-400 space-y-0.5 text-[11px]">
              <div>Rodovia: {obra.rodovia} • Trecho: {obra.trecho}</div>
              <div>Fornecedor Principal: {obra.fornecedor_principal}</div>
              <div>Meta de Produção CBUQ: <strong>{obra.producao_prevista_m3?.toLocaleString('pt-BR')} m³</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO SUB-TAB USUÁRIOS */}
      {activeSubTab === 'usuarios' && (
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-6 shadow-lg space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-asphalt-800 pb-3">
            <UserCheck className="w-4 h-4 text-safety-amber" />
            Níveis de Acesso e Permissões do Sistema (RBAC)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-asphalt-950 text-asphalt-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Nome do Usuário</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3">Cargo</th>
                  <th className="p-3">Nível de Permissão</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-asphalt-800 text-asphalt-200">
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td className="p-3 font-bold text-white">{u.nome}</td>
                    <td className="p-3 text-asphalt-400">{u.email}</td>
                    <td className="p-3 text-asphalt-300">{u.cargo}</td>
                    <td className="p-3 font-bold text-safety-amber">{u.nivel_permissao}</td>
                    <td className="p-3 text-emerald-400">Ativo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO SUB-TAB AUDITORIA */}
      {activeSubTab === 'auditoria' && (
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-6 shadow-lg space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-asphalt-800 pb-3">
            <History className="w-4 h-4 text-safety-amber" />
            Registro Completo de Auditoria do Sistema
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-asphalt-950 text-asphalt-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Usuário</th>
                  <th className="p-3">Perfil</th>
                  <th className="p-3">Ação</th>
                  <th className="p-3">Detalhamento Auditável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-asphalt-800 text-asphalt-200">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-asphalt-800/50">
                    <td className="p-3 text-asphalt-400 whitespace-nowrap">{log.data_hora}</td>
                    <td className="p-3 font-bold text-white">{log.usuario}</td>
                    <td className="p-3 text-safety-amber">{log.nivel_permissao}</td>
                    <td className="p-3 font-bold text-emerald-400">{log.acao}</td>
                    <td className="p-3 text-asphalt-300 text-[11px]">{log.detalhes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
