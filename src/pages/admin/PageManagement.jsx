import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import API_BASE from '../../config';
import CollectionModal from "../../components/admin/CollectionModal";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import {

  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconWorldWww,
  IconChevronLeft,
  IconChevronRight,
  IconAdjustmentsHorizontal,
  IconFileText,
  IconEye,
  IconEyeOff
} from "@tabler/icons-react";
import { useNotification } from "../../context/NotificationContext";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PageManagement = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const { showNotification } = useNotification();

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/collections`, { credentials: 'include' });
      const data = await res.json();
      setCollections(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching collections:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleSaveCollection = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/api/collections`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCollections();
      }
    } catch (err) {
      console.error("Error saving collection:", err);
      showNotification("Failed to save collection. Please check if the slug is unique.", "error");
    }
  };

  const handleToggleStatus = async (col) => {
    const updatedCol = { ...col, is_active: !col.is_active };
    try {
      const res = await fetch(`${API_BASE}/api/collections`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCol)
      });
      if (res.ok) {
        fetchCollections();
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleDeleteCollection = (id, title) => {
    setItemToDelete({ id, title });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/collections/${itemToDelete.id}`, {
        credentials: 'include',
        method: 'DELETE'
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        fetchCollections();
      }
    } catch (err) {
      console.error("Error deleting collection:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCollections = collections.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const currentItems = filteredCollections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">Dynamic Pages</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your shop's collection-based landing pages.</p>
        </div>
        <button
          onClick={() => { setSelectedCollection(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3.5 bg-slate-950 text-white rounded-2xl font-bold text-sm hover:bg-brand-primary transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
        >
          <IconPlus size={18} />
          Create New Page
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px] animate-fade-up">
        {/* Toolbar */}
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <IconSearch size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by page title or URL slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-transparent rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all text-sm font-medium shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 text-xs font-bold text-slate-500">
              <IconAdjustmentsHorizontal size={16} className="text-brand-primary" />
              Total: {filteredCollections.length} Pages
            </div>
          </div>
        </div>

        {/* Grid View (Table) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/20">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-24">ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Configuration</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Logic</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Style</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-32 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary mx-auto"></div>
                    <p className="text-slate-400 mt-4 font-bold text-sm tracking-widest uppercase">Loading Collections...</p>
                  </td>
                </tr>
              ) : currentItems.map((col) => (
                <tr key={col.id} className={cn(
                  "group hover:bg-brand-secondary/20 transition-all duration-300 transform-gpu",
                  !col.is_active && "opacity-50 grayscale-[0.5]"
                )}>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xs font-black text-slate-300 group-hover:text-brand-primary transition-colors">PG-{100 + col.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 ${col.bg_class === 'bg-brand-primary' ? 'bg-white text-brand-primary' : col.bg_class}`}>
                        <IconFileText size={20} className={col.title_class} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-800 tracking-tight">{col.title}</p>
                          <a href={`/${col.slug}`} target="_blank" rel="noreferrer" className="text-slate-200 hover:text-brand-primary transition-colors">
                            <IconExternalLink size={14} />
                          </a>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors tracking-wide">/{col.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                        {col.filter_field.replace('_', ' ')}
                      </span>
                      <p className="text-xs font-bold text-slate-600 ml-0.5">{col.filter_value}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-4 rounded-md shadow-sm border border-slate-100" style={{ background: col.bg_gradient }}></div>
                      <span className="text-[10px] font-bold text-slate-400 capitalize">{col.bg_class.replace('bg-', '').replace('-50', '')} Theme</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 transition-all duration-300">
                      <button
                        onClick={() => handleToggleStatus(col)}
                        className={cn(
                          "w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center transition-all",
                          col.is_active ? "text-emerald-500 hover:ring-emerald-200 group-hover:bg-emerald-50" : "text-slate-400 hover:ring-slate-300"
                        )}
                        title={col.is_active ? "Mark as Inactive" : "Mark as Active"}
                      >
                        {col.is_active ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => { setSelectedCollection(col); setIsModalOpen(true); }}
                        className="w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:ring-brand-primary/20 transition-all"
                      >
                        <IconEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(col.id, col.title)}
                        className="w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:ring-red-100 transition-all"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentItems.length === 0 && !loading && (
            <div className="py-32 text-center">
              <IconWorldWww size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No pages found matching your search</p>
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        <div className="p-8 mt-auto border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
            Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages || 1}</span>
          </p>

          <div className="flex gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm border border-slate-100"
            >
              <IconChevronLeft size={16} />
              Previous
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm border border-slate-100"
            >
              Next
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCollection}
        initialData={selectedCollection}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={itemToDelete?.title || ""}
        loading={isDeleting}
      />
    </AdminLayout>
  );
};

export default PageManagement;



