import { Code } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="border-t border-slate-700/50 py-10 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-bold">CodeLearn</span>
                </div>

                {/* Links */}
                <div className="flex gap-6 text-sm text-slate-400">
                    <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
                    <Link to="/roadmaps" className="hover:text-blue-400 transition-colors">Roadmaps</Link>
                    <Link to="/roadmap/generate" className="hover:text-blue-400 transition-colors">Generator</Link>
                </div>

                {/* Copyright */}
                <p className="text-slate-400 text-sm">© 2026 CodeLearn. All rights reserved.</p>
            </div>
        </footer>
    );
}