import React, { useState } from "react";
import API_BASE from "../../config";
import { IconUpload, IconPlus, IconX, IconPhoto as IconMedia } from "@tabler/icons-react";
import { getImageUrl } from "../../utils/imageHelper";
import MediaPicker from "./MediaPicker";

export const ImageUpload = ({ onUpload, currentUrl, label, showNotification, recSize = "600x600px", className = "" }) => {
    const [uploading, setUploading] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleFile = async (file) => {
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) {
            showNotification('File is too large (max 1MB).', 'warning');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                credentials: 'include',
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.imageUrl) {
                onUpload(data.imageUrl);
            } else {
                showNotification(data.error || data.message || 'Upload failed.', 'error');
            }
        } catch (err) {
            console.error('Upload failed:', err);
            showNotification('Upload failed. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setIsPickerOpen(true)}
                        className="text-[9px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1.5 hover:bg-brand-primary hover:text-white transition-all bg-brand-primary/5 px-2.5 py-1.5 rounded-lg border border-brand-primary/10"
                    >
                        <IconMedia size={12} stroke={3} />
                        Library
                    </button>
                    {recSize && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter opacity-60">REC: {recSize}</span>}
                </div>
            </div>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    accept="image/*"
                />
                {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                ) : currentUrl ? (
                    <img src={`${getImageUrl(currentUrl)}?t=${Date.now()}`} alt="Preview" className="h-24 w-24 object-cover rounded-xl shadow-sm" />
                ) : (
                    <div className="text-center py-2">
                        <IconUpload className="mx-auto text-slate-400 group-hover:text-brand-primary" size={24} />
                        <p className="text-xs text-slate-400 mt-1">Click to upload image</p>
                    </div>
                )}
            </div>

            <MediaPicker
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                selectedUrls={[currentUrl]}
                onSelect={(url) => {
                    onUpload(url);
                    setIsPickerOpen(false);
                }}
            />
        </div>
    );
};

export const GalleryUpload = ({ images = [], onImagesChange, label, showNotification, maxImages = 4 }) => {
    const [uploading, setUploading] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleFile = async (file) => {
        if (!file) return;

        if (images.length >= maxImages) {
            showNotification(`Maximum ${maxImages} images allowed.`, 'warning');
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            showNotification('File is too large (max 1MB).', 'warning');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                credentials: 'include',
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.imageUrl) {
                onImagesChange([...images, data.imageUrl]);
            } else {
                showNotification(data.error || data.message || 'Upload failed.', 'error');
            }
        } catch (err) {
            console.error('Upload failed:', err);
            showNotification('Upload failed. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onImagesChange(newImages);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setIsPickerOpen(true)}
                        className="text-[9px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1.5 hover:bg-brand-primary hover:text-white transition-all bg-brand-primary/5 px-2.5 py-1.5 rounded-lg border border-brand-primary/10"
                    >
                        <IconMedia size={12} stroke={3} />
                        Library
                    </button>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-60 bg-slate-100 px-2 py-1 rounded-md">
                        {images.length} / {maxImages} Slots
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {images.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md">
                        <img src={`${getImageUrl(url)}?t=${Date.now()}`} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                        <button 
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-white shadow-lg p-1 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                        >
                            <IconX size={12} />
                        </button>
                    </div>
                ))}
                
                {images.length < maxImages && (
                    <div className="relative aspect-square border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                            accept="image/*"
                        />
                        {uploading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary"></div>
                        ) : (
                            <div className="text-center">
                                <IconPlus className="mx-auto text-slate-400 group-hover:text-brand-primary transition-colors" size={20} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <MediaPicker
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                selectedUrls={images}
                onSelect={(url) => {
                    if (images.length < maxImages) {
                        onImagesChange([...images, url]);
                    } else {
                        showNotification(`Maximum ${maxImages} images allowed.`, 'warning');
                    }
                    setIsPickerOpen(false);
                }}
            />
        </div>
    );
};
