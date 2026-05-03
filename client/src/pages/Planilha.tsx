/**
 * Página Planilha — Regency Square Smart Stay
 * Exibe a planilha do Google Sheets em tela cheia (espelho, somente leitura)
 * URL: /planilha
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ExternalLink, ZoomIn, ZoomOut, Info, FileDown, FileSpreadsheet } from 'lucide-react';

// URL publicada na web (Arquivo > Publicar na web) — sem necessidade de login
const EMBED_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSo7o9fCxXqHqySHstVw-hw8ePk9zQeJfFzfvoYj-W2dUJTfbg9Yg8JdAs8_tGZQdTfKF6FO1aTNf3C/pubhtml?widget=true&headers=false';
const SHEET_LINK = 'https://docs.google.com/spreadsheets/d/1VTYTl1p3KQv0wX5xLYctBX0TJ9Axft81pc4bf7LlfH4/edit?usp=sharing';
const SHEET_ID = '1VTYTl1p3KQv0wX5xLYctBX0TJ9Axft81pc4bf7LlfH4';
const PDF_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=pdf&portrait=false&gridlines=false&printtitle=false&sheetnames=false&pagenum=UNDEFINED&attachment=true`;
const XLSX_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;

const ZOOM_LEVELS = [50, 60, 75, 90, 100];

export default function Planilha() {
  const [zoomIdx, setZoomIdx] = useState(2); // começa em 75%
  const [showTip, setShowTip] = useState(true);

  const zoom = ZOOM_LEVELS[zoomIdx];
  const canZoomIn = zoomIdx < ZOOM_LEVELS.length - 1;
  const canZoomOut = zoomIdx > 0;

  return (
    <div className="fixed inset-0 bg-white flex flex-col" style={{ zIndex: 50 }}>
      {/* Barra superior */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b flex-shrink-0 gap-2"
        style={{ background: '#fdf6f0', borderColor: '#7c4a1e33' }}
      >
        {/* Voltar */}
        <Link href="/">
          <button
            className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-70 whitespace-nowrap"
            style={{ color: '#7c4a1e' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
        </Link>

        {/* Título */}
        <span className="text-xs font-semibold tracking-widest uppercase hidden sm:block"
          style={{ color: '#7c4a1e' }}>
          Regency Square Smart Stay · Planilha de Unidades
        </span>

        {/* Controles de zoom + link */}
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="flex items-center gap-1 bg-white border rounded-md px-1.5 py-0.5"
            style={{ borderColor: '#7c4a1e33' }}>
            <button
              onClick={() => setZoomIdx(i => Math.max(0, i - 1))}
              disabled={!canZoomOut}
              className="p-0.5 rounded transition-colors disabled:opacity-30 hover:bg-amber-50"
              title="Diminuir zoom"
            >
              <ZoomOut className="w-3 h-3" style={{ color: '#7c4a1e' }} />
            </button>
            <span className="text-[11px] font-medium w-8 text-center" style={{ color: '#7c4a1e' }}>
              {zoom}%
            </span>
            <button
              onClick={() => setZoomIdx(i => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
              disabled={!canZoomIn}
              className="p-0.5 rounded transition-colors disabled:opacity-30 hover:bg-amber-50"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3 h-3" style={{ color: '#7c4a1e' }} />
            </button>
          </div>

          {/* Baixar PDF */}
          <a
            href={PDF_URL}
            className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded transition-colors hover:bg-red-50 whitespace-nowrap"
            style={{ color: '#b91c1c' }}
            title="Baixar em PDF"
          >
            <FileDown className="w-3 h-3" />
            <span className="hidden sm:inline">PDF</span>
          </a>

          {/* Baixar Excel */}
          <a
            href={XLSX_URL}
            className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded transition-colors hover:bg-green-50 whitespace-nowrap"
            style={{ color: '#15803d' }}
            title="Baixar em Excel"
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span className="hidden sm:inline">Excel</span>
          </a>

          {/* Abrir no Google Sheets */}
          <a
            href={SHEET_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs transition-colors hover:opacity-70 whitespace-nowrap"
            style={{ color: '#7c4a1e' }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Abrir no Google Sheets</span>
            <span className="sm:hidden">Editar</span>
          </a>
        </div>
      </div>

      {/* Dica de navegação */}
      {showTip && (
        <div
          className="flex items-center justify-between gap-2 px-3 py-1 text-[11px] flex-shrink-0"
          style={{ background: '#fffbf5', borderBottom: '1px solid #7c4a1e22', color: '#7c4a1e99' }}
        >
          <div className="flex items-center gap-1.5">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span>Visualização somente leitura. Use os botões <strong>−/+</strong> para ajustar o zoom. Para editar, clique em "Abrir no Google Sheets".</span>
          </div>
          <button
            onClick={() => setShowTip(false)}
            className="text-[10px] hover:opacity-70 flex-shrink-0 font-medium"
            style={{ color: '#7c4a1e' }}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Iframe com zoom aplicado via transform */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        <iframe
          src={EMBED_URL}
          title="Planilha Regency Square Smart Stay"
          style={{
            display: 'block',
            border: 'none',
            width: `${(100 / zoom) * 100}%`,
            height: `${(100 / zoom) * 100}%`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  );
}
