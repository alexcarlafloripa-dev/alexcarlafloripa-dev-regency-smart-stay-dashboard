/**
 * Design: Interface Tecnológica Imersiva - Glassmorphism Dark Theme
 * Barra de filtros com pills clicáveis para tipologia
 */

import { motion } from 'framer-motion';
import { Building2, Home, Store, Filter } from 'lucide-react';
import { UnitType } from '@/data/units';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  selectedType: UnitType | null;
  onSelectType: (type: UnitType | null) => void;
}

const typeConfig: { type: UnitType | null; label: string; icon: React.ReactNode }[] = [
  { type: null, label: 'Todos', icon: <Filter className="w-4 h-4" /> },
  { type: 'STUDIO', label: 'Studio', icon: <Home className="w-4 h-4" /> },
  { type: '2 DORM', label: '2 Dormitórios', icon: <Building2 className="w-4 h-4" /> },
  { type: 'DUPLEX', label: 'Duplex', icon: <Building2 className="w-4 h-4" /> },
  { type: 'LOJA', label: 'Lojas', icon: <Store className="w-4 h-4" /> },
];

export function FilterBar({ selectedType, onSelectType }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {typeConfig.map(({ type, label, icon }) => {
        const isSelected = selectedType === type;
        
        return (
          <motion.button
            key={label}
            onClick={() => onSelectType(type)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/10'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {icon}
            <span>{label}</span>
            {isSelected && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 rounded-full bg-primary -z-10"
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
