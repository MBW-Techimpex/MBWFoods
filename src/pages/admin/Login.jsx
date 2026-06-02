import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconLock, IconUser, IconCar, IconEye, IconEyeOff, IconShieldCheck, IconCpu } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getImageUrl } from '../../utils/imageHelper';
import BackgroundImage from '../../assets/AdminBg.png';
import API_BASE from '../../config';

const AdminLogin = () => {
    const [view, setView] = useState('login'); // 'login', 'forgot', 'reset'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [maintainSession, setMaintainSession] = useState(false);
    const { login, admin } = useAuth();
    const { settings, loading: settingsLoading } = useSettings();
    const navigate = useNavigate();

    // Check for token in URL (e.g. /admin/login?token=...)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const resetToken = params.get('token');
        if (resetToken) {
            setToken(resetToken);
            setView('reset');
        }
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (admin) {
            navigate('/admin');
        }
    }, [admin, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login(username, password);
            if (result.success) {
                navigate('/admin');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Could not connect to secure authentication server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage(data.message);
            } else {
                setError(data.message || 'Request failed');
            }
        } catch (err) {
            setError('Could not connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError('Password must be at least 6 characters and include a mix of letters, numbers, and special characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Password reset successfully! Please login.');
                setTimeout(() => setView('login'), 3000);
            } else {
                setError(data.message || 'Reset failed');
            }
        } catch (err) {
            setError('Could not connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0614] flex items-center justify-center p-6 selection:bg-brand-accent selection:text-white relative overflow-hidden">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <img
                    src={BackgroundImage}
                    alt="Background"
                    className="w-full h-full object-cover opacity-100 scale-105 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0614] via-[#0a0614]/80 to-[#0a0614]/40" />
            </div>

            {/* Ambient Blobs */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[150px] [animation-delay:2s]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-xl relative z-10"
            >
                {/* Header Branding */}
                <div className="text-center mb-10">
                    <AnimatePresence mode="wait">
                        {settingsLoading ? (
                            <motion.div
                                key="loading-branding"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-24 h-24 bg-white/5 rounded-3xl animate-pulse mb-6" />
                                <div className="w-48 h-10 bg-white/5 rounded-xl animate-pulse mb-2" />
                                <div className="w-32 h-3 bg-white/5 rounded-full animate-pulse" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="dynamic-branding"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="inline-block relative"
                                >
                                    <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-4 mb-6 relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {settings?.site_logo ? (
                                            <img 
                                                src={getImageUrl(settings.site_logo)} 
                                                alt="Logo" 
                                                className="w-full h-full object-contain relative z-10" 
                                            />
                                        ) : (
                                            <span className="text-3xl font-black text-brand-primary relative z-10 tracking-tighter">
                                                {settings?.site_name?.substring(0, 3).toUpperCase() || 'MBW'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                        <IconShieldCheck size={18} className="text-white" />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-2 tracking-tight">
                                        {settings?.site_name || 'MBW'} <span className="italic text-brand-accent">Control</span>
                                    </h1>

                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Login Card */}
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative transition-all duration-500">
                    <div className="absolute top-0 right-10 -translate-y-1/2 flex gap-2">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                {view === 'login' ? 'Server Status: Online' : view === 'forgot' ? 'Recovery Mode Active' : 'Reset Mode Active'}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={view === 'login' ? handleLogin : view === 'forgot' ? handleForgot : handleReset} className="space-y-8">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs flex items-center gap-3 overflow-hidden"
                                >
                                    <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">!</div>
                                    {error}
                                </motion.div>
                            )}
                            {successMessage && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs flex items-center gap-3 overflow-hidden break-all"
                                >
                                    <IconShieldCheck size={18} className="shrink-0" />
                                    {successMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {view === 'login' ? (
                            <>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator Identifier</label>
                                        <IconUser size={14} className="text-slate-600" />
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="block w-full px-6 py-4 bg-white/[0.05] border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all outline-none text-sm placeholder:text-slate-600"
                                            placeholder="Enter your security ID"
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Passcode</label>
                                        <IconLock size={14} className="text-slate-600" />
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full px-6 py-4 bg-white/[0.05] border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all outline-none text-sm placeholder:text-slate-600"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                        </button>
                                        <div className="absolute inset-0 rounded-2xl bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                                        <div className="relative w-5 h-5">
                                            <input 
                                                type="checkbox" 
                                                checked={maintainSession}
                                                onChange={() => setMaintainSession(!maintainSession)}
                                                className="peer sr-only" 
                                            />
                                            <div className="w-full h-full bg-white/5 border border-white/10 rounded-md peer-checked:bg-brand-accent peer-checked:border-brand-accent peer-focus-visible:ring-2 peer-focus-visible:ring-brand-accent/50 transition-all" />
                                            <svg className={`absolute inset-0 m-auto w-3 h-3 text-white transition-all ${maintainSession ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-wider">Maintain Session</span>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => { setView('forgot'); setError(''); setSuccessMessage(''); }}
                                        className="text-[11px] font-black text-brand-accent/60 hover:text-brand-accent uppercase tracking-widest transition-all"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </>
                        ) : view === 'forgot' ? (
                            <>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator Email</label>
                                        <IconUser size={14} className="text-slate-600" />
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full px-6 py-4 bg-white/[0.05] border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all outline-none text-sm"
                                            placeholder="admin@mbw-accessories.com"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 ml-1">We'll send a secure reset link if an account exists.</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => { setView('login'); setError(''); setSuccessMessage(''); }}
                                    className="text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all"
                                >
                                    Back to Login
                                </button>
                            </>
                        ) : (
                            <div className="space-y-5">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New System Passcode</label>
                                        <IconLock size={14} className="text-slate-600" />
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="block w-full px-6 py-4 bg-white/[0.05] border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all outline-none text-sm"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                        </button>
                                        <div className="absolute inset-0 rounded-2xl bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New Passcode</label>
                                        <IconLock size={14} className="text-slate-600" />
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="block w-full px-6 py-4 bg-white/[0.05] border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all outline-none text-sm"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                        </button>
                                        <div className="absolute inset-0 rounded-2xl bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-brand-primary text-white font-black text-[11px] tracking-[0.3em] uppercase rounded-2xl shadow-2xl hover:bg-brand-accent transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-accent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            <span className="relative z-10 flex items-center gap-3">
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{view === 'login' ? 'Initialize Dashboard' : view === 'forgot' ? 'Request Recovery link' : 'Save New Passcode'}</span>
                                        <IconCpu size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </div>

                {/* Removed Footer per user request */}
            </motion.div>
        </div>
    );
};

export default AdminLogin;



