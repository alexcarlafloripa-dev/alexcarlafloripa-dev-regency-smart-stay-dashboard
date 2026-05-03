import { ArrowLeft, Building2, DollarSign, TrendingUp, Ruler } from "lucide-react";
import { Link } from "wouter";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { useMemo } from "react";

export default function Analytics() {
  const { units, loading } = useGoogleSheets();

  // Calcular KPIs
  const kpis = useMemo(() => {
    if (!units.length) return null;

    const disponiveisCount = units.filter(u => u.status === "disponivel").length;
    const precos = units.map(u => u.valorTotal).filter(p => p > 0);
    const menorPreco = Math.min(...precos);
    const maiorPreco = Math.max(...precos);
    const areas = units.map(u => u.areaTotal).filter(a => a > 0);
    const areaMedia = areas.reduce((a, b) => a + b, 0) / areas.length;

    return {
      disponiveisCount,
      menorPreco,
      maiorPreco,
      areaMedia
    };
  }, [units]);

  // Calcular dados para gráficos
  const chartData = useMemo(() => {
    if (!units.length) return null;

    // Status das unidades
    const statusCount = {
      disponivel: units.filter(u => u.status === "disponivel").length,
      reservado: units.filter(u => u.status === "reservado").length,
      vendido: 0
    };

    // Unidades por andar
    const porAndar: Record<string, number> = {};
    units.forEach(u => {
      const andar = u.andar;
      porAndar[andar] = (porAndar[andar] || 0) + 1;
    });

    // Unidades por tipologia
    const porTipologia: Record<string, number> = {};
    units.forEach(u => {
      const tipo = u.tipologia;
      porTipologia[tipo] = (porTipologia[tipo] || 0) + 1;
    });



    // Faixa de preço (do menor para o maior)
    const faixaPreco = {
      ate400k: units.filter(u => u.valorTotal > 0 && u.valorTotal <= 400000).length,
      de400a600k: units.filter(u => u.valorTotal > 400000 && u.valorTotal <= 600000).length,
      acima600k: units.filter(u => u.valorTotal > 600000).length
    };

    return {
      statusCount,
      porAndar,
      porTipologia,
      faixaPreco
    };
  }, [units]);

  if (loading || !kpis || !chartData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados analíticos...</p>
        </div>
      </div>
    );
  }

  const totalUnidades = chartData.statusCount.disponivel + chartData.statusCount.reservado + chartData.statusCount.vendido;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Regency Square Smart Stay</h1>
                  <p className="text-sm text-muted-foreground">Visão Analítica</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Cards
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* KPI 1: Unidades Disponíveis */}
          <div className="bg-white rounded-2xl p-6 border-2 border-[#7c4a1e]/20 shadow-sm hover:border-[#7c4a1e]/40 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-[#7c4a1e]/10 rounded-xl">
                <Building2 className="w-6 h-6 text-[#7c4a1e]" />
              </div>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2 text-[#7c4a1e]">{kpis.disponiveisCount}</p>
              <p className="text-lg font-medium mb-1 text-gray-800">Unidades Disponíveis</p>
              <p className="text-sm text-gray-500">Total em Oferta</p>
            </div>
          </div>

          {/* KPI 2: Menor Preço */}
          <div className="bg-white rounded-2xl p-6 border-2 border-[#7c4a1e]/20 shadow-sm hover:border-[#7c4a1e]/40 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-[#7c4a1e]/10 rounded-xl">
                <DollarSign className="w-6 h-6 text-[#7c4a1e]" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold mb-2 text-[#7c4a1e]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.menorPreco)}
              </p>
              <p className="text-lg font-medium mb-1 text-gray-800">Menor Preço</p>
              <p className="text-sm text-gray-500">Valor Mínimo</p>
            </div>
          </div>

          {/* KPI 3: Maior Preço */}
          <div className="bg-white rounded-2xl p-6 border-2 border-[#7c4a1e]/20 shadow-sm hover:border-[#7c4a1e]/40 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-[#7c4a1e]/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-[#7c4a1e]" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold mb-2 text-[#7c4a1e]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.maiorPreco)}
              </p>
              <p className="text-lg font-medium mb-1 text-gray-800">Maior Preço</p>
              <p className="text-sm text-gray-500">Valor Máximo</p>
            </div>
          </div>

          {/* KPI 4: Área Média */}
          <div className="bg-white rounded-2xl p-6 border-2 border-[#7c4a1e]/20 shadow-sm hover:border-[#7c4a1e]/40 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-[#7c4a1e]/10 rounded-xl">
                <Ruler className="w-6 h-6 text-[#7c4a1e]" />
              </div>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2 text-[#7c4a1e]">{kpis.areaMedia.toFixed(2)} m²</p>
              <p className="text-lg font-medium mb-1 text-gray-800">Área Média</p>
              <p className="text-sm text-gray-500">Tamanho Médio</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Coluna 1: Status e Unidades por Andar */}
          <div className="space-y-6">
            {/* Status das Unidades - Donut Chart */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold mb-6">Status das Unidades</h3>
              <div className="relative">
                <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto">
                  {/* Donut chart será implementado aqui */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--muted))" strokeWidth="30" />
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth="30"
                    strokeDasharray={`${(chartData.statusCount.disponivel / totalUnidades) * 502} 502`}
                    transform="rotate(-90 100 100)"
                  />
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="hsl(48, 96%, 53%)" 
                    strokeWidth="30"
                    strokeDasharray={`${(chartData.statusCount.reservado / totalUnidades) * 502} 502`}
                    strokeDashoffset={`-${(chartData.statusCount.disponivel / totalUnidades) * 502}`}
                    transform="rotate(-90 100 100)"
                  />
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="hsl(0, 84%, 60%)" 
                    strokeWidth="30"
                    strokeDasharray={`${(chartData.statusCount.vendido / totalUnidades) * 502} 502`}
                    strokeDashoffset={`-${((chartData.statusCount.disponivel + chartData.statusCount.reservado) / totalUnidades) * 502}`}
                    transform="rotate(-90 100 100)"
                  />
                  <text x="100" y="100" textAnchor="middle" dy="0.3em" className="text-4xl font-bold fill-foreground">{totalUnidades}</text>
                  <text x="100" y="120" textAnchor="middle" className="text-sm fill-muted-foreground">Unidades</text>
                </svg>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span className="text-sm">Disponíveis</span>
                    </div>
                    <span className="font-bold">{chartData.statusCount.disponivel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Reservados</span>
                    </div>
                    <span className="font-bold">{chartData.statusCount.reservado}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Vendidos</span>
                    </div>
                    <span className="font-bold">{chartData.statusCount.vendido}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Unidades por Andar - Bar Chart */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold mb-6">Unidades por Andar</h3>
              <div className="space-y-4">
                {Object.entries(chartData.porAndar).map(([andar, count]) => {
                  const maxCount = Math.max(...Object.values(chartData.porAndar));
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={andar}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{andar}</span>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                      <div className="h-8 bg-muted rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Coluna 2: Tipologia e Evolução */}
          <div className="space-y-6">
            {/* Unidades por Tipologia - Bar Chart */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold mb-6">Unidades por Tipologia</h3>
              <div className="flex items-end justify-around gap-4 h-64">
                {Object.entries(chartData.porTipologia).map(([tipo, count]) => {
                  const maxCount = Math.max(...Object.values(chartData.porTipologia));
                  const heightPercentage = (count / maxCount) * 100;
                  return (
                    <div key={tipo} className="flex flex-col items-center gap-2 flex-1">
                      <div className="relative w-full" style={{ height: '200px' }}>
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary/80 rounded-t-lg transition-all duration-500 flex items-end justify-center pb-2"
                          style={{ height: `${heightPercentage}%` }}
                        >
                          <span className="text-white font-bold">{count}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-center">{tipo}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evolução de Vendas - Placeholder */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold mb-6">Evolução de Vendas</h3>
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Gráfico de evolução será implementado com dados históricos</p>
              </div>
            </div>
          </div>

          {/* Coluna 3: Orientação e Faixa de Preço */}
          <div className="space-y-6">
            {/* Faixa de Preço (do menor para o maior) */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold mb-6">Faixa de Preço</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Até R$ 400k</span>
                      <span className="text-sm font-bold">{((chartData.faixaPreco.ate400k / totalUnidades) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${(chartData.faixaPreco.ate400k / totalUnidades) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">R$ 400k-600k</span>
                      <span className="text-sm font-bold">{((chartData.faixaPreco.de400a600k / totalUnidades) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${(chartData.faixaPreco.de400a600k / totalUnidades) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Acima R$ 600k</span>
                      <span className="text-sm font-bold">{((chartData.faixaPreco.acima600k / totalUnidades) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${(chartData.faixaPreco.acima600k / totalUnidades) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap de Disponibilidade */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-bold mb-6">Mapa de Disponibilidade por Andar</h3>
          <div className="space-y-3">
            {Object.entries(chartData.porAndar).reverse().map(([andar, count]) => {
              const unidadesDoAndar = units.filter(u => u.andar === andar);
              return (
                <div key={andar} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{andar}</div>
                  <div className="flex-1 flex gap-1 flex-wrap">
                    {unidadesDoAndar.map(unidade => {
                      const color = 
                        unidade.status === "disponivel" ? "bg-green-600" :
                        unidade.status === "reservado" ? "bg-yellow-500" :
                        "bg-red-500";
                      return (
                        <div 
                          key={unidade.cota}
                          className={`w-8 h-8 ${color} rounded transition-all hover:scale-110 cursor-pointer`}
                          title={`${unidade.cota} - ${unidade.status}`}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm">Disponível (Quantidade)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Reservado (Quantidade)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Vendido (Quantidade)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
