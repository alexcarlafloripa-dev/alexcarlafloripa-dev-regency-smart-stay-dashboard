/**
 * Design: Interface Tecnológica Imersiva - Glassmorphism Dark Theme
 * Modal lateral (drawer) com detalhes completos da unidade e fluxo de pagamento
 * Inclui botão de copiar fluxo para WhatsApp
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Compass, Maximize2, Car, Eye, Sun, Calendar, Banknote, CreditCard, PiggyBank, MessageCircle, GitCompare, Check, Copy, ClipboardList } from 'lucide-react';
import { Unit, formatCurrency, getStatusLabel } from '@/data/units';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/contexts/CompareContext';
import { useTrack } from '@/hooks/useTrack';
import { openWhatsApp } from '@/lib/whatsapp';
import { toast } from 'sonner';
import { ReservationModal } from './ReservationModal';

interface UnitDetailModalProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
}


// CDN URL mappings for plantas humanizadas
const plantasCDN = {
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
  "511_clean.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209626693/cIVWYKUOfBvKjhGe.png",
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

function getCDNUrl(filename: string): string {
  return plantasCDN[filename as keyof typeof plantasCDN] || `/images/plantas/${filename}`;
}

type Currency = 'BRL' | 'USD' | 'ARS' | 'CLP' | 'UYU';

const CURRENCY_CONFIG: Record<Currency, { label: string; symbol: string; flag: string; defaultRate: number }> = {
  BRL: { label: 'Real', symbol: 'R$', flag: '🇧🇷', defaultRate: 1 },
  USD: { label: 'Dólar', symbol: 'US$', flag: '🇺🇸', defaultRate: 5.75 },
  ARS: { label: 'Peso Arg.', symbol: 'AR$', flag: '🇦🇷', defaultRate: 0.0055 },
  CLP: { label: 'Peso Chi.', symbol: 'CL$', flag: '🇨🇱', defaultRate: 0.0057 },
  UYU: { label: 'Peso Uru.', symbol: 'UY$', flag: '🇺🇾', defaultRate: 0.135 },
};

// Cache de taxas para evitar múltiplas requisições
const ratesCache: { data: Record<string, number> | null; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_TTL = 1000 * 60 * 60; // 1 hora
export function UnitDetailModal({ unit, isOpen, onClose }: UnitDetailModalProps) {
  const { compareList, addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { track } = useTrack();
  const [reservationOpen, setReservationOpen] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [customRate, setCustomRate] = useState<string>('');
  const [liveRates, setLiveRates] = useState<Record<string, number> | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(false);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<string>('');
  const hasFetchedRef = useRef(false);
  // Guia visual: piscar X após adicionar à comparação
  const [pulseCloseBtn, setPulseCloseBtn] = useState(false);
  // Guia visual: piscar botão Comparar ao abrir modal (quando há unidades na lista mas esta não está)
  const [pulseCompareBtn, setPulseCompareBtn] = useState(false);

  // Pisca o botão Comparar por 3s quando o modal abre e há unidades na lista (mas esta não está)
  useEffect(() => {
    if (!isOpen || !unit) return;
    // Rastreia abertura do modal silenciosamente
    track({ type: 'unit_view', unitCota: unit.cota, unitTipologia: unit.tipologia, unitAndar: unit.andar, currency });
    if (compareList.length > 0 && compareList.length < 3 && !isInCompare(unit.id)) {
      setPulseCompareBtn(true);
      const t = setTimeout(() => setPulseCompareBtn(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOpen, unit?.id]);

  // Busca taxas da API quando o modal abre (apenas uma vez por hora)
  useEffect(() => {
    if (!isOpen) return;
    const now = Date.now();
    if (ratesCache.data && now - ratesCache.timestamp < CACHE_TTL) {
      setLiveRates(ratesCache.data);
      return;
    }
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setRatesLoading(true);
    setRatesError(false);
    fetch('https://open.er-api.com/v6/latest/BRL')
      .then((res) => res.json())
      .then((data) => {
        if (data.result === 'success' && data.rates) {
          ratesCache.data = data.rates;
          ratesCache.timestamp = Date.now();
          setLiveRates(data.rates);
          // Formata hora da última atualização
          const updated = new Date(data.time_last_update_unix * 1000);
          setRatesUpdatedAt(updated.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }));
        } else {
          setRatesError(true);
        }
      })
      .catch(() => setRatesError(true))
      .finally(() => setRatesLoading(false));
  }, [isOpen]);

  // Taxa automática da API (BRL → moeda estrangeira: quanto 1 BRL vale na moeda)
  const getLiveRate = useCallback((cur: Currency): number => {
    if (cur === 'BRL') return 1;
    if (liveRates && liveRates[cur]) return liveRates[cur];
    return 1 / CURRENCY_CONFIG[cur].defaultRate;
  }, [liveRates]);

  const getRate = useCallback(() => {
    if (currency === 'BRL') return 1;
    const parsed = parseFloat(customRate.replace(',', '.'));
    // customRate é quanto 1 unidade da moeda estrangeira vale em BRL
    // então a taxa de conversão BRL→moeda = 1/customRate
    if (!isNaN(parsed) && parsed > 0) return 1 / parsed;
    return getLiveRate(currency);
  }, [currency, customRate, getLiveRate]);

  const convertValue = useCallback((brlValue: number) => {
    if (currency === 'BRL') return formatCurrency(brlValue);
    const rate = getRate();
    const converted = brlValue * rate;
    const cfg = CURRENCY_CONFIG[currency];
    return `${cfg.symbol} ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(converted)}`;
  }, [currency, getRate]);

  // Taxa exibida no placeholder (1 moeda = R$ X)
  const getDisplayRate = useCallback((cur: Currency): string => {
    if (cur === 'BRL') return '1';
    const liveRate = getLiveRate(cur);
    // liveRate é BRL por unidade da moeda estrangeira (1/liveRate)
    const brlPerUnit = 1 / liveRate;
    return brlPerUnit.toFixed(4);
  }, [getLiveRate]);

  if (!unit) return null;

  const statusColors = {
    disponivel: 'bg-emerald-500',
    reservado: 'bg-amber-500',
    vendido: 'bg-red-500',
  };

  const isLoja = unit.tipologia.includes('LOJA');

  // Gera a mensagem do WhatsApp no idioma correto baseado na moeda selecionada
  const generateWhatsAppText = () => {
    const isForeign = currency !== 'BRL';
    const cfg = CURRENCY_CONFIG[currency];
    const rate = getRate();
    const isSpanish = currency === 'ARS' || currency === 'CLP' || currency === 'UYU';
    const isEnglish = currency === 'USD';

    // Formata valor em moeda estrangeira
    const fmtForeign = (brl: number) => {
      const converted = brl * rate;
      return `${cfg.symbol} ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(converted)}`;
    };

    const today = new Date().toLocaleDateString('pt-BR');

    // Linha de câmbio do dia: "Câmbio do dia (28/02/2025): US$ 1 = R$ 5,72"
    const brlPerUnit = (1 / rate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const exchangeLine = isForeign ? `Câmbio do dia (${today}): ${cfg.symbol} 1 = R$ ${brlPerUnit}` : '';

    if (isEnglish) {
      const exchangeLineEN = `Exchange rate (${today}): ${cfg.symbol} 1 = R$ ${brlPerUnit}`;
      return `*REGENCY SQUARE SMART STAY* — Canasvieiras, Florianópolis

*Unit ${unit.cota} | ${unit.tipologia}*
Area: ${unit.areaTotal} m² | ${unit.andar || 'Ground Floor'}
${unit.orientacaoSolar ? `Orientation: ${unit.orientacaoSolar}` : ''}
${unit.garagem ? `Parking: ${unit.garagem}` : ''}

*Total Value: ${formatCurrency(unit.valorTotal)} | ${fmtForeign(unit.valorTotal)}*
Down Payment: ${formatCurrency(unit.entrada)} | ${fmtForeign(unit.entrada)}
42x of ${formatCurrency(unit.mensais42)} | ${fmtForeign(unit.mensais42)}
6 Installments of ${formatCurrency(unit.semestrais6)} | ${fmtForeign(unit.semestrais6)}

${exchangeLineEN}
_Foreign currency values are for reference only. Contract and all payments are made exclusively in Brazilian Reais (R$)._

_Regency Square Smart Stay — Your smart investment in Florianópolis_`;
    }

    if (isSpanish) {
      const floorLabel = unit.andar || 'Planta Baja';
      const exchangeLineES = `Tipo de cambio (${today}): ${cfg.symbol} 1 = R$ ${brlPerUnit}`;
      return `*REGENCY SQUARE SMART STAY* — Canasvieiras, Florianópolis

*Unidad ${unit.cota} | ${unit.tipologia}*
Área: ${unit.areaTotal} m² | ${floorLabel}
${unit.orientacaoSolar ? `Orientación: ${unit.orientacaoSolar}` : ''}
${unit.garagem ? `Cochera: ${unit.garagem}` : ''}

*Valor Total: ${formatCurrency(unit.valorTotal)} | ${fmtForeign(unit.valorTotal)}*
Entrada: ${formatCurrency(unit.entrada)} | ${fmtForeign(unit.entrada)}
42 cuotas de ${formatCurrency(unit.mensais42)} | ${fmtForeign(unit.mensais42)}
6 refuerzos de ${formatCurrency(unit.semestrais6)} | ${fmtForeign(unit.semestrais6)}

${exchangeLineES}
_Los valores en moneda extranjera son solo una referencia. El contrato y todos los pagos se realizan exclusivamente en Reales brasileños (R$)._

_Regency Square Smart Stay — Tu inversión inteligente en Florianópolis_`;
    }

    // Português (BRL)
    return `*REGENCY SQUARE SMART STAY* — Canasvieiras, Florianópolis

*Unidade ${unit.cota} | ${unit.tipologia}*
Área: ${unit.areaTotal} m² | ${unit.andar || 'Térreo'}
${unit.orientacaoSolar ? `Orientação: ${unit.orientacaoSolar}` : ''}
${unit.garagem ? `Garagem: ${unit.garagem}` : ''}

*Valor Total: ${formatCurrency(unit.valorTotal)}*
Entrada: ${formatCurrency(unit.entrada)}
42x de ${formatCurrency(unit.mensais42)}
6 Reforços de ${formatCurrency(unit.semestrais6)}

_Valores atualizados conforme índice CUB/SC_

_Regency Square Smart Stay — O seu investimento inteligente em Florianópolis_`;
  };

  const handleCopyMessage = async () => {
    try {
      const text = generateWhatsAppText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      track({ type: 'copy_click', unitCota: unit?.cota, unitTipologia: unit?.tipologia, unitAndar: unit?.andar, currency });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSendWhatsApp = () => {
    const text = generateWhatsAppText();
    openWhatsApp(text);
    setWhatsappSent(true);
    setTimeout(() => setWhatsappSent(false), 3000);
    track({ type: 'whatsapp_click', unitCota: unit?.cota, unitTipologia: unit?.tipologia, unitAndar: unit?.andar, currency });
  };

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-background/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-white/10 p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-gradient">{unit.cota}</h2>
                    <div className={`w-3 h-3 rounded-full ${statusColors[unit.status]} shadow-[0_0_12px_currentColor]`} />
                  </div>
                  <p className="text-muted-foreground">{unit.andar} • {getStatusLabel(unit.status)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPulseCompareBtn(false);
                      if (isInCompare(unit.id)) {
                        removeFromCompare(unit.id);
                        setPulseCloseBtn(false);
                        toast.info('Unidade removida da comparação');
                      } else {
                        addToCompare(unit);
                        // Fecha o modal automaticamente após adicionar à comparação
                        setTimeout(() => onClose(), 150);
                      }
                    }}
                    disabled={!isInCompare(unit.id) && compareList.length >= 3}
                    title={isInCompare(unit.id) ? 'Remover da comparação' : compareList.length >= 3 ? 'Máximo 3 unidades' : 'Adicionar à comparação'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isInCompare(unit.id)
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        : compareList.length >= 3
                          ? 'bg-white/5 text-muted-foreground border border-white/10 cursor-not-allowed opacity-50'
                          : pulseCompareBtn
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60 animate-pulse shadow-[0_0_16px_rgba(16,185,129,0.8)]'
                            : 'bg-white/10 text-muted-foreground border border-white/20 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40'
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    {isInCompare(unit.id) ? 'Comparando' : 'Comparar'}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className={`transition-all ${
                      pulseCloseBtn
                        ? 'text-emerald-400 animate-pulse shadow-[0_0_18px_rgba(16,185,129,0.9)] bg-emerald-500/25 rounded-lg scale-110'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Type badge */}
              <div>
                <span className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  ${isLoja 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : unit.tipologia === '2 DORM'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }
                `}>
                  <Building2 className="w-4 h-4" />
                  {unit.tipologia}
                </span>
              </div>

              {/* Property details */}
              <div className="glass-card rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Características
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Maximize2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Área Privativa</p>
                      <p className="font-semibold">{unit.areaTotal} m²</p>
                    </div>
                  </div>
                  {unit.orientacaoSolar && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Compass className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Orientação</p>
                        <p className="font-semibold text-sm">{unit.orientacaoSolar}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vista</p>
                      <p className="font-semibold text-sm">{unit.vista}</p>
                    </div>
                  </div>
                  {unit.garagem && (
                    <div className="flex items-center gap-3 col-span-2">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Car className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Garagem</p>
                        <p className="font-semibold">Vaga de {unit.garagem}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment flow */}
              <div className="glass-card rounded-xl p-5 space-y-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Fluxo de Pagamento
                </h3>

                {/* Total value */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                  <p className="text-sm text-muted-foreground mb-1">Valor Total do Imóvel</p>
                  <p className="text-3xl font-bold money text-gradient">
                    {convertValue(unit.valorTotal)}
                  </p>
                </div>

                {/* Currency Selector - ativo para todas as unidades */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Converter valores</p>
                    {ratesLoading && (
                      <span className="text-xs text-muted-foreground animate-pulse">⏳ Buscando cotação...</span>
                    )}
                    {!ratesLoading && liveRates && (
                      <span className="text-xs text-emerald-400">✓ Cotação ao vivo{ratesUpdatedAt ? ` · ${ratesUpdatedAt}` : ''}</span>
                    )}
                    {!ratesLoading && ratesError && (
                      <span className="text-xs text-amber-400">⚠ Taxa estimada</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(CURRENCY_CONFIG) as Currency[]).map((cur) => {
                      const cfg = CURRENCY_CONFIG[cur];
                      return (
                        <button
                          key={cur}
                          onClick={() => { setCurrency(cur); setCustomRate(''); }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            currency === cur
                              ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                              : 'bg-white/10 text-muted-foreground hover:bg-white/20 hover:text-foreground'
                          }`}
                        >
                          <span>{cfg.flag}</span>
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {currency !== 'BRL' && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">
                          Taxa do dia: 1 {CURRENCY_CONFIG[currency].symbol} =
                          {' '}<span className="text-emerald-400 font-semibold">
                            {customRate ? `R$ ${customRate}` : `R$ ${getDisplayRate(currency)}`}
                          </span>
                          {!customRate && liveRates && <span className="ml-1 opacity-50">(ao vivo)</span>}
                          {!customRate && !liveRates && <span className="ml-1 opacity-50">(estimado)</span>}
                        </p>
                        <input
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          placeholder={`Ajustar: ex. ${getDisplayRate(currency)}`}
                          value={customRate}
                          onChange={(e) => setCustomRate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
                        />
                        <p className="text-xs text-muted-foreground mt-1 opacity-60">Deixe em branco para usar a cotação do dia. Digite para usar sua taxa.</p>
                      </div>
                    </div>
                  )}
                  {currency !== 'BRL' && (
                    <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                      <span className="text-amber-400 text-sm mt-0.5 shrink-0">⚠</span>
                      <p className="text-xs text-amber-200/80 leading-relaxed">
                        <span className="font-semibold text-amber-300">Valores em moeda estrangeira são apenas uma referência.</span>{' '}
                        A conversão é baseada na cotação do momento e pode variar. O contrato e todos os pagamentos são realizados exclusivamente em <span className="font-semibold">Reais (R$)</span>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Banknote className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">Entrada</p>
                        <p className="text-xs text-muted-foreground">Na assinatura do contrato</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold money text-emerald-400">
                      {convertValue(unit.entrada)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium">42 parcelas mensais</p>
                        <p className="text-xs text-muted-foreground">Durante a obra</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold money text-cyan-400">
                      {convertValue(unit.mensais42)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <PiggyBank className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium">Reforços semestrais</p>
                        <p className="text-xs text-muted-foreground">A cada 6 meses</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold money text-amber-400">
                      {convertValue(unit.semestrais6)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Valor do m²</p>
                        <p className="text-xs text-muted-foreground">Preço por metro quadrado</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold money text-blue-400">
                      {convertValue(unit.valorTotal / unit.areaTotal)}
                    </p>
                  </div>
                </div>

                {/* CUB Notice */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-muted-foreground text-center">
                    ⚠️ Valores atualizados conforme índice CUB/SC
                  </p>
                </div>
              </div>

              {/* Floor Plan - Planta Humanizada */}
              {(() => {
                const cotaNum = parseInt(unit.cota.replace(/\D/g, ''));
                const isDuplex = cotaNum === 701 || cotaNum === 703 || cotaNum === 712 || cotaNum === 713;
                const hasPlanta = !isNaN(cotaNum) && (
                  (cotaNum >= 201 && cotaNum <= 214) || // 2º andar
                  (cotaNum >= 301 && cotaNum <= 314) || // 3º andar
                  (cotaNum >= 401 && cotaNum <= 414) || // 4º andar
                  (cotaNum >= 501 && cotaNum <= 514) || // 5º andar
                  (cotaNum >= 601 && cotaNum <= 614) || // 6º andar
                  (cotaNum === 702 || cotaNum === 704 || cotaNum === 705 || cotaNum === 706 || 
                   cotaNum === 707 || cotaNum === 708 || cotaNum === 709 || cotaNum === 710 || 
                   cotaNum === 711 || cotaNum === 714) || // 7º andar
                  isDuplex // Duplex
                );
                
                return hasPlanta && (
                  <div className="glass-card rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {isDuplex ? 'Plantas Humanizadas (Duplex)' : 'Planta Humanizada'}
                    </h3>
                    {isDuplex ? (
                      <div className="space-y-4">
                        {/* Planta Inferior */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Pavimento Inferior</p>
                          <div className="relative rounded-lg overflow-hidden bg-white/5 border border-white/10">
                            <img
                              src={getCDNUrl(unit.cota + "_inferior_clean.png")}
                              alt={`Planta inferior da unidade ${unit.cota}`}
                              className="w-full h-auto object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                        {/* Planta Superior */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Pavimento Superior</p>
                          <div className="relative rounded-lg overflow-hidden bg-white/5 border border-white/10">
                            <img
                              src={getCDNUrl(unit.cota + "_superior_clean.png")}
                              alt={`Planta superior da unidade ${unit.cota}`}
                              className="w-full h-auto object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden bg-white/5 border border-white/10">
                        <img
                          src={getCDNUrl(unit.cota + "_clean.png")}
                          alt={`Planta humanizada da unidade ${unit.cota}`}
                          className="w-full h-auto object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* CTA - Reservar + WhatsApp + Copiar */}
              <div className="space-y-2">
                {unit.status === 'disponivel' && (
                  <Button
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-amber-600 hover:opacity-90 transition-all"
                    onClick={() => setReservationOpen(true)}
                  >
                    <ClipboardList className="w-5 h-5 mr-2" />
                    Reservar esta Unidade
                  </Button>
                )}
                <Button 
                  className={`w-full h-14 text-lg font-semibold transition-all duration-300 ${
                    whatsappSent 
                      ? 'bg-emerald-600 hover:bg-emerald-600' 
                      : 'bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90'
                  }`}
                  onClick={handleSendWhatsApp}
                >
                  {whatsappSent ? (
                    <>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Abrindo WhatsApp...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {currency !== 'BRL' 
                        ? `Enviar por WhatsApp ${CURRENCY_CONFIG[currency].flag}` 
                        : 'Enviar por WhatsApp'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className={`w-full h-11 text-sm font-medium transition-all duration-300 border-white/20 bg-white/5 hover:bg-white/10 ${
                    copied ? 'text-emerald-400 border-emerald-500/40' : 'text-muted-foreground'
                  }`}
                  onClick={handleCopyMessage}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Mensagem copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar mensagem
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    <ReservationModal
      unit={unit}
      isOpen={reservationOpen}
      onClose={() => setReservationOpen(false)}
    />
  </>
  );
}
