/**
 * Design: Interface Tecnológica Imersiva - Glassmorphism Dark Theme
 * Card de unidade com efeito de vidro, status indicator e hover lift
 * Modo comparação: overlay verde para seleção rápida sem abrir modal
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Compass, Maximize2, Car, MousePointerClick, Plus, Check } from 'lucide-react';
import { Unit, formatCurrency, getStatusLabel } from '@/data/units';
import { useCompare } from '@/contexts/CompareContext';

interface UnitCardProps {
  unit: Unit;
  onClick: () => void;
}

export function UnitCard({ unit, onClick }: UnitCardProps) {
  const { compareList, addToCompare, removeFromCompare, isInCompare } = useCompare();
  const compareMode = compareList.length > 0;
  const alreadyIn = isInCompare(unit.id);
  const isFull = compareList.length >= 3 && !alreadyIn;

  const statusColors = {
    disponivel: 'bg-emerald-500 shadow-[0_0_12px_theme(colors.emerald.500/60%)]',
    reservado: 'bg-amber-500 shadow-[0_0_12px_theme(colors.amber.500/60%)]',
    vendido: 'bg-red-500 shadow-[0_0_12px_theme(colors.red.500/60%)]',
  };

  const is2Dorm = unit.tipologia === '2 DORM';
  const isDuplex = unit.tipologia === 'DUPLEX';
  const isLoja = unit.tipologia.includes('LOJA');
  const hasVaga = is2Dorm || isDuplex || isLoja;

  const handleClick = (e: React.MouseEvent) => {
    if (compareMode) {
      e.stopPropagation();
      if (alreadyIn) {
        removeFromCompare(unit.id);
      } else if (!isFull) {
        addToCompare(unit);
      }
    } else {
      onClick();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        group relative w-full text-left
        glass-card rounded-xl p-5
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-primary/50
        ${is2Dorm ? 'col-span-1 md:col-span-2' : ''}
        ${compareMode && alreadyIn ? 'ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : ''}
        ${compareMode && isFull ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:border-white/20'}
      `}
      whileHover={!isFull ? { y: -4, scale: 1.02 } : {}}
      whileTap={!isFull ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Overlay de comparação rápida — aparece quando modo comparação está ativo */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 rounded-xl flex items-center justify-center z-10 pointer-events-none transition-all duration-200 ${
              alreadyIn
                ? 'bg-emerald-500/20'
                : isFull
                ? 'bg-black/30'
                : 'bg-emerald-500/0 group-hover:bg-emerald-500/15'
            }`}
          >
            {/* Faixa superior verde */}
            <div className={`absolute top-0 left-0 right-0 rounded-t-xl py-1.5 flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-200 ${
              alreadyIn
                ? 'bg-emerald-500 text-white'
                : isFull
                ? 'bg-gray-600/80 text-gray-300'
                : 'bg-emerald-600/80 text-white opacity-0 group-hover:opacity-100'
            }`}>
              {alreadyIn ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Selecionada
                </>
              ) : isFull ? (
                'Limite atingido'
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar à comparação
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {getStatusLabel(unit.status)}
        </span>
        <div className={`w-3 h-3 rounded-full ${statusColors[unit.status]}`} />
      </div>

      {/* Unit identifier */}
      <div className="mb-4 mt-4">
        <h3 className="text-2xl font-bold text-foreground group-hover:text-gradient transition-colors">
          {unit.cota.replace(/^DUPLEX\s+/i, '')}
        </h3>
        <p className="text-sm text-muted-foreground">{unit.andar}</p>
      </div>

      {/* Type badge */}
      <div className="mb-4">
        <span className={`
          inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
          ${isLoja 
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
            : is2Dorm 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }
        `}>
          <Building2 className="w-3.5 h-3.5" />
          {unit.tipologia}
        </span>
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Maximize2 className="w-4 h-4 text-primary/70" />
          <span>{unit.areaTotal} m²</span>
        </div>
        {unit.orientacaoSolar && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Compass className="w-4 h-4 text-primary/70" />
            <span className="truncate">{unit.orientacaoSolar.split('/')[0]}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
          <Car className="w-4 h-4 text-primary/70" />
          <span>
            {hasVaga 
              ? isLoja 
                ? '1 vaga' 
                : `Vaga ${unit.garagem}`
              : 'Sem vaga'
            }
          </span>
        </div>
      </div>

      {/* Price per m² */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground mb-0.5">Valor do m²</p>
        <p className="text-sm font-semibold text-primary/90">
          {formatCurrency(unit.valorM2)}
        </p>
      </div>

      {/* Price */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
        <p className="text-xl font-bold money text-gradient">
          {formatCurrency(unit.valorTotal)}
        </p>
      </div>

      {/* Click indicator — só aparece fora do modo comparação */}
      {!compareMode && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <span className="font-medium">Ver fluxo</span>
            <MousePointerClick className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none glow-blue" />
    </motion.button>
  );
}
