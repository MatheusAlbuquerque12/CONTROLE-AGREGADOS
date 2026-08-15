import express from 'express';
import cors from 'cors';
import { db } from './db/database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper de normalização de descrições dos materiais
function normalizarNomeMaterial(raw) {
  if (!raw) return '';
  const clean = raw.trim().toUpperCase();
  if (clean.includes('12') || clean.includes('12,5') || clean.includes('12.5')) return 'BRITA 12 MM';
  if (clean.includes('19') || clean.includes('3/4')) return 'BRITA 19 MM';
  if (clean.includes('PÓ') || clean.includes('PO DE PEDRA') || clean.includes('PO')) return 'PÓ DE PEDRA';
  if (clean.includes('GRADUADA') || clean.includes('BGC') || clean.includes('BGS')) return 'BRITA GRADUADA';
  if (clean.includes('RACHINHA') || clean.includes('RACHAO')) return 'RACHINHA';
  return clean;
}

// ----------------------------------------------------
// 1. DASHBOARD COMPLETO & DADOS CONSOLIDADOS
// ----------------------------------------------------
app.get('/api/dashboard', (req, res) => {
  db.recalcularEstoque();
  const obra = db.data.obras[0];
  const materiais = db.data.materiais;
  const traco = db.data.traco_config;
  const recebimentos = db.data.recebimentos;
  const boletins = db.data.boletim_diario;

  // Calculo de recebimentos totais por material
  const totalRecebidoM3 = recebimentos.reduce((acc, r) => acc + (Number(r.quantidade_m3) || 0), 0);
  const totalCustoRecebido = recebimentos.reduce((acc, r) => acc + (Number(r.valor_total) || 0), 0);

  const brita19 = materiais.find(m => m.id === 'mat-brita-19') || {};
  const brita12 = materiais.find(m => m.id === 'mat-brita-12') || {};
  const poPedra = materiais.find(m => m.id === 'mat-po-pedra') || {};

  // Necessidades Teóricas para a Meta de 14.000 m³ CBUQ
  const metaCBUQ = obra.producao_prevista_m3 || 14000;
  const necBrita19Teorica = (metaCBUQ * (brita19.percentual_traco / 100));
  const necBrita12Teorica = (metaCBUQ * (brita12.percentual_traco / 100));
  const necPoPedraTeorica = (metaCBUQ * (poPedra.percentual_traco / 100));
  const totalAgregadosTeorico = necBrita19Teorica + necBrita12Teorica + necPoPedraTeorica;

  // Produção realizada e saldo a produzir
  const producaoRealizada = boletins.reduce((acc, b) => acc + Number(b.producao_diaria_cbuq_m3 || 0), obra.producao_realizada_m3 || 0);
  const saldoAProduzir = Math.max(0, metaCBUQ - producaoRealizada);
  const percentualAvancoFisico = Number(((producaoRealizada / metaCBUQ) * 100).toFixed(2));

  // Consumos acumulados reais
  const brita19Consumida = boletins.reduce((acc, b) => acc + Number(b.brita19_consumida_m3 || 0), 0);
  const brita12Consumida = boletins.reduce((acc, b) => acc + Number(b.brita12_consumida_m3 || 0), 0);
  const poPedraConsumido = boletins.reduce((acc, b) => acc + Number(b.po_pedra_consumido_m3 || 0), 0);

  // Quantidade recebida por material do traço
  const brita19Recebida = recebimentos.filter(r => r.material_id === 'mat-brita-19').reduce((acc, r) => acc + Number(r.quantidade_m3 || 0), 0);
  const brita12Recebida = recebimentos.filter(r => r.material_id === 'mat-brita-12').reduce((acc, r) => acc + Number(r.quantidade_m3 || 0), 0);
  const poPedraRecebido = recebimentos.filter(r => r.material_id === 'mat-po-pedra').reduce((acc, r) => acc + Number(r.quantidade_m3 || 0), 0);
  const outrosRecebidos = recebimentos.filter(r => !['mat-brita-19', 'mat-brita-12', 'mat-po-pedra'].includes(r.material_id)).reduce((acc, r) => acc + Number(r.quantidade_m3 || 0), 0);

  // Estoques Atuais
  const estoqueBrita19 = brita19.estoque_atual || 0;
  const estoqueBrita12 = brita12.estoque_atual || 0;
  const estoquePoPedra = poPedra.estoque_atual || 0;
  const estoqueTotalTraco = estoqueBrita19 + estoqueBrita12 + estoquePoPedra;

  // Resposta à pergunta: "Quantos m³ de CBUQ conseguimos produzir com o estoque atual?" (Material Limitante)
  const maxCBUQ_Brita19 = (estoqueBrita19 / (brita19.percentual_traco / 100)) || 0;
  const maxCBUQ_Brita12 = (estoqueBrita12 / (brita12.percentual_traco / 100)) || 0;
  const maxCBUQ_PoPedra = (estoquePoPedra / (poPedra.percentual_traco / 100)) || 0;

  const producaoMaximaCBUQEstoque = Math.floor(Math.min(maxCBUQ_Brita19, maxCBUQ_Brita12, maxCBUQ_PoPedra));
  let materialLimitante = 'BRITA 12 MM';
  if (producaoMaximaCBUQEstoque === Math.floor(maxCBUQ_Brita19)) materialLimitante = 'BRITA 19 MM';
  if (producaoMaximaCBUQEstoque === Math.floor(maxCBUQ_PoPedra)) materialLimitante = 'PÓ DE PEDRA';

  // Sistema de Alertas de Engenharia
  const alertas = [];
  if (estoqueBrita12 < brita12.estoque_minimo) {
    alertas.push({ tipo: 'CRITICO', titulo: 'ESTOQUE CRÍTICO', mensagem: `Estoque de Brita 12 mm (${estoqueBrita12.toLocaleString('pt-BR')} m³) está abaixo do estoque mínimo de ${brita12.estoque_minimo.toLocaleString('pt-BR')} m³.` });
  }
  if (estoqueBrita19 < brita19.estoque_minimo) {
    alertas.push({ tipo: 'CRITICO', titulo: 'ESTOQUE CRÍTICO', mensagem: `Estoque de Brita 19 mm (${estoqueBrita19.toLocaleString('pt-BR')} m³) está abaixo do estoque mínimo de ${brita19.estoque_minimo.toLocaleString('pt-BR')} m³.` });
  }
  if (estoquePoPedra < poPedra.estoque_minimo) {
    alertas.push({ tipo: 'CRITICO', titulo: 'ESTOQUE CRÍTICO', mensagem: `Estoque de Pó de Pedra (${estoquePoPedra.toLocaleString('pt-BR')} m³) está abaixo do estoque mínimo de ${poPedra.estoque_minimo.toLocaleString('pt-BR')} m³.` });
  }

  // Verificar desvio de consumo real vs teórico
  const consumoTeoricoBrita12 = producaoRealizada * (brita12.percentual_traco / 100);
  if (brita12Consumida > 0 && consumoTeoricoBrita12 > 0) {
    const desvio12 = ((brita12Consumida - consumoTeoricoBrita12) / consumoTeoricoBrita12) * 100;
    if (desvio12 > 5) {
      alertas.push({ tipo: 'ATENCAO', titulo: 'DIVERGÊNCIA DE TRAÇO', mensagem: `Consumo real de Brita 12 mm está ${desvio12.toFixed(1)}% acima do consumo teórico calculado.` });
    }
  }

  if (alertas.length === 0) {
    alertas.push({ tipo: 'OK', titulo: 'ESTOQUE ADEQUADO', mensagem: `Quantidade disponível de agregados é suficiente para a programação atual de produção de CBUQ.` });
  }

  res.json({
    obra: {
      ...obra,
      producao_realizada_m3: producaoRealizada,
      saldo_a_produzir_m3: saldoAProduzir,
      percentual_avanco: percentualAvancoFisico
    },
    materiais,
    traco,
    resumo: {
      meta_cbuq_m3: metaCBUQ,
      total_recebido_m3: totalRecebidoM3,
      total_custo_recebido: totalCustoRecebido,
      brita19: {
        teorico_m3: necBrita19Teorica,
        recebido_m3: brita19Recebida,
        consumido_m3: brita19Consumida,
        estoque_m3: estoqueBrita19,
        saldo_necessario_m3: Math.max(0, necBrita19Teorica - brita19Recebida),
        percentual_atendimento: Number(((brita19Recebida / necBrita19Teorica) * 100).toFixed(1))
      },
      brita12: {
        teorico_m3: necBrita12Teorica,
        recebido_m3: brita12Recebida,
        consumido_m3: brita12Consumida,
        estoque_m3: estoqueBrita12,
        saldo_necessario_m3: Math.max(0, necBrita12Teorica - brita12Recebida),
        percentual_atendimento: Number(((brita12Recebida / necBrita12Teorica) * 100).toFixed(1))
      },
      po_pedra: {
        teorico_m3: necPoPedraTeorica,
        recebido_m3: poPedraRecebido,
        consumido_m3: poPedraConsumido,
        estoque_m3: estoquePoPedra,
        saldo_necessario_m3: Math.max(0, necPoPedraTeorica - poPedraRecebido),
        percentual_atendimento: Number(((poPedraRecebido / necPoPedraTeorica) * 100).toFixed(1))
      },
      outros: {
        recebido_m3: outrosRecebidos
      },
      estoque_total_m3: estoqueTotalTraco
    },
    respostas_engenheiro: {
      quanto_recebemos_m3: totalRecebidoM3,
      quanto_temos_estoque_m3: estoqueTotalTraco,
      quanto_consumimos_m3: brita19Consumida + brita12Consumida + poPedraConsumido,
      quanto_precisamos_comprar_m3: Math.max(0, totalAgregadosTeorico - totalRecebidoM3),
      producao_maxima_cbuq_estoque_m3: producaoMaximaCBUQEstoque,
      material_limitante: materialLimitante,
      custo_total_gastos: totalCustoRecebido,
      avanço_obra_percentual: percentualAvancoFisico
    },
    alertas
  });
});

