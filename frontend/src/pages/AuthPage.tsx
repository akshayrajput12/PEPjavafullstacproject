import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';

interface AuthPageProps {
    type: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ type }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (type === 'login') {
                const data = await authService.login(email, password);
                login(data.token);
                navigate('/analyze');
            } else {
                await authService.register(name, email, password);
                // Auto login after register or redirect to login
                const data = await authService.login(email, password);
                login(data.token);
                navigate('/analyze');
            }
        } catch (err: any) {
            setError(err.response?.data || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-card animate-fade-in">
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {type === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {type === 'register' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        {type === 'login' ? 'Sign In' : 'Sign Up'} <ArrowRight size={18} />
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <a href={type === 'login' ? '/register' : '/login'} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
                        {type === 'login' ? 'Sign Up' : 'Sign In'}
                    </a>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
