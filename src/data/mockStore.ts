import { DashboardData, Recebimento, Material, FatorConversao, MovimentacaoEstoque, BoletimDiario, Usuario, AuditLog, TracoConfig, Obra } from '../types';
import { initialObra, initialMateriais, initialTraco, initialFatoresConversao, initialRecebimentos, initialBoletins, initialUsuarios, initialAuditLogs } from '../../server/db/seedData';

class LocalStore {
  obra: Obra = { ...initialObra };
  materiais: Material[] = [...initialMateriais];
  traco: TracoConfig = { ...initialTraco };
  fatores: FatorConversao[] = [...initialFatoresConversao];
  recebimentos: Recebimento[] = [...initialRecebimentos];
  movimentacoes: MovimentacaoEstoque[] = [];
  boletins: BoletimDiario[] = [...initialBoletins];
  usuarios: Usuario[] = [...initialUsuarios];
  auditLogs: AuditLog[] = [...initialAuditLogs];

  constructor() {
    this.recalcularEstoque();
  }

  recalcularEstoque() {
    const map: { [id: string]: { rec: number; cons: number; aj: number } } = {};
    this.materiais.forEach(m => { map[m.id] = { rec: 0, cons: 0, aj: 0 }; });

    this.recebimentos.forEach(r => {
      if (map[r.material_id]) map[r.material_id].rec += Number(r.quantidade_m3 || 0);
    });

    this.boletins.forEach(b => {
      if (map['mat-brita-19']) map['mat-brita-19'].cons += Number(b.brita19_consumida_m3 || 0);
      if (map['mat-brita-12']) map['mat-brita-12'].cons += Number(b.brita12_consumida_m3 || 0);
      if (map['mat-po-pedra']) map['mat-po-pedra'].cons += Number(b.po_pedra_consumido_m3 || 0);
    });

    this.movimentacoes.forEach(m => {
      if (map[m.material_id]) {
        if (m.tipo === 'ENTRADA') map[m.material_id].aj += Number(m.quantidade_m3 || 0);
        else map[m.material_id].aj -= Number(m.quantidade_m3 || 0);
      }
    });

    this.materiais = this.materiais.map(m => {
      const c = map[m.id];
      if (c) {
        const est = Math.max(0, Number((c.rec - c.cons + c.aj).toFixed(2)));
        return { ...m, estoque_atual: est };
      }
      return m;
    });
  }

