import React, { useState } from 'react';
import { Truck, Plus, Search, Filter, Trash2, Edit3, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { Recebimento } from '../types';
import { formatNumberBR, formatCurrencyBR } from '../utils/formatters';

interface RecebimentosProps {
  recebimentos: Recebimento[];
  userRole: string;
  onAddRecebimento: (novo: any) => Promise<void>;
  onDeleteRecebimento: (id: string) => Promise<void>;
}

export const Recebimentos: React.FC<RecebimentosProps> = ({
  recebimentos,
  userRole,
  onAddRecebimento,
  onDeleteRecebimento
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    ticket: '',
    fornecedor: 'Pedreira MDG',
    material_nome: 'BRITA 12 MM',
    quantidade_original: '',
    unidade_original: 'm³',
    preco_unitario: '115,00',
    centro_custo: '177/25',
    responsavel_lancamento: 'Carlos Almoxarife',
    observacao: ''
  });

  const canEdit = ['Admin', 'Engenheiro', 'Almoxarifado'].includes(userRole);

  const filteredRecebimentos = recebimentos.filter(r => {
    const matchesSearch =
      r.ticket.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.observacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMaterial = materialFilter === 'TODOS' || r.material_nome === materialFilter;
    return matchesSearch && matchesMaterial;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.ticket || !formData.quantidade_original) {
      setErrorMsg('O número do ticket e a quantidade são obrigatórios.');
      return;
    }

    const parseVal = (str: string) => parseFloat(str.replace(/\./g, '').replace(',', '.'));

    try {
      await onAddRecebimento({
        ...formData,
        quantidade_original: parseVal(formData.quantidade_original),
        preco_unitario: parseVal(formData.preco_unitario)
      });
      setIsModalOpen(false);
      setFormData({
        data: new Date().toISOString().split('T')[0],
        ticket: '',
        fornecedor: 'Pedreira MDG',
        material_nome: 'BRITA 12 MM',
        quantidade_original: '',
        unidade_original: 'm³',
        preco_unitario: '115,00',
        centro_custo: '177/25',
        responsavel_lancamento: 'Carlos Almoxarife',
        observacao: ''
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao cadastrar recebimento.');
    }
  };

  const handleImportCSV = async () => {
    if (!importText.trim()) return;
    setErrorMsg('');
    const lines = importText.split('\n');
    let imported = 0;

    for (const line of lines) {
      const parts = line.split(/[,;\t]/);
      if (parts.length >= 4) {
        const [ticket, material, qtd, pu] = parts.map(p => p.trim());
        if (ticket && material && qtd) {
          try {
            await onAddRecebimento({
              data: new Date().toISOString().split('T')[0],
              ticket,
              fornecedor: 'Pedreira MDG',
              material_nome: material,
              quantidade_original: parseFloat(qtd.replace(',', '.')),
              unidade_original: 'm³',
              preco_unitario: pu ? parseFloat(pu.replace(',', '.')) : 100,
              centro_custo: '177/25',
              responsavel_lancamento: 'Importação em Lote',
              observacao: 'Importado de lote externo'
            });
            imported++;
          } catch (e) {
            // Ignorar duplicados na importação
          }
        }
      }
    }
    setIsImportOpen(false);
    setImportText('');
  };

  return (
    <div className="space-y-5">
      
      {/* HEADER DO MÓDULO */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Truck className="w-5 h-5 text-safety-amber" />
            Módulo de Recebimento de Agregados (Obra 177/25)
          </h2>
          <p className="text-xs text-asphalt-400 mt-1">
            Controle individualizado por Ticket de pesagem/balança da Pedreira MDG.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-3.5 py-2 bg-asphalt-800 hover:bg-asphalt-700 text-asphalt-200 border border-asphalt-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-safety-amber" />
              Importar em Lote (CSV/Excel)
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-asphalt-950 rounded-lg text-xs font-extrabold flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Novo Lançamento
            </button>
          </div>
        )}
      </div>

      {/* BARRA DE PESQUISA E FILTROS */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-asphalt-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por Ticket, Fornecedor ou Obs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-asphalt-950 border border-asphalt-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-asphalt-500 focus:outline-none focus:border-safety-amber"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-asphalt-400" />
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="bg-asphalt-950 border border-asphalt-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-safety-amber"
          >
            <option value="TODOS">Todos os Agregados</option>
            <option value="BRITA 12 MM">BRITA 12 MM</option>
            <option value="BRITA 19 MM">BRITA 19 MM</option>
            <option value="PÓ DE PEDRA">PÓ DE PEDRA</option>
            <option value="BRITA GRADUADA">BRITA GRADUADA</option>
            <option value="RACHINHA">RACHINHA</option>
          </select>
          <span className="text-xs text-asphalt-400 font-mono">
            Exibindo: <strong>{filteredRecebimentos.length}</strong> registros
          </span>
        </div>
      </div>

      {/* TABELA TÉCNICA DE RECEBIMENTOS */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-asphalt-950 text-asphalt-400 font-mono uppercase text-[10px] tracking-wider border-b border-asphalt-800">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Ticket</th>
                <th className="p-3">Agregado</th>
                <th className="p-3">Fornecedor</th>
                <th className="p-3 text-right">Qtd Original</th>
                <th className="p-3 text-right">Qtd Controle (m³)</th>
                <th className="p-3 text-right">Preço Unit.</th>
                <th className="p-3 text-right">Valor Total</th>
                <th className="p-3">C.Custo</th>
                <th className="p-3">Responsável</th>
                {canEdit && <th className="p-3 text-center">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-asphalt-800 text-asphalt-200 font-mono">
              {filteredRecebimentos.map((r) => {
                const isTraco = ['BRITA 12 MM', 'BRITA 19 MM', 'PÓ DE PEDRA'].includes(r.material_nome);
                return (
                  <tr key={r.id} className="hover:bg-asphalt-800/50 transition-colors">
                    <td className="p-3 text-asphalt-400 whitespace-nowrap">{r.data}</td>
                    <td className="p-3 font-bold text-safety-amber whitespace-nowrap">{r.ticket}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        r.material_nome === 'BRITA 12 MM' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                        r.material_nome === 'BRITA 19 MM' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                        r.material_nome === 'PÓ DE PEDRA' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                        'bg-asphalt-800 text-asphalt-400 border-asphalt-700'
                      }`}>
                        {r.material_nome}
                      </span>
                      {!isTraco && <span className="ml-1 text-[9px] text-asphalt-500 block">Fora do Traço</span>}
                    </td>
                    <td className="p-3 text-asphalt-300">{r.fornecedor}</td>
                    <td className="p-3 text-right font-bold text-white">{formatNumberBR(r.quantidade_original, 1)} {r.unidade_original}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">{formatNumberBR(r.quantidade_m3, 1)} m³</td>
                    <td className="p-3 text-right">{formatCurrencyBR(r.preco_unitario)}</td>
                    <td className="p-3 text-right font-bold text-white">{formatCurrencyBR(r.valor_total)}</td>
                    <td className="p-3 text-asphalt-400">{r.centro_custo}</td>
                    <td className="p-3 text-asphalt-400 text-[11px] truncate max-w-[120px]">{r.responsavel_lancamento}</td>
                    {canEdit && (
                      <td className="p-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => onDeleteRecebimento(r.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
                          title="Excluir Ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE NOVO LANÇAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-asphalt-900 border border-asphalt-700 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2 border-b border-asphalt-800 pb-3">
              <Plus className="w-4 h-4 text-safety-amber" />
              Lançamento de Ticket de Recebimento
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-asphalt-400 block mb-1">Data de Lançamento</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white focus:outline-none focus:border-safety-amber"
                  />
                </div>
                <div>
                  <label className="text-asphalt-400 block mb-1">Número do Ticket *</label>
                  <input
                    type="text"
                    placeholder="Ex: TK-10250"
                    value={formData.ticket}
                    onChange={(e) => setFormData({ ...formData, ticket: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white font-bold focus:outline-none focus:border-safety-amber"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-asphalt-400 block mb-1">Agregado Material</label>
                  <select
                    value={formData.material_nome}
                    onChange={(e) => setFormData({ ...formData, material_nome: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white focus:outline-none focus:border-safety-amber"
                  >
                    <option value="BRITA 12 MM">BRITA 12 MM (Traço)</option>
                    <option value="BRITA 19 MM">BRITA 19 MM (Traço)</option>
                    <option value="PÓ DE PEDRA">PÓ DE PEDRA (Traço)</option>
                    <option value="BRITA GRADUADA">BRITA GRADUADA (Fora do Traço)</option>
                    <option value="RACHINHA">RACHINHA (Fora do Traço)</option>
                  </select>
                </div>
                <div>
                  <label className="text-asphalt-400 block mb-1">Fornecedor Principal</label>
                  <input
                    type="text"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white focus:outline-none focus:border-safety-amber"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-asphalt-400 block mb-1">Quantidade *</label>
                  <input
                    type="text"
                    placeholder="Ex: 250,5"
                    value={formData.quantidade_original}
                    onChange={(e) => setFormData({ ...formData, quantidade_original: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-emerald-400 font-bold focus:outline-none focus:border-safety-amber"
                  />
                </div>
                <div>
                  <label className="text-asphalt-400 block mb-1">Unidade</label>
                  <select
                    value={formData.unidade_original}
                    onChange={(e) => setFormData({ ...formData, unidade_original: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white focus:outline-none focus:border-safety-amber"
                  >
                    <option value="m³">m³ (Volume)</option>
                    <option value="TO">TO (Tonelada)</option>
                  </select>
                </div>
                <div>
                  <label className="text-asphalt-400 block mb-1">Preço Unit. (R$)</label>
                  <input
                    type="text"
                    value={formData.preco_unitario}
                    onChange={(e) => setFormData({ ...formData, preco_unitario: e.target.value })}
                    className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white focus:outline-none focus:border-safety-amber"
                  />
                </div>
              </div>

              <div>
                <label className="text-asphalt-400 block mb-1">Observação do Lançamento</label>
                <input
                  type="text"
                  placeholder="Ex: Entregue na usina 01"
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-2 text-white focus:outline-none focus:border-safety-amber"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-asphalt-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-asphalt-800 text-asphalt-300 rounded hover:bg-asphalt-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-safety-amber text-asphalt-950 font-bold rounded hover:bg-amber-500"
                >
                  Salvar Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPORTAÇÃO CSV */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-asphalt-900 border border-asphalt-700 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-safety-amber" />
              Importação de Tickets em Lote (CSV / Texto)
            </h3>
            <p className="text-xs text-asphalt-400 mb-3">
              Cole abaixo as linhas no formato: <code>TICKET, MATERIAL, QUANTIDADE, PREÇO</code>
            </p>
            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Exemplo:&#10;TK-10300, BRITA 12 MM, 250, 115&#10;TK-10301, PÓ DE PEDRA, 310, 85"
              className="w-full bg-asphalt-950 border border-asphalt-800 rounded p-3 text-xs text-emerald-400 font-mono focus:outline-none focus:border-safety-amber"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsImportOpen(false)}
                className="px-4 py-2 bg-asphalt-800 text-asphalt-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportCSV}
                className="px-4 py-2 bg-safety-amber text-asphalt-950 font-bold rounded text-xs"
              >
                Processar Importação
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
