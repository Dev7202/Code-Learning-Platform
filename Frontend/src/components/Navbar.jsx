import { Code } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { logoutUser } from '../features/userSlicer';

export default function Navbar() {
    const { isLoggedin, username } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logoutUser());
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-bold text-lg">CodeLearn</span>
                </Link>

                {/* Links + Auth Buttons */}
                <div className="flex items-center gap-4">
                    {isLoggedin ? (
                        <>
                            <Link to="/roadmaps"
                                className="text-gray-300 hover:text-white text-sm transition-colors">
                                My Roadmaps
                            </Link>
                            <Link to="/roadmap/generate"
                                className="text-gray-300 hover:text-white text-sm transition-colors">
                                Generator
                            </Link>
                            <Link to="/profile"
                                className="text-gray-300 hover:text-white text-sm transition-colors">
                                Hi, {username} 
                            </Link>
                            <button onClick={handleLogout}
                                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg hover:border-red-300/50 transition-colors">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signin"
                                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                                Sign In
                            </Link>
                            <Link to="/signup"
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}