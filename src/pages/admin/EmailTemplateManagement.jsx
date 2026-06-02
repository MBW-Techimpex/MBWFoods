import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { IconMail, IconCheck, IconEye, IconDeviceFloppy } from "@tabler/icons-react";
import API_BASE from "../../config";

export default function EmailTemplateManagement() {
  const [activeCategory, setActiveCategory] = useState("register"); // register | order | admin_order
  const [selectedThemes, setSelectedThemes] = useState({
    register: "1",
    order: "1",
    admin_order: "1",
  });
  const [previewTheme, setPreviewTheme] = useState("1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Categories definitions
  const categories = [
    { id: "register", label: "Customer Registration", icon: IconMail },
    { id: "order", label: "Customer Order Success", icon: IconMail },
    { id: "admin_order", label: "Admin Order Alert", icon: IconMail },
  ];

  // Theme styles definitions
  const themes = [
    {
      id: "1",
      name: "Sleek Dark / Tech Modern",
      description: "Dark-themed luxury aesthetic featuring high-contrast gradients, deep slate modules, and custom action buttons.",
      badge: "Tech Luxury",
      colors: ["bg-[#0b0f19]", "bg-[#1e293b]", "bg-brand-primary"],
    },
    {
      id: "2",
      name: "Royal Minimal / Serif Elegance",
      description: "Elegant off-white background paired with classic serif typography, warm wood/gold tones, and clean line dividers.",
      badge: "Artisan Serif",
      colors: ["bg-[#faf8f5]", "bg-[#ffffff]", "bg-[#8e7a68]"],
    },
    {
      id: "3",
      name: "Carbon Dynamic / Vibrant Sporty",
      description: "High-energy sporty theme showcasing bold border outlines, carbon-style cards, and active dynamic text badges.",
      badge: "Carbon Sport",
      colors: ["bg-[#f3f4f6]", "bg-[#ffffff]", "bg-[#111827]"],
    },
  ];

  // Load current template settings
  useEffect(() => {
    fetch(`${API_BASE}/api/section-settings?section=email_template`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setSelectedThemes({
          register: data.email_template_register || "1",
          order: data.email_template_order || "1",
          admin_order: data.email_template_admin_order || "1",
        });
        // Default preview theme to whatever is currently active for this category
        setPreviewTheme(data[`email_template_${activeCategory}`] || "1");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, []);

  // Update preview when category changes
  useEffect(() => {
    setPreviewTheme(selectedThemes[activeCategory] || "1");
  }, [activeCategory, selectedThemes]);

  const handleSelectTheme = (themeId) => {
    setSelectedThemes((prev) => ({
      ...prev,
      [activeCategory]: themeId,
    }));
    setPreviewTheme(themeId);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const payload = {
      email_template_register: selectedThemes.register,
      email_template_order: selectedThemes.order,
      email_template_admin_order: selectedThemes.admin_order,
    };

    try {
      const res = await fetch(`${API_BASE}/api/section-settings/upsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Email templates configuration saved successfully." });
      } else {
        setMessage({ type: "error", text: "Failed to save configuration settings." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Network error occurred while saving." });
    } finally {
      setSaving(false);
      // Auto fade message after 4 seconds
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <IconMail size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Email Templates</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage branding styles and view live previews of system generated emails.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 transition-all duration-200 disabled:opacity-50"
          >
            <IconDeviceFloppy size={18} />
            {saving ? "Saving Configurations..." : "Save Settings"}
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 duration-200 ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-400"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800/30 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/10"
                    : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                }`}
              >
                <cat.icon size={16} />
                {cat.label}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-md text-[10px] uppercase font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  Theme {selectedThemes[cat.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Theme Selection Cards (Left 5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
              Select Theme Style
            </h2>
            
            {themes.map((theme) => {
              const isSelected = selectedThemes[activeCategory] === theme.id;
              const isPreviewed = previewTheme === theme.id;
              
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`cursor-pointer group p-5 border-2 rounded-2xl bg-white dark:bg-slate-900 transition-all duration-200 hover:border-brand-primary/40 ${
                    isSelected
                      ? "border-brand-primary ring-2 ring-brand-primary/10 shadow-lg shadow-brand-primary/5"
                      : isPreviewed
                      ? "border-slate-400 dark:border-slate-700"
                      : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isSelected ? "bg-brand-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}>
                          {theme.badge}
                        </span>
                        <h3 className="font-bold text-slate-950 dark:text-slate-50 text-sm">
                          {theme.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                        {theme.description}
                      </p>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? "bg-brand-primary text-white" : "border-2 border-slate-200 dark:border-slate-800 group-hover:border-brand-primary/30"
                    }`}>
                      {isSelected && <IconCheck size={14} strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Theme Palette Bar */}
                  <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1">Palette:</span>
                    {theme.colors.map((c, i) => (
                      <div key={i} className={`w-4 h-4 rounded-full border border-black/5 ${c}`} />
                    ))}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTheme(theme.id);
                      }}
                      className="ml-auto text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                    >
                      <IconEye size={12} />
                      Preview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Email Preview Area (Right 7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
                Live Preview Theme {previewTheme}
              </h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Category: <strong className="text-slate-900 dark:text-slate-100">{categories.find(c => c.id === activeCategory)?.label}</strong>
              </span>
            </div>

            {/* Email client mockup window */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Client header mock */}
              <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                
                <div className="space-y-1.5 text-xs mt-2">
                  <div className="flex items-center text-slate-500 dark:text-slate-400">
                    <span className="w-12 font-medium">From:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      System Mailer &lt;no-reply@mbw.in&gt;
                    </span>
                  </div>
                  <div className="flex items-center text-slate-500 dark:text-slate-400">
                    <span className="w-12 font-medium">To:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {activeCategory === "admin_order" ? "admin@mbw.in" : "client@example.com"}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-500 dark:text-slate-400">
                    <span className="w-12 font-medium">Subject:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-semibold">
                      {activeCategory === "register"
                        ? "Verify Your Account"
                        : activeCategory === "order"
                        ? "Order Success! Receipt #ORD-A7B2C"
                        : "[ADMIN ALERT] New Order Received"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Iframe View */}
              <div className="bg-slate-100 dark:bg-slate-950 p-6 flex justify-center">
                <div className="w-full bg-white dark:bg-[#090d16] rounded-2xl overflow-hidden shadow-inner border border-slate-100 dark:border-slate-800/40">
                  <iframe
                    title="Email Template Preview"
                    src={`${API_BASE}/api/section-settings/email-templates/preview/${activeCategory}/${previewTheme}`}
                    className="w-full h-[550px] border-none bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </AdminLayout>
  );
}
