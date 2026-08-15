// Dados iniciais e históricos para o Sistema de Controle de Agregados CBUQ
// Obra 177/25 - Construtora Plínio Cavalcanti LTDA

export const initialObra = {
  id: 'obra-177-25',
  centro_custo: '177/25',
  nome_obra: 'Obra BR-423/PE — Restauração e Pavimentação Asfáltica (CBUQ)',
  rodovia: 'BR-423/PE',
  trecho: 'Lajedo-PE → Garanhuns-PE',
  fornecedor_principal: 'Pedreira MDG',
  producao_prevista_m3: 14000.0,
  producao_realizada_m3: 2150.0, // Produção realizada acumulada atual
  status: 'Em Andamento',
  data_inicio: '2026-05-01',
  data_fim: '2026-12-31',
  observacoes: 'Produção e aplicação de CBUQ no trecho Lajedo-PE a Garanhuns-PE. Traço configurado para 93,56% de agregados minerais.'
};

export const initialMateriais = [
  {
    id: 'mat-brita-19',
    nome: 'BRITA 19 MM',
    especificacao: 'Agregado Graúdo 3/4" (19 mm) para CBUQ',
    categoria: 'Agregado Graúdo',
    unidade_padrao: 'm³',
    participa_traco: 1,
    percentual_traco: 5.67,
    preco_unitario_atual: 110.00,
    estoque_atual: 1202.3, // Histórico oficial fornecido
    estoque_minimo: 300.0,
    ativo: 1
  },
  {
    id: 'mat-brita-12',
    nome: 'BRITA 12 MM',
    especificacao: 'Agregado Graúdo 1/2" (12,5 mm) para CBUQ',
    categoria: 'Agregado Graúdo',
    unidade_padrao: 'm³',
    participa_traco: 1,
    percentual_traco: 40.64,
    preco_unitario_atual: 115.00,
    estoque_atual: 1027.0, // Histórico oficial fornecido
    estoque_minimo: 800.0,
    ativo: 1
  },
  {
    id: 'mat-po-pedra',
    nome: 'PÓ DE PEDRA',
    especificacao: 'Agregado Miúdo (0 a 4,75 mm) para CBUQ',
    categoria: 'Agregado Miúdo',
    unidade_padrao: 'm³',
    participa_traco: 1,
    percentual_traco: 47.25,
    preco_unitario_atual: 85.00,
    estoque_atual: 1079.6, // Histórico oficial fornecido
    estoque_minimo: 1000.0,
    ativo: 1
  },
  {
    id: 'mat-brita-graduada',
    nome: 'BRITA GRADUADA',
    especificacao: 'BGC / BGS para Base e Sub-base Rodoviária',
    categoria: 'Material Base',
    unidade_padrao: 'm³',
    participa_traco: 0,
    percentual_traco: 0.0,
    preco_unitario_atual: 95.00,
    estoque_atual: 450.0,
    estoque_minimo: 150.0,
    ativo: 1
  },
  {
    id: 'mat-rachinha',
    nome: 'RACHINHA',
    especificacao: 'Pedra de Mão / Rachão para Drenagem e Estabilização',
    categoria: 'Pedra de Mão',
    unidade_padrao: 'm³',
    participa_traco: 0,
    percentual_traco: 0.0,
    preco_unitario_atual: 75.00,
    estoque_atual: 280.0,
    estoque_minimo: 100.0,
    ativo: 1
  }
];

export const initialTraco = {
  id: 'traco-cbuq-01',
  obra_id: 'obra-177-25',
  nome_traco: 'Traço de CBUQ Camada de Rolamento (Faixa C DNIT)',
  percentual_agregados_configurado: 93.56,
  percentual_restante: 6.44,
  base_calculo: 'Volume', // 'Volume' ou 'Massa'
  densidade_mistura_t_m3: 2.40, // Densidade de projeto se base for Massa
  data_atualizacao: '2026-08-01',
  responsavel: 'Eng. Plínio Cavalcanti Jr.',
  observacoes: 'Percentual configurado de agregados: 93,56%. O saldo de 6,44% refere-se a componentes ligantes/aditivos não parametrizados nesta fase.',
  itens: [
    { material_id: 'mat-brita-19', nome: 'BRITA 19 MM', percentual: 5.67, participa_traco: 1 },
    { material_id: 'mat-brita-12', nome: 'BRITA 12 MM', percentual: 40.64, participa_traco: 1 },
    { material_id: 'mat-po-pedra', nome: 'PÓ DE PEDRA', percentual: 47.25, participa_traco: 1 }
  ]
};

