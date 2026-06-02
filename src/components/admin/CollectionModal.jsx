import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import { createPortal } from "react-dom";
import {

  IconX,
  IconDeviceFloppy,
  IconPalette,
  IconFileText,
  IconLink,
  IconFilter,
  IconEye,
  IconEyeOff
} from "@tabler/icons-react";

const CollectionModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: "",
    accent_title: "",
    slug: "",
    description: "",
    bg_gradient: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    bg_class: "bg-slate-50",
    title_class: "text-slate-900",
    filter_field: "category",
    filter_value: "",
    is_active: true
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        is_active: initialData.is_active ?? true
      });
    } else {
      setFormData({
        title: "",
        accent_title: "",
        slug: "",
        description: "",
        bg_gradient: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        bg_class: "bg-slate-50",
        title_class: "text-slate-900",
        filter_field: "category",
        filter_value: "",
        is_active: true
      });
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const uniqueCats = new Set();
        const uniqueSubCats = new Set();

        // 1. Fetch categories/subcategories from existing products
        const res = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            data.forEach(p => {
              if (p.category) uniqueCats.add(p.category);
              if (p.sub_category) uniqueSubCats.add(p.sub_category);
            });
          }
        }

        // 2. Fetch categories/subcategories from menus/submenus
        const menuRes = await fetch(`${API_BASE}/api/menus`, { credentials: 'include' });
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          if (Array.isArray(menuData)) {
            menuData.forEach(menu => {
              if (menu.name) uniqueCats.add(menu.name);
              if (Array.isArray(menu.subItems)) {
                menu.subItems.forEach(sub => {
                  if (sub.name) uniqueSubCats.add(sub.name);
                });
              }
            });
          }
        }

        setCategories([...uniqueCats]);
        setSubCategories([...uniqueSubCats]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const formElement = document.getElementById("collection-form");
        if (formElement) formElement.scrollTop = 0;
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from title if slug is empty or matches title
      if (name === 'title' && (!prev.slug || prev.slug === prev.title.toLowerCase().replace(/ /g, '-'))) {
        newData.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
      }
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const themes = [
    { name: "Default (Slate)", bg: "bg-slate-50", gradient: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", title: "text-slate-900" },
    { name: "Rose (Pink)", bg: "bg-rose-50", gradient: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)", title: "text-slate-900" },
    { name: "Violet (Purple)", bg: "bg-violet-50", gradient: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", title: "text-brand-primary" },
    { name: "Amber (Yellow)", bg: "bg-amber-50", gradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", title: "text-slate-900" },
    { name: "Emerald (Green)", bg: "bg-emerald-50", gradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", title: "text-slate-900" }
  ];

  const applyTheme = (theme) => {
    setFormData(prev => ({
      ...prev,
      bg_class: theme.bg,
      bg_gradient: theme.gradient,
      title_class: theme.title
    }));
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md pointer-events-auto" onClick={onClose}></div>

      <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-bloom-in pointer-events-auto flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {initialData ? "Edit Collection" : "Create New Collection"}
            </h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Dynamic Page configuration</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all hover:scale-110 active:scale-95">
            <IconX size={24} />
          </button>
        </div>

        <form id="collection-form" onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-1">
          {/* Status Toggle */}
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${formData.is_active ? 'bg-emerald-50 text-emerald-500 shadow-sm shadow-emerald-100' : 'bg-slate-200 text-slate-400'}`}>
                {formData.is_active ? <IconEye size={24} /> : <IconEyeOff size={24} />}
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 tracking-tight">Page Visibility Status</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {formData.is_active ? 'Publicly Visible' : 'Hidden from Frontend'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`w-14 h-8 rounded-full transition-all relative p-1 ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Page Title</label>
              <div className="relative group">
                <IconFileText size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Special"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent border-2 rounded-2xl focus:border-brand-primary/20 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 outline-none text-sm font-bold text-slate-700 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Accent Title</label>
              <input
                name="accent_title"
                value={formData.accent_title}
                onChange={handleChange}
                placeholder="e.g. Gallery"
                className="w-full px-6 py-4 bg-slate-50 border-transparent border-2 rounded-2xl focus:border-brand-primary/20 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 outline-none text-sm font-bold text-slate-700 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">URL Slug</label>
            <div className="relative group">
              <IconLink size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="summer-special"
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent border-2 rounded-2xl focus:border-brand-primary/20 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 outline-none text-sm font-bold text-slate-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex justify-between">
              Description
              <span className={`text-[9px] tracking-normal transition-colors ${(formData.description?.length || 0) >= 180 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {formData.description?.length || 0} / 200
              </span>
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              maxLength={200}
              rows="3"
              placeholder="Tell your customers about this collection..."
              className="w-full px-6 py-5 bg-slate-50 border-transparent border-2 rounded-3xl focus:border-brand-primary/20 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 outline-none text-sm font-semibold text-slate-600 leading-relaxed transition-all resize-none"
            ></textarea>
          </div>

          {/* Filtering Logic */}
          <div className="p-8 bg-brand-primary/5 rounded-[2.5rem] border border-brand-primary/10 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <IconFilter size={18} className="text-brand-primary" />
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Product Filtering Logic</span>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <select
                name="filter_field"
                value={formData.filter_field}
                onChange={handleChange}
                className="flex-[0.4] px-5 py-4 bg-white border-none rounded-2xl text-xs font-black text-slate-600 focus:ring-4 focus:ring-brand-primary/10 outline-none shadow-sm"
              >
                <option value="category">By Category</option>
                <option value="sub_category">By Sub-Category</option>
              </select>

              <input
                name="filter_value"
                value={formData.filter_value}
                onChange={handleChange}
                list="filter-suggestions"
                placeholder={formData.filter_field === 'category' ? "Enter category name to filter..." : "Enter sub-category name to filter..."}
                className="flex-1 px-8 py-4 bg-white border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-brand-primary/10 outline-none shadow-sm"
                required
              />
              <datalist id="filter-suggestions">
                {formData.filter_field === 'category'
                  ? categories.map(cat => <option key={cat} value={cat} />)
                  : subCategories.map(sub => <option key={sub} value={sub} />)
                }
              </datalist>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <IconPalette size={18} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Theme</span>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pt-2">
              {themes.map((theme, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTheme(theme)}
                  className={`flex-shrink-0 p-4 rounded-3xl border-2 transition-all text-left w-36 ${formData.bg_class === theme.bg ? 'border-brand-primary bg-brand-secondary ring-4 ring-brand-primary/10' : 'border-slate-50 bg-white hover:border-slate-200'}`}
                >
                  <div className={`w-full h-10 rounded-xl mb-3 shadow-inner`} style={{ background: theme.gradient }}></div>
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="p-10 bg-slate-50/50 border-t border-slate-50 flex gap-6">
          <button onClick={onClose} type="button" className="flex-1 py-5 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors tracking-widest uppercase">
            Discard changes
          </button>
          <button
            type="submit"
            form="collection-form"
            className="flex-[2] py-5 bg-slate-950 text-white rounded-[1.5rem] flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-brand-primary transition-all active:scale-95"
          >
            <IconDeviceFloppy size={20} />
            {initialData ? "Save Changes" : "Create Collection"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CollectionModal;



