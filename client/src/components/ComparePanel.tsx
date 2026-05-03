/**
 * ComparePanel - Painel comparativo de unidades lado a lado
 * Desktop: grid horizontal com rótulos à esquerda
 * Mobile: cards empilhados verticalmente, um por unidade
 * Tema claro com identidade marrom Regency
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitCompare, Maximize2, Car, Compass, Sun, Banknote, Calendar, CreditCard, Building2, MessageCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCompare } from '@/contexts/CompareContext';
import { useTrack } from '@/hooks/useTrack';
import { formatCurrency, getStatusLabel, Unit } from '@/data/units';
import { openWhatsApp } from '@/lib/whatsapp';

// ─── Gera mensagem comparativa em português ────────────────────────────────
function generateCompareText(units: Unit[]): string {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  let msg = `*REGENCY SQUARE SMART STAY* — Canasvieiras, Florianópolis\n`;
  msg += `Comparativo de Unidades — ${today}\n\n`;

  units.forEach((u, i) => {
    msg += `*${i + 1}. Unidade ${u.cota} | ${u.tipologia}*\n`;
    if (u.andar) msg += `${u.andar}\n`;
    msg += `Área: ${u.areaTotal} m²`;
    if (u.orientacaoSolar) msg += ` | ${u.orientacaoSolar}`;
    if (u.garagem) msg += ` | ${u.garagem}`;
    msg += `\n`;
    msg += `Valor Total: ${formatCurrency(u.valorTotal)}\n`;
    msg += `Valor do m²: ${formatCurrency(u.valorM2)}\n`;
    msg += `Entrada: ${formatCurrency(u.entrada)}\n`;
    msg += `42x de ${formatCurrency(u.mensais42)}\n`;
    msg += `6 Reforços de ${formatCurrency(u.semestrais6)}\n`;
    if (i < units.length - 1) msg += `\n`;
  });

  msg += `\n_Valores atualizados conforme índice CUB/SC_\n`;
  msg += `_Regency Square Smart Stay — O seu investimento inteligente em Florianópolis_`;

  return msg;
}

const statusColors: Record<string, string> = {
  disponivel: 'text-emerald-700',
  reservado: 'text-amber-700',
  vendido: 'text-red-600',
};

const statusDot: Record<string, string> = {
  disponivel: 'bg-emerald-500',
  reservado: 'bg-amber-500',
  vendido: 'bg-red-500',
};

// ─── Desktop: linha com rótulo + valores lado a lado ───────────────────────
interface RowProps {
  label: string;
  values: (string | React.ReactNode)[];
  highlight?: boolean;
  icon?: React.ReactNode;
}

function CompareRow({ label, values, highlight, icon }: RowProps) {
  return (
    <div
      className={`grid gap-4 py-3 border-b border-[#7c4a1e]/10 ${highlight ? 'bg-amber-50 rounded-lg px-2' : ''}`}
      style={{ gridTemplateColumns: `140px repeat(${values.length}, 1fr)` }}
    >
      <div className="flex items-center gap-2 text-xs text-[#7c4a1e]/70 font-medium">
        {icon && <span className="opacity-60">{icon}</span>}
        {label}
      </div>
      {values.map((val, i) => (
        <div key={i} className={`text-sm font-semibold text-center ${highlight ? 'text-amber-800' : 'text-[#2c1810]'}`}>
          {val ?? '—'}
        </div>
      ))}
    </div>
  );
}

// ─── Mobile: card vertical por unidade ────────────────────────────────────
interface MobileCardProps {
  unit: Unit;
  isBestPrice: boolean;
  isBestM2: boolean;
  isBestEntrada: boolean;
  onRemove: () => void;
}

function MobileUnitCard({ unit, isBestPrice, isBestM2, isBestEntrada, onRemove }: MobileCardProps) {
  return (
    <div className="bg-white border border-[#7c4a1e]/15 rounded-xl overflow-hidden shadow-sm">
      {/* Header do card */}
      <div className="flex items-center justify-between p-4 border-b border-[#7c4a1e]/10 bg-[#faf5ef]">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${statusDot[unit.status]}`} />
          <div>
            <span className="text-xl font-bold text-[#2c1810]">{unit.cota}</span>
            <span className={`ml-2 text-xs font-medium ${statusColors[unit.status]}`}>
              {getStatusLabel(unit.status)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#7c4a1e]/10 text-[#7c4a1e]">
            <Building2 className="w-3 h-3" />
            {unit.tipologia}
          </span>
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-[#7c4a1e]/10 text-[#7c4a1e]/50 hover:text-[#7c4a1e] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Características */}
      <div className="p-4 space-y-2.5">
        <p className="text-xs font-semibold text-[#7c4a1e]/70 uppercase tracking-wider mb-3">Características</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-[#5a3a1e]">
            <Maximize2 className="w-3.5 h-3.5 text-[#7c4a1e]/50 shrink-0" />
            <span>{unit.areaTotal} m²</span>
          </div>
          <div className="flex items-center gap-2 text-[#5a3a1e]">
            <Sun className="w-3.5 h-3.5 text-[#7c4a1e]/50 shrink-0" />
            <span className="truncate">{unit.orientacaoSolar?.split('/')[0] || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-[#5a3a1e]">
            <Compass className="w-3.5 h-3.5 text-[#7c4a1e]/50 shrink-0" />
            <span className="truncate">{unit.vista || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-[#5a3a1e]">
            <Car className="w-3.5 h-3.5 text-[#7c4a1e]/50 shrink-0" />
            <span>{unit.garagem || 'Sem vaga'}</span>
          </div>
        </div>

        {/* Valores */}
        <div className="pt-3 border-t border-[#7c4a1e]/10">
          <p className="text-xs font-semibold text-[#7c4a1e]/70 uppercase tracking-wider mb-3">Valores</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7c4a1e]/60 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5" />
                Valor Total
              </span>
              <span className={`text-sm font-bold ${isBestPrice ? 'text-emerald-700' : 'text-[#2c1810]'}`}>
                {formatCurrency(unit.valorTotal)}
                {isBestPrice && <span className="ml-1 text-xs">★</span>}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7c4a1e]/60 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" />
                Valor do m²
              </span>
              <span className={`text-sm font-semibold ${isBestM2 ? 'text-emerald-700' : 'text-[#2c1810]'}`}>
                {formatCurrency(unit.valorM2)}
                {isBestM2 && <span className="ml-1 text-xs">★</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Fluxo */}
        <div className="pt-3 border-t border-[#7c4a1e]/10">
          <p className="text-xs font-semibold text-[#7c4a1e]/70 uppercase tracking-wider mb-3">Fluxo de Pagamento</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7c4a1e]/60 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5" />
                Entrada
              </span>
              <span className={`text-sm font-semibold ${isBestEntrada ? 'text-emerald-700' : 'text-[#2c1810]'}`}>
                {formatCurrency(unit.entrada)}
                {isBestEntrada && <span className="ml-1 text-xs">★</span>}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7c4a1e]/60 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                42x Mensais
              </span>
              <span className="text-sm font-semibold text-[#2c1810]">{formatCurrency(unit.mensais42)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7c4a1e]/60 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                6 Reforços
              </span>
              <span className="text-sm font-semibold text-[#2c1810]">{formatCurrency(unit.semestrais6)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────
export function ComparePanel() {
  const { compareList, removeFromCompare, clearCompare, isCompareOpen, closeCompare } = useCompare();
  const { track } = useTrack();
  const [copied, setCopied] = useState(false);

  if (!isCompareOpen || compareList.length < 2) return null;

  const units = compareList;
  const menorValor = Math.min(...units.map(u => u.valorTotal));
  const menorM2 = Math.min(...units.map(u => u.valorM2));
  const menorEntrada = Math.min(...units.map(u => u.entrada));

  function handleWhatsApp() {
    const text = generateCompareText(units);
    openWhatsApp(text);
    track({ type: 'whatsapp_click', unitCota: units.map(u => u.cota).join('+') });
  }

  function handleCopy() {
    const text = generateCompareText(units);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Comparativo copiado!', { duration: 800 });
      setTimeout(() => setCopied(false), 2000);
      track({ type: 'copy_click', unitCota: units.map(u => u.cota).join('+') });
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) closeCompare(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white border border-[#7c4a1e]/15 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#7c4a1e]/10 shrink-0 bg-[#faf5ef]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#7c4a1e]/10">
                <GitCompare className="w-5 h-5 text-[#7c4a1e]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#2c1810]">Comparativo de Unidades</h2>
                <p className="text-xs text-[#7c4a1e]/60">{units.length} unidades selecionadas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearCompare}
                className="px-3 py-1.5 rounded-xl text-xs text-[#7c4a1e]/60 hover:text-[#7c4a1e] hover:bg-[#7c4a1e]/10 transition-colors hidden sm:block"
              >
                Limpar tudo
              </button>
              <button
                onClick={closeCompare}
                className="p-2 rounded-xl hover:bg-[#7c4a1e]/10 text-[#7c4a1e]/50 hover:text-[#7c4a1e] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Conteúdo com scroll */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-white">

            {/* ── MOBILE: cards empilhados ── */}
            <div className="flex flex-col gap-4 sm:hidden">
              {units.map((unit) => (
                <MobileUnitCard
                  key={unit.id}
                  unit={unit}
                  isBestPrice={unit.valorTotal === menorValor && units.length > 1}
                  isBestM2={unit.valorM2 === menorM2 && units.length > 1}
                  isBestEntrada={unit.entrada === menorEntrada && units.length > 1}
                  onRemove={() => removeFromCompare(unit.id)}
                />
              ))}
              <div className="flex items-center gap-2 text-xs text-[#7c4a1e]/60 pt-2">
                <span className="text-emerald-600">★</span>
                <span>Melhor valor entre as unidades comparadas</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar por WhatsApp
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#7c4a1e]/20 hover:bg-[#7c4a1e]/5 text-[#7c4a1e]/70 hover:text-[#7c4a1e] text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* ── DESKTOP: grid horizontal ── */}
            <div className="hidden sm:block">
              {/* Cabeçalhos das unidades */}
              <div className="grid gap-4 mb-6"
                style={{ gridTemplateColumns: `140px repeat(${units.length}, 1fr)` }}
              >
                <div />
                {units.map((unit) => (
                  <div key={unit.id} className="relative bg-[#faf5ef] border border-[#7c4a1e]/15 rounded-xl p-4 text-center">
                    <button
                      onClick={() => removeFromCompare(unit.id)}
                      className="absolute top-2 right-2 p-1 rounded-lg hover:bg-[#7c4a1e]/10 text-[#7c4a1e]/40 hover:text-[#7c4a1e] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${statusDot[unit.status]}`} />
                      <span className="text-lg font-bold text-[#2c1810]">{unit.cota}</span>
                    </div>
                    <span className={`text-xs font-medium ${statusColors[unit.status]}`}>
                      {getStatusLabel(unit.status)}
                    </span>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#7c4a1e]/10 text-[#7c4a1e]">
                        <Building2 className="w-3 h-3" />
                        {unit.tipologia}
                      </span>
                    </div>
                    <p className="text-xs text-[#7c4a1e]/60 mt-1">{unit.andar}</p>
                  </div>
                ))}
              </div>

              {/* Características */}
              <div className="mb-2">
                <p className="text-xs font-semibold text-[#7c4a1e]/70 uppercase tracking-wider mb-3">Características</p>
                <CompareRow label="Área Total" icon={<Maximize2 className="w-3.5 h-3.5" />} values={units.map(u => `${u.areaTotal} m²`)} />
                <CompareRow label="Orientação Solar" icon={<Sun className="w-3.5 h-3.5" />} values={units.map(u => u.orientacaoSolar || '—')} />
                <CompareRow label="Vista" icon={<Compass className="w-3.5 h-3.5" />} values={units.map(u => u.vista || '—')} />
                <CompareRow label="Garagem" icon={<Car className="w-3.5 h-3.5" />} values={units.map(u => u.garagem || 'Sem vaga')} />
              </div>

              {/* Valores */}
              <div className="mt-6 mb-2">
                <p className="text-xs font-semibold text-[#7c4a1e]/70 uppercase tracking-wider mb-3">Valores</p>
                <CompareRow
                  label="Valor Total"
                  icon={<Banknote className="w-3.5 h-3.5" />}
                  highlight
                  values={units.map(u => (
                    <span key={u.id} className={u.valorTotal === menorValor ? 'text-emerald-700' : 'text-[#2c1810]'}>
                      {formatCurrency(u.valorTotal)}
                      {u.valorTotal === menorValor && units.length > 1 && <span className="ml-1 text-xs text-emerald-600 opacity-80">★</span>}
                    </span>
                  ) as unknown as string)}
                />
                <CompareRow
                  label="Valor do m²"
                  icon={<Maximize2 className="w-3.5 h-3.5" />}
                  values={units.map(u => (
                    <span key={u.id} className={u.valorM2 === menorM2 ? 'text-emerald-700' : ''}>
                      {formatCurrency(u.valorM2)}
                      {u.valorM2 === menorM2 && units.length > 1 && <span className="ml-1 text-xs opacity-80">★</span>}
                    </span>
                  ) as unknown as string)}
                />
              </div>

              {/* Fluxo de Pagamento */}
              <div className="mt-6 mb-2">
                <p className="text-xs font-semibold text-[#7c4a1e]/70 uppercase tracking-wider mb-3">Fluxo de Pagamento</p>
                <CompareRow
                  label="Entrada"
                  icon={<Banknote className="w-3.5 h-3.5" />}
                  values={units.map(u => (
                    <span key={u.id} className={u.entrada === menorEntrada ? 'text-emerald-700' : ''}>
                      {formatCurrency(u.entrada)}
                      {u.entrada === menorEntrada && units.length > 1 && <span className="ml-1 text-xs opacity-80">★</span>}
                    </span>
                  ) as unknown as string)}
                />
                <CompareRow label="42 Parcelas Mensais" icon={<Calendar className="w-3.5 h-3.5" />} values={units.map(u => formatCurrency(u.mensais42))} />
                <CompareRow label="6 Reforços Semestrais" icon={<CreditCard className="w-3.5 h-3.5" />} values={units.map(u => formatCurrency(u.semestrais6))} />
              </div>

              {/* Legenda + Botões */}
              <div className="mt-6 pt-4 border-t border-[#7c4a1e]/10">
                <div className="flex items-center gap-2 text-xs text-[#7c4a1e]/60 mb-4">
                  <span className="text-emerald-600">★</span>
                  <span>Melhor valor entre as unidades comparadas</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar por WhatsApp
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#7c4a1e]/20 hover:bg-[#7c4a1e]/5 text-[#7c4a1e]/70 hover:text-[#7c4a1e] text-sm transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
