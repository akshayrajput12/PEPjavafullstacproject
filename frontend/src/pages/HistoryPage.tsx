import React, { useEffect, useState } from 'react';
import { resumeService } from '../services/api';
import { FileText, Trash2, Calendar, Loader2 } from 'lucide-react';

const HistoryPage: React.FC = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const resumesRes = await resumeService.getMyResumes();
            setHistory(resumesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this resume and its analysis history?')) {
            try {
                await resumeService.deleteResume(id);
                setHistory(history.filter(h => h.id !== id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="min-h-screen" style={{ paddingTop: '80px', paddingBottom: '3rem' }}>
            <div className="container" style={{ paddingTop: '2rem' }}>
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                Resume Vault
                            </h1>
                            <p className="text-slate-400">Manage your uploaded resumes and access past analysis reports.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="glass-panel text-center py-20">
                            <div className="bg-white/5 p-6 rounded-full inline-block mb-4">
                                <FileText className="h-12 w-12 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">No resumes found</h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-8">
                                You haven't uploaded any resumes yet. Start by analyzing your first resume!
                            </p>
                            <a href="/analyze" className="btn btn-primary">
                                Analyze Now
                            </a>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {history.map((item) => (
                                <div key={item.id} className="glass-card group flex items-center justify-between hover:border-indigo-500/30 transition-all duration-300">
                                    <div className="flex items-center gap-5">
                                        <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors text-indigo-400">
                                            <FileText size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                                                {item.fileName}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    {new Date().toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 capitalize">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    Stored Securely
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                            onClick={() => handleDelete(item.id)}
                                            title="Delete Resume"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
