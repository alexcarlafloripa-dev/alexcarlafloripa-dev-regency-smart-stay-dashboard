/**
 * ReservationModal — Ficha de Reserva Regency Square Smart Stay
 *
 * Fluxo:
 * 1. Tela explicativa (como funciona a reserva + fluxo real da unidade)
 * 2. Formulário:
 *    a. Dados do Corretor (primeiro — obrigatórios)
 *    b. Fluxo de Pagamento (moeda + adaptação personalizada — opcional)
 *    c. Dados do Cliente
 *    d. Dados Pessoais, Endereço, Documentos
 * 3. Tela de sucesso com download Word e WhatsApp
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, CheckCircle2, Download, MessageCircle,
  Calendar, Banknote, FileSignature, AlertCircle, Loader2,
  Paperclip, Trash2, TrendingUp, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { openWhatsApp } from '@/lib/whatsapp';
import type { Unit } from '@/data/units';

interface ReservationModalProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'explain' | 'choose' | 'form' | 'success';
type TipoReservante = 'corretor' | 'investidor' | null;

const ESTADO_CIVIL_OPTIONS = [
  'Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável',
];

const REGIME_OPTIONS = [
  'Comunhão Parcial de Bens', 'Comunhão Universal de Bens',
  'Separação Total de Bens', 'Participação Final nos Aquestos',
];

// Moedas disponíveis para o fluxo de pagamento
const MOEDAS = [
  { code: 'BRL', label: 'Real Brasileiro (R$)', symbol: 'R$' },
  { code: 'USD', label: 'Dólar Americano (US$)', symbol: 'US$' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€' },
  { code: 'ARS', label: 'Peso Argentino (ARS$)', symbol: 'ARS$' },
  { code: 'CLP', label: 'Peso Chileno (CLP$)', symbol: 'CLP$' },
  { code: 'UYU', label: 'Peso Uruguaio (UYU$)', symbol: 'UYU$' },
  { code: 'PYG', label: 'Guarani Paraguaio (₲)', symbol: '₲' },
  { code: 'BOB', label: 'Boliviano (Bs.)', symbol: 'Bs.' },
  { code: 'PEN', label: 'Sol Peruano (S/.)', symbol: 'S/.' },
  { code: 'COP', label: 'Peso Colombiano (COP$)', symbol: 'COP$' },
];

export function ReservationModal({ unit, isOpen, onClose }: ReservationModalProps) {
  const [step, setStep] = useState<Step>('explain');
  const [tipoReservante, setTipoReservante] = useState<TipoReservante>(null);
  const [corretorSelecionadoId, setCorretorSelecionadoId] = useState<number | null>(null);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [docFilename, setDocFilename] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [wordDownloaded, setWordDownloaded] = useState(false);
  const [formError, setFormError] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Sempre que o step muda, volta o scroll do modal para o topo
  // Usa requestAnimationFrame para garantir que o scroll acontece após a animação de entrada
  useEffect(() => {
    const el = modalScrollRef.current;
    if (!el) return;
    // Scroll imediato
    el.scrollTop = 0;
    // Segundo scroll após animação (framer-motion pode deslocar o scroll durante a animação)
    const timer = setTimeout(() => { el.scrollTop = 0; }, 100);
    return () => clearTimeout(timer);
  }, [step]);

  // DDI do corretor para o seletor de país
  const [ddiCorretor, setDdiCorretor] = useState('+55');

  // Modalidade do corretor: 'imobiliaria' | 'autonomo' | '' (não selecionado)
  const [modalidadeCorretor, setModalidadeCorretor] = useState<'imobiliaria' | 'autonomo' | ''>('');

  // Opção de fluxo: 'padrao' | 'personalizado' | 'nao_definido' | '' (não selecionado)
  const [fluxoOpcao, setFluxoOpcao] = useState<'padrao' | 'personalizado' | 'nao_definido' | ''>('');

  const [form, setForm] = useState({
    // ── Dados do corretor (obrigatórios — aparecem primeiro)
    nomeCorretor: '',
    telefoneCorretor: '',
    imobiliaria: '',
    responsavelVenda: '',

    // ── Fluxo de pagamento
    fluxoMoeda: 'BRL',
    fluxoAdaptacao: '',

    // ── Dados do cliente
    nomeCompleto: '',
    email: '',
    telefoneCelular: '',
    telefoneResidencial: '',
    dataNascimento: '',
    nacionalidade: '',
    naturalidade: '',
    cpfRnm: '',
    orgaoExpeditor: '',
    dataExpedicao: '',
    profissao: '',
    estadoCivil: '',
    regimeComunhao: '',
    endereco: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidade: '',
    informacoesExtras: '',
  });

  // Lista de corretores cadastrados
  const { data: corretoresList = [] } = trpc.corretor.list.useQuery();

  const createReservation = trpc.reservation.create.useMutation();
  const generateDoc = trpc.reservation.generateDoc.useMutation();
  const uploadAttachment = trpc.reservation.uploadAttachment.useMutation();
  const [driveUploadStatus, setDriveUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  // Cotação de moeda em tempo real
  const { data: ratesData, isLoading: ratesLoading } = trpc.currency.rates.useQuery(
    { base: 'BRL' },
    { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  );

  // Converte um valor em BRL para a moeda selecionada
  const convertBRL = (valueBRL: number): number => {
    if (form.fluxoMoeda === 'BRL' || !ratesData?.rates) return valueBRL;
    const rate = ratesData.rates[form.fluxoMoeda];
    return rate ? valueBRL * rate : valueBRL;
  };

  // Formata valor na moeda selecionada
  const fmtMoeda = (valueBRL: number): string => {
    const converted = convertBRL(valueBRL);
    const moeda = MOEDAS.find(m => m.code === form.fluxoMoeda) ?? MOEDAS[0];
    if (form.fluxoMoeda === 'BRL') {
      return converted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return `${moeda.symbol} ${converted.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const [driveUploadCount, setDriveUploadCount] = useState(0);

  const handleClose = () => {
    setStep('explain');
    setTipoReservante(null);
    setCorretorSelecionadoId(null);
    setFormError('');
    onClose();
  };

  // Quando um corretor é selecionado na lista, preenche automaticamente os campos
  const handleSelecionarCorretor = (id: number) => {
    setCorretorSelecionadoId(id);
    const c = corretoresList.find(x => x.id === id);
    if (c) {
      // Define modalidade automaticamente baseado na imobiliária cadastrada
      const isAutonomo = !c.imobiliaria || c.imobiliaria.toLowerCase().includes('autônomo') || c.imobiliaria.toLowerCase().includes('autonomo');
      setModalidadeCorretor(isAutonomo ? 'autonomo' : 'imobiliaria');
      setForm(prev => ({
        ...prev,
        nomeCorretor: c.nome,
        telefoneCorretor: c.telefone,
        imobiliaria: isAutonomo ? '' : (c.imobiliaria ?? ''),
      }));
    }
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setFormError('');
    // Valida dados do corretor apenas quando não é investidor direto
    if (tipoReservante === 'corretor') {
      if (!form.nomeCorretor.trim()) {
        setFormError('O nome do corretor é obrigatório.');
        return;
      }
      if (!form.telefoneCorretor.trim() || form.telefoneCorretor.trim().length < 8) {
        setFormError('O telefone do corretor é obrigatório.');
        return;
      }
      // Valida modalidade (imobiliária ou autônomo)
      if (!modalidadeCorretor) {
        setFormError('Selecione a modalidade: Imobiliária ou Autônomo(a).');
        return;
      }
      // Se imobiliária, exige o nome
      if (modalidadeCorretor === 'imobiliaria' && !form.imobiliaria.trim()) {
        setFormError('Informe o nome da imobiliária.');
        return;
      }
    }
    // Valida seleção de fluxo (obrigatória)
    if (!fluxoOpcao) {
      setFormError('Selecione uma opção de fluxo de pagamento antes de continuar.');
      return;
    }
    if (!form.nomeCompleto.trim()) {
      setFormError('O nome completo do cliente é obrigatório.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setFormError('Informe um e-mail válido do cliente.');
      return;
    }
    if (!unit) return;

    // Se fluxo não definido, limpar dados de fluxo
    const incluirFluxo = fluxoOpcao === 'padrao' || fluxoOpcao === 'personalizado';

    // Valores convertidos para a moeda selecionada
    const moedaSymbol = (MOEDAS.find(m => m.code === form.fluxoMoeda) ?? MOEDAS[0]).symbol;
    const fluxoConvertido = incluirFluxo && form.fluxoMoeda !== 'BRL' && ratesData?.rates ? {
      fluxoValorTotal: `${moedaSymbol} ${convertBRL(unit.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      fluxoEntrada: `${moedaSymbol} ${convertBRL(unit.entrada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      fluxoSinal: `${moedaSymbol} ${convertBRL(30000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      fluxoRestante: `${moedaSymbol} ${convertBRL(Math.max(0, unit.entrada - 30000)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      fluxoMensais42: `${moedaSymbol} ${convertBRL(unit.mensais42).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      fluxoSemestrais6: `${moedaSymbol} ${convertBRL(unit.semestrais6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      fluxoCotacao: `1 BRL = ${(ratesData.rates[form.fluxoMoeda] ?? 0).toFixed(4)} ${form.fluxoMoeda}`,
    } : {};

    try {
      // Determina o valor final de imobiliária baseado na modalidade
      const imobiliariaFinal = modalidadeCorretor === 'autonomo' ? 'Autônomo(a)' : (form.imobiliaria || 'Sem Imobiliária');

      const result = await createReservation.mutateAsync({
        unitCota: unit.cota,
        unitTipologia: unit.tipologia,
        unitAndar: unit.andar,
        unitValorTotal: unit.valorTotal?.toString(),
        unitEntrada: unit.entrada?.toString(),
        unitMensais42: unit.mensais42?.toString(),
        unitSemestrais6: unit.semestrais6?.toString(),
        unitAreaTotal: unit.areaTotal?.toString(),
        unitValorM2: unit.valorM2?.toString(),
        ...form,
        // Combina DDI + número limpo do corretor
        telefoneCorretor: ddiCorretor + form.telefoneCorretor,
        imobiliaria: imobiliariaFinal,
        // Se não definido, limpar campos de fluxo para não aparecer no Word
        fluxoMoeda: incluirFluxo ? form.fluxoMoeda : 'NAO_DEFINIDO',
        fluxoAdaptacao: incluirFluxo && fluxoOpcao === 'personalizado' ? form.fluxoAdaptacao : '',
        ...fluxoConvertido,
      });
      if (result.id) {
        setReservationId(result.id);
      }
      setStep('success');

      // Upload automático dos anexos para o Drive
      if (attachments.length > 0) {
        setDriveUploadStatus('uploading');
        setDriveUploadCount(0);
        let uploaded = 0;
        for (const file of attachments) {
          try {
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve((reader.result as string).split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            await uploadAttachment.mutateAsync({
              imobiliaria: modalidadeCorretor === 'autonomo' ? 'Autônomo(a)' : (form.imobiliaria || 'Sem Imobiliária'),
              nomeCorretor: form.nomeCorretor,
              telefoneCorretor: ddiCorretor + form.telefoneCorretor,
              unitCota: unit?.cota ?? 'SN',
              nomeInvestidor: form.nomeCompleto || 'Investidor',
              filename: file.name,
              base64,
              mimeType: file.type,
            });
            uploaded++;
            setDriveUploadCount(uploaded);
          } catch (uploadErr) {
            console.error('Erro ao enviar anexo para o Drive:', uploadErr);
          }
        }
        setDriveUploadStatus(uploaded === attachments.length ? 'done' : 'error');
      }
    } catch (err) {
      setFormError('Erro ao salvar a reserva. Tente novamente.');
    }
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownloadDoc = async (): Promise<boolean> => {
    if (!reservationId) return false;
    setIsDownloading(true);
    try {
      const result = await generateDoc.mutateAsync({ id: reservationId });
      const bytes = Uint8Array.from(atob(result.base64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      setDocFilename(result.filename);
      setWordDownloaded(true);
      return true;
    } catch (err) {
      console.error('Erro ao gerar documento:', err);
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  const handleWhatsApp = async () => {
    // Baixa o Word automaticamente antes de abrir o WhatsApp (proteção contra perda de dados)
    if (!wordDownloaded) {
      const downloaded = await handleDownloadDoc();
      if (!downloaded) {
        // Se falhar o download, ainda assim abre o WhatsApp mas avisa
        console.warn('Download do Word falhou, abrindo WhatsApp mesmo assim.');
      }
    }
    const anexosInfo = attachments.length > 0
      ? `\n\nDocumentos anexados (${attachments.length}): ${attachments.map(f => f.name).join(', ')}\n⚠️ Envie os documentos em seguida nesta conversa.`
      : '';
    const msg = `Olá Alex! Acabei de preencher a ficha de reserva para a unidade ${unit?.cota} (${unit?.tipologia ?? ''}) do Regency Square Smart Stay.\n\nCliente: ${form.nomeCompleto}\nE-mail: ${form.email}\nTelefone: ${form.telefoneCelular}${anexosInfo}\n\nPor favor, confirme o recebimento.`;
    openWhatsApp(msg);
  };

  if (!isOpen || !unit) return null;

  // Moeda selecionada
  const moedaSelecionada = MOEDAS.find(m => m.code === form.fluxoMoeda) ?? MOEDAS[0];

  // Fluxo da unidade em BRL para exibição
  const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

        {/* Modal */}
        <motion.div
          ref={modalScrollRef}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl border border-primary/30 shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary">Ficha de Reserva</h2>
              <p className="text-xs text-muted-foreground">
                Unidade {unit.cota} — {unit.tipologia} — {unit.andar}
              </p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">

            {/* ── ETAPA 1: EXPLICAÇÃO ──────────────────────────────── */}
            {step === 'explain' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="space-y-4">
                  {/* Etapa 1 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                      <FileSignature className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">Etapa 1 — Reserva</p>
                      <p className="text-sm text-muted-foreground">Assinatura do contrato e pagamento do sinal de <strong className="text-foreground">R$ 30.000,00</strong>.</p>
                    </div>
                  </div>

                  {/* Etapa 2 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                      <Banknote className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">Etapa 2 — Fechamento do grupo</p>
                      <p className="text-sm text-muted-foreground mb-3">Formalização do contrato e pagamento do <strong className="text-foreground">restante da entrada</strong>.</p>

                      {/* Fluxo real da unidade selecionada */}
                      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-emerald-700 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Fluxo — Unidade {unit.cota}{moedaSelecionada.code !== 'BRL' ? ` (${moedaSelecionada.code})` : ''}
                          </p>
                          {moedaSelecionada.code !== 'BRL' && ratesData?.rates && (
                            <span className="text-xs text-emerald-700">✓ Cotação ao vivo</span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor total</span>
                            <div className="text-right">
                              <span className="font-medium">{moedaSelecionada.code !== 'BRL' && ratesData?.rates ? `${moedaSelecionada.symbol} ${convertBRL(unit.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : fmtBRL(unit.valorTotal)}</span>
                              {moedaSelecionada.code !== 'BRL' && ratesData?.rates && <span className="block text-muted-foreground text-[10px]">{fmtBRL(unit.valorTotal)} em BRL</span>}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Entrada (~28%)</span>
                            <div className="text-right">
                              <span className="font-medium">{moedaSelecionada.code !== 'BRL' && ratesData?.rates ? `${moedaSelecionada.symbol} ${convertBRL(unit.entrada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : fmtBRL(unit.entrada)}</span>
                              {moedaSelecionada.code !== 'BRL' && ratesData?.rates && <span className="block text-muted-foreground text-[10px]">{fmtBRL(unit.entrada)} em BRL</span>}
                            </div>
                          </div>
                          <div className="h-px bg-[#7c4a1e]/15 my-1" />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sinal — Assinatura</span>
                            <div className="text-right">
                              <span className="font-medium text-amber-700">{moedaSelecionada.code !== 'BRL' && ratesData?.rates ? `${moedaSelecionada.symbol} ${convertBRL(30000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '− R$ 30.000,00'}</span>
                              {moedaSelecionada.code !== 'BRL' && ratesData?.rates && <span className="block text-muted-foreground text-[10px]">R$ 30.000,00 em BRL</span>}
                            </div>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-emerald-700 font-semibold">Restante entrada</span>
                            <div className="text-right">
                              <span className="text-emerald-700">{moedaSelecionada.code !== 'BRL' && ratesData?.rates ? `${moedaSelecionada.symbol} ${convertBRL(Math.max(0, unit.entrada - 30000)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : fmtBRL(Math.max(0, unit.entrada - 30000))}</span>
                              {moedaSelecionada.code !== 'BRL' && ratesData?.rates && <span className="block text-muted-foreground text-[10px] font-normal">{fmtBRL(Math.max(0, unit.entrada - 30000))} em BRL</span>}
                            </div>
                          </div>
                          <div className="h-px bg-[#7c4a1e]/15 my-1" />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">42× mensais</span>
                            <div className="text-right">
                              <span className="font-medium">{moedaSelecionada.code !== 'BRL' && ratesData?.rates ? `${moedaSelecionada.symbol} ${convertBRL(unit.mensais42).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : fmtBRL(unit.mensais42)}</span>
                              {moedaSelecionada.code !== 'BRL' && ratesData?.rates && <span className="block text-muted-foreground text-[10px]">{fmtBRL(unit.mensais42)} em BRL</span>}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">6 reforços</span>
                            <div className="text-right">
                              <span className="font-medium">{moedaSelecionada.code !== 'BRL' && ratesData?.rates ? `${moedaSelecionada.symbol} ${convertBRL(unit.semestrais6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : fmtBRL(unit.semestrais6)}</span>
                              {moedaSelecionada.code !== 'BRL' && ratesData?.rates && <span className="block text-muted-foreground text-[10px]">{fmtBRL(unit.semestrais6)} em BRL</span>}
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground mt-2 italic">* Valores sujeitos à atualização pelo CUB/SC conforme contrato.</p>
                      </div>
                    </div>
                  </div>

                  {/* Nota SPE + aviso de pagamento em BRL */}
                  <div className="rounded-xl bg-[#7c4a1e]/5 border border-[#7c4a1e]/15 p-3 text-xs text-muted-foreground space-y-1.5">
                    <p>Empreendimento estruturado no modelo a preço de custo.</p>
                    {moedaSelecionada.code !== 'BRL' && (
                      <p className="text-amber-700 font-medium">⚠ Neste modelo de preço de custo, <strong>todos os pagamentos são realizados em Reais (BRL)</strong>. Os valores em {moedaSelecionada.code} são apenas uma referência de cotação.</p>
                    )}
                  </div>
                </div>

                <Button className="w-full" onClick={() => { setTipoReservante('corretor'); setStep('form'); }}>
                  Preencher a Ficha de Reserva
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Tela de escolha removida — fluxo vai direto para corretor */}
            {/* Lógica de investidor direto preservada internamente para uso futuro */}

            {/* ── ETAPA 2: FORMULÁRIO ────────────────────────────────────────────── */}
            {step === 'form' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="space-y-6">

                  {/* ── 1. DADOS DO CORRETOR (primeiro — obrigatórios) ── */}
                  {tipoReservante === 'corretor' && (
                  <div className="rounded-xl border-2 border-primary/60 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-background text-xs font-bold shrink-0">1</span>
                      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Dados do Corretor</h3>
                      <span className="ml-auto text-xs text-primary/70 font-medium">Preencha primeiro ↓</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {/* Select de corretores cadastrados */}
                      {corretoresList.length > 0 ? (
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Selecione seu nome *</label>
                          <select
                            value={corretorSelecionadoId ?? ''}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === '__outro__') {
                                setCorretorSelecionadoId(null);
                                setModalidadeCorretor('');
                                setDdiCorretor('+55');
                                setForm(prev => ({ ...prev, nomeCorretor: '', telefoneCorretor: '', imobiliaria: '' }));
                              } else {
                                handleSelecionarCorretor(Number(val));
                              }
                            }}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                          >
                            <option value="">-- Selecione o corretor --</option>
                            {corretoresList.filter(c => c.ativo === 'sim').map(c => (
                              <option key={c.id} value={c.id}>
                                {c.nome} {c.imobiliaria ? `— ${c.imobiliaria}` : ''}
                              </option>
                            ))}
                            <option value="__outro__">➕ Não estou na lista (preencher manualmente)</option>
                          </select>
                          {corretorSelecionadoId && (
                            <div className="mt-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-muted-foreground">
                              <span className="text-primary font-semibold">✓ Selecionado: </span>
                              {form.nomeCorretor} • {form.telefoneCorretor}
                              {form.imobiliaria && <span> • {form.imobiliaria}</span>}
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* Campos manuais (quando não há corretores cadastrados ou selecionou "outro") */}
                      {(corretoresList.length === 0 || corretorSelecionadoId === null) && (
                        <>
                          <div className="grid grid-cols-1 gap-4">
                            <Field label="Nome do Corretor *" value={form.nomeCorretor} onChange={v => handleChange('nomeCorretor', v)} placeholder="Seu nome completo" />
                            <PhoneField
                              label="Telefone do Corretor *"
                              ddi={ddiCorretor}
                              onDdiChange={v => setDdiCorretor(v)}
                              value={form.telefoneCorretor}
                              onChange={v => handleChange('telefoneCorretor', v)}
                              placeholder="99999-9999"
                            />
                          </div>
                          {/* Modalidade: Imobiliária ou Autônomo(a) */}
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2">Modalidade *</label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setModalidadeCorretor('imobiliaria');
                                  handleChange('imobiliaria', '');
                                }}
                                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                                  modalidadeCorretor === 'imobiliaria'
                                    ? 'border-primary bg-primary/15 text-primary'
                                    : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/30 hover:bg-white/10'
                                }`}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Imobiliária
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setModalidadeCorretor('autonomo');
                                  handleChange('imobiliaria', '');
                                }}
                                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                                  modalidadeCorretor === 'autonomo'
                                    ? 'border-primary bg-primary/15 text-primary'
                                    : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/30 hover:bg-white/10'
                                }`}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Autônomo(a)
                              </button>
                            </div>
                          </div>

                          {/* Campo de nome da imobiliária — só aparece quando modalidade = imobiliária */}
                          {modalidadeCorretor === 'imobiliaria' && (
                            <div className="grid grid-cols-2 gap-4">
                              <Field
                                label="Nome da Imobiliária *"
                                value={form.imobiliaria}
                                onChange={v => handleChange('imobiliaria', v)}
                                placeholder="Ex: Imob Jurerê, RE/MAX..."
                              />
                              <Field label="Responsável pela Venda" value={form.responsavelVenda} onChange={v => handleChange('responsavelVenda', v)} placeholder="Seu nome (se diferente)" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Investidor direto — sem seção de corretor */}
                  {tipoReservante === 'investidor' && (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-sm text-emerald-700 font-semibold">Reserva Direta do Investidor</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Seus dados pessoais serão usados como identificador. Preencha os campos abaixo.</p>
                    </div>
                  )}

                  {/* ── 2. FLUXO DE PAGAMENTO (obrigatório — 3 opções) ── */}
                  <div className={`rounded-xl border p-4 transition-colors ${
                    !fluxoOpcao && formError.includes('fluxo')
                      ? 'border-red-500/50 bg-red-500/5'
                      : 'border-amber-300 bg-amber-50'
                  }`}>
                    <h3 className="text-sm font-semibold text-amber-700 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      2. Fluxo de Pagamento *
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">Selecione uma opção obrigatória. O fluxo só aparecerá na ficha se você aceitar o padrão ou informar uma proposta.</p>

                    {/* 3 opções de radio */}
                    <div className="space-y-2 mb-4">
                      {/* Opção 1: Fluxo padrão */}
                      <button
                        type="button"
                        onClick={() => setFluxoOpcao('padrao')}
                        className={`w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                          fluxoOpcao === 'padrao'
                            ? 'border-amber-500 bg-amber-500/15'
                            : 'border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-amber-500/5'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          fluxoOpcao === 'padrao' ? 'border-amber-500' : 'border-white/30'
                        }`}>
                          {fluxoOpcao === 'padrao' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Aceito o fluxo padrão</p>
                          <p className="text-xs text-muted-foreground">Entrada + 42 mensais + 6 reforços conforme tabela do empreendimento</p>
                        </div>
                      </button>

                      {/* Opção 2: Proposta diferente */}
                      <button
                        type="button"
                        onClick={() => setFluxoOpcao('personalizado')}
                        className={`w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                          fluxoOpcao === 'personalizado'
                            ? 'border-primary bg-primary/15'
                            : 'border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/5'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          fluxoOpcao === 'personalizado' ? 'border-primary' : 'border-white/30'
                        }`}>
                          {fluxoOpcao === 'personalizado' && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Tenho uma proposta diferente</p>
                          <p className="text-xs text-muted-foreground">O cliente tem uma sugestão de fluxo personalizado</p>
                        </div>
                      </button>

                      {/* Opção 3: Não definido */}
                      <button
                        type="button"
                        onClick={() => setFluxoOpcao('nao_definido')}
                        className={`w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                          fluxoOpcao === 'nao_definido'
                            ? 'border-white/40 bg-white/10'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          fluxoOpcao === 'nao_definido' ? 'border-white/60' : 'border-white/30'
                        }`}>
                          {fluxoOpcao === 'nao_definido' && <div className="w-2 h-2 rounded-full bg-white/60" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Não definido agora</p>
                          <p className="text-xs text-muted-foreground">O fluxo não será incluído na ficha de reserva</p>
                        </div>
                      </button>
                    </div>

                    {/* Conteúdo condicional: só aparece quando padrão ou personalizado */}
                    {(fluxoOpcao === 'padrao' || fluxoOpcao === 'personalizado') && (
                      <div className="space-y-4 mt-2">
                        {/* Seletor de moeda */}
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Moeda do pagamento
                          </label>
                          <select
                            value={form.fluxoMoeda}
                            onChange={e => handleChange('fluxoMoeda', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                          >
                            {MOEDAS.map(m => (
                              <option key={m.code} value={m.code}>{m.label}</option>
                            ))}
                          </select>
                          {form.fluxoMoeda !== 'BRL' && (
                            <p className="text-xs text-amber-700 mt-1.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Moeda: <strong>{moedaSelecionada.label}</strong>. Valores no documento em {moedaSelecionada.symbol}.
                            </p>
                          )}
                        </div>

                        {/* Fluxo padrão com conversão */}
                        {fluxoOpcao === 'padrao' && (
                          <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-muted-foreground font-semibold uppercase tracking-wide">
                                Fluxo — Unidade {unit.cota}
                                {form.fluxoMoeda !== 'BRL' && (
                                  <span className="text-amber-700 ml-1">({moedaSelecionada.symbol})</span>
                                )}
                              </p>
                              {ratesLoading && <Loader2 className="w-3 h-3 animate-spin text-amber-700" />}
                              {ratesData && form.fluxoMoeda !== 'BRL' && (
                                <span className="text-emerald-700 text-[10px]">Cotação ao vivo ✓</span>
                              )}
                            </div>

                            {/* Layout com BRL ao lado quando moeda estrangeira */}
                            {form.fluxoMoeda !== 'BRL' && ratesData?.rates ? (
                              <div className="space-y-1.5">
                                {/* Cabeçalho de colunas */}
                                <div className="grid grid-cols-3 gap-x-2 text-[10px] text-muted-foreground/60 pb-1 border-b border-white/10">
                                  <span></span>
                                  <span className="text-right text-amber-700">{moedaSelecionada.code}</span>
                                  <span className="text-right">BRL</span>
                                </div>
                                {[
                                  { label: 'Valor total:', brl: unit.valorTotal, color: '' },
                                  { label: 'Entrada (~28%):', brl: unit.entrada, color: '' },
                                  { label: 'Sinal — Assinatura:', brl: 30000, color: 'text-amber-700' },
                                  { label: 'Restante entrada:', brl: Math.max(0, unit.entrada - 30000), color: 'text-emerald-700' },
                                  { label: '42× mensais:', brl: unit.mensais42, color: '' },
                                  { label: '6 reforços:', brl: unit.semestrais6, color: '' },
                                ].map(({ label, brl, color }) => (
                                  <div key={label} className="grid grid-cols-3 gap-x-2">
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className={`font-medium text-right ${color || 'text-foreground'}`}>
                                      {moedaSelecionada.symbol} {convertBRL(brl).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className="text-right text-muted-foreground">
                                      {fmtBRL(brl)}
                                    </span>
                                  </div>
                                ))}
                                <p className="text-muted-foreground mt-1 text-[10px] italic border-t border-white/10 pt-1">
                                  Taxa: 1 BRL = {(ratesData.rates[form.fluxoMoeda] ?? 0).toFixed(4)} {form.fluxoMoeda} — Pagamentos realizados em BRL
                                </p>
                                <p className="text-amber-700 text-[10px] font-medium">
                                  ⚠ Neste modelo de preço de custo, todos os pagamentos são em Reais (BRL).
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="text-muted-foreground">Valor total:</span>
                                <span className="font-medium text-right">{fmtMoeda(unit.valorTotal)}</span>
                                <span className="text-muted-foreground">Entrada (~28%):</span>
                                <span className="font-medium text-right">{fmtMoeda(unit.entrada)}</span>
                                <span className="text-muted-foreground">Sinal — Assinatura:</span>
                                <span className="font-medium text-right text-amber-700">{fmtMoeda(30000)}</span>
                                <span className="text-muted-foreground">Restante entrada:</span>
                                <span className="font-medium text-right text-emerald-700">{fmtMoeda(Math.max(0, unit.entrada - 30000))}</span>
                                <span className="text-muted-foreground">42× mensais:</span>
                                <span className="font-medium text-right">{fmtMoeda(unit.mensais42)}</span>
                                <span className="text-muted-foreground">6 reforços:</span>
                                <span className="font-medium text-right">{fmtMoeda(unit.semestrais6)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Campo de proposta personalizada */}
                        {fluxoOpcao === 'personalizado' && (
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              Descreva a proposta do cliente *
                            </label>
                            <textarea
                              value={form.fluxoAdaptacao}
                              onChange={e => handleChange('fluxoAdaptacao', e.target.value)}
                              placeholder={`Ex: Cliente propõe pagar a entrada em ${moedaSelecionada.symbol} 25.000 + 48 parcelas mensais de ${moedaSelecionada.symbol} 800. Aguardando aprovação do gestor.`}
                              rows={4}
                              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm resize-none"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── 3. DADOS DO CLIENTE ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">3. Dados do Cliente</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <Field label="Nome Completo *" value={form.nomeCompleto} onChange={v => handleChange('nomeCompleto', v)} placeholder="Nome completo do cliente" />
                      <Field label="E-mail *" value={form.email} onChange={v => handleChange('email', v)} placeholder="email@exemplo.com" type="email" />
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Telefone Celular" value={form.telefoneCelular} onChange={v => handleChange('telefoneCelular', v)} placeholder="+55 (48) 9 9999-9999" />
                        <Field label="Telefone Residencial" value={form.telefoneResidencial} onChange={v => handleChange('telefoneResidencial', v)} placeholder="(48) 3333-3333" />
                      </div>
                    </div>
                  </div>

                  {/* ── 4. DADOS PESSOAIS ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">4. Dados Pessoais</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Data de Nascimento" value={form.dataNascimento} onChange={v => handleChange('dataNascimento', v)} placeholder="DD/MM/AAAA" />
                        <Field label="Profissão" value={form.profissao} onChange={v => handleChange('profissao', v)} placeholder="Ex: Empresário" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Estado Civil" value={form.estadoCivil} onChange={v => handleChange('estadoCivil', v)} options={ESTADO_CIVIL_OPTIONS} />
                        <SelectField label="Regime de Comunhão" value={form.regimeComunhao} onChange={v => handleChange('regimeComunhao', v)} options={REGIME_OPTIONS} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="CPF / RNM" value={form.cpfRnm} onChange={v => handleChange('cpfRnm', v)} placeholder="000.000.000-00 ou RNM" />
                        <Field label="Órgão Expeditor / UF" value={form.orgaoExpeditor} onChange={v => handleChange('orgaoExpeditor', v)} placeholder="Ex: SSP/SC" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Data de Expedição" value={form.dataExpedicao} onChange={v => handleChange('dataExpedicao', v)} placeholder="DD/MM/AAAA" />
                        <div /> {/* espaço vazio para manter grid */}
                      </div>
                    </div>
                  </div>

                  {/* ── 5. DADOS INTERNACIONAIS (estrangeiros) ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">5. Dados Internacionais</h3>
                    <p className="text-xs text-muted-foreground mb-3">Opcional — preencha se o cliente for estrangeiro.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Nacionalidade" value={form.nacionalidade} onChange={v => handleChange('nacionalidade', v)} placeholder="Ex: Argentina" />
                      <Field label="Naturalidade" value={form.naturalidade} onChange={v => handleChange('naturalidade', v)} placeholder="Ex: Buenos Aires" />
                    </div>
                  </div>

                  {/* ── 6. ENDEREÇO ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">6. Endereço</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <Field label="Endereço" value={form.endereco} onChange={v => handleChange('endereco', v)} placeholder="Rua, número" />
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Complemento" value={form.complemento} onChange={v => handleChange('complemento', v)} placeholder="Apto, bloco..." />
                        <Field label="Bairro" value={form.bairro} onChange={v => handleChange('bairro', v)} placeholder="Bairro" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="CEP" value={form.cep} onChange={v => handleChange('cep', v)} placeholder="00000-000" />
                        <Field label="Cidade" value={form.cidade} onChange={v => handleChange('cidade', v)} placeholder="Cidade / País" />
                      </div>
                    </div>
                  </div>

                  {/* ── 7. INFORMAÇÕES EXTRAS ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">7. Informações Extras</h3>
                    <p className="text-xs text-muted-foreground mb-3">Opcional — país de origem, observações do cliente ou qualquer informação adicional relevante.</p>
                    <textarea
                      value={form.informacoesExtras ?? ''}
                      onChange={e => handleChange('informacoesExtras', e.target.value)}
                      placeholder="Ex: Cliente argentino, residente em Buenos Aires. Prefere contato por WhatsApp..."
                      rows={3}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                    />
                  </div>

                  {/* ── 8. DOCUMENTOS DO CLIENTE ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">8. Documentos do Cliente</h3>
                    <p className="text-xs text-muted-foreground mb-3">Opcional — anexe CNH, comprovante de residência e outros documentos.</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      className="hidden"
                      onChange={handleAddAttachment}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border border-dashed border-white/20 rounded-xl p-4 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <Paperclip className="w-4 h-4" />
                      Anexar documento (CNH, comprovante de residência e outros)
                    </button>
                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachments.map((file, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 text-sm truncate">
                              <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="truncate text-foreground">{file.name}</span>
                              <span className="text-muted-foreground text-xs shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveAttachment(i)} className="text-muted-foreground hover:text-red-400 ml-2 shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Erro */}
                  {formError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {formError}
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep('explain')}>
                      Voltar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={createReservation.isPending}
                    >
                      {createReservation.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Salvando...</>
                      ) : (
                        <>Confirmar Reserva <ChevronRight className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ETAPA 3: SUCESSO ─────────────────────────────────── */}
            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Reserva Registrada!</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  A ficha de <strong className="text-foreground">{form.nomeCompleto}</strong> para a unidade <strong className="text-primary">{unit.cota}</strong> foi salva com sucesso.
                </p>

                {/* Status do Drive */}
                {attachments.length > 0 && (
                  <div className={`text-xs rounded-xl px-4 py-3 mb-3 flex items-center gap-2 ${
                    driveUploadStatus === 'uploading' ? 'bg-blue-500/10 text-blue-400' :
                    driveUploadStatus === 'done' ? 'bg-emerald-100 text-emerald-700' :
                    driveUploadStatus === 'error' ? 'bg-amber-100 text-amber-700' : ''
                  }`}>
                    {driveUploadStatus === 'uploading' && <><Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> Enviando documentos para o Drive... ({driveUploadCount}/{attachments.length})</>}
                    {driveUploadStatus === 'done' && <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {attachments.length} documento(s) salvo(s) no Google Drive do gestor.</>}
                    {driveUploadStatus === 'error' && <><AlertCircle className="w-3.5 h-3.5 shrink-0" /> Alguns documentos não foram enviados. Envie pelo WhatsApp manualmente.</>}
                  </div>
                )}

                <p className="text-muted-foreground text-xs mb-3">
                  {attachments.length > 0 && driveUploadStatus === 'done'
                    ? 'Ficha e documentos salvos no Drive. Avise o gestor:'
                    : 'Clique no botão verde para baixar a ficha e avisar o Gestor Comercial:'}
                </p>

                <div className="text-left bg-white/5 rounded-xl p-4 mb-4 space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">1</span>
                    <span className="text-foreground">Clique em <strong>"Baixar Word e Enviar via WhatsApp"</strong> — o arquivo Word será salvo automaticamente no seu dispositivo.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">2</span>
                    <span className="text-foreground">Após o download, o WhatsApp abre automaticamente com a mensagem pronta para o gestor.</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => handleDownloadDoc()}
                    disabled={isDownloading || !reservationId}
                    variant="outline"
                  >
                    {isDownloading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Gerando documento...</>
                    ) : wordDownloaded ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Word Baixado — Baixar Novamente</>
                    ) : (
                      <><Download className="w-4 h-4 mr-2" /> Baixar Ficha em Word (.docx)</>
                    )}
                  </Button>

                  <Button
                    className="w-full bg-[#25d366] hover:bg-[#1ebe5d] text-white"
                    onClick={handleWhatsApp}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Baixando Word...</>
                    ) : (
                      <><MessageCircle className="w-4 h-4 mr-2" />
                      {wordDownloaded ? 'Enviar para o Gestor Comercial via WhatsApp' : 'Baixar Word e Enviar via WhatsApp'}</>
                    )}
                  </Button>
                  {!wordDownloaded && (
                    <p className="text-xs text-amber-700 text-center">
                      ⚠ O Word será baixado automaticamente antes de abrir o WhatsApp.
                    </p>
                  )}

                  <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleClose}>
                    Fechar
                  </Button>
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Componentes auxiliares de formulário ──────────────────────────────────────

// Lista de países com DDI para o seletor de telefone
const PAISES_DDI = [
  { code: '+55', label: '🇧🇷 Brasil (+55)', flag: '🇧🇷' },
  { code: '+54', label: '🇦🇷 Argentina (+54)', flag: '🇦🇷' },
  { code: '+56', label: '🇨🇱 Chile (+56)', flag: '🇨🇱' },
  { code: '+598', label: '🇺🇾 Uruguai (+598)', flag: '🇺🇾' },
  { code: '+595', label: '🇵🇾 Paraguai (+595)', flag: '🇵🇾' },
  { code: '+591', label: '🇧🇴 Bolívia (+591)', flag: '🇧🇴' },
  { code: '+51', label: '🇵🇪 Peru (+51)', flag: '🇵🇪' },
  { code: '+57', label: '🇨🇴 Colômbia (+57)', flag: '🇨🇴' },
  { code: '+58', label: '🇻🇪 Venezuela (+58)', flag: '🇻🇪' },
  { code: '+34', label: '🇪🇸 Espanha (+34)', flag: '🇪🇸' },
  { code: '+351', label: '🇵🇹 Portugal (+351)', flag: '🇵🇹' },
  { code: '+39', label: '🇮🇹 Itália (+39)', flag: '🇮🇹' },
  { code: '+49', label: '🇩🇪 Alemanha (+49)', flag: '🇩🇪' },
  { code: '+33', label: '🇫🇷 França (+33)', flag: '🇫🇷' },
  { code: '+44', label: '🇬🇧 Reino Unido (+44)', flag: '🇬🇧' },
  { code: '+1', label: '🇺🇸 EUA/Canadá (+1)', flag: '🇺🇸' },
  { code: '+972', label: '🇮🇱 Israel (+972)', flag: '🇮🇱' },
  { code: '+971', label: '🇦🇪 Emirados (+971)', flag: '🇦🇪' },
  { code: '+81', label: '🇯🇵 Japão (+81)', flag: '🇯🇵' },
  { code: '+86', label: '🇨🇳 China (+86)', flag: '🇨🇳' },
];

function PhoneField({
  label, ddi, onDdiChange, value, onChange, placeholder,
}: {
  label: string;
  ddi: string;
  onDdiChange: (v: string) => void;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  // Remove tudo que não for dígito ao digitar
  const handleNumberChange = (raw: string) => {
    const clean = raw.replace(/[^0-9]/g, '');
    onChange(clean);
  };
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <div className="flex gap-2">
        <select
          value={ddi}
          onChange={e => onDdiChange(e.target.value)}
          className="px-2 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm shrink-0 w-36"
        >
          {PAISES_DDI.map(p => (
            <option key={p.code} value={p.code}>{p.label}</option>
          ))}
        </select>
        <input
          type="tel"
          value={value}
          onChange={e => handleNumberChange(e.target.value)}
          placeholder={placeholder ?? '99999-9999'}
          className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
        />
      </div>
      {value && (
        <p className="text-xs text-muted-foreground/60 mt-1">Número completo: {ddi}{value}</p>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
      >
        <option value="">Selecionar...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
