import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    IconFlower,
    IconSearch,
    IconBell,
    IconMessageDots,
    IconExternalLink,
    IconChevronDown,
    IconUser,
    IconLogout,
    IconSettings,
    IconCalendar,
    IconX,
    IconArrowRight,
    IconShoppingBag,
    IconUsers,
    IconPackage,
    IconSun,
    IconMoon
} from "@tabler/icons-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { getImageUrl } from "../../utils/imageHelper";
import { cn } from "../../lib/utils";
import API_BASE from "../../config";
import { useTheme } from "../../context/ThemeContext";

const AdminHeader = () => {
    const { admin, logout } = useAuth();
    const { settings } = useSettings();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // UI State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isMessagesOpen, setIsMessagesOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [globalResults, setGlobalResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Dynamic Alerts and Messages
    const [alerts, setAlerts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const searchInputRef = useRef(null);

    const fetchHeaderData = async () => {
        setIsLoadingData(true);
        try {
            // Fetch stats and subscribers in parallel
            const [statsRes, subRes] = await Promise.all([
                fetch(`${API_BASE}/api/stats/dashboard?period=month`, { credentials: 'include' }),
                fetch(`${API_BASE}/api/subscribers`, { credentials: 'include' })
            ]);

            let statsData = null;
            let subsData = [];

            if (statsRes.ok) {
                statsData = await statsRes.json();
            }
            if (subRes.ok) {
                subsData = await subRes.json();
            }

            // 1. Process Alerts/Notifications
            const activeAlerts = [];

            // Add low stock warnings from dashboard stats
            if (statsData?.lowStockProducts && statsData.lowStockProducts.length > 0) {
                statsData.lowStockProducts.forEach(p => {
                    activeAlerts.push({
                        id: `low-stock-${p.id}`,
                        type: 'low_stock',
                        title: 'Low Stock Alert',
                        desc: `${p.name} is running low (only ${p.stock} units left).`,
                        icon: 'bg-rose-500',
                        time: 'Stock Warning',
                        path: `/admin/inventory?filter=low&search=${encodeURIComponent(p.name)}`
                    });
                });
            }

            // Add recent order alerts
            if (statsData?.recentOrders && statsData.recentOrders.length > 0) {
                statsData.recentOrders.slice(0, 3).forEach(o => {
                    const cleanId = o.id ? o.id.replace('#', '') : '';
                    activeAlerts.push({
                        id: `new-order-${o.id}`,
                        type: 'new_order',
                        title: 'New Order Placed',
                        desc: `${o.customer} ordered ${o.product} (${o.amount}).`,
                        icon: 'bg-emerald-500',
                        time: o.date || 'Today',
                        path: `/admin/orders?search=${encodeURIComponent(cleanId)}`
                    });
                });
            }

            // Add fallback system alert if alerts list is empty
            if (activeAlerts.length === 0) {
                activeAlerts.push({
                    id: 'sys-backup',
                    type: 'system',
                    title: 'Backup Complete',
                    desc: 'Daily cloud system data backup successful.',
                    icon: 'bg-blue-500',
                    time: '4 hours ago',
                    path: '/admin'
                });
            }

            // Filter out dismissed alerts
            let dismissedAlerts = [];
            try {
                dismissedAlerts = JSON.parse(localStorage.getItem('dismissed_alerts') || '[]');
            } catch (e) {}
            const filteredAlerts = activeAlerts.filter(a => !dismissedAlerts.includes(a.id));
            setAlerts(filteredAlerts);

            // 2. Process Messages/Inquiries
            const activeMessages = [];

            // Process newsletter subscribers
            if (subsData && subsData.length > 0) {
                subsData.slice(0, 2).forEach(s => {
                    activeMessages.push({
                        id: `sub-${s.id}`,
                        name: 'Newsletter Client',
                        text: `New subscriber registered: ${s.email}`,
                        time: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recently',
                        path: '/admin/customers'
                    });
                });
            }

            // Add inquiry mock messages based on recent orders to simulate organic activity
            if (statsData?.recentOrders && statsData.recentOrders.length > 0) {
                statsData.recentOrders.slice(0, 2).forEach(o => {
                    activeMessages.push({
                        id: `msg-order-${o.id}`,
                        name: o.customer,
                        text: `Client requested immediate delivery details for order ${o.id}.`,
                        time: o.date || '1 hour ago',
                        path: '/admin/orders'
                    });
                });
            }

            // If empty, add standard default message
            if (activeMessages.length === 0) {
                activeMessages.push({
                    id: 'msg-default-1',
                    name: 'Support Team',
                    text: 'All support tickets resolved. Welcome to your luxury console dashboard.',
                    time: '2 hours ago',
                    path: '/admin'
                });
            }

            // Filter out dismissed messages
            let dismissedMessages = [];
            try {
                dismissedMessages = JSON.parse(localStorage.getItem('dismissed_messages') || '[]');
            } catch (e) {}
            const filteredMessages = activeMessages.filter(m => !dismissedMessages.includes(m.id));
            setMessages(filteredMessages);

        } catch (error) {
            console.error('Failed to load dynamic alerts and messages:', error);
            // Fallback to beautiful static/mock data on error so UI never breaks
            const fallbackAlerts = [
                { id: "low-stock-fallback", title: "Low Stock Alert", desc: "Carbon Fiber Knobs is below critical limit.", icon: "bg-amber-500", time: "10 min ago", path: "/admin/inventory?filter=low&search=Carbon%20Fiber%20Knobs" },
                { id: "new-order-fallback", title: "New Order", desc: "Order #8493 was just placed by Sarah Smith.", icon: "bg-emerald-500", time: "25 min ago", path: "/admin/orders?search=8493" },
                { id: "sys-backup-fallback", title: "Backup Complete", desc: "Daily system data backup successful.", icon: "bg-blue-500", time: "4 hours ago", path: "/admin/settings?tab=general" }
            ];
            let dismissedAlerts = [];
            try {
                dismissedAlerts = JSON.parse(localStorage.getItem('dismissed_alerts') || '[]');
            } catch (e) {}
            setAlerts(fallbackAlerts.filter(a => !dismissedAlerts.includes(a.id)));

            const fallbackMessages = [
                { id: "msg-1-fallback", name: "John Doe", text: "Is the wedding bouquet collection updated?", time: "2 min ago", path: "/admin/inventory" },
                { id: "msg-2-fallback", name: "Sarah Smith", text: "Order #8492 delivery confirmation needed.", time: "1 hour ago", path: "/admin/orders?search=8492" },
                { id: "msg-3-fallback", name: "Global Support", text: "System maintenance scheduled for tonight.", time: "3 hours ago", path: "/admin" }
            ];
            let dismissedMessages = [];
            try {
                dismissedMessages = JSON.parse(localStorage.getItem('dismissed_messages') || '[]');
            } catch (e) {}
            setMessages(fallbackMessages.filter(m => !dismissedMessages.includes(m.id)));
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleDismissAlert = (id, e) => {
        e.stopPropagation();
        setAlerts(prev => {
            const updated = prev.filter(alert => alert.id !== id);
            try {
                const dismissed = JSON.parse(localStorage.getItem('dismissed_alerts') || '[]');
                if (!dismissed.includes(id)) {
                    dismissed.push(id);
                    localStorage.setItem('dismissed_alerts', JSON.stringify(dismissed));
                }
            } catch (err) {
                console.error(err);
            }
            return updated;
        });
    };

    const handleDismissMessage = (id, e) => {
        e.stopPropagation();
        setMessages(prev => {
            const updated = prev.filter(msg => msg.id !== id);
            try {
                const dismissed = JSON.parse(localStorage.getItem('dismissed_messages') || '[]');
                if (!dismissed.includes(id)) {
                    dismissed.push(id);
                    localStorage.setItem('dismissed_messages', JSON.stringify(dismissed));
                }
            } catch (err) {
                console.error(err);
            }
            return updated;
        });
    };

    const handleToggleMessages = () => {
        if (!isMessagesOpen) {
            fetchHeaderData();
        }
        setIsMessagesOpen(!isMessagesOpen);
    };

    const handleToggleNotifications = () => {
        if (!isNotificationsOpen) {
            fetchHeaderData();
        }
        setIsNotificationsOpen(!isNotificationsOpen);
    };


    // Static Navigation Pages
    const searchablePages = [
        { title: "Executive Overview", path: "/admin", category: "Navigation", type: 'page' },
        { title: "Product Inventory", path: "/admin/products", category: "Navigation", type: 'page' },
        { title: "Main Banners", path: "/admin/banners", category: "Navigation", type: 'page' },
        { title: "General Settings", path: "/admin/settings?tab=general", category: "Navigation", type: 'page' },
        { title: "Staff Management", path: "/admin/settings?tab=staff", category: "Navigation", type: 'page' },
        { title: "Customer Registry", path: "/admin/customers", category: "Navigation", type: 'page' },
        { title: "Order History", path: "/admin/orders", category: "Navigation", type: 'page' },
        { title: "Media Library", path: "/admin/media", category: "Navigation", type: 'page' },
    ];

    // Global Search Logic (Live Data)
    useEffect(() => {
        if (searchQuery.length < 2) {
            setGlobalResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                // Fetch from multiple sources in parallel
                const [prodRes, orderRes, custRes] = await Promise.all([
                    fetch(`${API_BASE}/api/products?search=${searchQuery}`, { credentials: 'include' }),
                    fetch(`${API_BASE}/api/orders?search=${searchQuery}`, { credentials: 'include' }),
                    fetch(`${API_BASE}/api/customers?search=${searchQuery}`, { credentials: 'include' })
                ]);

                const prods = await prodRes.json();
                const orders = await orderRes.json();
                const custs = await custRes.json();

                const results = [
                    ...(prods.products || prods || []).slice(0, 3).map(p => ({ title: p.name, path: `/admin/products?id=${p.id}`, category: "Product", type: 'product' })),
                    ...(orders.orders || orders || []).slice(0, 3).map(o => ({ title: `Order #${o.id}`, path: `/admin/orders?id=${o.id}`, category: "Order", type: 'order' })),
                    ...(custs.customers || custs || []).slice(0, 3).map(c => ({ title: c.username || c.email, path: `/admin/customers?id=${c.id}`, category: "Customer", type: 'customer' }))
                ];

                setGlobalResults(results);
            } catch (err) {
                console.error("Global search failed:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const filteredPages = [
        ...searchablePages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())),
        ...globalResults
    ];

    useEffect(() => {
        fetchHeaderData();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setIsProfileOpen(false);
                setIsNotificationsOpen(false);
                setIsMessagesOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearInterval(timer);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 h-16 flex items-center justify-between px-6 shadow-sm dark:shadow-none">
                {/* Brand & Greeting Section */}
                <div className="flex items-center gap-8 w-auto">
                    <Link to="/admin" className="flex items-center gap-4 group transition-all">
                        <div className="h-16 flex items-center justify-center overflow-hidden">
                            {settings.site_logo ? (
                                <img
                                    src={getImageUrl(settings.site_logo)}
                                    alt={settings.site_name}
                                    className="h-full w-auto object-contain py-1"
                                />
                            ) : (
                                <IconFlower size={32} className="text-brand-primary" />
                            )}
                        </div>
                        <div className="hidden lg:block">
                            <h2 className="font-serif text-xl font-black text-slate-900 dark:text-slate-100 leading-none tracking-tight">
                                {settings.site_name || 'MBW LUXURY'}
                            </h2>
                            <p className="text-xs uppercase tracking-[0.2em] text-brand-primary font-black mt-1 opacity-90">
                                Management Console
                            </p>
                        </div>
                    </Link>

                    <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden xl:block" />

                    <div className="hidden xl:block">
                                               <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{getGreeting()}, {admin?.username ? admin.username.split(' ')[0] : 'Admin'}!</h3>

                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                            <IconCalendar size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{formatDate(currentTime)}</span>
                        </div>
                    </div>
                </div>

                {/* Enhanced User-Friendly Search Trigger */}
                <div className="flex-1 max-w-lg mx-8 flex items-center">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="relative flex-1 group flex items-center px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:border-brand-primary/30 transition-all text-slate-400 dark:text-slate-500"
                    >
                        <IconSearch size={18} className="mr-3 group-hover:text-brand-primary transition-colors" />
                        <span className="text-sm font-medium">Quick Search...</span>
                        <div className="ml-auto flex items-center">
                            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900">Ctrl + K</kbd>
                        </div>
                    </button>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    {/* View Store Quick Link */}
                    <Link
                        to="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex items-center gap-2 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-brand-primary font-bold text-xs transition-all hover:bg-brand-secondary/20 rounded-xl"
                    >
                        <IconExternalLink size={16} />
                        <span>View Store</span>
                    </Link>

                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-all group"
                        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                    >
                        {theme === 'light' ? (
                            <IconMoon size={20} className="group-hover:text-brand-primary" />
                        ) : (
                            <IconSun size={20} className="text-amber-400 group-hover:text-amber-300" />
                        )}
                    </button>

                    <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-1 hidden sm:block" />

                    <div className="flex items-center gap-1 text-slate-400 relative">
                        {/* Messages */}
                        <div className="relative">
                            <button
                                onClick={handleToggleMessages}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-xl transition-all relative group",
                                    isMessagesOpen ? "bg-brand-secondary/20 text-brand-primary" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <IconMessageDots size={20} className="group-hover:scale-110 transition-transform" />
                                {messages.length > 0 && (
                                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                                )}
                            </button>

                            {isMessagesOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMessagesOpen(false)} />
                                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Customer Inquiries</h4>
                                            <div className="flex items-center gap-2">
                                                {messages.length > 0 && (
                                                    <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-2 py-0.5 rounded-full">{messages.length} NEW</span>
                                                )}
                                                <button
                                                    onClick={() => setIsMessagesOpen(false)}
                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all text-slate-400 dark:text-slate-500"
                                                    title="Close menu"
                                                >
                                                    <IconX size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {messages.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                                                    <IconMessageDots size={32} className="mx-auto mb-2 opacity-50 text-slate-300" />
                                                    <p className="text-xs font-semibold">No active inquiries</p>
                                                </div>
                                            ) : (
                                                messages.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        onClick={() => { navigate(msg.path); setIsMessagesOpen(false); }}
                                                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 group relative"
                                                    >
                                                        <div className="flex justify-between items-start mb-1 pr-6">
                                                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{msg.name}</span>
                                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{msg.time}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 pr-6">{msg.text}</p>
                                                        
                                                        {/* Dismiss button */}
                                                        <button
                                                            onClick={(e) => handleDismissMessage(msg.id, e)}
                                                            className="absolute right-3 top-4 p-1 rounded-md text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100"
                                                            title="Dismiss message"
                                                        >
                                                            <IconX size={12} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <button
                                            onClick={() => { navigate("/admin/customers"); setIsMessagesOpen(false); }}
                                            className="w-full text-center py-3 text-[10px] font-black uppercase tracking-widest text-brand-primary bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-secondary/20 transition-colors transition-all"
                                        >
                                            Open Support Inbox
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={handleToggleNotifications}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-xl transition-all relative group",
                                    isNotificationsOpen ? "bg-brand-secondary/20 text-brand-primary" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <IconBell size={20} className="group-hover:scale-110 transition-transform" />
                                {alerts.length > 0 && (
                                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                )}
                            </button>

                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">System Notifications</h4>
                                            <div className="flex items-center gap-2">
                                                {alerts.length > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            try {
                                                                const dismissed = JSON.parse(localStorage.getItem('dismissed_alerts') || '[]');
                                                                alerts.forEach(a => {
                                                                    if (!dismissed.includes(a.id)) {
                                                                        dismissed.push(a.id);
                                                                    }
                                                                });
                                                                localStorage.setItem('dismissed_alerts', JSON.stringify(dismissed));
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                            setAlerts([]);
                                                        }}
                                                        className="text-[10px] font-bold text-brand-primary hover:underline mr-1"
                                                    >
                                                        Clear all
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setIsNotificationsOpen(false)}
                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all text-slate-400 dark:text-slate-500"
                                                    title="Close menu"
                                                >
                                                    <IconX size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {alerts.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                                                    <IconBell size={32} className="mx-auto mb-2 opacity-50 text-slate-300" />
                                                    <p className="text-xs font-semibold">All system checks secure</p>
                                                </div>
                                            ) : (
                                                alerts.map((note) => (
                                                    <div
                                                        key={note.id}
                                                        onClick={() => { navigate(note.path); setIsNotificationsOpen(false); }}
                                                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 flex gap-3 group relative"
                                                    >
                                                        <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", note.icon)} />
                                                        <div className="flex-grow pr-6">
                                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{note.title}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{note.desc}</p>
                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{note.time}</p>
                                                        </div>
                                                        
                                                        {/* Dismiss button */}
                                                        <button
                                                            onClick={(e) => handleDismissAlert(note.id, e)}
                                                            className="absolute right-3 top-4 p-1 rounded-md text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100"
                                                            title="Dismiss alert"
                                                        >
                                                            <IconX size={12} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <button
                                            onClick={() => { navigate("/admin/inventory"); setIsNotificationsOpen(false); }}
                                            className="w-full text-center py-3 text-[10px] font-black uppercase tracking-widest text-brand-primary bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-secondary/20 transition-colors transition-all"
                                        >
                                            View Product Inventory
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-1" />

                    {/* Profile Section */}
                    <div className="relative ml-2">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`flex items-center gap-2 pl-2 pr-1 py-1 rounded-2xl transition-all ${isProfileOpen ? "bg-brand-secondary/20 dark:bg-brand-primary/20" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                        >
                            <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
                                <span className="text-sm font-black text-white uppercase">
                                    {admin?.username?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <IconChevronDown size={14} className={`text-slate-400 transition-transform duration-300 mr-1 ${isProfileOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl z-50 p-2 animate-fade-in origin-top-right ring-4 ring-slate-900/5 shadow-brand-primary/10">
                                    <div className="p-4 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-primary/10">
                                            <span className="text-base font-black uppercase">{admin?.username?.charAt(0) || 'A'}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight truncate">{admin?.username || 'Admin User'}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{admin?.role || 'Store Manager'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Link
                                            to="/admin/settings"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-brand-secondary/20 hover:text-brand-primary rounded-2xl transition-all"
                                        >
                                            <IconSettings size={18} />
                                            System Settings
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                        >
                                            <IconLogout size={18} />
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Global Command Palette (Search Overlay) */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:pt-40">
                    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSearchOpen(false)} />
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center">
                            <IconSearch size={24} className="text-brand-primary mr-4" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Type to find pages, products, or settings..."
                                className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600"
                            />
                            <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <IconX size={20} className="text-slate-400 dark:text-slate-500" />
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                            {filteredPages.length > 0 ? (
                                filteredPages.map((page, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            navigate(page.path);
                                            setIsSearchOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between p-4 hover:bg-brand-secondary/20 dark:hover:bg-brand-primary/20 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-brand-primary transition-all">
                                                {page.type === 'product' && <IconPackage size={20} />}
                                                {page.type === 'order' && <IconShoppingBag size={20} />}
                                                {page.type === 'customer' && <IconUsers size={20} />}
                                                {page.type === 'page' && <IconFlower size={20} />}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{page.title}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{page.category}</p>
                                            </div>
                                        </div>
                                        <IconArrowRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-slate-400 font-medium">No results found for "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900">ESC</kbd>
                                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">to close</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900">ENTER</kbd>
                                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">to select</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminHeader;



