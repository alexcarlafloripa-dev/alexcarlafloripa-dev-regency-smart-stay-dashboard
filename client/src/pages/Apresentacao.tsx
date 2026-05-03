/**
 * Página de Apresentação ao Cliente — Regency Square Smart Stay
 * Layout compacto 3x2: todas as 6 unidades visíveis de uma vez, sem scroll
 * Inspirada no PDF "Fluxos Ref. CUB Abril"
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, Globe, DollarSign, ChevronDown, X, ExternalLink, RefreshCw, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { units, Unit } from '@/data/units';
import { trpc } from '@/lib/trpc';

// ─── Image com Shimmer de Carregamento ────────────────────────────────────────────────
function ImageWithSkeleton({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5ede6] via-[#edddd4] to-[#f5ede6] animate-shimmer rounded" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-contain transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ maxHeight: '150px' }}
      />
    </div>
  );
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border-2 border-[#7c4a1e]/20 rounded-xl overflow-hidden flex flex-col shadow-sm animate-pulse" style={{ minHeight: '320px' }}>
      {/* Topo: planta + info */}
      <div className="flex gap-0 border-b border-[#7c4a1e]/10">
        {/* Planta skeleton */}
        <div className="w-[42%] bg-[#f5ede6] flex items-center justify-center" style={{ height: '160px' }}>
          <div className="w-16 h-16 rounded-lg bg-[#e8d5c8]" />
        </div>
        {/* Info skeleton */}
        <div className="flex-1 p-2 flex flex-col gap-2 justify-center">
          <div className="h-5 w-12 bg-[#e8d5c8] rounded-full" />
          <div className="h-3 w-20 bg-[#edddd4] rounded" />
          <div className="h-3 w-16 bg-[#edddd4] rounded" />
          <div className="h-3 w-14 bg-[#edddd4] rounded" />
          <div className="h-3 w-10 bg-[#edddd4] rounded" />
        </div>
      </div>
      {/* Fluxo skeleton */}
      <div className="flex-1 p-2 flex flex-col gap-1.5">
        <div className="h-3 w-24 bg-[#e8d5c8] rounded mb-1" />
        <div className="h-6 w-full bg-[#f0e4da] rounded-lg" />
        <div className="h-5 w-full bg-[#f0e4da] rounded-lg" />
        <div className="h-5 w-full bg-[#f0e4da] rounded-lg" />
        <div className="h-5 w-full bg-[#f0e4da] rounded-lg" />
        <div className="h-5 w-full bg-[#f0e4da] rounded-lg" />
      </div>
    </div>
  );
}

