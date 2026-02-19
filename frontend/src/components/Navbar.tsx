import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, LayoutDashboard, Briefcase, ScanText, Clock, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) =>
        location.pathname === path ? 'text-white' : 'text-slate-400 hover:text-white';

    const navLinks = isAuthenticated ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/jobs', label: 'Job Feed', icon: Briefcase },
        { to: '/analyze', label: 'Analyze', icon: ScanText },
        { to: '/history', label: 'History', icon: Clock },
    ] : [];

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
                    <FileText className="text-indigo-400" size={22} />
                    <span>ResumeAI</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden sm:flex nav-links items-center">
                    {navLinks.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`nav-link text-sm font-medium transition-colors ${isActive(to)}`}
                        >
                            {label}
                        </Link>
                    ))}
                    {isAuthenticated ? (
                        <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
                            <LogOut size={15} /> Logout
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className={`nav-link text-sm font-medium ${isActive('/login')}`}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>Get Started</Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className="sm:hidden p-2 text-slate-400 hover:text-white transition-colors"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="sm:hidden border-t border-white/10 bg-[#0f172a]/95 backdrop-blur-lg">
                    <div className="container py-4 flex flex-col gap-3">
                        {navLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-2 py-2 text-sm font-medium transition-colors ${isActive(to)}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <Icon size={16} /> {label}
                            </Link>
                        ))}
                        {isAuthenticated ? (
                            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn btn-secondary w-full mt-2 text-sm">
                                <LogOut size={15} /> Logout
                            </button>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
                                <Link to="/register" className="btn btn-primary w-full text-sm" onClick={() => setMenuOpen(false)}>Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
