import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import { 

  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye, 
  IconGripVertical,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDeviceFloppy,
  IconX,
  IconPencil,
  IconEyeOff
} from "@tabler/icons-react";
import { Reorder } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";

const AVAILABLE_ICONS = [
  { name: "Checkmark", d: "M5 13l4 4L19 7" },
  { name: "Clock", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { name: "Heart", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { name: "Star", d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
  { name: "Globe", d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
  { name: "Shield", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { name: "Sparkles", d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
  { name: "Gift", d: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" },
  { name: "Fire", d: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" },
  { name: "Medal", d: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
  { name: "Lightning", d: "M13 10V3L4 14h7v7l9-11h-7z" },
  { name: "Leaf", d: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
];

const SETTINGS_API = `${API_BASE}/api/section-settings`;
const SECTION_KEY = "whychooseus";

const BenefitManagement = () => {
    const API_URL = `${API_BASE}/api/benefits`;
    const [benefits, setBenefits] = useState([]);
    const [hasChanged, setHasChanged] = useState(false);
    const [editingBenefit, setEditingBenefit] = useState(null);
    const { showNotification } = useNotification();

    // Section heading/description state
    const [sectionSettings, setSectionSettings] = useState({
        whychooseus_tagline: "Our Commitment",
        whychooseus_heading: "Why Choose MBW Accessories?",
        whychooseus_description: "Precision engineered, artisan crafted, and performance tested components for your vehicle."
    });
    const [whyChooseSectionShow, setWhyChooseSectionShow] = useState(true);
    const [isEditingSection, setIsEditingSection] = useState(false);
    const [sectionDraft, setSectionDraft] = useState({});

    // Modal state for actions
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [modalType, setModalType] = useState("prompt");
    const [modalTitle, setModalTitle] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchBenefits();
        fetchSectionSettings();
    }, []);

    const fetchSectionSettings = async () => {
        try {
            const res = await fetch(`${SETTINGS_API}?section=${SECTION_KEY}`, { credentials: 'include' });
            const data = await res.json();
            if (Object.keys(data).length > 0) {
                setSectionSettings(prev => ({ ...prev, ...data }));
                if (data.whychooseus_section_show !== undefined) {
                    setWhyChooseSectionShow(data.whychooseus_section_show === 'true');
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
            showNotification("Failed to save settings.", "error");
        }
    };

    const fetchBenefits = async () => {
        try {
            const res = await fetch(API_URL, { credentials: 'include' });
            const data = await res.json();
            setBenefits(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReorder = (newOrder) => {
        setBenefits(newOrder);
        setHasChanged(true);
    };

    const handleSaveSequence = async () => {
        try {
            const orderedIds = benefits.map(b => b.id);
            await fetch(`${API_URL}/reorder`, { credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds })
            });
            setHasChanged(false);
            showNotification("Benefit sequence saved!", "success");
        } catch (err) {
            showNotification("Failed to save sequence.", "error");
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const method = editingBenefit.id ? 'PUT' : 'POST';
            const url = editingBenefit.id ? `${API_URL}/${editingBenefit.id}` : API_URL;
            await fetch(url, { credentials: 'include' ,
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingBenefit)
            }); 
            fetchBenefits();
            setEditingBenefit(null);
            showNotification(`Benefit ${editingBenefit.id ? 'updated' : 'created'} successfully!`, "success");
        } catch (error) {
            showNotification("Error saving benefit.", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/${deletingId}`, { method: 'DELETE' , credentials: 'include' });
            fetchBenefits();
            setIsPromptModalOpen(false);
            showNotification("Benefit deleted successfully.", "success");
        } catch (e) { 
            showNotification("Failed to delete.", "error");
        }
    };

    const handleToggleStatus = async (benefit) => {
        try {
            const newStatus = benefit.status === 'Active' ? 'Inactive' : 'Active';
            await fetch(`${API_URL}/${benefit.id}`, { credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchBenefits();
        } catch (e) { console.error(e); }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">

                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Why Choose us</h1>
                        <p className="text-slate-500 font-medium">Manage the core commitments and benefits displayed on your homepage.</p>
                    </div>
                    <div className="flex gap-3">
                        {hasChanged && (
                            <button onClick={handleSaveSequence} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-100">
                                Save Sequence
                            </button>
                        )}
                        <button 
                            onClick={() => setEditingBenefit({ title: '', description: '', icon: 'M5 13l4 4L19 7', status: 'Active' })}
                            className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <IconPlus size={18} />
                            Add New Benefit
                        </button>
                    </div>
                </div>
                
                {/* Master Visibility Switch */}
                <div className="mb-10 max-w-xl">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${whyChooseSectionShow ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                                {whyChooseSectionShow ? <IconEye size={24} /> : <IconEyeOff size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Section Visibility</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Why Choose Us Switch</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="space-y-1">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest block">Section Status</span>
                                <p className="text-[11px] font-bold text-slate-400 italic">
                                    {whyChooseSectionShow ? "Visible on Homepage" : "Hidden from Homepage"}
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const nextStatus = !whyChooseSectionShow;
                                    setWhyChooseSectionShow(nextStatus);
                                    try {
                                        await fetch(`${SETTINGS_API}/upsert`, {
                                            method: 'POST',
                                            credentials: 'include',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ whychooseus_section_show: String(nextStatus) })
                                        });
                                        showNotification(`Why Choose Section is now ${nextStatus ? 'Visible' : 'Hidden'}`, "success");
                                    } catch (e) {
                                        showNotification("Failed to update visibility", "error");
                                    }
                                }}
                                className={`w-16 h-8 rounded-full relative transition-all duration-300 shadow-inner ${whyChooseSectionShow ? "bg-emerald-500" : "bg-slate-300"}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${whyChooseSectionShow ? "right-1" : "left-1"}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Section Heading / Description Editor ── */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-black text-slate-800 tracking-tight">Section Heading &amp; Label</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Controls the top badge, main title, and description shown on the homepage.</p>
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
                        <div className="flex flex-col gap-2 p-6 bg-slate-50 rounded-2xl">
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{sectionSettings.whychooseus_tagline}</span>
                            <h3 className="text-2xl font-serif text-slate-800">{sectionSettings.whychooseus_heading}</h3>
                            {sectionSettings.whychooseus_description && (
                                <p className="text-sm text-slate-500 font-light">{sectionSettings.whychooseus_description}</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                    Top Badge / Tagline <span className="text-slate-400 normal-case font-normal tracking-normal">e.g. "The MBW Standard"</span>
                                </label>
                                <input
                                    type="text"
                                    value={sectionDraft.whychooseus_tagline || ''}
                                    onChange={e => setSectionDraft({ ...sectionDraft, whychooseus_tagline: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm"
                                    placeholder="e.g. The MBW Standard"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                    Main Heading <span className="text-slate-400 normal-case font-normal tracking-normal">e.g. "Why Choose MBW?"</span>
                                </label>
                                <input
                                    type="text"
                                    value={sectionDraft.whychooseus_heading || ''}
                                    onChange={e => setSectionDraft({ ...sectionDraft, whychooseus_heading: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm font-serif"
                                    placeholder="e.g. Why Choose MBW Performance?"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2 flex justify-between">
                                    Description <span className="text-slate-400 normal-case font-normal tracking-normal">(optional)</span>
                                    <span className={`text-[9px] font-bold tracking-normal transition-colors ${(sectionDraft.whychooseus_description?.length || 0) >= 180 ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {sectionDraft.whychooseus_description?.length || 0} / 200
                                    </span>
                                </label>
                                <textarea
                                    value={sectionDraft.whychooseus_description || ''}
                                    onChange={e => setSectionDraft({ ...sectionDraft, whychooseus_description: e.target.value })}
                                    maxLength={200}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm resize-none"
                                    rows="3"
                                    placeholder="Optional subtitle or description below the heading..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Benefits List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                        <div className="min-w-[800px]">
                            <div className="bg-slate-50 border-b border-slate-100 flex items-center py-5">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-20 flex-1 min-w-[300px]">Title &amp; Description</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[200px]">Icon Preview</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-[150px] px-8">Status</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right min-w-[150px] px-8">Actions</div>
                            </div>
                
                            <Reorder.Group axis="y" values={benefits} onReorder={handleReorder} className="divide-y divide-slate-50">

                            {benefits.map((benefit) => (
                                <Reorder.Item 
                                    key={benefit.id} 
                                    value={benefit}
                                    className="group hover:bg-brand-secondary/30 transition-all duration-300 w-full flex items-center cursor-grab active:cursor-grabbing"
                                >
                                    <div className="flex-1 flex items-center py-4">
                                        <div className="pl-8 text-slate-200 group-hover:text-brand-primary transition-colors">
                                            <IconGripVertical size={24} />
                                        </div>
                                        <div className="flex items-center gap-6 pl-6 flex-1 min-w-[300px]">
                                            <div>
                                                <p className="text-sm font-black text-slate-800 tracking-tight">{benefit.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold truncate max-w-xs">{benefit.description}</p>
                                            </div>
                                        </div>
                                        <div className="px-8 w-[200px] flex justify-center">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-primary">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={benefit.icon} />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="px-8 w-[150px]">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${benefit.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                {benefit.status === "Active" ? <IconCircleCheckFilled size={14} /> : <IconCircleXFilled size={14} />}
                                                {benefit.status}
                                            </div>
                                        </div>
                                        <div className="px-8 flex items-center justify-end gap-3 min-w-[150px]">
                                            <button onClick={() => handleToggleStatus(benefit)} className="text-slate-400 hover:text-blue-500">
                                                <IconEye size={18} />
                                            </button>
                                            <button onClick={() => setEditingBenefit(benefit)} className="text-slate-400 hover:text-brand-primary">
                                                <IconEdit size={18} />
                                            </button>
                                            <button onClick={() => { setDeletingId(benefit.id); setModalTitle("Delete Benefit"); setModalType("confirm"); setIsPromptModalOpen(true); }} className="text-slate-400 hover:text-red-500">
                                                <IconTrash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                </div>
            </div>

                {/* Editor Modal */}
                {editingBenefit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-10 relative">
                            <button 
                                onClick={() => setEditingBenefit(null)}
                                className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                                <IconX size={20} className="stroke-[3]" />
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 font-serif mb-8 text-center italic">
                                {editingBenefit.id ? 'Edit Benefit' : 'Add New Benefit'}
                            </h2>
                            <form onSubmit={handleEditSave} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Benefit Title</label>
                                    <input type="text" value={editingBenefit.title} onChange={e => setEditingBenefit({...editingBenefit, title: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2 flex justify-between">
                                        Benefit Description
                                        <span className={`text-[9px] font-bold tracking-normal transition-colors ${(editingBenefit.description?.length || 0) >= 180 ? 'text-rose-500' : 'text-slate-400'}`}>
                                            {editingBenefit.description?.length || 0} / 200
                                        </span>
                                    </label>
                                    <textarea 
                                        value={editingBenefit.description} 
                                        onChange={e => setEditingBenefit({...editingBenefit, description: e.target.value})} 
                                        maxLength={200}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none resize-none" 
                                        rows="3" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Select Icon</label>
                                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                                        {AVAILABLE_ICONS.map((iconOption) => (
                                            <button
                                                key={iconOption.name}
                                                type="button"
                                                onClick={() => setEditingBenefit({...editingBenefit, icon: iconOption.d})}
                                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                                                    editingBenefit.icon === iconOption.d
                                                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary scale-105 shadow-md shadow-brand-primary/5'
                                                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-slate-100'
                                                }`}
                                                title={iconOption.name}
                                            >
                                                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconOption.d} />
                                                </svg>
                                                <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full text-center">{iconOption.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setEditingBenefit(null)} className="flex-1 h-14 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl">Cancel</button>
                                    <button type="submit" className="flex-2 h-14 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg">Save Benefit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Confirm Delete Modal */}
                <Modal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} title={modalTitle}>
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                            <IconTrash size={40} />
                        </div>
                        <p className="text-slate-500 text-sm">Are you sure you want to remove this benefit? This action cannot be undone.</p>
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

export default BenefitManagement;



