/**
 * CompareBar - Barra flutuante de comparação
 * Layout responsivo: vertical compacto no mobile, horizontal no desktop
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, GitCompare, Trash2 } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare, openCompare } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-3 sm:px-4 sm:pb-4"
      >
        <div className="max-w-4xl mx-auto bg-[#1a1208] border border-amber-500/40 rounded-2xl shadow-2xl shadow-black/60 p-3 sm:p-4">

          {/* Header da barra: título + limpar */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">
                Comparar ({compareList.length}/3)
              </span>
            </div>
            <button
              onClick={clearCompare}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              title="Limpar seleção"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          </div>

          {/* Slots de unidades — horizontal scrollável no mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 mb-2 sm:mb-3 scrollbar-none">
            {compareList.map(unit => (
              <motion.div
                key={unit.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5 shrink-0"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground whitespace-nowrap">{unit.cota}</p>
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap">{unit.tipologia}</p>
                </div>
                <button
                  onClick={() => removeFromCompare(unit.id)}
                  className="shrink-0 p-0.5 rounded-lg hover:bg-white/20 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}

            {/* Slots vazios */}
            {Array.from({ length: 3 - compareList.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center bg-white/5 border border-dashed border-white/20 rounded-xl px-4 py-1.5 text-[10px] text-muted-foreground shrink-0"
              >
                + unidade
              </div>
            ))}
          </div>

          {/* Botão Ver Comparativo — largura total no mobile */}
          <button
            onClick={openCompare}
            disabled={compareList.length < 2}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all ${
              compareList.length >= 2
                ? 'bg-emerald-500 hover:bg-emerald-400 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.9)]'
                : 'bg-emerald-700 opacity-40 cursor-not-allowed'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            Ver Comparativo
          </button>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
