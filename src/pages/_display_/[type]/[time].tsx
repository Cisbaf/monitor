import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function DisplayGlobal() {
  const router = useRouter();
  const { type, time } = router.query;
  const [sites, setSites] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Captura os parâmetros da URL
  useEffect(() => {
    if (type === 'global' && time && router.query.site) {
      const siteParams = router.query.site;
      const sitesArray = Array.isArray(siteParams) ? siteParams : [siteParams];
      setSites(sitesArray.map((site) => decodeURIComponent(site)));
    }
  }, [type, time, router.query.site]);

  // Lógica para alternar entre sites
  useEffect(() => {
    if (sites.length === 0) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % sites.length);
    }, Number(time) * 1000);

    return () => clearTimeout(timer);
  }, [currentIndex, sites, time]);

  if (!type || !time || sites.length === 0) {
    return <div>Carregando...</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1 className="text-center mt-3">Visualização - Tempo Global</h1>
      <p className="text-center">Tempo de exibição: {time} segundos</p>
      {sites.map((site, index) => (
        <iframe
          key={site}
          src={site}
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