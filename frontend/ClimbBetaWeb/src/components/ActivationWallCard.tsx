/**
 * @file ActivationWallCard.tsx
 * @description Card de ativação de conta exibido quando o utilizador tem status PENDING.
 *              Contém um formulário simples para submeter um código de ativação via `verifyCode`.
 *
 * Props: nenhum (componente usado internamente pelo Dashboard)
 *
 * Dependências:
 *  - ../services/authService (verifyCode)
 *  - ../contexts/AuthContext (updateUserStatus)
 *
 * Testes:
 *  - src/__tests__/components/ActivationWallCard.test.tsx
 *
 * Observações:
 *  - Lida com mensagens de erro locais; não faz redirects.
 */
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
            setError(err.message || 'Invalid code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="cb-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '44px', marginBottom: '12px' }}>🔒</div>
                <h2 className="cb-title">Account pending activation</h2>
                <p className="cb-subtitle" style={{ marginBottom: '20px' }}>
                    Your account is pending. Enter the activation code provided by an admin to unlock the backoffice.
                </p>

                {error && <div className="cb-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        className="cb-input"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Activation code"
                        required
                        style={{ textAlign: 'center', letterSpacing: '2px' }}
                    />
                    <button className="cb-btn" type="submit" disabled={isLoading}>
                        {isLoading ? 'Verifying…' : 'Activate account'}
                    </button>
                </form>
            </div>
        </div>
    );
}
