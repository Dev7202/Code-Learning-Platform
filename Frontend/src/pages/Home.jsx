import { Zap, ArrowRight, Brain, BookOpen, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
    const { isLoggedin } = useSelector(state => state.user);

    const features = [
        { icon: <Brain className="w-6 h-6 text-blue-400" />, title: 'AI Roadmap Generator', desc: 'Generate personalized learning paths for any programming topic.' },
        { icon: <BookOpen className="w-6 h-6 text-blue-400" />, title: 'Curated Resources', desc: 'Get articles and YouTube videos for every subtopic automatically.' },
        { icon: <Terminal className="w-6 h-6 text-blue-400" />, title: 'Online IDE', desc: 'Write and run code in 12 different languages in your browser.' },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-900 via-slate-900 to-black text-white">

            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-300 font-medium">AI-Powered Learning Platform</span>
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-bold leading-tight">
                        <span className="bg-linear-to-r from-blue-400 via-blue-300 to-white bg-clip-text text-transparent">
                            AI-Powered Roadmaps
                        </span>
                        <br />
                        <span className="text-slate-300">for Your Success</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Generate intelligent, personalized learning roadmaps powered by AI.
                        From beginner to expert, we chart your path to mastery.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to={isLoggedin ? '/roadmap/generate' : '/signin'}
                            className="px-8 py-4 bg-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
                            Get Started <ArrowRight className="h-5 w-5" />
                        </Link>
                        {isLoggedin && (
                            <Link to="/roadmaps"
                                className="px-8 py-4 border border-slate-600 rounded-xl font-semibold text-lg text-slate-200 hover:bg-slate-800 hover:border-blue-400 transition-all flex items-center justify-center gap-2">
                                My Roadmaps
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">Everything You Need to Learn</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map(f => (
                            <div key={f.title} className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-blue-500/50 transition-all">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">{f.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                                <p className="text-slate-400">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-3xl mx-auto text-center bg-slate-800/50 border border-blue-500/30 rounded-3xl p-12">
                    <h2 className="text-4xl font-bold mb-4">Ready to Start?</h2>
                    <p className="text-slate-300 mb-8">Join learners creating their perfect roadmaps with AI</p>
                    <Link to={isLoggedin ? '/roadmap/generate' : '/signin'}
                        className="inline-block px-10 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg">
                        Get Started Now
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}