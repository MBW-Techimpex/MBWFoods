import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import HomeSectionManagement from "./HomeSectionManagement";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye, 
  IconEyeOff, 
  IconChevronRight, 
  IconSettings,
  IconCar,
  IconAlertCircle
} from "@tabler/icons-react";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";

const SECTIONS_API = `${API_BASE}/api/home-sections`;
const SETTINGS_API = `${API_BASE}/api/section-settings`;

const HomeSectionsManager = () => {
    const [sections, setSections] = useState([]);
    const [visibilityMap, setVisibilityMap] = useState({});
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    
    // Selection state for curating products
    const [selectedSection, setSelectedSection] = useState(null);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditHeaderModalOpen, setIsEditHeaderModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form states
    const [formDraft, setFormDraft] = useState({
        section_type: "",
        title: "",
        subtitle: "",
        description: ""
    });
    const [deletingType, setDeletingType] = useState(null);

    useEffect(() => {
        if (!selectedSection) {
            fetchSections();
        }
    }, [selectedSection]);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const res = await fetch(SECTIONS_API, { credentials: 'include' });
            const data = await res.json();
            setSections(data.sections || []);

            // Fetch Visibility settings for all sections
            const settingsRes = await fetch(SETTINGS_API, { credentials: 'include' });
            const settingsMap = await settingsRes.json();
            
            const visMap = {};
            (data.sections || []).forEach(sec => {
                const key = `${sec.section_type}_section_show`;
                visMap[sec.section_type] = settingsMap[key] !== 'false'; // Defaults to true
            });
            setVisibilityMap(visMap);
        } catch (err) {
            showNotification("Failed to fetch home sections", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSection = async (e) => {
        e.preventDefault();
        
        // Clean section_type key (must be valid URL identifier/slug)
        const cleanType = formDraft.section_type
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w-]/g, '');

        if (!cleanType) {
            showNotification("Please provide a valid unique identifier.", "warning");
            return;
        }

        // Check if section type already exists
        if (sections.some(s => s.section_type === cleanType)) {
            showNotification("Section identifier already exists.", "warning");
            return;
        }

        try {
            const res = await fetch(`${SECTIONS_API}/section/${cleanType}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formDraft.title,
                    subtitle: formDraft.subtitle,
                    description: formDraft.description
                }),
                credentials: 'include'
            });

            if (res.ok) {
                showNotification("Home section created successfully!", "success");
                setIsCreateModalOpen(false);
                fetchSections();
            } else {
                const err = await res.json();
                showNotification(err.message || "Failed to create section", "error");
            }
        } catch (err) {
            showNotification("Error creating section", "error");
        }
    };

    const handleUpdateHeader = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${SECTIONS_API}/section/${formDraft.section_type}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formDraft.title,
                    subtitle: formDraft.subtitle,
                    description: formDraft.description
                }),
                credentials: 'include'
            });

            if (res.ok) {
                showNotification("Section headings updated!", "success");
                setIsEditHeaderModalOpen(false);
                fetchSections();
            } else {
                const err = await res.json();
                showNotification(err.message || "Failed to update headings", "error");
            }
        } catch (err) {
            showNotification("Error updating headings", "error");
        }
    };

    const handleToggleVisibility = async (type) => {
        const nextStatus = !visibilityMap[type];
        
        // Optimistic update
        setVisibilityMap(prev => ({ ...prev, [type]: nextStatus }));

        try {
            const visibilityKey = `${type}_section_show`;
            const res = await fetch(`${SETTINGS_API}/upsert`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [visibilityKey]: String(nextStatus) })
            });
            if (res.ok) {
                showNotification(`Section visibility set to ${nextStatus ? 'Visible' : 'Hidden'}`, "success");
            } else {
                throw new Error("Failed to save settings");
            }
        } catch (e) {
            // Revert state
            setVisibilityMap(prev => ({ ...prev, [type]: !nextStatus }));
            showNotification("Failed to update visibility", "error");
        }
    };

    const handleDeleteSection = async () => {
        try {
            const res = await fetch(`${SECTIONS_API}/section/${deletingType}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                showNotification("Home section and all its curated products deleted.", "success");
                setIsDeleteModalOpen(false);
                fetchSections();
            } else {
                showNotification("Failed to delete section.", "error");
            }
        } catch (err) {
            showNotification("Error deleting section", "error");
        }
    };

    // If a section is selected for product curation, we render the original component
    if (selectedSection) {
        return (
            <HomeSectionManagement 
                sectionType={selectedSection.section_type}
                pageTitle={selectedSection.title}
                description={selectedSection.description || `Curate and organize products in the ${selectedSection.title} section.`}
                onBack={() => setSelectedSection(null)}
            />
        );
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="p-20 text-center text-slate-400">Loading home sections...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-32">
                
                {/* Header */}
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Home Page Sections</h1>
                        <p className="text-slate-500 font-medium">Create and arrange visual collections to showcase key products on your storefront.</p>
                    </div>
                    <button 
                        onClick={() => {
                            setFormDraft({ section_type: "", title: "", subtitle: "", description: "" });
                            setIsCreateModalOpen(true);
                        }}
                        className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 flex items-center gap-2 cursor-pointer"
                    >
                        <IconPlus size={18} />
                        Create New Section
                    </button>
                </div>

                {/* Grid of Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((section) => {
                        const isVisible = visibilityMap[section.section_type] !== false;
                        return (
                            <div key={section.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 group">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                ID: {section.section_type}
                                            </span>
                                        </div>

                                        {/* Visibility toggle switch */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {isVisible ? "Active" : "Hidden"}
                                            </span>
                                            <button
                                                onClick={() => handleToggleVisibility(section.section_type)}
                                                className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${isVisible ? "bg-emerald-500" : "bg-slate-200"}`}
                                            >
                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isVisible ? "right-0.5" : "left-0.5"}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview Block */}
                                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-2">
                                        {section.subtitle && (
                                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[2px] block">
                                                {section.subtitle}
                                            </span>
                                        )}
                                        <h3 className="text-2xl font-serif text-slate-900 font-black italic">
                                            {section.title}
                                        </h3>
                                        {section.description && (
                                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                                                {section.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => {
                                                setFormDraft({
                                                    section_type: section.section_type,
                                                    title: section.title,
                                                    subtitle: section.subtitle || "",
                                                    description: section.description || ""
                                                });
                                                setIsEditHeaderModalOpen(true);
                                            }}
                                            className="w-10 h-10 bg-slate-50 text-slate-500 hover:text-brand-primary hover:bg-violet-50 rounded-xl flex items-center justify-center transition-all border border-slate-100 cursor-pointer"
                                            title="Edit Headings"
                                        >
                                            <IconEdit size={18} />
                                        </button>
                                        
                                        {/* Prevent deleting base seeded sections */}
                                        {section.section_type !== 'signature' && section.section_type !== 'discovery' && (
                                            <button 
                                                onClick={() => {
                                                    setDeletingType(section.section_type);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="w-10 h-10 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all border border-rose-100 cursor-pointer"
                                                title="Delete Section"
                                            >
                                                <IconTrash size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => setSelectedSection(section)}
                                        className="px-5 py-2.5 bg-brand-secondary text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                    >
                                        Curate Products <IconChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Create Modal */}
                <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Home Section">
                    <form onSubmit={handleCreateSection} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Section Identifier / Slug (Unique)</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formDraft.section_type}
                                    onChange={e => setFormDraft({ ...formDraft, section_type: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-mono"
                                    placeholder="e.g. new_arrivals"
                                />
                                <span className="text-[9px] text-slate-400 mt-1 block">A short lowercase system name (spaces will convert to underscores).</span>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tagline / Subtitle</label>
                                <input 
                                    type="text" 
                                    value={formDraft.subtitle}
                                    onChange={e => setFormDraft({ ...formDraft, subtitle: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm"
                                    placeholder="e.g. CURATED INVENTORY"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Section Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formDraft.title}
                                    onChange={e => setFormDraft({ ...formDraft, title: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-serif"
                                    placeholder="e.g. Premium Upgrades"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                                <textarea 
                                    rows={3}
                                    value={formDraft.description}
                                    onChange={e => setFormDraft({ ...formDraft, description: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm no-scrollbar resize-none"
                                    placeholder="Short description under the title..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 font-black text-xs uppercase rounded-2xl cursor-pointer">Cancel</button>
                            <button type="submit" className="flex-1 py-4 bg-brand-primary text-white font-black text-xs uppercase rounded-2xl shadow-xl shadow-brand-primary/20 cursor-pointer">Create Section</button>
                        </div>
                    </form>
                </Modal>

                {/* Edit Header Modal */}
                <Modal isOpen={isEditHeaderModalOpen} onClose={() => setIsEditHeaderModalOpen(false)} title="Edit Headings">
                    <form onSubmit={handleUpdateHeader} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tagline / Subtitle</label>
                                <input 
                                    type="text" 
                                    value={formDraft.subtitle}
                                    onChange={e => setFormDraft({ ...formDraft, subtitle: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Section Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formDraft.title}
                                    onChange={e => setFormDraft({ ...formDraft, title: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-serif"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                                <textarea 
                                    rows={3}
                                    value={formDraft.description}
                                    onChange={e => setFormDraft({ ...formDraft, description: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm no-scrollbar resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setIsEditHeaderModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 font-black text-xs uppercase rounded-2xl cursor-pointer">Cancel</button>
                            <button type="submit" className="flex-1 py-4 bg-brand-primary text-white font-black text-xs uppercase rounded-2xl shadow-xl shadow-brand-primary/20 cursor-pointer">Save Changes</button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Modal */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Section">
                    <div className="text-center p-6 space-y-6">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                            <IconAlertCircle size={40} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Are you sure?</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">This will permanently delete this home section and remove all products curated inside it from the homepage.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black text-xs uppercase rounded-2xl cursor-pointer">Cancel</button>
                            <button onClick={handleDeleteSection} className="flex-1 py-4 bg-rose-500 text-white font-black text-xs uppercase rounded-2xl shadow-xl shadow-rose-100 cursor-pointer">Delete Section</button>
                        </div>
                    </div>
                </Modal>

            </div>
        </AdminLayout>
    );
};

export default HomeSectionsManager;
