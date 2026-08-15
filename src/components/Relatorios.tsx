import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Table } from 'lucide-react';
import { DashboardData, Recebimento, BoletimDiario } from '../types';
import { formatNumberBR, formatCurrencyBR, formatPercentBR } from '../utils/formatters';
import * as XLSX from 'xlsx';

interface RelatoriosProps {
  data: DashboardData | null;
  recebimentos: Recebimento[];
  boletins: BoletimDiario[];
}

export const Relatorios: React.FC<RelatoriosProps> = ({ data, recebimentos, boletins }) => {
  const [selectedRelatorio, setSelectedRelatorio] = useState<'01' | '02' | '03' | '04' | '05'>('01');
  const [filterMaterial, setFilterMaterial] = useState('TODOS');

  if (!data) return null;

  const { obra, resumo } = data;

  // Exportação Excel via XLSX
  const exportToExcel = () => {
    let exportData: any[] = [];
    let fileName = `Relatorio_${selectedRelatorio}_Obra_177_25.xlsx`;

    if (selectedRelatorio === '01') {
      exportData = recebimentos.map(r => ({
        Data: r.data,
        Ticket: r.ticket,
        Agregado: r.material_nome,
        Fornecedor: r.fornecedor,
        'Quantidade (m³)': r.quantidade_m3,
        'Preço Unitario (R$)': r.preco_unitario,
        'Valor Total (R$)': r.valor_total,
        'Centro Custo': r.centro_custo,
        Responsavel: r.responsavel_lancamento
      }));
    } else if (selectedRelatorio === '03') {
      exportData = [
        { Agregado: 'Brita 19 mm', 'Traco %': 5.67, 'Teorico (m³)': resumo.brita19.teorico_m3, 'Recebido (m³)': resumo.brita19.recebido_m3, 'Consumido (m³)': resumo.brita19.consumido_m3, 'Estoque (m³)': resumo.brita19.estoque_m3 },
        { Agregado: 'Brita 12 mm', 'Traco %': 40.64, 'Teorico (m³)': resumo.brita12.teorico_m3, 'Recebido (m³)': resumo.brita12.recebido_m3, 'Consumido (m³)': resumo.brita12.consumido_m3, 'Estoque (m³)': resumo.brita12.estoque_m3 },
        { Agregado: 'Pó de Pedra', 'Traco %': 47.25, 'Teorico (m³)': resumo.po_pedra.teorico_m3, 'Recebido (m³)': resumo.po_pedra.recebido_m3, 'Consumido (m³)': resumo.po_pedra.consumido_m3, 'Estoque (m³)': resumo.po_pedra.estoque_m3 }
      ];
    } else {
      exportData = recebimentos.map(r => ({
        Ticket: r.ticket,
        Agregado: r.material_nome,
        Qtd: r.quantidade_m3,
        Total: r.valor_total
      }));
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
    XLSX.writeFile(wb, fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DO MÓDULO */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <FileText className="w-5 h-5 text-safety-amber" />
            Relatórios Técnicos Auditáveis de Engenharia
          </h2>
          <p className="text-xs text-asphalt-400 mt-1">
            Emissão de relatórios gerenciais para fiscalização DNIT e diretoria da Construtora Plínio Cavalcanti LTDA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Excel (.xlsx)
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-asphalt-800 hover:bg-asphalt-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 border border-asphalt-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-safety-amber" />
            Imprimir / Gerar PDF
          </button>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE OS 5 RELATÓRIOS REQUERIDOS */}
      <div className="flex flex-wrap gap-2 no-print">
        {[
          { id: '01', title: 'Relatório 01 — Recebimentos' },
          { id: '02', title: 'Relatório 02 — Estoque' },
          { id: '03', title: 'Relatório 03 — Balanço do Traço' },
          { id: '04', title: 'Relatório 04 — Suprimentos' },
          { id: '05', title: 'Relatório 05 — Custo Acumulado' }
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRelatorio(r.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedRelatorio === r.id
                ? 'bg-safety-amber text-asphalt-950 shadow-md'
                : 'bg-asphalt-900 text-asphalt-300 border border-asphalt-800 hover:bg-asphalt-800'
            }`}
          >
            {r.title}
          </button>
        ))}
      </div>

      {/* ÁREA DO RELATÓRIO IMPRESSO / VISUALIZADO */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-8 shadow-xl space-y-6 text-asphalt-100 font-mono">
        
        {/* CABEÇALHO OFICIAL DO RELATÓRIO */}
        <div className="border-b-2 border-asphalt-700 pb-4 flex justify-between items-start">
          <div>
            <div className="text-xs text-safety-amber font-bold tracking-widest uppercase">CONSTRUTORA PLÍNIO CAVALCANTI LTDA</div>
            <h1 className="text-lg font-black text-white uppercase mt-0.5">
              RELATÓRIO TÉCNICO N° {selectedRelatorio} — OBRA 177/25
            </h1>
            <div className="text-xs text-asphalt-400 mt-1">
              Rodovia BR-423/PE • Trecho Lajedo-PE → Garanhuns-PE • Meta: 14.000 m³ CBUQ
            </div>
          </div>
          <div className="text-right text-[11px] text-asphalt-400">
            <div>Data Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
            <div>Centro de Custo: <strong className="text-white">177/25</strong></div>
            <div>Fornecedor: Pedreira MDG</div>
          </div>
        </div>

        {/* CONTÉUDO ESPECÍFICO DO RELATÓRIO SELECIONADO */}
        {selectedRelatorio === '01' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Histórico Geral de Recebimentos por Ticket</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-asphalt-800">
                <thead className="bg-asphalt-950 text-asphalt-400 text-[10px]">
                  <tr>
                    <th className="p-2 border-b border-asphalt-800">Data</th>
                    <th className="p-2 border-b border-asphalt-800">Ticket</th>
                    <th className="p-2 border-b border-asphalt-800">Agregado</th>
                    <th className="p-2 border-b border-asphalt-800 text-right">Volume (m³)</th>
                    <th className="p-2 border-b border-asphalt-800 text-right">Preço Unit.</th>
                    <th className="p-2 border-b border-asphalt-800 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-asphalt-800">
                  {recebimentos.map(r => (
                    <tr key={r.id}>
                      <td className="p-2 text-asphalt-400">{r.data}</td>
                      <td className="p-2 text-safety-amber font-bold">{r.ticket}</td>
                      <td className="p-2 text-white">{r.material_nome}</td>
                      <td className="p-2 text-right text-emerald-400 font-bold">{formatNumberBR(r.quantidade_m3, 1)} m³</td>
                      <td className="p-2 text-right">{formatCurrencyBR(r.preco_unitario)}</td>
                      <td className="p-2 text-right text-white font-bold">{formatCurrencyBR(r.valor_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedRelatorio === '03' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Demonstrativo do Balanço do Traço CBUQ</h3>
            <div className="p-3 bg-asphalt-950 rounded border border-asphalt-800 text-xs">
              Percentual configurado de agregados: <strong>93,56%</strong> | Percentual restante: <strong>6,44%</strong> (não parametrizado)
            </div>
            <table className="w-full text-left text-xs border border-asphalt-800">
              <thead className="bg-asphalt-950 text-asphalt-400 text-[10px]">
                <tr>
                  <th className="p-2 border-b border-asphalt-800">Agregado</th>
                  <th className="p-2 border-b border-asphalt-800 text-right">Traço %</th>
                  <th className="p-2 border-b border-asphalt-800 text-right">Teórico (m³)</th>
                  <th className="p-2 border-b border-asphalt-800 text-right">Recebido (m³)</th>
                  <th className="p-2 border-b border-asphalt-800 text-right">Consumido (m³)</th>
                  <th className="p-2 border-b border-asphalt-800 text-right">Estoque (m³)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-asphalt-800">
                <tr>
                  <td className="p-2 font-bold text-white">Brita 19 mm</td>
                  <td className="p-2 text-right">5,67%</td>
                  <td className="p-2 text-right">{formatNumberBR(resumo.brita19.teorico_m3, 1)} m³</td>
                  <td className="p-2 text-right text-emerald-400">{formatNumberBR(resumo.brita19.recebido_m3, 1)} m³</td>
                  <td className="p-2 text-right text-amber-400">{formatNumberBR(resumo.brita19.consumido_m3, 1)} m³</td>
                  <td className="p-2 text-right font-bold text-purple-300">{formatNumberBR(resumo.brita19.estoque_m3, 1)} m³</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-white">Brita 12 mm</td>
                  <td className="p-2 text-right">40,64%</td>
                  <td className="p-2 text-right">{formatNumberBR(resumo.brita12.teorico_m3, 1)} m³</td>
                  <td className="p-2 text-right text-emerald-400">{formatNumberBR(resumo.brita12.recebido_m3, 1)} m³</td>
                  <td className="p-2 text-right text-amber-400">{formatNumberBR(resumo.brita12.consumido_m3, 1)} m³</td>
                  <td className="p-2 text-right font-bold text-purple-300">{formatNumberBR(resumo.brita12.estoque_m3, 1)} m³</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-white">Pó de Pedra</td>
                  <td className="p-2 text-right">47,25%</td>
                  <td className="p-2 text-right">{formatNumberBR(resumo.po_pedra.teorico_m3, 1)} m³</td>
                  <td className="p-2 text-right text-emerald-400">{formatNumberBR(resumo.po_pedra.recebido_m3, 1)} m³</td>
                  <td className="p-2 text-right text-amber-400">{formatNumberBR(resumo.po_pedra.consumido_m3, 1)} m³</td>
                  <td className="p-2 text-right font-bold text-purple-300">{formatNumberBR(resumo.po_pedra.estoque_m3, 1)} m³</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ASSINATURA DE ENGENHARIA */}
        <div className="pt-8 border-t border-asphalt-800 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-asphalt-600 w-48 mx-auto mb-1"></div>
            <div className="font-bold text-white">Eng. Plínio Cavalcanti Jr.</div>
            <div className="text-asphalt-400 text-[10px]">CREA-PE • Responsável Técnico Obra 177/25</div>
          </div>
          <div>
            <div className="border-t border-asphalt-600 w-48 mx-auto mb-1"></div>
            <div className="font-bold text-white">Fiscalização DNIT</div>
            <div className="text-asphalt-400 text-[10px]">Superintendência Regional DNIT/PE</div>
          </div>
        </div>

      </div>

    </div>
  );
};
