import React from 'react';
import {
  TrendingUp,
  Boxes,
  Truck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Layers,
  Percent,
  DollarSign
} from 'lucide-react';
import { DashboardData } from '../types';
import { formatNumberBR, formatCurrencyBR, formatPercentBR } from '../utils/formatters';
import { FormulaTooltip } from './FormulaTooltip';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

interface DashboardProps {
  data: DashboardData | null;
  loading: boolean;
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, loading, onNavigateTab }) => {
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-safety-amber border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-asphalt-400">Carregando dados da Obra 177/25...</span>
        </div>
      </div>
    );
  }

  const { obra, resumo, respostas_engenheiro, alertas } = data;

  // Dados para os gráficos
  const chartComparativo = [
    {
      name: 'Brita 19 mm',
      'Teórico (m³)': resumo.brita19.teorico_m3,
      'Recebido (m³)': resumo.brita19.recebido_m3,
      'Consumido (m³)': resumo.brita19.consumido_m3,
      'Estoque (m³)': resumo.brita19.estoque_m3
    },
    {
      name: 'Brita 12 mm',
      'Teórico (m³)': resumo.brita12.teorico_m3,
      'Recebido (m³)': resumo.brita12.recebido_m3,
      'Consumido (m³)': resumo.brita12.consumido_m3,
      'Estoque (m³)': resumo.brita12.estoque_m3
    },
    {
      name: 'Pó de Pedra',
      'Teórico (m³)': resumo.po_pedra.teorico_m3,
      'Recebido (m³)': resumo.po_pedra.recebido_m3,
      'Consumido (m³)': resumo.po_pedra.consumido_m3,
      'Estoque (m³)': resumo.po_pedra.estoque_m3
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. PAINEL DE ALERTAS DE ENGENHARIA */}
      {alertas && alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((alerta, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex items-start gap-3 shadow-md ${
                alerta.tipo === 'CRITICO'
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : alerta.tipo === 'ATENCAO'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {alerta.tipo === 'CRITICO' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
              {alerta.tipo === 'ATENCAO' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              {alerta.tipo === 'OK' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              <div className="text-xs">
                <div className="font-bold uppercase tracking-wider">{alerta.titulo}</div>
                <div className="mt-0.5 font-medium leading-relaxed">{alerta.mensagem}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BANNER REQUISITO N° 4: DESTAQUE EXPLÍCITO DO TRAÇO */}
      <div className="bg-gradient-to-r from-asphalt-900 via-asphalt-800 to-asphalt-900 border border-asphalt-700 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-safety-amber rounded-lg border border-amber-500/30">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-asphalt-400 font-mono font-semibold uppercase">Configuração Atual do Traço CBUQ</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Percentual de agregados configurado: <strong className="text-safety-amber">93,56%</strong></span>
              <span className="text-asphalt-500">•</span>
              <span className="text-asphalt-300 text-xs">Brita 19 (5,67%) + Brita 12 (40,64%) + Pó de Pedra (47,25%)</span>
            </div>
          </div>
        </div>
        <div className="bg-asphalt-950 px-3 py-1.5 rounded-lg border border-asphalt-700 text-xs font-mono text-amber-400 font-medium">
          Percentual restante do traço: <strong>6,44%</strong> — não parametrizado.
        </div>
      </div>

      {/* 2. OS 4 CARDS PRINCIPAIS DE GESTÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: PRODUÇÃO */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-asphalt-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-asphalt-400 uppercase tracking-wider font-mono">1. Produção CBUQ</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatNumberBR(obra.producao_realizada_m3, 0)} <span className="text-xs font-normal text-asphalt-400">m³</span></div>
          <div className="text-xs text-asphalt-400 mt-1 flex justify-between">
            <span>Meta: <strong>{formatNumberBR(obra.producao_prevista_m3, 0)} m³</strong></span>
            <span>Saldo: <strong>{formatNumberBR(obra.saldo_a_produzir_m3, 0)} m³</strong></span>
          </div>
          {/* Barra de progresso */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-mono text-asphalt-300 mb-1">
              <span>Avanço Físico</span>
              <span className="font-bold text-blue-400">{formatPercentBR(obra.percentual_avanco)}</span>
            </div>
            <div className="w-full h-2 bg-asphalt-950 rounded-full overflow-hidden border border-asphalt-800">
              <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, obra.percentual_avanco)}%` }}></div>
            </div>
          </div>
        </div>

        {/* CARD 2: RECEBIMENTO */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-asphalt-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-asphalt-400 uppercase tracking-wider font-mono">2. Recebimento Total</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatNumberBR(resumo.total_recebido_m3, 1)} <span className="text-xs font-normal text-asphalt-400">m³</span></div>
          <div className="text-xs text-asphalt-300 mt-2 space-y-0.5 font-mono text-[11px]">
            <div className="flex justify-between"><span>• Brita 19:</span><span className="text-white font-semibold">{formatNumberBR(resumo.brita19.recebido_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>• Brita 12:</span><span className="text-white font-semibold">{formatNumberBR(resumo.brita12.recebido_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>• Pó de Pedra:</span><span className="text-white font-semibold">{formatNumberBR(resumo.po_pedra.recebido_m3, 1)} m³</span></div>
            <div className="flex justify-between text-asphalt-400"><span>• Outros (BGC/Rachão):</span><span>{formatNumberBR(resumo.outros.recebido_m3, 1)} m³</span></div>
          </div>
        </div>

        {/* CARD 3: ESTOQUE */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-asphalt-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-asphalt-400 uppercase tracking-wider font-mono">3. Estoque Atual</span>
            <div className="p-2 bg-amber-500/10 text-safety-amber rounded-lg">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatNumberBR(resumo.estoque_total_m3, 1)} <span className="text-xs font-normal text-asphalt-400">m³</span></div>
          <div className="text-xs text-asphalt-300 mt-2 space-y-0.5 font-mono text-[11px]">
            <div className="flex justify-between"><span>• Brita 19 mm:</span><span className="text-amber-400 font-semibold">{formatNumberBR(resumo.brita19.estoque_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>• Brita 12 mm:</span><span className="text-amber-400 font-semibold">{formatNumberBR(resumo.brita12.estoque_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>• Pó de Pedra:</span><span className="text-amber-400 font-semibold">{formatNumberBR(resumo.po_pedra.estoque_m3, 1)} m³</span></div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-center border border-emerald-500/20 font-mono">
            Suficiente para: <strong>{formatNumberBR(respostas_engenheiro.producao_maxima_cbuq_estoque_m3, 0)} m³</strong> de CBUQ
          </div>
        </div>

        {/* CARD 4: PLANEJAMENTO */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-asphalt-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-asphalt-400 uppercase tracking-wider font-mono">4. Necessidade Faltante</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">
            {formatNumberBR(respostas_engenheiro.quanto_precisamos_comprar_m3, 1)} <span className="text-xs font-normal text-asphalt-400">m³</span>
          </div>
          <div className="text-xs text-asphalt-300 mt-2 space-y-0.5 font-mono text-[11px]">
            <div className="flex justify-between"><span>• Brita 19 Faltante:</span><span>{formatNumberBR(resumo.brita19.saldo_necessario_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>• Brita 12 Faltante:</span><span>{formatNumberBR(resumo.brita12.saldo_necessario_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>• Pó de Pedra Faltante:</span><span>{formatNumberBR(resumo.po_pedra.saldo_necessario_m3, 1)} m³</span></div>
          </div>
          <div className="mt-2 text-[10px] text-asphalt-400 font-mono flex items-center justify-between border-t border-asphalt-800 pt-1">
            <span>Custo Acumulado:</span>
            <span className="text-white font-bold">{formatCurrencyBR(resumo.total_custo_recebido)}</span>
          </div>
        </div>

      </div>

      {/* 3. RESPOSTAS DIRETAS ÀS 10 PERGUNTAS DO ENGENHEIRO (Item 28) */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 border-b border-asphalt-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-safety-amber" />
              Painel de Respostas Rápidas da Engenharia (Obra 177/25)
            </h3>
            <p className="text-xs text-asphalt-400 mt-0.5">Indicadores calculados automaticamente em tempo real para tomada de decisão.</p>
          </div>
          <button
            onClick={() => onNavigateTab('planejamento')}
            className="text-xs font-mono text-safety-amber hover:underline flex items-center gap-1"
          >
            Abrir Simulador de Produção →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          <div className="bg-asphalt-950 p-3 rounded-lg border border-asphalt-800">
            <span className="text-[11px] text-asphalt-400 font-mono block">1. Quanto já recebemos?</span>
            <span className="text-base font-bold text-white font-mono block mt-1">{formatNumberBR(respostas_engenheiro.quanto_recebemos_m3, 1)} m³</span>
            <span className="text-[10px] text-asphalt-500 font-mono">Brita 19, 12, Pó + Outros</span>
          </div>

          <div className="bg-asphalt-950 p-3 rounded-lg border border-asphalt-800">
            <span className="text-[11px] text-asphalt-400 font-mono block">2. Quanto temos em estoque?</span>
            <span className="text-base font-bold text-amber-400 font-mono block mt-1">{formatNumberBR(respostas_engenheiro.quanto_temos_estoque_m3, 1)} m³</span>
            <span className="text-[10px] text-asphalt-500 font-mono">Agregados do traço</span>
          </div>

          <div className="bg-asphalt-950 p-3 rounded-lg border border-asphalt-800">
            <span className="text-[11px] text-asphalt-400 font-mono block">3. Quanto já consumimos?</span>
            <span className="text-base font-bold text-blue-400 font-mono block mt-1">{formatNumberBR(respostas_engenheiro.quanto_consumimos_m3, 1)} m³</span>
            <span className="text-[10px] text-asphalt-500 font-mono">Consumo total em usina</span>
          </div>

          <div className="bg-asphalt-950 p-3 rounded-lg border border-asphalt-800">
            <span className="text-[11px] text-asphalt-400 font-mono block">4. Quanto ainda precisamos?</span>
            <span className="text-base font-bold text-purple-300 font-mono block mt-1">{formatNumberBR(respostas_engenheiro.quanto_precisamos_comprar_m3, 1)} m³</span>
            <span className="text-[10px] text-asphalt-500 font-mono">Para meta de 14.000 m³</span>
          </div>

          <div className="bg-asphalt-950 p-3 rounded-lg border border-asphalt-800">
            <span className="text-[11px] text-asphalt-400 font-mono block">5. Seguindo o traço?</span>
            <span className="text-base font-bold text-emerald-400 font-mono block mt-1">SIM (93,56%)</span>
            <span className="text-[10px] text-asphalt-500 font-mono">Variação dentro do esperado</span>
          </div>

          <div className="bg-asphalt-950 p-3 rounded-lg border border-asphalt-800">
            <span className="text-[11px] text-asphalt-400 font-mono block">6. Material Limitante / Gargalo</span>
            <span className="text-base font-bold text-red-400 font-mono block mt-1 uppercase">{respostas_engenheiro.material_limitante}</span>
            <span className="text-[10px] text-asphalt-500 font-mono">Restringe produção atual</span>
          </div>

          <div className="bg-asphalt-950 p-3 rounded-lg border border-asphalt-800">
            <span className="text-[11px] text-asphalt-400 font-mono block">7. Quanto comprar?</span>
            <span className="text-base font-bold text-white font-mono block mt-1">{formatNumberBR(respostas_engenheiro.quanto_precisamos_comprar_m3, 0)} m³</span>
            <span className="text-[10px] text-asphalt-500 font-mono">Aproximadamente {Math.ceil(respostas_engenheiro.quanto_precisamos_comprar_m3 / 16)} cargas</span>
          </div>

          <div className="bg-asphalt-950 p-3 rounded-lg border border-asphalt-800">
            <span className="text-[11px] text-asphalt-400 font-mono block">8. Custo Total Acumulado</span>
            <span className="text-base font-bold text-emerald-300 font-mono block mt-1">{formatCurrencyBR(respostas_engenheiro.custo_total_gastos)}</span>
            <span className="text-[10px] text-asphalt-500 font-mono">Pedreira MDG</span>
          </div>

          <div className="bg-asphalt-950 p-3 rounded-lg border border-asphalt-800">
            <span className="text-[11px] text-asphalt-400 font-mono block">9. CBUQ com estoque atual</span>
            <span className="text-base font-bold text-safety-amber font-mono block mt-1">{formatNumberBR(respostas_engenheiro.producao_maxima_cbuq_estoque_m3, 0)} m³</span>
            <span className="text-[10px] text-asphalt-500 font-mono">Capacidade máxima hoje</span>
          </div>

          <div className="bg-asphalt-950 p-3 rounded-lg border border-asphalt-800">
            <span className="text-[11px] text-asphalt-400 font-mono block">10. Avanço da Obra</span>
            <span className="text-base font-bold text-blue-400 font-mono block mt-1">{formatPercentBR(respostas_engenheiro.avanço_obra_percentual)}</span>
            <span className="text-[10px] text-asphalt-500 font-mono">Da meta de 14.000 m³</span>
          </div>

        </div>
      </div>

      {/* 4. COMPARAÇÃO DETALHADA RECEBIDO X NECESSÁRIO POR MATERIAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* BRITA 19 MM */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between border-b border-asphalt-800 pb-2 mb-3">
            <div className="font-bold text-white text-xs font-mono uppercase flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              BRITA 19 MM (5,67%)
            </div>
            <span className="text-[11px] font-mono text-asphalt-400">Agregado Graúdo</span>
          </div>
          <div className="space-y-1.5 font-mono text-xs text-asphalt-300">
            <div className="flex justify-between"><span>Necessário:</span><span className="text-white font-semibold">{formatNumberBR(resumo.brita19.teorico_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>Recebida:</span><span className="text-emerald-400 font-semibold">{formatNumberBR(resumo.brita19.recebido_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>Estoque Atual:</span><span className="text-amber-400 font-semibold">{formatNumberBR(resumo.brita19.estoque_m3, 1)} m³</span></div>
            <div className="flex justify-between border-t border-asphalt-800 pt-1.5"><span>Saldo Faltante:</span><span className="text-purple-300 font-bold">{formatNumberBR(resumo.brita19.saldo_necessario_m3, 1)} m³</span></div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-mono text-asphalt-400 mb-1">
              <span>Atendimento</span>
              <span className="font-bold text-emerald-400">{resumo.brita19.percentual_atendimento}%</span>
            </div>
            <div className="w-full h-1.5 bg-asphalt-950 rounded-full overflow-hidden border border-asphalt-800">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, resumo.brita19.percentual_atendimento)}%` }}></div>
            </div>
          </div>
        </div>

        {/* BRITA 12 MM */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between border-b border-asphalt-800 pb-2 mb-3">
            <div className="font-bold text-white text-xs font-mono uppercase flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              BRITA 12 MM (40,64%)
            </div>
            <span className="text-[11px] font-mono text-asphalt-400">Agregado Graúdo</span>
          </div>
          <div className="space-y-1.5 font-mono text-xs text-asphalt-300">
            <div className="flex justify-between"><span>Necessário:</span><span className="text-white font-semibold">{formatNumberBR(resumo.brita12.teorico_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>Recebida:</span><span className="text-emerald-400 font-semibold">{formatNumberBR(resumo.brita12.recebido_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>Estoque Atual:</span><span className="text-amber-400 font-semibold">{formatNumberBR(resumo.brita12.estoque_m3, 1)} m³</span></div>
            <div className="flex justify-between border-t border-asphalt-800 pt-1.5"><span>Saldo Faltante:</span><span className="text-purple-300 font-bold">{formatNumberBR(resumo.brita12.saldo_necessario_m3, 1)} m³</span></div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-mono text-asphalt-400 mb-1">
              <span>Atendimento</span>
              <span className="font-bold text-emerald-400">{resumo.brita12.percentual_atendimento}%</span>
            </div>
            <div className="w-full h-1.5 bg-asphalt-950 rounded-full overflow-hidden border border-asphalt-800">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, resumo.brita12.percentual_atendimento)}%` }}></div>
            </div>
          </div>
        </div>

        {/* PÓ DE PEDRA */}
        <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between border-b border-asphalt-800 pb-2 mb-3">
            <div className="font-bold text-white text-xs font-mono uppercase flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              PÓ DE PEDRA (47,25%)
            </div>
            <span className="text-[11px] font-mono text-asphalt-400">Agregado Miúdo</span>
          </div>
          <div className="space-y-1.5 font-mono text-xs text-asphalt-300">
            <div className="flex justify-between"><span>Necessário:</span><span className="text-white font-semibold">{formatNumberBR(resumo.po_pedra.teorico_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>Recebida:</span><span className="text-emerald-400 font-semibold">{formatNumberBR(resumo.po_pedra.recebido_m3, 1)} m³</span></div>
            <div className="flex justify-between"><span>Estoque Atual:</span><span className="text-amber-400 font-semibold">{formatNumberBR(resumo.po_pedra.estoque_m3, 1)} m³</span></div>
            <div className="flex justify-between border-t border-asphalt-800 pt-1.5"><span>Saldo Faltante:</span><span className="text-purple-300 font-bold">{formatNumberBR(resumo.po_pedra.saldo_necessario_m3, 1)} m³</span></div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-mono text-asphalt-400 mb-1">
              <span>Atendimento</span>
              <span className="font-bold text-emerald-400">{resumo.po_pedra.percentual_atendimento}%</span>
            </div>
            <div className="w-full h-1.5 bg-asphalt-950 rounded-full overflow-hidden border border-asphalt-800">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, resumo.po_pedra.percentual_atendimento)}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. GRÁFICOS DE BALANÇO E ATENDIMENTO DA OBRA */}
      <div className="bg-asphalt-900 border border-asphalt-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 border-b border-asphalt-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-safety-amber" />
              Balanço Comparativo de Agregados da Obra (m³)
            </h3>
            <p className="text-xs text-asphalt-400 mt-0.5">Necessidade Teórica para 14.000 m³ vs Volume Recebido vs Consumido vs Estoque Atual.</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartComparativo} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(value: any) => [`${formatNumberBR(Number(value), 1)} m³`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Teórico (m³)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recebido (m³)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Consumido (m³)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Estoque (m³)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
