import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import axios from 'axios';
import { User, Mail, BookOpen, Edit2, Save, X, Loader2, Lock, CheckCircle, TrendingUp, Clock, Circle, PlayCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { checkAuth } from '../features/userSlicer';

const BASE = import.meta.env.VITE_BACKEND_URL;
const opts = { headers: { 'Content-Type': 'application/json' }, withCredentials: true };

export default function UserProfile() {
    const { username, email, avatar } = useSelector(state => state.user);
    const { userRoadmaps } = useSelector(state => state.roadmap);
    const dispatch = useDispatch();

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(username);
    const [isSaving, setIsSaving] = useState(false);

    const [changingPass, setChangingPass] = useState(false);
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [isSavingPass, setIsSavingPass] = useState(false);

    useEffect(() => { setName(username); }, [username]);

    // ─── Handlers ─────────────────────────────────────────────

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const res = await axios.put(`${BASE}/api/user/profile`, { name }, opts);
            if (res.data.success) {
                toast.success('Profile updated');
                await dispatch(checkAuth());
                setEditing(false);
            } else toast.error(res.data.message);
        } catch (err) {
            toast.error('Failed to update profile');
        }
        setIsSaving(false);
    };

    const handleChangePassword = async e => {
        e.preventDefault();
        setIsSavingPass(true);
        try {
            const res = await axios.post(`${BASE}/api/user/change-password`,
                { oldPassword: oldPass, newPassword: newPass }, opts);
            if (res.data.success) {
                toast.success('Password changed successfully');
                setOldPass('');
                setNewPass('');
                setChangingPass(false);
            } else toast.error(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        }
        setIsSavingPass(false);
    };

    // ─── Stats Calculation ────────────────────────────────────

    const roadmapStats = userRoadmaps.reduce((acc, r) => {
        const subtopics = r.roadmapData?.chapters?.flatMap(c => c.subtopics) || [];
        const total = subtopics.length;
        const done = subtopics.filter(s => s.completed).length;

        if (total > 0 && done === total) acc.completed += 1;
        else if (done > 0) acc.inProgress += 1;

        return acc;
    }, { completed: 0, inProgress: 0 });

    // ─── Render ───────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-900 via-slate-900 to-black text-white">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 pt-28 pb-16 space-y-6">

                {/* Profile Card */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-start gap-5">

                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
                            {avatar
                                ? <img src={avatar} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
                                : <span className="text-3xl font-bold">{username?.charAt(0)?.toUpperCase()}</span>}
                        </div>

                        <div className="flex-1 min-w-0">
                            {editing ? (
                                /* Edit Mode */
                                <div className="space-y-3">
                                    <input value={name} onChange={e => setName(e.target.value)}
                                        placeholder="Your name"
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveProfile} disabled={isSaving}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            Save
                                        </button>
                                        <button onClick={() => setEditing(false)}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors">
                                            <X className="h-4 w-4" /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode */
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-2xl font-bold">{username}</h1>
                                        <button onClick={() => setEditing(true)}
                                            className="p-1.5 text-slate-400 hover:text-white transition-colors">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Mail className="h-4 w-4" /> {email}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Roadmaps', value: userRoadmaps.length, icon: <BookOpen className="h-5 w-5 text-blue-400" /> },
                        { label: 'In Progress', value: roadmapStats.inProgress, icon: <TrendingUp className="h-5 w-5 text-yellow-400" /> },
                        { label: 'Completed', value: roadmapStats.completed, icon: <CheckCircle className="h-5 w-5 text-green-400" /> },
                    ].map(s => (
                        <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
                            <div className="flex justify-center mb-2">{s.icon}</div>
                            <div className="text-2xl font-bold">{s.value}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Change Password */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-slate-400" />
                            <h2 className="font-semibold">Change Password</h2>
                        </div>
                        <button onClick={() => setChangingPass(p => !p)}
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            {changingPass ? 'Cancel' : 'Change'}
                        </button>
                    </div>

                    {changingPass && (
                        <form onSubmit={handleChangePassword} className="space-y-3">
                            <input type="password" placeholder="Current password"
                                value={oldPass} onChange={e => setOldPass(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                                required />
                            <input type="password" placeholder="New password"
                                value={newPass} onChange={e => setNewPass(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                                required />
                            <button type="submit" disabled={isSavingPass}
                                className="w-full py-2.5 bg-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                                {isSavingPass
                                    ? <div className="flex justify-center gap-2 items-center"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</div>
                                    : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}