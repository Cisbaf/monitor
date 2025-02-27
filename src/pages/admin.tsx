import { useState } from 'react';
import { useRouter } from 'next/router';

interface SiteConfig {
  url: string;
  time: number;
}

type TimingType = 'global' | 'individual';

export default function Admin() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteConfig[]>([{ url: '', time: 60 }]);
  const [timingType, setTimingType] = useState<TimingType>('global');
  const [globalTime, setGlobalTime] = useState<number>(60);

  const addSite = () => {
    setSites([...sites, { url: '', time: globalTime }]);
  };

  const removeSite = (index: number) => {
    const newSites = sites.filter((_, i) => i !== index);
    setSites(newSites);
  };

  const updateSite = (index: number, field: keyof SiteConfig, value: string | number) => {
    const newSites = [...sites];
    newSites[index][field] = value as never;
    setSites(newSites);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config = {
      type: timingType,
      sites: timingType === 'global' ? sites.map((s) => s.url) : sites,
      ...(timingType === 'global' && { time: globalTime }),
    };

    const configString = encodeURIComponent(JSON.stringify(config));
    router.push(`/display?config=${configString}`);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Configuração de Sites</h1>
      <form onSubmit={handleSubmit} className="card p-4 shadow">
        <div className="mb-4">
          <label className="form-label fw-bold">Tipo de Temporização:</label>
          <div className="d-flex gap-3">
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                checked={timingType === 'global'}
                onChange={() => setTimingType('global')}
              />
              <label className="form-check-label">Tempo Global</label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                checked={timingType === 'individual'}
                onChange={() => setTimingType('individual')}
              />
              <label className="form-check-label">Tempos Individuais</label>
            </div>
          </div>
        </div>

        {timingType === 'global' && (
          <div className="mb-4">
            <label className="form-label fw-bold">Tempo Global (segundos):</label>
            <input
              type="number"
              className="form-control"
              value={globalTime}
              onChange={(e) => setGlobalTime(Number(e.target.value))}
              min="1"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="form-label fw-bold">Sites:</label>
          {sites.map((site, index) => (
            <div key={index} className="mb-3 p-3 border rounded">
              <div className="mb-3">
                <label className="form-label">URL do Site:</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://exemplo.com"
                  value={site.url}
                  onChange={(e) => updateSite(index, 'url', e.target.value)}
                  required
                />
              </div>
              {timingType === 'individual' && (
                <div className="mb-3">
                  <label className="form-label">Tempo (segundos):</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="60"
                    value={site.time}
                    onChange={(e) => updateSite(index, 'time', Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>
              )}
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeSite(index)}
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={addSite}
          >
            Adicionar Site
          </button>
          <button type="submit" className="btn btn-success">
            Gerar Visualização
          </button>
        </div>
      </form>
    </div>
  );
}