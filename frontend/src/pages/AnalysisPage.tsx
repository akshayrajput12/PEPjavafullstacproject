import React, { useState } from 'react';
import { resumeService, analysisService } from '../services/api';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const AnalysisPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file || !jobDescription) {
            setError('Please upload a resume and enter a job description.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // 1. Upload Resume
            const resumeResponse = await resumeService.uploadResume(file);
            const resumeId = resumeResponse.data.id;

            // 2. Analyze
            const analysisResponse = await analysisService.analyzeResume(resumeId, jobDescription);
            const analysisData = analysisResponse.data;

            // Parse result string if it's a string
            if (typeof analysisData.result === 'string') {
                try {
                    analysisData.parsedResult = JSON.parse(analysisData.result);
                } catch (e) {
                    console.error("Failed to parse result JSON", e);
                    analysisData.parsedResult = {};
                }
            } else {
                analysisData.parsedResult = analysisData.result;
            }

            setResult(analysisData);
        } catch (err) {
            console.error(err);
            setError('Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '3rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>New Analysis</h1>

            <div className={`grid ${result ? 'grid-cols-2' : ''}`} style={{ gap: '2rem' }}>
                {/* Input Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>1. Upload Resume (PDF/DOCX)</label>
                        <div className="file-upload-area" onClick={() => document.getElementById('resume-upload')?.click()}>
                            <input
                                type="file"
                                id="resume-upload"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept=".pdf,.docx,.doc"
                            />
                            {file ? (
                                <div style={{ color: 'var(--primary-color)' }}>
                                    <FileText size={48} style={{ marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{file.name}</p>
                                    <p style={{ fontSize: '0.9rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-secondary)' }}>
                                    <Upload size={48} style={{ marginBottom: '1rem' }} />
                                    <p>Click to browse or drag file here</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>2. Job Description</label>
                        <textarea
                            className="input-field"
                            rows={8}
                            placeholder="Paste the job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#fca5a5', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '1.1rem' }}
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        {loading ? <><Loader className="animate-spin" /> Analyzing...</> : 'Analyze Resume'}
                    </button>
                </div>

                {/* Result Section */}
                {result && (
                    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Analysis Result</h2>

                        <div className="score-circle" style={{ '--score': `${result.score}%` } as any}>
                            <div className="score-inner">{result.score}%</div>
                        </div>
                        <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.2rem', color: result.score > 70 ? '#4ade80' : '#fbbf24' }}>
                            Match Score
                        </p>

                        <div className="grid" style={{ gap: '1.5rem' }}>
                            {/* Strengths */}
                            <div className="glass-card">
                                <h3 style={{ color: '#4ade80', marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={20} /> Strengths
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {result.parsedResult?.strengths?.map((skill: string, idx: number) => (
                                        <span key={idx} style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.9rem' }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Missing Skills */}
                            <div className="glass-card">
                                <h3 style={{ color: '#f87171', marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={20} /> Missing Skills
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {result.parsedResult?.missing_skills?.map((skill: string, idx: number) => (
                                        <span key={idx} style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.9rem' }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="glass-card">
                                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Improvement Suggestions</h3>
                                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                                    {result.parsedResult?.suggestions}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisPage;
