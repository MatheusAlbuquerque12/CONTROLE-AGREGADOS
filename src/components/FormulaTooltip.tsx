import React, { useState } from 'react';
import { HelpCircle, Info, X } from 'lucide-react';

interface FormulaTooltipProps {
  titulo: string;
  formula: string;
  explicacao: string;
  exemplo?: string;
}

export const FormulaTooltip: React.FC<FormulaTooltipProps> = ({ titulo, formula, explicacao, exemplo }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-1.5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-asphalt-400 hover:text-safety-amber transition-colors focus:outline-none p-0.5"
        title="Ver fórmula técnica e memória de cálculo"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-asphalt-900 border border-asphalt-700 rounded-xl p-5 max-w-md w-full shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-asphalt-800 pb-3 mb-3">
              <div className="flex items-center gap-2 text-safety-amber font-semibold text-sm">
                <Info className="w-4 h-4" />
                <span>Memória de Cálculo: {titulo}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-asphalt-400 hover:text-white p-1 rounded hover:bg-asphalt-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-asphalt-400 font-semibold block mb-1">Fórmula Utilizada:</span>
                <div className="bg-asphalt-950 p-2.5 rounded border border-asphalt-800 font-mono text-emerald-400 text-xs tracking-tight">
                  {formula}
                </div>
              </div>

              <div>
                <span className="text-asphalt-400 font-semibold block mb-1">Detalhamento Técnico:</span>
                <p className="text-asphalt-200 leading-relaxed">{explicacao}</p>
              </div>

              {exemplo && (
                <div className="bg-asphalt-800/50 p-2.5 rounded border border-asphalt-700/50">
                  <span className="text-safety-amber font-semibold block mb-1">Exemplo Prático na Obra:</span>
                  <p className="text-asphalt-300 font-mono text-[11px] leading-relaxed">{exemplo}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-asphalt-800 text-right">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 bg-asphalt-800 hover:bg-asphalt-700 text-white rounded text-xs font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
