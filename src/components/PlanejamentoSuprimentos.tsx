import React, { useState } from 'react';
import { Calculator, ArrowRight, Boxes, AlertCircle, ShoppingCart, Truck, CheckCircle2 } from 'lucide-react';
import { DashboardData } from '../types';
import { formatNumberBR, formatCurrencyBR } from '../utils/formatters';
import { FormulaTooltip } from './FormulaTooltip';

interface PlanejamentoSuprimentosProps {
  data: DashboardData | null;
  onSimulate: (modo: string, vol?: number) => Promise<any>;
}

export const PlanejamentoSuprimentos: React.FC<PlanejamentoSuprimentosProps> = ({ data, onSimulate }) => {
  const [desiredCBUQ, setDesiredCBUQ] = useState('1000');
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  if (!data) return null;

  const { obra, resumo, respostas_engenheiro } = data;

  const handleSimulateDesired = async () => {
    setSimLoading(true);
    const vol = parseFloat(desiredCBUQ.replace(/\./g, '').replace(',', '.')) || 1000;
    const res = await onSimulate('DESEJADO', vol);
    setSimResult(res);
    setSimLoading(false);
  };

  // Carga média típica de caminhão caçamba trucado/traçado (ex: 16 m³)
  const CARGA_MEDIA_M3 = 16.0;

  const b19Faltante = resumo.brita19.saldo_necessario_m3;
  const b12Faltante = resumo.brita12.saldo_necessario_m3;
  const poFaltante = resumo.po_pedra.saldo_necessario_m3;

  const cargasB19 = Math.ceil(b19Faltante / CARGA_MEDIA_M3);
  const cargasB12 = Math.ceil(b12Faltante / CARGA_MEDIA_M3);
  const cargasPo = Math.ceil(poFaltante / CARGA_MEDIA_M3);

  return (
    <div className="space-y-6">
      
      {/* HEADER DO MÓDULO */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Calculator className="w-5 h-5 text-safety-amber" />
            Planejamento de Suprimentos & Simulador de Produção
            <FormulaTooltip
              titulo="Cálculo de Necessidade Futura e Cargas"
              formula="Déficit Agregado (m³) = Necessidade Teórica Restante (m³) - Estoque Atual (m³)"
              explicacao="Determina exatamente o volume faltante a ser comprado da Pedreira MDG para concluir a meta de 14.000 m³ e estima a quantidade necessária de viagens/cargas de caminhão."
              exemplo="B12 faltante: 4.889,6 m³ / 16 m³ por caçamba = 306 viagens de caminhão recomendadas."
            />
          </h2>
          <p className="text-xs text-asphalt-400 mt-1">
            Projeções de compras, gargalos operacionais e simulação técnica para a Obra 177/25.
          </p>
        </div>
      </div>

      {/* 1. QUADRO DE PLANEJAMENTO DE COMPRAS PARA CONCLUIR OS 14.000 M³ */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-safety-amber" />
          Plano de Compras Recomendado para Saldo Restante de CBUQ ({formatNumberBR(obra.saldo_a_produzir_m3, 0)} m³)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-asphalt-950 text-asphalt-400 uppercase text-[10px] tracking-wider border-b border-asphalt-800">
              <tr>
                <th className="p-3">Agregado Material</th>
                <th className="p-3 text-right">Necessidade Restante (m³)</th>
                <th className="p-3 text-right">Estoque Disponível (m³)</th>
                <th className="p-3 text-right">Déficit a Comprar (m³)</th>
                <th className="p-3 text-right">Compra Recomendada (m³)</th>
                <th className="p-3 text-right">N° Estimado de Cargas (16m³)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-asphalt-800 text-asphalt-200">
              <tr className="hover:bg-asphalt-800/50">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Brita 19 mm
                </td>
                <td className="p-3 text-right font-bold text-white">{formatNumberBR(resumo.brita19.saldo_necessario_m3, 1)} m³</td>
                <td className="p-3 text-right text-amber-400">{formatNumberBR(resumo.brita19.estoque_m3, 1)} m³</td>
                <td className="p-3 text-right font-bold text-red-400">{formatNumberBR(b19Faltante, 1)} m³</td>
                <td className="p-3 text-right font-bold text-emerald-400">{formatNumberBR(b19Faltante, 1)} m³</td>
                <td className="p-3 text-right font-bold text-purple-300 flex items-center justify-end gap-1">
                  <Truck className="w-3.5 h-3.5" /> {cargasB19} cargas
                </td>
              </tr>
              <tr className="hover:bg-asphalt-800/50">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Brita 12 mm
                </td>
                <td className="p-3 text-right font-bold text-white">{formatNumberBR(resumo.brita12.saldo_necessario_m3, 1)} m³</td>
                <td className="p-3 text-right text-amber-400">{formatNumberBR(resumo.brita12.estoque_m3, 1)} m³</td>
                <td className="p-3 text-right font-bold text-red-400">{formatNumberBR(b12Faltante, 1)} m³</td>
                <td className="p-3 text-right font-bold text-emerald-400">{formatNumberBR(b12Faltante, 1)} m³</td>
                <td className="p-3 text-right font-bold text-purple-300 flex items-center justify-end gap-1">
                  <Truck className="w-3.5 h-3.5" /> {cargasB12} cargas
                </td>
              </tr>
              <tr className="hover:bg-asphalt-800/50">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Pó de Pedra
                </td>
                <td className="p-3 text-right font-bold text-white">{formatNumberBR(resumo.po_pedra.saldo_necessario_m3, 1)} m³</td>
                <td className="p-3 text-right text-amber-400">{formatNumberBR(resumo.po_pedra.estoque_m3, 1)} m³</td>
                <td className="p-3 text-right font-bold text-red-400">{formatNumberBR(poFaltante, 1)} m³</td>
                <td className="p-3 text-right font-bold text-emerald-400">{formatNumberBR(poFaltante, 1)} m³</td>
                <td className="p-3 text-right font-bold text-purple-300 flex items-center justify-end gap-1">
                  <Truck className="w-3.5 h-3.5" /> {cargasPo} cargas
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. FERRAMENTA: SIMULADOR DE PRODUÇÃO (MODO 1 E MODO 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* MODO 1: INFORMA VOLUME DESEJADO -> CALCULA NECESSIDADE */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="border-b border-asphalt-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Calculator className="w-4 h-4 text-safety-amber" />
              Simulador Modo 1: Produção Desejada de CBUQ
            </h3>
            <p className="text-[11px] text-asphalt-400 mt-1 font-mono">
              Informe o volume em m³ de CBUQ que deseja usinar para saber a necessidade exata de agregados.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-asphalt-400 text-[11px] font-mono block mb-1">Produção Desejada (m³):</label>
              <input
                type="text"
                value={desiredCBUQ}
                onChange={(e) => setDesiredCBUQ(e.target.value)}
                className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-safety-amber font-bold font-mono text-sm"
              />
            </div>
            <button
              onClick={handleSimulateDesired}
              disabled={simLoading}
              className="mt-5 px-4 py-2 bg-safety-amber text-asphalt-950 font-bold rounded-lg text-xs hover:bg-amber-500 font-mono"
            >
              Simular
            </button>
          </div>

          {simResult && (
            <div className="bg-asphalt-950 p-4 rounded-xl border border-asphalt-800 space-y-2 text-xs font-mono">
              <div className="text-asphalt-300 font-bold border-b border-asphalt-800 pb-1">
                Resultado para {formatNumberBR(simResult.volume_desejado_cbuq_m3, 0)} m³ de CBUQ:
              </div>
              <div className="flex justify-between"><span>• Brita 19 mm:</span><span className="text-white font-bold">{formatNumberBR(simResult.necessidade.brita19_m3, 1)} m³</span></div>
              <div className="flex justify-between"><span>• Brita 12 mm:</span><span className="text-white font-bold">{formatNumberBR(simResult.necessidade.brita12_m3, 1)} m³</span></div>
              <div className="flex justify-between"><span>• Pó de Pedra:</span><span className="text-white font-bold">{formatNumberBR(simResult.necessidade.po_pedra_m3, 1)} m³</span></div>
              <div className="flex justify-between border-t border-asphalt-800 pt-1 text-emerald-400 font-bold">
                <span>Total de Agregados:</span><span>{formatNumberBR(simResult.necessidade.total_agregados_m3, 1)} m³</span>
              </div>
              <div className="mt-2 text-[10px] text-asphalt-400">
                Status no estoque: {simResult.possivel_com_estoque ? (
                  <span className="text-emerald-400 font-bold">DISPONÍVEL NO ESTOQUE ATUAL!</span>
                ) : (
                  <span className="text-red-400 font-bold">ESTOQUE INSUFICIENTE (DÉFICIT DETECTADO)</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODO 2: INVERSO - COM ESTOQUE ATUAL, QUANTO CBUQ CONSIGO PRODUZIR? */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="border-b border-asphalt-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Boxes className="w-4 h-4 text-safety-amber" />
              Simulador Modo 2: Capacidade Máxima do Estoque Atual
            </h3>
            <p className="text-[11px] text-asphalt-400 mt-1 font-mono">
              Identifica o volume máximo de CBUQ usinável hoje e destaca o material gargalo da usina.
            </p>
          </div>

          <div className="bg-asphalt-950 p-4 rounded-xl border border-asphalt-800 space-y-3 font-mono">
            <div>
              <span className="text-xs text-asphalt-400 block">Produção Máxima Possível de CBUQ:</span>
              <span className="text-3xl font-black text-emerald-400 block mt-1">
                {formatNumberBR(respostas_engenheiro.producao_maxima_cbuq_estoque_m3, 0)} m³
              </span>
            </div>

            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <span className="text-[11px] text-red-400 font-bold block uppercase">Material Limitante / Gargalo Operacional:</span>
              <span className="text-sm font-extrabold text-white block mt-0.5 uppercase">
                {respostas_engenheiro.material_limitante}
              </span>
              <span className="text-[10px] text-red-300 block mt-1">
                O estoque atual deste material é o primeiro a esgotar, limitando a produção da usina.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
