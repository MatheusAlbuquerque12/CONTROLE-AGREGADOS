import React, { useState } from 'react';
import { Sliders, Check, AlertCircle, Plus, Info } from 'lucide-react';
import { TracoConfig as TracoType } from '../types';
import { formatNumberBR, formatPercentBR } from '../utils/formatters';
import { FormulaTooltip } from './FormulaTooltip';

interface TracoConfigProps {
  traco: TracoType | null;
  userRole: string;
  onUpdateTraco: (novoTraco: any) => Promise<void>;
}

export const TracoConfig: React.FC<TracoConfigProps> = ({ traco, userRole, onUpdateTraco }) => {
  if (!traco) return null;

  const [b19Pct, setB19Pct] = useState(traco.itens.find(i => i.material_id === 'mat-brita-19')?.percentual.toString() || '5,67');
  const [b12Pct, setB12Pct] = useState(traco.itens.find(i => i.material_id === 'mat-brita-12')?.percentual.toString() || '40,64');
  const [poPct, setPoPct] = useState(traco.itens.find(i => i.material_id === 'mat-po-pedra')?.percentual.toString() || '47,25');
  const [baseCalculo, setBaseCalculo] = useState<'Volume' | 'Massa'>(traco.base_calculo || 'Volume');
  const [densidadeMistura, setDensidadeMistura] = useState(traco.densidade_mistura_t_m3?.toString() || '2,40');
  const [obs, setObs] = useState(traco.observacoes || '');
  const [successMsg, setSuccessMsg] = useState('');

  const canEdit = ['Admin', 'Engenheiro'].includes(userRole);

  const parseVal = (str: string) => parseFloat(str.replace(/\./g, '').replace(',', '.'));

  const currentB19 = parseVal(b19Pct) || 0;
  const currentB12 = parseVal(b12Pct) || 0;
  const currentPo = parseVal(poPct) || 0;

  const somaAgregados = Number((currentB19 + currentB12 + currentPo).toFixed(2));
  const saldoRestante = Number((100 - somaAgregados).toFixed(2));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');

    try {
      await onUpdateTraco({
        percentual_agregados_configurado: somaAgregados,
        base_calculo: baseCalculo,
        densidade_mistura_t_m3: parseVal(densidadeMistura),
        responsavel: 'Eng. Plínio Cavalcanti Jr.',
        observacoes: obs,
        itens: [
          { material_id: 'mat-brita-19', nome: 'BRITA 19 MM', percentual: currentB19, participa_traco: 1 },
          { material_id: 'mat-brita-12', nome: 'BRITA 12 MM', percentual: currentB12, participa_traco: 1 },
          { material_id: 'mat-po-pedra', nome: 'PÓ DE PEDRA', percentual: currentPo, participa_traco: 1 }
        ]
      });
      setSuccessMsg('Traço CBUQ atualizado com sucesso no banco de dados!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert('Erro ao atualizar traço.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DO MÓDULO */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Sliders className="w-5 h-5 text-safety-amber" />
            Configuração do Traço de CBUQ (Engenharia Rodoviária)
            <FormulaTooltip
              titulo="Cálculo Volumétrico do Traço"
              formula="Volume Agregado (m³) = Volume CBUQ (m³) × (% Traço Agregado / 100)"
              explicacao="Aplica diretamente as porcentagens granulométricas do traço homologado sobre o volume total previsto de CBUQ."
              exemplo="Para 14.000 m³ CBUQ: Brita 19 (5,67%) = 793,80 m³ | Brita 12 (40,64%) = 5.689,60 m³ | Pó de Pedra (47,25%) = 6.615,00 m³."
            />
          </h2>
          <p className="text-xs text-asphalt-400 mt-1">
            Parametrização dos percentuais da mistura asfáltica para a Obra 177/25 (BR-423/PE).
          </p>
        </div>
      </div>

      {/* BANNER DE AVISO RIGOROSO EXIGIDO PELO PROMPT (#4) */}
      <div className="bg-asphalt-900 border-2 border-amber-500/50 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-safety-amber uppercase tracking-wider">
            Status do Traço Homologado
          </span>
          <span className="text-xs font-mono text-asphalt-400">Faixa C DNIT - CBUQ Rolamento</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-asphalt-950 p-4 rounded-lg border border-asphalt-800">
            <span className="text-xs text-asphalt-400 block font-mono">Total Agregados Configurados:</span>
            <span className="text-2xl font-black text-safety-amber font-mono mt-1 block">
              Percentual de agregados configurado: {formatPercentBR(somaAgregados)}
            </span>
            <span className="text-[11px] text-asphalt-500 font-mono mt-1 block">
              Brita 19 mm ({b19Pct}%) + Brita 12 mm ({b12Pct}%) + Pó de Pedra ({poPct}%)
            </span>
          </div>

          <div className="bg-asphalt-950 p-4 rounded-lg border border-asphalt-800">
            <span className="text-xs text-asphalt-400 block font-mono">Componentes Não Parametrizados:</span>
            <span className="text-xl font-bold text-amber-300 font-mono mt-1 block">
              Percentual restante do traço: {formatPercentBR(saldoRestante)} — não parametrizado.
            </span>
            <span className="text-[11px] text-asphalt-500 font-mono mt-1 block">
              Refere-se ao Cimento Asfáltico de Petróleo (CAP/AMP), Filler e Aditivos a serem cadastrados futuramente.
            </span>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO DE PARAMETRIZAÇÃO DO TRAÇO */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-6 shadow-lg">
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2 font-mono">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs font-mono">
          
          {/* BASE DE CÁLCULO DO TRAÇO */}
          <div className="bg-asphalt-950 p-4 rounded-xl border border-asphalt-800 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Base de Cálculo do Traço
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                baseCalculo === 'Volume'
                  ? 'bg-amber-500/10 border-safety-amber text-white'
                  : 'bg-asphalt-900 border-asphalt-800 text-asphalt-400'
              }`}>
                <input
                  type="radio"
                  name="baseCalculo"
                  value="Volume"
                  checked={baseCalculo === 'Volume'}
                  onChange={() => setBaseCalculo('Volume')}
                  className="mt-0.5 text-safety-amber focus:ring-0"
                />
                <div>
                  <span className="font-bold text-xs block text-white">Modalidade por Volume (m³)</span>
                  <span className="text-[11px] text-asphalt-400 leading-relaxed block mt-0.5">
                    Aplica os percentuais diretamente sobre o volume total de m³ de CBUQ.
                  </span>
                </div>
              </label>

              <label className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                baseCalculo === 'Massa'
                  ? 'bg-amber-500/10 border-safety-amber text-white'
                  : 'bg-asphalt-900 border-asphalt-800 text-asphalt-400'
              }`}>
                <input
                  type="radio"
                  name="baseCalculo"
                  value="Massa"
                  checked={baseCalculo === 'Massa'}
                  onChange={() => setBaseCalculo('Massa')}
                  className="mt-0.5 text-safety-amber focus:ring-0"
                />
                <div>
                  <span className="font-bold text-xs block text-white">Modalidade por Massa (Toneladas / Densidade)</span>
                  <span className="text-[11px] text-asphalt-400 leading-relaxed block mt-0.5">
                    Exige a densidade/massa específica antes da conversão volumétrica.
                  </span>
                </div>
              </label>
            </div>

            {baseCalculo === 'Massa' && (
              <div className="mt-3 p-3 bg-asphalt-900 rounded border border-asphalt-700 flex items-center gap-3">
                <span className="text-asphalt-300">Densidade/Massa Específica da Mistura Asfáltica (t/m³):</span>
                <input
                  type="text"
                  value={densidadeMistura}
                  onChange={(e) => setDensidadeMistura(e.target.value)}
                  className="bg-asphalt-950 border border-asphalt-800 rounded p-1.5 text-safety-amber font-bold w-24 text-center"
                />
              </div>
            )}
          </div>

          {/* PERCENTUAIS DOS AGREGADOS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Percentuais dos Agregados no Traço
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-asphalt-950 p-4 rounded-xl border border-asphalt-800">
                <span className="text-xs font-bold text-blue-400 block mb-1">BRITA 19 MM</span>
                <span className="text-[11px] text-asphalt-400 block mb-2">Agregado Graúdo 3/4"</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={b19Pct}
                    onChange={(e) => setB19Pct(e.target.value)}
                    disabled={!canEdit}
                    className="w-full bg-asphalt-900 border border-asphalt-700 rounded p-2 text-white font-bold text-center text-sm focus:border-safety-amber"
                  />
                  <span className="text-asphalt-300 font-bold">%</span>
                </div>
              </div>

              <div className="bg-asphalt-950 p-4 rounded-xl border border-asphalt-800">
                <span className="text-xs font-bold text-amber-400 block mb-1">BRITA 12 MM</span>
                <span className="text-[11px] text-asphalt-400 block mb-2">Agregado Graúdo 1/2"</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={b12Pct}
                    onChange={(e) => setB12Pct(e.target.value)}
                    disabled={!canEdit}
                    className="w-full bg-asphalt-900 border border-asphalt-700 rounded p-2 text-white font-bold text-center text-sm focus:border-safety-amber"
                  />
                  <span className="text-asphalt-300 font-bold">%</span>
                </div>
              </div>

              <div className="bg-asphalt-950 p-4 rounded-xl border border-asphalt-800">
                <span className="text-xs font-bold text-purple-400 block mb-1">PÓ DE PEDRA</span>
                <span className="text-[11px] text-asphalt-400 block mb-2">Agregado Miúdo</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={poPct}
                    onChange={(e) => setPoPct(e.target.value)}
                    disabled={!canEdit}
                    className="w-full bg-asphalt-900 border border-asphalt-700 rounded p-2 text-white font-bold text-center text-sm focus:border-safety-amber"
                  />
                  <span className="text-asphalt-300 font-bold">%</span>
                </div>
              </div>

            </div>
          </div>

          <div>
            <label className="text-asphalt-400 block mb-1">Observações da Engenharia de Solos/Asfalto</label>
            <textarea
              rows={3}
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              disabled={!canEdit}
              className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-3 text-white"
            />
          </div>

          {canEdit && (
            <div className="flex justify-end pt-4 border-t border-asphalt-800">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-asphalt-950 font-extrabold rounded-lg text-xs shadow-lg transition-all"
              >
                Salvar Traço Homologado
              </button>
            </div>
          )}

        </form>
      </div>

    </div>
  );
};
