import { useState, useEffect } from 'react';
import { Loader2, Shield, Eye, EyeOff, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyResetToken, resetPassword } from '../features/userSlicer';

export default function ResetPassword() {
    const [status, setStatus] = useState('loading'); // loading → verified → error
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // On page load → get token from URL and verify it
    useEffect(() => {
        const verify = async () => {
            const params = new URLSearchParams(window.location.search);
            const t = params.get('token');
            if (!t) { setStatus('error'); toast.error('Invalid reset link'); return; }
            setToken(t);

            let res = await dispatch(verifyResetToken({ token: t }));
            res = res.payload;
            if (res?.success) {
                setStatus('verified');
                toast.success('Link verified. Enter your new password.');
            } else {
                setStatus('error');
                toast.error(res?.message || 'Link expired');
            }
        };
        verify();
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }

        setIsLoading(true);
        let res = await dispatch(resetPassword({ token, newPassword: password }));
        res = res.payload;

        if (!res.success) { toast.error(res.message || 'Reset failed'); setIsLoading(false); return; }

        toast.success('Password reset successfully!');
        setTimeout(() => navigate('/signin', { replace: true }), 1000);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-linear-to-tr from-slate-800 via-cyan-900 to-slate-600 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-950/50 border border-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6">

                    {/* Logo */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="p-2 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-white">CodeLearn</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white">Reset Password</h1>
                    </div>

                    {/* Loading State */}
                    {status === 'loading' && (
                        <div className="flex items-center justify-center gap-3 py-8">
                            <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
                            <span className="text-gray-300">Verifying reset link...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <XCircle className="h-12 w-12 text-red-400" />
                            <p className="text-red-400 font-semibold">Link is invalid or expired</p>
                            <button onClick={() => navigate('/signin')}
                                className="px-6 py-2 bg-white text-black rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">
                                Back to Sign In
                            </button>
                        </div>
                    )}

                    {/* Form — only shows when token is verified */}
                    {status === 'verified' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-gray-200 uppercase tracking-wide">New Password</label>
                                <div className="relative">
                                    <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
                                        value={password} onChange={e => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none pr-12 text-sm"
                                        required />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-gray-200 uppercase tracking-wide">Confirm Password</label>
                                <input type="password" placeholder="••••••••"
                                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none text-sm"
                                    required />
                            </div>

                            <button type="submit" disabled={isLoading}
                                className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 text-sm">
                                {isLoading
                                    ? <div className="flex justify-center items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Resetting...</div>
                                    : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}