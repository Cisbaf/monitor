import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

interface SiteConfig {
  url: string;
  time: number;
}

interface DisplayConfig {
  type: 'global' | 'individual';
  sites: string[] | SiteConfig[];
  time?: number;
}

// O Next já entrega router.query.config decodificado uma vez. Tentamos o JSON direto
// e só caímos no decodeURIComponent para links antigos com dupla codificação.
function parseConfig(raw: string): DisplayConfig {
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(decodeURIComponent(raw));
  }
}

const CONTROLS_CSS = `
.dc-controls {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 9999;
  display: flex;
  gap: 8px;
  padding: 8px;
  border-radius: 999px;
  background: rgba(20, 20, 20, 0.75);
  opacity: 0.3;
  transition: opacity 0.2s;
}
.dc-controls:hover,
.dc-controls:focus-within,
.dc-controls[data-paused="true"] {
  opacity: 1;
}
.dc-controls button {
  width: 48px;
  height: 48px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.dc-controls button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
}
.dc-controls button:disabled {
  opacity: 0.35;
  cursor: default;
}
.dc-controls[data-paused="true"] .dc-main {
  background: #f59e0b;
  color: #1a1a1a;
}
`;

const ICON_PROPS = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true } as const;

export default function DisplayPage() {
  const router = useRouter();
  const { config } = router.query;
  const [sitesList, setSitesList] = useState<SiteConfig[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);

  // Controle do tempo: guarda quando o timer atual começou e quanto durava,
  // para saber quanto faltava ao pausar. remainingRef = null significa "tempo cheio do site".
  const remainingRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const totalRef = useRef<number>(0);

  useEffect(() => {
    if (config && typeof config === 'string') {
      try {
        const decodedConfig = parseConfig(config);

        if (decodedConfig.type === 'global' && decodedConfig.time) {
          setSitesList(
            (decodedConfig.sites as string[]).map((url) => ({
              url,
              time: decodedConfig.time!,
            }))
          );
        } else if (decodedConfig.type === 'individual') {
          setSitesList(decodedConfig.sites as SiteConfig[]);
        }
      } catch (error) {
        console.error('Erro ao decodificar configuração:', error);
      }
    }
  }, [config]);

  useEffect(() => {
    if (sitesList.length === 0 || paused) return;

    const total = remainingRef.current ?? sitesList[currentIndex].time * 1000;
    startedAtRef.current = Date.now();
    totalRef.current = total;

    const timer = setTimeout(() => {
      remainingRef.current = null;
      setCurrentIndex((prev) => (prev + 1) % sitesList.length);
    }, total);

    return () => clearTimeout(timer);
  }, [currentIndex, sitesList, paused]);

  const goNext = () => {
    remainingRef.current = null;
    setCurrentIndex((prev) => (prev + 1) % sitesList.length);
  };

  const goPrev = () => {
    remainingRef.current = null;
    setCurrentIndex((prev) => (prev - 1 + sitesList.length) % sitesList.length);
  };

  const togglePause = () => {
    if (!paused) {
      const elapsed = Date.now() - startedAtRef.current;
      remainingRef.current = Math.max(totalRef.current - elapsed, 0);
    }
    setPaused(!paused);
  };

  if (!sitesList.length) return <div>Carregando...</div>;

  const single = sitesList.length < 2;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {sitesList.map((site, index) => (
        <iframe
          key={site.url}
          src={site.url}
          style={{
            width: '100%',
            height: '100%',
            display: index === currentIndex ? 'block' : 'none',
            border: 'none',
          }}
          sandbox="allow-scripts allow-same-origin"
        />
      ))}

      <style>{CONTROLS_CSS}</style>
      <div
        className="dc-controls"
        data-paused={paused}
        role="group"
        aria-label="Controles do rodízio"
      >
        <button type="button" onClick={goPrev} disabled={single} aria-label="Voltar" title="Voltar">
          <svg {...ICON_PROPS}>
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
        <button
          type="button"
          className="dc-main"
          onClick={togglePause}
          aria-label={paused ? 'Retomar' : 'Pausar'}
          title={paused ? 'Retomar' : 'Pausar'}
        >
          <svg {...ICON_PROPS}>
            {paused ? (
              <path d="M8 5v14l11-7z" />
            ) : (
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            )}
          </svg>
        </button>
        <button type="button" onClick={goNext} disabled={single} aria-label="Avançar" title="Avançar">
          <svg {...ICON_PROPS}>
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
