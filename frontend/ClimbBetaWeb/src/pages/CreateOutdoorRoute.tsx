import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOutdoorRoutes, createOutdoorRoute, type OutdoorRoute } from '../services/outdoorService';

export default function CreateOutdoorRoute() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [sector, setSector] = useState('');
    const [location, setLocation] = useState('');
    const [grade, setGrade] = useState('V0');
    const [existing, setExisting] = useState<OutdoorRoute[]>([]);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // Nothing by default
    }, []);

    const checkDuplicates = async () => {
        setIsChecking(true);
        try {
            const all = await getAllOutdoorRoutes();
            const candidates = all.filter(r =>
                r.sector.toLowerCase() === sector.trim().toLowerCase()
                && r.location.toLowerCase() === location.trim().toLowerCase()
            ).filter(r => {
                // name similarity: if user provided a name, check substring; if not, return true (same sector+location)
                if (!name.trim()) return true;
                return (r.name ?? '').toLowerCase().includes(name.trim().toLowerCase()) || name.trim().toLowerCase().includes((r.name ?? '').toLowerCase());
            });

            setExisting(candidates);
            return candidates;
        } finally {
            setIsChecking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sector.trim() || !location.trim()) {
            alert('Sector e localização são obrigatórios.');
            return;
        }

        // 1) run duplicate check
        const dup = await checkDuplicates();
        if (dup.length > 0) {
            const names = dup.map(d => `${d.name ?? '(sem nome)'} — ${d.sector} (${d.location})`).join('\n');
            const proceed = window.confirm(`Foram encontradas rotas possivelmente iguais:\n\n${names}\n\nDeseja continuar e criar uma nova rota? Pressione OK para criar mesmo assim.`);
            if (!proceed) return;
        }

        // 2) submit
        try {
            const created = await createOutdoorRoute({
                name: name.trim() || null,
                sector: sector.trim(),
                location: location.trim(),
                grade,
            });
            alert('Rota criada com sucesso!');
            navigate(`/outdoor/${created.id}`);
        } catch (err: any) {
            alert('Erro ao criar rota: ' + (err.message || err));
        }
    };

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
            <h1>Registar nova Rocha</h1>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
                <label>Nome (opcional)</label>
                <input value={name} onChange={e => setName(e.target.value)} />

                <label>Setor *</label>
                <input value={sector} onChange={e => setSector(e.target.value)} required />

                <label>Localização *</label>
                <input value={location} onChange={e => setLocation(e.target.value)} required />

                <label>Grau</label>
                <select value={grade} onChange={e => setGrade(e.target.value)}>
                    {Array.from({ length: 11 }, (_, i) => `V${i}`).map(v => <option key={v} value={v}>{v}</option>)}
                </select>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button type="button" onClick={checkDuplicates} disabled={isChecking} style={{ padding: '8px 12px' }}>
                        {isChecking ? 'A verificar...' : 'Procurar rotas semelhantes'}
                    </button>
                    <button type="submit" style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 'none' }}>
                        Criar Rocha
                    </button>
                </div>

                {existing.length > 0 && (
                    <div style={{ background: '#fff7ed', padding: 12, borderRadius: 6 }}>
                        <strong>Rotas encontradas no mesmo setor/local:</strong>
                        <ul>
                            {existing.map(r => <li key={r.id}>{r.name ?? '(sem nome)'} — {r.sector} ({r.location}) — {r.grade}</li>)}
                        </ul>
                    </div>
                )}
            </form>
        </div>
    );
}
