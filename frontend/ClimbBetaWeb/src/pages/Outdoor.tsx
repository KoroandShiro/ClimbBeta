import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllOutdoorRoutes, type OutdoorRoute } from '../services/outdoorService';

export default function Outdoor() {
    const [routes, setRoutes] = useState<OutdoorRoute[]>([]);
    const [q, setQ] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setIsLoading(true);
            const all = await getAllOutdoorRoutes();
            setRoutes(all);
        } catch (e) {
            console.error('Erro a carregar routes', e);
            alert('Erro ao carregar o mapa/rotas.');
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = routes.filter(r => {
        const text = `${r.name ?? ''} ${r.sector} ${r.location}`.toLowerCase();
        return text.includes(q.toLowerCase());
    });

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h1>Outdoor — Rotas da Comunidade</h1>
                <Link to="/outdoor/create" style={{ padding: '8px 12px', background: '#10b981', color: 'white', borderRadius: 6, textDecoration: 'none' }}>
                    + Registar Rocha
                </Link>
            </div>

            <div style={{ marginBottom: 12 }}>
                <input placeholder="Pesquisar por nome, setor ou localidade..." value={q} onChange={e => setQ(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>

            {isLoading ? (
                <p>A carregar rotas...</p>
            ) : (
                <>
                    <p style={{ color: '#6b7280' }}>{filtered.length} resultado(s)</p>
                    <div style={{ display: 'grid', gap: 10 }}>
                        {filtered.map(r => (
                            <div key={r.id} style={{ padding: 14, border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{r.name ?? '(sem nome)'} </strong>
                                    <div style={{ color: '#6b7280' }}>{r.sector} — {r.location}</div>
                                </div>
                                <Link to={`/outdoor/${r.id}`} style={{ textDecoration: 'none', color: '#064e3b', fontWeight: 600 }}>Ver</Link>
                            </div>
                        ))}
                        {filtered.length === 0 && <div style={{ color: 'gray' }}>Nenhuma rota encontrada.</div>}
                    </div>
                </>
            )}
        </div>
    );
}
