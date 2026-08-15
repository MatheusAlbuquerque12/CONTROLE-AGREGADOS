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
import { DashboardData, Recebimento, FatorConversao, MovimentacaoEstoque, BoletimDiario, Usuario, AuditLog } from './types';
import { localStore } from './data/mockStore';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [userRole, setUserRole] = useState<'Admin' | 'Engenheiro' | 'Almoxarifado' | 'Consulta'>('Engenheiro');
  
  const [dashboardData, setDashboardData] = useState<DashboardData>(localStore.getDashboardData());
  const [loading, setLoading] = useState(false);

  const [recebimentos, setRecebimentos] = useState<Recebimento[]>(localStore.recebimentos);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>(localStore.movimentacoes);
  const [fatores, setFatores] = useState<FatorConversao[]>(localStore.fatores);
  const [boletins, setBoletins] = useState<BoletimDiario[]>(localStore.boletins);
  const [usuarios, setUsuarios] = useState<Usuario[]>(localStore.usuarios);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(localStore.auditLogs);

  // Carregar dados da API Express ou utilizar localStore fallback
  const fetchData = async () => {
    try {
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
      console.warn('API backend offline ou inacessível, utilizando dados locais resilientes:', err);
      // Fallback garantido
      setDashboardData(localStore.getDashboardData());
      setRecebimentos([...localStore.recebimentos]);
      setMovimentacoes([...localStore.movimentacoes]);
      setFatores([...localStore.fatores]);
      setBoletins([...localStore.boletins]);
      setUsuarios([...localStore.usuarios]);
      setAuditLogs([...localStore.auditLogs]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers para mutação de dados com suporte híbrido
  const handleAddRecebimento = async (novo: any) => {
    try {
      const res = await fetch('/api/recebimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...novo, usuario: userRole })
      });
      if (res.ok) {
        await fetchData();
        return;
      }
    } catch (e) {
      // Ignora erro de rede e salva localmente
    }

    // Salvar no localStore fallback
    const qtd = Number(novo.quantidade_original || 0);
    const pu = Number(novo.preco_unitario || 100);
    const item: Recebimento = {
      id: `rec-${Date.now()}`,
      data: novo.data,
      ticket: novo.ticket.toUpperCase(),
      fornecedor: novo.fornecedor || 'Pedreira MDG',
      material_id: novo.material_nome.includes('12') ? 'mat-brita-12' : novo.material_nome.includes('19') ? 'mat-brita-19' : 'mat-po-pedra',
      material_nome: novo.material_nome,
      quantidade_original: qtd,
      unidade_original: novo.unidade_original || 'm³',
      quantidade_m3: qtd,
      preco_unitario: pu,
      valor_total: qtd * pu,
      centro_custo: '177/25',
      responsavel_lancamento: novo.responsavel_lancamento || 'Engenheiro',
      observacao: novo.observacao || ''
    };
    localStore.recebimentos.unshift(item);
    setDashboardData(localStore.getDashboardData());
    setRecebimentos([...localStore.recebimentos]);
  };

  const handleDeleteRecebimento = async (id: string) => {
    try {
      await fetch(`/api/recebimentos/${id}`, { method: 'DELETE' });
    } catch (e) {}
    localStore.recebimentos = localStore.recebimentos.filter(r => r.id !== id);
    setDashboardData(localStore.getDashboardData());
    setRecebimentos([...localStore.recebimentos]);
  };

  const handleAjustarEstoque = async (dados: any) => {
    try {
      await fetch('/api/estoque/ajuste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dados, responsavel: `Perfil ${userRole}` })
      });
    } catch (e) {}
    const mov: MovimentacaoEstoque = {
      id: `mov-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      tipo: dados.tipo || 'AJUSTE',
      material_id: dados.material_id,
      material_nome: dados.material_id === 'mat-brita-12' ? 'BRITA 12 MM' : 'BRITA 19 MM',
      quantidade_m3: Number(dados.quantidade_m3),
      motivo: dados.motivo,
      responsavel: `Perfil ${userRole}`,
      observacao: dados.observacao || ''
    };
    localStore.movimentacoes.unshift(mov);
    setDashboardData(localStore.getDashboardData());
    setMovimentacoes([...localStore.movimentacoes]);
  };

  const handleAddFator = async (dados: any) => {
    try {
      await fetch('/api/fatores-conversao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
    } catch (e) {}
    const me = Number(dados.massa_especifica_t_m3);
    const fat: FatorConversao = {
      id: `fat-${Date.now()}`,
      material_id: dados.material_id || 'mat-brita-12',
      material_nome: dados.material_nome,
      massa_especifica_t_m3: me,
      m3_t: Number((1 / me).toFixed(4)),
      data_vigencia: new Date().toISOString().split('T')[0],
      fonte_fator: dados.fonte_fator || 'Laboratório Obra 177/25',
      responsavel: 'Engenheiro'
    };
    localStore.fatores.unshift(fat);
    setFatores([...localStore.fatores]);
  };

  const handleUpdateTraco = async (novoTraco: any) => {
    try {
      await fetch('/api/traco', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoTraco)
      });
    } catch (e) {}
    localStore.traco = { ...localStore.traco, ...novoTraco };
    setDashboardData(localStore.getDashboardData());
  };

  const handleAddBoletim = async (novoBda: any) => {
    try {
      await fetch('/api/boletim-diario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoBda)
      });
    } catch (e) {}
    const bda: BoletimDiario = {
      id: `bda-${novoBda.data || Date.now()}`,
      data: novoBda.data || new Date().toISOString().split('T')[0],
      producao_diaria_cbuq_m3: Number(novoBda.producao_diaria_cbuq_m3 || 0),
      brita19_consumida_m3: Number(novoBda.brita19_consumida_m3 || 0),
      brita12_consumida_m3: Number(novoBda.brita12_consumida_m3 || 0),
      po_pedra_consumido_m3: Number(novoBda.po_pedra_consumido_m3 || 0),
      total_agregados_consumidos_m3: Number(novoBda.brita19_consumida_m3 || 0) + Number(novoBda.brita12_consumida_m3 || 0) + Number(novoBda.po_pedra_consumido_m3 || 0),
      brita19_teorica_m3: Number(novoBda.producao_diaria_cbuq_m3 || 0) * 0.0567,
      brita12_teorica_m3: Number(novoBda.producao_diaria_cbuq_m3 || 0) * 0.4064,
      po_pedra_teorico_m3: Number(novoBda.producao_diaria_cbuq_m3 || 0) * 0.4725,
      observacoes: novoBda.observacoes || '',
      responsavel: novoBda.responsavel || 'Engenheiro'
    };
    localStore.boletins.unshift(bda);
    setDashboardData(localStore.getDashboardData());
    setBoletins([...localStore.boletins]);
  };

  const handleSimulate = async (modo: string, volume?: number) => {
    try {
      const res = await fetch('/api/simulador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo, volume_cbuq_desejado_m3: volume })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Fallback simulador
    const b19 = localStore.materiais.find(m => m.id === 'mat-brita-19')!;
    const b12 = localStore.materiais.find(m => m.id === 'mat-brita-12')!;
    const po = localStore.materiais.find(m => m.id === 'mat-po-pedra')!;

    if (modo === 'DESEJADO') {
      const vol = volume || 1000;
      const n19 = vol * 0.0567;
      const n12 = vol * 0.4064;
      const nPo = vol * 0.4725;
      return {
        volume_desejado_cbuq_m3: vol,
        necessidade: { brita19_m3: n19, brita12_m3: n12, po_pedra_m3: nPo, total_agregados_m3: n19 + n12 + nPo },
        estoque_disponivel: { brita19_m3: b19.estoque_atual, brita12_m3: b12.estoque_atual, po_pedra_m3: po.estoque_atual },
        deficit: { brita19_m3: Math.max(0, n19 - b19.estoque_atual), brita12_m3: Math.max(0, n12 - b12.estoque_atual), po_pedra_m3: Math.max(0, nPo - po.estoque_atual) },
        possivel_com_estoque: b19.estoque_atual >= n19 && b12.estoque_atual >= n12 && po.estoque_atual >= nPo
      };
    }
    return {};
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

          {activeTab === 'balanco' && (
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
