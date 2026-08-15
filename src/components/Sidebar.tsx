import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Boxes,
  Scale,
  Sliders,
  Calculator,
  DollarSign,
  FileText,
  Building,
  ShieldCheck
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'recebimentos'
  | 'estoque'
  | 'balanco'
  | 'traco'
  | 'planejamento'
  | 'custos'
  | 'relatorios'
  | 'cadastros'
  | 'auditoria';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, alertCount }) => {
  const menuItems = [
    { id: 'dashboard', label: '1. Dashboard Executivo', icon: LayoutDashboard, badge: alertCount > 0 ? alertCount : null },
    { id: 'recebimentos', label: '2. Recebimento de Agregados', icon: Truck },
    { id: 'estoque', label: '3. Controle de Estoque', icon: Boxes },
    { id: 'balanco', label: '4. Balanço do Traço (Real x Teórico)', icon: Scale },
    { id: 'traco', label: '5. Configuração do Traço', icon: Sliders },
    { id: 'planejamento', label: '6. Planejamento & Simulador', icon: Calculator },
    { id: 'custos', label: '7. Custos & Análise de Cargas', icon: DollarSign },
    { id: 'relatorios', label: '8. Relatórios Técnicos', icon: FileText },
    { id: 'cadastros', label: '9. Cadastros & Multi-Obras', icon: Building },
    { id: 'auditoria', label: '10. Auditoria & Permissões', icon: ShieldCheck }
  ];

  return (
    <aside className="w-64 bg-asphalt-900 border-r border-asphalt-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-81px)]">
      <div className="py-4">
        <div className="px-4 mb-3">
          <h2 className="text-[11px] font-bold text-asphalt-400 uppercase tracking-wider font-mono">
            Módulos de Engenharia
          </h2>
        </div>
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as TabType)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-safety-amber border border-amber-500/30 font-semibold shadow-sm'
                    : 'text-asphalt-300 hover:bg-asphalt-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-safety-amber' : 'text-asphalt-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé do Menu */}
      <div className="p-4 border-t border-asphalt-800 text-[11px] text-asphalt-400 font-mono">
        <div className="flex items-center justify-between text-asphalt-300 font-semibold mb-1">
          <span>SISTEMA CBUQ</span>
          <span className="text-emerald-400">v1.0.0</span>
        </div>
        <div>Construtora Plínio Cavalcanti</div>
        <div className="text-[10px] text-asphalt-500 mt-1">BR-423/PE • Obra 177/25</div>
      </div>
    </aside>
  );
};
