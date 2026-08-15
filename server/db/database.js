import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initialObra,
  initialMateriais,
  initialTraco,
  initialFatoresConversao,
  initialRecebimentos,
  initialBoletins,
  initialUsuarios,
  initialAuditLogs
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Garantir diretório de dados
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.data = {
      obras: [],
      materiais: [],
      traco_config: {},
      fatores_conversao: [],
      recebimentos: [],
      movimentacoes_estoque: [],
      boletim_diario: [],
      usuarios: [],
      audit_log: []
    };
    this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        // Verificar integridade e aplicar defaults caso vazio
        if (!this.data.obras || this.data.obras.length === 0) {
          this.seed();
        }
      } catch (err) {
        console.error('Erro ao ler DB JSON, recriando seed:', err);
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  seed() {
    this.data = {
      obras: [initialObra],
      materiais: [...initialMateriais],
      traco_config: { ...initialTraco },
      fatores_conversao: [...initialFatoresConversao],
      recebimentos: [...initialRecebimentos],
      movimentacoes_estoque: [],
      boletim_diario: [...initialBoletins],
      usuarios: [...initialUsuarios],
      audit_log: [...initialAuditLogs]
    };
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Erro ao salvar no DB JSON:', err);
    }
  }

  // --- MÉTODOS DE AUDITORIA ---
  logAudit(usuario, nivel, acao, entidade, detalhes) {
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      usuario: usuario || 'Sistema',
      nivel_permissao: nivel || 'Engenheiro',
      acao,
      entidade,
      detalhes
    };
    this.data.audit_log.unshift(newLog);
    this.save();
    return newLog;
  }

  // --- RECALCULAR ESTOQUE E CONSUMOS ---
  recalcularEstoque() {
    // Para cada material: Estoque Inicial + Total Recebido - Total Consumido Diário + Ajustes
    const materiaisMap = {};
    this.data.materiais.forEach(m => {
      materiaisMap[m.id] = { ...m, total_recebido: 0, total_consumido: 0, total_ajustes: 0 };
    });

    // Somar recebimentos
    this.data.recebimentos.forEach(rec => {
      if (materiaisMap[rec.material_id]) {
        materiaisMap[rec.material_id].total_recebido += Number(rec.quantidade_m3 || 0);
      }
    });

    // Somar consumos do Boletim Diário
    this.data.boletim_diario.forEach(bda => {
      if (materiaisMap['mat-brita-19']) materiaisMap['mat-brita-19'].total_consumido += Number(bda.brita19_consumida_m3 || 0);
      if (materiaisMap['mat-brita-12']) materiaisMap['mat-brita-12'].total_consumido += Number(bda.brita12_consumida_m3 || 0);
      if (materiaisMap['mat-po-pedra']) materiaisMap['mat-po-pedra'].total_consumido += Number(bda.po_pedra_consumido_m3 || 0);
    });

    // Somar movimentações de ajuste
    this.data.movimentacoes_estoque.forEach(mov => {
      if (materiaisMap[mov.material_id]) {
        if (mov.tipo === 'ENTRADA') {
          materiaisMap[mov.material_id].total_ajustes += Number(mov.quantidade_m3 || 0);
        } else {
          materiaisMap[mov.material_id].total_ajustes -= Number(mov.quantidade_m3 || 0);
        }
      }
    });

    // Atualizar estoque_atual em materiais
    this.data.materiais = this.data.materiais.map(m => {
      const calc = materiaisMap[m.id];
      if (calc) {
        // Se for um material do traço, o estoque atual é o Total Recebido - Total Consumido + Ajustes
        const novoEstoque = Math.max(0, Number((calc.total_recebido - calc.total_consumido + calc.total_ajustes).toFixed(2)));
        return { ...m, estoque_atual: novoEstoque };
      }
      return m;
    });

    this.save();
  }
}

export const db = new Database();
