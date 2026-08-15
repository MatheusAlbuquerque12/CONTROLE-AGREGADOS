import React, { useState } from 'react';
import { DollarSign, BarChart3, Truck, Calendar, Layers, Search } from 'lucide-react';
import { DashboardData, Recebimento } from '../types';
import { formatNumberBR, formatCurrencyBR } from '../utils/formatters';
import { FormulaTooltip } from './FormulaTooltip';

interface CustosAnalisesProps {
  data: DashboardData | null;
  recebimentos: Recebimento[];
}

export const CustosAnalises: React.FC<CustosAnalisesProps> = ({ data, recebimentos }) => {
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);

  if (!data) return null;

  const { resumo } = data;

  // Análise de Cargas & Estatísticas de Tickets
  const totalTickets = recebimentos.length;
  const cargasBrita19 = recebimentos.filter(r => r.material_nome === 'BRITA 19 MM');
  const cargasBrita12 = recebimentos.filter(r => r.material_nome === 'BRITA 12 MM');
  const cargasPoPedra = recebimentos.filter(r => r.material_nome === 'PÓ DE PEDRA');

  const calcStats = (items: Recebimento[]) => {
    if (items.length === 0) return { media: 0, max: 0, min: 0, custoTotal: 0, puMedio: 0 };
    const qtds = items.map(i => i.quantidade_m3);
    const media = qtds.reduce((a, b) => a + b, 0) / items.length;
    const max = Math.max(...qtds);
    const min = Math.min(...qtds);
    const custoTotal = items.reduce((a, b) => a + b.valor_total, 0);
    const puMedio = items.reduce((a, b) => a + b.preco_unitario, 0) / items.length;
    return { media, max, min, custoTotal, puMedio };
  };

  const statsB19 = calcStats(cargasBrita19);
  const statsB12 = calcStats(cargasBrita12);
  const statsPo = calcStats(cargasPoPedra);

  // Agrupamento de tickets por data
  const ticketsPorData: { [date: string]: Recebimento[] } = {};
  recebimentos.forEach(r => {
    if (!ticketsPorData[r.data]) ticketsPorData[r.data] = [];
    ticketsPorData[r.data].push(r);
  });

  const datasOrdenadas = Object.keys(ticketsPorData).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      
      {/* HEADER DO MÓDULO */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-safety-amber" />
            Controle Financeiro & Análise de Cargas por Agregado
            <FormulaTooltip
              titulo="Custo Médio Ponderado por m³"
              formula="Preço Médio (R$/m³) = Valor Total Gasto (R$) / Volume Total Recebido (m³)"
              explicacao="Segrega estritamente o custo financeiro por especificação de material para evitar distorções entre agregados graúdos e miúdos."
              exemplo="Brita 12 mm: R$ 118.105,00 / 1.027,0 m³ = R$ 115,00/m³."
            />
          </h2>
          <p className="text-xs text-asphalt-400 mt-1">
            Demonstrativo de custos e auditoria de volumetria de caçambas por ticket.
          </p>
        </div>
      </div>

      {/* 1. QUADRO RESUMO DE CUSTOS SEPARADO POR ESPECIFICAÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* BRITA 19 MM */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-asphalt-800 pb-2">
            <span className="font-bold text-white uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> BRITA 19 MM
            </span>
            <span className="text-asphalt-400 text-[10px]">Espec. 3/4"</span>
          </div>
          <div className="space-y-1.5 text-asphalt-300">
            <div className="flex justify-between"><span>Custo Total Recebido:</span><span className="text-white font-bold">{formatCurrencyBR(statsB19.custoTotal)}</span></div>
            <div className="flex justify-between"><span>Preço Unitário Médio:</span><span className="text-emerald-400 font-bold">{formatCurrencyBR(statsB19.puMedio)} / m³</span></div>
            <div className="flex justify-between"><span>Total de Cargas:</span><span className="text-amber-400 font-bold">{cargasBrita19.length} tickets</span></div>
            <div className="flex justify-between border-t border-asphalt-800 pt-1.5"><span>Média por Carga:</span><span className="text-white">{formatNumberBR(statsB19.media, 1)} m³</span></div>
            <div className="flex justify-between"><span>Maior Carga:</span><span className="text-emerald-400">{formatNumberBR(statsB19.max, 1)} m³</span></div>
            <div className="flex justify-between"><span>Menor Carga:</span><span className="text-amber-400">{formatNumberBR(statsB19.min, 1)} m³</span></div>
          </div>
        </div>

        {/* BRITA 12 MM */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-asphalt-800 pb-2">
            <span className="font-bold text-white uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> BRITA 12 MM
            </span>
            <span className="text-asphalt-400 text-[10px]">Espec. 1/2"</span>
          </div>
          <div className="space-y-1.5 text-asphalt-300">
            <div className="flex justify-between"><span>Custo Total Recebido:</span><span className="text-white font-bold">{formatCurrencyBR(statsB12.custoTotal)}</span></div>
            <div className="flex justify-between"><span>Preço Unitário Médio:</span><span className="text-emerald-400 font-bold">{formatCurrencyBR(statsB12.puMedio)} / m³</span></div>
            <div className="flex justify-between"><span>Total de Cargas:</span><span className="text-amber-400 font-bold">{cargasBrita12.length} tickets</span></div>
            <div className="flex justify-between border-t border-asphalt-800 pt-1.5"><span>Média por Carga:</span><span className="text-white">{formatNumberBR(statsB12.media, 1)} m³</span></div>
            <div className="flex justify-between"><span>Maior Carga:</span><span className="text-emerald-400">{formatNumberBR(statsB12.max, 1)} m³</span></div>
            <div className="flex justify-between"><span>Menor Carga:</span><span className="text-amber-400">{formatNumberBR(statsB12.min, 1)} m³</span></div>
          </div>
        </div>

        {/* PÓ DE PEDRA */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-asphalt-800 pb-2">
            <span className="font-bold text-white uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> PÓ DE PEDRA
            </span>
            <span className="text-asphalt-400 text-[10px]">Espec. 0-4,75mm</span>
          </div>
          <div className="space-y-1.5 text-asphalt-300">
            <div className="flex justify-between"><span>Custo Total Recebido:</span><span className="text-white font-bold">{formatCurrencyBR(statsPo.custoTotal)}</span></div>
            <div className="flex justify-between"><span>Preço Unitário Médio:</span><span className="text-emerald-400 font-bold">{formatCurrencyBR(statsPo.puMedio)} / m³</span></div>
            <div className="flex justify-between"><span>Total de Cargas:</span><span className="text-amber-400 font-bold">{cargasPoPedra.length} tickets</span></div>
            <div className="flex justify-between border-t border-asphalt-800 pt-1.5"><span>Média por Carga:</span><span className="text-white">{formatNumberBR(statsPo.media, 1)} m³</span></div>
            <div className="flex justify-between"><span>Maior Carga:</span><span className="text-emerald-400">{formatNumberBR(statsPo.max, 1)} m³</span></div>
            <div className="flex justify-between"><span>Menor Carga:</span><span className="text-amber-400">{formatNumberBR(statsPo.min, 1)} m³</span></div>
          </div>
        </div>

      </div>

      {/* 2. TABELA DE RECEBIMENTOS AGRUPADA POR DATA (CLIQUE PARA VER TICKETS) */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-safety-amber" />
          Análise Diária de Entregas (Clique em uma Data para Detalhar Tickets)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-asphalt-950 text-asphalt-400 uppercase text-[10px] border-b border-asphalt-800">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3 text-right">N° de Tickets</th>
                <th className="p-3 text-right">Volume Total (m³)</th>
                <th className="p-3 text-right">Custo Total Diário</th>
                <th className="p-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-asphalt-800 text-asphalt-200">
              {datasOrdenadas.map((dt) => {
                const list = ticketsPorData[dt];
                const volDia = list.reduce((a, b) => a + b.quantidade_m3, 0);
                const custoDia = list.reduce((a, b) => a + b.valor_total, 0);
                return (
                  <tr key={dt} className="hover:bg-asphalt-800/50">
                    <td className="p-3 font-bold text-safety-amber">{dt}</td>
                    <td className="p-3 text-right font-bold text-white">{list.length} cargas</td>
                    <td className="p-3 text-right font-bold text-emerald-400">{formatNumberBR(volDia, 1)} m³</td>
                    <td className="p-3 text-right font-bold text-white">{formatCurrencyBR(custoDia)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedDateModal(dt)}
                        className="px-2.5 py-1 bg-asphalt-800 hover:bg-asphalt-700 text-safety-amber rounded text-[11px] font-semibold border border-asphalt-700"
                      >
                        Ver Tickets ({list.length})
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALHAMENTO DE TICKETS DA DATA */}
      {selectedDateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-asphalt-900 border border-asphalt-700 rounded-xl p-6 max-w-3xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-asphalt-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Truck className="w-4 h-4 text-safety-amber" />
                Tickets Recebidos na Data: <span className="text-safety-amber">{selectedDateModal}</span>
              </h3>
              <button
                onClick={() => setSelectedDateModal(null)}
                className="text-asphalt-400 hover:text-white text-xs font-mono"
              >
                Fechar [X]
              </button>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-asphalt-950 text-asphalt-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Ticket</th>
                    <th className="p-2">Agregado Material</th>
                    <th className="p-2 text-right">Qtd (m³)</th>
                    <th className="p-2 text-right">Preço Unit.</th>
                    <th className="p-2 text-right">Valor Total</th>
                    <th className="p-2">Lançador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-asphalt-800 text-asphalt-200">
                  {ticketsPorData[selectedDateModal]?.map((t) => (
                    <tr key={t.id}>
                      <td className="p-2 font-bold text-safety-amber">{t.ticket}</td>
                      <td className="p-2 text-white">{t.material_nome}</td>
                      <td className="p-2 text-right font-bold text-emerald-400">{formatNumberBR(t.quantidade_m3, 1)} m³</td>
                      <td className="p-2 text-right">{formatCurrencyBR(t.preco_unitario)}</td>
                      <td className="p-2 text-right font-bold text-white">{formatCurrencyBR(t.valor_total)}</td>
                      <td className="p-2 text-asphalt-400">{t.responsavel_lancamento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right pt-2 border-t border-asphalt-800">
              <button
                onClick={() => setSelectedDateModal(null)}
                className="px-4 py-2 bg-asphalt-800 text-asphalt-200 rounded text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
