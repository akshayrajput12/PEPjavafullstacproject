import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            {/* Hero Section */}
            <section className="section text-center">
                <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h1 className="animate-fade-in">Optimize Your Resume with AI</h1>
                    <p className="animate-fade-in delay-100" style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
                        Get instant feedback, ATS score, and tailored suggestions to land your dream job.
                    </p>
                    <div className="animate-fade-in delay-200">
                        {isAuthenticated ? (
                            <Link to="/analyze" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
                                Analyze Resume <ArrowRight />
                            </Link>
                        ) : (
                            <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
                                Get Started for Free <ArrowRight />
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section grid grid-cols-3" style={{ gap: '2rem' }}>
                <div className="glass-card animate-fade-in delay-300">
                    <Bot size={48} className="text-primary" style={{ marginBottom: '1rem' }} />
                    <h3>AI-Powered Analysis</h3>
                    <p>Advanced algorithms analyze your resume against job descriptions to identify key gaps.</p>
                </div>
                <div className="glass-card animate-fade-in delay-300">
                    <CheckCircle size={48} className="text-secondary" style={{ marginBottom: '1rem' }} />
                    <h3>ATS Optimization</h3>
                    <p>Ensure your resume passes Applicant Tracking Systems with our scoring engine.</p>
                </div>
                <div className="glass-card animate-fade-in delay-300">
                    <FileText size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
                    <h3>Actionable Feedback</h3>
                    <p>Receive specific suggestions to improve your skills, experience, and formatting.</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
