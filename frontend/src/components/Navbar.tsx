import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const useNavigateHook = useNavigate();

    const handleLogout = () => {
        logout();
        useNavigateHook('/login');
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-brand">
                    <FileText className="text-primary" />
                    <span>AI Resume Analyzer</span>
                </Link>
                <div className="nav-links">
                    {isAuthenticated ? (
                        <>
                            <Link to="/analyze" className="nav-link">New Analysis</Link>
                            <Link to="/history" className="nav-link">History</Link>
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                <LogOut size={16} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