  getDashboardData(): DashboardData {
    this.recalcularEstoque();
    const metaCBUQ = this.obra.producao_prevista_m3 || 14000;
    const totalRecebidoM3 = this.recebimentos.reduce((a, b) => a + Number(b.quantidade_m3 || 0), 0);
    const totalCustoRecebido = this.recebimentos.reduce((a, b) => a + Number(b.valor_total || 0), 0);

    const b19 = this.materiais.find(m => m.id === 'mat-brita-19') || { percentual_traco: 5.67, estoque_atual: 1202.3, estoque_minimo: 300 };
    const b12 = this.materiais.find(m => m.id === 'mat-brita-12') || { percentual_traco: 40.64, estoque_atual: 1027.0, estoque_minimo: 800 };
    const po = this.materiais.find(m => m.id === 'mat-po-pedra') || { percentual_traco: 47.25, estoque_atual: 1079.6, estoque_minimo: 1000 };

    const necB19 = metaCBUQ * (b19.percentual_traco / 100);
    const necB12 = metaCBUQ * (b12.percentual_traco / 100);
    const necPo = metaCBUQ * (po.percentual_traco / 100);

    const prodReal = this.boletins.reduce((a, b) => a + Number(b.producao_diaria_cbuq_m3 || 0), this.obra.producao_realizada_m3 || 2150);
    const saldoProd = Math.max(0, metaCBUQ - prodReal);
    const avanco = Number(((prodReal / metaCBUQ) * 100).toFixed(2));

    const recB19 = this.recebimentos.filter(r => r.material_id === 'mat-brita-19').reduce((a, b) => a + Number(b.quantidade_m3 || 0), 0);
    const recB12 = this.recebimentos.filter(r => r.material_id === 'mat-brita-12').reduce((a, b) => a + Number(b.quantidade_m3 || 0), 0);
    const recPo = this.recebimentos.filter(r => r.material_id === 'mat-po-pedra').reduce((a, b) => a + Number(b.quantidade_m3 || 0), 0);
    const recOutros = this.recebimentos.filter(r => !['mat-brita-19', 'mat-brita-12', 'mat-po-pedra'].includes(r.material_id)).reduce((a, b) => a + Number(b.quantidade_m3 || 0), 0);

    const consB19 = this.boletins.reduce((a, b) => a + Number(b.brita19_consumida_m3 || 0), 0);
    const consB12 = this.boletins.reduce((a, b) => a + Number(b.brita12_consumida_m3 || 0), 0);
    const consPo = this.boletins.reduce((a, b) => a + Number(b.po_pedra_consumido_m3 || 0), 0);

    const estB19 = b19.estoque_atual || 0;
    const estB12 = b12.estoque_atual || 0;
    const estPo = po.estoque_atual || 0;
    const estTotal = estB19 + estB12 + estPo;

    const maxB19 = estB19 / (b19.percentual_traco / 100);
    const maxB12 = estB12 / (b12.percentual_traco / 100);
    const maxPo = estPo / (po.percentual_traco / 100);
    const prodMaxCBUQ = Math.floor(Math.min(maxB19, maxB12, maxPo));

    let limitante = 'BRITA 12 MM';
    if (prodMaxCBUQ === Math.floor(maxB19)) limitante = 'BRITA 19 MM';
    if (prodMaxCBUQ === Math.floor(maxPo)) limitante = 'PÓ DE PEDRA';

    const alertas: any[] = [];
    if (estB12 < b12.estoque_minimo) alertas.push({ tipo: 'CRITICO', titulo: 'ESTOQUE CRÍTICO', mensagem: `Estoque de Brita 12 mm (${estB12.toLocaleString('pt-BR')} m³) abaixo do mínimo de ${b12.estoque_minimo.toLocaleString('pt-BR')} m³.` });
    if (estB19 < b19.estoque_minimo) alertas.push({ tipo: 'CRITICO', titulo: 'ESTOQUE CRÍTICO', mensagem: `Estoque de Brita 19 mm (${estB19.toLocaleString('pt-BR')} m³) abaixo do mínimo de ${b19.estoque_minimo.toLocaleString('pt-BR')} m³.` });
    if (estPo < po.estoque_minimo) alertas.push({ tipo: 'CRITICO', titulo: 'ESTOQUE CRÍTICO', mensagem: `Estoque de Pó de Pedra (${estPo.toLocaleString('pt-BR')} m³) abaixo do mínimo de ${po.estoque_minimo.toLocaleString('pt-BR')} m³.` });
    if (alertas.length === 0) alertas.push({ tipo: 'OK', titulo: 'ESTOQUE ADEQUADO', mensagem: 'Quantidade disponível suficiente para a programação de produção de CBUQ.' });

    return {
      obra: { ...this.obra, producao_realizada_m3: prodReal, saldo_a_produzir_m3: saldoProd, percentual_avanco: avanco },
      materiais: this.materiais,
      traco: this.traco,
      resumo: {
        meta_cbuq_m3: metaCBUQ,
        total_recebido_m3: totalRecebidoM3,
        total_custo_recebido: totalCustoRecebido,
        brita19: { teorico_m3: necB19, recebido_m3: recB19, consumido_m3: consB19, estoque_m3: estB19, saldo_necessario_m3: Math.max(0, necB19 - recB19), percentual_atendimento: Number(((recB19 / necB19) * 100).toFixed(1)) },
        brita12: { teorico_m3: necB12, recebido_m3: recB12, consumido_m3: consB12, estoque_m3: estB12, saldo_necessario_m3: Math.max(0, necB12 - recB12), percentual_atendimento: Number(((recB12 / necB12) * 100).toFixed(1)) },
        po_pedra: { teorico_m3: necPo, recebido_m3: recPo, consumido_m3: consPo, estoque_m3: estPo, saldo_necessario_m3: Math.max(0, necPo - recPo), percentual_atendimento: Number(((recPo / necPo) * 100).toFixed(1)) },
        outros: { recebido_m3: recOutros },
        estoque_total_m3: estTotal
      },
      respostas_engenheiro: {
        quanto_recebemos_m3: totalRecebidoM3,
        quanto_temos_estoque_m3: estTotal,
        quanto_consumimos_m3: consB19 + consB12 + consPo,
        quanto_precisamos_comprar_m3: Math.max(0, (necB19 + necB12 + necPo) - totalRecebidoM3),
        producao_maxima_cbuq_estoque_m3: prodMaxCBUQ,
        material_limitante: limitante,
        custo_total_gastos: totalCustoRecebido,
        avanço_obra_percentual: avanco
      },
      alertas
    };
  }
}

export const localStore = new LocalStore();
