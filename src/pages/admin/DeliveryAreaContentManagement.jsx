import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import { IconDeviceFloppy, IconUpload, IconPhoto, IconPlus, IconTrash, IconClock, IconShoppingCart, IconCalendar } from "@tabler/icons-react";
import { useNotification } from "../../context/NotificationContext";
import { getImageUrl } from "../../utils/imageHelper";
import Modal from "../../components/ui/Modal";

const DeliveryAreaContentManagement = () => {
    const CONTENT_API = `${API_BASE}/api/delivery-areas/content`;
    const POLICY_API = `${API_BASE}/api/delivery-areas/policies`;
    
    const [content, setContent] = useState({
        bannerImage: '',
        bannerTitle: '',
        bannerSubtitle: '',
        bannerDescription: '',
        specializedTitle: '',
        specializedDescription: '',
        hospitalTitle: '',
        hospitalText: '',
        funeralTitle: '',
        funeralText: ''
    });
    
    const [policies, setPolicies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showNotification } = useNotification();
    
    // Modal state for policies
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [currentPolicy, setCurrentPolicy] = useState({ title: '', description: '', iconName: 'clock', position: 0 });
    const [modalMode, setModalMode] = useState("add");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [contentRes, policyRes] = await Promise.all([
                fetch(CONTENT_API, { credentials: 'include' }),
                fetch(POLICY_API, { credentials: 'include' })
            ]);
            const contentData = await contentRes.json();
            const policyData = await policyRes.json();
            
            if (contentData) setContent(contentData);
            if (Array.isArray(policyData)) setPolicies(policyData);
            
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setIsLoading(false);
            showNotification("Failed to load delivery area content.", "error");
        }
    };

    const handleSaveContent = async (e) => {
        e.preventDefault();
        try {
            await fetch(CONTENT_API, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
            showNotification("Content updated successfully!", "success");
        } catch (error) {
            console.error(error);
            showNotification("Failed to update content.", "error");
        }
    };

    const handleSavePolicy = async (e) => {
        e.preventDefault();
        try {
            const method = modalMode === "add" ? "POST" : "PUT";
            const url = modalMode === "add" ? POLICY_API : `${POLICY_API}/${currentPolicy.id}`;
            
            await fetch(url, {
                credentials: 'include',
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentPolicy)
            });
            
            showNotification(`Policy ${modalMode === "add" ? "added" : "updated"} successfully!`, "success");
            setIsPolicyModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            showNotification("Failed to save policy.", "error");
        }
    };

    const handleDeletePolicy = async (id) => {
        if (!window.confirm("Are you sure you want to delete this policy card?")) return;
        try {
            await fetch(`${POLICY_API}/${id}`, {
                credentials: 'include',
                method: 'DELETE'
            });
            showNotification("Policy deleted.", "success");
            fetchData();
        } catch (error) {
            console.error(error);
            showNotification("Delete failed.", "error");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1 * 1024 * 1024) {
            showNotification("File is too large (max 1MB).", "error");
            return;
        }
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
                setContent({ ...content, bannerImage: data.imageUrl });
                showNotification("Image uploaded!", "success");
            }
        } catch (error) {
            showNotification("Upload failed.", "error");
        }
    };

    if (isLoading) return <AdminLayout><div className="p-10">Loading...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Delivery Area Design</h1>
                        <p className="text-slate-500 font-medium">Customize the layout, banners, and policy cards for the Delivery Area page.</p>
                    </div>
                </div>

                <div className="space-y-10">
                    {/* Hero Section */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                        <form onSubmit={handleSaveContent} className="space-y-8">
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">Hero Banner</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                                        {content.bannerImage ? (
                                            <img src={getImageUrl(content.bannerImage)} className="w-full h-full object-cover" alt="Banner" />
                                        ) : (
                                            <IconPhoto size={40} className="text-slate-300" />
                                        )}
                                    </div>
                                    <label className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-brand-primary hover:text-brand-primary transition-colors text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm">
                                        <IconUpload size={16} /> Upload Image
                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Banner Title</label>
                                        <input type="text" value={content.bannerTitle || ''} onChange={e => setContent({...content, bannerTitle: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Banner Subtitle</label>
                                        <input type="text" value={content.bannerSubtitle || ''} onChange={e => setContent({...content, bannerSubtitle: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-brand-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</label>
                                        <textarea value={content.bannerDescription || ''} onChange={e => setContent({...content, bannerDescription: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" rows="3" />
                                    </div>
                                </div>
                            </div>
                            
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 pt-6">Specialized Care Section</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Main Section Title</label>
                                    <input type="text" value={content.specializedTitle || ''} onChange={e => setContent({...content, specializedTitle: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Main Description</label>
                                    <textarea value={content.specializedDescription || ''} onChange={e => setContent({...content, specializedDescription: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" rows="2" />
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Hospital Column</label>
                                    <input type="text" value={content.hospitalTitle || ''} onChange={e => setContent({...content, hospitalTitle: e.target.value})} className="w-full px-4 py-2 mb-3 bg-white border border-slate-200 rounded-lg font-bold text-sm" placeholder="Title" />
                                    <textarea value={content.hospitalText || ''} onChange={e => setContent({...content, hospitalText: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs" rows="3" placeholder="Description" />
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Funeral Column</label>
                                    <input type="text" value={content.funeralTitle || ''} onChange={e => setContent({...content, funeralTitle: e.target.value})} className="w-full px-4 py-2 mb-3 bg-white border border-slate-200 rounded-lg font-bold text-sm" placeholder="Title" />
                                    <textarea value={content.funeralText || ''} onChange={e => setContent({...content, funeralText: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs" rows="3" placeholder="Description" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                                    <IconDeviceFloppy size={18} /> Save All Content
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Policy Cards Section */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                            <h2 className="text-xl font-bold text-slate-800">Policy Highlight Cards</h2>
                            <button onClick={() => { setModalMode("add"); setCurrentPolicy({ title: '', description: '', iconName: 'clock', position: 0 }); setIsPolicyModalOpen(true); }} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <IconPlus size={16} /> Add Card
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {policies.map(policy => (
                                <div key={policy.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50 relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-primary border border-slate-100">
                                            {policy.iconName === 'clock' && <IconClock size={20} />}
                                            {policy.iconName === 'cart' && <IconShoppingCart size={20} />}
                                            {policy.iconName === 'calendar' && <IconCalendar size={20} />}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setModalMode("edit"); setCurrentPolicy(policy); setIsPolicyModalOpen(true); }} className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-brand-primary border border-slate-100"><IconUpload size={14} /></button>
                                            <button onClick={() => handleDeletePolicy(policy.id)} className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-red-500 border border-slate-100"><IconTrash size={14} /></button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-slate-800 mb-2">{policy.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{policy.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Policy Modal */}
                <Modal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} title={modalMode === "add" ? "Add Policy Card" : "Edit Policy Card"}>
                    <form onSubmit={handleSavePolicy} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Title</label>
                            <input type="text" value={currentPolicy.title} onChange={e => setCurrentPolicy({...currentPolicy, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" required />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</label>
                            <textarea value={currentPolicy.description} onChange={e => setCurrentPolicy({...currentPolicy, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" rows="3" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Icon Type</label>
                                <select value={currentPolicy.iconName} onChange={e => setCurrentPolicy({...currentPolicy, iconName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold">
                                    <option value="clock">Clock / Time</option>
                                    <option value="cart">Cart / Minimum</option>
                                    <option value="calendar">Calendar / Schedule</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</label>
                                <input type="number" value={currentPolicy.position} onChange={e => setCurrentPolicy({...currentPolicy, position: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                            </div>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setIsPolicyModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancel</button>
                            <button type="submit" className="flex-1 py-4 bg-brand-primary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-violet-100">Save Card</button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default DeliveryAreaContentManagement;