export const initialFatoresConversao = [
  {
    id: 'fat-01',
    material_id: 'mat-brita-19',
    material_nome: 'BRITA 19 MM',
    massa_especifica_t_m3: 1.52,
    m3_t: 0.658,
    data_vigencia: '2026-05-01',
    fonte_fator: 'Ensaio Laboratório Obra 177/25 - NBR 7809',
    responsavel: 'Laboratório Obra 177/25'
  },
  {
    id: 'fat-02',
    material_id: 'mat-brita-12',
    material_nome: 'BRITA 12 MM',
    massa_especifica_t_m3: 1.50,
    m3_t: 0.667,
    data_vigencia: '2026-05-01',
    fonte_fator: 'Ensaio Laboratório Obra 177/25 - NBR 7809',
    responsavel: 'Laboratório Obra 177/25'
  },
  {
    id: 'fat-03',
    material_id: 'mat-po-pedra',
    material_nome: 'PÓ DE PEDRA',
    massa_especifica_t_m3: 1.60,
    m3_t: 0.625,
    data_vigencia: '2026-05-01',
    fonte_fator: 'Ensaio Laboratório Obra 177/25 - NBR 7809',
    responsavel: 'Laboratório Obra 177/25'
  }
];

// Tickets de recebimento históricos pré-carregados (Base PE 193 - Canteiro Novo + Resumo)
export const initialRecebimentos = [
  // Pó de Pedra - Total histórico 1.079,6 m³
  { id: 'rec-001', data: '2026-07-10', ticket: 'TK-10041', fornecedor: 'Pedreira MDG', material_id: 'mat-po-pedra', material_nome: 'PÓ DE PEDRA', quantidade_original: 180.0, unidade_original: 'm³', quantidade_m3: 180.0, preco_unitario: 85.00, valor_total: 15300.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 01 PE-193' },
  { id: 'rec-002', data: '2026-07-15', ticket: 'TK-10082', fornecedor: 'Pedreira MDG', material_id: 'mat-po-pedra', material_nome: 'PÓ DE PEDRA', quantidade_original: 240.0, unidade_original: 'm³', quantidade_m3: 240.0, preco_unitario: 85.00, valor_total: 20400.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 02 PE-193' },
  { id: 'rec-003', data: '2026-07-22', ticket: 'TK-10115', fornecedor: 'Pedreira MDG', material_id: 'mat-po-pedra', material_nome: 'PÓ DE PEDRA', quantidade_original: 310.0, unidade_original: 'm³', quantidade_m3: 310.0, preco_unitario: 85.00, valor_total: 26350.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 03 PE-193' },
  { id: 'rec-004', data: '2026-08-02', ticket: 'TK-10190', fornecedor: 'Pedreira MDG', material_id: 'mat-po-pedra', material_nome: 'PÓ DE PEDRA', quantidade_original: 349.6, unidade_original: 'm³', quantidade_m3: 349.6, preco_unitario: 85.00, valor_total: 29716.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 04 PE-193 - Resumo Oficial' },

  // Brita 12 mm - Total histórico 1.027,0 m³
  { id: 'rec-005', data: '2026-07-11', ticket: 'TK-10045', fornecedor: 'Pedreira MDG', material_id: 'mat-brita-12', material_nome: 'BRITA 12 MM', quantidade_original: 220.0, unidade_original: 'm³', quantidade_m3: 220.0, preco_unitario: 115.00, valor_total: 25300.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 01 PE-193' },
  { id: 'rec-006', data: '2026-07-18', ticket: 'TK-10098', fornecedor: 'Pedreira MDG', material_id: 'mat-brita-12', material_nome: 'BRITA 12 MM', quantidade_original: 280.0, unidade_original: 'm³', quantidade_m3: 280.0, preco_unitario: 115.00, valor_total: 32200.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 02 PE-193' },
  { id: 'rec-007', data: '2026-07-28', ticket: 'TK-10142', fornecedor: 'Pedreira MDG', material_id: 'mat-brita-12', material_nome: 'BRITA 12 MM', quantidade_original: 260.0, unidade_original: 'm³', quantidade_m3: 260.0, preco_unitario: 115.00, valor_total: 29900.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 03 PE-193' },
  { id: 'rec-008', data: '2026-08-05', ticket: 'TK-10210', fornecedor: 'Pedreira MDG', material_id: 'mat-brita-12', material_nome: 'BRITA 12 MM', quantidade_original: 267.0, unidade_original: 'm³', quantidade_m3: 267.0, preco_unitario: 115.00, valor_total: 30705.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 04 PE-193 - Resumo Oficial' },

  // Brita 19 mm - Total histórico 1.202,3 m³
  { id: 'rec-009', data: '2026-07-12', ticket: 'TK-10050', fornecedor: 'Pedreira MDG', material_id: 'mat-brita-19', material_nome: 'BRITA 19 MM', quantidade_original: 300.0, unidade_original: 'm³', quantidade_m3: 300.0, preco_unitario: 110.00, valor_total: 33000.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 01 PE-193' },
  { id: 'rec-010', data: '2026-07-20', ticket: 'TK-10105', fornecedor: 'Pedreira MDG', material_id: 'mat-brita-19', material_nome: 'BRITA 19 MM', quantidade_original: 320.0, unidade_original: 'm³', quantidade_m3: 320.0, preco_unitario: 110.00, valor_total: 35200.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 02 PE-193' },
  { id: 'rec-011', data: '2026-07-30', ticket: 'TK-10160', fornecedor: 'Pedreira MDG', material_id: 'mat-brita-19', material_nome: 'BRITA 19 MM', quantidade_original: 280.0, unidade_original: 'm³', quantidade_m3: 280.0, preco_unitario: 110.00, valor_total: 30800.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 03 PE-193' },
  { id: 'rec-012', data: '2026-08-08', ticket: 'TK-10235', fornecedor: 'Pedreira MDG', material_id: 'mat-brita-19', material_nome: 'BRITA 19 MM', quantidade_original: 302.3, unidade_original: 'm³', quantidade_m3: 302.3, preco_unitario: 110.00, valor_total: 33253.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Lote 04 PE-193 - Resumo Oficial' },

  // Outros materiais (Brita Graduada e Rachinha)
  { id: 'rec-013', data: '2026-07-14', ticket: 'TK-10062', fornecedor: 'Pedreira MDG', material_id: 'mat-brita-graduada', material_nome: 'BRITA GRADUADA', quantidade_original: 450.0, unidade_original: 'm³', quantidade_m3: 450.0, preco_unitario: 95.00, valor_total: 42750.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'BGC para sub-base rodovia' },
  { id: 'rec-014', data: '2026-07-16', ticket: 'TK-10075', fornecedor: 'Pedreira MDG', material_id: 'mat-rachinha', material_nome: 'RACHINHA', quantidade_original: 280.0, unidade_original: 'm³', quantidade_m3: 280.0, preco_unitario: 75.00, valor_total: 21000.00, centro_custo: '177/25', responsavel_lancamento: 'Carlos Almoxarife', observacao: 'Pedra de mão para drenagem' }
];

// Registros de Boletim Diário de Agregados (BDA)
export const initialBoletins = [
  {
    id: 'bda-2026-08-10',
    data: '2026-08-10',
    producao_diaria_cbuq_m3: 450.0,
    brita19_consumida_m3: 26.5, // Teórico: 450 * 0.0567 = 25.515
    brita12_consumida_m3: 185.0, // Teórico: 450 * 0.4064 = 182.88
    po_pedra_consumido_m3: 214.0, // Teórico: 450 * 0.4725 = 212.625
    total_agregados_consumidos_m3: 425.5,
    brita19_teorica_m3: 25.52,
    brita12_teorica_m3: 182.88,
    po_pedra_teorico_m3: 212.63,
    observacoes: 'Produção normal de CBUQ Faixa C na Usina 01. Clima limpo.',
    responsavel: 'Eng. Gabriel Laboratório'
  },
  {
    id: 'bda-2026-08-11',
    data: '2026-08-11',
    producao_diaria_cbuq_m3: 500.0,
    brita19_consumida_m3: 29.0, // Teórico: 500 * 0.0567 = 28.35
    brita12_consumida_m3: 204.0, // Teórico: 500 * 0.4064 = 203.20
    po_pedra_consumido_m3: 238.0, // Teórico: 500 * 0.4725 = 236.25
    total_agregados_consumidos_m3: 471.0,
    brita19_teorica_m3: 28.35,
    brita12_teorica_m3: 203.20,
    po_pedra_teorico_m3: 236.25,
    observacoes: 'Operação a plena carga. Testes de teor de umidade OK.',
    responsavel: 'Eng. Gabriel Laboratório'
  },
  {
    id: 'bda-2026-08-12',
    data: '2026-08-12',
    producao_diaria_cbuq_m3: 480.0,
    brita19_consumida_m3: 27.8, // Teórico: 480 * 0.0567 = 27.216
    brita12_consumida_m3: 196.5, // Teórico: 480 * 0.4064 = 195.072
    po_pedra_consumido_m3: 228.0, // Teórico: 480 * 0.4725 = 226.80
    total_agregados_consumidos_m3: 452.3,
    brita19_teorica_m3: 27.22,
    brita12_teorica_m3: 195.07,
    po_pedra_teorico_m3: 226.80,
    observacoes: 'Aplicação de CBUQ entre KM 12+500 e KM 14+200.',
    responsavel: 'Eng. Gabriel Laboratório'
  }
];

export const initialUsuarios = [
  { id: 'usr-1', nome: 'Eng. Plínio Cavalcanti Jr.', email: 'plinio@construtorapliniocavalcanti.com.br', cargo: 'Engenheiro Chefe de Obra', nivel_permissao: 'Admin', ativo: 1 },
  { id: 'usr-2', nome: 'Eng. Gabriel Laboratório', email: 'gabriel.lab@construtorapliniocavalcanti.com.br', cargo: 'Engenheiro de Produção & Traço', nivel_permissao: 'Engenheiro', ativo: 1 },
  { id: 'usr-3', nome: 'Carlos Almoxarife', email: 'carlos.materiais@construtorapliniocavalcanti.com.br', cargo: 'Responsável de Balança e Suprimentos', nivel_permissao: 'Almoxarifado', ativo: 1 },
  { id: 'usr-4', nome: 'Fiscalização DNIT / Consultoria', email: 'fiscal.dnit@dnit.gov.br', cargo: 'Engenheiro Fiscal DNIT', nivel_permissao: 'Consulta', ativo: 1 }
];

export const initialAuditLogs = [
  {
    id: 'log-001',
    data_hora: '2026-08-01 08:30:00',
    usuario: 'Eng. Plínio Cavalcanti Jr.',
    nivel_permissao: 'Admin',
    acao: 'INICIALIZACAO_SISTEMA',
    entidade: 'obras',
    detalhes: 'Cadastrada Obra 177/25 - BR-423/PE Lajedo a Garanhuns com Meta de 14.000 m³ de CBUQ.'
  },
  {
    id: 'log-002',
    data_hora: '2026-08-01 09:00:00',
    usuario: 'Eng. Gabriel Laboratório',
    nivel_permissao: 'Engenheiro',
    acao: 'ALTERACAO_TRACO',
    entidade: 'traco_config',
    detalhes: 'Configurado traço CBUQ: Brita 19 (5.67%), Brita 12 (40.64%), Pó de Pedra (47.25%). Total agregados: 93,56%.'
  },
  {
    id: 'log-003',
    data_hora: '2026-08-08 17:00:00',
    usuario: 'Carlos Almoxarife',
    nivel_permissao: 'Almoxarifado',
    acao: 'INCLUSAO_HISTORICA',
    entidade: 'recebimentos',
    detalhes: 'Importados dados históricos acumulados: Brita 19 (1.202,3 m³), Brita 12 (1.027,0 m³), Pó de Pedra (1.079,6 m³).'
  }
];
