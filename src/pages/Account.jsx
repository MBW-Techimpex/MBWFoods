import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, AreaChart, Area } from 'recharts';
import API_BASE from '../config';
import { generateInvoice } from '../utils/invoiceGenerator';
import { getImageUrl } from '../utils/imageHelper';
import {
  IconCheck,
  IconPackage,
  IconTruck,
  IconX,
  IconFileInvoice,
  IconCalendar,
  IconShoppingBag,
  IconUser,
  IconHeart,
  IconPhone,
  IconMapPin,
  IconStar,
  IconStarFilled,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconArrowRight,
  IconPencil,
  IconPlayerPause,
  IconLayoutDashboard,
  IconSettings,
  IconLogout
} from '@tabler/icons-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import AuthModal from '../components/AuthModal';
import Modal from '../components/ui/Modal';

export default function Account() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { settings, formatPrice } = useSettings();
  const {
    cartItems,
    wishlistItems,
    orders: contextOrders,
    addToCart,
    removeFromWishlist,
    mergeCart,
    fetchOrders,
    clearAll
  } = useCart();
  const { customer, customerLogout, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();

  const [activeSegment, setActiveSegment] = useState('dashboard');
  const [showLandmarkModel, setShowLandmarkModel] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [subscriptionPage, setSubscriptionPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Chart Data
  const orderCount = contextOrders.length || 0;
  const orderData = [
    { name: 'Delivered', value: contextOrders.filter(o => o.status?.toLowerCase() === 'delivered').length || 0 },
    { name: 'Active', value: contextOrders.filter(o => o.status?.toLowerCase() !== 'delivered').length || 0 },
  ];

  const wishlistCount = wishlistItems.length || 0;
  const wishlistData = wishlistCount > 0 ? [
    { day: 'M', val: 2 },
    { day: 'T', val: 4 },
    { day: 'W', val: 3 },
    { day: 'T', val: wishlistCount },
    { day: 'F', val: wishlistCount + 1 },
  ] : [];

  const cartCount = cartItems.length || 0;
  const cartData = cartCount > 0 ? [
    { time: 'Morning', items: 0 },
    { time: 'Afternoon', items: Math.max(0, cartCount - 1) },
    { time: 'Now', items: cartCount },
  ] : [];

  const CHART_COLORS = [settings.theme_color || '#7c3aed', '#f1f5f9'];
  const SECONDARY_COLOR = settings.secondary_color || '#a78bfa';
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleOpenReview = async (item) => {
    setReviewingItem(item);
    setReviewForm({ rating: 5, comment: '' });

    // Check for existing review
    try {
      const pId = item.product_id || item.id;
      const res = await fetch(`${API_BASE}/api/reviews/product/${pId}`, { credentials: 'include' });
      if (res.ok) {
        const reviews = await res.json();
        const myReview = reviews.find(r => r.customer_id === effectiveCustomer?.id);
        if (myReview) {
          setReviewForm({ rating: myReview.rating, comment: myReview.comment });
        }
      }
    } catch (err) {
      console.error("Error checking existing review:", err);
    }

    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.comment.trim()) {
      showNotification("Please provide a comment for your review.", "error");
      return;
    }
    setReviewSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          product_id: reviewingItem.product_id || reviewingItem.id,
          customer_name: `${effectiveCustomer.first_name} ${effectiveCustomer.last_name}`,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      if (res.ok) {
        showNotification("Success! Your review has been submitted.", "success");
        setReviewModalOpen(false);
      } else {
        const err = await res.json();
        showNotification(err.message || "Failed to submit review.", "error");
      }
    } catch (err) {
      console.error("Review submission error:", err);
      showNotification("Connection error. Please try again.", "error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const [addresses, setAddresses] = useState([]);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const location = useLocation();
  const guestState = location.state?.guestMode ? {
    first_name: location.state.customerName?.split(' ')[0] || '',
    last_name: location.state.customerName?.split(' ').slice(1).join(' ') || '',
    email: location.state.customerEmail || '',
    isGuest: true
  } : null;

  const effectiveCustomer = customer || guestState;

  useEffect(() => {
    if (effectiveCustomer) {
      setProfileForm({
        first_name: effectiveCustomer.first_name || '',
        last_name: effectiveCustomer.last_name || '',
        email: effectiveCustomer.email || '',
        phone: effectiveCustomer.phone || ''
      });
      if (customer) {
        fetchAddresses();
        fetchOrders();
      }
    }
  }, [customer, location.state]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (effectiveCustomer?.isGuest) {
      showNotification("Registry Note: Guest profiles cannot be modified in the archive. Please register to preserve your details permanently.", "info");
      return;
    }
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE}/api/customers/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setProfileMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/addresses?t=${Date.now()}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setAddresses(data);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  const [newAddress, setNewAddress] = useState({
    title: '',
    name: '',
    street: '',
    suite: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    is_default: false
  });

  const handleSaveAddress = async () => {
    if (!newAddress.street) {
      const siteName = settings.site_name || 'MBW';
      showNotification(`${siteName} Note: A street address is required for delivery.`, "warning");
      return;
    }
    const finalTitle = newAddress.title.trim() || "Home";
    try {
      const url = editingAddressId
        ? `${API_BASE}/api/addresses/${editingAddressId}`
        : `${API_BASE}/api/addresses`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newAddress,
          title: finalTitle,
          first_name: (newAddress.name || '').split(' ')[0],
          last_name: (newAddress.name || '').split(' ').slice(1).join(' ')
        })
      });
      if (res.ok) {
        await fetchAddresses();
        setShowLandmarkModel(false);
        setEditingAddressId(null);
        setNewAddress({ title: '', name: '', street: '', suite: '', city: '', state: '', zip: '', phone: '', is_default: false });
        showNotification(editingAddressId ? "Address updated successfully!" : "New address saved successfully!", "success");
      } else {
        const err = await res.json();
        showNotification(err.error || err.message || 'Registry Interruption: Could not preserve this address.', "error");
      }
    } catch (err) {
      console.error("Error saving address:", err);
      showNotification('Archive Connection Failure: Could not reach the address vault.', "error");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/addresses/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        await fetchAddresses();
      } else {
        showNotification('Archive Interruption: Could not remove this address.', "error");
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      showNotification('Archive Connection Failure.', "error");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_default: true })
      });
      if (res.ok) {
        await fetchAddresses();
        showNotification("Preferred address set!", "success");
      } else {
        showNotification("Archive Interruption: Could not update preferences.", "error");
      }
    } catch (err) {
      console.error("Error setting default address:", err);
      showNotification('Archive Connection Failure.', "error");
    }
  };

  const handleSignOut = async () => {
    clearAll(); // Wipe cart and wishlist
    await customerLogout();
    window.location.href = '/';
  };

  const handleEditAddress = (addr) => {
    setNewAddress({
      title: addr.title || '',
      name: `${addr.first_name || ''} ${addr.last_name || ''}`.trim(),
      street: addr.street || '',
      suite: addr.suite || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || '',
      phone: addr.phone || '',
      is_default: addr.is_default || false
    });
    setEditingAddressId(addr.id);
    setShowLandmarkModel(true);
  };

  const [customerView, setCustomerView] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const isLogin = customerView === 'login';
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const { customerRegister, customerLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!isLogin) {
      if (!/^[A-Za-z\s]{3,}$/.test(registerForm.first_name.trim())) {
        setRegisterError('First name must be at least 3 characters and contain only letters.');
        return false;
      }
      if (!/^[A-Za-z\s]{1,}$/.test(registerForm.last_name.trim())) {
        setRegisterError('Last name must contain at least 1 letter and contain only letters.');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
        setRegisterError('Please enter a valid email address.');
        return false;
      }
      if (!/^\d{10}$/.test(registerForm.phone.replace(/\D/g, ''))) {
        setRegisterError('Please enter a valid 10-digit phone number.');
        return false;
      }
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(registerForm.password)) {
      setRegisterError('Password must be at least 6 characters and include a mix of letters, numbers, and special characters.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (!validateForm()) return;

    setRegisterLoading(true);
    try {
      const res = await customerRegister(registerForm);
      if (res.success) {
        if (res.needsVerification) {
          showNotification("Please check your email and verify your identity to proceed.", "info", 5000);
          setRegisterSuccess('Identity verification dispatched. Please check your inbox for the activation link.');
        }
      } else {
        setRegisterError(res.error ? `${res.message}: ${res.error}` : res.message);
      }
    } catch (err) {
      setRegisterError('Registry connection failure.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!validateForm()) return;

    setRegisterLoading(true);
    try {
      const res = await customerLogin(registerForm.email, registerForm.password);
      if (!res.success) {
        setRegisterError(res.message);
      }
    } catch (err) {
      setRegisterError('Vault access failure.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    if (!forgotEmail) {
      setRegisterError('Email address is required');
      return;
    }
    setRegisterLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/customer/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setRegisterSuccess('A password recovery link has been dispatched to your email address.');
      } else {
        setRegisterError(data.message || 'Forgot request failed');
      }
    } catch (err) {
      setRegisterError('Could not connect to server');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleCustomerReset = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      setRegisterError('Password must be at least 6 characters and include a mix of letters, numbers, and special characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    setRegisterLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/customer/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setRegisterSuccess('Password reset successfully! Please login.');
        setTimeout(() => {
          setRegisterSuccess('');
          setCustomerView('login');
        }, 3000);
      } else {
        setRegisterError(data.message || 'Reset failed');
      }
    } catch (err) {
      setRegisterError('Could not connect to server');
    } finally {
      setRegisterLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      const siteName = settings.site_name || 'MBW';
      showNotification(`${siteName} Account Verified! You may now enter your garage.`, "success", 5000);
      setCustomerView('login');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const tokenParam = params.get('token');
      if (tokenParam) {
        setResetToken(tokenParam);
        setCustomerView('reset');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [settings]);

  useEffect(() => {
    if (showLandmarkModel || reviewModalOpen || isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showLandmarkModel, reviewModalOpen, isAuthModalOpen]);

  if (!effectiveCustomer && !authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 overflow-x-hidden">
        <Header isScrolled={isScrolled} activePage="account" />
        <div className="container mx-auto px-6 py-24 flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Header section similar to AuthModal */}
            <div className="h-28 bg-brand-primary relative overflow-hidden flex items-center px-10">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary opacity-50"></div>
              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

              <div className="relative z-10 flex items-center gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                  <IconLock className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-serif text-white italic leading-tight">
                    {registerSuccess
                      ? 'Welcome to your online garage!'
                      : (customerView === 'forgot'
                        ? 'Recover your passcode.'
                        : (customerView === 'reset'
                          ? 'Establish a new passcode.'
                          : (isLogin ? 'Enter an online garage.' : 'Join an online shopping experience.')))}
                  </h1>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                    {registerSuccess
                      ? 'Registration Successful'
                      : (customerView === 'forgot'
                        ? 'passcode recovery'
                        : (customerView === 'reset'
                          ? 'passcode modification'
                          : (isLogin ? 'secure login here' : 'Register here to explore.')))}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-12">
              {registerError && (
                <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-500 text-xs font-bold rounded-2xl flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  {registerError}
                </div>
              )}

              {registerSuccess ? (
                <div className="text-center space-y-8 py-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
                    <div className="relative w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border-4 border-white shadow-xl">
                      <IconMail size={40} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verification Sent</h4>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                      An activation link has been dispatched to <span className="text-slate-900 dark:text-slate-100 font-bold">{registerForm.email}</span>. Please verify your identity to proceed.
                    </p>
                  </div>
                  <button
                    onClick={() => { setRegisterSuccess(''); setCustomerView('login'); }}
                    className="w-full max-w-xs py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] tracking-widest uppercase hover:bg-brand-primary transition-all shadow-xl shadow-slate-900/10"
                  >
                    Proceed to Login
                  </button>
                </div>
              ) : (
                <>
                  {customerView === 'forgot' ? (
                    <form onSubmit={handleForgot} className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <IconMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input
                            type="email"
                            required
                            placeholder="jane@example.com"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
                            value={forgotEmail}
                            onChange={e => setForgotEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-6 pt-4">
                        <button
                          type="submit"
                          disabled={registerLoading}
                          className="group relative w-full py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all shadow-2xl shadow-brand-primary/20 disabled:opacity-50 overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {registerLoading ? 'Sending...' : 'Request Reset Link'}
                            {!registerLoading && <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                          </span>
                        </button>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Remembered your passcode?
                            <button
                              type="button"
                              onClick={() => { setRegisterError(''); setCustomerView('login'); }}
                              className="ml-2 text-brand-primary hover:underline"
                            >
                              Sign In
                            </button>
                          </p>
                          <Link
                            to="/"
                            className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors"
                          >
                            Return to Showroom
                          </Link>
                        </div>
                      </div>
                    </form>
                  ) : customerView === 'reset' ? (
                    <form onSubmit={handleCustomerReset} className="space-y-8">
                      <div className="grid grid-cols-1 gap-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New Password <span className="text-rose-500">*</span></label>
                          <div className="relative">
                            <IconLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="••••••••"
                              className="w-full pl-14 pr-14 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:opacity-20"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
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

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm New Password <span className="text-rose-500">*</span></label>
                          <div className="relative">
                            <IconLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              placeholder="••••••••"
                              className="w-full pl-14 pr-14 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:opacity-20"
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-all z-10"
                            >
                              {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 pt-4">
                        <button
                          type="submit"
                          disabled={registerLoading}
                          className="group relative w-full py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all shadow-2xl shadow-brand-primary/20 disabled:opacity-50 overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {registerLoading ? 'Resetting...' : 'Reset Password'}
                            {!registerLoading && <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                          </span>
                        </button>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Back to safety?
                            <button
                              type="button"
                              onClick={() => { setRegisterError(''); setCustomerView('login'); }}
                              className="ml-2 text-brand-primary hover:underline"
                            >
                              Sign In
                            </button>
                          </p>
                          <Link
                            to="/"
                            className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors"
                          >
                            Return to Showroom
                          </Link>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-8">
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
                                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:opacity-20"
                                  value={registerForm.first_name}
                                  onChange={e => setRegisterForm({ ...registerForm, first_name: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Last Name <span className="text-rose-500">*</span></label>
                              <input
                                type="text"
                                required
                                placeholder="Doe"
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:opacity-20"
                                value={registerForm.last_name}
                                onChange={e => setRegisterForm({ ...registerForm, last_name: e.target.value })}
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
                              className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
                              value={registerForm.email}
                              onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
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
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
                                value={registerForm.phone}
                                onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                              />
                            </div>
                          </div>
                        )}

                        <div className={cn("space-y-2", isLogin ? "md:col-span-2" : "")}>
                          <div className="flex justify-between items-center pl-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key (Password) <span className="text-rose-500">*</span></label>
                            {isLogin && (
                              <button
                                type="button"
                                onClick={() => { setRegisterError(''); setCustomerView('forgot'); }}
                                className="text-[10px] font-black text-brand-primary hover:underline uppercase tracking-wider"
                              >
                                Forgot Passcode?
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <IconLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="••••••••"
                              className="w-full pl-14 pr-14 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:opacity-20"
                              value={registerForm.password}
                              onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
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
                          disabled={registerLoading}
                          className="group relative w-full py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all shadow-2xl shadow-brand-primary/20 disabled:opacity-50 overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {registerLoading ? 'Initializing...' : (isLogin ? 'Access Garage' : 'Create Account')}
                            {!registerLoading && <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                          </span>
                        </button>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {isLogin ? "New to the community?" : "Already a member?"}
                            <button
                              type="button"
                              onClick={() => setCustomerView(isLogin ? 'register' : 'login')}
                              className="ml-2 text-brand-primary hover:underline"
                            >
                              {isLogin ? 'Join Now' : 'Sign In'}
                            </button>
                          </p>
                          <Link
                            to="/"
                            className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors"
                          >
                            Return to Showroom
                          </Link>
                        </div>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 transition-colors"><div className="w-12 h-12 border-4 border-slate-100 dark:border-slate-800 border-t-brand-primary rounded-full animate-spin"></div></div>;
  // Member Content (Original with dynamic data)
  const user = {
    firstName: effectiveCustomer.first_name || "Member",
    lastName: effectiveCustomer.last_name || "",
    email: effectiveCustomer.email,
    memberSince: effectiveCustomer.isGuest ? "Guest Access" : "Established 2025",
    // avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    loyaltyPoints: 0,
    tier: effectiveCustomer.isGuest ? "Guest Entry" : "Elite Member"
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
    { id: 'orders', label: 'Order History', icon: IconPackage },
    { id: 'subscriptions', label: 'My Subscriptions', icon: IconCalendar },
    { id: 'wishlist', label: 'My Favorites', icon: IconHeart },
    { id: 'addresses', label: 'Addresses', icon: IconMapPin },
    { id: 'settings', label: 'Account Settings', icon: IconSettings },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "placed": return "bg-blue-50 text-blue-600 border-blue-100";
      case "confirmed": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "packed": return "bg-amber-50 text-amber-600 border-amber-100";
      case "shipped": return "bg-violet-50 text-violet-600 border-violet-100";
      case "delivered": return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20";
      case "cancelled": return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20";
      default: return "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors dark:text-slate-200">
      <Header isScrolled={isScrolled} activePage="account" />

      {/* ── Dashboard Hero ── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-20 pb-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* <div className="relative group">
              <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-2xl group-hover:bg-brand-primary/30 transition-all"></div>
              <img src={user.avatar} className="w-24 md:w-32 h-24 md:h-32 rounded-full object-cover border-4 border-white shadow-2xl relative z-10" alt="Profile" />
              <button className="absolute bottom-1 right-1 w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl z-20 hover:scale-110 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
            </div> */}
            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <h1 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-slate-100 leading-tight">Welcome, <span className="italic font-light text-brand-primary">{user.firstName}</span></h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Account Management Grid ── */}
      <main className="container mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col xl:flex-row gap-12">

          {/* 1. Universal Navigation (Sidebar/TopNav) */}
          <aside className="w-full xl:w-72">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden sticky top-32">
              <nav className="flex flex-row xl:flex-col overflow-x-auto no-scrollbar">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSegment(item.id)}
                    className={`flex-grow xl:flex-initial flex items-center gap-4 px-8 py-5 transition-all text-sm font-bold whitespace-nowrap border-b-4 xl:border-b-0 xl:border-l-4 ${activeSegment === item.id ? 'bg-[#fff8e1]/65 dark:bg-brand-primary/10 text-brand-primary border-brand-primary' : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <item.icon size={20} className={`transition-colors ${activeSegment === item.id ? 'text-brand-primary' : 'text-slate-350 dark:text-slate-600'}`} />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-4 px-8 py-5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all text-sm font-bold whitespace-nowrap border-l-4 border-transparent w-full text-left"
                >
                  <IconLogout size={20} className="text-rose-500" />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* 2. Content Segments */}
          <div className="flex-grow">

            {activeSegment === 'dashboard' && (
              <div className="space-y-10 animate-fadeIn">
                {effectiveCustomer.isGuest && (
                  <div className="bg-brand-primary/5 border border-brand-primary/10 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-brand-primary shadow-sm shrink-0">
                      <IconUser size={24} />
                    </div>
                    <div className="flex-grow text-center sm:text-left space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Guest Access Archive</h4>
                      <p className="text-xs text-slate-500 font-medium">You are currently viewing a temporary guest archive. To preserve your order history and manage addresses, please register for a permanent identity.</p>
                    </div>
                    <button
                      onClick={() => window.location.href = '/account'}
                      className="px-6 py-3 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-accent transition-all shadow-lg shadow-brand-primary/20 shrink-0"
                    >
                      Register Now
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Order History Card */}
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Order History</p>
                    <div className="text-4xl font-serif text-slate-900 dark:text-slate-100 mb-6">{contextOrders.length} <span className="text-sm font-sans font-bold text-slate-300 uppercase tracking-tighter">Items Ordered</span></div>

                    <div className="flex-grow flex items-center justify-center min-h-[160px] mb-6">
                      {orderCount > 0 ? (
                        <ResponsiveContainer width="100%" height={160}>
                          <PieChart>
                            <Pie
                              data={orderData.map(d => d.value === 0 ? { ...d, value: 0.1 } : d)}
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {orderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center space-y-2 opacity-20">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                            <IconPackage size={32} />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest">No Activity</p>
                        </div>
                      )}
                    </div>

                    <button onClick={() => setActiveSegment('orders')} className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-2 mt-auto">
                      View all orders
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </button>
                  </div>

                  {/* Wishlist Card - BAR CHART */}
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Wishlist</p>
                    <div className="text-4xl font-serif text-slate-900 dark:text-slate-100 mb-6">{wishlistItems.length} <span className="text-sm font-sans font-bold text-slate-300 uppercase tracking-tighter">Favorites</span></div>

                    <div className="flex-grow flex items-center justify-center min-h-[160px] mb-6">
                      {wishlistCount > 0 ? (
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={wishlistData}>
                            <Bar
                              dataKey="val"
                              fill={settings.theme_color || '#7c3aed'}
                              radius={[4, 4, 0, 0]}
                              barSize={20}
                            />
                            <Tooltip
                              cursor={{ fill: 'transparent' }}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px' }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center space-y-2 opacity-20">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                            <IconHeart size={32} />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest">Empty Wishlist</p>
                        </div>
                      )}
                    </div>

                    <button onClick={() => setActiveSegment('wishlist')} className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-2 mt-auto">
                      Browse favorites
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </button>
                  </div>

                  {/* Active Cart Card - AREA CHART */}
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Active Cart</p>
                    <div className="text-4xl font-serif text-slate-900 dark:text-slate-100 mb-6">{cartItems.length} <span className="text-sm font-sans font-bold text-slate-300 uppercase tracking-tighter">Items Pending</span></div>

                    <div className="flex-grow flex items-center justify-center min-h-[160px] mb-6">
                      {cartCount > 0 ? (
                        <ResponsiveContainer width="100%" height={160}>
                          <AreaChart data={cartData}>
                            <defs>
                              <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={settings.theme_color || '#7c3aed'} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={settings.theme_color || '#7c3aed'} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="items"
                              stroke={settings.theme_color || '#7c3aed'}
                              fillOpacity={1}
                              fill="url(#colorItems)"
                              strokeWidth={3}
                            />
                            <Tooltip
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center space-y-2 opacity-20">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                            <IconShoppingBag size={32} />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest">Cart Empty</p>
                        </div>
                      )}
                    </div>

                    <Link to="/" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-2 mt-auto">
                      Continue shopping
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </Link>
                  </div>
                </div>

              </div>
            )}

            {activeSegment === 'orders' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 tracking-tight">Order Registry</h2>
                  <p className="text-xs font-bold text-slate-400">Showing {contextOrders.length} recent fulfillments</p>
                </div>

                {contextOrders.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-20 rounded-[2.5rem] text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <p className="text-xl font-serif italic text-slate-400">No order history found yet.</p>
                    <Link to="/" className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-widest">Begin Exploring ›</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Floating Header */}
                    <div className="hidden md:grid grid-cols-12 px-10 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                      <div className="col-span-4">Product Details</div>
                      <div className="col-span-2">Order ID</div>
                      <div className="col-span-2">Purchase Date</div>
                      <div className="col-span-2">Total Amount</div>
                      <div className="col-span-2 text-center">Actions</div>
                    </div>

                    <div className="space-y-3">
                      {(() => {
                        const ordersPerPage = 3;
                        const totalOrderPages = Math.ceil(contextOrders.length / ordersPerPage);
                        const paginatedOrders = contextOrders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage);

                        return (
                          <>
                            {paginatedOrders.map(order => (
                              <div key={order.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-4 md:p-6 transition-all hover:shadow-xl hover:shadow-brand-primary/5 group relative">
                                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">

                                  {/* Product Info */}
                                  <div className="md:col-span-4 flex items-center gap-6">
                                    <div className="w-16 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                      {order.fullItems && order.fullItems[0] ? (
                                        <img src={getImageUrl(order.fullItems[0].image)} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                          <IconShoppingBag size={24} />
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-serif font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-primary transition-colors">{order.fullItems?.[0]?.name || 'Premium Accessory'}</p>
                                      <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                        getStatusColor(order.status)
                                      )}>
                                        <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                                        {order.status}
                                      </div>
                                    </div>
                                  </div>

                                  {/* ID */}
                                  <div className="md:col-span-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 md:hidden">Order ID</p>
                                    <span className="text-[11px] font-mono font-medium text-slate-400">#{String(order.id).padStart(3, '0').toUpperCase()}</span>
                                  </div>

                                  {/* Date */}
                                  <div className="md:col-span-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 md:hidden">Purchase Date</p>
                                    <p className="text-[11px] font-medium text-slate-600">{order.date}</p>
                                  </div>

                                  {/* Valuation */}
                                  <div className="md:col-span-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 md:hidden">Total Amount</p>
                                    <p className="text-lg font-sans font-bold text-brand-primary tracking-tighter">{order.total}</p>
                                  </div>

                                  {/* Actions */}
                                  <div className="md:col-span-2 flex justify-center md:justify-end gap-3">
                                    <button
                                      onClick={() => setSelectedOrder(order)}
                                      className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:shadow-lg transition-all active:scale-90"
                                      title="View Details"
                                    >
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (order.fullItems && order.fullItems[0]) {
                                          handleOpenReview(order.fullItems[0]);
                                        } else {
                                          showNotification("No items to review.", "info");
                                        }
                                      }}
                                      disabled={order.status?.toLowerCase() !== 'delivered'}
                                      className={cn(
                                        "flex-grow md:flex-initial px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95",
                                        order.status?.toLowerCase() === 'delivered'
                                          ? "bg-brand-primary text-white hover:bg-brand-accent shadow-brand-primary/10"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                                      )}
                                    >
                                      {order.status?.toLowerCase() === 'delivered' ? 'Review' : 'Review'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {totalOrderPages > 1 && (
                              <div className="flex justify-center items-center gap-4 mt-8 pt-4">
                                <button
                                  onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                  disabled={ordersPage === 1}
                                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-brand-primary disabled:opacity-30 transition-all"
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                </button>
                                <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                                  Page {ordersPage} of {totalOrderPages}
                                </span>
                                <button
                                  onClick={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))}
                                  disabled={ordersPage === totalOrderPages}
                                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-brand-primary disabled:opacity-30 transition-all"
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Detailed Order Modal (Full Manifest) */}
                <AnimatePresence>
                  {selectedOrder && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-6 animate-fadeIn">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                      >
                        {/* Modal Left: Status & Summary */}
                        <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-10 border-r border-slate-100 dark:border-slate-800 overflow-y-auto no-scrollbar">
                          <button onClick={() => setSelectedOrder(null)} className="mb-10 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 dark:text-slate-100 flex items-center gap-2 group">
                            <IconX size={14} className="transition-transform group-hover:rotate-90" /> Close Details
                          </button>

                          <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 mb-8">Acquisition <span className="italic text-brand-primary">Path</span></h2>

                          <div className="space-y-8 relative">
                            <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />

                            {[
                              { id: 'placed', label: 'Order Placed', icon: IconCheck },
                              { id: 'confirmed', label: 'Confirmed', icon: IconPackage },
                              { id: 'packed', label: 'Curated & Packed', icon: IconPackage },
                              { id: 'shipped', label: 'In Transit', icon: IconTruck },
                              { id: 'delivered', label: 'Arrived', icon: IconCheck }
                            ].map((step, idx) => {
                              const statusOrder = ["placed", "confirmed", "packed", "shipped", "delivered"];
                              const currentStatus = selectedOrder.status?.toLowerCase() || 'placed';
                              const isCompleted = statusOrder.indexOf(currentStatus) >= statusOrder.indexOf(step.id);
                              const isActive = currentStatus === step.id;

                              return (
                                <div
                                  key={step.id}
                                  className={cn(
                                    "flex items-center gap-4 w-full text-left transition-all relative z-10",
                                    isCompleted ? "opacity-100" : "opacity-30"
                                  )}
                                >
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                                    isActive ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110" :
                                      isCompleted ? "bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500" : "bg-white dark:bg-slate-900 border-slate-200 text-slate-300"
                                  )}>
                                    <step.icon size={14} />
                                  </div>
                                  <div>
                                    <p className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "text-brand-primary" : "text-slate-900 dark:text-slate-100")}>{step.label}</p>
                                    {isActive && <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 animate-pulse">In Progress</p>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800 space-y-6">
                            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 italic">Client Address</p>
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                                {selectedOrder.shipping_address || 'No address provided'}<br />
                                {selectedOrder.shipping_city || ''}{selectedOrder.shipping_city && selectedOrder.shipping_zip ? ', ' : ''}{selectedOrder.shipping_zip || ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Modal Right: Items & Valuation */}
                        <div className="flex-1 p-10 overflow-y-auto">
                          <div className="flex justify-between items-start mb-10">
                            <div>
                              <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1 italic">Order Identification</p>
                              <h3 className="text-xl font-sans font-bold text-slate-900 dark:text-slate-100 tracking-tight">#{String(selectedOrder.id).padStart(3, '0').toUpperCase()}</h3>
                              {selectedOrder.delivery_date && (
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter mt-1 flex items-center gap-1">
                                  <IconCalendar size={10} /> Arrival: {new Date(selectedOrder.delivery_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Valuation</p>
                              <p className="text-3xl font-sans font-semibold text-brand-primary tracking-tighter">{selectedOrder.total || '$0.00'}</p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.3em] border-b border-slate-50 pb-4 italic">Registry Items</h4>

                            <div className="space-y-4">
                              {selectedOrder.fullItems && selectedOrder.fullItems.length > 0 ? selectedOrder.fullItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-6 p-4 rounded-3xl hover:bg-slate-50 dark:bg-slate-800/50 transition-all group">
                                  <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                    <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-grow">
                                    <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.name}</h5>
                                    <div className="flex gap-4 mt-1.5 flex-wrap">
                                      <p className="text-[10px] text-slate-600 font-sans font-bold uppercase tracking-wider">Qty: {item.quantity || 0}</p>
                                      <p className="text-[10px] text-brand-primary font-sans font-bold uppercase tracking-wider">{item.price || '$0.00'} ea</p>
                                    </div>
                                    {item.options?.isSubscription && item.options?.menu && (
                                      <div className="mt-4 p-5 bg-violet-50/50 dark:bg-slate-850/50 border border-violet-100/50 dark:border-slate-800/50 rounded-2xl max-w-xl text-left">
                                        <p className="text-[10px] font-black uppercase text-brand-primary tracking-widest mb-3 flex items-center gap-1.5">
                                          <span>📅</span> Weekly Meal Subscription Menu & Daily Status
                                        </p>
                                        <div className="flex flex-col gap-2.5">
                                          {Object.entries(item.options.menu).map(([day, dish]) => {
                                            const statuses = item.options.deliveryStatuses || {};
                                            const dayStatus = statuses[day] || 'Pending';
                                            const statusColors =
                                              dayStatus?.toLowerCase() === 'delivered'
                                                ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                                                : dayStatus?.toLowerCase() === 'dispatched'
                                                  ? 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                                                  : dayStatus?.toLowerCase() === 'cancelled'
                                                    ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                                                    : 'text-amber-500 bg-amber-500/10 border-amber-500/20';

                                            return (
                                              <div key={day} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 sm:px-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                                                  <span className="text-[10px] sm:w-20 shrink-0 font-black text-slate-400 uppercase tracking-widest">{day}</span>
                                                  <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 leading-snug">{dish}</span>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border shrink-0 w-fit ${statusColors}`}>
                                                  {dayStatus}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-2">
                                    <p className="text-xs font-sans font-bold text-slate-900 dark:text-slate-100">
                                      ${(parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) * (item.quantity || 0)).toFixed(2)}
                                    </p>
                                    <button
                                      onClick={() => handleOpenReview(item)}
                                      disabled={selectedOrder.status?.toLowerCase() !== 'delivered'}
                                      className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all shadow-sm",
                                        selectedOrder.status?.toLowerCase() === 'delivered'
                                          ? "text-brand-primary border border-brand-primary/20 bg-brand-primary/5 hover:bg-brand-primary hover:text-white"
                                          : "text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed border-transparent"
                                      )}
                                    >
                                      {selectedOrder.status?.toLowerCase() === 'delivered' ? 'Leave Review' : 'Locked'}
                                    </button>
                                  </div>
                                </div>
                              )) : (
                                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200">
                                  <p className="text-xs text-slate-400 italic font-medium">No order manifests found for this record.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {selectedOrder.status?.toLowerCase() === 'delivered' && (
                            <div className="mt-12 flex gap-4">
                              <button
                                onClick={() => generateInvoice(selectedOrder, settings, 'view')}
                                className="flex-1 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
                              >
                                <IconEye size={18} /> View Invoice
                              </button>
                              <button
                                onClick={() => generateInvoice(selectedOrder, settings, 'download')}
                                className="flex-1 py-5 bg-brand-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95"
                              >
                                <IconFileInvoice size={18} /> Download Invoice
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeSegment === 'subscriptions' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 tracking-tight">My Subscriptions</h2>
                </div>

                {(() => {
                  const activeSubscribers = [];
                  contextOrders.forEach(order => {
                    if (order.status?.toLowerCase() === 'cancelled') return;
                    (order.items || []).forEach(item => {
                      if (item.options?.isSubscription) {
                        activeSubscribers.push({
                          ...item,
                          orderId: order.id,
                          orderStatus: order.status,
                          deliveryDate: order.delivery_date,
                          timeSlot: order.time_slot
                        });
                      }
                    });
                  });

                  if (activeSubscribers.length === 0) {
                    return (
                      <div className="bg-white dark:bg-slate-900 p-20 rounded-[2.5rem] text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                        <p className="text-xl font-serif italic text-slate-400">No active meal subscriptions found.</p>
                        <p className="text-sm text-slate-400 font-light max-w-md mx-auto">Savor fresh, chef-curated premium South Indian meal subscriptions delivered to your doorstep daily.</p>
                        <Link to="/subscribe" className="px-8 py-4 bg-brand-primary text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-brand-accent transition-all hover:scale-105 inline-block cursor-pointer">Explore Subscriptions</Link>
                      </div>
                    );
                  }

                  const itemsPerPage = 2;
                  const totalPages = Math.ceil(activeSubscribers.length / itemsPerPage);
                  const paginatedSubscribers = activeSubscribers.slice((subscriptionPage - 1) * itemsPerPage, subscriptionPage * itemsPerPage);

                  return (
                    <>
                      {paginatedSubscribers.map((currentSub, sIdx) => {
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                        // Parse start date
                        const startStr = currentSub.options.deliveries?.[0]?.date || currentSub.deliveryDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
                        const startFormatted = new Date(startStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                        // Parse end date (consecutive 7 days)
                        const end = new Date(startStr);
                        end.setDate(end.getDate() + 6);
                        const endFormatted = end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

                        const timelineText = `${startFormatted} - ${endFormatted}`;

                        // Flat list of deliveries (pre-generated array or fallback weekday generator)
                        const dayList = Array.isArray(currentSub.options.deliveries)
                          ? currentSub.options.deliveries
                          : Object.entries(currentSub.options.menu || {}).map(([dayName, dish], i) => {
                            const d = new Date(startStr);
                            d.setDate(d.getDate() + i);
                            const dateStr = d.toISOString().split('T')[0];
                            return {
                              dayIndex: i + 1,
                              date: dateStr,
                              dayName,
                              dish,
                              status: currentSub.options.deliveryStatuses?.[dayName] || 'Pending'
                            };
                          });

                        const deliveredCount = dayList.filter(d => d.status?.toLowerCase() === 'delivered').length;
                        const remainingCount = dayList.length - deliveredCount;

                        // Time slot formatting
                        const subTitleName = (currentSub.options.plan || currentSub.name || '').toLowerCase();
                        let defaultTime = "08:30 AM";
                        let label = "BREAKFAST SLOT";
                        if (subTitleName.includes("lunch")) {
                          defaultTime = "12:30 PM";
                          label = "LUNCH SLOT";
                        } else if (subTitleName.includes("dinner")) {
                          defaultTime = "07:30 PM";
                          label = "DINNER SLOT";
                        }

                        const handleSkipDay = async (dayName, dateStr) => {
                          if (!window.confirm(`Are you sure you want to skip delivery for ${dayName} (${dateStr.split('-').reverse().join('/')})?`)) return;
                          try {
                            const res = await fetch(`${API_BASE}/api/orders/item/${currentSub.id}/subscription-status`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ day: dayName, date: dateStr, status: 'Skipped' }),
                              credentials: 'include'
                            });
                            if (res.ok) {
                              showNotification(`Delivery for ${dayName} successfully skipped.`, "success");
                              fetchOrders(); // Reload orders to get updated state
                            } else {
                              showNotification("Failed to skip delivery day.", "error");
                            }
                          } catch (err) {
                            console.error("Error skipping day:", err);
                            showNotification("Network error occurred", "error");
                          }
                        };

                        return (
                          <div key={sIdx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-5 relative overflow-hidden">

                            {/* Upper Section (Mirroring image 2) */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-50 dark:border-slate-800">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shrink-0">
                                  <img src={getImageUrl(currentSub.image)} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-2">
                                  <h3 className="text-xl font-bold text-slate-805 dark:text-slate-100 leading-tight font-serif italic">{currentSub.name}</h3>
                                  <div className="flex flex-wrap gap-2 items-center">
                                    <span className="bg-[#ff8f00]/10 text-[#e65100] border border-[#ffe082]/30 rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                                      7 Days Plan
                                    </span>
                                    <span className="bg-[#e3f2fd] dark:bg-sky-950/20 text-[#1e88e5] dark:text-sky-400 border border-[#bbdefb]/30 rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                                      {label} ({currentSub.timeSlot || defaultTime})
                                    </span>
                                    <span className="bg-[#e8f5e9] dark:bg-emerald-950/20 text-[#2e7d32] dark:text-emerald-400 border border-[#c8e6c9]/30 rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                                      Active
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Timeline and stats info */}
                              <div className="text-left md:text-right space-y-1 shrink-0">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Timeline</p>
                                <p className="text-base font-bold text-slate-800 dark:text-slate-100">{timelineText}</p>
                                <p className="text-xs text-slate-400 font-medium">{deliveredCount} Delivered - {remainingCount} Remaining</p>
                              </div>
                            </div>

                            {/* Middle Buttons Row Removed */}
                            {/* Daily Delivery Logs grid (Mirroring exactly Image 2 style) */}
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">Daily Delivery Logs</h4>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold italic hidden sm:block">Click "Skip" if you are out of town for any pending day</span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {dayList.map((day) => {
                                  const isPending = day.status?.toLowerCase() === 'pending';
                                  const isSkipped = day.status?.toLowerCase() === 'skipped';
                                  const isDelivered = day.status?.toLowerCase() === 'delivered';
                                  const isDispatched = day.status?.toLowerCase() === 'dispatched';

                                  let statusColors = 'text-slate-500 bg-white border-slate-350 dark:border-slate-700';
                                  if (isDelivered) statusColors = 'text-emerald-600 bg-emerald-50/50 border-emerald-200 font-black dark:bg-emerald-950/20';
                                  if (isDispatched) statusColors = 'text-blue-600 bg-blue-50/50 border-blue-200 font-black dark:bg-blue-950/20';
                                  if (isSkipped) statusColors = 'text-rose-600 bg-rose-50/50 border-rose-200 font-black dark:bg-rose-950/20';

                                  return (
                                    <div
                                      key={day.dayIndex}
                                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-md rounded-2xl p-3 text-center flex flex-col justify-between items-center shadow-sm min-h-[110px] group transition-all duration-300 relative"
                                    >
                                      <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Day {day.dayIndex}</p>
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">
                                          {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                        </p>
                                      </div>

                                      <div className="my-3 w-full">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border block w-full text-center ${statusColors}`}>
                                          {day.status}
                                        </span>
                                      </div>

                                      {isPending ? (
                                        <button
                                          onClick={() => handleSkipDay(day.dayName, day.date)}
                                          className="text-[9px] font-black text-rose-500 hover:text-rose-700 tracking-wider uppercase w-full cursor-pointer hover:scale-105 transition-transform"
                                        >
                                          Skip Day
                                        </button>
                                      ) : (
                                        <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 w-full block">
                                          Locked
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                          <button
                            onClick={() => setSubscriptionPage(p => Math.max(1, p - 1))}
                            disabled={subscriptionPage === 1}
                            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-brand-primary disabled:opacity-30 transition-all"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                          </button>
                          <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                            Page {subscriptionPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setSubscriptionPage(p => Math.min(totalPages, p + 1))}
                            disabled={subscriptionPage === totalPages}
                            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-brand-primary disabled:opacity-30 transition-all"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {activeSegment === 'wishlist' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 tracking-tight">Curated Favorites</h2>
                  <p className="text-xs font-bold text-slate-400">{wishlistItems.length} preserved specimens</p>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-20 rounded-[2.5rem] text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <p className="text-xl font-serif italic text-slate-400">Your archive is awaiting its first selection.</p>
                    <Link to="/" className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-widest">Start Browsing ›</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 flex gap-6 items-center shadow-sm group hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                        <div className="w-24 aspect-[4/5] overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800/50 shrink-0 border border-slate-50 relative">
                          <img src={getImageUrl(item.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                          <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="flex-grow space-y-1">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.category}</p>
                          <h4 className="font-serif text-lg text-slate-900 dark:text-slate-100 leading-tight">{item.name}</h4>
                          <p className="text-brand-primary font-bold">{item.price}</p>

                          <div className="flex gap-3 pt-3">
                            <button
                              onClick={() => addToCart(item)}
                              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-brand-primary transition-all shadow-lg hover:shadow-brand-primary/20"
                              title="Add to Bag"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-300 rounded-xl hover:border-rose-100 hover:text-rose-500 transition-all group/trash"
                              title="Remove from Archive"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/trash:rotate-12 transition-transform"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSegment === 'addresses' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 tracking-tight">Addresses</h2>
                  <button
                    onClick={() => {
                      if (addresses.length >= 5) {
                        showNotification("Address limit reached. Please delete an old address to add a new one.", "error");
                      } else {
                        setShowLandmarkModel(true);
                      }
                    }}
                    disabled={addresses.length >= 5}
                    className={`text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-full transition-all ${addresses.length >= 5 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white'}`}
                  >
                    {addresses.length >= 5 ? 'Limit Reached (5/5)' : '+ Add New Address'}
                  </button>
                </div>

                {/* Shipping Model (requested fields) */}
                {showLandmarkModel && (
                  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn">
                      <div className="p-6 pb-0 flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-serif text-slate-900 dark:text-slate-100">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                          <p className="text-xs text-slate-400 font-medium">{editingAddressId ? 'Update your shipping destination details.' : 'Save a new shipping destination to your account.'}</p>
                        </div>
                        <button onClick={() => { setShowLandmarkModel(false); document.body.style.overflow = 'auto'; setEditingAddressId(null); setNewAddress({ title: '', name: '', street: '', suite: '', city: '', state: '', zip: '', phone: '', is_default: false }); }} className="w-10 h-10 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Full Name</label>
                            <input
                              type="text"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                              placeholder="Recipient's Name"
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Zip / Pincode</label>
                            <input
                              type="text"
                              value={newAddress.zip}
                              maxLength={6}
                              onChange={async (e) => {
                                const val = e.target.value;
                                setNewAddress({ ...newAddress, zip: val });
                                if (val.length === 6 && /^\d+$/.test(val)) {
                                  try {
                                    const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
                                    const data = await res.json();
                                    if (data[0].Status === "Success") {
                                      const postOffice = data[0].PostOffice[0];
                                      setNewAddress(prev => ({
                                        ...prev,
                                        zip: val,
                                        city: postOffice.District,
                                        state: postOffice.State
                                      }));
                                    }
                                  } catch (err) {
                                    console.error("Pincode fetch error:", err);
                                  }
                                }
                              }}
                              placeholder="6-digit Pincode"
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Street Address</label>
                          <input
                            type="text"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            placeholder="124 Studio Heights..."
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">City</label>
                            <input
                              type="text"
                              value={newAddress.city}
                              readOnly={!!newAddress.city && newAddress.zip.length === 6}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              placeholder="City Name"
                              className={`w-full px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none ${(newAddress.city && newAddress.zip.length === 6) ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">State</label>
                            <input
                              type="text"
                              value={newAddress.state}
                              readOnly={!!newAddress.state && newAddress.zip.length === 6}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              placeholder="State Name"
                              className={`w-full px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none ${(newAddress.state && newAddress.zip.length === 6) ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Apartment / Suite</label>
                            <input
                              type="text"
                              value={newAddress.suite}
                              onChange={(e) => setNewAddress({ ...newAddress, suite: e.target.value })}
                              placeholder="Optional"
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Phone Number</label>
                            <input
                              type="tel"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                              placeholder="+91 98765-43210"
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 px-1">
                          <input
                            type="checkbox"
                            id="is_default"
                            checked={newAddress.is_default}
                            onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                            className="w-5 h-5 rounded-lg border-slate-200 text-brand-primary focus:ring-brand-primary"
                          />
                          <label htmlFor="is_default" className="text-xs font-bold text-slate-600 cursor-pointer">Set as preferred address</label>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex gap-4">
                          <button onClick={handleSaveAddress} className="flex-grow py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20">
                            {editingAddressId ? 'Update Address' : 'Save Address'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {addresses.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-20 rounded-[2.5rem] text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconMapPin size={32} className="text-slate-300" />
                    </div>
                    <p className="text-xl font-serif italic text-slate-400">Your address archive is empty.</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Save your frequent delivery destinations here for a swifter checkout experience.</p>
                    <button
                      onClick={() => setShowLandmarkModel(true)}
                      className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-widest pt-2"
                    >
                      + Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 transition-all shadow-xl shadow-brand-primary/5 space-y-4 relative ${addr.is_default ? 'border-brand-primary' : 'border-slate-100 dark:border-slate-800'}`}>
                        <div className="absolute top-6 right-8 flex gap-2">
                          {addr.is_default && (
                            <span className="text-[9px] font-black uppercase text-brand-primary bg-violet-50 px-3 py-1 rounded-full border border-brand-primary/10 flex items-center gap-1">
                              <IconHeart size={10} className="fill-brand-primary" /> Preferred
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif text-lg mb-2">{addr.title}</h4>
                        <div className="text-sm text-slate-500 font-medium space-y-1.5">
                          <p className="text-slate-900 dark:text-slate-100 font-bold mb-3">{addr.first_name} {addr.last_name}</p>
                          <div className="space-y-0.5">
                            <p className="flex items-center gap-2">
                              <IconMapPin size={12} className="text-slate-300" />
                              {addr.street}{addr.suite ? `, ${addr.suite}` : ''}
                            </p>
                            <p className="pl-5">{addr.city}, {addr.state} {addr.zip}</p>
                          </div>
                          {addr.phone && (
                            <p className="flex items-center gap-2 pt-2">
                              <IconPhone size={12} className="text-slate-300" />
                              {addr.phone}
                            </p>
                          )}
                        </div>
                        <div className="pt-6 flex gap-4 border-t border-slate-50">
                          <button onClick={() => handleEditAddress(addr)} className="text-[10px] font-black uppercase text-slate-400 hover:text-brand-primary transition-colors">Modify</button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 transition-colors">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSegment === 'settings' && (
              <div className="space-y-8 animate-fadeIn">
                <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 tracking-tight">Security & Identity</h2>
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                  <form onSubmit={handleUpdateProfile} className="p-10 space-y-8">
                    {profileMessage.text && (
                      <div className={`p-4 rounded-2xl text-xs font-bold border ${profileMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                        {profileMessage.text}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">First Name</label>
                        <input
                          type="text"
                          maxLength={20}
                          value={profileForm.first_name}
                          onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Last Name</label>
                        <input
                          type="text"
                          maxLength={20}
                          value={profileForm.last_name}
                          onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Electronic Correspondence</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          readOnly
                          className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Registered Phone</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-primary transition-all shadow-xl disabled:opacity-50"
                      >
                        {profileLoading ? 'Archiving...' : 'Save Personal Archive'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <CartSidebar />
      <Footer />

      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Share Your Experience"
        footer={
          <div className="flex gap-4">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={reviewSubmitting}
              className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-accent transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 flex items-center justify-center"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        }
      >
        {reviewingItem && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shrink-0 shadow-sm border border-slate-100 dark:border-slate-800">
                <img src={getImageUrl(reviewingItem.image)} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Evaluating</p>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">{reviewingItem.name}</h4>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Quality Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className={`transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                  >
                    {reviewForm.rating >= star ? <IconStarFilled size={28} /> : <IconStar size={28} strokeWidth={1.5} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Detailed Feedback</label>
                <span className={`text-[9px] font-bold ${reviewForm.comment.length > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                  {reviewForm.comment.length}/500
                </span>
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value.slice(0, 500) })}
                placeholder="How did this accessory arrive? Was the delivery satisfactory?"
                className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl text-sm focus:border-brand-primary outline-none transition-all shadow-sm min-h-[120px] resize-none"
              />
            </div>
          </div>
        )}
      </Modal>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="register"
      />
    </div>
  );
}
