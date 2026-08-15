import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Recebimentos } from './components/Recebimentos';
import { Estoque } from './components/Estoque';
import { ConsumoBalanco } from './components/ConsumoBalanco';
import { TracoConfig } from './components/TracoConfig';
import { PlanejamentoSuprimentos } from './components/PlanejamentoSuprimentos';
import { CustosAnalises } from './components/CustosAnalises';
import { Relatorios } from './components/Relatorios';
import { CadastrosAuditoria } from './components/CadastrosAuditoria';
import { DashboardData, Recebimento, Material, FatorConversao, MovimentacaoEstoque, BoletimDiario, Usuario, AuditLog } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [userRole, setUserRole] = useState<'Admin' | 'Engenheiro' | 'Almoxarifado' | 'Consulta'>('Engenheiro');
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [fatores, setFatores] = useState<FatorConversao[]>([]);
  const [boletins, setBoletins] = useState<BoletimDiario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Carregar todos os dados da API Express backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, recRes, movRes, fontRes, bdaRes, usrRes, auditRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/recebimentos'),
        fetch('/api/estoque/movimentacoes'),
        fetch('/api/fatores-conversao'),
        fetch('/api/boletim-diario'),
        fetch('/api/usuarios'),
        fetch('/api/audit-logs')
      ]);

      if (dashRes.ok) setDashboardData(await dashRes.json());
      if (recRes.ok) setRecebimentos(await recRes.json());
      if (movRes.ok) setMovimentacoes(await movRes.json());
      if (fontRes.ok) setFatores(await fontRes.json());
      if (bdaRes.ok) setBoletins(await bdaRes.json());
      if (usrRes.ok) setUsuarios(await usrRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
    } catch (err) {
      console.error('Erro ao conectar com API Backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers para mutação de dados
  const handleAddRecebimento = async (novo: any) => {
    const res = await fetch('/api/recebimentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...novo, usuario: userRole })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao cadastrar ticket.');
    }
    await fetchData();
  };

  const handleDeleteRecebimento = async (id: string) => {
    await fetch(`/api/recebimentos/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  const handleAjustarEstoque = async (dados: any) => {
    const res = await fetch('/api/estoque/ajuste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...dados, responsavel: `Perfil ${userRole}` })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao ajustar estoque.');
    }
    await fetchData();
  };

  const handleAddFator = async (dados: any) => {
    await fetch('/api/fatores-conversao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    await fetchData();
  };

  const handleUpdateTraco = async (novoTraco: any) => {
    await fetch('/api/traco', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoTraco)
    });
    await fetchData();
  };

  const handleAddBoletim = async (novoBda: any) => {
    await fetch('/api/boletim-diario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoBda)
    });
    await fetchData();
  };

  const handleSimulate = async (modo: string, volume?: number) => {
    const res = await fetch('/api/simulador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modo, volume_cbuq_desejado_m3: volume })
    });
    return await res.json();
  };

  const alertCount = dashboardData?.alertas ? dashboardData.alertas.filter(a => a.tipo !== 'OK').length : 0;

  return (
    <div className="min-h-screen bg-asphalt-950 text-asphalt-100 flex flex-col font-sans">
      {/* Header Corporativo */}
      <Header
        currentRole={userRole}
        onRoleChange={setUserRole}
        metaCBUQ={dashboardData?.obra?.producao_prevista_m3 || 14000}
        producaoRealizada={dashboardData?.obra?.producao_realizada_m3 || 0}
      />

      {/* Conteúdo Principal com Sidebar + Módulos */}
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          alertCount={alertCount}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              data={dashboardData}
              loading={loading}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'recebimentos' && (
            <Recebimentos
              recebimentos={recebimentos}
              userRole={userRole}
              onAddRecebimento={handleAddRecebimento}
              onDeleteRecebimento={handleDeleteRecebimento}
            />
          )}

          {activeTab === 'estoque' && (
            <Estoque
              materiais={dashboardData?.materiais || []}
              fatores={fatores}
              movimentacoes={movimentacoes}
              userRole={userRole}
              onAjustarEstoque={handleAjustarEstoque}
              onAddFator={handleAddFator}
            />
          )}

          {(activeTab === 'balanco' || activeTab === 'traco' && false) && (
            <ConsumoBalanco
              data={dashboardData}
              boletins={boletins}
              userRole={userRole}
              onAddBoletim={handleAddBoletim}
            />
          )}

          {activeTab === 'traco' && (
            <TracoConfig
              traco={dashboardData?.traco || null}
              userRole={userRole}
              onUpdateTraco={handleUpdateTraco}
            />
          )}

          {activeTab === 'planejamento' && (
            <PlanejamentoSuprimentos
              data={dashboardData}
              onSimulate={handleSimulate}
            />
          )}

          {activeTab === 'custos' && (
            <CustosAnalises
              data={dashboardData}
              recebimentos={recebimentos}
            />
          )}

          {activeTab === 'relatorios' && (
            <Relatorios
              data={dashboardData}
              recebimentos={recebimentos}
              boletins={boletins}
            />
          )}

          {activeTab === 'cadastros' && (
            <CadastrosAuditoria
              usuarios={usuarios}
              auditLogs={auditLogs}
              obra={dashboardData?.obra}
            />
          )}

          {activeTab === 'auditoria' && (
            <CadastrosAuditoria
              usuarios={usuarios}
              auditLogs={auditLogs}
              obra={dashboardData?.obra}
            />
          )}
        </main>
      </div>
    </div>
  );
}
