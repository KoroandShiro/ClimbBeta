import { useState } from 'react';
import { verifyCode } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export default function ActivationWallCard() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { updateUserStatus } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await verifyCode(code);
            updateUserStatus('VERIFIED');
        } catch (err: any) {
            setError(err.message || 'Código inválido. Tenta novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Conta Pendente de Ativação</h2>
                <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
                    A tua conta está pendente. Insere o código de ativação fornecido pelo Admin para desbloquear o acesso ao backoffice.
                </p>

                {error && (
                    <p style={{ color: '#ef4444', marginBottom: '16px', fontWeight: 'bold', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px' }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Código de ativação"
                        required
                        style={{ padding: '12px', border: '2px solid #d1d5db', borderRadius: '6px', fontSize: '16px', textAlign: 'center', letterSpacing: '2px' }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {isLoading ? 'A verificar...' : 'Ativar Conta'}
                    </button>
                </form>
            </div>
        </div>
    );
}