// ─── CDN de plantas baixas ────────────────────────────────────────────────────
const plantasCDN: Record<string, string> = {
  "201_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/xkmbHDYXNYseVFnN.png",
  "202_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/pDdqBHCVXKBvAMIj.png",
  "203_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/PFkKqpGfJDVewyDe.png",
  "204_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/FtWlAUoNtaoTgghN.png",
  "205_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/ZRvysAcDVyvoGICx.png",
  "206_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/hzJjCYAnDWtwoLWB.png",
  "207_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/vYALxgPYIVXsRpku.png",
  "208_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/hdXigoeYhyNTJoxs.png",
  "209_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/ByRSLxnHdDsStHSH.png",
  "210_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/nFKbLxtngOuBsfQB.png",
  "211_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/NmVbDUNAJOizhyUn.png",
  "212_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/hDjJIZoDinBEozfU.png",
  "213_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/AvfQSqJTVUDEvkiM.png",
  "214_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/zANDkSoVuqeczfKd.png",
  "301_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/ZKloHQlBZuRPwXSO.png",
  "302_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/miHSOrDUOvVdQXUh.png",
  "303_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/RuvqozbSrluqtYiL.png",
  "304_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/gddvLuiDLHNvENNC.png",
  "305_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/fcSNZglbaJkZgraN.png",
  "306_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/QqQuOtkViAzkTxtl.png",
  "307_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/nQleXVnTwYIXgYkw.png",
  "308_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/ZaZqcxwtqVjUJtbB.png",
  "309_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/bHSrNVFOYKFaIhaJ.png",
  "310_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/CeTDBKYppAdGVviQ.png",
  "311_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/VhULMyVbdbUHeudM.png",
  "312_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/YSfhcmUxICmJDHVJ.png",
  "313_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/VEqZqmGFfSIGELdm.png",
  "314_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/YjXxlZznkUEDqfDU.png",
  "401_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/FMHNNLFookfllOmA.png",
  "402_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/eEjMJLrakrpwzFsM.png",
  "403_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/QQRzWFISQLhmCAZX.png",
  "404_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/wAINdAfsNwINdVTH.png",
  "405_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/aqvohbGebaiklTbF.png",
  "406_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/jgjqjZPUEgPaQHwU.png",
  "407_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/oaoHEutmMBSaELgL.png",
  "408_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/TUutsIDRlLULvnde.png",
  "409_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/kqRtxrUTatpNZVsE.png",
  "410_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/eDXKAKBQoiOVzUlP.png",
  "411_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/pMYcqMLIaARTjKxF.png",
  "412_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/tdcsxPCeHSKaKLSR.png",
  "413_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/sJFZSzJXocCGOjlX.png",
  "414_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/jrBNEzCbnupQTexF.png",
  "501_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/ezRNMiiWqHskuott.png",
  "502_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/npPOpHXHcspYrnVF.png",
  "503_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/YcgwOLNqHdlMbACq.png",
  "504_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/jcivJgiDFKXdvXer.png",
  "505_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/JxkHYAyIkAPNWasu.png",
  "506_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/FoaCeLZjeknUmHAY.png",
  "507_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/dQYGRaBGhfkSIPoV.png",
  "508_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/SxjWLxwpDFEllCNA.png",
  "509_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/byKLbqyLbfaqkJWn.png",
  "510_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/TeMsmEEPMVZoxbmC.png",
  "511_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/cIVWYKOfBvKjhGe.png",
  "512_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/YUNZxlyGINtAPoPF.png",
  "513_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/zInolxGSTNFyTdrQ.png",
  "514_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/EDTgBcUaPqGIOdsd.png",
  "601_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/mWynuwypKeIUSrkK.png",
  "602_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/YVakndCcXwUfnNzL.png",
  "603_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/IDXZDxyerCbyGniH.png",
  "604_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/pPqrIOYMyDdZCAbr.png",
  "605_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/MHEbIqQNngpFwGUC.png",
  "606_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/cNaMxOWchcgzEgLR.png",
  "607_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/gCRNgPzVQckjtMXm.png",
  "608_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/DhtohRbEVqQigEPV.png",
  "609_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/bCDXaEkyZoRxgMsi.png",
  "610_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/PncKHFWvFmvJsPXc.png",
  "611_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/nCexkxftPsiEeSLs.png",
  "612_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/OnKaVbslhMEEInMJ.png",
  "613_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/ZHwGFreRpVtKbzui.png",
  "614_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/CjXspXMakMRJbxjZ.png",
  "701_inferior_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/XYXvAOymceJkBThW.png",
  "701_superior_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/XMwFFOkZfbWGhWgi.png",
  "702_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/mgHTyOpGGjXeYrQA.png",
  "703_inferior_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/hhYWxFionRavNJgl.png",
  "703_superior_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/jiJCEPbflddaQpPL.png",
  "704_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/UjeLaxvwppCYvrEZ.png",
  "705_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/VKnGfNatEOUgXdXG.png",
  "706_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/jKWKUiliLoFcYkIL.png",
  "707_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/LGNXdmeFpvYNYkzT.png",
  "708_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/JMdzlIwPKkXArUMr.png",
  "709_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/lEseTtPqcaLiSYRg.png",
  "710_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/gGJcRIDWWjOFPCqN.png",
  "711_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/pDyfuWbehDMnKYHE.png",
  "712_inferior_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/aDmqsKJWTEGXAOOS.png",
  "712_superior_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/suaXXmUKolWuIekT.png",
  "713_inferior_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/LaOlebxZLdkzpGGQ.png",
  "713_superior_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/RKnpPwOyJfbrLmUA.png",
  "714_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/diDTtfrZQfbPEEEe.png",
};

