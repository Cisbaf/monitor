import { useRouter } from 'next/router';

export default function DisplayIndividual() {
  const router = useRouter();
  const sites = router.query.site as string[];

  if (!sites) {
    return <div>Carregando...</div>;
  }

  const siteConfigs = sites.map((site) => {
    const [url, time] = site.split(':');
    return { url: decodeURIComponent(url), time: parseInt(time, 10) };
  });

  return (
    <div>
      <h1>Visualização - Tempos Individuais</h1>
      <ul>
        {siteConfigs.map((site, index) => (
          <li key={index}>
            {site.url} - {site.time} segundos
          </li>
        ))}
      </ul>
    </div>
  );
}