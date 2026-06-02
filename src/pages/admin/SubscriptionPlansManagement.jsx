import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import { useNotification } from "../../context/NotificationContext";
import AdminLayout from "../../components/admin/AdminLayout";
import {
    IconSection,
    IconDeviceFloppy,
    IconEdit,
    IconX,
    IconClock,
    IconCurrencyDollar,
    IconAlignLeft
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

const defaultMenus = {
    Breakfast: {
        Monday: 'Ghee Podi Idli (4 Pcs)',
        Tuesday: 'Spicy Mysore Masala Dosa',
        Wednesday: 'Steaming Sambar Idli (2 Pcs)',
        Thursday: 'Healthy Oats & Carrot Idli (2 Pcs)',
        Friday: 'Healthy Ragi Finger Millet Dosa',
        Saturday: 'Steaming Sambar Idli (2 Pcs)',
        Sunday: 'Mini Button Idlis with Sambar (12 Pcs)'
    },
    Lunch: {
        Monday: 'Traditional South Indian Rice Feast',
        Tuesday: 'Delicious Mini Meals',
        Wednesday: 'Healthy Millet Rice Special',
        Thursday: 'Flavorful Lemon Rice & Potato Fry',
        Friday: 'Authentic Curry Leaf Rice & Curd Rice',
        Saturday: 'Special Veg Biryani & Onion Raitha',
        Sunday: 'Grand Festive South Indian Thali'
    },
    Dinner: {
        Monday: 'Soft Chapati (3 Pcs) with Veg Kurma',
        Tuesday: 'Light Wheat Dosa with Tomato Chutney',
        Wednesday: 'Fluffy Phulka (3 Pcs) with Paneer Masala',
        Thursday: 'Healthy Ragi Roti with Coconut Chutney',
        Friday: 'Flaky Malabar Parotta (2 Pcs) with Veg Salna',
        Saturday: 'Crispy Plain Dosa with Sambar & Chutney',
        Sunday: 'Steaming Hot Idli (3 Pcs) with Spicy Chutney'
    }
};

const defaultPrices = {
    Breakfast: '1400.00',
    Lunch: '2100.00',
    Dinner: '2100.00'
};

const defaultDescriptions = {
    Breakfast: 'Start your mornings with traditional, light, and delicious South Indian breakfast items delivered fresh.',
    Lunch: 'Relish hearty, authentic multi-dish South Indian lunch meals delivered hot to satisfy your mid-day hunger.',
    Dinner: 'End your day with comforting, easily digestible traditional dinners prepared under strict hygienic protocols.'
};

const defaultTimings = {
    Breakfast: 'Delivered daily between 7:00 AM - 8:30 AM',
    Lunch: 'Delivered daily between 12:00 PM - 1:30 PM',
    Dinner: 'Delivered daily between 7:00 PM - 8:30 PM'
};

export default function SubscriptionPlansManagement() {
    const { showNotification } = useNotification();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Header states
    const [heading, setHeading] = useState('Weekly Meal Subscriptions');
    const [subtitle, setSubtitle] = useState('Exquisite Culinary Protocols');
    const [description, setDescription] = useState('Savor premium, fresh South Indian recipes designed and prepared daily by our expert chefs. Enjoy morning, mid-day, or evening deliveries straight to your doorstep. No cooking, no mess—just absolute culinary perfection.');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activePlan, setActivePlan] = useState(null); // 'Breakfast', 'Lunch', 'Dinner'
    const [planData, setPlanData] = useState({
        name: '',
        fullName: '',
        buttonText: '',
        footerNote: '',
        price: '',
        discount: '0',
        description: '',
        timing: '',
        menu: {
            Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '', Saturday: '', Sunday: ''
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/settings`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setSettings(data || []);
                
                // Extract general settings
                const getSetting = (key, fallback) => {
                    const s = data.find(x => x.key === key);
                    return s ? s.value : fallback;
                };

                setHeading(getSetting('subscription_heading', 'Weekly Meal Subscriptions'));
                setSubtitle(getSetting('subscription_subtitle', 'Exquisite Culinary Protocols'));
                setDescription(getSetting('subscription_description', 'Savor premium, fresh South Indian recipes designed and prepared daily by our expert chefs. Enjoy morning, mid-day, or evening deliveries straight to your doorstep. No cooking, no mess—just absolute culinary perfection.'));
                
            }
        } catch (err) {
            console.error("Failed to load settings:", err);
            showNotification("Failed to load settings.", "error");
        } finally {
            setLoading(false);
        }
    };

    const getPlanValue = (plan, type, key, fallback) => {
        const s = settings.find(x => x.key === key);
        return s ? s.value : fallback;
    };

    const loadPlanData = (plan) => {
        const lowerPlan = plan.toLowerCase();
        const menu = {};
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
            menu[day] = getPlanValue(plan, 'menu', `sub_menu_${lowerPlan}_${day.toLowerCase()}`, defaultMenus[plan][day]);
        });
        
        setPlanData({
            name: getPlanValue(plan, 'name', `subscription_${lowerPlan}_name`, `${plan} Plan`),
            fullName: getPlanValue(plan, 'fullName', `subscription_${lowerPlan}_fullname`, `Weekly ${plan} Subscription Plan`),
            buttonText: getPlanValue(plan, 'buttonText', `subscription_${lowerPlan}_button_text`, `Subscribe to ${plan} Plan`),
            footerNote: getPlanValue(plan, 'footerNote', `subscription_${lowerPlan}_footer_note`, 'Secure checkout & auto-activation for next morning'),
            price: getPlanValue(plan, 'price', `subscription_${lowerPlan}_price`, defaultPrices[plan]),
            discount: getPlanValue(plan, 'discount', `subscription_${lowerPlan}_discount`, '0'),
            description: getPlanValue(plan, 'desc', `subscription_${lowerPlan}_description`, defaultDescriptions[plan]),
            timing: getPlanValue(plan, 'timing', `subscription_${lowerPlan}_timing`, defaultTimings[plan]),
            menu
        });
    };

    const openEditModal = (plan) => {
        setActivePlan(plan);
        loadPlanData(plan);
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
        setActivePlan(null);
    };

    const handleSaveGeneral = async () => {
        setSaving(true);
        const newSettings = [
            { key: 'subscription_heading', value: heading, group: 'business' },
            { key: 'subscription_subtitle', value: subtitle, group: 'business' },
            { key: 'subscription_description', value: description, group: 'business' }
        ];

        try {
            const res = await fetch(`${API_BASE}/api/settings/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: newSettings }),
                credentials: 'include'
            });
            if (res.ok) {
                showNotification("General info updated successfully.", "success");
                fetchSettings(); // Refresh
                window.dispatchEvent(new CustomEvent('settingsUpdated')); // Inform context
            } else {
                showNotification("Failed to save general info.", "error");
            }
        } catch (err) {
            console.error(err);
            showNotification("Network error occurred.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSavePlan = async () => {
        setSaving(true);
        const lowerPlan = activePlan.toLowerCase();
        
        const newSettings = [
            { key: `subscription_${lowerPlan}_name`, value: planData.name, group: 'business' },
            { key: `subscription_${lowerPlan}_fullname`, value: planData.fullName, group: 'business' },
            { key: `subscription_${lowerPlan}_button_text`, value: planData.buttonText, group: 'business' },
            { key: `subscription_${lowerPlan}_footer_note`, value: planData.footerNote, group: 'business' },
            { key: `subscription_${lowerPlan}_price`, value: planData.price, group: 'business' },
            { key: `subscription_${lowerPlan}_discount`, value: planData.discount, group: 'business' },
            { key: `subscription_${lowerPlan}_description`, value: planData.description, group: 'business' },
            { key: `subscription_${lowerPlan}_timing`, value: planData.timing, group: 'business' }
        ];

        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
            newSettings.push({
                key: `sub_menu_${lowerPlan}_${day.toLowerCase()}`,
                value: planData.menu[day],
                group: 'business'
            });
        });

        try {
            const res = await fetch(`${API_BASE}/api/settings/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: newSettings }),
                credentials: 'include'
            });
            if (res.ok) {
                showNotification(`${activePlan} Plan updated successfully.`, "success");
                closeEditModal();
                fetchSettings(); // Refresh
                window.dispatchEvent(new CustomEvent('settingsUpdated')); // Inform context
            } else {
                showNotification("Failed to save plan info.", "error");
            }
        } catch (err) {
            console.error(err);
            showNotification("Network error occurred.", "error");
        } finally {
            setSaving(false);
        }
    };

    const planCards = [
        { name: 'Breakfast', color: 'text-orange-500', bg: 'bg-orange-50' },
        { name: 'Lunch', color: 'text-teal-500', bg: 'bg-teal-50' },
        { name: 'Dinner', color: 'text-violet-500', bg: 'bg-violet-50' }
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">Subscription Plans Management</h1>
                    <p className="text-slate-500 mt-1">Manage the dynamically generated content on the Subscribe page.</p>
                </div>

                {/* General Page Content */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-4">
                        <IconSection size={24} className="text-brand-primary" />
                        Page Header Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Subtitle / Tagline</label>
                            <input 
                                type="text" 
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Main Heading</label>
                            <input 
                                type="text" 
                                value={heading}
                                onChange={(e) => setHeading(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none resize-none"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSaveGeneral}
                            disabled={saving}
                            className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors"
                        >
                            <IconDeviceFloppy size={20} />
                            Save General Info
                        </button>
                    </div>
                </div>

                {/* Plans Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {planCards.map(plan => (
                        <div key={plan.name} className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center group transition-all hover:shadow-xl`}>
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${plan.bg} ${plan.color}`}>
                                <IconEdit size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name} Plan</h3>
                            <p className="text-sm text-slate-500 mb-6 flex-1">
                                Click to edit the plan details, pricing, timings, and 7-day menu items.
                            </p>
                            <button 
                                onClick={() => openEditModal(plan.name)}
                                className={`w-full py-3 rounded-xl font-bold border-2 transition-colors flex justify-center items-center gap-2 ${plan.color} border-current hover:${plan.bg}`}
                            >
                                <IconEdit size={18} />
                                Edit {plan.name} Data
                            </button>
                        </div>
                    ))}
                </div>

                {/* Edit Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                                onClick={closeEditModal}
                            />
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                            >
                                <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Edit {activePlan} Plan</h2>
                                        <p className="text-sm text-slate-500">Update the plan details that reflect dynamically on the Subscribe page.</p>
                                    </div>
                                    <button 
                                        onClick={closeEditModal}
                                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <IconX size={20} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto space-y-8 flex-1">
                                    {/* Main Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 border-b pb-2">
                                            <IconAlignLeft size={16} /> Basic Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Short Name</label>
                                                <input 
                                                    type="text"
                                                    value={planData.name}
                                                    onChange={(e) => setPlanData({...planData, name: e.target.value})}
                                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Full Name</label>
                                                <input 
                                                    type="text"
                                                    value={planData.fullName}
                                                    onChange={(e) => setPlanData({...planData, fullName: e.target.value})}
                                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Button Text</label>
                                                <input 
                                                    type="text"
                                                    value={planData.buttonText}
                                                    onChange={(e) => setPlanData({...planData, buttonText: e.target.value})}
                                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Footer Note</label>
                                                <input 
                                                    type="text"
                                                    value={planData.footerNote}
                                                    onChange={(e) => setPlanData({...planData, footerNote: e.target.value})}
                                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Weekly Price (₹)</label>
                                                <div className="relative">
                                                    <IconCurrencyDollar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input 
                                                        type="number"
                                                        value={planData.price}
                                                        onChange={(e) => setPlanData({...planData, price: e.target.value})}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Discount (%)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                                    <input 
                                                        type="number"
                                                        value={planData.discount}
                                                        onChange={(e) => setPlanData({...planData, discount: e.target.value})}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Offer Rate (₹)</label>
                                                <div className="relative">
                                                    <IconCurrencyDollar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input 
                                                        type="text"
                                                        readOnly
                                                        value={planData.price ? (parseFloat(planData.price) - (parseFloat(planData.price) * (parseFloat(planData.discount || 0) / 100))).toFixed(2) : '0.00'}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl border border-transparent outline-none cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-3">
                                                <label className="text-xs font-bold text-slate-500">Delivery Timings</label>
                                                <div className="relative">
                                                    <IconClock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input 
                                                        type="text"
                                                        value={planData.timing}
                                                        onChange={(e) => setPlanData({...planData, timing: e.target.value})}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-3">
                                                <label className="text-xs font-bold text-slate-500">Plan Description</label>
                                                <textarea 
                                                    value={planData.description}
                                                    onChange={(e) => setPlanData({...planData, description: e.target.value})}
                                                    rows={2}
                                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 7 Days Schedule */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 border-b pb-2">
                                            <IconSection size={16} /> 7-Days Menu Schedule
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                <div key={day} className="space-y-1">
                                                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-wider">{day}</label>
                                                    <input 
                                                        type="text"
                                                        value={planData.menu[day]}
                                                        onChange={(e) => setPlanData({
                                                            ...planData, 
                                                            menu: { ...planData.menu, [day]: e.target.value }
                                                        })}
                                                        placeholder={`${day} Menu`}
                                                        className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:border-brand-primary/30 outline-none text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t bg-slate-50 flex justify-end sticky bottom-0">
                                    <button 
                                        onClick={handleSavePlan}
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
                                    >
                                        {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <IconDeviceFloppy size={20} />}
                                        {saving ? 'Saving...' : 'Save Plan Information'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </AdminLayout>
    );
}
