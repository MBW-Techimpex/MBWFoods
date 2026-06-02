import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import API_BASE from '../../config';
import { 

  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye, 
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconX,
  IconPencil,
  IconDeviceFloppy,
  IconMail,
  IconUpload,
  IconEyeOff
} from "@tabler/icons-react";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";
import { useRef } from "react";
import { ImageUpload } from "../../components/admin/UploadComponents";

const SETTINGS_API = `${API_BASE}/api/section-settings`;
const SECTION_KEY = "subscription";

const SubscriptionManagement = () => {
    const API_URL = `${API_BASE}/api/subscribers`;
    const [subscribers, setSubscribers] = useState([]);
    const [editingSub, setEditingSub] = useState(null);
    const { showNotification } = useNotification();

    // Section heading/description state
    const [sectionSettings, setSectionSettings] = useState({
        subscription_tagline: "Seasonal Subscription",
        subscription_heading: "Always bloom with our floral membership",
        subscription_description: "Save up to 25% and receive a fresh bundle of joy every week. Pause or cancel anytime.",
        subscription_image: "",
    });
    const [isEditingSection, setIsEditingSection] = useState(false);
 const [subscriptionSectionShow, setSubscriptionSectionShow] = useState(true);
    const [sectionDraft, setSectionDraft] = useState({});

    // Modal state for actions
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchSubscribers();
        fetchSectionSettings();
    }, []);

    const fetchSectionSettings = async () => {
        try {
            const res = await fetch(`${SETTINGS_API}?section=${SECTION_KEY}`, { credentials: 'include' });
            const data = await res.json();
            if (Object.keys(data).length > 0) {
                setSectionSettings(prev => ({ ...prev, ...data }));
  if (data.subscription_section_show !== undefined) {
                    setSubscriptionSectionShow(data.subscription_section_show === 'true');
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveSectionSettings = async () => {
        try {
            await fetch(`${SETTINGS_API}/upsert`, { credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sectionDraft)
            });
            setSectionSettings(prev => ({ ...prev, ...sectionDraft }));
            setIsEditingSection(false);
            showNotification("Section settings saved!", "success");
        } catch (err) {
            console.error("Save settings error:", err);
            showNotification("Failed to save settings.", "error");
        }
    };

    const fetchSubscribers = async () => {
        try {
            const res = await fetch(API_URL, { credentials: 'include' });
            const data = await res.json();
            setSubscribers(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const method = editingSub.id ? 'PUT' : 'POST';
            const url = editingSub.id ? `${API_URL}/${editingSub.id}` : API_URL;
            await fetch(url, { 
                credentials: 'include',
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSub)
            });
            fetchSubscribers();
            setEditingSub(null);
            showNotification(`Subscriber ${editingSub.id ? 'updated' : 'added'} successfully!`, "success");
        } catch (error) {
            showNotification("Error saving subscriber.", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/${deletingId}`, { method: 'DELETE' , credentials: 'include' });
            fetchSubscribers();
            setIsPromptModalOpen(false);
            showNotification("Subscriber removed successfully.", "success");
        } catch (e) { 
            showNotification("Failed to remove.", "error");
        }
    };

    const handleToggleStatus = async (subscriber) => {
        try {
            const newStatus = subscriber.status === 'Active' ? 'Inactive' : 'Active';
            await fetch(`${API_URL}/${subscriber.id}`, { credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchSubscribers();
        } catch (e) { console.error(e); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSectionDraft(prev => ({ ...prev, subscription_image: reader.result }));
                showNotification("Image loaded from device!", "success");
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">

                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Newsletter Management</h1>
                        <p className="text-slate-500 font-medium">Manage your community of automotive enthusiasts and newsletter settings.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setEditingSub({ email: '', status: 'Active' })}
                            className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <IconPlus size={18} />
                            Add Subscriber
                        </button>
                    </div>
                </div>
              
                {/* Master Visibility Switch */}
                <div className="mb-10 max-w-xl">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${subscriptionSectionShow ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                                {subscriptionSectionShow ? <IconEye size={24} /> : <IconEyeOff size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Section Visibility</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subscription Switch</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="space-y-1">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest block">Section Status</span>
                                <p className="text-[11px] font-bold text-slate-400 italic">
                                    {subscriptionSectionShow ? "Visible on Homepage" : "Hidden from Homepage"}
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const nextStatus = !subscriptionSectionShow;
                                    setSubscriptionSectionShow(nextStatus);
                                    try {
                                        await fetch(`${SETTINGS_API}/upsert`, {
                                            method: 'POST',
                                            credentials: 'include',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ subscription_section_show: String(nextStatus) })
                                        });
                                        showNotification(`Newsletter Section is now ${nextStatus ? 'Visible' : 'Hidden'}`, "success");
                                    } catch (e) {
                                        showNotification("Failed to update visibility", "error");
                                    }
                                }}
                                className={`w-16 h-8 rounded-full relative transition-all duration-300 shadow-inner ${subscriptionSectionShow ? "bg-emerald-500" : "bg-slate-300"}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${subscriptionSectionShow ? "right-1" : "left-1"}`} />
                            </button>
                        </div>
                    </div>
                </div>


                {/* ── Section Heading & Description Editor ── */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-black text-slate-800 tracking-tight">Section Heading &amp; Description</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Controls the subscription box text — tagline, main heading, and description.</p>
                        </div>
                        {!isEditingSection ? (
                            <button
                                onClick={() => { setSectionDraft({ ...sectionSettings }); setIsEditingSection(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand-secondary text-brand-primary rounded-xl font-bold text-xs hover:bg-brand-primary hover:text-white transition-all"
                            >
                                <IconPencil size={15} />
                                Edit Section
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingSection(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">
                                    Cancel
                                </button>
                                <button onClick={handleSaveSectionSettings} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-100">
                                    <IconDeviceFloppy size={15} />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    {!isEditingSection ? (
                        <div className="p-6 bg-slate-50 rounded-2xl flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/3 aspect-video rounded-xl bg-slate-200 overflow-hidden border border-slate-200">
                                <img src={sectionSettings.subscription_image || "HeroTertiary"} alt="Subscription" className="w-full h-full object-cover opacity-80" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest block">{sectionSettings.subscription_tagline}</span>
                                <h3 className="text-2xl font-serif text-slate-800 italic">{sectionSettings.subscription_heading}</h3>
                                <p className="text-sm text-slate-500 font-light leading-relaxed">{sectionSettings.subscription_description}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Top Tagline</label>
                                <input
                                    type="text"
                                    value={sectionDraft.subscription_tagline || ''}
                                    onChange={e => setSectionDraft({ ...sectionDraft, subscription_tagline: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm"
                                    placeholder="e.g. Seasonal Subscription"
                                />
                            </div>
                            <div>
                                <ImageUpload
                                    label="Section Image"
                                    currentUrl={sectionDraft.subscription_image}
                                    showNotification={showNotification}
                                    recSize="1200x800px"
                                    onUpload={(url) => setSectionDraft({ ...sectionDraft, subscription_image: url })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Main Heading</label>
                                <input
                                    type="text"
                                    value={sectionDraft.subscription_heading || ''}
                                    onChange={e => setSectionDraft({ ...sectionDraft, subscription_heading: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm font-serif italic"
                                    placeholder="e.g. Always bloom with our floral membership"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2 flex justify-between">
                                    Description Paragraph
                                    <span className={`text-[9px] font-bold tracking-normal transition-colors ${(sectionDraft.subscription_description?.length || 0) >= 180 ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {sectionDraft.subscription_description?.length || 0} / 200
                                    </span>
                                </label>
                                <textarea
                                    value={sectionDraft.subscription_description || ''}
                                    onChange={e => setSectionDraft({ ...sectionDraft, subscription_description: e.target.value })}
                                    maxLength={200}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm resize-none"
                                    rows="3"
                                    placeholder="Save up to 20% on all orders and receive early access..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Subscribers List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address / User</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[160px]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[150px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {subscribers.map((sub) => (
                                    <tr key={sub.id} className="group hover:bg-brand-secondary/30 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                                                    <IconMail size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 tracking-tight">{sub.email}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Joined {new Date(sub.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${sub.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                {sub.status === "Active" ? <IconCircleCheckFilled size={14} /> : <IconCircleXFilled size={14} />}
                                                {sub.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 flex items-center justify-end gap-3">
                                            <button onClick={() => handleToggleStatus(sub)} className="text-slate-400 hover:text-blue-500 transition-colors" title="Toggle Status">
                                                <IconEye size={18} />
                                            </button>
                                            <button onClick={() => setEditingSub(sub)} className="text-slate-400 hover:text-brand-primary transition-colors" title="Edit">
                                                <IconEdit size={18} />
                                            </button>
                                            <button onClick={() => { setDeletingId(sub.id); setModalTitle("Remove Subscriber"); setIsPromptModalOpen(true); }} className="text-slate-400 hover:text-rose-500 transition-colors" title="Delete">
                                                <IconTrash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {subscribers.length === 0 && (
                            <div className="py-24 text-center text-slate-400">
                                <IconMail size={40} className="mx-auto mb-4 opacity-30" />
                                <p className="text-sm font-bold">No subscribers yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Modal */}
                <Modal 
                    isOpen={!!editingSub} 
                    onClose={() => setEditingSub(null)} 
                    title={editingSub?.id ? 'Edit Subscriber' : 'Add Subscriber'}
                >
                    <form onSubmit={handleEditSave} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={editingSub?.email || ''} 
                                onChange={e => setEditingSub({ ...editingSub, email: e.target.value })} 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-800 font-medium" 
                                placeholder="e.g. hello@example.com" 
                                required 
                            />
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-slate-50">
                            <button type="button" onClick={() => setEditingSub(null)} className="flex-1 h-16 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-200 transition-colors">Cancel</button>
                            <button type="submit" className="flex-[2] h-16 bg-brand-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-violet-100 hover:scale-[1.02] active:scale-[0.98] transition-all">Save Subscriber</button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirm Modal */}
                <Modal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} title={modalTitle}>
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                            <IconTrash size={40} />
                        </div>
                        <p className="text-slate-500 text-sm">Are you sure you want to remove this email? They won't receive your updates anymore.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setIsPromptModalOpen(false)} className="flex-1 h-14 bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 h-14 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl">Confirm Delete</button>
                        </div>
                    </div>
                </Modal>

            </div>
        </AdminLayout>
    );
};

export default SubscriptionManagement;



