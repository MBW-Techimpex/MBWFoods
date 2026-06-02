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
    IconPhotoStar,
    IconPencil,
    IconDeviceFloppy,
    IconEyeOff
} from "@tabler/icons-react";
import { Reorder } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";
import { getImageUrl } from "../../utils/imageHelper";
import { ImageUpload } from "../../components/admin/UploadComponents";

const SETTINGS_API = `${API_BASE}/api/section-settings`;
const SECTION_KEY = "explorecategories";

const CategoryManagement = () => {
    const API_URL = `${API_BASE}/api/categories`;
    const [categories, setCategories] = useState([]);
    const [hasChanged, setHasChanged] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const { showNotification } = useNotification();

    // Section heading/description state
    const [sectionSettings, setSectionSettings] = useState({
        explorecategories_tagline: "Seasonal Edits",
        explorecategories_heading: "Explore Categories",
        explorecategories_quote: '"Every flower is a soul blossoming in nature."'
    });
    const [isEditingSection, setIsEditingSection] = useState(false);
    const [exploreCategoriesSectionShow, setExploreCategoriesSectionShow] = useState(true);
    const [sectionDraft, setSectionDraft] = useState({});

    // Modal state for actions
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchSectionSettings();
    }, []);

    const fetchSectionSettings = async () => {
        try {
            const res = await fetch(`${SETTINGS_API}?section=${SECTION_KEY}`, { credentials: 'include' });
            const data = await res.json();
            if (Object.keys(data).length > 0) {
                setSectionSettings(prev => ({ ...prev, ...data }));
                if (data.explorecategories_section_show !== undefined) {
                    setExploreCategoriesSectionShow(data.explorecategories_section_show === 'true');
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveSectionSettings = async () => {
        try {
            await fetch(`${SETTINGS_API}/upsert`, {
                credentials: 'include',
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

    const fetchCategories = async () => {
        try {
            const res = await fetch(API_URL, { credentials: 'include' });
            const data = await res.json();
            setCategories(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReorder = (newOrder) => {
        setCategories(newOrder);
        setHasChanged(true);
    };

    const handleSaveSequence = async () => {
        try {
            const orderedIds = categories.map(c => c.id);
            await fetch(`${API_URL}/reorder`, {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds })
            });
            setHasChanged(false);
            showNotification("Category sequence saved!", "success");
        } catch (err) {
            showNotification("Failed to save sequence.", "error");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) {
            showNotification("File is too large (max 1MB).", "error");
            return;
        }

        setIsUploading(true);
        showNotification("Compressing and uploading category image...", "info");

        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData, credentials: 'include' });
            const data = await res.json();
            if (data.imageUrl) {
                setEditingCategory(prev => ({ ...prev, image: data.imageUrl }));
                setImagePreview(data.imageUrl);
                showNotification(`Image uploaded and compressed to ${data.size} KB!`, "success");
            } else {
                showNotification(data.error || "Upload failed.", "error");
            }
        } catch (err) {
            console.error(err);
            showNotification("Error uploading image.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try { 
            const method = editingCategory.id ? 'PUT' : 'POST';
            const url = editingCategory.id ? `${API_URL}/${editingCategory.id}` : API_URL;
            await fetch(url, {
                credentials: 'include',
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCategory)
            });
            fetchCategories();
            setEditingCategory(null);
            showNotification(`Category ${editingCategory.id ? 'updated' : 'created'} successfully!`, "success");
        } catch (error) {
            showNotification("Error saving category.", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/${deletingId}`, { method: 'DELETE', credentials: 'include' });
            fetchCategories();
            setIsPromptModalOpen(false);
            showNotification("Category deleted successfully.", "success");
        } catch (e) {
            showNotification("Failed to delete.", "error");
        }
    };

    const handleToggleStatus = async (category) => {
        try {
            const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';
            await fetch(`${API_URL}/${category.id}`, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchCategories();
        } catch (e) { console.error(e); }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">

                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Explore Categories</h1>
                        <p className="text-slate-500 font-medium">Manage the dynamic seasonal categories displayed on your homepage.</p>
                    </div>
                    <div className="flex gap-3">
                        {hasChanged && (
                            <button onClick={handleSaveSequence} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-100">
                                Save Sequence
                            </button>
                        )}
                        <button
                            onClick={() => { setEditingCategory({ name: '', image: '', count: '0 Items', shape: 'rounded-t-full', link: '#', status: 'Active' }); setImagePreview(""); }}
                            className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <IconPlus size={18} />
                            Add New Category
                        </button>
                    </div>
                </div>

                {/* Master Visibility Switch */}
                <div className="mb-10 max-w-xl">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${exploreCategoriesSectionShow ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                                {exploreCategoriesSectionShow ? <IconEye size={24} /> : <IconEyeOff size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Section Visibility</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Categories Switch</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="space-y-1">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest block">Section Status</span>
                                <p className="text-[11px] font-bold text-slate-400 italic">
                                    {exploreCategoriesSectionShow ? "Visible on Homepage" : "Hidden from Homepage"}
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const nextStatus = !exploreCategoriesSectionShow;
                                    setExploreCategoriesSectionShow(nextStatus);
                                    try {
                                        await fetch(`${SETTINGS_API}/upsert`, {
                                            method: 'POST',
                                            credentials: 'include',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ explorecategories_section_show: String(nextStatus) })
                                        });
                                        showNotification(`Categories Section is now ${nextStatus ? 'Visible' : 'Hidden'}`, "success");
                                    } catch (e) {
                                        showNotification("Failed to update visibility", "error");
                                    }
                                }}
                                className={`w-16 h-8 rounded-full relative transition-all duration-300 shadow-inner ${exploreCategoriesSectionShow ? "bg-emerald-500" : "bg-slate-300"}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${exploreCategoriesSectionShow ? "right-1" : "left-1"}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Section Heading / Description Editor ── */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-black text-slate-800 tracking-tight">Section Heading &amp; Label</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Controls the tagline, main heading, and the right-side quote shown on your homepage.</p>
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
                        // Preview mode
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-50 rounded-2xl">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{sectionSettings.explorecategories_tagline}</span>
                                <h3 className="text-2xl font-serif text-slate-800">{sectionSettings.explorecategories_heading}</h3>
                            </div>
                            {sectionSettings.explorecategories_quote && (
                                <p className="text-slate-400 text-sm font-light italic border-l-2 border-brand-primary/20 pl-4 max-w-xs">
                                    {sectionSettings.explorecategories_quote}
                                </p>
                            )}
                        </div>
                    ) : (
                        // Edit mode
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                        Top Tagline <span className="text-slate-400 normal-case font-normal tracking-normal">e.g. "Seasonal Edits"</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={sectionDraft.explorecategories_tagline || ''}
                                        onChange={e => setSectionDraft({ ...sectionDraft, explorecategories_tagline: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm"
                                        placeholder="e.g. Seasonal Edits"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                        Main Heading <span className="text-slate-400 normal-case font-normal tracking-normal">e.g. "Explore Categories"</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={sectionDraft.explorecategories_heading || ''}
                                        onChange={e => setSectionDraft({ ...sectionDraft, explorecategories_heading: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm font-serif"
                                        placeholder="e.g. Explore Categories"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                    Right-side Quote <span className="text-slate-400 normal-case font-normal tracking-normal">(italic text shown on the right)</span>
                                </label>
                                <input
                                    type="text"
                                    value={sectionDraft.explorecategories_quote || ''}
                                    onChange={e => setSectionDraft({ ...sectionDraft, explorecategories_quote: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm italic text-slate-500"
                                    placeholder={'"Every flower is a soul blossoming in nature."'}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Categories List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                        <div className="min-w-[800px]">
                            <div className="bg-slate-50 border-b border-slate-100 flex items-center py-5">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-20 flex-1 min-w-[300px]">Image &amp; Name</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-[200px] px-8">Details</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-[150px] px-8">Status</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right min-w-[150px] px-8">Actions</div>
                            </div>

                            <Reorder.Group axis="y" values={categories} onReorder={handleReorder} className="divide-y divide-slate-50">

                                {categories.map((cat) => (
                                    <Reorder.Item
                                        key={cat.id}
                                        value={cat}
                                        className="group hover:bg-brand-secondary/30 transition-all duration-300 w-full flex items-center cursor-grab active:cursor-grabbing"
                                    >
                                        <div className="flex-1 flex items-center py-4">
                                            <div className="pl-8 text-slate-200 group-hover:text-brand-primary transition-colors">
                                                <IconGripVertical size={24} />
                                            </div>
                                            <div className="flex items-center gap-6 pl-6 flex-1 min-w-[300px]">
                                                <div className={`w-14 h-14 overflow-hidden border-2 border-slate-100 shrink-0 ${cat.shape === 'rounded-t-full' ? 'rounded-t-full rounded-b-xl' : 'rounded-xl'}`}>
                                                    <img src={`${getImageUrl(cat.image)}?t=${Date.now()}`} className="w-full h-full object-cover" alt="preview" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 tracking-tight uppercase tracking-wider">{cat.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold truncate">Link: {cat.link}</p>
                                                </div>
                                            </div>
                                            <div className="px-8 w-[200px]">
                                                <div className="text-xs font-bold text-slate-600 mb-1">{cat.count}</div>
                                                <div className="text-[10px] text-slate-400">{cat.shape === 'rounded-t-full' ? 'Arch Shape' : 'Square Shape'}</div>
                                            </div>
                                            <div className="px-8 w-[150px]">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${cat.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                    {cat.status === "Active" ? <IconCircleCheckFilled size={14} /> : <IconCircleXFilled size={14} />}
                                                    {cat.status}
                                                </div>
                                            </div>
                                            <div className="px-8 flex items-center justify-end gap-3 min-w-[150px]">
                                                <button onClick={() => handleToggleStatus(cat)} className="text-slate-400 hover:text-blue-500">
                                                    <IconEye size={18} />
                                                </button>
                                                <button onClick={() => { setEditingCategory(cat); setImagePreview(cat.image); }} className="text-slate-400 hover:text-brand-primary">
                                                    <IconEdit size={18} />
                                                </button>
                                                <button onClick={() => { setDeletingId(cat.id); setModalTitle("Delete Category"); setIsPromptModalOpen(true); }} className="text-slate-400 hover:text-rose-500">
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
                {editingCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl p-10 relative max-h-[90vh] overflow-y-auto no-scrollbar">
                            <button
                                onClick={() => setEditingCategory(null)}
                                className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                                <IconX size={20} className="stroke-[3]" />
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 font-serif mb-8 text-center italic">{editingCategory.id ? 'Edit Category' : 'Add New Category'}</h2>
                            <form onSubmit={handleEditSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Col - Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Category Name</label>
                                            <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="e.g. STEERING WHEELS" required />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Item Count Label</label>
                                            <input type="text" value={editingCategory.count} onChange={e => setEditingCategory({ ...editingCategory, count: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="e.g. 10 Items" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Image Shape</label>
                                            <select value={editingCategory.shape} onChange={e => setEditingCategory({ ...editingCategory, shape: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none">
                                                <option value="rounded-t-full">Arch Shape (rounded-t-full)</option>
                                                <option value="rounded-[3rem]">Rounded Square (rounded-[3rem])</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Target Link</label>
                                            <input type="text" value={editingCategory.link} onChange={e => setEditingCategory({ ...editingCategory, link: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="/category/interior" />
                                        </div>
                                    </div>
                                    {/* Right Col - Image Upload */}
                                    <div className="space-y-2">
                                        <ImageUpload
                                            label="Category Image"
                                            currentUrl={editingCategory.image}
                                            showNotification={showNotification}
                                            recSize="Portrait/Square"
                                            onUpload={(url) => {
                                                setEditingCategory({ ...editingCategory, image: url });
                                                setImagePreview(url);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-6 border-t border-slate-100">
                                    <button type="button" onClick={() => setEditingCategory(null)} className="flex-1 h-14 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl">Cancel</button>
                                    <button type="submit" disabled={isUploading} className="flex-2 h-14 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg disabled:opacity-50">Save Category</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Prompt Modal */}
                <Modal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} title={modalTitle}>
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                            <IconTrash size={40} />
                        </div>
                        <p className="text-slate-500 text-sm">Are you sure you want to remove this category? This action cannot be undone.</p>
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

export default CategoryManagement;



