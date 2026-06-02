import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import { ImageUpload } from "../../components/admin/UploadComponents";
import {

    IconEye,
    IconEyeOff,
    IconPlus,
    IconEdit,
    IconTrash,
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconX,
    IconPencil,
    IconDeviceFloppy,
    IconGripVertical,
    IconLink,
    IconShare,
    IconFlower,
    IconSettings2
} from "@tabler/icons-react";
import { Reorder } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";

const SETTINGS_API = `${API_BASE}/api/section-settings`;
const LINKS_API = `${API_BASE}/api/footer-links`;
const SOCIAL_API = `${API_BASE}/api/social-links`;
const PAYMENT_API = `${API_BASE}/api/payment-methods`;
const SECTION_KEY = "footer";

const FooterManagement = () => {
    const [links, setLinks] = useState([]);
    const [socials, setSocials] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const { showNotification } = useNotification();

    // Modals
    const [editingLink, setEditingLink] = useState(null);
    const [editingSocial, setEditingSocial] = useState(null);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: null });
    const [hasChangedLinks, setHasChangedLinks] = useState(false);
    const [hasChangedSocials, setHasChangedSocials] = useState(false);
    const [hasChangedPayments, setHasChangedPayments] = useState(false);
    const [renameModal, setRenameModal] = useState({ open: false, category: '', newName: '' });
    const [categoryDeleteModal, setCategoryDeleteModal] = useState({ open: false, category: '', links: [] });
    const [footerSectionShow, setFooterSectionShow] = useState(true);


    // Section settings
    const [settings, setSettings] = useState({
        footer_logo: "",
        footer_description: "We engineer high-performance automotive upgrades for those who appreciate the fine art of driving. Each component is precision-selected from our master manufacturing partners across the globe.",
        footer_cta_heading: "MBW Performance",
        footer_cta_subheading: "Join the Performance Elite Circle for Private Previews",
        footer_cta_placeholder: "Email Address...",
        footer_cta_btn: "Join",
        footer_copyright: "Copyrights © 2026 MBW Car Accessories. All rights reserved.",
        footer_powered_by: "Powered by MBW"
    });
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [settingsDraft, setSettingsDraft] = useState({});

    useEffect(() => {
        fetchLinks();
        fetchSocials();
        fetchSettings();
        fetchPaymentMethods();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${SETTINGS_API}?section=${SECTION_KEY}`, { credentials: 'include' });
            const data = await res.json();
            if (Object.keys(data).length > 0) setSettings(prev => ({ ...prev, ...data }));

            // Fetch global visibility
            const visibilityRes = await fetch(`${SETTINGS_API}?section=footer_section_show`, { credentials: 'include' });
            const visibilityData = await visibilityRes.json();
            if (visibilityData.footer_section_show !== undefined) {
                setFooterSectionShow(visibilityData.footer_section_show === 'true');
            }
        } catch (err) { console.error(err); }
    };

    const handleSaveSettings = async () => {
        try {
            await fetch(`${SETTINGS_API}/upsert`, { credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsDraft)
            });
            setSettings(prev => ({ ...prev, ...settingsDraft }));
            setIsEditingSettings(false);
            showNotification("Footer saved successfully!", "success");
        } catch (err) { showNotification("Update failed. Please try again.", "error"); }
    };

    const fetchLinks = async () => {
        try {
            const res = await fetch(LINKS_API, { credentials: 'include' });
            const data = await res.json();
            setLinks(data || []);
        } catch (err) { console.error(err); }
    };

    const fetchSocials = async () => {
        try {
            const res = await fetch(SOCIAL_API, { credentials: 'include' });
            const data = await res.json();
            setSocials(data || []);
        } catch (err) { console.error(err); }
    };

    const fetchPaymentMethods = async () => {
        try {
            const res = await fetch(PAYMENT_API, { credentials: 'include' });
            const data = await res.json();
            setPaymentMethods(data || []);
        } catch (err) { console.error(err); }
    };

    const handleLinkSave = async (e) => {
        e.preventDefault();
        try {
            const method = editingLink.id ? 'PUT' : 'POST';
            const url = editingLink.id ? `${LINKS_API}/${editingLink.id}` : LINKS_API;
            await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingLink)
            });
            fetchLinks();
            setEditingLink(null);
            showNotification("Link saved successfully!", "success");
        } catch (err) { showNotification("Update failed. Please try again.", "error"); }
    };

    const handleSocialSave = async (e) => {
        e.preventDefault();
        try {
            const method = editingSocial.id ? 'PUT' : 'POST';
            const url = editingSocial.id ? `${SOCIAL_API}/${editingSocial.id}` : SOCIAL_API;
            await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSocial)
            });
            fetchSocials();
            setEditingSocial(null);
            showNotification("Social account saved successfully!", "success");
        } catch (err) { showNotification("Update failed. Please try again.", "error"); }
    };

    const handlePaymentSave = async (e) => {
        e.preventDefault();
        try {
            const method = editingPaymentMethod.id ? 'PUT' : 'POST';
            const url = editingPaymentMethod.id ? `${PAYMENT_API}/${editingPaymentMethod.id}` : PAYMENT_API;
            await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPaymentMethod)
            });
            fetchPaymentMethods();
            setEditingPaymentMethod(null);
            showNotification("Payment method saved successfully!", "success");
        } catch (err) { showNotification("Update failed. Please try again.", "error"); }
    };

    const confirmDelete = async () => {
        const { type, id } = deleteModal;
        const api = type === 'link' ? LINKS_API : type === 'social' ? SOCIAL_API : PAYMENT_API;
        try {
            await fetch(`${api}/${id}`, { method: 'DELETE' , credentials: 'include' });
            if (type === 'link') fetchLinks();
            else if (type === 'social') fetchSocials();
            else fetchPaymentMethods();
            setDeleteModal({ open: false, type: '', id: null });
            showNotification("Item deleted successfully.", "success");
        } catch (err) { showNotification("Update failed. Please try again.", "error"); }
    };

    const handleReorderSocials = (newOrder) => {
        setSocials(newOrder);
        setHasChangedSocials(true);
    };

    const handleSaveSocialSequence = async () => {
        try {
            await fetch(`${SOCIAL_API}/reorder`, { credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds: socials.map(s => s.id) })
            });
            setHasChangedSocials(false);
            showNotification("Order saved successfully!", "success");
        } catch (err) { showNotification("Update failed. Please try again.", "error"); }
    };

    const handleSavePaymentSequence = async () => {
        try {
            await fetch(`${PAYMENT_API}/reorder`, { credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds: paymentMethods.map(p => p.id) })
            });
            setHasChangedPayments(false);
            showNotification("Order saved successfully!", "success");
        } catch (err) { showNotification("Update failed. Please try again.", "error"); }
    };

    const handleRenameConfirm = async () => {
        const { category, newName } = renameModal;
        if (!newName.trim() || newName === category) {
            setRenameModal({ open: false, category: '', newName: '' });
            return;
        }
        const catLinks = links.filter(l => l.category === category);
        try {
            await Promise.all(catLinks.map(l =>
                fetch(`${LINKS_API}/${l.id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...l, category: newName.trim() }) })
            ));
            fetchLinks();
            showNotification('Section renamed successfully!', 'success');
        } catch (err) { showNotification('Rename failed.', 'error'); }
        setRenameModal({ open: false, category: '', newName: '' });
    };

    const handleCategoryDelete = async () => {
        const { links: catLinks } = categoryDeleteModal;
        try {
            await Promise.all(catLinks.map(l =>
                fetch(`${LINKS_API}/${l.id}`, { method: 'DELETE', credentials: 'include' })
            ));
            fetchLinks();
            showNotification('Section dissolved.', 'success');
        } catch (err) { showNotification('Delete failed.', 'error'); }
        setCategoryDeleteModal({ open: false, category: '', links: [] });
    };

    const categories = Array.from(new Set(links.map(l => l.category)));

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">

                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Dynamic Footer</h1>
                        <p className="text-slate-500 font-medium">Manage any number of categories, links, and social accounts.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setEditingSocial({ platform: '', url: '#', icon_type: 'Instagram', status: 'Active' })}
                            className="px-6 py-3 bg-brand-secondary text-brand-primary rounded-2xl font-bold text-xs flex items-center gap-2"
                        >
                            <IconPlus size={18} /> Social Account
                        </button>
                        <button
                            onClick={() => setEditingPaymentMethod({ name: '', logo: '', status: 'Active' })}
                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg"
                        >
                            <IconPlus size={18} /> Payment Logo
                        </button>
                        <button
                            onClick={() => setEditingLink({ label: '', url: '#', category: categories[0] || 'Store', status: 'Active' })}
                            className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg flex items-center gap-2"
                        >
                            <IconPlus size={18} /> New Link
                        </button>
                    </div>
                </div>
              
              
              
                {/* Master Visibility Switch */}
                <div className="mb-10 max-w-xl">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${footerSectionShow ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                                {footerSectionShow ? <IconEye size={24} /> : <IconEyeOff size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Footer Visibility</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Footer Switch</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="space-y-1">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest block">Footer Status</span>
                                <p className="text-[11px] font-bold text-slate-400 italic">
                                    {footerSectionShow ? "Visible on All Pages" : "Hidden from All Pages"}
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const nextStatus = !footerSectionShow;
                                    setFooterSectionShow(nextStatus);
                                    try {
                                        await fetch(`${SETTINGS_API}/upsert`, {
                                            method: 'POST',
                                            credentials: 'include',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ footer_section_show: String(nextStatus) })
                                        });
                                        showNotification(`Global Footer is now ${nextStatus ? 'Visible' : 'Hidden'}`, "success");
                                    } catch (e) {
                                        showNotification("Failed to update visibility", "error");
                                    }
                                }}
                                className={`w-16 h-8 rounded-full relative transition-all duration-300 shadow-inner ${footerSectionShow ? "bg-emerald-500" : "bg-slate-300"}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${footerSectionShow ? "right-1" : "left-1"}`} />
                            </button>
                        </div>
                    </div>
                </div>
              
                {/* ── Brand Command (Settings Hub) ── */}
                <div className="mb-14 space-y-10">
                    <div className="flex items-end justify-between px-2">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Footer Command</h2>
                            <p className="text-slate-400 font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                                Ecosystem Identity & Marketing Control
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => { setSettingsDraft({ ...settings }); setIsEditingSettings(!isEditingSettings); }} className="h-12 px-8 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-white hover:shadow-xl transition-all active:scale-95">
                                {isEditingSettings ? "Dismiss Interface" : "Enter Designer Mode"}
                            </button>
                            {isEditingSettings && (
                                <button onClick={handleSaveSettings} className="h-12 px-8 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary transition-all shadow-xl shadow-slate-200 flex items-center gap-3 group/save">
                                    <IconDeviceFloppy size={20} className="group-hover:rotate-12 transition-transform" />
                                    Synchronize Metadata
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 01: Brand Identity */}
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 hover:shadow-2xl hover:shadow-slate-100 transition-all border-b-4 border-b-brand-primary">
                            <div className="flex items-center gap-6 border-b border-slate-50 pb-8">
                                <div className="w-14 h-14 bg-brand-secondary rounded-2xl flex items-center justify-center text-brand-primary shadow-sm">
                                    <IconSettings2 size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-800">Identity Hub</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Visual & Narrative Soul</p>
                                </div>
                            </div>
                            
                            {!isEditingSettings ? (
                                <div className="space-y-8">
                                    <div className="w-24 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-3">
                                        {settings.footer_logo ? <img src={settings.footer_logo} className="object-contain max-h-full" /> : <IconSettings2 size={32} className="text-slate-200" />}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-40">Mission Statement</label>
                                        <p className="text-xs font-bold font-serif italic text-slate-600 leading-relaxed line-clamp-3">{settings.footer_description}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <ImageUpload 
                                            label="Footer Brand Logo"
                                            currentUrl={settingsDraft.footer_logo}
                                            showNotification={showNotification}
                                            recSize="Horizontal"
                                            onUpload={(url) => setSettingsDraft({ ...settingsDraft, footer_logo: url })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex justify-between">
                                            Identity Description
                                            <span className={`text-[9px] font-bold tracking-normal transition-colors ${(settingsDraft.footer_description?.length || 0) >= 180 ? 'text-rose-500' : 'text-slate-400'}`}>
                                                {settingsDraft.footer_description?.length || 0} / 200
                                            </span>
                                        </label>
                                        <textarea 
                                            rows="4" 
                                            value={settingsDraft.footer_description || ''} 
                                            onChange={e => setSettingsDraft({...settingsDraft, footer_description: e.target.value})} 
                                            maxLength={200}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:bg-white resize-none" 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 02: Conversion Deck */}
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 hover:shadow-2xl hover:shadow-slate-100 transition-all border-b-4 border-b-brand-accent">
                            <div className="flex items-center gap-6 border-b border-slate-50 pb-8">
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-brand-accent shadow-sm">
                                    <IconDeviceFloppy size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-800">Capture Core</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Marketing Hook Settings</p>
                                </div>
                            </div>

                            {!isEditingSettings ? (
                                <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                    <div className="space-y-1">
                                        <h4 className="text-base font-black font-serif italic text-slate-800">{settings.footer_cta_heading || 'Join Us'}</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{settings.footer_cta_subheading}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 py-3 px-5 bg-white border border-slate-100 rounded-xl text-[9px] font-bold text-slate-300 italic truncate">{settings.footer_cta_placeholder}</div>
                                        <div className="py-3 px-5 bg-brand-accent text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-100">{settings.footer_cta_btn}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CTA Main Hook</label>
                                            <input type="text" value={settingsDraft.footer_cta_heading || ''} onChange={e => setSettingsDraft({...settingsDraft, footer_cta_heading: e.target.value})} className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Secondary Hook</label>
                                            <input type="text" value={settingsDraft.footer_cta_subheading || ''} onChange={e => setSettingsDraft({...settingsDraft, footer_cta_subheading: e.target.value})} className="w-full h-11 px-6 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Placeholder</label>
                                                <input type="text" value={settingsDraft.footer_cta_placeholder || ''} onChange={e => setSettingsDraft({...settingsDraft, footer_cta_placeholder: e.target.value})} className="w-full h-11 px-5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 italic" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Action Label</label>
                                                <input type="text" value={settingsDraft.footer_cta_btn || ''} onChange={e => setSettingsDraft({...settingsDraft, footer_cta_btn: e.target.value})} className="w-full h-11 px-5 bg-brand-accent text-slate-950 border-0 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 03: Meta Vault */}
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 hover:shadow-2xl hover:shadow-slate-100 transition-all border-b-4 border-b-slate-900">
                            <div className="flex items-center gap-6 border-b border-slate-50 pb-8">
                                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <IconSettings2 size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-800">Legacy Data</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Metadata & Copyright</p>
                                </div>
                            </div>

                            {!isEditingSettings ? (
                                <div className="space-y-8 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                                    <div className="space-y-3">
                                        <div className="text-[8px] font-black uppercase text-slate-300 tracking-widest px-1">Copyright Signature</div>
                                        <p className="text-xs font-bold text-slate-600">{settings.footer_copyright || 'Copyright © 2026'}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="text-[8px] font-black uppercase text-slate-300 tracking-widest px-1">Powered By Identity</div>
                                        <p className="text-xs font-bold text-slate-600">{settings.footer_powered_by || 'Powered by MBW'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Official Copyright</label>
                                        <input type="text" value={settingsDraft.footer_copyright || ''} onChange={e => setSettingsDraft({...settingsDraft, footer_copyright: e.target.value})} className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Partner Attribution</label>
                                        <input type="text" value={settingsDraft.footer_powered_by || ''} onChange={e => setSettingsDraft({...settingsDraft, footer_powered_by: e.target.value})} className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Payment Protocols (Credit Cards) ── */}
                <div className="bg-slate-50/30 rounded-[3.5rem] border border-slate-100 p-12 mb-14 relative group/payment">
                    <div className="flex items-center justify-between mb-12 px-2">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Protocols</h2>
                            <p className="text-slate-400 font-bold flex items-center gap-2 text-sm italic">
                                <span className="w-4 h-4 rounded-full bg-amber-500/10 flex items-center justify-center"><span className="w-2 h-2 bg-amber-500 rounded-full" /></span>
                                Display trusted transaction methods in your global footer.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            {hasChangedPayments && (
                                <button onClick={handleSavePaymentSequence} className="h-12 px-8 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all animate-bounce">
                                    Commit Protocols
                                </button>
                            )}
                            <button 
                                onClick={() => setEditingPaymentMethod({ name: '', logo: '', status: 'Active' })}
                                className="h-12 px-8 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-slate-200 flex items-center gap-4 hover:-translate-y-1 transition-all"
                            >
                                <IconPlus size={22} />
                                Register Logo
                            </button>
                        </div>
                    </div>
                    
                    <Reorder.Group axis="x" values={paymentMethods} onReorder={(newOrder) => { setPaymentMethods(newOrder); setHasChangedPayments(true); }} className="flex flex-wrap gap-8">
                        {paymentMethods.map(method => (
                            <Reorder.Item key={method.id} value={method} className="group/item relative bg-white border border-slate-100 rounded-[2rem] p-5 min-w-[300px] flex items-center justify-between gap-6 cursor-grab active:cursor-grabbing hover:border-brand-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center p-3 shadow-inner shrink-0 group-hover/item:scale-105 transition-transform">
                                        {method.logo ? <img src={method.logo} alt={method.name} className={`max-h-full object-contain ${method.status === 'Inactive' ? 'grayscale opacity-30' : ''}`} /> : <IconDeviceFloppy size={22} className="text-slate-200" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className={`text-sm font-black tracking-tight mb-1 truncate max-w-[120px] ${method.status === 'Active' ? 'text-slate-800' : 'text-slate-300 italic'}`}>{method.name}</h4>
                                        <div className="flex items-center gap-2">
                                             <div className={`w-1.5 h-1.5 rounded-full ${method.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`} />
                                             <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400">{method.status}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 border-l border-slate-50 pl-4 shrink-0">
                                    <button 
                                        onClick={() => {
                                            const nextStatus = method.status === 'Active' ? 'Inactive' : 'Active';
                                            fetch(`${PAYMENT_API}/${method.id}`, { 
                                                method: 'PUT', 
                                                headers: { 'Content-Type': 'application/json' }, 
                                                body: JSON.stringify({ ...method, status: nextStatus }),
                                                credentials: 'include'
                                            }).then(() => fetchPaymentMethods());
                                        }}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-slate-50 border border-slate-100 ${method.status === 'Active' ? 'text-emerald-500 hover:bg-emerald-100' : 'text-slate-300'}`}
                                        title={method.status === 'Active' ? 'Hide Protocol' : 'Show Protocol'}
                                    >
                                        {method.status === 'Active' ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                                    </button>
                                    <button onClick={() => setEditingPaymentMethod(method)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-white hover:shadow-md transition-all"><IconEdit size={16} /></button>
                                    <button onClick={() => setDeleteModal({ open: true, type: 'payment', id: method.id })} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><IconTrash size={16} /></button>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>

                {/* ── Network Presence (Social Media) ── */}
                <div className="bg-slate-50/30 rounded-[3.5rem] border border-slate-100 p-12 mb-14 relative group/social">
                    <div className="flex items-center justify-between mb-12 px-2">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Network Presence</h2>
                            <p className="text-slate-400 font-bold flex items-center gap-2 text-sm italic">
                                <span className="w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center"><span className="w-2 h-2 bg-blue-500 rounded-full" /></span>
                                Curate and synchronize your global automotive community links.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            {hasChangedSocials && (
                                <button onClick={handleSaveSocialSequence} className="h-12 px-8 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all animate-bounce">
                                    Commit Presence
                                </button>
                            )}
                            <button 
                                onClick={() => setEditingSocial({ platform: '', url: '#', icon_type: 'Instagram', status: 'Active' })}
                                className="h-12 px-8 bg-brand-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-violet-200 flex items-center gap-4 hover:-translate-y-1 transition-all"
                            >
                                <IconPlus size={22} />
                                Register Platform
                            </button>
                        </div>
                    </div>
                    
                    <Reorder.Group axis="x" values={socials} onReorder={handleReorderSocials} className="flex flex-wrap gap-10">
                        {socials.map(social => (
                            <Reorder.Item key={social.id} value={social} className="group/item relative bg-white border border-slate-100 rounded-[3rem] p-8 pr-12 min-w-[280px] flex items-center gap-8 cursor-grab active:cursor-grabbing hover:border-brand-primary/20 hover:shadow-2xl hover:shadow-violet-100/30 transition-all">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2.2rem] flex items-center justify-center text-brand-primary shadow-inner shrink-0 transition-transform group-hover/item:scale-110">
                                    <IconShare size={32} />
                                </div>
                                <div className="flex-1 min-w-0 pr-10">
                                    <h4 className={`text-base font-black tracking-tight mb-1 truncate ${social.status === 'Active' ? 'text-slate-800' : 'text-slate-300 italic'}`}>{social.platform}</h4>
                                    <div className="flex items-center gap-2">
                                         <div className={`w-2 h-2 rounded-full ${social.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-200'} animate-pulse`} />
                                         <p className="text-[11px] text-slate-400 font-bold italic truncate lowercase font-mono">{social.url}</p>
                                    </div>
                                </div>
                                <div className="absolute right-6 flex flex-col gap-3 transition-opacity">
                                    <button 
                                        onClick={() => {
                                            const nextStatus = social.status === 'Active' ? 'Inactive' : 'Active';
                                            fetch(`${SOCIAL_API}/${social.id}`, { 
                                                method: 'PUT', 
                                                headers: { 'Content-Type': 'application/json' }, 
                                                body: JSON.stringify({ ...social, status: nextStatus }),
                                                credentials: 'include'
                                            }).then(() => fetchSocials());
                                        }}
                                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all bg-slate-50 border border-slate-100 shadow-sm ${social.status === 'Active' ? 'text-emerald-500 hover:bg-emerald-100' : 'text-slate-300'}`}
                                    >
                                        {social.status === 'Active' ? <IconEye size={20} /> : <IconEyeOff size={20} />}
                                    </button>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => setEditingSocial(social)} className="w-11 h-11 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-primary hover:bg-white hover:shadow-xl transition-all shadow-sm"><IconEdit size={20} /></button>
                                        <button onClick={() => setDeleteModal({ open: true, type: 'social', id: social.id })} className="w-11 h-11 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"><IconTrash size={20} /></button>
                                    </div>
                                </div>
                                {social.status === 'Inactive' && <div className="absolute top-4 right-4 text-rose-300"><IconEyeOff size={14} /></div>}
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>

                {/* ── Link Management (Grouped by Category) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {categories.map((cat, idx) => {
                        const categoryLinks = links.filter(l => l.category === cat);
                        const isAllActive = categoryLinks.every(l => l.status === 'Active');
                        
                        return (
                            <div key={cat} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[620px] group/cat relative hover:shadow-2xl hover:shadow-violet-100/30 transition-all duration-700">
                                <div className="px-12 py-12 bg-slate-50 border-b border-slate-100 flex items-center justify-between group/cat-header">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-base font-black text-slate-900 tracking-[0.3em] uppercase font-serif italic">{cat}</h3>
                                        <div className="text-[10px] font-black bg-white border border-slate-200 text-slate-400 px-5 py-2 rounded-full w-fit flex items-center gap-2 shadow-sm">
                                            <IconLink size={14} /> {categoryLinks.length} Links
                                        </div>
                                    </div>
                                    <div className="flex gap-3 transition-opacity">
                                        <button 
                                            onClick={async () => {
                                                const nextStatus = isAllActive ? 'Inactive' : 'Active';
                                                try {
                                                    await Promise.all(categoryLinks.map(l => 
                                                        fetch(`${LINKS_API}/${l.id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...l, status: nextStatus }) })
                                                    ));
                                                    fetchLinks();
                                                    showNotification(`Section ${nextStatus}`, "success");
                                                } catch (err) { showNotification("Bulk update failed.", "error"); }
                                            }}
                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all bg-white border border-slate-200 shadow-sm ${isAllActive ? 'text-emerald-500' : 'text-slate-300'}`}
                                            title="Toggle Group Visibility"
                                        >
                                            {isAllActive ? <IconEye size={20} /> : <IconEyeOff size={20} />}
                                        </button>
                                        <button 
                                            onClick={() => setRenameModal({ open: true, category: cat, newName: cat })}
                                            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-brand-primary transition-all"
                                        >
                                            <IconPencil size={20} />
                                        </button>
                                        <button 
                                            onClick={() => setCategoryDeleteModal({ open: true, category: cat, links: categoryLinks })}
                                            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white border border-slate-200 shadow-sm text-rose-300 hover:text-rose-500 transition-all"
                                        >
                                            <IconTrash size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                                    <Reorder.Group axis="y" values={categoryLinks} onReorder={(newOrder) => {
                                        const otherLinks = links.filter(l => l.category !== cat);
                                        setLinks([...otherLinks, ...newOrder]);
                                        setHasChangedLinks(true);
                                    }} className="divide-y divide-slate-100 relative p-6">
                                        {categoryLinks.map((link) => (
                                            <div key={link.id} className="group/item p-6 rounded-[1.5rem] hover:bg-slate-50 flex items-center justify-between transition-all mb-2 last:mb-0 border border-transparent hover:border-slate-100">
                                                <div className="min-w-0 pr-6">
                                                    <h5 className={`text-sm font-bold mb-1 uppercase tracking-wider ${link.status === 'Active' ? 'text-slate-800' : 'text-slate-300 italic'}`}>{link.label}</h5>
                                                    <div className="flex items-center gap-2">
                                                        <IconLink size={10} className="text-slate-300" />
                                                        <p className="text-[10px] text-slate-400 font-medium italic opacity-50 tracking-wider font-mono lowercase">{link.url}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 transition-all">
                                                    <button 
                                                        onClick={() => {
                                                            const nextStatus = link.status === 'Active' ? 'Inactive' : 'Active';
                                                            fetch(`${LINKS_API}/${link.id}`, { 
                                                                method: 'PUT', 
                                                                headers: { 'Content-Type': 'application/json' }, 
                                                                body: JSON.stringify({ ...link, status: nextStatus }),
                                                                credentials: 'include'
                                                            }).then(() => fetchLinks());
                                                        }}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white border border-slate-100 shadow-sm ${link.status === 'Active' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300'}`}
                                                    >
                                                        {link.status === 'Active' ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                                                    </button>
                                                    <button onClick={() => setEditingLink(link)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-brand-primary hover:bg-brand-secondary transition-all shadow-sm"><IconEdit size={18} /></button>
                                                    <button onClick={() => setDeleteModal({ open: true, type: 'link', id: link.id })} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"><IconTrash size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </Reorder.Group>
                                </div>
                                {/* Footer Add Link inside category */}
                                <div className="p-10 border-t border-slate-100 bg-slate-50/30">
                                    <button 
                                        onClick={() => setEditingLink({ label: '', url: '#', category: cat, status: 'Active' })}
                                        className="w-full py-6 bg-white text-brand-primary border-2 border-dashed border-slate-200 rounded-[2.2rem] flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all active:scale-[0.98] group/add shadow-lg shadow-slate-100"
                                    >
                                        <IconPlus size={22} className="group-hover/add:rotate-90 transition-transform duration-500" />
                                        <span>Add Link</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {/* Add Category Placeholder */}
                    <button 
                        onClick={() => setEditingLink({ label: '', url: '#', category: '', status: 'Active' })}
                        className="bg-slate-50/50 border-[3px] border-dashed border-slate-200 rounded-[4rem] p-12 flex flex-col items-center justify-center gap-12 text-slate-300 hover:text-brand-primary hover:border-brand-primary hover:bg-white transition-all h-[620px] group/new relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover/new:opacity-100 transition-opacity" />
                        <div className="w-28 h-28 rounded-[3.5rem] bg-white shadow-2xl flex items-center justify-center group-hover/new:scale-110 group-hover/new:rotate-12 transition-all relative z-10"><IconPlus size={54} /></div>
                        <div className="text-center space-y-4 relative z-10">
                             <span className="block text-sm font-black uppercase tracking-[0.6em] text-slate-400 group-hover/new:text-brand-primary transition-colors">Manifest Section</span>
                             <p className="text-[11px] font-medium italic opacity-40">Extend your automotive ecosystem into a new dimension.</p>
                        </div>
                    </button>
                </div>

                {hasChangedLinks && (
                    <div className="fixed bottom-8 right-8 z-[70]">
                        <button onClick={async () => {
                            try {
                                await fetch(`${LINKS_API}/reorder`, { credentials: 'include',
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ orderedIds: links.map(l => l.id) })
                                });
                                setHasChangedLinks(false);
                                showNotification("Link order saved!", "success");
                            } catch (err) { showNotification("Error.", "error"); }
                        }} className="px-10 py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-200/50 flex items-center gap-3">
                            <IconDeviceFloppy size={20} /> Save New Link Order
                        </button>
                    </div>
                )}

                {/* Modals ── Edit Link */}
                {editingLink && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 relative">
                            <button onClick={() => setEditingLink(null)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors"><IconX size={24} /></button>
                            <h2 className="text-2xl font-serif italic text-slate-900 mb-8">{editingLink.id ? 'Refine Link' : 'New Link'}</h2>
                            <form onSubmit={handleLinkSave} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase mb-2">Category Name (Type new or same)</label>
                                    <input type="text" list="cat-list" value={editingLink.category} onChange={e => setEditingLink({ ...editingLink, category: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold" placeholder="e.g. Policies, Resources..." required />
                                    <datalist id="cat-list">{categories.map(c => <option key={c} value={c} />)}</datalist>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase mb-2">Link Label</label>
                                    <input type="text" value={editingLink.label} onChange={e => setEditingLink({ ...editingLink, label: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-black uppercase" placeholder="..." required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase mb-2">Target Path / URL</label>
                                    <input type="text" value={editingLink.url} onChange={e => setEditingLink({ ...editingLink, url: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs text-slate-500 italic" placeholder="/page..." />
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <button type="button" onClick={() => setEditingLink(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase rounded-2xl">Cancel</button>
                                    <button type="submit" className="flex-[2] py-4 bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl">Apply Link</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modals ── Edit Social */}
                {editingSocial && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 relative text-center">
                            <h2 className="text-2xl font-serif italic text-slate-900 mb-8">{editingSocial.id ? 'Social Channel' : 'New Account'}</h2>
                            <form onSubmit={handleSocialSave} className="space-y-6 text-left">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-brand-primary uppercase mb-2">Platform</label>
                                        <input type="text" value={editingSocial.platform} onChange={e => setEditingSocial({ ...editingSocial, platform: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold" placeholder="Instagram..." required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-brand-primary uppercase mb-2">Icon Set</label>
                                        <select value={editingSocial.icon_type} onChange={e => setEditingSocial({ ...editingSocial, icon_type: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold">
                                            {['Instagram', 'Pinterest', 'Threads', 'Facebook', 'Twitter', 'LinkedIn', 'YouTube', 'TikTok'].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase mb-2">Full Profile URL</label>
                                    <input type="text" value={editingSocial.url} onChange={e => setEditingSocial({ ...editingSocial, url: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-[11px] text-slate-500" placeholder="https://..." required />
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <button type="button" onClick={() => setEditingSocial(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase rounded-2xl">Dismiss</button>
                                    <button type="submit" className="flex-[2] py-4 bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl">Establish Account</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modals ── Edit Payment Method */}
                {editingPaymentMethod && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 relative text-center">
                            <h2 className="text-2xl font-serif italic text-slate-900 mb-8">{editingPaymentMethod.id ? 'Refine Protocol' : 'New Protocol'}</h2>
                            <form onSubmit={handlePaymentSave} className="space-y-6 text-left">
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase mb-2">Protocol Name</label>
                                    <input type="text" value={editingPaymentMethod.name} onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold" placeholder="Visa, MasterCard..." required />
                                </div>
                                <div className="space-y-4">
                                    <ImageUpload 
                                        label="Protocol Logo"
                                        currentUrl={editingPaymentMethod.logo}
                                        showNotification={showNotification}
                                        recSize="200x120px"
                                        onUpload={(url) => setEditingPaymentMethod({ ...editingPaymentMethod, logo: url })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase mb-2">Visibility Status</label>
                                    <select value={editingPaymentMethod.status} onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, status: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold">
                                        <option value="Active">Operational (Active)</option>
                                        <option value="Inactive">Decommissioned (Inactive)</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <button type="button" onClick={() => setEditingPaymentMethod(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase rounded-2xl">Dismiss</button>
                                    <button type="submit" className="flex-[2] py-4 bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl">Commit Protocol</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, type: '', id: null })} title="Confirm Disposal">
                    <div className="text-center space-y-8 p-4">
                        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-sm"><IconTrash size={48} /></div>
                        <p className="text-slate-500 text-sm font-medium">This action will permanently remove this {deleteModal.type === 'link' ? 'navigation link' : 'social channel'} from the live footer.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setDeleteModal({ open: false, type: '', id: null })} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold text-xs uppercase rounded-2xl">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-100">Proceed & Delete</button>
                        </div>
                    </div>
                </Modal>

           

                {/* Rename Category Modal */}
                {renameModal.open && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 relative">
                            <button onClick={() => setRenameModal({ open: false, category: '', newName: '' })} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors"><IconX size={24} /></button>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-brand-secondary rounded-2xl flex items-center justify-center text-brand-primary">
                                    <IconPencil size={26} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif italic text-slate-900">Rename Section</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evolve section identity</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase mb-2">New Section Name</label>
                                    <input
                                        type="text"
                                        value={renameModal.newName}
                                        onChange={e => setRenameModal({ ...renameModal, newName: e.target.value })}
                                        onKeyDown={e => e.key === 'Enter' && handleRenameConfirm()}
                                        autoFocus
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary focus:bg-white text-sm font-bold text-slate-800 transition-all"
                                        placeholder="e.g. Client Services..."
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setRenameModal({ open: false, category: '', newName: '' })} className="flex-1 py-4 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
                                    <button type="button" onClick={handleRenameConfirm} className="flex-[2] py-4 bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:bg-brand-accent transition-all">Rename Section</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Delete Modal */}
                {categoryDeleteModal.open && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 relative">
                            <button onClick={() => setCategoryDeleteModal({ open: false, category: '', links: [] })} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors"><IconX size={24} /></button>
                            <div className="text-center space-y-6">
                                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <IconTrash size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-serif italic text-slate-900">Dissolve Section?</h2>
                                    <p className="text-slate-500 text-sm font-medium">
                                        This will permanently delete the <span className="font-black text-slate-800">"{categoryDeleteModal.category}"</span> section and all <span className="font-black text-rose-500">{categoryDeleteModal.links.length} link{categoryDeleteModal.links.length !== 1 ? 's' : ''}</span> inside it.
                                    </p>
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button onClick={() => setCategoryDeleteModal({ open: false, category: '', links: [] })} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold text-xs uppercase rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                                    <button onClick={handleCategoryDelete} className="flex-1 py-4 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all">Dissolve Section</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                  
 </div>
        </AdminLayout>
    );
};

export default FooterManagement;


