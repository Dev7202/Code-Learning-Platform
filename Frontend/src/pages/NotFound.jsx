import { Link } from 'react-router-dom';
import { Code } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-900 via-slate-900 to-black text-white flex items-center justify-center px-4">
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Code className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold">CodeLearn</span>
                </div>
                <h1 className="text-7xl font-bold text-blue-500 mb-3">404</h1>
                <p className="text-xl font-semibold mb-2">Page Not Found</p>
                <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
                <Link to="/" className="px-6 py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block">
                    Go Home
                </Link>
            </div>
        </div>
    );
}