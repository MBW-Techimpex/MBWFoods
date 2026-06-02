
import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import { createPortal } from "react-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
    IconPlus,
    IconSearch,
    IconFilter,
    IconDownload,
    IconEdit,
    IconTrash,
    IconPackage,
    IconDotsVertical,
    IconChevronLeft,
    IconChevronRight,
    IconUpload,
    IconX,
    IconCheck,
    IconChevronDown,
    IconEye,
    IconEyeOff,
    IconPhoto
} from "@tabler/icons-react";
import { getImageUrl } from "../../utils/imageHelper";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";
import { ImageUpload, GalleryUpload } from "../../components/admin/UploadComponents";

const RichTextEditor = ({ value, onChange, label, maxLength }) => {
    const editorRef = React.useRef(null);

    const execCommand = (e, command, val = null) => {
        e.preventDefault(); // Prevent focus loss
        document.execCommand(command, false, val);
        if (editorRef.current) {
            editorRef.current.focus();
            onChange(editorRef.current.innerHTML);
        }
    };

    React.useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                <span className={`text-[10px] font-bold ${value.length > maxLength * 0.9 ? 'text-rose-500' : 'text-slate-400'}`}>
                    {value.replace(/<[^>]*>/g, '').length} / {maxLength} chars
                </span>
            </div>
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:border-brand-primary transition-all">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-100">
                    <button type="button" onMouseDown={(e) => execCommand(e, 'bold')} className="p-1.5 hover:bg-white hover:text-brand-primary rounded-lg transition-all" title="Bold">
                        <span className="font-bold px-1 text-sm">B</span>
                    </button>
                    <button type="button" onMouseDown={(e) => execCommand(e, 'italic')} className="p-1.5 hover:bg-white hover:text-brand-primary rounded-lg transition-all" title="Italic">
                        <span className="italic font-serif px-1 text-sm">I</span>
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <button type="button" onMouseDown={(e) => execCommand(e, 'insertUnorderedList')} className="p-1.5 hover:bg-white hover:text-brand-primary rounded-lg transition-all" title="Bullet List">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    </button>
                    <button type="button" onMouseDown={(e) => execCommand(e, 'insertOrderedList')} className="p-1.5 hover:bg-white hover:text-brand-primary rounded-lg transition-all" title="Numbered List">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
                    </button>
                </div>
                {/* Editor Area */}
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => {
                        onChange(e.currentTarget.innerHTML);
                    }}
                    className="min-h-[120px] max-h-[300px] p-4 text-sm outline-none overflow-y-auto custom-scrollbar prose prose-sm max-w-none 
                               [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
                    placeholder="Enter product description..."
                    style={{ minHeight: '120px' }}
                />
            </div>
        </div>
    );
};

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ title: '', text: '', type: 'success' });
    const { showNotification } = useNotification();

    // Excel Image Helper State
    const [showImageHelper, setShowImageHelper] = useState(false);
    const [helperImageUrl, setHelperImageUrl] = useState("");
    const [copiedHelper, setCopiedHelper] = useState(false);

    // Custom Bulk Upload State
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkExcelFile, setBulkExcelFile] = useState(null);
    const [bulkImages, setBulkImages] = useState([]);
    const [isBulkUploading, setIsBulkUploading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [categoriesMap, setCategoriesMap] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Custom Category & Sub-category State
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState("");
    const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);
    const [customSubCategory, setCustomSubCategory] = useState("");

    const fetchCategories = async () => {
        try {
            // Fetch menus
            const res = await fetch(`${API_BASE}/api/menus`, { credentials: 'include' });
            const data = await res.json();
            
            // Fetch collections to dynamically populate categories/subcategories from custom pages
            let colData = [];
            try {
                const colRes = await fetch(`${API_BASE}/api/collections`, { credentials: 'include' });
                if (colRes.ok) {
                    colData = await colRes.json();
                }
            } catch (colErr) {
                console.error("Error fetching collections:", colErr);
            }

            const map = {};
            
            // Populate from menus
            if (Array.isArray(data)) {
                data.forEach(menu => {
                    if (menu.status === 'active') {
                        map[menu.name] = (menu.subItems || [])
                            .filter(sub => sub.status === 'active')
                            .map(sub => sub.name);
                    }
                });
            }

            // Populate from collections
            if (Array.isArray(colData)) {
                colData.forEach(col => {
                    if (col.is_active) {
                        if (col.filter_field === 'category') {
                            const catName = col.filter_value;
                            if (catName && !map[catName]) {
                                map[catName] = [];
                            }
                        } else if (col.filter_field === 'sub_category') {
                            const subCatName = col.filter_value;
                            if (subCatName) {
                                // Add to all existing categories to ensure user can select it under any category
                                Object.keys(map).forEach(cat => {
                                    if (!map[cat].includes(subCatName)) {
                                        map[cat].push(subCatName);
                                    }
                                });
                            }
                        }
                    }
                });
            }
            
            setCategoriesMap(map);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        sub_category: '',
        stock: 0,
        badge: '',
        dimensions: '',
        weight: '',
        images: []
    });

    const [catFilter, setCatFilter] = useState("");
    const [subCatFilter, setSubCatFilter] = useState("");
    const [hasFiltered, setHasFiltered] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let url = `${API_BASE}/api/products`;
            const params = new URLSearchParams();
            if (catFilter) params.append('category', catFilter);
            if (subCatFilter) params.append('sub_category', subCatFilter);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await fetch(url, { credentials: 'include' });
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                console.error("API returned non-array data for products:", data);
                setProducts([]);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching products:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleFilterClick = () => {
        fetchProducts();
        setCurrentPage(1);
        if (catFilter || subCatFilter) {
            setHasFiltered(true);
        }
    };

    useEffect(() => {
        setHasFiltered(false);
    }, [catFilter, subCatFilter]);

    const downloadProductsExcel = () => {
        if (!products || products.length === 0) {
            showNotification("No products found for the selected category. Please filter first.", "warning");
            return;
        }

        const headers = ["ID", "Name", "Price", "Stock", "Category", "Sub-Category", "Status"];
        const data = products.map(p => [
            `PRD-${1000 + (p.id || 0)}`,
            p.name,
            p.price,
            p.stock,
            p.category,
            p.sub_category || "N/A",
            p.status || "Active"
        ]);

        const csvContent = [headers, ...data].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Products_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const downloadSampleTemplate = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/api/products/sample-template`, {
                credentials: 'include',
            });
            if (!response.ok) throw new Error("Failed to download template");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Dynamic_Product_Template.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification("Dynamic multi-sheet Excel template downloaded successfully!", "success");
        } catch (err) {
            console.error("Template download failed:", err);
            showNotification("Failed to generate dynamic Excel template.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCustomBulkUpload = async () => {
        if (!bulkExcelFile) {
            showNotification("Please select a spreadsheet file first.", "warning");
            return;
        }

        const formData = new FormData();
        formData.append('file', bulkExcelFile);
        
        if (bulkImages && bulkImages.length > 0) {
            for (let i = 0; i < bulkImages.length; i++) {
                formData.append('images', bulkImages[i]);
            }
        }

        setIsBulkUploading(true);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/products/bulk-upload`, {
                credentials: 'include',
                method: 'POST',
                body: formData,
            });
            
            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.message || "Bulk upload failed");
            }

            setStatusMessage({
                title: 'Upload Successful',
                text: result.message,
                type: 'success'
            });
            setShowStatusModal(true);
            setShowBulkModal(false);
            setBulkExcelFile(null);
            setBulkImages([]);
            await fetchProducts();
        } catch (err) {
            console.error("Bulk upload failed:", err);
            setStatusMessage({
                title: 'Upload Failed',
                text: err.message || 'There was an error processing your bulk upload. Please check the file format.',
                type: 'error'
            });
            setShowStatusModal(true);
        } finally {
            setIsBulkUploading(false);
            setLoading(false);
        }
    };

    const handleToggleStatus = async (product) => {
        try {
            const newStatus = product.status === 'Active' ? 'Inactive' : 'Active';
            const res = await fetch(`${API_BASE}/api/products/${product.id}`, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
                setStatusMessage({
                    title: 'Status Updated',
                    text: `Product is now ${newStatus}.`,
                    type: 'success'
                });
                setShowStatusModal(true);
            }
        } catch (err) {
            console.error("Toggle failed:", err);
        }
    };

    const handleAddClick = () => {
        setModalMode('add');
        setEditingProduct(null);
        setIsCustomCategory(false);
        setCustomCategory("");
        setIsCustomSubCategory(false);
        setCustomSubCategory("");
        setForm({
            name: '',
            description: '',
            price: '',
            image: '',
            category: Object.keys(categoriesMap)[0] || '',
            sub_category: '',
            stock: 0,
            badge: '',
            dimensions: '',
            weight: '',
            images: []
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (product) => {
        setModalMode('edit');
        setEditingProduct(product);
        
        // Determine if category or sub_category is custom (not defined in active menus/collections)
        const categoriesList = Object.keys(categoriesMap);
        const hasCategory = categoriesList.includes(product.category);
        const subCategoriesList = categoriesMap[product.category] || [];
        const hasSubCategory = !product.sub_category || subCategoriesList.includes(product.sub_category);
        
        if (!hasCategory && product.category) {
            setIsCustomCategory(true);
            setCustomCategory(product.category);
        } else {
            setIsCustomCategory(false);
            setCustomCategory("");
        }
        
        if (!hasSubCategory && product.sub_category) {
            setIsCustomSubCategory(true);
            setCustomSubCategory(product.sub_category);
        } else {
            setIsCustomSubCategory(false);
            setCustomSubCategory("");
        }

        setForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            image: product.image,
            category: !hasCategory && product.category ? '__custom__' : product.category,
            sub_category: !hasSubCategory && product.sub_category ? '__custom__' : (product.sub_category || ''),
            stock: product.stock,
            badge: product.badge || '',
            dimensions: product.dimensions || '',
            weight: product.weight || '',
            images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : []
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            const res = await fetch(`${API_BASE}/api/products/${productToDelete.id}`, { method: 'DELETE', credentials: 'include' });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== productToDelete.id));
                setShowDeleteConfirm(false);
                setProductToDelete(null);
                setStatusMessage({
                    title: 'Deleted!',
                    text: 'The product has been successfully removed.',
                    type: 'success'
                });
                setShowStatusModal(true);
            }
        } catch (err) {
            console.error("Delete failed:", err);
            setStatusMessage({
                title: 'Delete Failed',
                text: 'There was an error removing the product.',
                type: 'error'
            });
            setShowStatusModal(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = modalMode === 'add'
            ? `${API_BASE}/api/products`
            : `${API_BASE}/api/products/${editingProduct.id}`;

        const method = modalMode === 'add' ? 'POST' : 'PUT';

        const finalCategory = isCustomCategory ? customCategory : form.category;
        const finalSubCategory = isCustomSubCategory ? customSubCategory : form.sub_category;

        setIsSubmitting(true);
        try {
            const res = await fetch(url, {
                credentials: 'include',
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    category: finalCategory,
                    sub_category: finalSubCategory,
                    images: JSON.stringify(form.images)
                })
            });

            if (res.ok) {
                await fetchProducts();
                setIsModalOpen(false);
                setStatusMessage({
                    title: modalMode === 'add' ? 'Product Added!' : 'Update Complete!',
                    text: `Your product specs have been successfully ${modalMode === 'add' ? 'saved' : 'updated'}.`,
                    type: 'success'
                });
                setShowStatusModal(true);
            } else {
                throw new Error("Action failed");
            }
        } catch (err) {
            console.error("Submit failed:", err);
            setStatusMessage({
                title: 'Process Error',
                text: 'The product specifications could not be saved at this time.',
                type: 'error'
            });
            setShowStatusModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <AdminLayout>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif">Product Inventory</h1>
                        <p className="text-slate-500 mt-1 font-medium text-sm">Manage your automotive collection and stock levels.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={downloadSampleTemplate}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            <IconDownload size={18} />
                            Template
                        </button>
                        <button
                            onClick={() => {
                                setHelperImageUrl("");
                                setCopiedHelper(false);
                                setShowImageHelper(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                        >
                            <IconPhoto size={18} />
                            Image Helper
                        </button>
                        <button
                            onClick={() => {
                                setBulkExcelFile(null);
                                setBulkImages([]);
                                setShowBulkModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                        >
                            <IconUpload size={18} />
                            Bulk
                        </button>
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                        >
                            <IconPlus size={18} />
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Single-Line Filter Bar */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-8">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Category Dropdown */}
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 shadow-sm">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Category</label>
                            <div className="relative">
                                <select
                                    value={catFilter}
                                    onChange={(e) => { setCatFilter(e.target.value); setSubCatFilter(""); }}
                                    className="bg-transparent text-xs font-bold focus:outline-none min-w-[140px] appearance-none pr-6 cursor-pointer"
                                >
                                    <option value="">All Categories</option>
                                    {Object.keys(categoriesMap).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <IconChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Sub-Category Dropdown */}
                        {catFilter && categoriesMap[catFilter] && categoriesMap[catFilter].length > 0 && (
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 shadow-sm animate-in fade-in slide-in-from-left-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Sub-Cat</label>
                                <div className="relative">
                                    <select
                                        value={subCatFilter}
                                        onChange={(e) => setSubCatFilter(e.target.value)}
                                        className="bg-transparent text-xs font-bold focus:outline-none min-w-[140px] appearance-none pr-6 cursor-pointer"
                                    >
                                        <option value="">All Sub-Cats</option>
                                        {categoriesMap[catFilter].map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                    <IconChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* Search Button */}
                        <button
                            onClick={handleFilterClick}
                            className="px-8 py-3 bg-amber-400 hover:bg-amber-500 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-amber-400/20 active:scale-[0.98] whitespace-nowrap"
                        >
                            Filter Catalog
                        </button>

                        {/* Excel Button */}
                        {hasFiltered && (catFilter || subCatFilter) && (
                            <button
                                onClick={downloadProductsExcel}
                                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98] whitespace-nowrap animate-in fade-in slide-in-from-left-2"
                            >
                                <IconDownload size={16} />
                                Excel Export
                            </button>
                        )}

                        <div className="flex-1" />

                        {/* Quick Search */}
                        <div className="relative w-full md:w-[250px]">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                                <IconSearch size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Quick name search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary/30 transition-all text-xs font-bold"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    {/* Table Toolbar */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                            Inventory Catalog
                        </p>
                        <p className="text-sm font-semibold text-slate-500">
                            Listing <span className="text-slate-900">{filteredProducts.length}</span> SKU Assets
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">Product Info</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Sub-Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : currentItems.map((product) => (
                                    <tr key={product.id} className="group hover:bg-brand-secondary/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                    <img src={`${getImageUrl(product.image)}?t=${Date.now()}`} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: PRD-{1000 + (product.id || 0)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600 font-medium">{product.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-400 font-bold">{product.sub_category || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{product.price}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{product.stock} pcs</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.status === 'Active' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                                    {product.status || 'Active'}
                                                </span>
                                                <span className={`text-[10px] font-bold px-3 ${product.stock > 10 ? "text-green-500" :
                                                    product.stock > 0 ? "text-amber-500" :
                                                        "text-red-500"
                                                    }`}>
                                                    {product.stock > 10 ? "Full Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-400">
                                                <button
                                                    onClick={() => handleToggleStatus(product)}
                                                    className={`p-2 rounded-lg transition-all ${product.status === 'Active' ? 'hover:text-emerald-600 hover:bg-emerald-50' : 'hover:text-brand-primary hover:bg-brand-primary/10'}`}
                                                    title={product.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {product.status === 'Active' ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(product)}
                                                    className="p-2 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all" title="Edit"
                                                >
                                                    <IconEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(product)}
                                                    className="p-2 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"
                                                >
                                                    <IconTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-between items-center px-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            Showing products {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-sm ${currentPage === 1
                                        ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                        : "bg-white border-slate-100 text-slate-600 hover:border-brand-primary/20 hover:text-brand-primary"
                                    }`}
                            >
                                <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                                    <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-2">
                                {(() => {
                                    const maxVisible = 5;
                                    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                    let end = Math.min(totalPages, start + maxVisible - 1);
                                    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

                                    return Array.from({ length: (end - start + 1) }, (_, i) => start + i).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === pageNum
                                                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                                    : "bg-white border border-slate-100 text-slate-600 hover:border-brand-primary/20 hover:text-brand-primary"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ));
                                })()}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-sm ${currentPage === totalPages
                                        ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                        : "bg-white border-slate-100 text-slate-600 hover:border-brand-primary/20 hover:text-brand-primary"
                                    }`}
                            >
                                <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </AdminLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Catalog New Product' : 'Edit Product Details'}
            >
                <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                        <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2 flex justify-between">
                            Required Product Identity
                            <span className={`text-[9px] font-bold tracking-normal ${(form.name?.length || 0) >= 55 ? 'text-rose-500' : 'text-slate-400'}`}>
                                {form.name?.length || 0} / 60
                            </span>
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={60}
                            value={form.name || ''}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-brand-primary outline-none transition-all text-base font-black placeholder:text-slate-300 shadow-sm"
                            placeholder="Enter the Performance Product Name..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (e.g. 45.00)</label>
                            <input
                                type="text"
                                required
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold shadow-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Level</label>
                            <input
                                type="number"
                                required
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold shadow-sm"
                            />
                        </div>
                    </div>

                    <ImageUpload
                        label="Product Main Image"
                        currentUrl={form.image}
                        onUpload={(url) => setForm({ ...form, image: url })}
                        showNotification={showNotification}
                    />

                    <GalleryUpload
                        label="Related Product Images"
                        images={form.images}
                        onImagesChange={(urls) => setForm({ ...form, images: urls })}
                        showNotification={showNotification}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                            <div className="relative">
                                <select
                                    value={form.category}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '__custom__') {
                                            setIsCustomCategory(true);
                                            setForm({ ...form, category: '__custom__', sub_category: '' });
                                        } else {
                                            setIsCustomCategory(false);
                                            setForm({ ...form, category: val, sub_category: '' });
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold appearance-none pr-10"
                                >
                                    {Object.keys(categoriesMap).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                    <option value="__custom__">+ Add Custom Category...</option>
                                </select>
                                <IconChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            {isCustomCategory && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                    <input
                                        type="text"
                                        required
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold shadow-sm animate-in fade-in duration-300"
                                        placeholder="Enter custom category name..."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sub-Category</label>
                            <div className="relative">
                                <select
                                    value={form.sub_category}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '__custom__') {
                                            setIsCustomSubCategory(true);
                                            setForm({ ...form, sub_category: '__custom__' });
                                        } else {
                                            setIsCustomSubCategory(false);
                                            setForm({ ...form, sub_category: val });
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold appearance-none pr-10"
                                >
                                    <option value="">Select a sub-category...</option>
                                    {categoriesMap[form.category]?.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                    <option value="__custom__">+ Add Custom Sub-Category...</option>
                                </select>
                                <IconChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            {isCustomSubCategory && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                    <input
                                        type="text"
                                        required
                                        value={customSubCategory}
                                        onChange={(e) => setCustomSubCategory(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold shadow-sm animate-in fade-in duration-300"
                                        placeholder="Enter custom sub-category name..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dimensions (e.g. 40x40x60 cm)</label>
                            <input
                                type="text"
                                value={form.dimensions}
                                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold shadow-sm"
                                placeholder="L x W x H"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weight (e.g. 1.5 kg)</label>
                            <input
                                type="text"
                                value={form.weight}
                                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold shadow-sm"
                                placeholder="Product weight"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                            Badge (Optional)
                            <span className={`text-[9px] font-bold tracking-normal ${(form.badge?.length || 0) >= 12 ? 'text-rose-500' : 'text-slate-400'}`}>
                                {form.badge?.length || 0} / 15
                            </span>
                        </label>
                        <input
                            type="text"
                            maxLength={15}
                            value={form.badge}
                            onChange={(e) => setForm({ ...form, badge: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                            placeholder="New, Sale, etc."
                        />
                    </div>

                    <RichTextEditor
                        label="Product Description"
                        value={form.description}
                        onChange={(val) => setForm({ ...form, description: val })}
                        maxLength={2000}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-brand-primary/20 mt-4 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {modalMode === 'add' ? 'Catalog Product' : 'Update Specifications'}
                    </button>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 bg-rose-100 text-rose-600">
                            <IconTrash size={40} stroke={2.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Are you sure?</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed text-sm font-medium">
                            You are about to delete <span className="text-rose-600 font-bold">"{productToDelete?.name}"</span>. This action cannot be undone.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${statusMessage.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {statusMessage.type === 'success' ? <IconCheck size={40} stroke={2.5} /> : <IconX size={40} stroke={2.5} />}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{statusMessage.title}</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed text-sm font-medium">{statusMessage.text}</p>
                        <button
                            onClick={() => setShowStatusModal(false)}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
            {/* Excel Image Helper Modal */}
            <Modal
                isOpen={showImageHelper}
                onClose={() => setShowImageHelper(false)}
                title="Excel Image Helper"
            >
                <div className="space-y-6 pt-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner text-center">
                        <p className="text-slate-600 leading-relaxed text-sm font-medium">
                            💡 <strong>Tip:</strong> Upload any product image from your device below. Our system will automatically <strong>compress</strong> it to under 50KB to keep the website lightning fast, and output a direct URL you can copy and paste into your Excel template!
                        </p>
                    </div>

                    <ImageUpload
                        label="Upload or Pick Image"
                        currentUrl={helperImageUrl}
                        onUpload={(url) => {
                            setHelperImageUrl(url);
                            setCopiedHelper(false);
                        }}
                        showNotification={showNotification}
                    />

                    {helperImageUrl && (
                        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50 space-y-3 animate-in fade-in duration-300">
                            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Generated Product Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={helperImageUrl}
                                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold select-all focus:outline-none"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(helperImageUrl);
                                        setCopiedHelper(true);
                                        showNotification("Image URL copied to clipboard!", "success");
                                        setTimeout(() => setCopiedHelper(false), 2000);
                                    }}
                                    className="px-5 py-3 bg-brand-primary text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-brand-primary/10"
                                >
                                    {copiedHelper ? <IconCheck size={14} /> : null}
                                    {copiedHelper ? "Copied!" : "Copy URL"}
                                </button>
                            </div>
                            <p className="text-[10px] font-semibold text-emerald-600 italic">✓ Image successfully compressed and hosted live!</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Custom Bulk Upload Modal */}
            <Modal
                isOpen={showBulkModal}
                onClose={() => {
                    if (!isBulkUploading) {
                        setShowBulkModal(false);
                    }
                }}
                title="Bulk Product Import"
            >
                <div className="space-y-6 pt-6">
                    {/* Excel/CSV File Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            1. Select Excel/CSV Template File <span className="text-red-500">*</span>
                        </label>
                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                            <input
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setBulkExcelFile(e.target.files[0]);
                                    }
                                }}
                                disabled={isBulkUploading}
                            />
                            <IconUpload className="mx-auto text-slate-400 group-hover:text-brand-primary mb-2" size={32} />
                            <p className="text-xs text-slate-500 font-semibold">
                                {bulkExcelFile ? bulkExcelFile.name : "Click or drag spreadsheet file here"}
                            </p>
                            {bulkExcelFile && (
                                <p className="text-[10px] text-slate-400 font-medium mt-1">
                                    {(bulkExcelFile.size / 1024).toFixed(1)} KB
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Image Files Input */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                2. Upload Product Images (Optional)
                            </label>
                            {bulkImages.length > 0 && (
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter bg-slate-100 px-2.5 py-1 rounded-md">
                                    {bulkImages.length} Files Selected
                                </span>
                            )}
                        </div>
                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setBulkImages(Array.from(e.target.files));
                                    }
                                }}
                                disabled={isBulkUploading}
                            />
                            <IconPhoto className="mx-auto text-slate-400 group-hover:text-brand-primary mb-2" size={32} />
                            <p className="text-xs text-slate-500 font-semibold text-center">
                                {bulkImages.length > 0 ? `${bulkImages.length} images selected` : "Select multiple product images from your computer"}
                            </p>
                            <p className="text-[9px] text-slate-400 font-medium mt-2 text-center max-w-[90%] leading-relaxed mx-auto">
                                Tip: Write filenames (e.g. <code>my-cover.jpg</code>) in the Image column of your spreadsheet, then select those files here. They will be auto-matched, compressed, and linked!
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setShowBulkModal(false)}
                            disabled={isBulkUploading}
                            className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCustomBulkUpload}
                            disabled={isBulkUploading || !bulkExcelFile}
                            className="flex-1 py-3.5 bg-brand-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm flex items-center justify-center gap-2"
                        >
                            {isBulkUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Importing...
                                </>
                            ) : (
                                "Start Import"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ProductManagement;



