import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconMail, IconLock, IconUser, IconPhone, IconArrowRight, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onToggleMode }) {
    const { customerLogin, customerRegister } = useAuth();
    const { settings: siteSettings } = useSettings();
    const { mergeCart } = useCart();
    const { showNotification } = useNotification();
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: ''
    });

    // Lock scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            const style = document.createElement('style');
            style.id = 'auth-lock-style';
            style.innerHTML = `
              body, html { 
                overflow: hidden !important; 
                height: 100% !important;
              }
            `;
            document.head.appendChild(style);
        } else {
            const style = document.getElementById('auth-lock-style');
            if (style) style.remove();
        }
        return () => {
            const style = document.getElementById('auth-lock-style');
            if (style) style.remove();
        };
    }, [isOpen]);

    const validateForm = () => {
        if (!isLogin) {
            if (!/^[A-Za-z\s]{3,}$/.test(form.first_name.trim())) {
                setError('First name must be at least 3 characters and contain only letters.');
                return false;
            }
            if (!/^[A-Za-z\s]{1,}$/.test(form.last_name.trim())) {
                setError('Last name must contain at least 1 letter and contain only letters.');
                return false;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                setError('Please enter a valid email address.');
                return false;
            }
            if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
                setError('Please enter a valid 10-digit phone number.');
                return false;
            }
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
        if (!passwordRegex.test(form.password)) {
            setError('Password must be at least 6 characters and include a mix of letters, numbers, and special characters.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) return;
        
        setLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await customerLogin(form.email, form.password);
            } else {
                result = await customerRegister(form);
            }

            if (result.success) {
                if (result.needsVerification) {
                    showNotification("Please check your email and verify your identity to proceed.", "info", 5000);
                    setSuccess(true);
                } else {
                    showNotification(isLogin ? `Welcome back to ${siteSettings.site_name || 'MBW'}!` : "Account activated! You may now login.", "success");
                    if (isLogin) await mergeCart();
                    onClose();
                }
            } else {
                setError(result.error ? `${result.message}: ${result.error}` : result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden my-auto"
                >
                    {/* Header Image/Pattern */}
                    <div className="h-28 bg-brand-primary relative overflow-hidden flex items-center px-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary opacity-50"></div>
                        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <IconLock className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif text-white italic leading-tight">
                                    {success ? 'Welcome to your online garage!' : (isLogin ? 'Enter an online garage.' : 'Join an online shopping experience.')}
                                </h2>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                                    {success ? 'Registration Successful' : (isLogin ? 'secure login here' : 'Register here to explore.')}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={onClose}
                            className="absolute top-8 right-8 w-10 h-10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md border border-white/5"
                        >
                            <IconX size={20} />
                        </button>
                    </div>

                    <div className="p-10">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-500 text-xs font-bold rounded-2xl flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                {error}
                            </motion.div>
                        )}

                        {success ? (
                            <div className="text-center space-y-8 py-10">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
                                    <div className="relative w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border-4 border-white shadow-xl">
                                        <IconMail size={40} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-2xl font-bold text-slate-900">Verification Sent</h4>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                                        An authentication link has been dispatched to <span className="text-slate-900 font-bold">{form.email}</span>. Please verify to proceed.
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setSuccess(false); setIsLogin(true); }}
                                    className="w-full max-w-xs py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] tracking-widest uppercase hover:bg-brand-primary transition-all shadow-xl shadow-slate-900/10"
                                >
                                    Proceed to Login
                                </button>
                            </div>
                        ) : (
                            <>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {!isLogin && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">First Name <span className="text-rose-500">*</span></label>
                                                <div className="relative">
                                                    <IconUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Jane"
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white placeholder:opacity-20"
                                                        value={form.first_name}
                                                        onChange={e => setForm({ ...form, first_name: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Last Name <span className="text-rose-500">*</span></label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Doe"
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white placeholder:opacity-20"
                                                    value={form.last_name}
                                                    onChange={e => setForm({ ...form, last_name: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className={cn("space-y-2", isLogin ? "md:col-span-2" : "")}>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <IconMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="email"
                                                required
                                                placeholder="jane@example.com"
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white placeholder:opacity-20"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number <span className="text-rose-500">*</span></label>
                                            <div className="relative">
                                                <IconPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="9876543210"
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white placeholder:opacity-20"
                                                    value={form.phone}
                                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className={cn("space-y-2", isLogin ? "md:col-span-2" : "")}>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Secret Key (Password) <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <IconLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                placeholder="••••••••"
                                                className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white placeholder:opacity-20"
                                                value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-all z-10"
                                            >
                                                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group relative w-full py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all shadow-2xl shadow-brand-primary/20 disabled:opacity-50 overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {loading ? 'Initializing...' : (isLogin ? 'Access Garage' : 'Create Account')}
                                            {!loading && <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                                        </span>
                                    </button>

                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {isLogin ? "New to the community?" : "Already a member?"}
                                            <button
                                                type="button"
                                                onClick={() => setIsLogin(!isLogin)}
                                                className="ml-2 text-brand-primary hover:underline"
                                            >
                                                {isLogin ? 'Join Now' : 'Sign In'}
                                            </button>
                                        </p>
                                        <button 
                                            type="button"
                                            onClick={onClose}
                                            className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors"
                                        >
                                            Continue as Guest
                                        </button>
                                    </div>
                                </div>
                            </form>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
