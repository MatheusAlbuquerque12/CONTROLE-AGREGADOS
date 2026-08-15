export interface Obra {
  id: string;
  centro_custo: string;
  nome_obra: string;
  rodovia: string;
  trecho: string;
  fornecedor_principal: string;
  producao_prevista_m3: number;
  producao_realizada_m3: number;
  saldo_a_produzir_m3: number;
  percentual_avanco: number;
  status: string;
  data_inicio: string;
  data_fim: string;
  observacoes: string;
}

export interface Material {
  id: string;
  nome: string;
  especificacao: string;
  categoria: string;
  unidade_padrao: string;
  participa_traco: number;
  percentual_traco: number;
  preco_unitario_atual: number;
  estoque_atual: number;
  estoque_minimo: number;
  ativo: number;
}

export interface TracoItem {
  material_id: string;
  nome: string;
  percentual: number;
  participa_traco: number;
}

export interface TracoConfig {
  id: string;
  obra_id: string;
  nome_traco: string;
  percentual_agregados_configurado: number;
  percentual_restante: number;
  base_calculo: 'Volume' | 'Massa';
  densidade_mistura_t_m3: number;
  data_atualizacao: string;
  responsavel: string;
  observacoes: string;
  itens: TracoItem[];
}

export interface FatorConversao {
  id: string;
  material_id: string;
  material_nome: string;
  massa_especifica_t_m3: number;
  m3_t: number;
  data_vigencia: string;
  fonte_fator: string;
  responsavel: string;
}

export interface Recebimento {
  id: string;
  data: string;
  ticket: string;
  fornecedor: string;
  material_id: string;
  material_nome: string;
  quantidade_original: number;
  unidade_original: string;
  quantidade_m3: number;
  preco_unitario: number;
  valor_total: number;
  centro_custo: string;
  responsavel_lancamento: string;
  observacao: string;
}

export interface MovimentacaoEstoque {
  id: string;
  data: string;
  tipo: 'ENTRADA' | 'SAIDA_USINA' | 'PERDA' | 'TRANSFERENCIA' | 'AJUSTE';
  material_id: string;
  material_nome: string;
  quantidade_m3: number;
  motivo: string;
  responsavel: string;
  observacao: string;
}

export interface BoletimDiario {
  id: string;
  data: string;
  producao_diaria_cbuq_m3: number;
  brita19_consumida_m3: number;
  brita12_consumida_m3: number;
  po_pedra_consumido_m3: number;
  total_agregados_consumidos_m3: number;
  brita19_teorica_m3: number;
  brita12_teorica_m3: number;
  po_pedra_teorico_m3: number;
  observacoes: string;
  responsavel: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  nivel_permissao: 'Admin' | 'Engenheiro' | 'Almoxarifado' | 'Consulta';
  ativo: number;
}

export interface AuditLog {
  id: string;
  data_hora: string;
  usuario: string;
  nivel_permissao: string;
  acao: string;
  entidade: string;
  detalhes: string;
}

export interface DashboardData {
  obra: Obra;
  materiais: Material[];
  traco: TracoConfig;
  resumo: {
    meta_cbuq_m3: number;
    total_recebido_m3: number;
    total_custo_recebido: number;
    brita19: {
      teorico_m3: number;
      recebido_m3: number;
      consumido_m3: number;
      estoque_m3: number;
      saldo_necessario_m3: number;
      percentual_atendimento: number;
    };
    brita12: {
      teorico_m3: number;
      recebido_m3: number;
      consumido_m3: number;
      estoque_m3: number;
      saldo_necessario_m3: number;
      percentual_atendimento: number;
    };
    po_pedra: {
      teorico_m3: number;
      recebido_m3: number;
      consumido_m3: number;
      estoque_m3: number;
      saldo_necessario_m3: number;
      percentual_atendimento: number;
    };
    outros: {
      recebido_m3: number;
    };
    estoque_total_m3: number;
  };
  respostas_engenheiro: {
    quanto_recebemos_m3: number;
    quanto_temos_estoque_m3: number;
    quanto_consumimos_m3: number;
    quanto_precisamos_comprar_m3: number;
    producao_maxima_cbuq_estoque_m3: number;
    material_limitante: string;
    custo_total_gastos: number;
    avanço_obra_percentual: number;
  };
  alertas: {
    tipo: 'CRITICO' | 'ATENCAO' | 'OK';
    titulo: string;
    mensagem: string;
  }[];
}