function getPlantaUrl(cota: string): string {
  const isDuplex = ['701', '703', '712', '713'].includes(cota);
  if (isDuplex) return plantasCDN[`${cota}_inferior_clean.png`] || '';
  return plantasCDN[`${cota}_clean.png`] || '';
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Lang = 'pt' | 'es' | 'en';
type Currency = 'BRL' | 'USD' | 'ARS' | 'EUR' | 'CLP';

// ─── Traduções ────────────────────────────────────────────────────────────────
const T: Record<Lang, Record<string, string>> = {
  pt: {
    subtitle: 'Fluxos Ref. CUB — Abril 2026',
    cubNote: 'Planilha atualizada mensalmente pelo CUB',
    cota: 'COTA',
    fluxo: 'FLUXO DE PAGAMENTO',
    valorTotal: 'VALOR TOTAL',
    entrada: 'Entrada',
    mensais: 'x Mensais',
    semestral: 'x Semestrais',
    m2: 'Valor m²',
    trocar: 'Trocar',
    avista: 'à vista',
    cada: 'cada',
    voltar: 'Voltar',
    verSite: 'Ver Site',
    spe: 'Modelo SPE — Preço de custo',
    disponivel: 'Disponível',
    reservado: 'Reservado',
    vendido: 'Vendido',
    buscar: 'Buscar cota...',
    pagReais: 'Pagamento em Reais (Preço de Custo)',
  },
  es: {
    subtitle: 'Flujos Ref. CUB — Abril 2026',
    cubNote: 'Planilla actualizada mensualmente por el CUB',
    cota: 'CUOTA',
    fluxo: 'FLUJO DE PAGO',
    valorTotal: 'VALOR TOTAL',
    entrada: 'Entrada',
    mensais: 'x Cuotas',
    semestral: 'x Semestrales',
    m2: 'Valor m²',
    trocar: 'Cambiar',
    avista: 'al contado',
    cada: 'c/u',
    voltar: 'Volver',
    verSite: 'Ver Sitio',
    spe: 'Modelo SPE — Precio de costo',
    disponivel: 'Disponible',
    reservado: 'Reservado',
    vendido: 'Vendido',
    buscar: 'Buscar cuota...',
    pagReais: 'Pago en Reales (Precio de Costo)',
  },
  en: {
    subtitle: 'Payment Flows — April 2026',
    cubNote: 'Spreadsheet updated monthly by CUB index',
    cota: 'UNIT',
    fluxo: 'PAYMENT FLOW',
    valorTotal: 'TOTAL VALUE',
    entrada: 'Down Payment',
    mensais: 'x Monthly',
    semestral: 'x Semi-annual',
    m2: 'Price/m²',
    trocar: 'Change',
    avista: 'upfront',
    cada: 'each',
    voltar: 'Back',
    verSite: 'Website',
    spe: 'SPE Model — Cost price',
    disponivel: 'Available',
    reservado: 'Reserved',
    vendido: 'Sold',
    buscar: 'Search unit...',
    pagReais: 'Payment in BRL only (Cost Price)',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(value: number, currency: Currency, rates: Record<string, number> | null): string {
  if (currency === 'BRL' || !rates) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  const rate = rates[currency];
  if (!rate) return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const converted = value / rate;
  const sym: Record<Currency, string> = { BRL: 'R$', USD: 'US$', ARS: 'ARS$', EUR: '€', CLP: 'CLP$' };
  return `${sym[currency]} ${converted.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const DEFAULT_COTAS = ['209', '307', '212', '701', '203', '704'];

// ─── Modal seletor ────────────────────────────────────────────────────────────
function SelectorModal({ open, onClose, onSelect, currentCota, lang }: {
  open: boolean; onClose: () => void; onSelect: (u: Unit) => void; currentCota: string; lang: Lang;
}) {
  const t = T[lang];
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return units.filter(u => u.cota.toLowerCase().includes(q) || u.tipologia.toLowerCase().includes(q));
  }, [search]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-sm bg-white border-2 border-[#7c4a1e]/40 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#7c4a1e]/20">
          <span className="text-[#7c4a1e] font-bold text-sm">{t.trocar} {t.cota}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-3">
          <input
            autoFocus
            type="text"
            placeholder={t.buscar}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7c4a1e]/50 mb-2"
          />
          <div className="max-h-72 overflow-y-auto space-y-0.5">
            {filtered.map(u => (
              <button
                key={u.id}
                onClick={() => { onSelect(u); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-all ${
                  u.cota === currentCota ? 'bg-[#7c4a1e]/15 text-[#7c4a1e] font-semibold' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="font-semibold">{u.cota} <span className="font-normal text-gray-400 text-xs">{u.tipologia}</span></span>
                <span className="text-[#7c4a1e]/80 text-xs">{u.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Card compacto ────────────────────────────────────────────────────────────
function CompactCard({ unit, lang, currency, rates, onChange }: {
  unit: Unit; lang: Lang; currency: Currency; rates: Record<string, number> | null; onChange: () => void;
}) {
  const t = T[lang];
  const plantaUrl = getPlantaUrl(unit.cota);

  const statusStyle: Record<string, string> = {
    disponivel: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
    reservado: 'bg-amber-100 text-amber-700 border border-amber-300',
    vendido: 'bg-red-100 text-red-700 border border-red-300',
  };
  const statusLabel: Record<string, string> = {
    disponivel: t.disponivel,
    reservado: t.reservado,
    vendido: t.vendido,
  };

  return (
    <div className="bg-white border-2 border-[#7c4a1e]/30 rounded-xl overflow-hidden flex flex-col md:h-full shadow-sm" style={{ minHeight: '320px' }}>
      {/* Topo: planta + info da cota lado a lado */}
      <div className="flex gap-0 border-b border-[#7c4a1e]/20">
        {/* Planta baixa */}
        <div className="w-[42%] bg-[#fdf6f0] flex items-center justify-center p-1.5 relative flex-shrink-0" style={{ height: '160px' }}>
          {plantaUrl ? (
            <ImageWithSkeleton src={plantaUrl} alt={unit.cota} />
          ) : (
            <Building2 className="w-6 h-6 text-[#7c4a1e]/30" />
          )}
          {/* Badge status */}
            <span className={`absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${statusStyle[unit.status]}`}>
            {statusLabel[unit.status]}
          </span>
        </div>

        {/* Info da cota */}
        <div className="flex-1 p-2 flex flex-col justify-between">
          <div>
            <p className="text-[#7c4a1e]/60 text-[9px] tracking-widest uppercase leading-none mb-0.5">{t.cota}</p>
            <p className="text-[#7c4a1e] font-bold leading-none" style={{ fontSize: '1.6rem' }}>{unit.cota}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#7c4a1e]/15 text-[#7c4a1e] border border-[#7c4a1e]/30">{unit.tipologia}</span>
              {unit.andar && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{unit.andar.replace('ANDAR', '').trim()}</span>}
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{unit.areaTotal.toFixed(0)}m²</span>
            </div>
          </div>
          <button
            onClick={onChange}
            className="mt-1.5 flex items-center gap-1 text-[9px] text-[#7c4a1e] hover:text-[#5a3314] transition-colors font-medium"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            {t.trocar}
          </button>
        </div>
      </div>

      {/* Fluxo de pagamento */}
      <div className="flex-1 p-2 flex flex-col justify-between">
        {/* Título + Valor total agrupados */}
        <div className="flex flex-col gap-1.5">
        <p className="text-[#7c4a1e]/80 text-[9px] font-bold tracking-widest uppercase text-center">{t.fluxo}</p>
        {/* Valor total */}
        <div className="bg-[#fdf6f0] border border-[#7c4a1e]/30 rounded-lg px-2 py-2.5 text-center">
          <p className="text-[#7c4a1e]/60 text-[8px] uppercase tracking-wider leading-none mb-1">{t.valorTotal}</p>
          <p className="text-[#7c4a1e] font-bold leading-none" style={{ fontSize: '1.1rem' }}>
            {fmt(unit.valorTotal, currency, rates)}
          </p>
          {currency !== 'BRL' && (
            <p className="text-gray-500 text-[8px] mt-0.5">
              {unit.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          )}
        </div>

        </div>
        {/* Linhas */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-2">
            <div className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-gray-700 text-[10px] flex-1">{t.entrada}</span>
            <span className="text-gray-800 text-[10px] font-semibold">{fmt(unit.entrada, currency, rates)} <span className="text-gray-400 text-[9px]">{t.avista}</span></span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-2">
            <div className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="text-gray-700 text-[10px] flex-1">42{t.mensais}</span>
            <span className="text-gray-800 text-[10px] font-semibold">{fmt(unit.mensais42, currency, rates)} <span className="text-gray-400 text-[9px]">{t.cada}</span></span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#fdf6f0] border border-[#7c4a1e]/20 rounded-lg px-2.5 py-2">
            <div className="w-1 h-5 rounded-full bg-[#7c4a1e] flex-shrink-0" />
            <span className="text-gray-700 text-[10px] flex-1">6{t.semestral}</span>
            <span className="text-gray-800 text-[10px] font-semibold">{fmt(unit.semestrais6, currency, rates)} <span className="text-gray-400 text-[9px]">{t.cada}</span></span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2">
            <div className="w-1 h-5 rounded-full bg-gray-400 flex-shrink-0" />
            <span className="text-gray-700 text-[10px] flex-1">{t.m2}</span>
            <span className="text-gray-800 text-[10px] font-semibold">{fmt(unit.valorM2, currency, rates)}</span>
          </div>
        </div>

        {/* Nota */}
        {currency !== 'BRL' && (
          <p className="text-[#7c4a1e]/70 text-[8px] text-center leading-tight">{t.pagReais}</p>
        )}
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function Apresentacao() {
  const [lang, setLang] = useState<Lang>('pt');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorIndex, setSelectorIndex] = useState<number | null>(null);
  const [selectedCotas, setSelectedCotas] = useState<string[]>(DEFAULT_COTAS);
  // Estado de carregamento inicial para animação
  const [pageReady, setPageReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPageReady(true), 400);
    return () => clearTimeout(timer);
  }, []);
  // Sempre busca cotação ao carregar (independente da moeda selecionada)
  const { data: ratesData, isLoading: ratesLoading } = trpc.currency.rates.useQuery(
    { base: 'BRL' },
    { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  );
  const rates = ratesData?.rates ?? null;
  // Cotação atual para exibir no botão
  const currentRate = currency !== 'BRL' && rates ? rates[currency] : null;
  const t = T[lang];

  const selectedUnits = useMemo(() =>
    selectedCotas.map(c => units.find(u => u.cota === c)).filter(Boolean) as Unit[],
    [selectedCotas]
  );

  const handleChange = useCallback((i: number) => {
    setSelectorIndex(i);
    setSelectorOpen(true);
  }, []);

  const handleSelect = useCallback((unit: Unit) => {
    if (selectorIndex === null) return;
    setSelectedCotas(prev => { const n = [...prev]; n[selectorIndex] = unit.cota; return n; });
  }, [selectorIndex]);

  const langOpts: { code: Lang; flag: string; label: string }[] = [
    { code: 'pt', flag: '🇧🇷', label: 'PT' },
    { code: 'es', flag: '🇦🇷', label: 'ES' },
    { code: 'en', flag: '🇺🇸', label: 'EN' },
  ];
  const currOpts: { code: Currency; label: string; flag: string }[] = [
    { code: 'BRL', label: 'R$ BRL', flag: '🇧🇷' },
    { code: 'USD', label: 'US$ USD', flag: '🇺🇸' },
    { code: 'ARS', label: 'ARS$ ARS', flag: '🇦🇷' },
    { code: 'EUR', label: '€ EUR', flag: '🇪🇺' },
    { code: 'CLP', label: 'CLP$ CLP', flag: '🇨🇱' },
  ];

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-white text-gray-900 md:overflow-hidden">
      {/* ── Header compacto ── */}
      <header className="flex-shrink-0 bg-white border-b-2 border-[#7c4a1e] px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          {/* Voltar */}
          <Link href="/">
            <button className="flex items-center gap-1 text-[#7c4a1e] hover:text-[#5a3314] text-xs transition-colors font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.voltar}</span>
            </button>
          </Link>

          {/* Centro */}
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[#7c4a1e] font-bold text-sm">REGENCY <span className="text-gray-800">SMART STAY</span></span>
              <span className="hidden sm:inline text-[#7c4a1e]/50 text-xs">·</span>
              <span className="hidden sm:inline text-gray-500 text-xs">{t.subtitle}</span>
            </div>
            <p className="text-amber-500/60 text-[9px] uppercase tracking-wider sm:hidden">{t.cubNote}</p>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-1.5">
            {/* Idioma */}
            <div className="relative">
              <button
                onClick={() => { setShowLangMenu(!showLangMenu); setShowCurrencyMenu(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#7c4a1e]/8 hover:bg-[#7c4a1e]/15 border border-[#7c4a1e]/30 text-xs transition-all"
              >
                <Globe className="w-3 h-3 text-[#7c4a1e]" />
                <span className="text-gray-700 font-medium">{langOpts.find(l => l.code === lang)?.flag} {lang.toUpperCase()}</span>
                <ChevronDown className="w-2.5 h-2.5 text-[#7c4a1e]" />
              </button>
              <AnimatePresence>
                {showLangMenu && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute right-0 top-full mt-1 w-32 bg-white border border-[#7c4a1e]/40 rounded-xl shadow-2xl overflow-hidden z-50">
                    {langOpts.map(o => (
                      <button key={o.code} onClick={() => { setLang(o.code); setShowLangMenu(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#7c4a1e]/10 transition-colors ${lang === o.code ? 'text-[#7c4a1e] font-bold' : 'text-gray-600'}`}>
                        {o.flag} {o.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Moeda */}
            <div className="relative">
              <button
                onClick={() => { setShowCurrencyMenu(!showCurrencyMenu); setShowLangMenu(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#7c4a1e]/8 hover:bg-[#7c4a1e]/15 border border-[#7c4a1e]/30 text-xs transition-all"
              >
                <DollarSign className="w-3 h-3 text-[#7c4a1e]" />
                <span className="text-gray-700 font-medium">{currency}</span>
                {currentRate && (
                  <span className="text-[#7c4a1e]/70 text-[9px]">{currentRate.toFixed(currency === 'ARS' || currency === 'CLP' ? 0 : 4)}</span>
                )}
                {ratesLoading && <RefreshCw className="w-2.5 h-2.5 text-[#7c4a1e] animate-spin" />}
                <ChevronDown className="w-2.5 h-2.5 text-[#7c4a1e]" />
              </button>
              <AnimatePresence>
                {showCurrencyMenu && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute right-0 top-full mt-1 w-32 bg-white border border-[#7c4a1e]/40 rounded-xl shadow-2xl overflow-hidden z-50">
                    {currOpts.map(o => (
                      <button key={o.code} onClick={() => { setCurrency(o.code as Currency); setShowCurrencyMenu(false); }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-[#7c4a1e]/10 transition-colors ${currency === o.code ? 'text-[#7c4a1e] font-bold' : 'text-gray-600'}`}>
                        <span>{o.flag} {o.label}</span>
                        {rates && o.code !== 'BRL' && (
                          <span className="text-[9px] text-amber-600/60">
                            {rates[o.code] ? rates[o.code].toFixed(o.code === 'ARS' || o.code === 'CLP' ? 0 : 4) : '—'}
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Link site */}
            <a href="https://regencysmartstay.com.br" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-[#7c4a1e]/10 hover:bg-[#7c4a1e]/20 border border-[#7c4a1e]/40 text-[#7c4a1e] text-xs transition-all font-medium">
              <ExternalLink className="w-3 h-3" />
              {t.verSite}
            </a>
          </div>
        </div>
      </header>

      {/* ── Nota CUB ── */}
      <div className="flex-shrink-0 bg-[#fdf6f0] border-b border-[#7c4a1e]/20 px-3 py-1 text-center">
        <p className="text-[#7c4a1e]/80 text-[9px] uppercase tracking-widest">{t.cubNote} · {t.spe}</p>
      </div>

      {/* ── Grid 3x2 — ocupa todo o espaço restante ── */}
      <main className="flex-1 p-2 overflow-auto md:overflow-hidden" style={{ minHeight: 0 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:grid-rows-2 gap-2 md:h-full">
          {!pageReady
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : selectedUnits.map((unit, i) => (
                <motion.div
                  key={`${unit.cota}-${i}`}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, delay: i * 0.07, ease: 'easeOut' }}
                  className="md:h-full"
                >
                  <CompactCard
                    unit={unit}
                    lang={lang}
                    currency={currency}
                    rates={rates}
                    onChange={() => handleChange(i)}
                  />
                </motion.div>
              ))
          }
        </div>
      </main>

      {/* Modal seletor */}
      <AnimatePresence>
        {selectorOpen && selectorIndex !== null && (
          <SelectorModal
            open={selectorOpen}
            onClose={() => setSelectorOpen(false)}
            onSelect={handleSelect}
            currentCota={selectedCotas[selectorIndex]}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* Fechar menus ao clicar fora */}
      {(showLangMenu || showCurrencyMenu) && (
        <div className="fixed inset-0 z-20" onClick={() => { setShowLangMenu(false); setShowCurrencyMenu(false); }} />
      )}
    </div>
  );
}
