import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye, 
  IconCircleCheck,
  IconCircleX,
  IconVideo,
  IconEyeOff
} from "@tabler/icons-react";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";
import { ImageUpload } from "../../components/admin/UploadComponents";

const VideoJourneyManagement = () => {
    const API_URL = `${API_BASE}/api/video-journey`;
    const [videos, setVideos] = useState([]);
    const [editingVideo, setEditingVideo] = useState(null);
    const { showNotification } = useNotification();
    const [sectionHeading, setSectionHeading] = useState("Watch Our Journey");
    const [isSavingHeading, setIsSavingHeading] = useState(false);
    const [videojourneySectionShow, setVideojourneySectionShow] = useState(true);

    // Modal state
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchVideos();
        fetchHeading();
    }, []);

    const fetchHeading = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/section-settings?section=videojourney`, { credentials: 'include' });
            const data = await res.json();
            if (data.videojourney_heading) {
                setSectionHeading(data.videojourney_heading);
            }
            if (data.videojourney_section_show !== undefined) {
                setVideojourneySectionShow(data.videojourney_section_show === 'true');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveHeading = async () => {
        setIsSavingHeading(true);
        try {
            await fetch(`${API_BASE}/api/section-settings/upsert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videojourney_heading: sectionHeading }),
                credentials: 'include'
            });
            showNotification("Section title updated!", "success");
        } catch (e) {
            showNotification("Failed to update title.", "error");
        } finally {
            setIsSavingHeading(false);
        }
    };

    const fetchVideos = async () => {
        try {
            const res = await fetch(`${API_URL}/admin`, { credentials: 'include' });
            const data = await res.json();
            if (Array.isArray(data)) {
                setVideos(data);
            } else {
                setVideos([]);
            }
        } catch (err) {
            console.error(err);
            setVideos([]);
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const method = editingVideo.id ? 'PUT' : 'POST';
            const url = editingVideo.id ? `${API_URL}/${editingVideo.id}` : API_URL;
            const res = await fetch(url, { credentials: 'include',
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingVideo)
            }); 
            
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Server error: ${res.status}`);
            }
            
            fetchVideos();
            setEditingVideo(null);
            showNotification(`Video ${editingVideo.id ? 'updated' : 'added'} successfully!`, "success");
        } catch (error) {
            console.error("Save error:", error);
            showNotification(`Error saving video: ${error.message}`, "error");
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/${deletingId}`, { method: 'DELETE', credentials: 'include' });
            fetchVideos();
            setIsPromptModalOpen(false);
            showNotification("Video deleted successfully.", "success");
        } catch (e) { 
            showNotification("Failed to delete.", "error");
        }
    };

    const handleToggleStatus = async (video) => {
        try {
            const newStatus = video.status === 'Active' ? 'Inactive' : 'Active';
            await fetch(`${API_URL}/${video.id}`, { credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchVideos();
        } catch (e) { console.error(e); }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">

                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Video Journey</h1>
                        <p className="text-slate-500 font-medium">Manage YouTube video links and thumbnails displayed on the homepage slider.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                            <input 
                                type="text" 
                                value={sectionHeading}
                                onChange={(e) => setSectionHeading(e.target.value)}
                                placeholder="Section Title"
                                className="px-3 py-1 bg-slate-50 border-none rounded-xl text-sm font-bold w-48 focus:ring-2 ring-brand-primary/20"
                            />
                            <button 
                                onClick={handleSaveHeading}
                                disabled={isSavingHeading}
                                className="px-4 py-1.5 bg-brand-secondary text-brand-primary font-bold text-xs rounded-xl hover:bg-brand-secondary/80 transition-all"
                            >
                                {isSavingHeading ? "..." : "Save Title"}
                            </button>
                        </div>
                        <button 
                            onClick={() => setEditingVideo({ title: '', youtubeLink: '', thumbnail: '', status: 'Active', position: 0 })}
                            className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <IconPlus size={18} />
                            Add Video
                        </button>
                    </div>
                </div>

                {/* Master Visibility Switch */}
                <div className="mb-10 max-w-xl">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${videojourneySectionShow ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                                {videojourneySectionShow ? <IconEye size={24} /> : <IconEyeOff size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Section Visibility</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Video Journey Switch</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="space-y-1">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest block">Section Status</span>
                                <p className="text-[11px] font-bold text-slate-400 italic">
                                    {videojourneySectionShow ? "Visible on Homepage" : "Hidden from Homepage"}
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const nextStatus = !videojourneySectionShow;
                                    setVideojourneySectionShow(nextStatus);
                                    try {
                                        await fetch(`${API_BASE}/api/section-settings/upsert`, {
                                            method: 'POST',
                                            credentials: 'include',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ videojourney_section_show: String(nextStatus) })
                                        });
                                        showNotification(`Video Journey Section is now ${nextStatus ? 'Visible' : 'Hidden'}`, "success");
                                    } catch (e) {
                                        showNotification("Failed to update visibility", "error");
                                    }
                                }}
                                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${videojourneySectionShow ? "bg-emerald-500" : "bg-slate-300"}`}
                            >
                                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${videojourneySectionShow ? "translate-x-6" : "translate-x-0"}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Videos List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thumbnail</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title & Link</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[130px]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[140px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {videos.map((v) => (
                                    <tr key={v.id} className="group hover:bg-brand-secondary/30 transition-all duration-300">
                                        <td className="px-8 py-5 w-[160px]">
                                            {v.thumbnail ? (
                                                <img src={v.thumbnail} alt={v.title} className="w-32 h-20 rounded-xl object-cover border border-slate-200" />
                                            ) : (
                                                <div className="w-32 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                                                    <IconVideo size={24} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-slate-800 tracking-tight mb-1">{v.title}</p>
                                            <a href={v.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-brand-primary hover:underline truncate block max-w-sm">
                                                {v.youtubeLink}
                                            </a>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${v.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                {v.status === "Active" ? <IconCircleCheck size={14} /> : <IconCircleX size={14} />}
                                                {v.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => handleToggleStatus(v)} className="text-slate-400 hover:text-blue-500 transition-colors" title="Toggle Status">
                                                    <IconEye size={18} />
                                                </button>
                                                <button onClick={() => setEditingVideo(v)} className="text-slate-400 hover:text-brand-primary transition-colors" title="Edit">
                                                    <IconEdit size={18} />
                                                </button>
                                                <button onClick={() => { setDeletingId(v.id); setIsPromptModalOpen(true); }} className="text-slate-400 hover:text-rose-500 transition-colors" title="Delete">
                                                    <IconTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {videos.length === 0 && (
                            <div className="py-24 text-center text-slate-400">
                                <IconVideo size={40} className="mx-auto mb-4 opacity-30" />
                                <p className="text-sm font-bold">No videos yet. Add your first one!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Modal */}
                <Modal 
                    isOpen={!!editingVideo} 
                    onClose={() => setEditingVideo(null)} 
                    title={editingVideo?.id ? 'Edit Video' : 'Add Video'}
                >
                    <form onSubmit={handleEditSave} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Video Title</label>
                            <input type="text" value={editingVideo?.title || ''} onChange={e => setEditingVideo({...editingVideo, title: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium" placeholder="e.g. Exclusive Vastu Tips" required />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">YouTube Link</label>
                            <input type="url" value={editingVideo?.youtubeLink || ''} onChange={e => setEditingVideo({...editingVideo, youtubeLink: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium" placeholder="e.g. https://www.youtube.com/watch?v=..." required />
                        </div>
                        <div>
                            <ImageUpload
                                label="Video Thumbnail"
                                currentUrl={editingVideo?.thumbnail}
                                showNotification={showNotification}
                                recSize="1:1 (Square) e.g. 600x600px"
                                onUpload={(url) => setEditingVideo({ ...editingVideo, thumbnail: url })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Position</label>
                                <input type="number" value={editingVideo?.position || 0} onChange={e => setEditingVideo({...editingVideo, position: parseInt(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Status</label>
                                <select value={editingVideo?.status || 'Active'} onChange={e => setEditingVideo({...editingVideo, status: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold text-slate-700">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-slate-50">
                            <button type="button" onClick={() => setEditingVideo(null)} className="flex-1 h-16 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-200 transition-colors">Cancel</button>
                            <button type="submit" className="flex-[2] h-16 bg-brand-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-violet-100 hover:scale-[1.02] active:scale-[0.98] transition-all">Save Video</button>
                        </div>
                    </form>
                </Modal>

                {/* Confirm Delete Modal */}
                <Modal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} title="Delete Video">
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                            <IconTrash size={40} />
                        </div>
                        <p className="text-slate-500 text-sm">Are you sure you want to remove this video? This action cannot be undone.</p>
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

export default VideoJourneyManagement;