// ----------------------------------------------------
// 2. MÓDULO DE RECEBIMENTOS & TICKETS
// ----------------------------------------------------
app.get('/api/recebimentos', (req, res) => {
  res.json(db.data.recebimentos);
});

app.post('/api/recebimentos', (req, res) => {
  const { data, ticket, fornecedor, material_nome, quantidade_original, unidade_original, preco_unitario, centro_custo, responsavel_lancamento, observacao } = req.body;

  // Validação de deduplicação pelo número do Ticket
  const ticketExistente = db.data.recebimentos.find(r => r.ticket.trim().toUpperCase() === ticket.trim().toUpperCase());
  if (ticketExistente) {
    return res.status(400).json({ error: `O ticket N° ${ticket} já foi cadastrado anteriormente no sistema.` });
  }

  const nomeNormalizado = normalizarNomeMaterial(material_nome);
  const materialObj = db.data.materiais.find(m => m.nome === nomeNormalizado) || { id: 'mat-outros', preco_unitario_atual: preco_unitario || 100 };

  const qtdM3 = Number(quantidade_original || 0);
  const pu = Number(preco_unitario || materialObj.preco_unitario_atual || 100);
  const valTotal = qtdM3 * pu;

  const novoRecebimento = {
    id: `rec-${Date.now()}`,
    data: data || new Date().toISOString().split('T')[0],
    ticket: ticket.trim().toUpperCase(),
    fornecedor: fornecedor || 'Pedreira MDG',
    material_id: materialObj.id,
    material_nome: nomeNormalizado,
    quantidade_original: qtdM3,
    unidade_original: unidade_original || 'm³',
    quantidade_m3: qtdM3,
    preco_unitario: pu,
    valor_total: valTotal,
    centro_custo: centro_custo || '177/25',
    responsavel_lancamento: responsavel_lancamento || 'Engenheiro',
    observacao: observacao || ''
  };

  db.data.recebimentos.unshift(novoRecebimento);
  db.logAudit(responsavel_lancamento, 'Engenheiro', 'INCLUSAO', 'recebimentos', `Lançado ticket ${ticket} (${nomeNormalizado}): ${qtdM3} m³`);
  db.recalcularEstoque();

  res.status(201).json(novoRecebimento);
});

