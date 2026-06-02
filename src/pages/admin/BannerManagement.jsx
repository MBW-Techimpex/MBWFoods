import React, { useState } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import {

    IconPlus,
    IconPhoto,
    IconEdit,
    IconTrash,
    IconEye,
    IconSearch,
    IconGripVertical,
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconArrowRight,
    IconDeviceFloppy,
    IconUpload,
    IconX,
    IconEyeOff
} from "@tabler/icons-react";
import { Reorder } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useNotification } from "../../context/NotificationContext";
import { cn } from "../../lib/utils";
import Modal from "../../components/ui/Modal";
import { getImageUrl } from "../../utils/imageHelper";
import { ImageUpload } from "../../components/admin/UploadComponents";

const IMAGE_MAP = {};

const initialBanners = [];

const BannerManagement = () => {
    const API_URL = `${API_BASE}/api/banners`;
    const [banners, setBanners] = useState(initialBanners);
    const [hasChanged, setHasChanged] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const { showNotification } = useNotification();

    // Modal state for actions
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [modalType, setModalType] = useState("prompt"); // 'prompt' or 'confirm_delete'
    const [promptTitle, setModalTitle] = useState("");
    const [promptValue, setPromptValue] = useState("");
    const [promptCallback, setPromptCallback] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [bannerSectionShow, setBannerSectionShow] = useState(true);

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const isNew = !editingBanner.id;
            const url = isNew ? API_URL : `${API_URL}/${editingBanner.id}`;
            const method = isNew ? 'POST' : 'PUT';

            await fetch(url, {
                credentials: 'include',
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingBanner)
            });
            
            fetchBanners();
            setEditingBanner(null);
            showNotification(isNew ? "Banner created successfully!" : "Banner updated successfully!", "success");
        } catch (error) {
            console.error(error);
            showNotification("Unexpected error occurred while saving the banner.", "error");
        }
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showNotification("File is too large (max 5MB).", "error");
            return;
        }

        showNotification("Compressing and uploading image...", "info");

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                credentials: 'include',
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.imageUrl) {
                setEditingBanner({ ...editingBanner, [field]: data.imageUrl });
                showNotification(`Optimized: ${data.originalSize} KB → ${data.compressedSize} KB`, "success");
            } else {
                showNotification(data.error || "Upload failed.", "error");
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showNotification("Upload failed. Please try again.", "error");
        }
    };

    React.useEffect(() => {
        fetchBanners();
        fetchSectionSettings();
    }, []);

    const fetchSectionSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/section-settings?section=banner`, { credentials: 'include' });
            const data = await res.json();
            if (data.banner_section_show !== undefined) {
                setBannerSectionShow(data.banner_section_show === 'true');
            }
        } catch (err) {
            console.error("Failed to fetch section settings", err);
        }
    };

    const fetchBanners = async () => {
        try {
            const res = await fetch(API_URL, { credentials: 'include' });
            const data = await res.json();
            if (data && data.length > 0) {
                setBanners(data);
            } else {
                setBanners([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReorder = (newOrder) => {
        setBanners(newOrder);
        setHasChanged(true);
    };

    // Auto-save sequence on change
    React.useEffect(() => {
        if (!hasChanged) return;
        
        const timer = setTimeout(async () => {
            try {
                const orderedIds = banners.map(b => b.id);
                await fetch(`${API_URL}/reorder`, {
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderedIds })
                });
                setHasChanged(false);
                showNotification("Sequence updated automatically!", "success");
            } catch (err) {
                console.error(err);
                showNotification("Failed to save sequence.", "error");
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [banners, hasChanged]);

    const handleCreateBanner = () => {
        setEditingBanner({
            title: "New Banner Section",
            subtitle: "Luxury car accessories engineered for performance and comfort. Experience the pinnacle of automotive refinement.",
            topTagline: "MBW · CAR ACCESSORIES",
            promoBadge: "IN STOCK",
            promoTitle: "New Arrival",
            promoSubtitle: "Premium Gear",
            promoInfo: "Starting from ₹999",
            image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop",
            type: 'Hero Slider',
            status: 'Active',
            btnOneText: "Explore Now",
            btnOneLink: "/collection/interior",
            btnTwoText: "View Gallery",
            btnTwoLink: "/gallery",
            statOneNum: "12K+",
            statOneLabel: "Happy Clients",
            statTwoNum: "98%",
            statTwoLabel: "Quality Rating",
            statThreeNum: "24/7",
            statThreeLabel: "Support"
        });
    };

    const handleDeleteBanner = (id) => {
        setDeletingId(id);
        setModalTitle("Confirm Deletion");
        setModalType("confirm_delete");
        setIsPromptModalOpen(true);
    };

    const executeDelete = async () => {
        try {
            await fetch(`${API_URL}/${deletingId}`, { method: 'DELETE', credentials: 'include' });
            fetchBanners();
            showNotification("Banner deleted successfully.", "success");
            setIsPromptModalOpen(false);
        } catch (e) {
            console.error(e);
            showNotification("Failed to delete banner.", "error");
        }
    };

    const handleEditBannerTitle = (banner) => {
        setModalTitle("Edit Banner Title");
        setModalType("prompt");
        setPromptCallback(() => async (newTitle) => {
            if (newTitle && newTitle.trim() !== banner.title) {
                try {
                    await fetch(`${API_URL}/${banner.id}`, {
                        credentials: 'include',
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: newTitle.trim() })
                    });
                    fetchBanners();
                    showNotification("Title updated successfully.", "success");
                } catch (e) {
                    console.error(e);
                    showNotification("Failed to update title.", "error");
                }
            }
        });
        setIsPromptModalOpen(true);
    };

    const handleToggleStatus = async (banner) => {
        try {
            const newStatus = banner.status === 'Active' ? 'Inactive' : 'Active';
            await fetch(`${API_URL}/${banner.id}`, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchBanners();
        } catch (e) { console.error(e); }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Banner Management</h1>
                        <p className="text-slate-500 font-medium">Control your shop's promotional displays and hero sliders.</p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleCreateBanner} className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <IconPlus size={18} />
                            Create New Banner
                        </button>
                    </div>
                </div>

                {/* Master Visibility Switch */}
                <div className="mb-10 max-w-xl">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                bannerSectionShow ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                            )}>
                                {bannerSectionShow ? <IconEye size={24} /> : <IconEyeOff size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Section Visibility</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Banner Switch</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="space-y-1">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest block">Banner Status</span>
                                <p className="text-[11px] font-bold text-slate-400 italic">
                                    {bannerSectionShow ? "Visible on Homepage" : "Hidden from Homepage"}
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const nextStatus = !bannerSectionShow;
                                    setBannerSectionShow(nextStatus);
                                    try {
                                        await fetch(`${API_BASE}/api/section-settings/upsert`, {
                                            method: 'POST',
                                            credentials: 'include',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ banner_section_show: String(nextStatus) })
                                        });
                                        showNotification(`Banner Section is now ${nextStatus ? 'Visible' : 'Hidden'}`, "success");
                                    } catch (e) {
                                        showNotification("Failed to update visibility", "error");
                                    }
                                }}
                                className={cn(
                                    "w-16 h-8 rounded-full relative transition-all duration-300 shadow-inner",
                                    bannerSectionShow ? "bg-emerald-500" : "bg-slate-300"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md",
                                    bannerSectionShow ? "right-1" : "left-1"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Table Designer */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-20">Preview & Title</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Banner Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Settings</th>
                                </tr>
                            </thead>
                        </table>

                        <Reorder.Group axis="y" values={banners} onReorder={handleReorder} className="divide-y divide-slate-50">
                            {banners.map((banner) => (
                                <Reorder.Item
                                    key={banner.id}
                                    value={banner}
                                    className="group hover:bg-brand-secondary/30 transition-all duration-300 w-full flex items-center cursor-grab active:cursor-grabbing relative"
                                >
                                    <div className="flex-1 flex items-center py-4">
                                        {/* Grip handle */}
                                        <div className="pl-8 text-slate-200 group-hover:text-brand-primary transition-colors">
                                            <IconGripVertical size={24} />
                                        </div>

                                        {/* Thumbnail & Title */}
                                        <div className="flex items-center gap-6 pl-6 flex-1 min-w-[300px]">
                                            <div className="w-32 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                <img src={IMAGE_MAP[banner.image] || getImageUrl(banner.image)} alt={banner.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 tracking-tight">{banner.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Banner Component #0{banner.id}</p>
                                            </div>
                                        </div>

                                        {/* Type */}
                                        <div className="px-8 w-[200px] text-center">
                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-200 shadow-sm">{banner.type}</span>
                                        </div>

                                        {/* Status */}
                                        <div className="px-8 w-[180px]">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                                banner.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                                            )}>
                                                {banner.status === "Active" ? <IconCircleCheckFilled size={14} /> : <IconCircleXFilled size={14} />}
                                                {banner.status}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="px-8 flex items-center justify-end gap-3 min-w-[180px]">
                                            <button onClick={() => handleToggleStatus(banner)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-blue-500 hover:shadow-xl transition-all border border-transparent hover:border-blue-50" title="Toggle active status">
                                                <IconEye size={18} />
                                            </button>
                                            <button onClick={() => setEditingBanner(banner)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-brand-primary hover:shadow-xl transition-all border border-transparent hover:border-violet-50 focus:ring-4 focus:ring-violet-50" title="Edit content">
                                                <IconEdit size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteBanner(banner.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:shadow-xl transition-all border border-transparent hover:border-red-100" title="Delete banner">
                                                <IconTrash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>

                    <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Showing {banners.length} promotional components. drag any row to redefine their priority on the homepage.</p>
                    </div>
                </div>

                {/* Preview Hint */}
                <div className="mt-12 p-8 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 animate-bounce">
                        <IconPhoto size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-600">Homepage Sequence Preview</h3>
                    <p className="text-slate-400 text-sm max-w-md mt-2">Adjust your banners to see exactly how they will transition on your storefront. Visual simulation coming soon.</p>
                </div>

                {/* Content Editor Modal */}
                {editingBanner && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar p-10 animate-fade-in relative">
                            {/* Close Button */}
                            <button 
                                onClick={() => setEditingBanner(null)}
                                className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-brand-primary hover:bg-white hover:shadow-xl transition-all group z-30"
                            >
                                <IconX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            <h2 className="text-3xl font-black text-slate-900 font-serif mb-8 text-center italic">{editingBanner.id ? 'Edit Details' : 'Create New Banner'} <span className="not-italic block text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{editingBanner.title}</span></h2>

                            <form onSubmit={handleEditSave} className="space-y-6">
                                {/* Core Data */}
                                <div className="space-y-6">
                                    {/* Type Selection */}
                                    <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 mb-6">
                                        <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3">Banner Layout Model</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <button 
                                                type="button"
                                                onClick={() => setEditingBanner({ ...editingBanner, type: 'Hero Slider' })}
                                                className={cn(
                                                    "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                                                    editingBanner.type === 'Hero Slider' ? "bg-white border-brand-primary shadow-lg shadow-violet-100" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                                                )}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-violet-100 text-brand-primary flex items-center justify-center">
                                                    <IconEdit size={24} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-center">Interactive Hero</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setEditingBanner({ ...editingBanner, type: 'Poster Image' })}
                                                className={cn(
                                                    "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                                                    editingBanner.type === 'Poster Image' ? "bg-white border-brand-primary shadow-lg shadow-violet-100" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                                                )}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                                                    <IconPhoto size={24} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-center">Poster Mode</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setEditingBanner({ ...editingBanner, type: 'Jio Hotstar' })}
                                                className={cn(
                                                    "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                                                    editingBanner.type === 'Jio Hotstar' ? "bg-white border-brand-primary shadow-lg shadow-violet-100" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                                                )}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-center">Jio Hotstar</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Text Content - Hidden in Poster Mode */}
                                    {(editingBanner.type === 'Hero Slider' || editingBanner.type === 'Jio Hotstar') && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div>
                                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Headline Title</label>
                                                <input type="text" value={editingBanner.title || ''} onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-bold text-slate-700" required />
                                            </div>
                                            <div className="relative">
                                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2 flex justify-between">
                                                    Typography Subtitle
                                                    <span className={cn(
                                                        "text-[9px] font-bold tracking-normal transition-colors",
                                                        (editingBanner.subtitle?.length || 0) >= 180 ? "text-rose-500" : "text-slate-400"
                                                    )}>
                                                        {editingBanner.subtitle?.length || 0} / 200
                                                    </span>
                                                </label>
                                                <textarea 
                                                    value={editingBanner.subtitle || ''} 
                                                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })} 
                                                    maxLength={200}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium text-slate-600 leading-relaxed resize-none" 
                                                    rows="3" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Top Display Tagline</label>
                                                <input type="text" value={editingBanner.topTagline || ''} onChange={(e) => setEditingBanner({ ...editingBanner, topTagline: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-bold text-slate-700" placeholder="e.g. MBW · CAR ACCESSORIES" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Image Upload Area */}
                                    <div className={cn(
                                        "grid gap-4",
                                        editingBanner.type === 'Poster Image' ? "grid-cols-1" : "grid-cols-3"
                                    )}>
                                        <div className="space-y-3">
                                            <ImageUpload
                                                label={editingBanner.type === 'Poster Image' ? 'Full-Width Poster Image' : 'Main Background'}
                                                currentUrl={editingBanner.image}
                                                showNotification={showNotification}
                                                recSize="1920x800px"
                                                onUpload={(url) => setEditingBanner({ ...editingBanner, image: url })}
                                            />
                                        </div>
                                        
                                        {editingBanner.type === 'Hero Slider' && (
                                            <>
                                                <div className="space-y-3">
                                                    <ImageUpload
                                                        label="Top-Right Float"
                                                        currentUrl={editingBanner.imageSecondary}
                                                        showNotification={showNotification}
                                                        recSize="800x800px"
                                                        onUpload={(url) => setEditingBanner({ ...editingBanner, imageSecondary: url })}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <ImageUpload
                                                        label="Bottom-Right Float"
                                                        currentUrl={editingBanner.imageTertiary}
                                                        showNotification={showNotification}
                                                        recSize="800x800px"
                                                        onUpload={(url) => setEditingBanner({ ...editingBanner, imageTertiary: url })}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Buttons & Stats - Hidden in Poster Mode */}
                                    {(editingBanner.type === 'Hero Slider' || editingBanner.type === 'Jio Hotstar') && (
                                        <>
                                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Action Buttons Structure</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <input type="text" placeholder="Primary Button Text" value={editingBanner.btnOneText || ''} onChange={(e) => setEditingBanner({ ...editingBanner, btnOneText: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-primary text-sm font-bold text-slate-700" />
                                                    </div>
                                                    <div>
                                                        <input type="text" placeholder="Primary URL Link (/slug)" value={editingBanner.btnOneLink || ''} onChange={(e) => setEditingBanner({ ...editingBanner, btnOneLink: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-primary text-sm font-medium text-slate-500" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <input type="text" placeholder="Secondary Button Text" value={editingBanner.btnTwoText || ''} onChange={(e) => setEditingBanner({ ...editingBanner, btnTwoText: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-primary text-sm font-bold text-slate-700" />
                                                    </div>
                                                    <div>
                                                        <input type="text" placeholder="Secondary URL Link (/slug)" value={editingBanner.btnTwoLink || ''} onChange={(e) => setEditingBanner({ ...editingBanner, btnTwoLink: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-primary text-sm font-medium text-slate-500" />
                                                    </div>
                                                </div>
                                            </div>

                                            {editingBanner.type === 'Hero Slider' && (
                                                <div className="p-6 bg-brand-secondary/30 rounded-3xl border border-brand-primary/10 space-y-4">
                                                    <h3 className="text-xs font-black text-brand-primary/70 uppercase tracking-widest mb-4">Hero Statistic Metrics</h3>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="space-y-2">
                                                            <input type="text" placeholder="Number (12K+)" value={editingBanner.statOneNum || ''} onChange={(e) => setEditingBanner({ ...editingBanner, statOneNum: e.target.value })} className="w-full px-4 py-3 bg-white border border-white rounded-xl focus:border-brand-primary outline-none font-bold text-slate-800 text-center" />
                                                            <input type="text" placeholder="Label Details" value={editingBanner.statOneLabel || ''} onChange={(e) => setEditingBanner({ ...editingBanner, statOneLabel: e.target.value })} className="w-full px-4 py-3 bg-white border border-white rounded-xl focus:border-brand-primary outline-none text-xs font-medium text-slate-500 text-center uppercase tracking-widest" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <input type="text" placeholder="Number (98%)" value={editingBanner.statTwoNum || ''} onChange={(e) => setEditingBanner({ ...editingBanner, statTwoNum: e.target.value })} className="w-full px-4 py-3 bg-white border border-white rounded-xl focus:border-brand-primary outline-none font-bold text-slate-800 text-center" />
                                                            <input type="text" placeholder="Label Details" value={editingBanner.statTwoLabel || ''} onChange={(e) => setEditingBanner({ ...editingBanner, statTwoLabel: e.target.value })} className="w-full px-4 py-3 bg-white border border-white rounded-xl focus:border-brand-primary outline-none text-xs font-medium text-slate-500 text-center uppercase tracking-widest" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <input type="text" placeholder="Number (2hr)" value={editingBanner.statThreeNum || ''} onChange={(e) => setEditingBanner({ ...editingBanner, statThreeNum: e.target.value })} className="w-full px-4 py-3 bg-white border border-white rounded-xl focus:border-brand-primary outline-none font-bold text-slate-800 text-center" />
                                                            <input type="text" placeholder="Label Details" value={editingBanner.statThreeLabel || ''} onChange={(e) => setEditingBanner({ ...editingBanner, statThreeLabel: e.target.value })} className="w-full px-4 py-3 bg-white border border-white rounded-xl focus:border-brand-primary outline-none text-xs font-medium text-slate-500 text-center uppercase tracking-widest" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-6 bg-slate-900/5 rounded-3xl border border-slate-200/50 space-y-4">
                                                <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">Floating Promo Card</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Badge Text</label>
                                                        <input type="text" value={editingBanner.promoBadge || ''} onChange={(e) => setEditingBanner({ ...editingBanner, promoBadge: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-primary text-[10px] font-black uppercase tracking-widest" placeholder="IN SEASON NOW" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Small Info Text</label>
                                                        <input type="text" value={editingBanner.promoInfo || ''} onChange={(e) => setEditingBanner({ ...editingBanner, promoInfo: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-primary text-xs font-medium text-slate-500" placeholder="From ₹999 · Global Delivery" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Card Heading</label>
                                                        <input type="text" value={editingBanner.promoTitle || ''} onChange={(e) => setEditingBanner({ ...editingBanner, promoTitle: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-primary text-sm font-black text-slate-800" placeholder="Summer" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Card Subtitle (Italic)</label>
                                                        <input type="text" value={editingBanner.promoSubtitle || ''} onChange={(e) => setEditingBanner({ ...editingBanner, promoSubtitle: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-primary text-sm font-serif italic text-slate-600" placeholder="Performance Parts" />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setEditingBanner(null)} className="w-1/3 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">Discard</button>
                                    <button type="submit" className="w-2/3 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all flex justify-center items-center gap-2">
                                        <IconDeviceFloppy size={16} /> Save Component Data
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Prompt Modal */}
                <Modal
                    isOpen={isPromptModalOpen}
                    onClose={() => setIsPromptModalOpen(false)}
                    title={promptTitle}
                >
                    <div className="space-y-6">
                        {modalType === 'confirm_delete' ? (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-bloom-pulse">
                                    <IconTrash size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-800">Delete Permanently?</h3>
                                    <p className="text-slate-500 text-sm font-medium">
                                        Are you sure you want to remove this banner section? This action is irreversible.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-xs font-black text-brand-primary uppercase tracking-widest px-1">
                                    Banner Title
                                </label>
                                <input
                                    type="text"
                                    value={promptValue}
                                    onChange={(e) => setPromptValue(e.target.value)}
                                    placeholder="Enter title..."
                                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/20 transition-all font-bold text-slate-800 shadow-sm"
                                    autoFocus
                                />
                            </div>
                        )}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setIsPromptModalOpen(false)}
                                className="flex-1 h-14 bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (modalType === 'confirm_delete') {
                                        executeDelete();
                                    } else {
                                        promptCallback(promptValue);
                                        setIsPromptModalOpen(false);
                                    }
                                }}
                                className={cn(
                                    "flex-1 h-14 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all font-sans",
                                    modalType === 'confirm_delete' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-100" : "bg-brand-primary hover:bg-slate-800 shadow-slate-200"
                                )}
                            >
                                {modalType === 'confirm_delete' ? 'Confirm Delete' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default BannerManagement;



