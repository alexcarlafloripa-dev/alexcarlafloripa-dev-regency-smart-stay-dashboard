/**
 * Hook para buscar dados do Google Sheets em tempo real
 * Design: Interface Tecnológica Imersiva - Glassmorphism Dark Theme
 */

import { useState, useEffect, useCallback } from 'react';
import { Unit, UnitStatus, UnitType } from '@/data/units';

const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjDs63JAfCx11pfxJSOQysc506F0VvFFc-SZeVCszmI__JolmbsK_Bw4mZUIFZ98vfpe7dFJCD4M7j/pub?output=csv';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheData {
  units: Unit[];
  timestamp: number;
}

let cache: CacheData | null = null;

function parseNumber(value: string): number {
  if (!value || value.trim() === '') return 0;
  // Remove R$, spaces, and convert Brazilian number format
  const cleaned = value
    .replace(/R\$\s*/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseArea(value: string): number {
  if (!value || value.trim() === '') return 0;
  const cleaned = value.replace(',', '.').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function normalizeTypology(tipologia: string): UnitType {
  const upper = tipologia.toUpperCase().trim();
  if (upper.includes('LOJA') && upper.includes('SOBRE')) return 'LOJA/SOBRELOJA';
  if (upper.includes('LOJA')) return 'LOJA';
  if (upper.includes('DUPLEX')) return 'DUPLEX';
  if (upper.includes('DORM') || upper.includes('02')) return '2 DORM';
  return 'STUDIO';
}

function normalizeFloor(andar: string): string {
  if (!andar || andar.trim() === '') return '';
  const upper = andar.toUpperCase().trim();
  if (upper.includes('TÉRREO') || upper.includes('TERREO') || upper.includes('MEZANINO')) return 'Térreo';
  const floorNumber = upper.match(/\d+/)?.[0];
  if (floorNumber) return `${floorNumber}º Andar`;
  return andar;
}

function determineStatus(status: string): UnitStatus {
  const normalized = status.toUpperCase().trim();
  if (normalized.includes('VEND')) return 'vendido';
  if (normalized.includes('RESERV')) return 'reservado';
  return 'disponivel';
}

function parseCSV(csvText: string): Unit[] {
  const lines = csvText.split('\n');
  const units: Unit[] = [];
  
  // Find header row. The old sheet used "Cota"; Regency uses "Unidade".
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if ((lines[i].includes('Cota') || lines[i].includes('Unidade')) && lines[i].includes('Tipologia')) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) return units;
  
  // Track current floor for rows that don't have it
  let currentFloor = '';
  
  // Parse data rows
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV line handling quoted values
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // Skip empty rows or header-like rows
    const cota = values[1]?.trim() || '';
    if (!cota || cota === 'Cota' || cota === 'Unidade' || cota === '') continue;
    
    // Update current floor if provided
    const floorValue = values[0]?.trim() || '';
    if (floorValue) {
      currentFloor = normalizeFloor(floorValue);
    }
    
    // Remove "DUPLEX" prefix from cota if present (to avoid duplication with tipologia badge)
    const cleanCota = cota.replace(/^DUPLEX\s+/i, '').trim();

    const hasRegencyLayout = lines[headerIndex].includes('Unidade') && lines[headerIndex].includes('Valor Total (R$)');
    
    const unit: Unit = {
      id: cleanCota.toLowerCase().replace(/\s+/g, ''),
      cota: cleanCota,
      andar: currentFloor || 'Térreo',
      tipologia: normalizeTypology(values[2] || 'STUDIO'),
      garagem: values[3] || '',
      orientacaoSolar: values[4] || '',
      vista: values[5] || '',
      areaInterna: parseArea(values[6]),
      mezanino: hasRegencyLayout ? null : parseArea(values[7]) || null,
      areaDescoberta: parseArea(hasRegencyLayout ? values[7] : values[8]) || null,
      areaTotal: parseArea(hasRegencyLayout ? values[8] : values[9]),
      valorTotal: parseNumber(hasRegencyLayout ? values[11] : values[10]),
      entrada: parseNumber(hasRegencyLayout ? values[13] : values[11]),
      mensais42: parseNumber(hasRegencyLayout ? values[14] : values[12]),
      semestrais6: parseNumber(hasRegencyLayout ? values[15] : values[13]),
      valorM2: parseNumber(hasRegencyLayout ? values[10] || values[9] : values[14]),
      status: hasRegencyLayout
        ? determineStatus(values[16] || '')
        : determineStatus(`${values[18] ? 'vendido' : ''} ${values[19] ? 'reservado' : ''}`),
    };
    
    // Only add valid units
    if (unit.cota && unit.valorTotal > 0) {
      units.push(unit);
    }
  }
  
  return units;
}

export function useGoogleSheets() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Clear cache if force refresh
    if (forceRefresh) {
      cache = null;
    }
    
    // Check cache first
    if (!forceRefresh && cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      setUnits(cache.units);
      setLastUpdated(new Date(cache.timestamp));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(GOOGLE_SHEETS_CSV_URL);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados da planilha');
      }
      
      const csvText = await response.text();
      const parsedUnits = parseCSV(csvText);
      
      // Update cache
      cache = {
        units: parsedUnits,
        timestamp: Date.now(),
      };
      
      setUnits(parsedUnits);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Error fetching Google Sheets data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchData(true), CACHE_DURATION);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    units,
    loading,
    error,
    lastUpdated,
    refresh: () => fetchData(true),
  };
}

// Export floors and types for filtering
export const floors = Array.from({ length: 23 }, (_, index) => `${index + 1}º Andar`);
export const types: UnitType[] = ['STUDIO', '2 DORM', 'LOJA', 'LOJA/SOBRELOJA'];
