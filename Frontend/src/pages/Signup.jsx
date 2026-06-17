import { useState } from 'react';
import { Eye, EyeOff, Loader2, Code, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { signupUser, signinUser } from '../features/userSlicer';

// Small component to show each password requirement
function Req({ met, text }) {
    return (
        <div className="flex items-center gap-2">
            {met
                ? <Check className="h-4 w-4 text-emerald-500" />
                : <X className="h-4 w-4 text-red-400" />}
            <span className={`text-xs ${met ? 'text-emerald-400' : 'text-gray-400'}`}>{text}</span>
        </div>
    );
}

export default function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Check each password requirement
    const reqs = {
        length:    password.length >= 6,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number:    /[0-9]/.test(password),
        special:   /[\W_]/.test(password),
    };
    const isPasswordValid = Object.values(reqs).every(Boolean);

    const handleSubmit = async e => {
        e.preventDefault();
        if (!isPasswordValid) { toast.error('Password does not meet requirements'); return; }
        if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }

        setIsLoading(true);

        // Register
        let res = await dispatch(signupUser({ name, email, password }));
        res = res.payload;
        if (!res.success) { toast.error(res.message || 'Registration failed'); setIsLoading(false); return; }

        // Auto signin after register
        toast.success('Account created! Signing you in...');
        await dispatch(signinUser({ email, password }));
        navigate('/');
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-linear-to-tr from-slate-800 via-cyan-900 to-slate-600 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-950/50 border border-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6">

                    {/* Logo */}
                    <div className="text-center">
                        <div onClick={() => navigate('/')} className="flex cursor-pointer items-center justify-center gap-2 mb-4">
                            <div className="p-2 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg">
                                <Code className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-white">CodeLearn</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white">Create Account</h1>
                        <p className="text-sm text-gray-400 mt-1">Join developers learning today</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name */}
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-200 uppercase tracking-wide">Full Name</label>
                            <input type="text" placeholder="John Doe"
                                value={name} onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none text-sm"
                                required />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-200 uppercase tracking-wide">Email</label>
                            <input type="email" placeholder="you@example.com"
                                value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none text-sm"
                                required />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
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

                            {/* Password Requirements */}
                            {password.length > 0 && (
                                <div className="p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg space-y-2 mt-2">
                                    <Req met={reqs.length}    text="At least 6 characters" />
                                    <Req met={reqs.uppercase} text="One uppercase letter" />
                                    <Req met={reqs.lowercase} text="One lowercase letter" />
                                    <Req met={reqs.number}    text="One number" />
                                    <Req met={reqs.special}   text="One special character" />
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-200 uppercase tracking-wide">Confirm Password</label>
                            <input type="password" placeholder="••••••••"
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none text-sm"
                                required />
                        </div>

                        <button type="submit" disabled={!isPasswordValid || isLoading}
                            className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                            {isLoading
                                ? <div className="flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Creating Account</div>
                                : 'Create Account'}
                        </button>
                    </form>

                    <div className="text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/signin" className="text-white hover:text-blue-400 font-semibold transition-colors">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}