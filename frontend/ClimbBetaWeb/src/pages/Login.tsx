/**
 * @file Login.tsx
 * @description Página de login do backoffice. Submete credenciais a `authService.login` e invoca
 *              `useAuth().login` para persistir o token e carregar o perfil (getMe).
 *
 * Testes:
 *  - src/__tests__/pages/Login.test.tsx
 *
 * Observações:
 *  - Tratar mensagens de erro para o utilizador; não guardar passwords em localStorage.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as apiLogin } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login: contextLogin } = useAuth();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const token = await apiLogin(email, password);
            await contextLogin(token); // stores the token and loads the user profile
            navigate('/gyms', { replace: true });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cb-auth-page">
            <div className="cb-card">
                <div className="cb-brand">
                    <span className="cb-logo" aria-hidden="true">🧗</span>
                    <span className="cb-wordmark">ClimbBeta</span>
                </div>
                <h1 className="cb-title">Welcome back</h1>
                <p className="cb-subtitle">Sign in to your gym backoffice</p>

                {error && <div className="cb-error">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="cb-field">
                        <label className="cb-label">Email</label>
                        <input
                            className="cb-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@yourgym.com"
                            required
                        />
                    </div>

                    <div className="cb-field">
                        <label className="cb-label">Password</label>
                        <input
                            className="cb-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                            required
                        />
                    </div>

                    <button className="cb-btn" type="submit" disabled={isLoading}>
                        {isLoading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="cb-alt">
                    No gym owner account yet? <Link className="cb-link" to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}
