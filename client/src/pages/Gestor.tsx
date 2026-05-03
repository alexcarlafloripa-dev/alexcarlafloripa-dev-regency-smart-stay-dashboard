/**
 * Painel do Gestor — Regency Square Smart Stay
 * Página exclusiva para Alex (admin) com analytics de uso do dashboard.
 * Acesso restrito: apenas usuários com role "admin".
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Eye, GitCompare, MessageCircle, Copy, BarChart2, Users, Calendar, RefreshCw, ClipboardList, Download, CheckCircle2, FileSignature, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const STATUS_CONFIG = {
  reservado: { label: 'Reservado', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', icon: <ClipboardList className="w-3 h-3" /> },
  assinado: { label: 'Assinado', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', icon: <FileSignature className="w-3 h-3" /> },
  vendido: { label: 'Vendido', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', icon: <CheckCircle2 className="w-3 h-3" /> },
} as const;

const EVENT_LABELS: Record<string, string> = {
  unit_view: 'Unidades Visualizadas',
  compare_add: 'Adicionadas ao Comparador',
  compare_view: 'Comparativos Abertos',
  whatsapp_click: 'Cliques no WhatsApp',
  copy_click: 'Mensagens Copiadas',
  simulator_use: 'Simulador Usado',
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  unit_view: <Eye className="w-5 h-5" />,
  compare_add: <GitCompare className="w-5 h-5" />,
  compare_view: <BarChart2 className="w-5 h-5" />,
  whatsapp_click: <MessageCircle className="w-5 h-5" />,
  copy_click: <Copy className="w-5 h-5" />,
  simulator_use: <TrendingUp className="w-5 h-5" />,
};

const EVENT_COLORS: Record<string, string> = {
  unit_view: '#C8762B',
  compare_add: '#f59e0b',
  compare_view: '#10b981',
  whatsapp_click: '#25d366',
  copy_click: '#3b82f6',
  simulator_use: '#8b5cf6',
};

const CURRENCY_COLORS = ['#C8762B', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
const CURRENCY_LABELS: Record<string, string> = {
  BRL: '🇧🇷 Real',
  USD: '🇺🇸 Dólar',
  EUR: '🇪🇺 Euro',
  ARS: '🇦🇷 Peso AR',
  CLP: '🇨🇱 Peso CL',
  UYU: '🇺🇾 Peso UY',
  PYG: '🇵🇾 Guarani',
  null: 'Não definida',
};

export default function Gestor() {
  const { user, loading: authLoading } = useAuth();
  const [days, setDays] = useState(30);

  const reservations = trpc.reservation.list.useQuery(undefined, { enabled: !!user && user.role === 'admin' });
  const generateDoc = trpc.reservation.generateDoc.useMutation();
  const updateStatus = trpc.reservation.updateStatus.useMutation({
    onSuccess: (data) => {
      reservations.refetch();
      toast.success(`Status atualizado para ${data.reservation.status}`);
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar status: ${err.message}`);
    },
  });
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const handleStatusChange = async (id: number, newStatus: 'reservado' | 'assinado' | 'vendido') => {
    setUpdatingStatusId(id);
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDownload = async (id: number, nomeCompleto: string, unitCota: string) => {
    setDownloadingId(id);
    try {
      const result = await generateDoc.mutateAsync({ id });
      const bytes = Uint8Array.from(atob(result.base64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar documento:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const { data, isLoading, refetch } = trpc.analytics.summary.useQuery(
    { days },
    { enabled: !!user && user.role === 'admin' }
  );

  // Aguarda autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Não autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center glass-card rounded-2xl p-10 max-w-sm mx-4">
          <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Esta área é exclusiva para o gestor comercial.</p>
          <Button onClick={() => window.location.href = getLoginUrl()}>
            Entrar com Manus
          </Button>
        </div>
      </div>
    );
  }

  // Não é admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center glass-card rounded-2xl p-10 max-w-sm mx-4">
          <h2 className="text-xl font-bold mb-2">Sem Permissão</h2>
          <p className="text-muted-foreground">Esta página é exclusiva para o gestor do empreendimento.</p>
        </div>
      </div>
    );
  }

  const totalEvents = data?.byType?.reduce((sum, t) => sum + Number(t.count), 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gradient">Painel do Gestor</h1>
            <p className="text-xs text-muted-foreground">Regency Square Smart Stay — Analytics de uso</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Seletor de período */}
            <div className="flex gap-1">
              {[7, 15, 30, 60, 90].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    days === d
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <a href="/corretores" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium border border-primary/30 rounded-lg px-3 py-1.5">
              👥 Corretores
            </a>
            <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Voltar ao Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="px-4 lg:px-8 py-8 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <RefreshCw className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          </div>
        ) : !data ? (
          <div className="text-center py-24 text-muted-foreground">
            Nenhum dado disponível ainda. Os eventos aparecerão conforme os corretores usarem o dashboard.
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Sessões únicas</span>
                </div>
                <p className="text-3xl font-bold">{data.totalSessions}</p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Total de eventos</span>
                </div>
                <p className="text-3xl font-bold">{totalEvents}</p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-muted-foreground">Unidades vistas</span>
                </div>
                <p className="text-3xl font-bold text-emerald-400">
                  {data.byType.find(t => t.type === 'unit_view')?.count ?? 0}
                </p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-[#25d366]" />
                  <span className="text-xs text-muted-foreground">Cliques WhatsApp</span>
                </div>
                <p className="text-3xl font-bold text-[#25d366]">
                  {data.byType.find(t => t.type === 'whatsapp_click')?.count ?? 0}
                </p>
              </div>
            </div>

            {/* Eventos por tipo + Moedas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Eventos por tipo */}
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-base font-semibold mb-4">Eventos por tipo</h2>
                {data.byType.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Sem dados ainda.</p>
                ) : (
                  <div className="space-y-3">
                    {data.byType.map(item => (
                      <div key={item.type} className="flex items-center gap-3">
                        <div
                          className="p-1.5 rounded-lg"
                          style={{ background: (EVENT_COLORS[item.type ?? ''] ?? '#888') + '22' }}
                        >
                          <span style={{ color: EVENT_COLORS[item.type ?? ''] ?? '#888' }}>
                            {EVENT_ICONS[item.type ?? ''] ?? <BarChart2 className="w-5 h-5" />}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{EVENT_LABELS[item.type ?? ''] ?? item.type}</span>
                            <span className="font-bold">{item.count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${totalEvents > 0 ? (Number(item.count) / totalEvents) * 100 : 0}%`,
                                background: EVENT_COLORS[item.type ?? ''] ?? '#888',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Distribuição de moedas */}
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-base font-semibold mb-4">Moedas usadas (origem dos leads)</h2>
                {data.byCurrency.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Sem dados ainda.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.byCurrency.map(c => ({
                          name: CURRENCY_LABELS[c.currency ?? 'null'] ?? c.currency ?? 'N/A',
                          value: Number(c.count),
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {data.byCurrency.map((_, i) => (
                          <Cell key={i} fill={CURRENCY_COLORS[i % CURRENCY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1a1410', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend
                        formatter={(value) => <span style={{ color: '#ccc', fontSize: 12 }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Atividade por dia */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Atividade diária (últimos {days} dias)
              </h2>
              {data.byDay.length === 0 ? (
                <p className="text-muted-foreground text-sm">Sem dados ainda.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.byDay.map(d => ({ dia: d.day?.slice(5) ?? '', eventos: Number(d.count) }))}>
                    <XAxis dataKey="dia" tick={{ fill: '#888', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1a1410', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="eventos" fill="#C8762B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top unidades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top visualizadas */}
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Unidades mais visualizadas
                </h2>
                {data.topUnits.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Sem dados ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {data.topUnits.slice(0, 8).map((u, i) => (
                      <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                        <div className="flex-1">
                          <span className="font-medium text-sm">Unidade {u.cota}</span>
                          {u.tipologia && <span className="text-xs text-muted-foreground ml-2">{u.tipologia}</span>}
                          {u.andar && <span className="text-xs text-muted-foreground ml-1">· {u.andar}</span>}
                        </div>
                        <span className="text-sm font-bold text-primary">{u.count}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top WhatsApp */}
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25d366]" />
                  Unidades com mais interesse (WhatsApp)
                </h2>
                {data.topWhatsapp.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Sem dados ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {data.topWhatsapp.map((u, i) => (
                      <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                        <div className="flex-1">
                          <span className="font-medium text-sm">Unidade {u.cota}</span>
                          {u.tipologia && <span className="text-xs text-muted-foreground ml-2">{u.tipologia}</span>}
                        </div>
                        <span className="text-sm font-bold text-[#25d366]">{u.count}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fichas de Reserva */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Fichas de Reserva Recebidas
                </h2>
                <Button variant="ghost" size="icon" onClick={() => reservations.refetch()} disabled={reservations.isLoading}>
                  <RefreshCw className={`w-4 h-4 ${reservations.isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {reservations.isLoading ? (
                <p className="text-muted-foreground text-sm">Carregando...</p>
              ) : !reservations.data || reservations.data.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma reserva recebida ainda. Quando um corretor preencher a ficha, ela aparecerá aqui.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-muted-foreground">
                        <th className="text-left py-2 pr-4">Cliente / E-mail</th>
                        <th className="text-left py-2 pr-4">Unidade</th>
                        <th className="text-left py-2 pr-4">Corretor</th>
                        <th className="text-left py-2 pr-4">Data</th>
                        <th className="text-left py-2 pr-3">Status</th>
                        <th className="text-left py-2">Word</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.data.map(r => {
                        const statusKey = (r.status ?? 'reservado') as keyof typeof STATUS_CONFIG;
                        const statusCfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.reservado;
                        return (
                          <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-2.5 pr-4">
                              <div className="font-medium text-sm">{r.nomeCompleto}</div>
                              <div className="text-xs text-muted-foreground">{r.email}</div>
                            </td>
                            <td className="py-2.5 pr-4">
                              <span className="text-primary font-semibold">{r.unitCota}</span>
                              {r.unitTipologia && <span className="text-xs text-muted-foreground ml-1">{r.unitTipologia}</span>}
                            </td>
                            <td className="py-2.5 pr-4 text-muted-foreground text-sm">{r.nomeCorretor ?? r.responsavelVenda ?? '—'}</td>
                            <td className="py-2.5 pr-4 text-muted-foreground text-xs">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString('pt-BR') : '—'}
                            </td>
                            <td className="py-2.5 pr-3">
                              {/* Seletor de status */}
                              <div className="relative">
                                <select
                                  value={statusKey}
                                  onChange={(e) => handleStatusChange(r.id, e.target.value as 'reservado' | 'assinado' | 'vendido')}
                                  disabled={updatingStatusId === r.id}
                                  className={`text-xs px-2 py-1 rounded-lg border font-medium cursor-pointer appearance-none pr-6 transition-all ${statusCfg.color} bg-transparent disabled:opacity-50`}
                                >
                                  <option value="reservado">Reservado</option>
                                  <option value="assinado">Assinado</option>
                                  <option value="vendido">Vendido</option>
                                </select>
                                {updatingStatusId === r.id && (
                                  <RefreshCw className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-muted-foreground" />
                                )}
                              </div>
                            </td>
                            <td className="py-2.5">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs bg-transparent border-white/20 hover:bg-white/10"
                                onClick={() => handleDownload(r.id, r.nomeCompleto, r.unitCota)}
                                disabled={downloadingId === r.id}
                              >
                                {downloadingId === r.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <><Download className="w-3 h-3 mr-1" /> Word</>
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Rodapé */}
            <p className="text-center text-xs text-muted-foreground pb-8">
              Dados dos últimos {days} dias · Atualizado em tempo real · Apenas visível para o gestor
            </p>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}
