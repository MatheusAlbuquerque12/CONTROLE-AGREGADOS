import React, { useState } from 'react';
import { Scale, Plus, Calendar, AlertTriangle, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { BoletimDiario, DashboardData } from '../types';
import { formatNumberBR, formatPercentBR } from '../utils/formatters';
import { FormulaTooltip } from './FormulaTooltip';

interface ConsumoBalancoProps {
  data: DashboardData | null;
  boletins: BoletimDiario[];
  userRole: string;
  onAddBoletim: (novo: any) => Promise<void>;
}

export const ConsumoBalanco: React.FC<ConsumoBalancoProps> = ({
  data,
  boletins,
  userRole,
  onAddBoletim
}) => {
  const [isBdaOpen, setIsBdaOpen] = useState(false);
  const [bdaForm, setBdaForm] = useState({
    data: new Date().toISOString().split('T')[0],
    producao_diaria_cbuq_m3: '450,0',
    brita19_consumida_m3: '',
    brita12_consumida_m3: '',
    po_pedra_consumido_m3: '',
    observacoes: '',
    responsavel: 'Eng. Gabriel Laboratório'
  });

  if (!data) return null;

  const { resumo, obra } = data;
  const canEdit = ['Admin', 'Engenheiro'].includes(userRole);

  // Fórmulas de Desvio de Consumo Real vs Teórico
  const calcDesvio = (real: number, teorico: number) => {
    if (!teorico || teorico === 0) return 0;
    return ((real - teorico) / teorico) * 100;
  };

  // Consumos Acumulados para a Produção Realizada Atual
  const cbuqRealizado = obra.producao_realizada_m3 || 1;
  const teoricoAcumB19 = cbuqRealizado * 0.0567;
  const teoricoAcumB12 = cbuqRealizado * 0.4064;
  const teoricoAcumPo = cbuqRealizado * 0.4725;

  const desvioB19 = calcDesvio(resumo.brita19.consumido_m3, teoricoAcumB19);
  const desvioB12 = calcDesvio(resumo.brita12.consumido_m3, teoricoAcumB12);
  const desvioPo = calcDesvio(resumo.po_pedra.consumido_m3, teoricoAcumPo);

  const getStatusBadge = (desvio: number) => {
    const abs = Math.abs(desvio);
    if (abs <= 3) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
          <CheckCircle2 className="w-3 h-3" /> Dentro do Esperado ({formatPercentBR(desvio, 1)})
        </span>
      );
    }
    if (abs <= 5) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
          <AlertCircle className="w-3 h-3" /> Atenção ({formatPercentBR(desvio, 1)})
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit animate-pulse">
        <AlertTriangle className="w-3 h-3" /> Desvio Crítico ({formatPercentBR(desvio, 1)})
      </span>
    );
  };

  const handleBdaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parseVal = (str: string) => (str ? parseFloat(str.replace(/\./g, '').replace(',', '.')) : 0);

    await onAddBoletim({
      data: bdaForm.data,
      producao_diaria_cbuq_m3: parseVal(bdaForm.producao_diaria_cbuq_m3),
      brita19_consumida_m3: bdaForm.brita19_consumida_m3 ? parseVal(bdaForm.brita19_consumida_m3) : undefined,
      brita12_consumida_m3: bdaForm.brita12_consumida_m3 ? parseVal(bdaForm.brita12_consumida_m3) : undefined,
      po_pedra_consumido_m3: bdaForm.po_pedra_consumido_m3 ? parseVal(bdaForm.po_pedra_consumido_m3) : undefined,
      observacoes: bdaForm.observacoes,
      responsavel: bdaForm.responsavel
    });
    setIsBdaOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DO MÓDULO */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Scale className="w-5 h-5 text-safety-amber" />
            Balanço do Traço (Consumo Teórico x Consumo Real)
            <FormulaTooltip
              titulo="Indicador de Desvio de Traço"
              formula="Desvio (%) = [(Consumo Real - Consumo Teórico) / Consumo Teórico] × 100"
              explicacao="Calcula a variação percentual entre a quantidade real consumida de cada agregado na usina de asfalto e a quantidade teórica projetada pelo traço."
              exemplo="Se a Brita 12mm teve consumo real de 204 m³ e teórico de 203,2 m³: Desvio = [(204 - 203,2) / 203,2] × 100 = +0,39% (Normal)."
            />
          </h2>
          <p className="text-xs text-asphalt-400 mt-1">
            Controle tecnológico do traço de CBUQ e apontamentos no Boletim Diário de Agregados (BDA).
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsBdaOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-asphalt-950 rounded-lg text-xs font-extrabold flex items-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Lançar Boletim Diário (BDA)
          </button>
        )}
      </div>

      {/* TABELA 1: BALANÇO DE AGREGADOS (ACUMULADO) */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-safety-amber" />
          Quadro Balanço Geral do Traço (Para Produção Acumulada de {formatNumberBR(cbuqRealizado, 0)} m³ de CBUQ)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-asphalt-950 text-asphalt-400 uppercase text-[10px] tracking-wider border-b border-asphalt-800">
              <tr>
                <th className="p-3">Material Agregado</th>
                <th className="p-3 text-right">Traço (%)</th>
                <th className="p-3 text-right">Consumo Teórico (m³)</th>
                <th className="p-3 text-right">Volume Recebido (m³)</th>
                <th className="p-3 text-right">Consumo Real (m³)</th>
                <th className="p-3 text-right">Estoque Atual (m³)</th>
                <th className="p-3 text-right">Diferença (m³)</th>
                <th className="p-3">Indicador de Desvio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-asphalt-800 text-asphalt-200">
              <tr className="hover:bg-asphalt-800/50">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Brita 19 mm
                </td>
                <td className="p-3 text-right">5,67%</td>
                <td className="p-3 text-right font-bold text-blue-400">{formatNumberBR(teoricoAcumB19, 1)} m³</td>
                <td className="p-3 text-right text-emerald-400">{formatNumberBR(resumo.brita19.recebido_m3, 1)} m³</td>
                <td className="p-3 text-right font-bold text-amber-400">{formatNumberBR(resumo.brita19.consumido_m3, 1)} m³</td>
                <td className="p-3 text-right text-purple-300">{formatNumberBR(resumo.brita19.estoque_m3, 1)} m³</td>
                <td className="p-3 text-right font-bold">{formatNumberBR(resumo.brita19.consumido_m3 - teoricoAcumB19, 1)} m³</td>
                <td className="p-3">{getStatusBadge(desvioB19)}</td>
              </tr>
              <tr className="hover:bg-asphalt-800/50">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Brita 12 mm
                </td>
                <td className="p-3 text-right">40,64%</td>
                <td className="p-3 text-right font-bold text-blue-400">{formatNumberBR(teoricoAcumB12, 1)} m³</td>
                <td className="p-3 text-right text-emerald-400">{formatNumberBR(resumo.brita12.recebido_m3, 1)} m³</td>
                <td className="p-3 text-right font-bold text-amber-400">{formatNumberBR(resumo.brita12.consumido_m3, 1)} m³</td>
                <td className="p-3 text-right text-purple-300">{formatNumberBR(resumo.brita12.estoque_m3, 1)} m³</td>
                <td className="p-3 text-right font-bold">{formatNumberBR(resumo.brita12.consumido_m3 - teoricoAcumB12, 1)} m³</td>
                <td className="p-3">{getStatusBadge(desvioB12)}</td>
              </tr>
              <tr className="hover:bg-asphalt-800/50">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Pó de Pedra
                </td>
                <td className="p-3 text-right">47,25%</td>
                <td className="p-3 text-right font-bold text-blue-400">{formatNumberBR(teoricoAcumPo, 1)} m³</td>
                <td className="p-3 text-right text-emerald-400">{formatNumberBR(resumo.po_pedra.recebido_m3, 1)} m³</td>
                <td className="p-3 text-right font-bold text-amber-400">{formatNumberBR(resumo.po_pedra.consumido_m3, 1)} m³</td>
                <td className="p-3 text-right text-purple-300">{formatNumberBR(resumo.po_pedra.estoque_m3, 1)} m³</td>
                <td className="p-3 text-right font-bold">{formatNumberBR(resumo.po_pedra.consumido_m3 - teoricoAcumPo, 1)} m³</td>
                <td className="p-3">{getStatusBadge(desvioPo)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TABELA 2: HISTÓRICO DE BOLETINS DIÁRIOS DE AGREGADOS (BDA) */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-safety-amber" />
          Histórico dos Boletins Diários de Agregados (BDA) Lançados
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-asphalt-950 text-asphalt-400 uppercase text-[10px] border-b border-asphalt-800">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3 text-right">Prod. CBUQ (m³)</th>
                <th className="p-3 text-right">Brita 19 Real (Teór.)</th>
                <th className="p-3 text-right">Brita 12 Real (Teór.)</th>
                <th className="p-3 text-right">Pó Pedra Real (Teór.)</th>
                <th className="p-3 text-right">Total Consumido</th>
                <th className="p-3">Observações</th>
                <th className="p-3">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-asphalt-800 text-asphalt-200">
              {boletins.map((b) => (
                <tr key={b.id} className="hover:bg-asphalt-800/50">
                  <td className="p-3 font-bold text-safety-amber">{b.data}</td>
                  <td className="p-3 text-right font-bold text-white">{formatNumberBR(b.producao_diaria_cbuq_m3, 1)} m³</td>
                  <td className="p-3 text-right text-asphalt-300">{formatNumberBR(b.brita19_consumida_m3, 1)} <span className="text-[10px] text-asphalt-500">({formatNumberBR(b.brita19_teorica_m3, 1)})</span></td>
                  <td className="p-3 text-right text-asphalt-300">{formatNumberBR(b.brita12_consumida_m3, 1)} <span className="text-[10px] text-asphalt-500">({formatNumberBR(b.brita12_teorica_m3, 1)})</span></td>
                  <td className="p-3 text-right text-asphalt-300">{formatNumberBR(b.po_pedra_consumido_m3, 1)} <span className="text-[10px] text-asphalt-500">({formatNumberBR(b.po_pedra_teorico_m3, 1)})</span></td>
                  <td className="p-3 text-right font-bold text-emerald-400">{formatNumberBR(b.total_agregados_consumidos_m3, 1)} m³</td>
                  <td className="p-3 text-asphalt-400 text-[11px]">{b.observacoes || '-'}</td>
                  <td className="p-3 text-asphalt-400">{b.responsavel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVO BOLETIM DIÁRIO */}
      {isBdaOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-asphalt-900 border border-asphalt-700 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2 border-b border-asphalt-800 pb-3">
              <Plus className="w-4 h-4 text-safety-amber" />
              Lançar Boletim Diário de Agregados (BDA)
            </h3>
            <form onSubmit={handleBdaSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-asphalt-400 block mb-1">Data da Produção</label>
                  <input
                    type="date"
                    value={bdaForm.data}
                    onChange={(e) => setBdaForm({ ...bdaForm, data: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-asphalt-400 block mb-1">Produção Diária CBUQ (m³) *</label>
                  <input
                    type="text"
                    value={bdaForm.producao_diaria_cbuq_m3}
                    onChange={(e) => setBdaForm({ ...bdaForm, producao_diaria_cbuq_m3: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-safety-amber font-bold"
                  />
                </div>
              </div>

              <div className="bg-asphalt-950 p-3 rounded border border-asphalt-800 text-[11px] text-asphalt-400">
                Se deixar os consumos de agregados em branco, o sistema calculará automaticamente com base no traço oficial (5,67% Brita 19, 40,64% Brita 12, 47,25% Pó de Pedra).
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-asphalt-400 block mb-1">Brita 19 Real (m³)</label>
                  <input
                    type="text"
                    placeholder="Teórico auto"
                    value={bdaForm.brita19_consumida_m3}
                    onChange={(e) => setBdaForm({ ...bdaForm, brita19_consumida_m3: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-asphalt-400 block mb-1">Brita 12 Real (m³)</label>
                  <input
                    type="text"
                    placeholder="Teórico auto"
                    value={bdaForm.brita12_consumida_m3}
                    onChange={(e) => setBdaForm({ ...bdaForm, brita12_consumida_m3: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-asphalt-400 block mb-1">Pó Pedra Real (m³)</label>
                  <input
                    type="text"
                    placeholder="Teórico auto"
                    value={bdaForm.po_pedra_consumido_m3}
                    onChange={(e) => setBdaForm({ ...bdaForm, po_pedra_consumido_m3: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-asphalt-400 block mb-1">Observações da Usina / Estaca</label>
                <input
                  type="text"
                  placeholder="Ex: Aplicação no KM 14+500"
                  value={bdaForm.observacoes}
                  onChange={(e) => setBdaForm({ ...bdaForm, observacoes: e.target.value })}
                  className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-asphalt-800">
                <button
                  type="button"
                  onClick={() => setIsBdaOpen(false)}
                  className="px-4 py-2 bg-asphalt-800 text-asphalt-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-safety-amber text-asphalt-950 font-bold rounded"
                >
                  Salvar BDA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