app.put('/api/recebimentos/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.data.recebimentos.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Recebimento não encontrado.' });

  const updated = { ...db.data.recebimentos[idx], ...req.body };
  updated.material_nome = normalizarNomeMaterial(updated.material_nome);
  updated.valor_total = Number(updated.quantidade_m3) * Number(updated.preco_unitario);

  db.data.recebimentos[idx] = updated;
  db.logAudit(req.body.usuario || 'Engenheiro', 'Engenheiro', 'ALTERACAO', 'recebimentos', `Alterado ticket ${updated.ticket}`);
  db.recalcularEstoque();

  res.json(updated);
});

app.delete('/api/recebimentos/:id', (req, res) => {
  const { id } = req.params;
  const item = db.data.recebimentos.find(r => r.id === id);
  if (!item) return res.status(404).json({ error: 'Recebimento não encontrado.' });

  db.data.recebimentos = db.data.recebimentos.filter(r => r.id !== id);
  db.logAudit('Engenheiro', 'Engenheiro', 'EXCLUSAO', 'recebimentos', `Excluído ticket ${item.ticket} (${item.material_nome})`);
  db.recalcularEstoque();

  res.json({ message: 'Ticket excluído com sucesso.' });
});

// ----------------------------------------------------
// 3. MOVIMENTAÇÕES E AJUSTES DE ESTOQUE
// ----------------------------------------------------
app.get('/api/estoque/movimentacoes', (req, res) => {
  res.json(db.data.movimentacoes_estoque);
});

