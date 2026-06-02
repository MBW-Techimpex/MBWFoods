import React, { useState, useEffect } from "react";
import API_BASE from "../../config";
import { createPortal } from "react-dom";
import {
    IconPhoto,
    IconSearch,
    IconX,
    IconCheck,
    IconChevronLeft,
    IconChevronRight,
    IconLoader2
} from "@tabler/icons-react";
import { getImageUrl } from "../../utils/imageHelper";

const MediaPicker = ({ isOpen, onClose, onSelect, selectedUrls = [] }) => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;

    const fetchMedia = async (page = 1) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/media?page=${page}&limit=${itemsPerPage}`, { credentials: 'include' });
            const data = await res.json();
            
            if (data.media) {
                setMedia(data.media);
                setTotalPages(data.pagination.totalPages);
                setCurrentPage(data.pagination.page);
            } else {
                setMedia(data);
            }
        } catch (err) {
            console.error("Error fetching media:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMedia(currentPage);
        }
    }, [isOpen, currentPage]);

    const filteredMedia = media.filter(m =>
        m.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    const modalUI = (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10 pointer-events-none">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md pointer-events-auto" onClick={onClose}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-bloom-in pointer-events-auto h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight font-serif">Media Library</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Select an image to use</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search images..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 w-48 md:w-64"
                            />
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all hover:scale-110 active:scale-95">
                            <IconX size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20">
                            <IconLoader2 className="animate-spin text-brand-primary mb-4" size={40} />
                            <p className="text-slate-500 font-medium">Loading library...</p>
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                <IconPhoto size={32} />
                            </div>
                            <h4 className="font-bold text-slate-900">No images found</h4>
                            <p className="text-xs text-slate-400 mt-1">Try a different search or upload new images.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredMedia.map((item) => {
                                const isSelected = selectedUrls.includes(item.url);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => onSelect(item.url)}
                                        className={`group relative aspect-square rounded-2xl overflow-hidden border transition-all shadow-sm hover:shadow-md cursor-pointer 
                                            ${isSelected ? 'ring-4 ring-brand-primary border-brand-primary' : 'border-slate-100 hover:ring-4 hover:ring-brand-primary/20'}
                                        `}
                                    >
                                        <img
                                            src={getImageUrl(item.url)}
                                            loading="lazy"
                                            alt={item.filename}
                                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isSelected ? 'opacity-80' : ''}`}
                                        />
                                        <div className={`absolute inset-0 bg-slate-900/20 transition-opacity flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <div className={`bg-white text-brand-primary p-2 rounded-full shadow-lg transition-transform ${isSelected ? 'scale-100' : 'scale-50 group-hover:scale-100'}`}>
                                                <IconCheck size={20} stroke={3} />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-[9px] text-white font-bold truncate">{item.filename}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer / Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-50 flex items-center justify-center gap-4 bg-slate-50/30">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all"
                        >
                            <IconChevronLeft size={18} />
                        </button>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Page <span className="text-slate-900">{currentPage}</span> of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all"
                        >
                            <IconChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalUI, document.body);
};

export default MediaPicker;
