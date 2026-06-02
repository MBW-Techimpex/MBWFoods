import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import { createPortal } from "react-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
    IconPlus,
    IconSearch,
    IconFilter,
    IconEdit,
    IconTrash,
    IconTicket,
    IconX,
    IconCheck,
    IconChevronDown,
    IconCalendar,
    IconTag,
    IconUsers,
    IconInfoCircle,
    IconChevronLeft,
    IconChevronRight,
    IconHistory,
    IconListDetails,
    IconCopy,
    IconEye
} from "@tabler/icons-react";

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-10 pointer-events-none">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md pointer-events-auto" onClick={onClose}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-bloom-in pointer-events-auto max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">{title}</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all hover:scale-110 active:scale-95">
                        <IconX size={20} />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto no-scrollbar flex-1">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

const DiscountManagement = () => {
    const [discounts, setDiscounts] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ title: '', text: '', type: 'success' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState(null);
    const [showUsageModal, setShowUsageModal] = useState(false);
    const [usageDetails, setUsageDetails] = useState([]);
    const [loadingUsage, setLoadingUsage] = useState(false);
    const [selectedDiscountForUsage, setSelectedDiscountForUsage] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);

    const [form, setForm] = useState({
        code: '',
        type: 'amount_off_order',
        value: '',
        value_type: 'percentage',
        min_requirement_type: 'none',
        min_requirement_value: 0,
        usage_limit: '',
        usage_limit_per_customer: false,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'active',
        applies_to: 'all',
        specific_product_ids: [],
        specific_category_ids: []
    });

    const fetchDiscounts = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/discounts`, { credentials: 'include' });
            const data = await res.json();
            setDiscounts(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching discounts:", err);
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/categories`, { credentials: 'include' });
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    useEffect(() => {
        fetchDiscounts();
        fetchProducts();
        fetchCategories();
    }, []);

    const handleAddClick = () => {
        setModalMode('add');
        setEditingDiscount(null);
        setForm({
            code: '',
            type: 'amount_off_order',
            value: '',
            value_type: 'percentage',
            min_requirement_type: 'none',
            min_requirement_value: 0,
            usage_limit: '',
            usage_limit_per_customer: false,
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            status: 'active',
            applies_to: 'all',
            specific_product_ids: [],
            specific_category_ids: []
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (discount) => {
        setModalMode('edit');
        setEditingDiscount(discount);
        setForm({
            ...discount,
            start_date: discount.start_date ? new Date(discount.start_date).toISOString().split('T')[0] : '',
            end_date: discount.end_date ? new Date(discount.end_date).toISOString().split('T')[0] : '',
            specific_product_ids: discount.specific_product_ids || [],
            specific_category_ids: discount.specific_category_ids || []
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (discount) => {
        setDiscountToDelete(discount);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/discounts/${discountToDelete.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setDiscounts(discounts.filter(d => d.id !== discountToDelete.id));
                setShowDeleteConfirm(false);
                setStatusMessage({ title: 'Deleted!', text: 'Discount code removed.', type: 'success' });
                setShowStatusModal(true);
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = modalMode === 'add' ? `${API_BASE}/api/discounts` : `${API_BASE}/api/discounts/${editingDiscount.id}`;
        const method = modalMode === 'add' ? 'POST' : 'PUT';

        // Clean up data
        const payload = {
            ...form,
            value: form.type === 'free_shipping' ? 0 : (form.value === '' ? null : parseFloat(form.value)),
            usage_limit: form.usage_limit === '' ? null : parseInt(form.usage_limit),
            min_requirement_value: form.min_requirement_value === '' ? 0 : parseFloat(form.min_requirement_value),
            end_date: form.end_date === '' ? null : form.end_date
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            const data = await res.json();

            if (res.ok) {
                fetchDiscounts();
                setIsModalOpen(false);
                setStatusMessage({
                    title: modalMode === 'add' ? 'Discount Created!' : 'Discount Updated!',
                    text: 'Your changes have been saved successfully.',
                    type: 'success'
                });
                setShowStatusModal(true);
            } else {
                setStatusMessage({
                    title: 'Error!',
                    text: data.message || 'The promotion details could not be saved at this time.',
                    type: 'error'
                });
                setShowStatusModal(true);
            }
        } catch (err) {
            console.error("Submit failed:", err);
            setStatusMessage({
                title: 'Network Error!',
                text: 'Could not connect to the server. Please check your connection.',
                type: 'error'
            });
            setShowStatusModal(true);
        }
    };

    const handleViewUsage = async (discount) => {
        setSelectedDiscountForUsage(discount);
        setLoadingUsage(true);
        setShowUsageModal(true);
        try {
            const res = await fetch(`${API_BASE}/api/discounts/${discount.id}/usage`, { credentials: 'include' });
            const data = await res.json();
            setUsageDetails(data);
        } catch (err) {
            console.error("Error fetching usage details:", err);
        } finally {
            setLoadingUsage(false);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setForm({ ...form, code });
    };

    const filteredDiscounts = discounts.filter(d =>
        d.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate Stats
    const totalUsage = discounts.reduce((acc, d) => acc + (d.used_count || 0), 0);
    const activeDiscounts = discounts.filter(d => d.status === 'active').length;
    const topPerformer = [...discounts].sort((a, b) => (b.used_count || 0) - (a.used_count || 0))[0];

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 font-sans">Discounts</h1>
                    <p className="text-slate-500 mt-1">Manage coupon codes and promotional offers.</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-violet-800 transition-all shadow-lg shadow-violet-200"
                >
                    <IconPlus size={18} />
                    Create Discount
                </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-violet-50 text-brand-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <IconTag size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Redemptions</p>
                        <h3 className="text-2xl font-bold text-slate-900 font-sans">{totalUsage} <span className="text-xs font-bold text-emerald-500 font-sans ml-1">uses</span></h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <IconTicket size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Coupons</p>
                        <h3 className="text-2xl font-bold text-slate-900 font-sans">{activeDiscounts} <span className="text-xs font-bold text-slate-400 font-sans ml-1">Live</span></h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <IconUsers size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Top Performer</p>
                        <h3 className="text-xl font-bold text-slate-900 font-sans truncate max-w-[150px]">
                            {topPerformer && topPerformer.used_count > 0 ? topPerformer.code : 'None yet'}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                            <IconSearch size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white focus:border-brand-primary/30 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Usage</th>
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
                            ) : filteredDiscounts.map((discount) => (
                                <tr key={discount.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-brand-primary flex items-center justify-center shrink-0">
                                                <IconTicket size={20} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-800">{discount.code}</span>
                                                <button
                                                    onClick={() => handleCopyCode(discount.code)}
                                                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-brand-primary transition-colors border border-transparent hover:border-slate-200"
                                                    title="Copy Code"
                                                >
                                                    {copiedCode === discount.code ? (
                                                        <IconCheck size={14} className="text-emerald-500" />
                                                    ) : (
                                                        <IconCopy size={14} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                        {discount.type === 'amount_off_products' ? 'Product Discount' :
                                            discount.type === 'amount_off_order' ? 'Order Discount' :
                                                discount.type.replace(/_/g, ' ')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                                            {discount.type === 'free_shipping' ? 'FREE' : (discount.value_type === 'percentage' ? `${parseFloat(discount.value || 0)}%` : `$${parseFloat(discount.value || 0).toFixed(2)}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700">{discount.used_count} uses</span>
                                            {discount.usage_limit && (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Limit: {discount.usage_limit}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${discount.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                            {discount.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-400">
                                            <button onClick={() => handleViewUsage(discount)} className="p-2 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all" title="View Usage">
                                                <IconEye size={18} />
                                            </button>
                                            <button onClick={() => handleEditClick(discount)} className="p-2 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all">
                                                <IconEdit size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteClick(discount)} className="p-2 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Create New Discount' : 'Edit Discount'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-bold uppercase"
                                    placeholder="e.g. SUMMER2026"
                                />
                                <button
                                    type="button"
                                    onClick={generateCode}
                                    className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Type</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                                >
                                    <option value="amount_off_products">Product Discount</option>
                                    <option value="amount_off_order">Order Discount</option>
                                    <option value="buy_x_get_y" disabled>Buy X get Y (Soon)</option>
                                    <option value="free_shipping">Free shipping</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Value Type</label>
                                <select
                                    value={form.value_type}
                                    onChange={(e) => setForm({ ...form, value_type: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed_amount">Fixed Amount ($)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Value</label>
                                <input
                                    type="number"
                                    required={form.type !== 'free_shipping'}
                                    disabled={form.type === 'free_shipping'}
                                    value={form.value}
                                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 font-sans">
                                <IconFilter size={14} /> Requirements & Scope
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Minimum Requirement</label>
                                    <select
                                        value={form.min_requirement_type}
                                        onChange={(e) => setForm({ ...form, min_requirement_type: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                                    >
                                        <option value="none">None</option>
                                        <option value="min_purchase_amount">Min Purchase Amount ($)</option>
                                        <option value="min_quantity_items">Min Quantity of Items</option>
                                    </select>
                                </div>
                                {form.min_requirement_type !== 'none' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Requirement Value</label>
                                        <input
                                            type="number"
                                            value={form.min_requirement_value}
                                            onChange={(e) => setForm({ ...form, min_requirement_value: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Applies To</label>
                                <select
                                    value={form.applies_to}
                                    onChange={(e) => setForm({ ...form, applies_to: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                                >
                                    <option value="all">All Products</option>
                                    <option value="specific_products">Specific Products</option>
                                    <option value="specific_categories">Specific Categories</option>
                                </select>
                            </div>

                            {form.applies_to === 'specific_products' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Select Products</label>
                                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-2">
                                        {products.map(p => (
                                            <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.specific_product_ids.includes(p.id)}
                                                    onChange={(e) => {
                                                        const ids = e.target.checked
                                                            ? [...form.specific_product_ids, p.id]
                                                            : form.specific_product_ids.filter(id => id !== p.id);
                                                        setForm({ ...form, specific_product_ids: ids });
                                                    }}
                                                    className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                                                />
                                                <span className="text-sm font-medium text-slate-700">{p.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {form.applies_to === 'specific_categories' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Select Categories</label>
                                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-2">
                                        {categories.map(c => (
                                            <label key={c.id} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.specific_category_ids.includes(c.name)}
                                                    onChange={(e) => {
                                                        const names = e.target.checked
                                                            ? [...form.specific_category_ids, c.name]
                                                            : form.specific_category_ids.filter(name => name !== c.name);
                                                        setForm({ ...form, specific_category_ids: names });
                                                    }}
                                                    className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                                                />
                                                <span className="text-sm font-medium text-slate-700">{c.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 font-sans">
                                <IconUsers size={14} /> Usage Limits
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Total Usage Limit</label>
                                    <input
                                        type="number"
                                        value={form.usage_limit}
                                        onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                                        placeholder="Unlimited"
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <input
                                        type="checkbox"
                                        id="limit_per_customer"
                                        checked={form.usage_limit_per_customer}
                                        onChange={(e) => setForm({ ...form, usage_limit_per_customer: e.target.checked })}
                                        className="w-5 h-5 rounded-lg text-brand-primary border-slate-200 focus:ring-brand-primary"
                                    />
                                    <label htmlFor="limit_per_customer" className="text-sm font-bold text-slate-700 cursor-pointer font-sans">
                                        Limit to one use per customer
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={form.start_date}
                                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">End Date (Optional)</label>
                                <input
                                    type="date"
                                    value={form.end_date}
                                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-violet-800 transition-all shadow-xl shadow-violet-200 font-sans"
                    >
                        {modalMode === 'add' ? 'Create Discount Code' : 'Save Changes'}
                    </button>
                </form>
            </Modal>

            {/* Status & Confirmation Modals (Reused from ProductManagement) */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 bg-rose-100 text-rose-600">
                            <IconTrash size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Discount?</h3>
                        <p className="text-slate-600 mb-8 text-sm font-medium">Are you sure you want to remove <span className="text-rose-600 font-bold">"{discountToDelete?.code}"</span>?</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
                            <button onClick={confirmDelete} className="py-4 bg-rose-600 text-white rounded-2xl font-bold">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {showStatusModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${statusMessage.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {statusMessage.type === 'success' ? <IconCheck size={40} stroke={2.5} /> : <IconInfoCircle size={40} stroke={2.5} />}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{statusMessage.title}</h3>
                        <p className="text-slate-600 mb-8 text-sm font-medium">{statusMessage.text}</p>
                        <button onClick={() => setShowStatusModal(false)} className={`w-full py-4 rounded-2xl font-bold text-white ${statusMessage.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'}`}>Continue</button>
                    </div>
                </div>
            )}

            <Modal
                isOpen={showUsageModal}
                onClose={() => setShowUsageModal(false)}
                title={`Usage Details: ${selectedDiscountForUsage?.code}`}
            >
                {loadingUsage ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                        <p className="mt-4 text-slate-500 font-medium">Fetching history...</p>
                    </div>
                ) : usageDetails.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <IconHistory size={32} />
                        </div>
                        <p className="text-slate-500 font-bold">No usage history found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Usage Summary Header */}
                        <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-3xl p-6 flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center">
                                    <IconUsers size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-0.5">Total Reach</p>
                                    <h4 className="text-xl font-bold text-slate-900 font-sans">Used by {usageDetails.length} {usageDetails.length === 1 ? 'Person' : 'People'}</h4>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Performance</p>
                                <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                    {selectedDiscountForUsage?.used_count} Orders
                                </span>
                            </div>
                        </div>

                        {usageDetails.map((usage) => (
                            <div key={usage.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-black text-slate-900">{usage.Order?.customer_name || 'Guest'}</span>
                                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Order #{usage.Order?.id.slice(0, 8)}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                            {usage.customer_email}
                                            {usage.Order?.customer_phone && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>{usage.Order.customer_phone}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs font-bold text-slate-400 uppercase">{new Date(usage.created_at || usage.createdAt).toLocaleDateString()}</span>
                                        <span className="block text-xs font-medium text-slate-500">{new Date(usage.created_at || usage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <IconTag size={12} /> Products in Order
                                    </h5>
                                    <div className="space-y-3">
                                        {usage.Order?.items?.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 overflow-hidden">
                                                        <img
                                                            src={item.image?.startsWith('http') ? item.image : `${API_BASE}${item.image}`}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-slate-900">${item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-200/50">
                                    <span className="text-xs font-bold text-slate-500">Total Amount</span>
                                    <span className="text-sm font-black text-brand-primary">${usage.Order?.total_amount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
};

export default DiscountManagement;
