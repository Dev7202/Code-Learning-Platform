import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { generateRoadmap } from '../features/roadmapSlicer';

export default function Generator() {
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState('beginner');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { generation_loading } = useSelector(state => state.roadmap);

    const handleSubmit = async e => {
        e.preventDefault();
        if (!topic.trim()) { toast.error('Please enter a topic'); return; }

        const toastId = toast.loading('Generating your roadmap... this may take 30-60 seconds');
        const res = await dispatch(generateRoadmap({ userDescription: topic, userLevel: level }));
        toast.dismiss(toastId);

        if (res.payload?.success) {
            toast.success('Roadmap generated!');
            navigate(`/roadmap/${res.payload.data._id}`);
        } else {
            toast.error(res.payload?.message || 'Generation failed. Please try again.');
        }
    };

    const levels = [
        { value: 'beginner',     label: 'Beginner',     desc: 'New to the topic' },
        { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
        { value: 'advanced',     label: 'Advanced',     desc: 'Deep knowledge' },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-900 via-slate-900 to-black text-white">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 pt-32 pb-16">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-300">AI Roadmap Generator</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3">Generate Your Roadmap</h1>
                    <p className="text-slate-400">Enter any programming topic and get a personalized learning path</p>
                </div>

                {/* Form Card */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Topic Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                                What do you want to learn?
                            </label>
                            <input type="text"
                                placeholder="e.g. React, Python, System Design, Node.js..."
                                value={topic} onChange={e => setTopic(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none" />
                        </div>

                        {/* Level Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-3">
                                Your current level
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {levels.map(l => (
                                    <button key={l.value} type="button"
                                        onClick={() => setLevel(l.value)}
                                        className={`p-3 rounded-xl border text-left transition-all ${level === l.value
                                            ? 'border-blue-500 bg-blue-500/10 text-white'
                                            : 'border-slate-700/50 text-slate-400 hover:border-slate-600'}`}>
                                        <div className="font-semibold text-sm">{l.label}</div>
                                        <div className="text-xs opacity-70 mt-0.5">{l.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit"
                            disabled={generation_loading || !topic.trim()}
                            className="w-full py-4 bg-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {generation_loading
                                ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating...</>
                                : <><Sparkles className="h-5 w-5" /> Generate Roadmap</>}
                        </button>

                        {generation_loading && (
                            <p className="text-center text-sm text-slate-400">
                                ⏳ AI is generating your roadmap. This takes 30-60 seconds. Please wait...
                            </p>
                        )}
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    );
}