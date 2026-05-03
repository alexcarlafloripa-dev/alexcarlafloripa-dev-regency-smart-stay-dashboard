/**
 * CompareContext - Contexto global para comparação de unidades
 * Gerencia até 3 unidades selecionadas para comparação
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { Unit } from '@/data/units';

interface CompareContextType {
  compareList: Unit[];
  addToCompare: (unit: Unit) => void;
  removeFromCompare: (unitId: string) => void;
  isInCompare: (unitId: string) => boolean;
  clearCompare: () => void;
  isCompareOpen: boolean;
  openCompare: () => void;
  closeCompare: () => void;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Unit[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const addToCompare = (unit: Unit) => {
    setCompareList(prev => {
      if (prev.find(u => u.id === unit.id)) return prev;
      if (prev.length >= 3) return prev;
      return [...prev, unit];
    });
  };

  const removeFromCompare = (unitId: string) => {
    setCompareList(prev => prev.filter(u => u.id !== unitId));
  };

  const isInCompare = (unitId: string) => {
    return compareList.some(u => u.id === unitId);
  };

  const clearCompare = () => {
    setCompareList([]);
    setIsCompareOpen(false);
  };

  const openCompare = () => setIsCompareOpen(true);
  const closeCompare = () => setIsCompareOpen(false);

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare,
      isCompareOpen,
      openCompare,
      closeCompare,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
