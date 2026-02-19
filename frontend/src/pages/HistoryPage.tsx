import React, { useEffect, useState } from 'react';
import { resumeService } from '../services/api';
import { FileText, Trash2 } from 'lucide-react';

const HistoryPage: React.FC = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            // First get resumes
            const resumesRes = await resumeService.getMyResumes();
            const resumes = resumesRes.data;

            // For each resume, get history (simplified for now, ideally backend should join)
            // Assuming the API structure, we might need to iterate.
            // Let's assume we show list of resumes first
            setHistory(resumes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                await resumeService.deleteResume(id);
                setHistory(history.filter(h => h.id !== id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px', minHeight: '100vh' }}>
            <h1 style={{ marginBottom: '2rem' }}>My Resumes</h1>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid" style={{ gap: '1rem' }}>
                    {history.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No resumes found.</p>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                                        <FileText className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.fileName}</h3>
                                        <p style={{ fontSize: '0.9rem' }}>Uploaded on {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => handleDelete(item.id)}>
                                        <Trash2 size={18} color="#f87171" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
