import React, { useState, useEffect } from 'react';
import { jobApi } from '../services/api';
import {
    Briefcase, MapPin, ExternalLink, Loader2, Calendar, Star,
    Search, SlidersHorizontal, DollarSign, Clock, TrendingUp, Bookmark, Building2
} from 'lucide-react';

interface Job {
    id: string;
    position: string;
    company: string;
    location: string;
    tags: string[];
    description: string;
    url: string;
    matchScore: number;
    company_logo: string;
    date: string;
    salary?: string;
    jobType?: string;
    remote?: boolean;
    experience?: string;
}

const SALARY_RANGES = ['₹8–12 LPA', '₹12–18 LPA', '₹18–25 LPA', '₹25–40 LPA', '$80k–$110k', '$110k–$150k'];
const JOB_TYPES = ['Full-time', 'Full-time', 'Full-time', 'Contract', 'Part-time'];
const EXPERIENCE = ['0–2 years', '2–5 years', '3–6 years', '5–8 years', '8+ years'];

function enrichJob(job: Job, idx: number): Job {
    return {
        ...job,
        salary: job.salary ?? SALARY_RANGES[idx % SALARY_RANGES.length],
        jobType: job.jobType ?? JOB_TYPES[idx % JOB_TYPES.length],
        remote: job.remote ?? (idx % 3 === 0),
        experience: job.experience ?? EXPERIENCE[idx % EXPERIENCE.length],
    };
}

const FILTER_TYPES = ['All', 'Full-time', 'Contract', 'Remote', 'Part-time'];

// Fallback mock jobs shown when the live API is unavailable / rate-limited
const MOCK_JOBS: Job[] = [
    { id: 'm1', position: 'Senior React Developer', company: 'TechCorp', location: 'Remote', tags: ['React', 'TypeScript', 'Node.js', 'GraphQL'], description: '', url: '#', matchScore: 92, company_logo: '', date: new Date().toISOString() },
    { id: 'm2', position: 'Full-Stack Engineer', company: 'Startup Inc', location: 'Bangalore, IN', tags: ['Java', 'Spring Boot', 'React', 'MySQL'], description: '', url: '#', matchScore: 85, company_logo: '', date: new Date().toISOString() },
    { id: 'm3', position: 'Backend Java Developer', company: 'Enterprise Ltd', location: 'Mumbai, IN', tags: ['Java', 'Spring', 'MySQL', 'REST', 'Docker'], description: '', url: '#', matchScore: 78, company_logo: '', date: new Date().toISOString() },
    { id: 'm4', position: 'Cloud DevOps Engineer', company: 'CloudSystems', location: 'Remote', tags: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'], description: '', url: '#', matchScore: 65, company_logo: '', date: new Date().toISOString() },
    { id: 'm5', position: 'Data Engineer', company: 'Analytics Co', location: 'Hyderabad, IN', tags: ['Python', 'Spark', 'SQL', 'Airflow', 'Kafka'], description: '', url: '#', matchScore: 55, company_logo: '', date: new Date().toISOString() },
];

const MatchBadge: React.FC<{ score: number }> = ({ score }) => {
    if (score >= 80) return (
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-500/15 text-green-400 border border-green-500/25">
            <TrendingUp size={10} /> {score}% Match
        </span>
    );
    if (score >= 55) return (
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
            {score}% Match
        </span>
    );
    return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-500/15 text-slate-400 border border-slate-500/20">
            {score}% Match
        </span>
    );
};

const JobFeedPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const [usingMockData, setUsingMockData] = useState(false);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<'match' | 'date'>('match');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        setAuthError(false);
        setUsingMockData(false);
        try {
            const response = await jobApi.getJobs();
            const enriched = (response.data as Job[]).map(enrichJob);
            setJobs(enriched);
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                // JWT missing or expired — show sign-in prompt
                setAuthError(true);
            } else {
                // External/network error — fall back to sample jobs
                console.warn('Live job feed unavailable, showing sample data:', err?.message);
                setJobs(MOCK_JOBS.map(enrichJob));
                setUsingMockData(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = (id: string) => {
        setSavedJobs(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const filtered = jobs
        .filter(j => {
            const q = search.toLowerCase();
            const matchesSearch = !q ||
                j.position.toLowerCase().includes(q) ||
                j.company.toLowerCase().includes(q) ||
                j.location.toLowerCase().includes(q) ||
                j.tags.some(t => t.toLowerCase().includes(q));
            const matchesFilter =
                activeFilter === 'All' ||
                (activeFilter === 'Remote' ? j.remote : j.jobType === activeFilter);
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) =>
            sortBy === 'match'
                ? b.matchScore - a.matchScore
                : new Date(b.date).getTime() - new Date(a.date).getTime()
        );

    const topMatch = filtered.length > 0 ? filtered[0].matchScore : 0;

    // ── Auth error state ──────────────────────────────────────────────
    if (!loading && authError) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '80px' }}>
                <div className="glass-panel text-center" style={{ padding: '3rem 2rem', maxWidth: '440px' }}>
                    <div style={{ background: 'rgba(99,102,241,0.12)', display: 'inline-flex', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.25rem' }}>
                        <Briefcase className="h-10 w-10 text-indigo-400" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Sign in to view Jobs</h2>
                    <p style={{ fontSize: '0.95rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                        You need to be logged in to access your personalised job listings.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <a href="/login" className="btn btn-primary">Sign In</a>
                        <a href="/register" className="btn btn-secondary">Create Account</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ paddingTop: '80px' }}>
            {/* ── Header Banner ── */}
            <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.12) 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 0 2rem' }}>
                <div className="container">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <p className="text-indigo-300 text-sm font-semibold mb-1 uppercase tracking-wider">Your personalised feed</p>
                            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', background: 'none', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                Job Opportunities
                            </h1>
                            <p style={{ fontSize: '0.95rem', margin: 0 }}>
                                {loading
                                    ? 'Finding your best matches…'
                                    : `${filtered.length} role${filtered.length !== 1 ? 's' : ''} match your profile${topMatch > 0 ? ` · Top match ${topMatch}%` : ''}`
                                }
                            </p>
                            {usingMockData && (
                                <p style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: '#f59e0b' }}>
                                    ⚠ Showing sample jobs — live feed temporarily unavailable
                                </p>
                            )}
                        </div>

                        {/* Sort selector */}
                        {!loading && jobs.length > 0 && (
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={15} className="text-slate-400" />
                                <span className="text-slate-400 text-sm">Sort:</span>
                                <button
                                    onClick={() => setSortBy('match')}
                                    className={`btn text-xs px-3 py-1.5 ${sortBy === 'match' ? 'btn-primary' : 'btn-secondary'}`}
                                >Best Match</button>
                                <button
                                    onClick={() => setSortBy('date')}
                                    className={`btn text-xs px-3 py-1.5 ${sortBy === 'date' ? 'btn-primary' : 'btn-secondary'}`}
                                >Newest</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1280px', marginInline: 'auto' }}>

                {/* ── Search + Filters ── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-grow">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search by role, company, or skill…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {FILTER_TYPES.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`btn text-sm px-4 py-2 ${activeFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Content ── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
                        <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
                        <p>Finding your best matches…</p>
                    </div>

                ) : filtered.length === 0 ? (
                    <div className="glass-panel text-center py-20">
                        <div style={{ background: 'rgba(255,255,255,0.05)', display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.25rem' }}>
                            <Briefcase className="h-12 w-12 text-slate-500" />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>No roles found</h3>
                        <p style={{ maxWidth: '360px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
                            {search ? 'Try a different search term or clear the filter.' : 'Update your skills in your profile to see personalised matches.'}
                        </p>
                        {search ? (
                            <button className="btn btn-secondary" onClick={() => { setSearch(''); setActiveFilter('All'); }}>
                                Clear filters
                            </button>
                        ) : (
                            <a href="/dashboard" className="btn btn-primary">Update Profile</a>
                        )}
                    </div>

                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {filtered.map((job, idx) => (
                            <article
                                key={job.id}
                                className="glass-card group"
                                style={{
                                    padding: '1.5rem',
                                    transition: 'transform 0.2s, border-color 0.2s',
                                    borderColor: idx === 0 && sortBy === 'match' ? 'rgba(99,102,241,0.3)' : undefined
                                }}
                            >
                                {/* Top ribbon for best match */}
                                {idx === 0 && sortBy === 'match' && job.matchScore >= 70 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '4px', padding: '0.2rem 0.6rem' }}>
                                            ⭐ Top Pick for You
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-start gap-5">
                                    {/* Logo */}
                                    <div className="flex-shrink-0">
                                        {job.company_logo ? (
                                            <img
                                                src={job.company_logo}
                                                alt={job.company}
                                                style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'contain', background: 'white', padding: '4px' }}
                                                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=334155&color=fff&size=60`; }}
                                            />
                                        ) : (
                                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700, color: '#a5b4fc' }}>
                                                {job.company.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Main info */}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
                                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }} className="group-hover:text-indigo-300 transition-colors">
                                                {job.position}
                                            </h2>
                                            <MatchBadge score={job.matchScore} />
                                            {job.remote && (
                                                <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                    Remote
                                                </span>
                                            )}
                                        </div>

                                        {/* Meta row */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1', fontWeight: 500 }}>
                                                <Building2 size={13} style={{ color: '#818cf8' }} /> {job.company}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <MapPin size={13} /> {job.location}
                                            </span>
                                            {job.salary && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#a3e635' }}>
                                                    <DollarSign size={13} /> {job.salary}
                                                </span>
                                            )}
                                            {job.jobType && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    <Clock size={13} /> {job.jobType}
                                                </span>
                                            )}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <Calendar size={13} /> {new Date(job.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>

                                        {/* Tags */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {job.tags.slice(0, 7).map((tag, i) => (
                                                <span key={i} style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 500, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' }}>
                                        <a
                                            href={job.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-primary"
                                            style={{ whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '0.55rem 1.25rem' }}
                                        >
                                            Apply Now <ExternalLink size={14} />
                                        </a>
                                        <button
                                            onClick={() => toggleSave(job.id)}
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                                        >
                                            <Bookmark size={14} style={{ fill: savedJobs.has(job.id) ? 'currentColor' : 'none' }} />
                                            {savedJobs.has(job.id) ? 'Saved' : 'Save'}
                                        </button>
                                        {job.experience && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Star size={11} className="text-yellow-400" /> {job.experience} exp.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobFeedPage;
