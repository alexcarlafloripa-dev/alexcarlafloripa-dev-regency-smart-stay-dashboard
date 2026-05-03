/**
 * Design: Interface Tecnológica Imersiva - Glassmorphism Dark Theme
 * Página principal do dashboard com sidebar, filtros e grid de unidades
 * Integração em tempo real com Google Sheets
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, X, Building2, TrendingUp, MapPin, RefreshCw, Loader2, Car, DollarSign, FileText, UserCircle, Presentation, ExternalLink, Users, BookOpen, Moon, Sun } from 'lucide-react';
import { Link } from 'wouter';
import { Unit, UnitType, formatCurrency } from '@/data/units';
import { useGoogleSheets, floors } from '@/hooks/useGoogleSheets';
import { Sidebar } from '@/components/Sidebar';
import { FilterBar } from '@/components/FilterBar';
import { UnitCard } from '@/components/UnitCard';
import { UnitDetailModal } from '@/components/UnitDetailModal';
import { Button } from '@/components/ui/button';
import { FloorMap } from '@/components/FloorMap';
import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [showIntro, setShowIntro] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar starts hidden
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<UnitType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Hide intro after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data from Google Sheets
  const { units, loading, error, lastUpdated, refresh } = useGoogleSheets();

  // Filter units
  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      // Special filter: Lojas
      if (selectedFloor === 'Lojas') {
        if (!unit.tipologia.includes('LOJA')) return false;
      }
      // Special filter: Duplex
      else if (selectedFloor === 'Duplex') {
        if (unit.tipologia !== 'DUPLEX') return false;
      }
      // Floor filter
      else if (selectedFloor && unit.andar !== selectedFloor) {
        return false;
      }
      
      // Type filter
      if (selectedType) {
        if (selectedType === 'LOJA') {
          if (!unit.tipologia.includes('LOJA')) return false;
        } else if (unit.tipologia !== selectedType) {
          return false;
        }
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          unit.cota.toLowerCase().includes(query) ||
          unit.andar.toLowerCase().includes(query) ||
          unit.tipologia.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [units, selectedFloor, selectedType, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const available = filteredUnits.filter(u => u.status === 'disponivel');
    const minValue = available.length > 0 ? Math.min(...available.map(u => u.valorTotal)) : 0;
    return {
      total: filteredUnits.length,
      available: available.length,
      minValue,
    };
  }, [filteredUnits]);

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background bg-mesh relative">
      {/* Intro Animation */}
      {showIntro && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#fbfaf7] to-[#f1eadf] dark:from-[#0d0c0a] dark:via-[#18130f] dark:to-[#3a2415]" />
          
          {/* Animated Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#caa35f]/50 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, -100],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Central Logo */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.div
              className="relative"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-[#caa35f]/20 blur-3xl" />
              
              {/* Logo Image */}
              <motion.img
                src="/images/regency-logo.png"
                alt="Regency Square Smart Stay"
                className="w-56 h-56 object-contain drop-shadow-2xl"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            className="absolute bottom-32 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-[#1d1711] dark:text-[#f5efe4] mb-2">Bem-vindo ao Regency Square Smart Stay</h2>
            <p className="text-[#9a7436] dark:text-[#caa35f]">No coração de Florianópolis</p>
          </motion.div>

          {/* Progress Dots */}
          <div className="absolute bottom-16 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#caa35f]"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Main Content - Hidden during intro */}
      <div className={showIntro ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
      {/* Sidebar */}
      <Sidebar
        selectedFloor={selectedFloor}
        onSelectFloor={setSelectedFloor}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        units={units}
        floors={floors}
      />

      {/* Main content */}
      <div className={sidebarOpen ? 'lg:ml-[280px]' : ''}>
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#0d0c0a]/95 backdrop-blur-xl border-b border-[#caa35f]/25 shadow-sm">
          <div className="px-4 lg:px-8 py-2.5">
            <div className="flex items-center justify-between gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className=""
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar unidade..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-lg bg-[#fbfaf7] dark:bg-white/10 border border-[#caa35f]/25 text-[#1d1711] dark:text-[#f5efe4] placeholder:text-[#756653] dark:placeholder:text-[#c9b99f] focus:outline-none focus:ring-1 focus:ring-[#caa35f]/50 focus:border-[#caa35f]/50 transition-all text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Refresh button and location */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refresh}
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground"
                  title="Atualizar dados"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Link href="/apresentacao">
                  <Button variant="outline" size="sm" className="h-7 bg-transparent border-[#caa35f]/40 text-[#6f5227] dark:text-[#ead9bd] hover:bg-[#caa35f]/10 flex items-center gap-1 px-2 text-xs">
                    <Presentation className="w-3 h-3 shrink-0" />
                    <span className="hidden sm:inline">Apresentação</span>
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" size="sm" className="h-7 bg-transparent border-[#caa35f]/40 text-[#6f5227] dark:text-[#ead9bd] hover:bg-[#caa35f]/10 flex items-center gap-1 px-2 text-xs">
                    <TrendingUp className="w-3 h-3 shrink-0" />
                    <span className="hidden sm:inline">Analítica</span>
                  </Button>
                </Link>
                <a href="https://www.regencysmartstay.com.br/planta-3d" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-7 bg-transparent border-[#caa35f]/40 text-[#6f5227] dark:text-[#ead9bd] hover:bg-[#caa35f]/10 flex items-center gap-1 px-2 text-xs">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="hidden sm:inline">Maquete 3D</span>
                  </Button>
                </a>
                <a href="https://www.regencysmartstay.com.br" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-7 bg-transparent border-[#caa35f]/40 text-[#6f5227] dark:text-[#ead9bd] hover:bg-[#caa35f]/10 flex items-center gap-1 px-2 text-xs">
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="hidden sm:inline">Site</span>
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-8 w-8 border-[#caa35f]/40 text-[#6f5227] dark:text-[#ead9bd] hover:bg-[#caa35f]/10"
                  title={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <div className="hidden lg:flex items-center gap-1 text-xs text-[#6f5227] dark:text-[#caa35f]/80">
                  <MapPin className="w-3 h-3" />
                  <span>Florianópolis, SC</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Atalhos Rápidos — Mobile: ícones circulares / Desktop: cards compactos */}
        <section className="px-3 lg:px-8 py-3 border-b border-[#caa35f]/15 bg-[#f7f2ea] dark:bg-[#15110e]">
          {/* Mobile: grade 4x2 de ícones circulares estilo app */}
          <div className="grid grid-cols-4 gap-y-4 gap-x-1 md:hidden py-1">
            {[
              { href: 'https://flow.regencysmartstay.com.br', ext: true, icon: <FileText className="w-5 h-5" />, label: 'Dashboard', color: 'text-blue-700', bg: 'bg-gradient-to-br from-blue-50 to-blue-100', shadow: 'shadow-blue-200/60' },
              { href: 'https://flow.regencysmartstay.com.br', ext: true, icon: <UserCircle className="w-5 h-5" />, label: 'Corretor', color: 'text-emerald-700', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', shadow: 'shadow-emerald-200/60' },
              { href: 'https://www.regencysmartstay.com.br', ext: true, icon: <ExternalLink className="w-5 h-5" />, label: 'Site', color: 'text-[#caa35f]', bg: 'bg-gradient-to-br from-amber-50 to-orange-100', shadow: 'shadow-orange-200/60' },
              { href: 'https://www.regencysmartstay.com.br/planta-3d', ext: true, icon: <Building2 className="w-5 h-5" />, label: 'Maquete 3D', color: 'text-purple-700', bg: 'bg-gradient-to-br from-purple-50 to-purple-100', shadow: 'shadow-purple-200/60' },
              { href: '/planilha', ext: false, icon: <FileText className="w-5 h-5" />, label: 'Planilha', color: 'text-green-700', bg: 'bg-gradient-to-br from-green-50 to-green-100', shadow: 'shadow-green-200/60' },
              { href: '/apresentacao', ext: false, icon: <Presentation className="w-5 h-5" />, label: 'Apresentação Cliente', color: 'text-amber-700', bg: 'bg-gradient-to-br from-amber-50 to-amber-100', shadow: 'shadow-amber-200/60' },
              { href: 'https://drive.google.com/drive/folders/1d6wK9cWS0L6ndCoYbxpA5nAam-O3DGB2', ext: true, icon: <BookOpen className="w-5 h-5" />, label: 'Book', color: 'text-rose-700', bg: 'bg-gradient-to-br from-rose-50 to-rose-100', shadow: 'shadow-rose-200/60' },
              { href: 'https://drive.google.com/drive/folders/1wAciV4qyy8dSFgKuw6gzgyZbxCw2zCrn', ext: true, icon: <FileText className="w-5 h-5" />, label: 'Material', color: 'text-cyan-700', bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100', shadow: 'shadow-cyan-200/60' },
            ].map((item, i) => {
              const inner = (
                <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                  <div className={`w-13 h-13 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shadow-md ${item.shadow} group-active:scale-95 transition-all duration-150 border border-white/80`}>
                    {item.icon}
                  </div>
                  <span className={`text-[10px] font-semibold text-gray-600 text-center leading-tight max-w-[64px]`}>{item.label}</span>
                </div>
              );
              return item.ext ? (
                <a key={i} href={item.href} target="_blank" rel="noopener noreferrer">{inner}</a>
              ) : (
                <Link key={i} href={item.href}>{inner}</Link>
              );
            })}
          </div>

          {/* Desktop: cards compactos em linha */}
          <div className="hidden md:flex flex-wrap gap-1.5">
            <a href="https://flow.regencysmartstay.com.br" target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1f1b16] border border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group cursor-pointer shadow-sm">
                <div className="p-1 rounded-md bg-blue-100 group-hover:bg-blue-200 transition-colors shrink-0">
                  <FileText className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-700 text-[11px] whitespace-nowrap">Dashboard Adm.</p>
                  <p className="text-[9px] text-[#caa35f]/70 whitespace-nowrap">Gestão de contratos</p>
                </div>
              </div>
            </a>
            <a href="https://flow.regencysmartstay.com.br" target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1f1b16] border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group cursor-pointer shadow-sm">
                <div className="p-1 rounded-md bg-emerald-100 group-hover:bg-emerald-200 transition-colors shrink-0">
                  <UserCircle className="w-3 h-3 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-700 text-[11px] whitespace-nowrap">Acesso Corretor</p>
                  <p className="text-[9px] text-[#caa35f]/70 whitespace-nowrap">Suas reservas</p>
                </div>
              </div>
            </a>
            <a href="https://www.regencysmartstay.com.br" target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1f1b16] border border-[#caa35f]/25 hover:border-[#caa35f]/50 hover:bg-[#caa35f]/5 transition-all group cursor-pointer shadow-sm">
                <div className="p-1 rounded-md bg-[#caa35f]/10 group-hover:bg-[#caa35f]/20 transition-colors shrink-0">
                  <ExternalLink className="w-3 h-3 text-[#caa35f]" />
                </div>
                <div>
                  <p className="font-semibold text-[#caa35f] text-[11px] whitespace-nowrap">Ver Site</p>
                  <p className="text-[9px] text-[#caa35f]/70 whitespace-nowrap">regencysmartstay.com.br</p>
                </div>
              </div>
            </a>
            <a href="https://www.regencysmartstay.com.br/planta-3d" target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1f1b16] border border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all group cursor-pointer shadow-sm">
                <div className="p-1 rounded-md bg-purple-100 group-hover:bg-purple-200 transition-colors shrink-0">
                  <Building2 className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-purple-700 text-[11px] whitespace-nowrap">Maquete 3D</p>
                  <p className="text-[9px] text-[#caa35f]/70 whitespace-nowrap">Planta interativa</p>
                </div>
              </div>
            </a>
            <Link href="/planilha">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1f1b16] border border-green-200 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all group cursor-pointer shadow-sm">
                <div className="p-1 rounded-md bg-green-100 group-hover:bg-green-200 transition-colors shrink-0">
                  <FileText className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-700 text-[11px] whitespace-nowrap">Planilha</p>
                  <p className="text-[9px] text-[#caa35f]/70 whitespace-nowrap">Dados em tempo real</p>
                </div>
              </div>
            </Link>
            <Link href="/apresentacao">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1f1b16] border border-amber-300 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all group cursor-pointer shadow-sm">
                <div className="p-1 rounded-md bg-amber-100 group-hover:bg-amber-200 transition-colors shrink-0">
                  <Users className="w-3 h-3 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-700 text-[11px] whitespace-nowrap">Apres. Cliente</p>
                  <p className="text-[9px] text-[#caa35f]/70 whitespace-nowrap">6 unidades lado a lado</p>
                </div>
              </div>
            </Link>
            <a href="https://drive.google.com/drive/folders/1d6wK9cWS0L6ndCoYbxpA5nAam-O3DGB2" target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1f1b16] border border-rose-300 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all group cursor-pointer shadow-sm">
                <div className="p-1 rounded-md bg-rose-100 group-hover:bg-rose-200 transition-colors shrink-0">
                  <BookOpen className="w-3 h-3 text-rose-600" />
                </div>
                <div>
                  <p className="font-semibold text-rose-700 text-[11px] whitespace-nowrap">Book</p>
                  <p className="text-[9px] text-[#caa35f]/70 whitespace-nowrap">PDFs do empreendimento</p>
                </div>
              </div>
            </a>
            <a href="https://drive.google.com/drive/folders/1wAciV4qyy8dSFgKuw6gzgyZbxCw2zCrn" target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1f1b16] border border-cyan-300 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition-all group cursor-pointer shadow-sm">
                <div className="p-1 rounded-md bg-cyan-100 group-hover:bg-cyan-200 transition-colors shrink-0">
                  <FileText className="w-3 h-3 text-cyan-600" />
                </div>
                <div>
                  <p className="font-semibold text-cyan-700 text-[11px] whitespace-nowrap">Material Completo</p>
                  <p className="text-[9px] text-[#caa35f]/70 whitespace-nowrap">Todos os materiais</p>
                </div>
              </div>
            </a>
          </div>
        </section>
        {/* Loading state */}
        {loading && units.length === 0 && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando unidades...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-4 lg:px-8 py-8">
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={refresh}>Tentar novamente</Button>
            </div>
          </div>
        )}

        {/* Main content when loaded */}
        {!loading || units.length > 0 ? (
          <>
            {/* Hero section */}
            <section className="relative px-4 lg:px-8 py-14 overflow-hidden">
              {/* Background image */}
              <div 
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage: 'url(/images/hero-bg.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/76 to-white/24 dark:from-[#0d0c0a]/95 dark:via-[#0d0c0a]/70 dark:to-[#0d0c0a]/20" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
              
              <div className="relative max-w-5xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <img
                    src="/images/regency-wordmark.png"
                    alt="Regency Square Smart Stay"
                    className="h-28 w-auto max-w-full object-contain mb-4 drop-shadow-2xl"
                  />
                  <p className="text-xl text-[#3a2a1d] dark:text-[#ead9bd] mb-3 max-w-2xl">
                    Entre o mar e a tecnologia, um Smart Stay no Centro de Florianópolis, a 350 metros da futura Marina da Beira-Mar Norte.
                  </p>
                  <p className="text-sm text-[#756653] dark:text-[#c9b99f] mb-8 max-w-2xl">
                    Localização com vocação para hospedagem, moradia e locação de curta e média duração, próxima a hospitais, clínicas, comércio, serviços e vias estratégicas da capital.
                  </p>
                </motion.div>

                {/* Stats cards */}
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">Unidades</span>
                    </div>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">Disponíveis</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">{stats.available}</p>
                  </div>
                  <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <DollarSign className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-sm text-muted-foreground">A partir de</span>
                    </div>
                    <p className="text-2xl font-bold money text-gradient">
                      {formatCurrency(stats.minValue)}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {[
                    {
                      title: 'Centro de Florianópolis',
                      text: 'O coração da capital, onde história, negócios, serviços e mobilidade se encontram.',
                    },
                    {
                      title: '350 m da futura Marina',
                      text: 'Um dos principais vetores de valorização do entorno da Beira-Mar Norte.',
                    },
                    {
                      title: 'Modelo de investimento',
                      text: 'Construção a preço de custo via SPE, com foco em liquidez e renda recorrente.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="glass-card rounded-xl p-5 border-[#caa35f]/25">
                      <p className="text-sm font-semibold text-[#caa35f] mb-2">{item.title}</p>
                      <p className="text-sm leading-relaxed text-[#5d503f] dark:text-[#d8cab3]">{item.text}</p>
                    </div>
                  ))}
                </motion.div>

                {/* Floor Availability Map */}
                <div className="mt-6">
                  <FloorMap onUnitClick={handleUnitClick} units={units} />
                </div>
              </div>
            </section>

            {/* Filters */}
            <section className="px-4 lg:px-8 py-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    {selectedFloor || 'Todas as Unidades'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredUnits.length} {filteredUnits.length === 1 ? 'unidade encontrada' : 'unidades encontradas'}
                    {lastUpdated && (
                      <span className="ml-2 text-xs">
                        • Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </p>
                </div>
                <FilterBar selectedType={selectedType} onSelectType={setSelectedType} />
              </div>
            </section>

            {/* Units grid */}
            <section className="px-4 lg:px-8 py-8">
              <AnimatePresence mode="popLayout">
                {filteredUnits.length > 0 ? (
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                  >
                    {filteredUnits.map((unit) => (
                      <UnitCard
                        key={unit.id}
                        unit={unit}
                        onClick={() => handleUnitClick(unit)}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <div className="glass-card inline-block rounded-2xl p-8">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhuma unidade encontrada</h3>
                      <p className="text-muted-foreground">
                        Tente ajustar os filtros ou buscar por outro termo.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Footer */}
            <footer className="px-4 lg:px-8 py-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <p>© 2025 Regency Square Smart Stay. Todos os direitos reservados.</p>
                <p>⚠️ Valores atualizados conforme índice CUB/SC</p>
              </div>
            </footer>
          </>
        ) : null}
      </div>

      {/* Unit detail modal */}
      <UnitDetailModal
        unit={selectedUnit}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      </div>
    </div>
  );
}
