import { useState } from 'react';
import { Eye, EyeOff, Loader2, Code } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { forgotPassword, signinUser } from '../features/userSlicer';

export default function Signin() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);

        let res = await dispatch(signinUser({ email, password }));
        res = res.payload;

        if (!res.success) {
            toast.error(res.message || 'Signin failed');
            setIsLoading(false);
            return;
        }

        toast.success('Signin successful');
        navigate('/', { replace: true });
        setIsLoading(false);
    };

    const handleForgotPass = async e => {
        e.preventDefault();
        if (!email) { toast.error('Please enter your email first'); return; }
        setIsSending(true);
        let res = await dispatch(forgotPassword({ email }));
        res = res.payload;
        if (!res.success) toast.error(res.message || 'Failed to send reset link');
        else toast.success('Password reset link sent to your email');
        setIsSending(false);
    };

    return (
        <div className="min-h-screen bg-linear-to-tr from-slate-800 via-cyan-900 to-slate-600 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-950/50 border border-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-8">

                    {/* Logo */}
                    <div className="text-center space-y-3">
                        <div onClick={() => navigate('/')} className="flex cursor-pointer items-center justify-center gap-2 mb-6">
                            <div className="p-2 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg">
                                <Code className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-white">CodeLearn</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                        <p className="text-sm text-gray-400">Sign in to continue your coding journey</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-200 uppercase tracking-wide">Email</label>
                            <input type="email" placeholder="Enter your email"
                                value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none text-sm"
                                required />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-200 uppercase tracking-wide">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none pr-12 text-sm"
                                    required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <button onClick={handleForgotPass} type="button" disabled={isSending}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-50">
                            {isSending ? 'Sending...' : 'Forgot password?'}
                        </button>

                        <button type="submit" disabled={!email || !password || isLoading}
                            className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                            {isLoading
                                ? <div className="flex justify-center items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Signing In</div>
                                : 'Sign In'}
                        </button>
                    </form>

                    <div className="text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-white hover:text-blue-400 font-semibold transition-colors">Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}