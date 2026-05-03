/**
 * FloorMap - Mapa de Disponibilidade por Andar
 * Design: Interface Tecnológica Imersiva - Glassmorphism Dark Theme
 * Visual moderno com blocos interativos, tooltips animados e contadores por andar
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, TrendingUp } from 'lucide-react';
import { Unit, formatCurrency } from '@/data/units';

interface FloorMapProps {
  onUnitClick: (unit: Unit) => void;
  units: Unit[];
}

// Infere o andar a partir da cota (número da unidade)
function inferFloor(unit: Unit): string {
  const cota = unit.cota.trim().toUpperCase();
  // Lojas no térreo
  if (cota.startsWith('LOJA')) return 'Térreo';
  // Extrair o número da unidade
  const num = parseInt(cota.replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) {
    // Usar campo andar se cota não tem número
    const a = (unit.andar || '').trim().toUpperCase();
    if (a.includes('TÉRREO') || a.includes('TERREO')) return 'Térreo';
    if (a.includes('7')) return '7º Andar';
    return 'Outros';
  }
  // Inferir andar pelo número (2xx = 2º, 3xx = 3º, etc.)
  const floor = Math.floor(num / 100);
  if (floor === 2) return '2º Andar';
  if (floor === 3) return '3º Andar';
  if (floor === 4) return '4º Andar';
  if (floor === 5) return '5º Andar';
  if (floor === 6) return '6º Andar';
  if (floor === 7) return '7º Andar';
  // Duplex (números maiores ou tipologia DUPLEX)
  if (unit.tipologia === 'DUPLEX') return 'Duplex';
  return 'Térreo';
}

// Agrupa unidades por andar
function groupByFloor(units: Unit[]) {
  const floorOrder = ['Térreo', '2º Andar', '3º Andar', '4º Andar', '5º Andar', '6º Andar', '7º Andar', 'Duplex'];
  const map: Record<string, Unit[]> = {};
  units.forEach(u => {
    const floor = inferFloor(u);
    if (!map[floor]) map[floor] = [];
    map[floor].push(u);
  });
  // Ordena andares
  return floorOrder.filter(f => map[f]).map(f => ({ floor: f, units: map[f] }));
}

const STATUS_STYLES = {
  disponivel: {
    bg: 'bg-emerald-500',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.7)]',
    hover: 'hover:shadow-[0_0_14px_rgba(16,185,129,1)] hover:scale-110',
    dot: 'bg-emerald-400',
    label: 'Disponível',
    text: 'text-emerald-400',
    bar: 'bg-emerald-500',
  },
  reservado: {
    bg: 'bg-amber-500',
    glow: 'shadow-[0_0_6px_rgba(245,158,11,0.5)]',
    hover: 'hover:shadow-[0_0_12px_rgba(245,158,11,0.8)] hover:scale-110',
    dot: 'bg-amber-400',
    label: 'Reservado',
    text: 'text-amber-400',
    bar: 'bg-amber-500',
  },
  vendido: {
    bg: 'bg-red-600',
    glow: '',
    hover: 'hover:scale-105',
    dot: 'bg-red-500',
    label: 'Vendido',
    text: 'text-red-400',
    bar: 'bg-red-600',
  },
};

function UnitBlock({ unit, onUnitClick }: { unit: Unit; onUnitClick: (u: Unit) => void }) {
  const [hovered, setHovered] = useState(false);
  const style = STATUS_STYLES[unit.status];

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.button
        whileHover={{ scale: 1.15, zIndex: 10 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onUnitClick(unit)}
        className={`
          relative w-7 h-7 rounded-md cursor-pointer transition-all duration-200
          ${style.bg} ${style.glow} ${style.hover}
          flex items-center justify-center
          border border-white/10
        `}
      >
        <span className="text-[8px] font-bold text-white/80 leading-none select-none">
          {unit.cota.replace(/[^0-9]/g, '').slice(-2) || unit.cota.slice(0, 2)}
        </span>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          >
            <div className="bg-[#1a1208]/95 backdrop-blur-xl border border-white/15 rounded-xl px-3 py-2.5 shadow-2xl min-w-[140px] text-center">
              <p className="text-sm font-bold text-foreground">{unit.cota}</p>
              <p className="text-xs text-muted-foreground">{unit.tipologia} • {unit.areaTotal} m²</p>
              <p className={`text-xs font-semibold mt-1 ${style.text}`}>{style.label}</p>
              <p className="text-xs text-amber-300 font-medium mt-0.5">{formatCurrency(unit.valorTotal)}</p>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/15" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FloorMap({ onUnitClick, units }: FloorMapProps) {
  const floors = groupByFloor(units);

  const totalDisp = units.filter(u => u.status === 'disponivel').length;
  const totalRes = units.filter(u => u.status === 'reservado').length;
  const totalVend = units.filter(u => u.status === 'vendido').length;
  const pctDisp = Math.round((totalDisp / units.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl p-6 border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Mapa de Disponibilidade</h3>
            <p className="text-xs text-muted-foreground">Clique em qualquer unidade para ver detalhes</p>
          </div>
        </div>

        {/* Mini legenda + stat */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
              <span className="text-muted-foreground">{totalDisp} disp.</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span className="text-muted-foreground">{totalRes} res.</span>
            </span>
            {totalVend > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-600" />
                <span className="text-muted-foreground">{totalVend} vend.</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-3 py-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">{pctDisp}% livre</span>
          </div>
        </div>
      </div>

      {/* Andares */}
      <div className="space-y-3">
        {floors.map(({ floor, units: floorUnits }, floorIdx) => {
          const disp = floorUnits.filter(u => u.status === 'disponivel').length;
          const total = floorUnits.length;
          const pct = total > 0 ? (disp / total) * 100 : 0;

          return (
            <motion.div
              key={floor}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: floorIdx * 0.05 }}
              className="flex items-center gap-4 group"
            >
              {/* Label do andar */}
              <div className="w-20 shrink-0">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  {floor}
                </p>
                {/* Barra de progresso miniatura */}
                <div className="mt-1 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: floorIdx * 0.05 + 0.3, duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${pct > 60 ? 'bg-emerald-500' : pct > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                  />
                </div>
              </div>

              {/* Blocos de unidades */}
              <div className="flex flex-wrap gap-1.5 flex-1">
                {floorUnits.map(unit => (
                  <UnitBlock key={unit.id} unit={unit} onUnitClick={onUnitClick} />
                ))}
              </div>

              {/* Contador */}
              <div className="shrink-0 text-right w-16">
                <span className={`text-xs font-bold ${disp > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {disp}/{total}
                </span>
                <p className="text-[10px] text-muted-foreground">livre</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