app.post('/api/estoque/ajuste', (req, res) => {
  const { material_id, tipo, quantidade_m3, motivo, responsavel, observacao } = req.body;

  if (!motivo || !motivo.trim()) {
    return res.status(400).json({ error: 'O motivo do ajuste manual de estoque é obrigatório.' });
  }

  const mat = db.data.materiais.find(m => m.id === material_id);
  if (!mat) return res.status(404).json({ error: 'Material não encontrado.' });

  const novaMovimentacao = {
    id: `mov-${Date.now()}`,
    data: new Date().toISOString().split('T')[0],
    tipo: tipo || 'AJUSTE',
    material_id,
    material_nome: mat.nome,
    quantidade_m3: Number(quantidade_m3),
    motivo,
    responsavel: responsavel || 'Engenheiro',
    observacao: observacao || ''
  };

  db.data.movimentacoes_estoque.unshift(novaMovimentacao);
  db.logAudit(responsavel, 'Engenheiro', 'AJUSTE_ESTOQUE', 'estoque', `Ajuste (${tipo}) de ${quantidade_m3} m³ para ${mat.nome}. Motivo: ${motivo}`);
  db.recalcularEstoque();

  res.status(201).json(novaMovimentacao);
});

// ----------------------------------------------------
// 4. CONFIGURAÇÃO DE TRAÇO
// ----------------------------------------------------
app.get('/api/traco', (req, res) => {
  res.json(db.data.traco_config);
});

app.put('/api/traco', (req, res) => {
  const { percentual_agregados_configurado, base_calculo, densidade_mistura_t_m3, responsavel, observacoes, itens } = req.body;

  db.data.traco_config = {
    ...db.data.traco_config,
    percentual_agregados_configurado: Number(percentual_agregados_configurado || 93.56),
    percentual_restante: Number((100 - Number(percentual_agregados_configurado || 93.56)).toFixed(2)),
    base_calculo: base_calculo || 'Volume',
    densidade_mistura_t_m3: Number(densidade_mistura_t_m3 || 2.40),
    data_atualizacao: new Date().toISOString().split('T')[0],
    responsavel: responsavel || 'Engenheiro',
    observacoes: observacoes || db.data.traco_config.observacoes,
    itens: itens || db.data.traco_config.itens
  };

  // Se houver atualização de percentuais em materiais
  if (itens && Array.isArray(itens)) {
    itens.forEach(it => {
      const mat = db.data.materiais.find(m => m.id === it.material_id);
      if (mat) {
        mat.percentual_traco = Number(it.percentual);
      }
    });
  }

  db.logAudit(responsavel, 'Engenheiro', 'ALTERACAO_TRACO', 'traco_config', `Traço atualizado. Agregados: ${db.data.traco_config.percentual_agregados_configurado}%. Restante: ${db.data.traco_config.percentual_restante}%. Base: ${db.data.traco_config.base_calculo}`);
  db.save();

  res.json(db.data.traco_config);
});

