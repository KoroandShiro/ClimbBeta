import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

// Mirrors the server-side password policy in UserService.validatePasswordStrength.
const PASSWORD_RULES = [
    { label: '8 to 64 characters', test: (p: string) => p.length >= 8 && p.length <= 64 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One symbol', test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
];

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const ruleResults = useMemo(
        () => PASSWORD_RULES.map((r) => ({ label: r.label, ok: r.test(password) })),
        [password]
    );
    const passwordValid = ruleResults.every((r) => r.ok);
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const canSubmit =
        username.trim() !== '' && email.trim() !== '' && passwordValid && passwordsMatch && !isLoading;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            // The role is fixed: whoever registers on the web portal is a GYM_OWNER
            await register(username, email, password, 'GYM_OWNER');
            alert('Account created! You can log in now.');
            navigate('/login', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Could not create the account. Check your details or try another email.');
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
                <h1 className="cb-title">Create your account</h1>
                <p className="cb-subtitle">Join as a ClimbBeta gym partner</p>

                {error && <div className="cb-error">{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="cb-field">
                        <label className="cb-label">Account name</label>
                        <input
                            className="cb-input"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. Vertigo Boulder Room"
                        />
                    </div>

                    <div className="cb-field">
                        <label className="cb-label">Email</label>
                        <input
                            className="cb-input"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@yourgym.com"
                        />
                    </div>

                    <div className="cb-field">
                        <label className="cb-label">Password</label>
                        <input
                            className="cb-input"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a strong password"
                        />
                        <ul className="cb-checklist">
                            {ruleResults.map((r) => (
                                <li key={r.label} className={`cb-check${r.ok ? ' ok' : ''}`}>
                                    <span className="cb-check-icon" aria-hidden="true">✓</span>
                                    {r.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="cb-field">
                        <label className="cb-label">Confirm password</label>
                        <input
                            className="cb-input"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat your password"
                        />
                        {confirmPassword.length > 0 && !passwordsMatch && (
                            <p style={{ margin: '6px 0 0', fontSize: '12.5px', color: 'var(--cb-danger)' }}>
                                Passwords do not match.
                            </p>
                        )}
                    </div>

                    <button className="cb-btn" type="submit" disabled={!canSubmit}>
                        {isLoading ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="cb-alt">
                    Already have an account? <Link className="cb-link" to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
