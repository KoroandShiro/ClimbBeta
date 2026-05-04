import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOutdoorRouteById, type OutdoorRoute } from '../services/outdoorService';

export default function OutdoorDetails() {
    const { id } = useParams();
    const [route, setRoute] = useState<OutdoorRoute | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                setIsLoading(true);
                const r = await getOutdoorRouteById(Number(id));
                setRoute(r);
            } catch (e) {
                console.error(e);
                alert('Erro ao carregar detalhes.');
            } finally {
                setIsLoading(false);
            }
        })();
    }, [id]);

    if (isLoading) return <p>A carregar...</p>;
    if (!route) return <p>Rota não encontrada.</p>;

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
            <h1>{route.name ?? '(sem nome)'}</h1>
            <p><strong>Setor:</strong> {route.sector}</p>
            <p><strong>Localização:</strong> {route.location}</p>
            <p><strong>Grau:</strong> {route.grade}</p>
            <p><strong>Criador (userId):</strong> {route.creatorId ?? 'Desconhecido'}</p>
        </div>
    );
}