// ----------------------------------------------------
// 5. FATORES DE CONVERSÃO
// ----------------------------------------------------
app.get('/api/fatores-conversao', (req, res) => {
  res.json(db.data.fatores_conversao);
});

app.post('/api/fatores-conversao', (req, res) => {
  const { material_id, material_nome, massa_especifica_t_m3, fonte_fator, responsavel } = req.body;
  const me = Number(massa_especifica_t_m3);
  const m3t = Number((1 / me).toFixed(4));

  const novoFator = {
    id: `fat-${Date.now()}`,
    material_id,
    material_nome,
    massa_especifica_t_m3: me,
    m3_t: m3t,
    data_vigencia: new Date().toISOString().split('T')[0],
    fonte_fator: fonte_fator || 'Laboratório Obra 177/25',
    responsavel: responsavel || 'Engenheiro'
  };

  db.data.fatores_conversao.unshift(novoFator);
  db.logAudit(responsavel, 'Engenheiro', 'ALTERACAO_FATOR', 'fatores_conversao', `Novo fator cadastrado para ${material_nome}: ${me} t/m³`);
  db.save();

  res.status(201).json(novoFator);
});

// ----------------------------------------------------
// 6. BOLETIM DIÁRIO DE AGREGADOS (BDA)
// ----------------------------------------------------
app.get('/api/boletim-diario', (req, res) => {
  res.json(db.data.boletim_diario);
});

app.post('/api/boletim-diario', (req, res) => {
  const { data, producao_diaria_cbuq_m3, brita19_consumida_m3, brita12_consumida_m3, po_pedra_consumido_m3, observacoes, responsavel } = req.body;

  const prodCBUQ = Number(producao_diaria_cbuq_m3 || 0);

  // Cálculo automático do consumo teórico com base no traço
  const b19 = db.data.materiais.find(m => m.id === 'mat-brita-19') || { percentual_traco: 5.67 };
  const b12 = db.data.materiais.find(m => m.id === 'mat-brita-12') || { percentual_traco: 40.64 };
  const po = db.data.materiais.find(m => m.id === 'mat-po-pedra') || { percentual_traco: 47.25 };

  const b19Teorica = Number((prodCBUQ * (b19.percentual_traco / 100)).toFixed(2));
  const b12Teorica = Number((prodCBUQ * (b12.percentual_traco / 100)).toFixed(2));
  const poTeorico = Number((prodCBUQ * (po.percentual_traco / 100)).toFixed(2));

  const c19Real = Number(brita19_consumida_m3 || b19Teorica);
  const c12Real = Number(brita12_consumida_m3 || b12Teorica);
  const cPoReal = Number(po_pedra_consumido_m3 || poTeorico);
  const totalReal = Number((c19Real + c12Real + cPoReal).toFixed(2));

  const novoBoletim = {
    id: `bda-${data || Date.now()}`,
    data: data || new Date().toISOString().split('T')[0],
    producao_diaria_cbuq_m3: prodCBUQ,
    brita19_consumida_m3: c19Real,
    brita12_consumida_m3: c12Real,
    po_pedra_consumido_m3: cPoReal,
    total_agregados_consumidos_m3: totalReal,
    brita19_teorica_m3: b19Teorica,
    brita12_teorica_m3: b12Teorica,
    po_pedra_teorico_m3: poTeorico,
    observacoes: observacoes || '',
    responsavel: responsavel || 'Eng. Gabriel Laboratório'
  };

  // Se já existir BDA para esta data, substituir
  const idx = db.data.boletim_diario.findIndex(b => b.data === novoBoletim.data);
  if (idx !== -1) {
    db.data.boletim_diario[idx] = novoBoletim;
  } else {
    db.data.boletim_diario.unshift(novoBoletim);
  }

  db.logAudit(responsavel, 'Engenheiro', 'INCLUSAO', 'boletim_diario', `Boletim Diário ${novoBoletim.data}: ${prodCBUQ} m³ CBUQ produzido`);
  db.recalcularEstoque();

  res.status(201).json(novoBoletim);
});

