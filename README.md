# Controle e Gestão de Agregados CBUQ — Obra 177/25
**Construtora Plínio Cavalcanti LTDA** | **BR-423/PE (Lajedo-PE → Garanhuns-PE)**

Sistema corporativo de engenharia para controle de recebimento, estoque, consumo em usina, balanço de traço, simulador de produção, custos e relatórios auditáveis para a produção de **14.000 m³ de CBUQ**.

---

## 📌 Contexto da Obra
- **Empresa**: Construtora Plínio Cavalcanti LTDA
- **Centro de Custo**: `177/25`
- **Serviço**: Produção e aplicação de CBUQ (Faixa C DNIT)
- **Rodovia**: BR-423/PE (Trecho Lajedo-PE → Garanhuns-PE)
- **Meta de Produção**: **14.000 m³ de CBUQ**
- **Fornecedor Principal**: Pedreira MDG

---

## 🧱 Traço de CBUQ Homologado
- **Brita 19 mm**: 5,67% (793,80 m³)
- **Brita 12 mm**: 40,64% (5.689,60 m³)
- **Pó de Pedra**: 47,25% (6.615,00 m³)
- **Percentual de Agregados Configurado**: **93,56%** (13.098,40 m³)
- **Percentual Restante**: **6,44%** (não parametrizado nesta fase)

---

## 🛠️ Tecnologias Utilizadas
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, SheetJS (xlsx)
- **Backend / API**: Node.js, Express.js, Persistência Relacional com Audit Logs e deduplicação de tickets
- **Formatação**: Padrão numérico brasileiro PT-BR (`14.000`, `793,80`, `R$`)

---

## 🚀 Como Executar o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor backend Express (Porta 3001)
npm run server

# 3. Em outro terminal, iniciar o servidor frontend (Porta 5173)
npm run dev
```

Acesse a aplicação em [http://localhost:5173/](http://localhost:5173/).

---

## ⚙️ Módulos do Sistema
1. **Dashboard Executivo Obra 177/25**
2. **Recebimento de Agregados & Pesagem por Ticket**
3. **Controle de Estoque & Fatores de Conversão (t/m³)**
4. **Balanço do Traço (Consumo Real vs Teórico & BDA)**
5. **Configuração do Traço (Volume vs Massa)**
6. **Planejamento de Suprimentos & Simulador de Produção**
7. **Custos & Análise de Cargas por Agregado**
8. **Relatórios Técnicos Auditáveis (Excel / PDF)**
9. **Cadastros Multi-Obras & Permissões (RBAC)**
10. **Trilha de Auditoria (Audit Logs)**
