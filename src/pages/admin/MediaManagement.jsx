import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import {
  IconUpload,
  IconCopy,
  IconTrash,
  IconCheck,
  IconX,
  IconPhoto,
  IconSearch,
  IconExternalLink,
  IconMinimize
} from "@tabler/icons-react";
import { getImageUrl } from "../../utils/imageHelper";

const MediaManagement = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ title: '', text: '', type: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  
  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const itemsPerPage = 50;

  const fetchMedia = async (page = 1) => {
    try {
      if (isFirstLoad) {
        setLoading(true);
      } else {
        setIsPageTransitioning(true);
      }
      const res = await fetch(`${API_BASE}/api/media?page=${page}&limit=${itemsPerPage}`, { credentials: 'include' });
      const data = await res.json();
      
      if (data.media) {
        setMedia(data.media);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
        setTotalSize(data.pagination.totalSizeMb);
        setCurrentPage(data.pagination.page);
      } else {
        setMedia(data); // Fallback for old format
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
      setIsPageTransitioning(false);
    }
  };

  useEffect(() => {
    fetchMedia(currentPage);
  }, [currentPage]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const oversized = files.some(file => file.size > 1 * 1024 * 1024);
    if (oversized) {
      setStatusMessage({
        title: 'Upload Rejected',
        text: 'One or more files exceed the 1MB limit. Please compress or choose smaller images.',
        type: 'error'
      });
      setShowStatusModal(true);
      e.target.value = ''; // Reset input
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await fetch(`${API_BASE}/api/media`, { credentials: 'include',
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        await fetchMedia(1);
        setStatusMessage({
          title: 'Upload Successful',
          text: `Images have been added to your media library. Compression complete: 
                 Original: ${data.images?.[0]?.originalSize || 'N/A'} KB 
                 Compressed: ${data.images?.[0]?.compressedSize || 'N/A'} KB`,
          type: 'success'
        });
        setShowStatusModal(true);
      } else {
        const data = await res.json();
        setStatusMessage({
          title: 'Upload Failed',
          text: data.error || data.message || 'There was an error during the batch upload.',
          type: 'error'
        });
        setShowStatusModal(true);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setStatusMessage({
        title: 'Upload Failed',
        text: 'There was an error during the batch upload.',
        type: 'error'
      });
      setShowStatusModal(true);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setStatusMessage({
      title: 'Link Copied!',
      text: 'Image URL has been copied to your clipboard. You can now use it in your bulk upload file.',
      type: 'success'
    });
    setShowStatusModal(true);
  };

  const handleDeleteRequest = (item) => {
    setAssetToDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete && selectedIds.length === 0) return;

    try {
      if (assetToDelete) {
        // Single delete
        const res = await fetch(`${API_BASE}/api/media/${assetToDelete.id}`, { method: 'DELETE' , credentials: 'include' });
        if (res.ok) {
          setMedia(media.filter(m => m.id !== assetToDelete.id));
          setSelectedIds(prev => prev.filter(id => id !== assetToDelete.id));
          setShowDeleteConfirm(false);
          setAssetToDelete(null);
          setStatusMessage({
            title: 'Asset Deleted',
            text: 'The image has been permanently removed from your library.',
            type: 'success'
          });
          setShowStatusModal(true);
        } else {
          throw new Error('Single delete failed');
        }
      } else {
        // Bulk delete (Parallel single requests to avoid server restart requirements)
        setIsBulkDeleting(true);
        
        const deletePromises = selectedIds.map(id => 
          fetch(`${API_BASE}/api/media/${id}`, { method: 'DELETE', credentials: 'include' })
        );

        const results = await Promise.all(deletePromises);
        const successfulDeletes = results.filter(res => res.ok).length;

        if (successfulDeletes > 0) {
          setMedia(media.filter(m => !selectedIds.includes(m.id)));
          const count = selectedIds.length;
          setSelectedIds([]);
          setShowDeleteConfirm(false);
          setStatusMessage({
            title: 'Bulk Deletion Complete',
            text: `Successfully removed ${successfulDeletes} of ${count} images.`,
            type: 'success'
          });
          setShowStatusModal(true);
        } else {
          throw new Error('Bulk delete failed');
        }
      }
    } catch (err) {
      console.error("Delete operation failed:", err);
      setStatusMessage({
        title: 'Operation Failed',
        text: 'There was an error processing the deletion. Please try again.',
        type: 'error'
      });
      setShowStatusModal(true);
      setShowDeleteConfirm(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMedia.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMedia.map(m => m.id));
    }
  };

  const handleBulkDeleteRequest = () => {
    if (selectedIds.length === 0) return;
    setAssetToDelete(null); // Clear single asset to indicate bulk mode
    setShowDeleteConfirm(true);
  };

  const handleBulkCompress = async () => {
    if (selectedIds.length === 0) return;
    
    setIsCompressing(true);
    try {
      const res = await fetch(`${API_BASE}/api/media/bulk-compress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
        credentials: 'include'
      });

      if (res.ok) {
        await fetchMedia(currentPage);
        setStatusMessage({
          title: 'Compression Complete',
          text: `Successfully reduced the size of ${selectedIds.length} images to the 50KB target.`,
          type: 'success'
        });
        setShowStatusModal(true);
        setSelectedIds([]);
      } else {
        throw new Error('Compression failed');
      }
    } catch (err) {
      console.error("Compression failed:", err);
      setStatusMessage({
        title: 'Compression Failed',
        text: 'There was an error during the bulk compression process.',
        type: 'error'
      });
      setShowStatusModal(true);
    } finally {
      setIsCompressing(false);
    }
  };

  const filteredMedia = media.filter(m =>
    m.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic - Now server-side, but keep filtered list for UI
  const paginatedMedia = filteredMedia; 

  // Reset to page 1 when searching
  useEffect(() => {
    if (searchQuery) {
        setCurrentPage(1);
    }
  }, [searchQuery]);

  return (
    <>
      <AdminLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Media Library</h1>
            <p className="text-slate-500 mt-1">Host and manage images for your products and banners.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              id="media-upload-input"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleUpload}
            />
            <button
              onClick={() => document.getElementById('media-upload-input').click()}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-violet-800 transition-all shadow-lg shadow-violet-200 disabled:opacity-50"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <IconUpload size={18} />
              )}
              {uploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        </div>

        {/* Search and Bulk Actions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <IconSearch size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white focus:border-brand-primary/30 transition-all text-sm"
              />
            </div>
            
            {filteredMedia.length > 0 && (
              <button 
                onClick={handleSelectAll}
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors whitespace-nowrap"
              >
                {selectedIds.length === filteredMedia.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm font-bold">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                <button
                  onClick={handleBulkCompress}
                  disabled={isCompressing}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all disabled:opacity-50"
                  title="Reduce image size to 50KB"
                >
                  {isCompressing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  ) : (
                    <IconMinimize size={16} />
                  )}
                  <span>{isCompressing ? 'Compressing...' : `Compress ${selectedIds.length} Images`}</span>
                </button>

                <button
                  onClick={handleBulkDeleteRequest}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                >
                  <IconTrash size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="text-slate-400">
                Total Images: <span className="text-slate-900">{totalItems}</span>
              </div>
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                Total Storage: <span className="text-brand-primary">{totalSize} MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4"></div>
            <p className="text-slate-500 font-medium">Loading your library...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <IconPhoto size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No images found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Upload your first image to start building your media library.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Smooth transition overlay to keep page interactive but clearly loading */}
            {isPageTransitioning && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-3xl animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3 bg-white/90 px-8 py-6 rounded-[2rem] shadow-xl border border-slate-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Retrieving images...</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {paginatedMedia.map((item) => (
                <div 
                  key={item.id} 
                  className={`group bg-white rounded-3xl border transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                    selectedIds.includes(item.id) ? 'border-brand-primary ring-2 ring-brand-primary/10' : 'border-slate-100'
                  }`}
                >
                  <div className="aspect-square relative overflow-hidden bg-slate-50">
                    <img
                      src={getImageUrl(item.url)}
                      alt={item.filename}
                      className={`w-full h-full object-cover transition-transform duration-500 ${selectedIds.includes(item.id) ? 'scale-105 opacity-80' : 'group-hover:scale-110'}`}
                    />
                    
                    {/* Selection Checkbox */}
                    <div className={`absolute top-3 left-3 z-10 transition-all duration-300 ${selectedIds.includes(item.id) ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleSelect(item.id); }}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                          selectedIds.includes(item.id) 
                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/30' 
                            : 'bg-white/80 backdrop-blur-md border-white text-transparent hover:border-brand-primary'
                        }`}
                      >
                        <IconCheck size={14} stroke={3} />
                      </button>
                    </div>

                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => window.open(getImageUrl(item.url), '_blank')}
                        className="p-2 bg-white text-slate-900 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-lg"
                        title="View Full Image"
                      >
                        <IconExternalLink size={18} />
                      </button>
                      <button
                        onClick={() => copyToClipboard(getImageUrl(item.url))}
                        className="p-2 bg-white text-slate-900 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-lg"
                        title="Copy Link"
                      >
                        <IconCopy size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(item)}
                        className="p-2 bg-white text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-lg"
                        title="Delete"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold text-slate-800 truncate mb-1" title={item.filename}>
                      {item.filename}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(item.created_at || item.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] font-black text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-lg">
                        {item.file_size || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-slate-900">{totalItems}</span> Images
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-100 text-slate-500 font-bold text-xs hover:bg-brand-secondary hover:text-brand-primary disabled:opacity-30 disabled:hover:bg-transparent transition-all group"
                  >
                    <IconCopy size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    <span>PREVIOUS</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Only show current, first, last, and pages around current
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${currentPage === pageNum
                              ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                              : "text-slate-400 hover:bg-slate-50"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return <span key={pageNum} className="px-2 text-slate-300 font-black">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-100 text-slate-500 font-bold text-xs hover:bg-brand-secondary hover:text-brand-primary disabled:opacity-30 disabled:hover:bg-transparent transition-all group"
                  >
                    <span>NEXT</span>
                    <IconCopy size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminLayout>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <IconTrash size={32} />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3 font-serif">
              {assetToDelete ? 'Delete this asset?' : `Delete ${selectedIds.length} assets?`}
            </h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              {assetToDelete ? (
                <>Are you sure you want to remove <span className="font-bold text-slate-700">"{assetToDelete?.filename}"</span>? This action cannot be undone and will break any product links using this URL.</>
              ) : (
                <>Are you sure you want to permanently remove <span className="font-bold text-slate-700">{selectedIds.length} images</span> from your library? This action cannot be undone and will break any product links using these URLs.</>
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isBulkDeleting}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50"
              >
                {isBulkDeleting ? 'Deleting...' : (assetToDelete ? 'Delete Asset' : 'Delete All Selected')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaManagement;



