/**
 * Design: Interface Tecnológica Imersiva - Glassmorphism Dark Theme
 * Sidebar com navegação por andares e contadores de unidades
 * Atualizado para receber dados do Google Sheets em tempo real
 */

import { motion } from 'framer-motion';
import { Building, Store, ChevronRight, Home, Building2 } from 'lucide-react';
import { Unit } from '@/data/units';
import { cn } from '@/lib/utils';

interface SidebarProps {
  selectedFloor: string | null;
  onSelectFloor: (floor: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
  units: Unit[];
  floors: string[];
}

export function Sidebar({ selectedFloor, onSelectFloor, isOpen, onClose, units, floors }: SidebarProps) {
  // Special filters for Lojas and Duplex
  const specialFilters = [
    { id: 'Lojas', label: 'Lojas', icon: <Store className="w-5 h-5" /> },
    { id: 'Duplex', label: 'Duplex', icon: <Building2 className="w-5 h-5" /> },
  ];

  const floorIcons: Record<string, React.ReactNode> = {
    'Térreo': <Store className="w-5 h-5" />,
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-[280px] z-40',
          'bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border',
          'flex flex-col',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          ''
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img
              src="/images/regency-logo.png"
              alt=""
              className="w-11 h-11 object-contain drop-shadow-lg"
            />
            <img
              src="/images/regency-wordmark.png"
              alt="Regency Square Smart Stay"
              className="h-10 w-auto max-w-[170px] object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* All units button */}
          <button
            onClick={() => {
              onSelectFloor(null);
              // Close sidebar only on mobile
              if (window.innerWidth < 1024) {
                setTimeout(() => onClose(), 100);
              }
            }}
            className={cn(
              'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200',
              selectedFloor === null
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg glow-blue'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5" />
              <span className="font-medium">Todas as Unidades</span>
            </div>
            <span className="text-sm opacity-70">{units.length}</span>
          </button>

          <div className="py-3">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Andares
            </p>
          </div>

          {/* Special filters: Lojas */}
          <button
            onClick={() => {
              onSelectFloor('Lojas');
              // Close sidebar only on mobile
              if (window.innerWidth < 1024) {
                setTimeout(() => onClose(), 100);
              }
            }}
            className={cn(
              'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200',
              selectedFloor === 'Lojas'
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg glow-blue'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5" />
              <span className="font-medium">Lojas</span>
            </div>
            <ChevronRight className={cn(
              'w-4 h-4 transition-transform',
              selectedFloor === 'Lojas' && 'rotate-90'
            )} />
          </button>

          {/* Floor buttons */}
          {floors.map((floor) => {
            const isSelected = selectedFloor === floor;

            return (
              <button
                key={floor}
                onClick={() => {
                  onSelectFloor(floor);
                  // Close sidebar only on mobile
                  if (window.innerWidth < 1024) {
                    setTimeout(() => onClose(), 100);
                  }
                }}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200',
                  isSelected
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg glow-blue'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <div className="flex items-center gap-3">
                  {floorIcons[floor] || <Building className="w-5 h-5" />}
                  <span className="font-medium">{floor}</span>
                </div>
                <ChevronRight className={cn(
                  'w-4 h-4 transition-transform',
                  isSelected && 'rotate-90'
                )} />
              </button>
            );
          })}

          {/* Special filters: Duplex */}
          <button
            onClick={() => {
              onSelectFloor('Duplex');
              // Close sidebar only on mobile
              if (window.innerWidth < 1024) {
                setTimeout(() => onClose(), 100);
              }
            }}
            className={cn(
              'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200',
              selectedFloor === 'Duplex'
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg glow-blue'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5" />
              <span className="font-medium">Duplex</span>
            </div>
            <ChevronRight className={cn(
              'w-4 h-4 transition-transform',
              selectedFloor === 'Duplex' && 'rotate-90'
            )} />
          </button>
        </nav>

        {/* Footer stats */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="glass-card rounded-xl p-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-400">
                  {units.filter(u => u.status === 'disponivel').length}
                </p>
                <p className="text-xs text-muted-foreground">Disponíveis</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">
                  {units.filter(u => u.status === 'reservado').length}
                </p>
                <p className="text-xs text-muted-foreground">Reservados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">
                  {units.filter(u => u.status === 'vendido').length}
                </p>
                <p className="text-xs text-muted-foreground">Vendidos</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
