import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface SiteConfig {
  url: string;
  time: number;
}

interface DisplayConfig {
  type: 'global' | 'individual';
  sites: string[] | SiteConfig[];
  time?: number;
}

export default function DisplayPage() {
  const router = useRouter();
  const { config } = router.query;
  const [sitesList, setSitesList] = useState<SiteConfig[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (config && typeof config === 'string') {
      try {
        const decodedConfig: DisplayConfig = JSON.parse(decodeURIComponent(config));

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
    if (sitesList.length === 0) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % sitesList.length);
    }, sitesList[currentIndex].time * 1000);

    return () => clearTimeout(timer);
  }, [currentIndex, sitesList]);

  if (!sitesList.length) return <div>Carregando...</div>;

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
    </div>
  );
}