import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, CheckCircle, FileText, ArrowRight, Sparkles, Target, TrendingUp, Shield, Users, Clock, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div style={{ paddingTop: '65px' }}>

            {/* ── Hero ── */}
            <section className="section">
                <div className="container text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8 animate-fade-in">
                        <Sparkles size={14} />
                        Powered by Google Gemini AI
                    </div>

                    <h1 className="animate-fade-in" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.75rem)' }}>
                        Land Your Dream Job<br />Faster Than Ever
                    </h1>

                    <p className="animate-fade-in delay-100" style={{ maxWidth: '600px', margin: '0 auto 2.5rem', fontSize: '1.2rem' }}>
                        Upload your resume, paste a job description, and get an instant AI analysis with a match score, skill gaps, and personalised suggestions.
                    </p>

                    <div className="animate-fade-in delay-200 flex items-center justify-center flex-wrap gap-4">
                        {isAuthenticated ? (
                            <Link to="/analyze" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.875rem 2rem' }}>
                                Analyze My Resume <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.875rem 2rem' }}>
                                    Get Started — It's Free <ArrowRight size={18} />
                                </Link>
                                <Link to="/login" className="btn btn-secondary" style={{ fontSize: '1.05rem', padding: '0.875rem 2rem' }}>
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Social proof */}
                    <div className="animate-fade-in delay-300 flex items-center justify-center gap-6 mt-10 flex-wrap text-slate-400 text-sm">
                        <div className="flex items-center gap-1.5">
                            <Users size={15} className="text-indigo-400" />
                            <span>2,400+ job seekers</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={15} className="text-green-400" />
                            <span>3× more interview calls</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={15} className="text-purple-400" />
                            <span>Analysis in under 10 seconds</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="section" style={{ paddingTop: '2rem' }}>
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 style={{ fontSize: '2.2rem', background: 'none', color: 'var(--text-primary)' }}>
                            Everything you need to get hired
                        </h2>
                        <p style={{ maxWidth: '520px', margin: '1rem auto 0' }}>
                            From tailored resume analysis to curated job feeds — we've got your entire job search covered.
                        </p>
                    </div>

                    <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
                        <div className="glass-card animate-fade-in delay-100">
                            <div style={{ background: 'rgba(99,102,241,0.15)', width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                <Bot size={26} style={{ color: 'var(--primary-color)' }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem' }}>AI-Powered Analysis</h3>
                            <p style={{ fontSize: '0.95rem' }}>Advanced algorithms compare your resume to the job description and surface exactly what's missing.</p>
                        </div>

                        <div className="glass-card animate-fade-in delay-200">
                            <div style={{ background: 'rgba(168,85,247,0.15)', width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                <Target size={26} style={{ color: 'var(--secondary-color)' }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem' }}>ATS Score & Optimisation</h3>
                            <p style={{ fontSize: '0.95rem' }}>Ensure your resume passes Applicant Tracking Systems before it even reaches a recruiter's desk.</p>
                        </div>

                        <div className="glass-card animate-fade-in delay-300">
                            <div style={{ background: 'rgba(16,185,129,0.15)', width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                <CheckCircle size={26} style={{ color: '#10b981' }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem' }}>Actionable Suggestions</h3>
                            <p style={{ fontSize: '0.95rem' }}>Get specific, prioritised recommendations to improve your skills, phrasing, and keywords.</p>
                        </div>

                        <div className="glass-card animate-fade-in delay-100">
                            <div style={{ background: 'rgba(251,191,36,0.12)', width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                <Briefcase size={26} style={{ color: '#fbbf24' }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem' }}>Personalised Job Feed</h3>
                            <p style={{ fontSize: '0.95rem' }}>Browse curated job listings matched to your skill set in real time — no sifting through noise.</p>
                        </div>

                        <div className="glass-card animate-fade-in delay-200">
                            <div style={{ background: 'rgba(239,68,68,0.12)', width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                <FileText size={26} style={{ color: '#f87171' }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem' }}>Resume Vault</h3>
                            <p style={{ fontSize: '0.95rem' }}>Store multiple resume versions and access previous analyses to track your progress over time.</p>
                        </div>

                        <div className="glass-card animate-fade-in delay-300">
                            <div style={{ background: 'rgba(59,130,246,0.12)', width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                <Shield size={26} style={{ color: '#60a5fa' }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem' }}>Private & Secure</h3>
                            <p style={{ fontSize: '0.95rem' }}>Your resume data is encrypted and never shared. You stay in complete control of your information.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="section" style={{ paddingBottom: '5rem' }}>
                <div className="container">
                    <div className="glass-panel text-center" style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 100%)' }}>
                        <h2 style={{ fontSize: '2rem', background: 'none', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Ready to get more interviews?
                        </h2>
                        <p style={{ maxWidth: '480px', margin: '0 auto 2rem' }}>
                            Join thousands of job seekers who've already optimised their resumes and landed roles they love.
                        </p>
                        {isAuthenticated ? (
                            <Link to="/analyze" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.875rem 2.25rem' }}>
                                Start Analyzing <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.875rem 2.25rem' }}>
                                Create Free Account <ArrowRight size={18} />
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
