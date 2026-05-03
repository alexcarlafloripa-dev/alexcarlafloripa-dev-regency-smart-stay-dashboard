/**
 * Design: Interface Tecnológica Imersiva - Glassmorphism Dark Theme
 * Página do Corretor com simulador de fluxo proporcional
 * Conversor de moeda ao vivo (API open.er-api.com) + WhatsApp multilíngue
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Calculator, Copy, Check, AlertTriangle, 
  Search, ChevronDown, Sliders, ArrowLeft, RefreshCw,
  Banknote, CreditCard, Calendar, PiggyBank, MessageCircle,
  Globe, Loader2
} from 'lucide-react';
import { Link } from 'wouter';
import { Unit, formatCurrency } from '@/data/units';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { openWhatsApp } from '@/lib/whatsapp';
import { toast } from 'sonner';

// ─── Currency config ────────────────────────────────────────────────────────
const CURRENCY_CONFIG = {
  BRL: { label: 'Real (R$)', symbol: 'R$', flag: '🇧🇷', lang: 'pt' },
  USD: { label: 'Dólar (US$)', symbol: 'US$', flag: '🇺🇸', lang: 'en' },
  ARS: { label: 'Peso Argentino', symbol: 'ARS$', flag: '🇦🇷', lang: 'es' },
  CLP: { label: 'Peso Chileno', symbol: 'CLP$', flag: '🇨🇱', lang: 'es' },
  UYU: { label: 'Peso Uruguaio', symbol: 'UYU$', flag: '🇺🇾', lang: 'es' },
} as const;

type CurrencyCode = keyof typeof CURRENCY_CONFIG;

const FALLBACK_RATES: Record<CurrencyCode, number> = {
  BRL: 1,
  USD: 1 / 5.75,
  ARS: 1 / 0.006,
  CLP: 1 / 0.0055,
  UYU: 1 / 0.135,
};

function formatForeignCurrency(valueInBRL: number, rate: number, symbol: string): string {
  const converted = valueInBRL * rate;
  return `${symbol} ${converted.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function Corretor() {
  const { units, loading } = useGoogleSheets();
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnitList, setShowUnitList] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Simulador state
  const [customMensal, setCustomMensal] = useState<number>(0);
  const [customSemestral, setCustomSemestral] = useState<number>(0);
  const [adjustMode, setAdjustMode] = useState<'mensal' | 'semestral'>('mensal');

  // Currency converter state
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('BRL');
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateDate, setRateDate] = useState<string>('');
  const [customRate, setCustomRate] = useState<string>('');
  const ratesFetched = useRef(false);

  // Fetch exchange rates
  useEffect(() => {
    if (ratesFetched.current) return;
    ratesFetched.current = true;
    setRateLoading(true);
    fetch('https://open.er-api.com/v6/latest/BRL')
      .then(r => r.json())
      .then(data => {
        if (data.result === 'success') {
          setRates({
            BRL: 1,
            USD: data.rates.USD,
            ARS: data.rates.ARS,
            CLP: data.rates.CLP,
            UYU: data.rates.UYU,
          });
          const d = new Date(data.time_last_update_utc);
          setRateDate(d.toLocaleDateString('pt-BR'));
        }
      })
      .catch(() => {/* use fallback */})
      .finally(() => setRateLoading(false));
  }, []);

  // Effective rate (custom overrides API)
  const effectiveRate = useMemo(() => {
    if (selectedCurrency === 'BRL') return 1;
    if (customRate && !isNaN(parseFloat(customRate.replace(',', '.')))) {
      const parsed = parseFloat(customRate.replace(',', '.'));
      // customRate is "1 BRL = X foreign", so rate = 1/X? No:
      // We display "1 BRL = X USD", so effectiveRate = X
      return parsed;
    }
    return rates[selectedCurrency];
  }, [selectedCurrency, customRate, rates]);

  // Filter units
  const filteredUnits = useMemo(() => {
    if (!searchQuery) return units;
    const query = searchQuery.toLowerCase();
    return units.filter(unit => 
      unit.cota.toLowerCase().includes(query) ||
      unit.andar.toLowerCase().includes(query)
    );
  }, [units, searchQuery]);

  // Initialize custom values when unit is selected
  useEffect(() => {
    if (selectedUnit) {
      setCustomMensal(selectedUnit.mensais42);
      setCustomSemestral(selectedUnit.semestrais6);
    }
  }, [selectedUnit]);

  // Reset currency when unit changes
  useEffect(() => {
    setSelectedCurrency('BRL');
    setCustomRate('');
  }, [selectedUnit]);

  // Calculate proportional values
  const calculateProportional = (mode: 'mensal' | 'semestral', value: number) => {
    if (!selectedUnit) return;
    const fixedAmount = selectedUnit.entrada;
    const variableTotal = selectedUnit.valorTotal - fixedAmount;
    if (mode === 'mensal') {
      const totalMensal = value * 42;
      const remainingForSemestral = variableTotal - totalMensal;
      const newSemestral = Math.max(0, remainingForSemestral / 6);
      setCustomMensal(value);
      setCustomSemestral(newSemestral);
    } else {
      const totalSemestral = value * 6;
      const remainingForMensal = variableTotal - totalSemestral;
      const newMensal = Math.max(0, remainingForMensal / 42);
      setCustomSemestral(value);
      setCustomMensal(newMensal);
    }
  };

  const isModified = selectedUnit && (
    Math.abs(customMensal - selectedUnit.mensais42) > 0.01 ||
    Math.abs(customSemestral - selectedUnit.semestrais6) > 0.01
  );

  const resetValues = () => {
    if (selectedUnit) {
      setCustomMensal(selectedUnit.mensais42);
      setCustomSemestral(selectedUnit.semestrais6);
    }
  };

  const getSliderLimits = () => {
    if (!selectedUnit) return { minMensal: 0, maxMensal: 0, minSemestral: 0, maxSemestral: 0 };
    const fixedAmount = selectedUnit.entrada;
    const variableTotal = selectedUnit.valorTotal - fixedAmount;
    return {
      minMensal: 0,
      maxMensal: variableTotal / 42,
      minSemestral: 0,
      maxSemestral: variableTotal / 6,
    };
  };

  const limits = getSliderLimits();

  // ─── Generate WhatsApp message (multilingual, no emojis) ──────────────────
  const generateWhatsAppText = () => {
    if (!selectedUnit) return '';
    const isCustom = isModified;
    const lang = CURRENCY_CONFIG[selectedCurrency].lang;
    const isForeign = selectedCurrency !== 'BRL';
    const cfg = CURRENCY_CONFIG[selectedCurrency];
    const today = new Date().toLocaleDateString('pt-BR');

    const fmtBRL = (v: number) => formatCurrency(v);
    const fmtForeign = (v: number) => isForeign ? ` | ${formatForeignCurrency(v, effectiveRate, cfg.symbol)}` : '';

    if (lang === 'en') {
      let text = `REGENCY SQUARE SMART STAY — Canasvieiras, Florianópolis

Unit ${selectedUnit.cota} | ${selectedUnit.tipologia}
Area: ${selectedUnit.areaTotal} m² | ${selectedUnit.andar || 'Ground Floor'}
${selectedUnit.orientacaoSolar ? `Orientation: ${selectedUnit.orientacaoSolar}` : ''}
${selectedUnit.garagem ? `Parking: ${selectedUnit.garagem}` : ''}

*Total Value: ${fmtBRL(selectedUnit.valorTotal)}${fmtForeign(selectedUnit.valorTotal)}*
Down Payment: ${fmtBRL(selectedUnit.entrada)}${fmtForeign(selectedUnit.entrada)}
42x of ${fmtBRL(customMensal)}${fmtForeign(customMensal)}
6 Installments of ${fmtBRL(customSemestral)}${fmtForeign(customSemestral)}
${isCustom ? '\n*SIMULATION - Subject to management approval*' : ''}
_Values updated according to CUB/SC index_`;
      if (isForeign) {
        text += `\n\nExchange rate (${today}): 1 BRL = ${cfg.symbol} ${effectiveRate.toFixed(4)}
_Foreign currency values are for reference only. Contract and all payments are made exclusively in Brazilian Reais (R$)._`;
      }
      text += `\n\n_Regency Square Smart Stay — Your smart investment in Florianópolis_`;
      return text;
    }

    if (lang === 'es') {
      let text = `REGENCY SQUARE SMART STAY — Canasvieiras, Florianópolis

Unidad ${selectedUnit.cota} | ${selectedUnit.tipologia}
Área: ${selectedUnit.areaTotal} m² | ${selectedUnit.andar || 'Planta Baja'}
${selectedUnit.orientacaoSolar ? `Orientación: ${selectedUnit.orientacaoSolar}` : ''}
${selectedUnit.garagem ? `Cochera: ${selectedUnit.garagem}` : ''}

*Valor Total: ${fmtBRL(selectedUnit.valorTotal)}${fmtForeign(selectedUnit.valorTotal)}*
Entrada: ${fmtBRL(selectedUnit.entrada)}${fmtForeign(selectedUnit.entrada)}
42 cuotas de ${fmtBRL(customMensal)}${fmtForeign(customMensal)}
6 refuerzos de ${fmtBRL(customSemestral)}${fmtForeign(customSemestral)}
${isCustom ? '\n*SIMULACIÓN - Sujeta a aprobación de la gestión*' : ''}
_Valores actualizados según índice CUB/SC_`;
      if (isForeign) {
        text += `\n\nCambio del día (${today}): 1 BRL = ${cfg.symbol} ${effectiveRate.toFixed(4)}
_Los valores en moneda extranjera son solo una referencia. El contrato y todos los pagos se realizan exclusivamente en Reales (R$)._`;
      }
      text += `\n\n_Regency Square Smart Stay — Tu inversión inteligente en Florianópolis_`;
      return text;
    }

    // PT
    let text = `REGENCY SQUARE SMART STAY — Canasvieiras, Florianópolis

Unidade ${selectedUnit.cota} | ${selectedUnit.tipologia}
Área: ${selectedUnit.areaTotal} m² | ${selectedUnit.andar || 'Térreo'}
${selectedUnit.orientacaoSolar ? `Orientação: ${selectedUnit.orientacaoSolar}` : ''}
${selectedUnit.garagem ? `Garagem: ${selectedUnit.garagem}` : ''}

*Valor Total: ${fmtBRL(selectedUnit.valorTotal)}*
Entrada: ${fmtBRL(selectedUnit.entrada)}
42x de ${fmtBRL(customMensal)}
6 Reforços de ${fmtBRL(customSemestral)}
${isCustom ? '\n*SIMULAÇÃO - Sujeita à aprovação da gestão do empreendimento*' : ''}
_Valores atualizados conforme índice CUB/SC_

_Regency Square Smart Stay — O seu investimento inteligente em Florianópolis_`;
    return text;
  };

  const handleSendWhatsApp = () => {
    const text = generateWhatsAppText();
    openWhatsApp(text);
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = generateWhatsAppText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Mensagem copiada!', { duration: 1500 });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const showCurrencyWarning = selectedCurrency !== 'BRL';

  return (
    <div className="min-h-screen bg-background bg-mesh">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Área do Investidor</h1>
                  <p className="text-xs text-muted-foreground">Simulador de Fluxo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex flex-col gap-8">

          {/* Left column - Unit selection and simulator */}
          <div className="space-y-6">
            {/* Unit selector */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Selecionar Unidade
              </h2>
              
              <div className="relative">
                <div 
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => setShowUnitList(!showUnitList)}
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    {selectedUnit ? (
                      <span>{selectedUnit.cota} - {selectedUnit.andar} - {selectedUnit.tipologia}</span>
                    ) : (
                      <span className="text-muted-foreground">Selecione uma unidade...</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showUnitList ? 'rotate-180' : ''}`} />
                </div>

                {showUnitList && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 max-h-80 overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/10">
                      <input
                        type="text"
                        placeholder="Buscar unidade..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-muted-foreground">Carregando...</div>
                      ) : filteredUnits.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">Nenhuma unidade encontrada</div>
                      ) : (
                        filteredUnits.map((unit) => (
                          <button
                            key={unit.id}
                            onClick={() => {
                              setSelectedUnit(unit);
                              setShowUnitList(false);
                              setSearchQuery('');
                            }}
                            className={`w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left ${
                              selectedUnit?.id === unit.id ? 'bg-primary/10' : ''
                            }`}
                          >
                            <div>
                              <span className="font-medium">{unit.cota}</span>
                              <span className="text-muted-foreground text-sm ml-2">
                                {unit.andar} • {unit.tipologia}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              unit.status === 'disponivel' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : unit.status === 'reservado'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-red-500/20 text-red-400'
                            }`}>
                              {unit.status === 'disponivel' ? 'Disponível' : unit.status === 'reservado' ? 'Reservado' : 'Vendido'}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Simulator */}
            {selectedUnit && !showUnitList && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-primary" />
                    Simulador de Fluxo
                  </h2>
                  {isModified && (
                    <Button variant="ghost" size="sm" onClick={resetValues}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resetar
                    </Button>
                  )}
                </div>

                {/* Fixed values info */}
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-muted-foreground mb-3">Valores fixos (não editáveis):</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Entrada</p>
                      <p className="font-semibold text-emerald-400">{formatCurrency(selectedUnit.entrada)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor do m²</p>
                      <p className="font-semibold text-blue-400">{formatCurrency(selectedUnit.valorTotal / selectedUnit.areaTotal)}</p>
                    </div>
                  </div>
                </div>

                {/* Adjustment mode selector */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">Ajustar por:</p>
                  <div className="flex gap-2">
                    <Button
                      variant={adjustMode === 'mensal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAdjustMode('mensal')}
                      className={adjustMode === 'mensal' ? '' : 'bg-transparent'}
                    >
                      Parcela Mensal
                    </Button>
                    <Button
                      variant={adjustMode === 'semestral' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAdjustMode('semestral')}
                      className={adjustMode === 'semestral' ? '' : 'bg-transparent'}
                    >
                      Reforço Semestral
                    </Button>
                  </div>
                </div>

                {/* Slider */}
                <div className="mb-6">
                  {adjustMode === 'mensal' ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          42 Parcelas Mensais
                        </label>
                        <span className="text-lg font-bold money text-cyan-400">
                          {formatCurrency(customMensal)}
                        </span>
                      </div>
                      <Slider
                        value={[customMensal]}
                        min={limits.minMensal}
                        max={limits.maxMensal}
                        step={100}
                        onValueChange={([value]) => calculateProportional('mensal', value)}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(limits.minMensal)}</span>
                        <span>Original: {formatCurrency(selectedUnit.mensais42)}</span>
                        <span>{formatCurrency(limits.maxMensal)}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <PiggyBank className="w-4 h-4 text-amber-400" />
                          6 Reforços Semestrais
                        </label>
                        <span className="text-lg font-bold money text-amber-400">
                          {formatCurrency(customSemestral)}
                        </span>
                      </div>
                      <Slider
                        value={[customSemestral]}
                        min={limits.minSemestral}
                        max={limits.maxSemestral}
                        step={500}
                        onValueChange={([value]) => calculateProportional('semestral', value)}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(limits.minSemestral)}</span>
                        <span>Original: {formatCurrency(selectedUnit.semestrais6)}</span>
                        <span>{formatCurrency(limits.maxSemestral)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Calculated result */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Resultado da simulação:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">42x Mensais</p>
                      <p className={`font-bold ${customMensal !== selectedUnit.mensais42 ? 'text-cyan-400' : ''}`}>
                        {formatCurrency(customMensal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">6x Semestrais</p>
                      <p className={`font-bold ${customSemestral !== selectedUnit.semestrais6 ? 'text-amber-400' : ''}`}>
                        {formatCurrency(customSemestral)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warning for modified values */}
                {isModified && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-400">Esta é apenas uma simulação</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Para confirmar este fluxo de pagamento, entre em contato com a gestão do empreendimento para aprovação.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Currency Converter */}
            {selectedUnit && !showUnitList && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Conversor de Moeda
                  {rateLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />}
                  {!rateLoading && rateDate && (
                    <span className="text-xs text-emerald-400 font-normal ml-auto flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      ao vivo · {rateDate}
                    </span>
                  )}
                </h2>

                {/* Currency selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {(Object.keys(CURRENCY_CONFIG) as CurrencyCode[]).map((code) => (
                    <button
                      key={code}
                      onClick={() => { setSelectedCurrency(code); setCustomRate(''); }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-medium transition-all ${
                        selectedCurrency === code
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      <span>{CURRENCY_CONFIG[code].flag}</span>
                      <span>{code}</span>
                    </button>
                  ))}
                </div>

                {/* Live rate + custom override */}
                {selectedCurrency !== 'BRL' && (
                  <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Taxa do dia: 1 BRL = {CURRENCY_CONFIG[selectedCurrency].symbol} {rates[selectedCurrency].toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Taxa personalizada (opcional):</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">1 BRL =</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder={rates[selectedCurrency].toFixed(4)}
                          value={customRate}
                          onChange={(e) => setCustomRate(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <span className="text-xs text-muted-foreground">{CURRENCY_CONFIG[selectedCurrency].symbol}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Converted values */}
                {selectedCurrency !== 'BRL' && (
                  <div className="space-y-2">
                    {[
                      { label: 'Valor Total', brl: selectedUnit.valorTotal },
                      { label: 'Entrada', brl: selectedUnit.entrada },
                      { label: '42x Mensais', brl: customMensal },
                      { label: '6x Semestrais', brl: customSemestral },
                    ].map(({ label, brl }) => (
                      <div key={label} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{formatCurrency(brl)}</p>
                          <p className="font-semibold text-primary text-sm">
                            {formatForeignCurrency(brl, effectiveRate, CURRENCY_CONFIG[selectedCurrency].symbol)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Legal warning */}
                {showCurrencyWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
                  >
                    <p className="text-xs text-amber-300 leading-relaxed">
                      <strong>Aviso:</strong> Valores em moeda estrangeira são apenas uma referência, convertidos pela cotação do momento. O contrato e todos os pagamentos são realizados exclusivamente em <strong>Reais (R$)</strong>.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right column - Preview */}
          <div>
            {selectedUnit && !showUnitList ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold mb-6">Prévia do Fluxo</h2>

                {/* Unit header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gradient">{selectedUnit.cota}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedUnit.status === 'disponivel' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : selectedUnit.status === 'reservado'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedUnit.status === 'disponivel' ? 'Disponível' : selectedUnit.status === 'reservado' ? 'Reservado' : 'Vendido'}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{selectedUnit.andar} • {selectedUnit.tipologia} • {selectedUnit.areaTotal} m²</p>
                </div>

                {/* Total value */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Valor Total do Imóvel</p>
                  <p className="text-3xl font-bold money text-gradient">
                    {formatCurrency(selectedUnit.valorTotal)}
                  </p>
                  {selectedCurrency !== 'BRL' && (
                    <p className="text-sm text-primary mt-1">
                      {formatForeignCurrency(selectedUnit.valorTotal, effectiveRate, CURRENCY_CONFIG[selectedCurrency].symbol)}
                    </p>
                  )}
                </div>

                {/* Payment breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Banknote className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm">Entrada</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-emerald-400">{formatCurrency(selectedUnit.entrada)}</span>
                      {selectedCurrency !== 'BRL' && (
                        <p className="text-xs text-emerald-400/70">{formatForeignCurrency(selectedUnit.entrada, effectiveRate, CURRENCY_CONFIG[selectedCurrency].symbol)}</p>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    customMensal !== selectedUnit.mensais42 
                      ? 'bg-cyan-500/10 border-cyan-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm">42 parcelas mensais</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-cyan-400">{formatCurrency(customMensal)}</span>
                      {selectedCurrency !== 'BRL' && (
                        <p className="text-xs text-cyan-400/70">{formatForeignCurrency(customMensal, effectiveRate, CURRENCY_CONFIG[selectedCurrency].symbol)}</p>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    customSemestral !== selectedUnit.semestrais6 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex items-center gap-3">
                      <PiggyBank className="w-4 h-4 text-amber-400" />
                      <span className="text-sm">Reforços semestrais</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-amber-400">{formatCurrency(customSemestral)}</span>
                      {selectedCurrency !== 'BRL' && (
                        <p className="text-xs text-amber-400/70">{formatForeignCurrency(customSemestral, effectiveRate, CURRENCY_CONFIG[selectedCurrency].symbol)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">Valor do m²</span>
                    </div>
                    <span className="font-semibold text-blue-400">{formatCurrency(selectedUnit.valorTotal / selectedUnit.areaTotal)}</span>
                  </div>
                </div>

                {/* Simulation warning */}
                {isModified && (
                  <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-xs text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      SIMULAÇÃO - Sujeita à aprovação
                    </p>
                  </div>
                )}

                {/* CUB notice */}
                <p className="text-xs text-muted-foreground text-center mb-4">
                  Valores atualizados conforme índice CUB/SC
                </p>

                {/* Language indicator */}
                {selectedCurrency !== 'BRL' && (
                  <div className="mb-4 flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-lg">{CURRENCY_CONFIG[selectedCurrency].flag}</span>
                    <p className="text-xs text-primary">
                      Mensagem será enviada em {CURRENCY_CONFIG[selectedCurrency].lang === 'en' ? 'Inglês' : 'Espanhol'}
                    </p>
                  </div>
                )}

                {/* WhatsApp button */}
                <Button 
                  className="w-full h-14 text-lg font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all duration-300 mb-3"
                  onClick={handleSendWhatsApp}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Enviar por WhatsApp
                </Button>

                {/* Copy button */}
                <Button 
                  variant="outline"
                  className={`w-full h-11 font-medium transition-all duration-300 bg-transparent ${
                    copied ? 'border-emerald-500 text-emerald-400' : 'border-white/20 text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={handleCopyToClipboard}
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
              </motion.div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
