import { useState } from 'react';
import { createGym } from '../services/gymService';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    onCreated: () => void;
    onClose: () => void;
}

export default function CreateGymModal({ onCreated, onClose }: Props) {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
        setError('');
        setIsLoading(true);
        try {
            await createGym({
                ownerId: user.id,
                name,
                address,
                city,
                coverImageUrl: coverImageUrl || undefined,
            });
            onCreated();
        } catch (err: any) {
            setError(err.message || 'Erro ao criar ginásio. Tenta novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', margin: '0 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, color: '#1f2937' }}>🏢 Adicionar Ginásio</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#6b7280', lineHeight: '1' }}>×</button>
                </div>

                {error && (
                    <p style={{ color: '#ef4444', marginBottom: '16px', fontWeight: 'bold', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px' }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Nome *</label>
                        <input
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: Climbing Factory Lisboa"
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Morada *</label>
                        <input
                            required
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="Rua, Número..."
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Cidade *</label>
                        <input
                            required
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            placeholder="Ex: Lisboa, Porto..."
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                            URL da Imagem de Capa{' '}
                            <span style={{ fontWeight: 'normal', color: '#6b7280' }}>(opcional)</span>
                        </label>
                        <input
                            value={coverImageUrl}
                            onChange={e => setCoverImageUrl(e.target.value)}
                            placeholder="https://exemplo.com/foto.jpg"
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{ flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        >
                            {isLoading ? 'A criar...' : 'Criar Ginásio'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
