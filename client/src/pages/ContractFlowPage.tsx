/**
 * Página de acesso integrado ao ContractFlow
 * Exibe o sistema de contratos embutido via iframe dentro do dashboard do Regency
 */

import { useState } from 'react';
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const CONTRACT_FLOW_URL = 'https://flow.regencysmartstay.com.br';

export default function ContractFlowPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header compacto */}
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-foreground">Sistema de Contratos</h1>
          <p className="text-xs text-muted-foreground">Regency Square Smart Stay</p>
        </div>
        <a
          href={CONTRACT_FLOW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Abrir em nova aba</span>
        </a>
      </header>

      {/* Área do iframe */}
      <div className="flex-1 relative">
        {/* Loading state */}
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Carregando sistema de contratos...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center glass-card rounded-xl p-8 max-w-sm mx-4">
              <p className="text-red-400 mb-4 text-sm">Não foi possível carregar o sistema de contratos.</p>
              <a
                href={CONTRACT_FLOW_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir em nova aba
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* iframe */}
        <iframe
          src={CONTRACT_FLOW_URL}
          className="w-full h-full min-h-[calc(100vh-57px)] border-0"
          title="Sistema de Contratos - ContractFlow"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          allow="same-origin"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
}