// ----------------------------------------------------
// 7. SIMULADOR DE PRODUÇÃO (MODO 1 E MODO 2)
// ----------------------------------------------------
app.post('/api/simulador', (req, res) => {
  const { modo, volume_cbuq_desejado_m3 } = req.body;
  db.recalcularEstoque();

  const b19 = db.data.materiais.find(m => m.id === 'mat-brita-19');
  const b12 = db.data.materiais.find(m => m.id === 'mat-brita-12');
  const po = db.data.materiais.find(m => m.id === 'mat-po-pedra');

  if (modo === 'DESEJADO') {
    const vol = Number(volume_cbuq_desejado_m3 || 1000);
    const necB19 = Number((vol * (b19.percentual_traco / 100)).toFixed(2));
    const necB12 = Number((vol * (b12.percentual_traco / 100)).toFixed(2));
    const necPo = Number((vol * (po.percentual_traco / 100)).toFixed(2));

    const estB19 = b19.estoque_atual;
    const estB12 = b12.estoque_atual;
    const estPo = po.estoque_atual;

    const defB19 = Math.max(0, Number((necB19 - estB19).toFixed(2)));
    const defB12 = Math.max(0, Number((necB12 - estB12).toFixed(2)));
    const defPo = Math.max(0, Number((necPo - estPo).toFixed(2)));

    res.json({
      volume_desejado_cbuq_m3: vol,
      necessidade: {
        brita19_m3: necB19,
        brita12_m3: necB12,
        po_pedra_m3: necPo,
        total_agregados_m3: Number((necB19 + necB12 + necPo).toFixed(2))
      },
      estoque_disponivel: {
        brita19_m3: estB19,
        brita12_m3: estB12,
        po_pedra_m3: estPo
      },
      deficit: {
        brita19_m3: defB19,
        brita12_m3: defB12,
        po_pedra_m3: defPo
      },
      possivel_com_estoque: defB19 === 0 && defB12 === 0 && defPo === 0
    });
  } else {
    // MODO ESTOQUE_ATUAL
    const maxB19 = (b19.estoque_atual / (b19.percentual_traco / 100));
    const maxB12 = (b12.estoque_atual / (b12.percentual_traco / 100));
    const maxPo = (po.estoque_atual / (po.percentual_traco / 100));

    const maxCBUQ = Math.floor(Math.min(maxB19, maxB12, maxPo));
    let limitante = 'BRITA 12 MM';
    if (maxCBUQ === Math.floor(maxB19)) limitante = 'BRITA 19 MM';
    if (maxCBUQ === Math.floor(maxPo)) limitante = 'PÓ DE PEDRA';

    res.json({
      producao_maxima_cbuq_m3: maxCBUQ,
      material_limitante: limitante,
      capacidade_por_material: {
        brita19_max_cbuq_m3: Math.floor(maxB19),
        brita12_max_cbuq_m3: Math.floor(maxB12),
        po_pedra_max_cbuq_m3: Math.floor(maxPo)
      }
    });
  }
});

// ----------------------------------------------------
// 8. USUÁRIOS & AUDIT LOGS
// ----------------------------------------------------
app.get('/api/usuarios', (req, res) => {
  res.json(db.data.usuarios);
});

app.get('/api/audit-logs', (req, res) => {
  res.json(db.data.audit_log);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`[API CONSTRUTORA PLINIO CAVALCANTI] Servidor rodando na porta ${PORT}`);
});
