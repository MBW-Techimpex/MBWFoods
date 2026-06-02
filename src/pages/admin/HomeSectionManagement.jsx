import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import { 

  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconPlus as IconAdd,
  IconPencil,
  IconDeviceFloppy,
  IconPhotoStar,
  IconX,
  IconGripVertical,
  IconEye,
  IconEyeOff
} from "@tabler/icons-react";
import { Reorder } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";
import { getImageUrl } from "../../utils/imageHelper";
import { ImageUpload } from "../../components/admin/UploadComponents";

const SECTIONS_API = `${API_BASE}/api/home-sections`;
const SETTINGS_API = `${API_BASE}/api/section-settings`;

const HomeSectionManagement = ({ sectionType, pageTitle, description, onBack }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const { showNotification } = useNotification();
    const [hasChanged, setHasChanged] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(true);

    // Dynamic product selection state
    const [categoriesMap, setCategoriesMap] = useState({});
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [fetchingProducts, setFetchingProducts] = useState(false);

    // Section heading state
    const [sectionSetting, setSectionSetting] = useState({
        title: "",
        subtitle: "",
        description: ""
    });
    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [headerDraft, setHeaderDraft] = useState({});

    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [sectionType]);

    useEffect(() => {
        if (editingItem) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [editingItem]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/menus`, { credentials: 'include' });
            const data = await res.json();
            const map = {};
            data.filter(m => m.status === 'active').forEach(menu => {
                map[menu.name] = (menu.subItems || [])
                    .filter(sub => sub.status === 'active')
                    .map(sub => sub.name);
            });
            setCategoriesMap(map);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const fetchProductsFiltered = async (categoryName, subCategoryName) => {
        try {
            setFetchingProducts(true);
            let url = `${API_BASE}/api/products?category=${encodeURIComponent(categoryName)}`;
            if (subCategoryName) {
                url += `&sub_category=${encodeURIComponent(subCategoryName)}`;
            }
            const res = await fetch(url, { credentials: 'include' });
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setFetchingProducts(false);
        }
    };

    const handleCategoryChange = (e) => {
        const cat = e.target.value;
        setSelectedCategory(cat);
        setSelectedSubCategory(""); // Reset sub-category
        setProducts([]); // Clear current products immediately
        if (cat) {
            fetchProductsFiltered(cat, "");
        }
    };

    const handleSubCategoryChange = (e) => {
        const subCat = e.target.value;
        setSelectedSubCategory(subCat);
        setProducts([]);
        if (selectedCategory) {
            fetchProductsFiltered(selectedCategory, subCat);
        }
    };

    const handleProductSelect = (e) => {
        const productId = parseInt(e.target.value);
        const product = products.find(p => p.id === productId);
        if (product) {
            setEditingItem(prev => ({
                ...prev,
                product_id: product.id,
                title: product.name,
                price: product.price,
                image: product.image,
                badge: product.badge || prev.badge,
                stock_status: product.stock > 0 ? "In stock" : "Out of stock"
            }));
            setImagePreview(product.image);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(SECTIONS_API, { credentials: 'include' });
            const data = await res.json();
            
            // Find our specific section header
            const currentSection = data.sections.find(s => s.section_type === sectionType);
            if (currentSection) {
                setSectionSetting(currentSection);
            } else {
                setSectionSetting({ title: pageTitle, subtitle: "", description: "" });
            }

            // Filter items for this section
            const sectionItems = data.items.filter(item => item.section_type === sectionType);
            setItems(sectionItems);
        } catch (err) {
            showNotification("Failed to fetch data", "error");
        } finally {
            setLoading(false);
        }

        // Fetch Visibility Setting
        try {
            const res = await fetch(`${SETTINGS_API}?section=${sectionType}`, { credentials: 'include' });
            const data = await res.json();
            const visibilityKey = `${sectionType}_section_show`;
            if (data[visibilityKey] !== undefined) {
                setSectionVisible(data[visibilityKey] === 'true');
            }
        } catch (err) {
            console.error("Failed to fetch visibility setting", err);
        }

    };

    const handleSaveHeader = async () => {
        try {
            const res = await fetch(`${SECTIONS_API}/section/${sectionType}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(headerDraft),
                credentials: 'include'
            });
            if (res.ok) {
                setSectionSetting(await res.json());
                setIsEditingHeader(false);
                showNotification("Header updated successfully!", "success");
            }
        } catch (err) {
            showNotification("Error updating header", "error");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1 * 1024 * 1024) {
            showNotification("File is too large (max 1MB).", "warning");
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch(`${API_BASE}/api/upload`, { 
                method: 'POST', 
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();
            if (data.imageUrl) {
                setEditingItem(prev => ({ ...prev, image: data.imageUrl }));
                setImagePreview(data.imageUrl);
            }
        } catch (err) {
            showNotification("Error uploading image", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleItemSave = async (e) => {
        e.preventDefault();
        try {
            const method = editingItem.id ? 'PUT' : 'POST';
            const url = editingItem.id ? `${SECTIONS_API}/items/${editingItem.id}` : `${SECTIONS_API}/items`;
            const payload = { ...editingItem, section_type: sectionType };
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            
            if (res.ok) {
                fetchData();
                setEditingItem(null);
                setSelectedCategory("");
                setSelectedSubCategory("");
                setProducts([]);
                showNotification(`Item ${editingItem.id ? 'updated' : 'added'} successfully!`, "success");
            }
        } catch (error) {
            showNotification("Error saving item", "error");
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`${SECTIONS_API}/items/${deletingId}`, { 
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                fetchData();
                setIsDeleteModalOpen(false);
                showNotification("Item removed", "success");
            }
        } catch (e) {
            showNotification("Delete failed", "error");
        }
    };

    const handleToggleActive = async (item) => {
        try {
            const nextStatus = !item.is_active;
            const res = await fetch(`${SECTIONS_API}/items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: nextStatus }),
                credentials: 'include'
            });
            if (res.ok) {
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: nextStatus } : i));
                showNotification(`Item ${nextStatus ? 'activated' : 'deactivated'}`, "success");
            }
        } catch (error) {
            showNotification("Status update failed", "error");
        }
    };

    const handleReorder = (newOrder) => {
        setItems(newOrder);
        setHasChanged(true);
    };

    const handleSavePositions = async () => {
        try {
            const res = await fetch(`${SECTIONS_API}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds: items.map(i => i.id) }),
                credentials: 'include'
            });
            
            if (res.ok) {
                setHasChanged(false);
                showNotification("Gallery sequence synchronized!", "success");
            }
        } catch (error) {
            showNotification("Sequence synchronization failed.", "error");
        }
    };

    if (loading) return <AdminLayout><div className="p-20 text-center text-slate-400">Restoring showroom data...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-32">
                
                {onBack && (
                    <button 
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-brand-primary font-bold text-xs transition-all bg-slate-50 hover:bg-brand-secondary/40 px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm cursor-pointer"
                    >
                        ← Back to Sections Manager
                    </button>
                )}

                {/* Page Navigation Area */}
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">{pageTitle}</h1>
                        <p className="text-slate-500 font-medium">{description}</p>
                    </div>
                    <div className="flex gap-3">
                        {hasChanged && (
                            <button onClick={handleSavePositions} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-xs">
                                Save Sequence
                            </button>
                        )}
                        <button 
                            onClick={() => { setEditingItem({ title: '', price: '', image: '', badge: '', stock_status: 'In stock', product_id: null }); setImagePreview(""); }}
                            className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 flex items-center gap-2"
                        >
                            <IconPlus size={18} />
                            Add New Product
                        </button>
                    </div>
                </div>
              
              
                {/* Master Visibility Switch */}
                <div className="mb-10 max-w-xl">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${sectionVisible ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                                {sectionVisible ? <IconEye size={24} /> : <IconEyeOff size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Section Visibility</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{pageTitle} Switch</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="space-y-1">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest block">Section Status</span>
                                <p className="text-[11px] font-bold text-slate-400 italic">
                                    {sectionVisible ? "Visible on Homepage" : "Hidden from Homepage"}
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const nextStatus = !sectionVisible;
                                    setSectionVisible(nextStatus);
                                    try {
                                        const visibilityKey = `${sectionType}_section_show`;
                                        await fetch(`${SETTINGS_API}/upsert`, {
                                            method: 'POST',
                                            credentials: 'include',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ [visibilityKey]: String(nextStatus) })
                                        });
                                        showNotification(`${pageTitle} is now ${nextStatus ? 'Visible' : 'Hidden'}`, "success");
                                    } catch (e) {
                                        showNotification("Failed to update visibility", "error");
                                    }
                                }}
                                className={`w-16 h-8 rounded-full relative transition-all duration-300 shadow-inner ${sectionVisible ? "bg-emerald-500" : "bg-slate-300"}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${sectionVisible ? "right-1" : "left-1"}`} />
                            </button>
                        </div>
                    </div>
                </div>
              

                {/* Section Header Editor */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 mb-10 overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">Section Content Management</h2>
                            <p className="text-xs text-slate-400 font-medium tracking-tight">Customize the branding and call-to-action for this showroom collection.</p>
                        </div>
                        {!isEditingHeader ? (
                            <button 
                                onClick={() => { setHeaderDraft({ ...sectionSetting }); setIsEditingHeader(true); }}
                                className="px-5 py-2.5 bg-brand-secondary text-brand-primary rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-brand-primary hover:text-white transition-all"
                            >
                                <IconPencil size={14} /> Edit Header
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingHeader(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">Cancel</button>
                                <button onClick={handleSaveHeader} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-100">
                                    <IconDeviceFloppy size={14} /> Save Header
                                </button>
                            </div>
                        )}
                    </div>

                    {!isEditingHeader ? (
                        <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[3px] mb-2 block">{sectionSetting.subtitle || "LATEST RELEASES"}</span>
                            <h3 className="text-3xl font-serif text-slate-900 mb-3 italic">{sectionSetting.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{sectionSetting.description || "Exclusively curated performance upgrades and bespoke automotive accessories."}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tagline (Subtitle)</label>
                                    <input 
                                        type="text" 
                                        value={headerDraft.subtitle} 
                                        onChange={e => setHeaderDraft({...headerDraft, subtitle: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm"
                                        placeholder="e.g. JUST ARRIVED"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Primary Heading</label>
                                    <input 
                                        type="text" 
                                        value={headerDraft.title} 
                                        onChange={e => setHeaderDraft({...headerDraft, title: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-serif"
                                        placeholder="e.g. Signature Components"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                                    Description / Bio
                                    <span className={`text-[9px] font-bold tracking-normal transition-colors ${(headerDraft.description?.length || 0) >= 180 ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {headerDraft.description?.length || 0} / 200
                                    </span>
                                </label>
                                <textarea 
                                    rows={4}
                                    value={headerDraft.description} 
                                    onChange={e => setHeaderDraft({...headerDraft, description: e.target.value})}
                                    maxLength={200}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm no-scrollbar resize-none"
                                    placeholder="Briefly describe what makes this collection special..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Items Grid */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="divide-y divide-slate-50">
                        {items.length === 0 && <div className="p-20 text-center text-slate-300 italic font-medium">No curated items found in this collection. Start by adding one!</div>}
                        {items.map((item) => (
                            <Reorder.Item 
                                key={item.id} 
                                value={item}
                                className="group hover:bg-slate-50/50 transition-all duration-300 w-full flex items-center cursor-grab active:cursor-grabbing p-6"
                            >
                                <div className="text-slate-200 group-hover:text-brand-primary transition-colors mr-6">
                                    <IconGripVertical size={24} />
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                                            <img src={`${getImageUrl(item.image)}?t=${Date.now()}`} className="w-full h-full object-cover" alt="item" />
                                        </div>
                                        <div>
                                            {item.badge && <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1 block">{item.badge}</span>}
                                            <h4 className="text-sm font-black text-slate-800 tracking-tight uppercase">{item.title}</h4>
                                            <p className="text-xs font-bold text-emerald-600 mt-1">{item.price}</p>
                                            {item.product_id && <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">Linked to PRD-{1000 + item.product_id}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right px-8">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-xs font-bold text-slate-900">{item.stock_status}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleToggleActive(item)}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${item.is_active ? 'bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                title={item.is_active ? 'Hide from store' : 'Show in store'}
                                            >
                                                {item.is_active ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                                            </button>
                                            <button 
                                                onClick={() => { setEditingItem(item); setImagePreview(item.image); }}
                                                className="w-10 h-10 bg-brand-secondary text-brand-primary rounded-xl flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                            >
                                                <IconEdit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => { setDeletingId(item.id); setIsDeleteModalOpen(true); }}
                                                className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <IconTrash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            </div>

            {/* Modal Editor */}
            {editingItem && createPortal(
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in" 
                        onClick={() => setEditingItem(null)}
                    ></div>
                    
                    <div className="bg-white rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.3)] w-full max-w-6xl p-12 relative max-h-[95vh] overflow-y-auto no-scrollbar z-10 animate-bloom-in origin-center">
                        <button 
                            onClick={() => setEditingItem(null)} 
                            className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 hover:rotate-90 transition-all duration-300"
                        >
                            <IconX size={32} />
                        </button>
                        
                        <h2 className="text-2xl font-black text-slate-900 font-serif mb-8 italic text-center">
                            {editingItem.id ? 'Refine Product Details' : 'Feature New Product'}
                        </h2>
                        
                        <div className="mb-8 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest block ml-2">Inventory Category</label>
                                <select 
                                    value={selectedCategory} 
                                    onChange={handleCategoryChange}
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-bold"
                                >
                                    <option value="">Select Category...</option>
                                    {Object.keys(categoriesMap).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest block ml-2">Sub-Category</label>
                                <select 
                                    disabled={!selectedCategory || !categoriesMap[selectedCategory]?.length}
                                    value={selectedSubCategory}
                                    onChange={handleSubCategoryChange}
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-bold disabled:opacity-50"
                                >
                                    <option value="">All Sub-Categories</option>
                                    {selectedCategory && categoriesMap[selectedCategory]?.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest block ml-2">Target Product</label>
                                <select 
                                    disabled={!selectedCategory || fetchingProducts}
                                    onChange={handleProductSelect}
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-bold disabled:opacity-50"
                                >
                                    <option value="">
                                        {fetchingProducts ? "Loading..." : 
                                         !selectedCategory ? "Select Product..." :
                                         products.length === 0 ? "No products found" : 
                                         "Select Product..."}
                                    </option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - {p.price}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <form onSubmit={handleItemSave} className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-50 pt-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Display Title</label>
                                    <input type="text" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-bold uppercase tracking-wider" placeholder="e.g. CARBON FIBER STEERING WHEEL" required />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Investment (Price)</label>
                                        <input type="text" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-black text-brand-primary" placeholder="e.g. ₹4,999.00" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status Badge</label>
                                        <input type="text" value={editingItem.badge} onChange={e => setEditingItem({...editingItem, badge: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm" placeholder="e.g. PREMIUM" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Availability Notice</label>
                                    <input type="text" value={editingItem.stock_status} onChange={e => setEditingItem({...editingItem, stock_status: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm" placeholder="e.g. In stock / Only 2 left" />
                                </div>
                                {editingItem.product_id && (
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Dynamic Link Enabled</p>
                                        <p className="text-xs text-emerald-500 font-medium tracking-tight">This item is synchronized with Product ID: <span className="font-bold">PRD-{1000 + editingItem.product_id}</span></p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                <ImageUpload
                                    label="Visual Masterpiece"
                                    currentUrl={editingItem.image}
                                    showNotification={showNotification}
                                    recSize="Portait/Square"
                                    onUpload={(url) => {
                                        setEditingItem({ ...editingItem, image: url });
                                        setImagePreview(url);
                                    }}
                                />
                                
                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setEditingItem(null)} className="flex-1 h-16 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-[0.2em] rounded-3xl active:scale-95 transition-transform">Cancel</button>
                                    <button type="submit" disabled={isUploading} className="flex-[2] h-16 bg-brand-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-violet-200 active:scale-[0.98] transition-all">Preserve Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>, 
                document.body
            )}

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Remove Selection">
                <div className="text-center p-6 space-y-6">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto"><IconTrash size={40} /></div>
                    <p className="text-slate-500 text-sm font-medium">This will permanently remove this arrangement from the homepage. Proceed with caution.</p>
                    <div className="flex gap-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black text-xs uppercase rounded-2xl">Return back</button>
                        <button onClick={handleDelete} className="flex-1 py-4 bg-rose-500 text-white font-black text-xs uppercase rounded-2xl shadow-xl shadow-rose-100">Permanently Remove</button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default HomeSectionManagement;



