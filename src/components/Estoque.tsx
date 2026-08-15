import React, { useState } from 'react';
import { Boxes, RefreshCw, AlertTriangle, ArrowUpRight, ArrowDownLeft, ShieldCheck, Scale, Plus } from 'lucide-react';
import { Material, FatorConversao, MovimentacaoEstoque } from '../types';
import { formatNumberBR } from '../utils/formatters';
import { FormulaTooltip } from './FormulaTooltip';

interface EstoqueProps {
  materiais: Material[];
  fatores: FatorConversao[];
  movimentacoes: MovimentacaoEstoque[];
  userRole: string;
  onAjustarEstoque: (dados: any) => Promise<void>;
  onAddFator: (dados: any) => Promise<void>;
}

export const Estoque: React.FC<EstoqueProps> = ({
  materiais,
  fatores,
  movimentacoes,
  userRole,
  onAjustarEstoque,
  onAddFator
}) => {
  const [isAjusteOpen, setIsAjusteOpen] = useState(false);
  const [isFatorOpen, setIsFatorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Ajuste
  const [ajusteForm, setAjusteForm] = useState({
    material_id: 'mat-brita-12',
    tipo: 'AJUSTE',
    quantidade_m3: '',
    motivo: '',
    responsavel: 'Eng. Responsável',
    observacao: ''
  });

  // Form Fator
  const [fatorForm, setFatorForm] = useState({
    material_id: 'mat-brita-12',
    material_nome: 'BRITA 12 MM',
    massa_especifica_t_m3: '1,50',
    fonte_fator: 'Laboratório de Solos e Asfalto Obra 177/25 - NBR 7809',
    responsavel: 'Eng. Gabriel Laboratório'
  });

  const canEdit = ['Admin', 'Engenheiro'].includes(userRole);

  const handleAjusteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!ajusteForm.motivo.trim() || !ajusteForm.quantidade_m3) {
      setErrorMsg('O motivo da alteração e a quantidade são obrigatórios para fins de auditoria.');
      return;
    }

    try {
      await onAjustarEstoque({
        ...ajusteForm,
        quantidade_m3: parseFloat(ajusteForm.quantidade_m3.replace(',', '.'))
      });
      setIsAjusteOpen(false);
      setAjusteForm({
        material_id: 'mat-brita-12',
        tipo: 'AJUSTE',
        quantidade_m3: '',
        motivo: '',
        responsavel: 'Eng. Responsável',
        observacao: ''
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar ajuste de estoque.');
    }
  };

  const handleFatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const me = parseFloat(fatorForm.massa_especifica_t_m3.replace(',', '.'));
    await onAddFator({
      ...fatorForm,
      massa_especifica_t_m3: me
    });
    setIsFatorOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DO MÓDULO */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Boxes className="w-5 h-5 text-safety-amber" />
            Controle de Estoque & Fatores de Conversão
            <FormulaTooltip
              titulo="Cálculo do Estoque Atual"
              formula="Estoque Atual = (Total Recebido m³) - (Total Consumido Usina m³) + (Ajustes/Perdas m³)"
              explicacao="O estoque físico do canteiro é mantido atualizado em m³ via saldo acumulado de tickets de recebimento abatido dos boletins diários de produção da usina."
              exemplo="Brita 12 mm: 1.027,0 m³ recebidos - 585,5 m³ consumidos = 441,5 m³ saldo em estoque."
            />
          </h2>
          <p className="text-xs text-asphalt-400 mt-1">
            Gestão física e auditoria de movimentações dos agregados no canteiro novo.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFatorOpen(true)}
              className="px-3.5 py-2 bg-asphalt-800 hover:bg-asphalt-700 text-asphalt-200 border border-asphalt-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Scale className="w-4 h-4 text-safety-amber" />
              Novo Fator (t/m³)
            </button>
            <button
              onClick={() => setIsAjusteOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-asphalt-950 rounded-lg text-xs font-extrabold flex items-center gap-2 shadow-md transition-all"
            >
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
              Ajustar Estoque
            </button>
          </div>
        )}
      </div>

      {/* CARDS DOS MATERIAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {materiais.map((m) => {
          const isCritico = m.estoque_atual < m.estoque_minimo;
          return (
            <div key={m.id} className={`bg-asphalt-900 border rounded-xl p-4 shadow-md ${
              isCritico ? 'border-red-500/50 bg-red-500/5' : 'border-asphalt-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-white font-mono uppercase">{m.nome}</span>
                {isCritico && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                    CRÍTICO
                  </span>
                )}
              </div>
              <div className="text-xl font-black text-amber-400 font-mono">
                {formatNumberBR(m.estoque_atual, 1)} <span className="text-xs text-asphalt-400 font-normal">m³</span>
              </div>
              <div className="text-[11px] text-asphalt-400 font-mono mt-2 space-y-1">
                <div className="flex justify-between"><span>Mínimo:</span><span>{formatNumberBR(m.estoque_minimo, 0)} m³</span></div>
                <div className="flex justify-between"><span>Participa Traço:</span><span className={m.participa_traco ? 'text-emerald-400' : 'text-asphalt-500'}>{m.participa_traco ? 'SIM' : 'NÃO'}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TABELA DE FATORES DE CONVERSÃO CADASTRADOS */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-safety-amber" />
          Fatores de Conversão Cadastrados (t/m³ e m³/t)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-asphalt-950 text-asphalt-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Agregado</th>
                <th className="p-3 text-right">Massa Específica (t/m³)</th>
                <th className="p-3 text-right">Volume por Tonelada (m³/t)</th>
                <th className="p-3">Vigência</th>
                <th className="p-3">Fonte / Laboratório</th>
                <th className="p-3">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-asphalt-800 text-asphalt-200">
              {fatores.map((f) => (
                <tr key={f.id} className="hover:bg-asphalt-800/50">
                  <td className="p-3 font-bold text-white">{f.material_nome}</td>
                  <td className="p-3 text-right font-bold text-safety-amber">{formatNumberBR(f.massa_especifica_t_m3, 2)} t/m³</td>
                  <td className="p-3 text-right font-bold text-emerald-400">{formatNumberBR(f.m3_t, 3)} m³/t</td>
                  <td className="p-3 text-asphalt-400">{f.data_vigencia}</td>
                  <td className="p-3 text-asphalt-300">{f.fonte_fator}</td>
                  <td className="p-3 text-asphalt-400">{f.responsavel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE AJUSTE MANUAL DE ESTOQUE */}
      {isAjusteOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-asphalt-900 border border-asphalt-700 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2 border-b border-asphalt-800 pb-3">
              <RefreshCw className="w-4 h-4 text-safety-amber" />
              Ajuste Manual de Estoque (Auditoria Obrigatória)
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAjusteSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-asphalt-400 block mb-1">Selecione o Agregado</label>
                <select
                  value={ajusteForm.material_id}
                  onChange={(e) => setAjusteForm({ ...ajusteForm, material_id: e.target.value })}
                  className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white"
                >
                  {materiais.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-asphalt-400 block mb-1">Tipo de Movimento</label>
                  <select
                    value={ajusteForm.tipo}
                    onChange={(e) => setAjusteForm({ ...ajusteForm, tipo: e.target.value as any })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white"
                  >
                    <option value="AJUSTE">Ajuste Manual (+/-)</option>
                    <option value="PERDA">Perda / Descarte (-)</option>
                    <option value="TRANSFERENCIA">Transferência (-)</option>
                  </select>
                </div>
                <div>
                  <label className="text-asphalt-400 block mb-1">Quantidade (m³) *</label>
                  <input
                    type="text"
                    placeholder="Ex: 50,0"
                    value={ajusteForm.quantidade_m3}
                    onChange={(e) => setAjusteForm({ ...ajusteForm, quantidade_m3: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-asphalt-400 block mb-1">Motivo Técnico do Ajuste * (Exigido pelo DNIT)</label>
                <textarea
                  rows={3}
                  placeholder="Justifique detalhadamente a divergência observada na medição topográfica do monte..."
                  value={ajusteForm.motivo}
                  onChange={(e) => setAjusteForm({ ...ajusteForm, motivo: e.target.value })}
                  className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-asphalt-800">
                <button
                  type="button"
                  onClick={() => setIsAjusteOpen(false)}
                  className="px-4 py-2 bg-asphalt-800 text-asphalt-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-safety-amber text-asphalt-950 font-bold rounded"
                >
                  Registrar Ajuste Auditado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO FATOR */}
      {isFatorOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-asphalt-900 border border-asphalt-700 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2 border-b border-asphalt-800 pb-3">
              <Scale className="w-4 h-4 text-safety-amber" />
              Cadastrar Fator de Conversão de Densidade (t/m³)
            </h3>
            <form onSubmit={handleFatorSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-asphalt-400 block mb-1">Agregado Material</label>
                <select
                  value={fatorForm.material_nome}
                  onChange={(e) => setFatorForm({ ...fatorForm, material_nome: e.target.value })}
                  className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white"
                >
                  <option value="BRITA 12 MM">BRITA 12 MM</option>
                  <option value="BRITA 19 MM">BRITA 19 MM</option>
                  <option value="PÓ DE PEDRA">PÓ DE PEDRA</option>
                </select>
              </div>

              <div>
                <label className="text-asphalt-400 block mb-1">Massa Específica Apa. (t/m³)</label>
                <input
                  type="text"
                  value={fatorForm.massa_especifica_t_m3}
                  onChange={(e) => setFatorForm({ ...fatorForm, massa_especifica_t_m3: e.target.value })}
                  className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-safety-amber font-bold"
                />
              </div>

              <div>
                <label className="text-asphalt-400 block mb-1">Fonte do Fator / Ensaio</label>
                <input
                  type="text"
                  value={fatorForm.fonte_fator}
                  onChange={(e) => setFatorForm({ ...fatorForm, fonte_fator: e.target.value })}
                  className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-asphalt-800">
                <button
                  type="button"
                  onClick={() => setIsFatorOpen(false)}
                  className="px-4 py-2 bg-asphalt-800 text-asphalt-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-safety-amber text-asphalt-950 font-bold rounded"
                >
                  Salvar Fator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
