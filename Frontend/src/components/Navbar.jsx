import { useState, useRef, useEffect } from 'react';
import { Code, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { logoutUser } from '../features/userSlicer';

export default function Navbar() {
    const { isLoggedin, username, avatar } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside it
    useEffect(() => {
        const handleClickOutside = e => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setDropdownOpen(false);
        await dispatch(logoutUser());
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-bold text-lg">CodeLearn</span>
                </Link>

                {/* Center Nav Links */}
                {isLoggedin && (
                    <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        <Link to="/roadmaps"
                            className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                            My Roadmaps
                        </Link>
                        <Link to="/roadmap/generate"
                            className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                            Generator
                        </Link>
                        <Link to="/ide"
                            className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                            IDE
                        </Link>
                    </div>
                )}

                {/* Right Side — Auth */}
                <div className="flex items-center gap-3 shrink-0">
                    {isLoggedin ? (
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setDropdownOpen(p => !p)}
                                className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden hover:border-blue-400/50 transition-colors">
                                {avatar
                                    ? <img src={avatar} alt="profile" className="w-full h-full object-cover" />
                                    : <User className="w-4.5 h-4.5 text-blue-300" />}
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden py-1">
                                    <div className="px-3.5 py-2.5 border-b border-slate-700">
                                        <p className="text-sm font-medium text-white truncate">{username}</p>
                                    </div>
                                    <Link to="/profile" onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                                        <User className="w-4 h-4" /> Profile
                                    </Link>
                                    <button onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
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

            {/* Mobile Nav Links — shown below navbar on small screens since center links are hidden */}
            {isLoggedin && (
                <div className="md:hidden flex items-center justify-center gap-6 pb-3 px-4 border-t border-slate-800/50 pt-2">
                    <Link to="/roadmaps" className="text-gray-300 hover:text-white text-xs font-medium transition-colors">
                        My Roadmaps
                    </Link>
                    <Link to="/roadmap/generate" className="text-gray-300 hover:text-white text-xs font-medium transition-colors">
                        Generator
                    </Link>
                    <Link to="/ide" className="text-gray-300 hover:text-white text-xs font-medium transition-colors">
                        IDE
                    </Link>
                </div>
            )}
        </nav>
    );
}