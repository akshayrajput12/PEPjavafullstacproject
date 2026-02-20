import React, { useState } from 'react';
import { resumeService, analysisService } from '../services/api';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, Target, Zap } from 'lucide-react';

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
        } catch (err: any) {
            console.error(err);
            const status = err?.response?.status;
            const serverError = err?.response?.data?.error;
            if (err?.code === 'ERR_NETWORK' || !err?.response) {
                setError('Cannot connect to server. Please ensure the backend is running on port 8080.');
            } else if (status === 401 || status === 403) {
                // Token is stale or invalid — clear it and redirect to login
                localStorage.removeItem('token');
                setError('Your session has expired. Please sign in again. Redirecting...');
                setTimeout(() => { window.location.href = '/login'; }, 2000);
            } else if (status === 400) {
                setError(serverError || 'Bad request. Please check your resume and job description.');
            } else if (status === 500) {
                setError(serverError
                    ? `AI Analysis Error: ${serverError}`
                    : 'AI analysis failed on the server. Please try again.');
            } else if (status === 404) {
                setError('Resume not found. Please re-upload your resume and try again.');
            } else {
                setError(serverError || 'Analysis failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ paddingTop: '80px', paddingBottom: '3rem' }}>
            <div className="container" style={{ paddingTop: '2rem' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                            AI Resume Analysis
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Upload your resume and paste the job description to see how well you match and get tailored improvement suggestions.
                        </p>
                    </div>

                    <div className={`grid ${result ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'}`} style={{ gap: '2rem' }}>
                        {/* Input Section */}
                        <div className="glass-panel p-8 space-y-8 animate-fade-in">
                            <div className="space-y-4">
                                <label className="text-lg font-semibold flex items-center gap-2">
                                    <FileText size={20} className="text-indigo-400" />
                                    1. Upload Resume (PDF/DOCX)
                                </label>
                                <div
                                    className="file-upload-area relative group"
                                    onClick={() => document.getElementById('resume-upload')?.click()}
                                >
                                    <input
                                        type="file"
                                        id="resume-upload"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf,.docx,.doc"
                                    />
                                    {file ? (
                                        <div className="text-indigo-400 animate-fade-in">
                                            <div className="bg-indigo-500/10 p-4 rounded-full inline-block mb-3">
                                                <FileText size={40} />
                                            </div>
                                            <p className="text-white font-semibold mb-1">{file.name}</p>
                                            <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div className="text-slate-400 group-hover:text-indigo-400 transition-colors">
                                            <div className="bg-white/5 p-4 rounded-full inline-block mb-3 group-hover:bg-indigo-500/10 transition-colors">
                                                <Upload size={40} />
                                            </div>
                                            <p className="text-slate-300">Click to browse or drag file here</p>
                                            <p className="text-slate-500 text-sm mt-1">Accepts PDF, DOC, DOCX up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-lg font-semibold flex items-center gap-2">
                                    <Target size={20} className="text-purple-400" />
                                    2. Job Description
                                </label>
                                <textarea
                                    className="input-field min-h-[250px]"
                                    placeholder="Paste the job description or requirement list here..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 animate-fade-in">
                                    <AlertCircle size={20} />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <button
                                className="btn btn-primary w-full py-4 text-lg"
                                onClick={handleAnalyze}
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="animate-spin" /> Processing Analysis...</>
                                ) : (
                                    <><Sparkles size={20} /> Run AI Analysis</>
                                )}
                            </button>
                        </div>

                        {/* Result Section */}
                        {result && (
                            <div className="glass-panel p-8 animate-fade-in space-y-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-6">Detailed Report</h2>

                                    <div className="score-circle relative mx-auto" style={{ '--score': `${result.score}%` } as any}>
                                        <div className="score-inner">
                                            <span className={`bg-gradient-to-r ${result.score > 75 ? 'from-green-400 to-emerald-400' : result.score > 50 ? 'from-yellow-400 to-orange-400' : 'from-red-400 to-rose-400'} bg-clip-text text-transparent`}>
                                                {result.score}%
                                            </span>
                                        </div>
                                    </div>
                                    <p className={`text-lg font-bold ${result.score > 75 ? 'text-green-400' : result.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {result.score > 75 ? 'Excellent Match!' : result.score > 50 ? 'Good Potential' : 'Needs Improvement'}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* Strengths */}
                                    <div className="glass-card border-green-500/20 bg-green-500/5">
                                        <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                                            <CheckCircle size={18} /> Found Strengths
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.parsedResult?.strengths?.map((skill: string, idx: number) => (
                                                <span key={idx} className="bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 rounded-full text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Missing Skills */}
                                    <div className="glass-card border-red-500/20 bg-red-500/5">
                                        <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                                            <Zap size={18} /> Key Gaps Identified
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.parsedResult?.missing_skills?.map((skill: string, idx: number) => (
                                                <span key={idx} className="bg-red-500/10 text-red-300 border border-red-500/20 px-3 py-1 rounded-full text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="glass-card bg-indigo-500/5 border-indigo-500/10">
                                        <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2">
                                            <Sparkles size={18} /> How to Improve
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {result.parsedResult?.suggestions}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisPage;
