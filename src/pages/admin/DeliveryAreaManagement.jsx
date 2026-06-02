import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import { IconPlus, IconEdit, IconTrash, IconSearch, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";
import { cn } from "../../lib/utils";

const DeliveryAreaManagement = () => {
    const API_URL = `${API_BASE}/api/delivery-areas`;
    const [areas, setAreas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState("");
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
    const [currentArea, setCurrentArea] = useState({
        city: '',
        zip_codes: '',
        status: 'Active',
        position: 0,
        shipping_charge: 50.00
    });
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        try {
            const url = `${API_BASE}/api/delivery-areas/admin-all`;
            console.log("Fetching areas from:", url);
            const res = await fetch(url, { credentials: 'include' });
            const data = await res.json();
            console.log("Fetch result:", data);
            
            if (Array.isArray(data)) {
                setAreas(data);
            } else {
                console.error("Data is not an array:", data);
                setAreas([]);
            }
            setIsLoading(false);
        } catch (err) {
            console.error("Fetch error:", err);
            setIsLoading(false);
            showNotification("Failed to load delivery areas.", "error");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === "add") {
                await fetch(API_URL, {
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentArea)
                });
                showNotification("Delivery area added successfully!", "success");
            } else {
                await fetch(`${API_URL}/${currentArea.id}`, {
                    credentials: 'include',
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentArea)
                });
                showNotification("Delivery area updated successfully!", "success");
            }
            fetchAreas();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            showNotification("Failed to save delivery area.", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/${deletingId}`, {
                credentials: 'include',
                method: 'DELETE'
            });
            fetchAreas();
            setIsDeleteModalOpen(false);
            showNotification("Delivery area deleted successfully.", "success");
        } catch (error) {
            console.error(error);
            showNotification("Failed to delete area.", "error");
        }
    };

    const handleToggleStatus = async (area) => {
        try {
            const newStatus = area.status === 'Active' ? 'Inactive' : 'Active';
            await fetch(`${API_URL}/${area.id}`, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchAreas();
        } catch (e) {
            console.error(e);
            showNotification("Failed to toggle status.", "error");
        }
    };

    const openAddModal = () => {
        setCurrentArea({
            city: '',
            zip_codes: '',
            status: 'Active',
            position: 0,
            shipping_charge: 50.00
        });
        setModalMode("add");
        setIsModalOpen(true);
    };

    const openEditModal = (area) => {
        setCurrentArea(area);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const confirmDelete = (id) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const filteredAreas = areas.filter(a => 
        a.city.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.zip_codes.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
    const paginatedAreas = filteredAreas.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-screen">Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Delivery Regions</h1>
                        <p className="text-slate-500 font-medium">Manage cities and zip codes where you provide floral delivery services.</p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={openAddModal} className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <IconPlus size={18} />
                            Add Region
                        </button>
                    </div>
                </div>

                <div className="mb-6 relative">
                    <input 
                        type="text" 
                        placeholder="Search cities or zip codes..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all shadow-sm"
                    />
                    <IconSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">City Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zip Codes</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Shipping Fee</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedAreas.map((area) => (
                                    <tr key={area.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-800">{area.city}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1">
                                                {area.zip_codes.split(',').map(zip => (
                                                    <span key={zip} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                        {zip.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button 
                                                onClick={() => handleToggleStatus(area)}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border",
                                                    area.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100"
                                                )}
                                            >
                                                {area.status === "Active" ? <IconEye size={14} /> : <IconEyeOff size={14} />}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <p className="text-sm font-bold text-slate-800">₹{parseFloat(area.shipping_charge || 50).toFixed(2)}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(area)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-all">
                                                    <IconEdit size={16} />
                                                </button>
                                                <button onClick={() => confirmDelete(area.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all">
                                                    <IconTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedAreas.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-12 text-center text-slate-400 italic">No areas found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination UI */}
                    {totalPages > 1 && (
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-500 font-medium">
                                Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredAreas.length)}</span> of <span className="font-bold text-slate-900">{filteredAreas.length}</span> results
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                                >
                                    Previous
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "w-8 h-8 rounded-xl text-[10px] font-black transition-all",
                                            currentPage === i + 1 
                                                ? "bg-brand-primary text-white shadow-lg shadow-violet-100" 
                                                : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === "add" ? "Add New Region" : "Edit Region"}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City Name</label>
                                <input 
                                    type="text" 
                                    value={currentArea.city} 
                                    onChange={(e) => setCurrentArea({ ...currentArea, city: e.target.value })} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Zip Codes (comma separated)</label>
                                <textarea 
                                    value={currentArea.zip_codes} 
                                    onChange={(e) => setCurrentArea({ ...currentArea, zip_codes: e.target.value })} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium" 
                                    required 
                                    rows="3"
                                    placeholder="e.g. 37127, 37128, 37129"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Display Priority (0 is highest)</label>
                                <input 
                                    type="number" 
                                    value={currentArea.position} 
                                    onChange={(e) => setCurrentArea({ ...currentArea, position: parseInt(e.target.value) || 0 })} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipping Fee (₹)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={currentArea.shipping_charge} 
                                    onChange={(e) => setCurrentArea({ ...currentArea, shipping_charge: parseFloat(e.target.value) || 0 })} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium" 
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-violet-100 hover:bg-slate-900 transition-all">Save Region</button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                    <div className="space-y-6 py-4 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                            <IconTrash size={32} />
                        </div>
                        <p className="text-slate-600 font-medium">Are you sure you want to permanently delete this region?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-100 hover:bg-red-600 transition-all">Delete Region</button>
                        </div>
                    </div>
                </Modal>

            </div>
        </AdminLayout>
    );
};

export default DeliveryAreaManagement;
