import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pin, Trash2, Plus, Search, BookOpen, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { deleteUserRoadmap, togglePinRoadmap } from '../features/roadmapSlicer';

export default function Roadmaps() {
    const { userRoadmaps, fetch_loading } = useSelector(state => state.roadmap);
    const dispatch = useDispatch();
    const [search, setSearch] = useState('');

    // Filter roadmaps based on search input
    const filtered = userRoadmaps.filter(r =>
        r.roadmapData?.title?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this roadmap?')) return;
        await dispatch(deleteUserRoadmap(id));
        toast.success('Roadmap deleted');
    };

    const handlePin = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        const res = await dispatch(togglePinRoadmap(id));
        const isPinned = res.payload?.data?.isPinned;
        toast.success(isPinned ? 'Roadmap pinned' : 'Roadmap unpinned');
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-900 via-slate-900 to-black text-white">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 pt-28 pb-16">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">My Roadmaps</h1>
                        <p className="text-slate-400 mt-1">
                            {userRoadmaps.length} roadmap{userRoadmaps.length !== 1 ? 's' : ''} created
                        </p>
                    </div>
                    <Link to="/roadmap/generate"
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                        <Plus className="h-4 w-4" /> New Roadmap
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <input type="text" placeholder="Search your roadmaps..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none" />
                </div>

                {/* Loading State */}
                {fetch_loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
                    </div>

                /* Empty State */
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-400 mb-2">
                            {search ? 'No roadmaps found' : 'No roadmaps yet'}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {search ? 'Try a different search term' : 'Generate your first AI-powered learning roadmap'}
                        </p>
                        {!search && (
                            <Link to="/roadmap/generate"
                                className="px-6 py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                                Generate Roadmap
                            </Link>
                        )}
                    </div>

                /* Roadmap Cards */
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(roadmap => (
                            <Link key={roadmap._id} to={`/roadmap/${roadmap._id}`}
                                className="group relative p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer">

                                {/* Pinned Badge */}
                                {roadmap.isPinned && (
                                    <div className="absolute top-3 left-3 bg-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                        Pinned
                                    </div>
                                )}

                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4 mt-2">
                                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                                        <BookOpen className="h-5 w-5 text-white" />
                                    </div>

                                    {/* Pin and Delete buttons — show on hover */}
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={e => handlePin(e, roadmap._id)}
                                            className={`p-1.5 rounded-lg transition-colors ${roadmap.isPinned ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}>
                                            <Pin className="h-4 w-4" />
                                        </button>
                                        <button onClick={e => handleDelete(e, roadmap._id)}
                                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-300 transition-colors">
                                    {roadmap.roadmapData?.title || 'Untitled'}
                                </h3>
                                <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                                    {roadmap.roadmapData?.description}
                                </p>

                                {/* Card Footer */}
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>{roadmap.roadmapData?.chapters?.length || 0} chapters</span>
                                    <span>•</span>
                                    <span>{roadmap.roadmapData?.difficulty || 'N/A'}</span>
                                    <span>•</span>
                                    <span>{roadmap.roadmapData?.estimatedDuration}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}