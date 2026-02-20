import React, { useState, useEffect } from 'react';
import { userApi, resumeService } from '../services/api';
import { User, Briefcase, FileText, MapPin, Globe, Loader2, Save, CheckCircle } from 'lucide-react';

interface UserProfile {
    name: string;
    email: string;
    headline: string;
    currentJobTitle: string;
    about: string;
    skills: string[];
    location: string;
    website: string;
    resumeUrl: string;
}

const DashboardPage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        headline: '',
        currentJobTitle: '',
        about: '',
        skills: [],
        location: '',
        website: '',
        resumeUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'resume'>('profile');
    const [uploading, setUploading] = useState(false);
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userApi.getProfile();
            setProfile(response.data);
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                console.error('Failed to fetch profile', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skillsArray = e.target.value.split(',').map(skill => skill.trim());
        setProfile(prev => ({ ...prev, skills: skillsArray }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await userApi.updateProfile(profile);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleUploadResume = async () => {
        if (!resumeFile) return;
        setUploading(true);
        try {
            await resumeService.uploadResume(resumeFile);
            // The backend updates the user profile with the resume URL automatically.
            // We can refetch the profile or just assume success.
            // If response.data is the Resume object, we might not get the full download URL directly here unless we construct it.
            // However, the backend code I wrote DOES update the user profile.
            // Let's refetch the profile to get the updated resumeUrl.
            await fetchProfile();
            alert('Resume uploaded successfully!');
            setResumeFile(null);
        } catch (error) {
            console.error('Failed to upload resume', error);
            alert('Failed to upload resume.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0f172a]">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ paddingTop: '80px', paddingBottom: '3rem' }}>
            <div className="container" style={{ paddingTop: '1.5rem' }}>
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <div className="glass-panel overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            <button
                                className={`flex-1 py-4 px-6 text-center text-sm font-semibold transition-all duration-200 ${activeTab === 'profile'
                                    ? 'text-white border-b-2 border-indigo-500 bg-white/5'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <User className="inline-block w-4 h-4 mr-2" />
                                Profile Details
                            </button>
                            <button
                                className={`flex-1 py-4 px-6 text-center text-sm font-semibold transition-all duration-200 ${activeTab === 'resume'
                                    ? 'text-white border-b-2 border-indigo-500 bg-white/5'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                onClick={() => setActiveTab('resume')}
                            >
                                <FileText className="inline-block w-4 h-4 mr-2" />
                                Resume Upload
                            </button>
                        </div>

                        <div className="p-8">
                            {activeTab === 'profile' ? (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-slate-400 font-medium ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={profile.name}
                                                onChange={handleChange}
                                                className="input-field"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-slate-400 font-medium ml-1">Headline</label>
                                            <input
                                                type="text"
                                                name="headline"
                                                value={profile.headline || ''}
                                                onChange={handleChange}
                                                placeholder="e.g. Senior Software Engineer"
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-slate-400 font-medium ml-1">Current Role</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Briefcase className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="currentJobTitle"
                                                    value={profile.currentJobTitle || ''}
                                                    onChange={handleChange}
                                                    className="input-field pl-10"
                                                    placeholder="Software Developer"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-slate-400 font-medium ml-1">Location</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MapPin className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={profile.location || ''}
                                                    onChange={handleChange}
                                                    className="input-field pl-10"
                                                    placeholder="San Francisco, CA"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-slate-400 font-medium ml-1">Website / Portfolio</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Globe className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="website"
                                                    value={profile.website || ''}
                                                    onChange={handleChange}
                                                    className="input-field pl-10"
                                                    placeholder="https://yourportfolio.com"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-slate-400 font-medium ml-1">About Me</label>
                                            <textarea
                                                name="about"
                                                rows={5}
                                                value={profile.about || ''}
                                                onChange={handleChange}
                                                className="input-field"
                                                placeholder="Write a brief professional summary..."
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-slate-400 font-medium ml-1">Skills (comma separated)</label>
                                            <input
                                                type="text"
                                                name="skills"
                                                value={profile.skills?.join(', ') || ''}
                                                onChange={handleSkillsChange}
                                                placeholder="React, Node.js, TypeScript, Docker"
                                                className="input-field"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn btn-primary"
                                            style={{ minWidth: '160px' }}
                                        >
                                            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="h-5 w-5 mr-2" /> Save Profile</>}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-8 py-4">
                                    <div className="text-center md:text-left">
                                        <h2 className="text-2xl font-bold mb-2">Resume Management</h2>
                                        <p className="text-slate-400">
                                            Upload your latest resume. We use this to analyze your profile and match you with relevant jobs.
                                        </p>
                                    </div>

                                    {profile.resumeUrl && (
                                        <div className="glass-card flex items-center justify-between border-green-500/20 bg-green-500/5">
                                            <div className="flex items-center">
                                                <div className="bg-green-500/20 p-3 rounded-full mr-4">
                                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                                </div>
                                                <div>
                                                    <span className="text-lg font-semibold block">Resume Active</span>
                                                    <span className="text-slate-400 text-sm">Valid resume linked to your account</span>
                                                </div>
                                            </div>
                                            <a
                                                href={profile.resumeUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-secondary text-sm"
                                            >
                                                View Resume
                                            </a>
                                        </div>
                                    )}

                                    <div
                                        className="file-upload-area group"
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        <div className="text-center">
                                            <div className="bg-white/5 p-5 rounded-full inline-block mb-4 transition-colors group-hover:bg-indigo-500/10">
                                                <FileText className="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                            </div>
                                            <div className="flex flex-col text-slate-300">
                                                <p className="text-lg font-semibold">
                                                    <span className="text-indigo-400">Click to upload</span> or drag and drop
                                                </p>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.doc,.docx"
                                                />
                                            </div>
                                            <p className="mt-2 text-slate-500">PDF, DOC, DOCX up to 5MB</p>
                                            {resumeFile && (
                                                <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center gap-2">
                                                    <FileText className="h-4 w-4 text-indigo-400" />
                                                    <span className="text-sm font-medium text-white">{resumeFile.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleUploadResume}
                                            disabled={!resumeFile || uploading}
                                            className="btn btn-primary"
                                            style={{ minWidth: '180px' }}
                                        >
                                            {uploading ? (
                                                <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Uploading...</>
                                            ) : (
                                                'Upload Resume'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
