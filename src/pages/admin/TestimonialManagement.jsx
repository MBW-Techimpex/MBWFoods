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
  IconX,
  IconPencil,
  IconDeviceFloppy,
  IconPhotoStar,
  IconQuote,
  IconUpload,
  IconEyeOff
} from "@tabler/icons-react";
import { Reorder } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";
import { ImageUpload } from "../../components/admin/UploadComponents";

const SETTINGS_API = `${API_BASE}/api/section-settings`;
const SECTION_KEY = "testimonials";

const TestimonialManagement = () => {
    const API_URL = `${API_BASE}/api/testimonials`;
    const [testimonials, setTestimonials] = useState([]);
    const [hasChanged, setHasChanged] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const { showNotification } = useNotification();

    // Section heading state
    const [sectionSettings, setSectionSettings] = useState({
        testimonials_tagline: "Community Stories",
        testimonials_heading: "Shared Experiences.",
    });
    const [isEditingSection, setIsEditingSection] = useState(false);
    const [sectionDraft, setSectionDraft] = useState({});
 const [testimonialsSectionShow, setTestimonialsSectionShow] = useState(true);

    // Modal state
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchTestimonials();
        fetchSectionSettings();
    }, []);

    const fetchSectionSettings = async () => {
        try {
            const res = await fetch(`${SETTINGS_API}?section=${SECTION_KEY}`, { credentials: 'include' });
            const data = await res.json();
            if (Object.keys(data).length > 0) {
                setSectionSettings(prev => ({ ...prev, ...data }));
  if (data.testimonials_section_show !== undefined) {
                    setTestimonialsSectionShow(data.testimonials_section_show === 'true');
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

    const fetchTestimonials = async () => {
        try {
            const res = await fetch(API_URL, { credentials: 'include' });
            const data = await res.json();
            setTestimonials(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReorder = (newOrder) => {
        setTestimonials(newOrder);
        setHasChanged(true);
    };

    const handleSaveSequence = async () => {
        try {
            const orderedIds = testimonials.map(t => t.id);
            await fetch(`${API_URL}/reorder`, { credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds })
            });
            setHasChanged(false);
            showNotification("Testimonial order saved!", "success");
        } catch (err) {
            showNotification("Failed to save order.", "error");
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const method = editingTestimonial.id ? 'PUT' : 'POST';
            const url = editingTestimonial.id ? `${API_URL}/${editingTestimonial.id}` : API_URL;
            await fetch(url, { credentials: 'include' ,
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingTestimonial)
            }); 
            fetchTestimonials();
            setEditingTestimonial(null);
            showNotification(`Testimonial ${editingTestimonial.id ? 'updated' : 'created'} successfully!`, "success");
        } catch (error) {
            showNotification("Error saving testimonial.", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/${deletingId}`, { method: 'DELETE' , credentials: 'include' });
            fetchTestimonials();
            setIsPromptModalOpen(false);
            showNotification("Testimonial deleted successfully.", "success");
        } catch (e) { 
            showNotification("Failed to delete.", "error");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showNotification("File is too large (max 5MB).", "error");
            return;
        }

        showNotification("Uploading image...", "info");

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
                setEditingTestimonial(prev => ({ ...prev, image: data.imageUrl }));
                showNotification(`Image uploaded successfully!`, "success");
            } else {
                showNotification(data.error || "Upload failed.", "error");
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showNotification("Upload failed. Please try again.", "error");
        }
    };

    const handleToggleStatus = async (testimonial) => {
        try {
            const newStatus = testimonial.status === 'Active' ? 'Inactive' : 'Active';
            await fetch(`${API_URL}/${testimonial.id}`, { credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchTestimonials();
        } catch (e) { console.error(e); }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">

                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Testimonials</h1>
                        <p className="text-slate-500 font-medium">Manage client stories and reviews displayed on your homepage.</p>
                    </div>
                    <div className="flex gap-3">
                        {hasChanged && (
                            <button onClick={handleSaveSequence} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-100">
                                Save Sequence
                            </button>
                        )}
                        <button 
                            onClick={() => setEditingTestimonial({ name: '', designation: '', quote: '', image: '', status: 'Active' })}
                            className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <IconPlus size={18} />
                            Add Testimonial
                        </button>
                    </div>
                </div>
              
              
                {/* Master Visibility Switch */}
                <div className="mb-10 max-w-xl">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${testimonialsSectionShow ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                                {testimonialsSectionShow ? <IconEye size={24} /> : <IconEyeOff size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Section Visibility</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Testimonials Switch</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="space-y-1">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest block">Section Status</span>
                                <p className="text-[11px] font-bold text-slate-400 italic">
                                    {testimonialsSectionShow ? "Visible on Homepage" : "Hidden from Homepage"}
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const nextStatus = !testimonialsSectionShow;
                                    setTestimonialsSectionShow(nextStatus);
                                    try {
                                        await fetch(`${SETTINGS_API}/upsert`, {
                                            method: 'POST',
                                            credentials: 'include',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ testimonials_section_show: String(nextStatus) })
                                        });
                                        showNotification(`Testimonials Section is now ${nextStatus ? 'Visible' : 'Hidden'}`, "success");
                                    } catch (e) {
                                        showNotification("Failed to update visibility", "error");
                                    }
                                }}
                                className={`w-16 h-8 rounded-full relative transition-all duration-300 shadow-inner ${testimonialsSectionShow ? "bg-emerald-500" : "bg-slate-300"}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${testimonialsSectionShow ? "right-1" : "left-1"}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Section Heading Editor ── */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-black text-slate-800 tracking-tight">Section Heading &amp; Label</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Controls the tagline and main heading shown above the testimonials slider.</p>
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
                                <button onClick={() => setIsEditingSection(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">Cancel</button>
                                <button onClick={handleSaveSectionSettings} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-100">
                                    <IconDeviceFloppy size={15} />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    {!isEditingSection ? (
                        <div className="p-6 bg-slate-50 rounded-2xl flex flex-col gap-1.5">
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{sectionSettings.testimonials_tagline}</span>
                            <h3 className="text-2xl font-serif text-slate-800 italic">{sectionSettings.testimonials_heading}</h3>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                        Top Tagline <span className="text-slate-400 normal-case font-normal tracking-normal">e.g. "Community Stories"</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={sectionDraft.testimonials_tagline || ''}
                                        onChange={e => setSectionDraft({ ...sectionDraft, testimonials_tagline: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm"
                                        placeholder="e.g. Community Stories"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                        Main Heading <span className="text-slate-400 normal-case font-normal tracking-normal">e.g. "Shared Experiences."</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={sectionDraft.testimonials_heading || ''}
                                        onChange={e => setSectionDraft({ ...sectionDraft, testimonials_heading: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm font-serif italic"
                                        placeholder="e.g. Shared Experiences."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Testimonials List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-20">Client &amp; Quote</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[120px] text-center">Photo</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[130px]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[140px]">Actions</th>
                                </tr>
                            </thead>
                        </table>
                        
                        <Reorder.Group axis="y" values={testimonials} onReorder={handleReorder} className="divide-y divide-slate-50">
                            {testimonials.map((t) => (
                                <Reorder.Item 
                                    key={t.id} 
                                    value={t}
                                    className="group hover:bg-brand-secondary/30 transition-all duration-300 w-full flex items-center cursor-grab active:cursor-grabbing"
                                >
                                    <div className="flex-1 flex items-start py-5">
                                        <div className="pl-8 pt-1 text-slate-200 group-hover:text-brand-primary transition-colors shrink-0">
                                            <IconGripVertical size={24} />
                                        </div>
                                        <div className="flex-1 px-6 min-w-[280px]">
                                            <p className="text-sm font-black text-slate-800 tracking-tight mb-0.5">{t.name}</p>
                                            <p className="text-[10px] text-brand-primary/70 font-bold mb-2 tracking-wide">{t.designation}</p>
                                            <div className="flex items-start gap-2">
                                                <IconQuote size={12} className="text-brand-primary/30 shrink-0 mt-0.5" />
                                                <p className="text-xs text-slate-500 font-light italic leading-relaxed line-clamp-2">{t.quote}</p>
                                            </div>
                                        </div>
                                        <div className="px-4 w-[120px] flex justify-center shrink-0">
                                            {t.image ? (
                                                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                                                    <IconPhotoStar size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-6 w-[130px] shrink-0">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${t.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                {t.status === "Active" ? <IconCircleCheckFilled size={14} /> : <IconCircleXFilled size={14} />}
                                                {t.status}
                                            </div>
                                        </div>
                                        <div className="px-6 flex items-center justify-end gap-3 w-[140px] shrink-0">
                                            <button onClick={() => handleToggleStatus(t)} className="text-slate-400 hover:text-blue-500 transition-colors" title="Toggle Status">
                                                <IconEye size={18} />
                                            </button>
                                            <button onClick={() => setEditingTestimonial(t)} className="text-slate-400 hover:text-brand-primary transition-colors" title="Edit">
                                                <IconEdit size={18} />
                                            </button>
                                            <button onClick={() => { setDeletingId(t.id); setModalTitle("Delete Testimonial"); setIsPromptModalOpen(true); }} className="text-slate-400 hover:text-rose-500 transition-colors" title="Delete">
                                                <IconTrash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>

                        {testimonials.length === 0 && (
                            <div className="py-24 text-center text-slate-400">
                                <IconQuote size={40} className="mx-auto mb-4 opacity-30" />
                                <p className="text-sm font-bold">No testimonials yet. Add your first one!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Modal */}
                <Modal 
                    isOpen={!!editingTestimonial} 
                    onClose={() => setEditingTestimonial(null)} 
                    title={editingTestimonial?.id ? 'Edit Testimonial' : 'Add Testimonial'}
                >
                    <form onSubmit={handleEditSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Client Name</label>
                                <input type="text" value={editingTestimonial?.name || ''} onChange={e => setEditingTestimonial({...editingTestimonial, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium" placeholder="e.g. Alex Henderson" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Designation / Role</label>
                                <input type="text" value={editingTestimonial?.designation || ''} onChange={e => setEditingTestimonial({...editingTestimonial, designation: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium" placeholder="e.g. Performance Specialist · MBW London" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2 flex justify-between">
                                Quote / Review
                                <span className={`text-[9px] font-bold tracking-normal transition-colors ${(editingTestimonial?.quote?.length || 0) >= 180 ? 'text-rose-500' : 'text-slate-400'}`}>
                                    {editingTestimonial?.quote?.length || 0} / 200
                                </span>
                            </label>
                            <textarea 
                                value={editingTestimonial?.quote || ''} 
                                onChange={e => setEditingTestimonial({...editingTestimonial, quote: e.target.value})} 
                                maxLength={200}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-light italic text-slate-700 leading-relaxed resize-none" 
                                rows="4" 
                                placeholder="The interior upgrades from MBW completely transformed the feel of my cabin..." 
                                required 
                            />
                        </div>
                        <div>
                            <ImageUpload
                                label="Photo URL"
                                currentUrl={editingTestimonial?.image}
                                showNotification={showNotification}
                                recSize="4:5 (portrait)"
                                onUpload={(url) => setEditingTestimonial({ ...editingTestimonial, image: url })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Status</label>
                            <select value={editingTestimonial?.status || 'Active'} onChange={e => setEditingTestimonial({...editingTestimonial, status: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold text-slate-700">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-slate-50">
                            <button type="button" onClick={() => setEditingTestimonial(null)} className="flex-1 h-16 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-200 transition-colors">Cancel</button>
                            <button type="submit" className="flex-[2] h-16 bg-brand-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-violet-100 hover:scale-[1.02] active:scale-[0.98] transition-all">Preserve Testimonial</button>
                        </div>
                    </form>
                </Modal>

                {/* Confirm Delete Modal */}
                <Modal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} title={modalTitle}>
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                            <IconTrash size={40} />
                        </div>
                        <p className="text-slate-500 text-sm">Are you sure you want to remove this testimonial? This action cannot be undone.</p>
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

export default TestimonialManagement;



