import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import { getImageUrl } from "../../utils/imageHelper";
import { useSearchParams } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import AdminLayout from "../../components/admin/AdminLayout";
import { ImageUpload } from "../../components/admin/UploadComponents";
import {

    IconSettings,
    IconUsers,
    IconHistory,
    IconGlobe,
    IconCurrencyDollar,
    IconPlus,
    IconShieldLock,
    IconTrash,
    IconCircleCheck,
    IconAlertCircle,
    IconDeviceFloppy,
    IconMail,
    IconPhoto,
    IconInfoCircle,
    IconHelp,
    IconExternalLink,
    IconPalette,
    IconMapPin,
    IconPhone,
    IconClock,
    IconBrandWhatsapp,
    IconWorld,
    IconBriefcase,
    IconUserCircle,
    IconMailFilled,
    IconPhoneFilled,
    IconMapPinFilled,
    IconBuilding,
    IconAddressBook,
    IconEye,
    IconEyeOff,
    IconX,
    IconLayoutDashboard,
    IconSection,
    IconFlower,
    IconSearch,
    IconFilter,
    IconPencil,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconCopy,
    IconBrandInstagram,
    IconBrandFacebook,
    IconBrandLinkedin,
    IconArrowUp,
    IconDeviceMobile,
    IconMessageCircle,
} from "@tabler/icons-react";

const SettingsManagement = () => {
    const { showNotification } = useNotification();
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') || 'general';
    const [activeTab, setActiveTab] = useState(tabParam);
    const [settings, setSettings] = useState([]);
    const [staff, setStaff] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetchingLogs, setFetchingLogs] = useState(false);
    const [uploading, setUploading] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [activeRole, setActiveRole] = useState('Admin'); // 'Admin', 'Staff', 'Manager'
    const [savingPerms, setSavingPerms] = useState(false);

    const [logSearch, setLogSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Staff Pagination State
    const [staffPage, setStaffPage] = useState(1);
    const staffRowsPerPage = 5;

    // Form states for new staff
    const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '', role: '', phone: '', status: 'active' });
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showOrderPass, setShowOrderPass] = useState(false);
    const [showRegisterPass, setShowRegisterPass] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState(null);

    // Form states for new custom setting
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [newCustom, setNewCustom] = useState({ key: '', value: '' });

    // Category-wise taxation states
    const [menus, setMenus] = useState([]);
    const [taxRules, setTaxRules] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState('');
    const [selectedSubMenu, setSelectedSubMenu] = useState('');
    const [customTaxRate, setCustomTaxRate] = useState('');
    const [loadingRules, setLoadingRules] = useState(false);

    // Pagination & filtering for taxation rules
    const [taxSearch, setTaxSearch] = useState('');
    const [taxCategoryFilter, setTaxCategoryFilter] = useState('');
    const [taxPage, setTaxPage] = useState(1);
    const taxRowsPerPage = 5;

    const filteredTaxRules = taxRules.filter(rule => {
        const matchesSearch = rule.category.toLowerCase().includes(taxSearch.toLowerCase()) ||
            (rule.sub_category || '').toLowerCase().includes(taxSearch.toLowerCase());
        const matchesCategory = taxCategoryFilter ? rule.category === taxCategoryFilter : true;
        return matchesSearch && matchesCategory;
    });
    const totalTaxPages = Math.max(1, Math.ceil(filteredTaxRules.length / taxRowsPerPage));
    const paginatedTaxRules = filteredTaxRules.slice((taxPage - 1) * taxRowsPerPage, taxPage * taxRowsPerPage);

    const fetchTaxRulesAndMenus = async () => {
        setLoadingRules(true);
        try {
            const menuRes = await fetch(`${API_BASE}/api/menus`, { credentials: 'include' });
            if (menuRes.ok) {
                const menuData = await menuRes.json();
                setMenus(menuData || []);
            }
            const ruleRes = await fetch(`${API_BASE}/api/tax-rules`, { credentials: 'include' });
            if (ruleRes.ok) {
                const ruleData = await ruleRes.json();
                setTaxRules(ruleData || []);
            }
        } catch (err) {
            console.error("Error loading tax rules/menus:", err);
        } finally {
            setLoadingRules(false);
        }
    };

    const handleSaveTaxRule = async () => {
        if (!selectedMenu || !customTaxRate) return;
        try {
            const res = await fetch(`${API_BASE}/api/tax-rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: selectedMenu,
                    sub_category: selectedSubMenu || null,
                    tax_rate: customTaxRate
                }),
                credentials: 'include'
            });

            if (res.ok) {
                showNotification("Taxation rule saved and applied successfully.", "success");
                setSelectedMenu('');
                setSelectedSubMenu('');
                setCustomTaxRate('');
                fetchTaxRulesAndMenus();
            } else {
                const data = await res.json();
                showNotification(data.message || "Failed to save tax rule.", "error");
            }
        } catch (err) {
            console.error("Save tax rule failed:", err);
            showNotification("Network error occurred.", "error");
        }
    };

    const handleDeleteTaxRule = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tax rule? Matching products will revert to the global tax rate.")) return;
        try {
            const res = await fetch(`${API_BASE}/api/tax-rules/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                showNotification("Taxation rule removed successfully.", "success");
                fetchTaxRulesAndMenus();
            } else {
                const data = await res.json();
                showNotification(data.message || "Failed to delete tax rule.", "error");
            }
        } catch (err) {
            console.error("Delete tax rule failed:", err);
            showNotification("Network error occurred.", "error");
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Only fetch core settings initially
            const res = await fetch(`${API_BASE}/api/settings`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch basic settings');
            const data = await res.json();
            const siteKeys = [
                'site_logo', 'site_favicon', 'site_name', 'site_slogan', 'site_status',
                'announcement_text', 'announcement_bg_color', 'announcement_text_color', 'announcement_animation',
                'contact_email', 'site_meta_description',
                'theme_color', 'secondary_color', 'social_instagram', 'social_facebook',
                'social_pinterest', 'supported_languages', 'default_language',
                'date_format', 'measurement_unit', 'auto_language_detection',
                'google_analytics_id', 'global_inventory_limit',
                'floating_bar_enabled', 'floating_bar_whatsapp', 'floating_bar_phone',
                'floating_bar_instagram', 'floating_bar_facebook', 'floating_bar_linkedin',
                'floating_bar_whatsapp_enabled', 'floating_bar_phone_enabled', 'floating_bar_instagram_enabled',
                'floating_bar_facebook_enabled', 'floating_bar_linkedin_enabled', 'scroll_to_top_enabled',
                'footer_logo', 'site_description', 'concierge_phone', 'announcement_mode', 'announcement_enabled',
                'mail_from_name', 'mail_admin_email', 'mail_register_from_id', 'mail_register_app_password',
                'mail_order_from_id', 'mail_order_app_password', 'mail_enable_order', 'mail_enable_register',
                'mail_enable_order_admin', 'mail_enable_register_admin'
            ];
            const mailKeys = [
                'mail_from_name', 'mail_admin_email', 'mail_register_from_id', 'mail_register_app_password',
                'mail_order_from_id', 'mail_order_app_password', 'mail_enable_order', 'mail_enable_register',
                'mail_enable_order_admin', 'mail_enable_register_admin'
            ];
            const processedData = (data || []).map(s => ({
                ...s,
                group: mailKeys.includes(s.key) ? 'mail' : siteKeys.includes(s.key) ? 'site' : 'business'
            }));
            setSettings(processedData);

            if (activeTab === 'staff') fetchStaff();
            if (activeTab === 'logs') fetchLogs();
            if (activeTab === 'privileges') fetchPermissions();

        } catch (err) {
            console.error("Clinical data fetch failed:", err);
            showNotification(`Handshake Failure: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/settings/staff`, { credentials: 'include' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.debug || data.message || 'Staff fetch failed');
            }
            const data = await res.json();
            setStaff(data || []);
        } catch (err) {
            showNotification(`Staff Sync Failure: ${err.message}`, 'error');
        }
    };

    const fetchLogs = async () => {
        if (fetchingLogs) return;
        setFetchingLogs(true);
        try {
            const res = await fetch(`${API_BASE}/api/settings/logs`, { credentials: 'include' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.debug || data.message || 'Logs fetch failed');
            }
            const data = await res.json();
            setLogs(data || []);
        } catch (err) {
            showNotification(`Audit Sync Failure: ${err.message}`, 'error');
        } finally {
            setFetchingLogs(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/permissions?t=${Date.now()}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Permissions fetch failed');
            const data = await res.json();
            setPermissions(data || []);
        } catch (err) {
            showNotification(`Permission Sync Failure: ${err.message}`, 'error');
        }
    };



    useEffect(() => {
        if (activeTab === 'staff' && staff.length === 0) fetchStaff();
        if (activeTab === 'logs' && logs.length === 0 && !fetchingLogs) fetchLogs();
        if (activeTab === 'privileges' && permissions.length === 0) fetchPermissions();
        if (activeTab === 'business' && menus.length === 0) fetchTaxRulesAndMenus();
    }, [activeTab]);

    useEffect(() => {
        const root = document.documentElement;
        if (showStaffModal || showCustomModal || showDeleteModal) {
            root.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        } else {
            root.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
        }
        return () => {
            root.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
        };
    }, [showStaffModal, showCustomModal, showDeleteModal]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (tabParam) setActiveTab(tabParam);
    }, [tabParam]);

    const handleSaveSettings = async (group, customSettings = null) => {
        setSaving(true);
        const settingsToUse = customSettings || settings;
        const groupSettings = settingsToUse.filter(s => s.group === group);
        console.log(`Syncing settings group: ${group}`, groupSettings);

        try {
            const res = await fetch(`${API_BASE}/api/settings/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: groupSettings }),
                credentials: 'include'
            });
            if (res.ok) {
                showNotification(`${group} Settings Synchronized Successfully`, 'success');
                // Broadcast synchronization event
                window.dispatchEvent(new CustomEvent('settingsUpdated'));
                const channel = new BroadcastChannel('settings_sync');
                channel.postMessage('sync');
                channel.close();
                fetchData();
            } else {
                const errData = await res.json();
                showNotification(`Sync Failure: ${errData.message}`, 'error');
                console.error("Clinical registry sync failure:", errData.message);
            }
        } catch (err) {
            showNotification("Connection Error", "error");
            console.error("Clinical Handshake failure:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e, key) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) {
            showNotification('File is too large (max 1MB).', 'warning');
            return;
        }

        setUploading(key);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok && data.imageUrl) {
                const newSettings = updateSettingLocal(key, data.imageUrl);
                // Auto-save for branding images to ensure they reflect immediately
                // Pass newSettings directly to avoid race condition with state
                setTimeout(() => handleSaveSettings('site', newSettings), 100);
            } else {
                showNotification(data.error || data.message || 'Logo upload failed.', 'error');
            }
        } catch (err) {
            console.error("Clinical upload failure:", err);
        } finally {
            setUploading(null);
        }
    };

    const handleToggleStaffStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch(`${API_BASE}/api/settings/staff/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include'
            });
            if (res.ok) {
                showNotification(`Staff status updated to ${newStatus}`, "success");
                fetchStaff();
            } else {
                showNotification("Failed to update staff status", "error");
            }
        } catch (err) {
            console.error("Status toggle failure:", err);
            showNotification("Handshake failure", "error");
        }
    };

    const handleDeleteStaff = (id) => {
        setStaffToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteStaff = async () => {
        if (!staffToDelete) return;
        const deleteUrl = `${API_BASE}/api/settings/staff/${staffToDelete}`;
        console.log("Attempting to decommission staff at:", deleteUrl);

        try {
            const res = await fetch(deleteUrl, {
                method: 'DELETE',
                credentials: 'include'
            });

            let data;
            try {
                data = await res.json();
            } catch (e) {
                data = {};
            }

            if (res.ok) {
                showNotification("Staff member decommissioned successfully.", "success");
                fetchStaff();
                setShowDeleteModal(false);
                setStaffToDelete(null);
            } else {
                const errorMsg = data.message || `Failed to decommission staff (Status: ${res.status})`;
                showNotification(errorMsg, "error");
            }
        } catch (err) {
            console.error("Staff decommissioning failure:", err);
            showNotification("Connection error (Network Error)", "error");
        }
    };

    const handleEditStaff = (s) => {
        setNewStaff({
            username: s.username,
            email: s.email,
            password: '', // Leave empty for edit unless changing
            role: s.role,
            phone: s.phone || '',
            status: s.status || 'active'
        });
        setEditingStaffId(s.id);
        setShowStaffModal(true);
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            const endpoint = editingStaffId
                ? `${API_BASE}/api/settings/staff/${editingStaffId}`
                : `${API_BASE}/api/settings/staff`;

            const method = editingStaffId ? 'PUT' : 'POST';

            // For updates, we only send password if it's not empty
            const payload = { ...newStaff };
            if (editingStaffId && !payload.password) {
                delete payload.password;
            }

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (res.ok) {
                setShowStaffModal(false);
                setEditingStaffId(null);
                setNewStaff({ username: '', email: '', password: '', role: '', phone: '', status: 'active' });
                setShowPassword(false);
                fetchStaff();
                showNotification(editingStaffId ? "Staff record updated successfully." : "Staff member authorized successfully.", "success");
            } else {
                const errData = await res.json();
                showNotification(errData.message || "Operation failed.", "error");
            }
        } catch (err) {
            console.error("Staff operation failure:", err);
            showNotification("Artisanal Handshake failed.", "error");
        }
    };

    const handleSavePermissions = async () => {
        setSavingPerms(true);
        try {
            const res = await fetch(`${API_BASE}/api/permissions/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions }),
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                showNotification("Role privileges synchronized successfully.", "success");

                // Use the fresh data returned from the server immediately
                if (data.permissions) {
                    setPermissions(data.permissions);
                } else {
                    await fetchPermissions();
                }
            }
        } catch (err) {
            console.error("Clinical privilege sync failure:", err);
            showNotification("Handshake failure during privilege sync.", "error");
        } finally {
            setSavingPerms(false);
        }
    };

    const togglePermission = (id) => {
        setPermissions(prev => prev.map(p => p.id === id ? { ...p, is_granted: !p.is_granted } : p));
    };

    const handleSelectAll = (role, select) => {
        setPermissions(prev => prev.map(p => p.role === role ? { ...p, is_granted: select } : p));
    };

    const handleAddCustomField = (e) => {
        e.preventDefault();
        if (!newCustom.key || !newCustom.value) {
            showNotification("Both Key and Value are required.", "error");
            return;
        }

        updateSettingLocal(newCustom.key, newCustom.value);
        setShowCustomModal(false);
        setNewCustom({ key: '', value: '' });
        showNotification(`New parameter '${newCustom.key}' staged globally. Remember to sync.`, "info");
    };

    const updateSettingLocal = (key, value) => {
        const exists = settings.find(s => s.key === key);
        let updated;
        if (exists) {
            const mailKeys = [
                'mail_from_name', 'mail_admin_email', 'mail_register_from_id', 'mail_register_app_password',
                'mail_order_from_id', 'mail_order_app_password', 'mail_enable_order', 'mail_enable_register',
                'mail_enable_order_admin', 'mail_enable_register_admin'
            ];
            const siteKeys = [
                'site_logo', 'site_favicon', 'site_name', 'site_slogan', 'site_status',
                'announcement_text', 'announcement_bg_color', 'announcement_text_color', 'announcement_animation',
                'contact_email', 'site_meta_description',
                'theme_color', 'secondary_color', 'social_instagram', 'social_facebook',
                'social_pinterest', 'supported_languages', 'default_language',
                'date_format', 'measurement_unit', 'auto_language_detection',
                'google_analytics_id', 'global_inventory_limit',
                'floating_bar_enabled', 'floating_bar_whatsapp', 'floating_bar_phone',
                'floating_bar_instagram', 'floating_bar_facebook', 'floating_bar_linkedin',
                'floating_bar_whatsapp_enabled', 'floating_bar_phone_enabled', 'floating_bar_instagram_enabled',
                'floating_bar_facebook_enabled', 'floating_bar_linkedin_enabled', 'scroll_to_top_enabled',
                'footer_logo', 'site_description', 'concierge_phone', 'announcement_mode', 'announcement_enabled'
            ];
            const g = mailKeys.includes(key) ? 'mail' : siteKeys.includes(key) ? 'site' : 'business';
            updated = settings.map(s => s.key === key ? { ...s, value, group: g } : s);
        } else {
            // Fail-safe for missing keys (default to site group)
            const siteKeys = [
                'site_logo', 'site_favicon', 'site_name', 'site_slogan', 'site_status',
                'announcement_text', 'announcement_bg_color', 'announcement_text_color', 'announcement_animation',
                'contact_email', 'site_meta_description',
                'theme_color', 'secondary_color', 'social_instagram', 'social_facebook',
                'social_pinterest', 'supported_languages', 'default_language',
                'date_format', 'measurement_unit', 'auto_language_detection',
                'google_analytics_id', 'global_inventory_limit',
                'floating_bar_enabled', 'floating_bar_whatsapp', 'floating_bar_phone',
                'floating_bar_instagram', 'floating_bar_facebook', 'floating_bar_linkedin',
                'floating_bar_whatsapp_enabled', 'floating_bar_phone_enabled', 'floating_bar_instagram_enabled',
                'floating_bar_facebook_enabled', 'floating_bar_linkedin_enabled', 'scroll_to_top_enabled',
                'footer_logo', 'site_description', 'concierge_phone', 'announcement_mode', 'announcement_enabled'
            ];
            const mailKeys = [
                'mail_from_name', 'mail_admin_email', 'mail_register_from_id', 'mail_register_app_password',
                'mail_order_from_id', 'mail_order_app_password', 'mail_enable_order', 'mail_enable_register',
                'mail_enable_order_admin', 'mail_enable_register_admin'
            ];
            const g = mailKeys.includes(key) ? 'mail' : siteKeys.includes(key) ? 'site' : 'business';
            updated = [...settings, { key, value, group: g }];
        }
        setSettings(updated);
        return updated;
    };

    const getSettingValue = (key, fallback = '') => {
        const s = settings.find(x => x.key === key);
        return (s && s.value !== null) ? s.value : fallback;
    };

    const filteredLogs = logs.filter(log => {
        const searchStr = (logSearch || '').toLowerCase();
        const user = (log.Admin?.username || 'System').toLowerCase();
        const action = (log.action_type || '').toLowerCase();
        const module = (log.module || '').toLowerCase();
        return user.includes(searchStr) || action.includes(searchStr) || module.includes(searchStr);
    });

    const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Settings Management</h1>
                        <p className="text-slate-500 mt-1 font-sans">Master configuration and security oversight.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                    {[
                        { id: "general", icon: IconGlobe, label: "General" },
                        { id: "business", icon: IconCurrencyDollar, label: "Business" },
                        { id: "staff", icon: IconUsers, label: "Staff" },
                        { id: "mail", icon: IconMail, label: "Mail Credentials" },
                        { id: "privileges", icon: IconShieldLock, label: "User Privileges" },
                        { id: "logs", icon: IconHistory, label: "Activity Log" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? "bg-white text-brand-primary shadow-sm"
                                : "text-slate-500 hover:bg-white/50"
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] relative">
                    {saving && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-[50] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing Repository...</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "general" && (
                        <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Branding Identity */}
                                <div className="space-y-8">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Brand Identity & Design
                                    </h3>

                                    <div className="space-y-6">
                                        <ImageUpload
                                            label="Primary Logo"
                                            currentUrl={getSettingValue('site_logo')}
                                            showNotification={showNotification}
                                            recSize="Horizontal"
                                            onUpload={(url) => {
                                                const newSettings = updateSettingLocal('site_logo', url);
                                                setTimeout(() => handleSaveSettings('site', newSettings), 100);
                                            }}
                                        />

                                        <ImageUpload
                                            label="Website Favicon"
                                            currentUrl={getSettingValue('site_favicon')}
                                            showNotification={showNotification}
                                            recSize="Square"
                                            onUpload={(url) => {
                                                const newSettings = updateSettingLocal('site_favicon', url);
                                                setTimeout(() => handleSaveSettings('site', newSettings), 100);
                                            }}
                                        />

                                        <ImageUpload
                                            label="Footer Logo (Optional)"
                                            currentUrl={getSettingValue('footer_logo')}
                                            showNotification={showNotification}
                                            recSize="Horizontal"
                                            onUpload={(url) => {
                                                const newSettings = updateSettingLocal('footer_logo', url);
                                                setTimeout(() => handleSaveSettings('site', newSettings), 100);
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Studio Information */}
                                <div className="space-y-8">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Core Configuration
                                    </h3>

                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Website Name</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('site_name')}
                                                onChange={(e) => updateSettingLocal('site_name', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Brand Slogan/Tagline</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('site_slogan')}
                                                onChange={(e) => updateSettingLocal('site_slogan', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="e.g. MBW Car Accessories"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Contact Archive Email</label>
                                                <input
                                                    type="email"
                                                    value={getSettingValue('contact_email')}
                                                    onChange={(e) => updateSettingLocal('contact_email', e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Concierge Phone Number</label>
                                                <input
                                                    type="text"
                                                    value={getSettingValue('concierge_phone')}
                                                    onChange={(e) => updateSettingLocal('concierge_phone', e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                    placeholder="e.g. +44 20 7123 4567"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Deployment Status</label>
                                                <select
                                                    value={getSettingValue('site_status', 'live')}
                                                    onChange={(e) => updateSettingLocal('site_status', e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                >
                                                    <option value="live">Live/Active</option>
                                                    <option value="maintenance">Maintenance</option>
                                                    <option value="coming_soon">Coming Soon</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Default Language</label>
                                                <select
                                                    value={getSettingValue('default_language', 'English')}
                                                    onChange={(e) => updateSettingLocal('default_language', e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                >
                                                    <option value="English">English (US/UK)</option>
                                                    <option value="Hindi">हिन्दी (Hindi)</option>
                                                    <option value="Tamil">தமிழ் (Tamil)</option>
                                                    <option value="Telugu">తెలుగు (Telugu)</option>
                                                    <option value="Malayalam">മലയാളം (Malayalam)</option>
                                                    <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                                                    <option value="Bengali">বাংলা (Bengali)</option>
                                                    <option value="Marathi">मराठी (Marathi)</option>
                                                    <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                                                    <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                                                    <option value="Urdu">اردو (Urdu)</option>
                                                    <option value="Spanish">Español (Spanish)</option>
                                                    <option value="French">Français (French)</option>
                                                    <option value="German">Deutsch (German)</option>
                                                    <option value="Arabic">العربية (Arabic)</option>
                                                    <option value="Mandarin">中文 (Mandarin)</option>
                                                    <option value="Japanese">日本語 (Japanese)</option>
                                                    <option value="Portuguese">Português (Portuguese)</option>
                                                    <option value="Russian">Русский (Russian)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Palette */}
                                <div className="space-y-8 md:col-span-2 pt-8 border-t border-slate-50">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Brand Color Palette
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Primary Shade */}
                                        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <div className="relative w-16 h-16 rounded-xl shadow-inner border border-slate-200 overflow-hidden cursor-pointer flex-shrink-0 hover:ring-4 ring-brand-primary/20 transition-all">
                                                <input
                                                    type="color"
                                                    value={getSettingValue('theme_color', '#4f46e5')}
                                                    onChange={(e) => updateSettingLocal('theme_color', e.target.value)}
                                                    className="absolute -top-4 -left-4 w-32 h-32 cursor-pointer opacity-0"
                                                />
                                                <div
                                                    className="w-full h-full pointer-events-none"
                                                    style={{ backgroundColor: getSettingValue('theme_color', '#4f46e5') }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Primary Shade</p>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={getSettingValue('theme_color', '#4f46e5')}
                                                        onChange={(e) => updateSettingLocal('theme_color', e.target.value)}
                                                        className="w-28 bg-transparent font-bold text-xl text-slate-800 uppercase outline-none focus:border-b-2 focus:border-brand-primary transition-all"
                                                        maxLength={7}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(getSettingValue('theme_color', '#4f46e5'));
                                                            showNotification('Color copied to clipboard!', 'success');
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                                        title="Copy Color Code"
                                                    >
                                                        <IconCopy size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Studio Secondary */}
                                        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <div className="relative w-16 h-16 rounded-xl shadow-inner border border-slate-200 overflow-hidden cursor-pointer flex-shrink-0 hover:ring-4 ring-slate-300/50 transition-all">
                                                <input
                                                    type="color"
                                                    value={getSettingValue('secondary_color', '#f8fafc')}
                                                    onChange={(e) => updateSettingLocal('secondary_color', e.target.value)}
                                                    className="absolute -top-4 -left-4 w-32 h-32 cursor-pointer opacity-0"
                                                />
                                                <div
                                                    className="w-full h-full pointer-events-none"
                                                    style={{ backgroundColor: getSettingValue('secondary_color', '#f8fafc') }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Studio Secondary</p>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={getSettingValue('secondary_color', '#f8fafc')}
                                                        onChange={(e) => updateSettingLocal('secondary_color', e.target.value)}
                                                        className="w-28 bg-transparent font-bold text-xl text-slate-800 uppercase outline-none focus:border-b-2 focus:border-slate-400 transition-all"
                                                        maxLength={7}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(getSettingValue('secondary_color', '#f8fafc'));
                                                            showNotification('Color copied to clipboard!', 'success');
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-all"
                                                        title="Copy Color Code"
                                                    >
                                                        <IconCopy size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Connectivity */}
                                <div className="space-y-8 md:col-span-2 pt-8 border-t border-slate-50">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Social Connectivity
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Instagram URL</label>
                                            <input
                                                type="text"
                                                placeholder="https://instagram.com/yourshop"
                                                value={getSettingValue('social_instagram')}
                                                onChange={(e) => updateSettingLocal('social_instagram', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Facebook Page</label>
                                            <input
                                                type="text"
                                                placeholder="https://facebook.com/yourshop"
                                                value={getSettingValue('social_facebook')}
                                                onChange={(e) => updateSettingLocal('social_facebook', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Pinterest Collection</label>
                                            <input
                                                type="text"
                                                placeholder="https://pinterest.com/yourshop"
                                                value={getSettingValue('social_pinterest')}
                                                onChange={(e) => updateSettingLocal('social_pinterest', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Contact & Navigation */}
                                <div className="space-y-8 md:col-span-2 pt-8 border-t border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                            Floating Contact & Navigation
                                        </h3>
                                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Master Switch</span>
                                            <button
                                                onClick={() => updateSettingLocal('floating_bar_enabled', getSettingValue('floating_bar_enabled', 'true') === 'true' ? 'false' : 'true')}
                                                className={`w-12 h-6 rounded-full transition-all relative ${getSettingValue('floating_bar_enabled', 'true') === 'true' ? 'bg-brand-primary' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${getSettingValue('floating_bar_enabled', 'true') === 'true' ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {/* WhatsApp */}
                                        <div className="space-y-3 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-green-500/10 text-green-600 rounded-lg">
                                                        <IconBrandWhatsapp size={20} />
                                                    </div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">WhatsApp Number</label>
                                                </div>
                                                <button
                                                    onClick={() => updateSettingLocal('floating_bar_whatsapp_enabled', getSettingValue('floating_bar_whatsapp_enabled', 'true') === 'true' ? 'false' : 'true')}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${getSettingValue('floating_bar_whatsapp_enabled', 'true') === 'true' ? 'bg-green-500' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${getSettingValue('floating_bar_whatsapp_enabled', 'true') === 'true' ? 'left-5.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="e.g. +919876543210"
                                                value={getSettingValue('floating_bar_whatsapp')}
                                                onChange={(e) => updateSettingLocal('floating_bar_whatsapp', e.target.value)}
                                                className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 ring-brand-primary/20 outline-none font-bold text-slate-800"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-3 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                                                        <IconDeviceMobile size={20} />
                                                    </div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Phone Number</label>
                                                </div>
                                                <button
                                                    onClick={() => updateSettingLocal('floating_bar_phone_enabled', getSettingValue('floating_bar_phone_enabled', 'true') === 'true' ? 'false' : 'true')}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${getSettingValue('floating_bar_phone_enabled', 'true') === 'true' ? 'bg-blue-500' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${getSettingValue('floating_bar_phone_enabled', 'true') === 'true' ? 'left-5.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="e.g. +919876543210"
                                                value={getSettingValue('floating_bar_phone')}
                                                onChange={(e) => updateSettingLocal('floating_bar_phone', e.target.value)}
                                                className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 ring-brand-primary/20 outline-none font-bold text-slate-800"
                                            />
                                        </div>

                                        {/* Instagram */}
                                        <div className="space-y-3 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-pink-500/10 text-pink-600 rounded-lg">
                                                        <IconBrandInstagram size={20} />
                                                    </div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Instagram URL</label>
                                                </div>
                                                <button
                                                    onClick={() => updateSettingLocal('floating_bar_instagram_enabled', getSettingValue('floating_bar_instagram_enabled', 'true') === 'true' ? 'false' : 'true')}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${getSettingValue('floating_bar_instagram_enabled', 'true') === 'true' ? 'bg-pink-500' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${getSettingValue('floating_bar_instagram_enabled', 'true') === 'true' ? 'left-5.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="https://instagram.com/..."
                                                value={getSettingValue('floating_bar_instagram')}
                                                onChange={(e) => updateSettingLocal('floating_bar_instagram', e.target.value)}
                                                className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 ring-brand-primary/20 outline-none font-bold text-slate-800"
                                            />
                                        </div>

                                        {/* Facebook */}
                                        <div className="space-y-3 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
                                                        <IconBrandFacebook size={20} />
                                                    </div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Facebook URL</label>
                                                </div>
                                                <button
                                                    onClick={() => updateSettingLocal('floating_bar_facebook_enabled', getSettingValue('floating_bar_facebook_enabled', 'true') === 'true' ? 'false' : 'true')}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${getSettingValue('floating_bar_facebook_enabled', 'true') === 'true' ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${getSettingValue('floating_bar_facebook_enabled', 'true') === 'true' ? 'left-5.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="https://facebook.com/..."
                                                value={getSettingValue('floating_bar_facebook')}
                                                onChange={(e) => updateSettingLocal('floating_bar_facebook', e.target.value)}
                                                className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 ring-brand-primary/20 outline-none font-bold text-slate-800"
                                            />
                                        </div>

                                        {/* LinkedIn */}
                                        <div className="space-y-3 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-sky-600/10 text-sky-700 rounded-lg">
                                                        <IconBrandLinkedin size={20} />
                                                    </div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">LinkedIn URL</label>
                                                </div>
                                                <button
                                                    onClick={() => updateSettingLocal('floating_bar_linkedin_enabled', getSettingValue('floating_bar_linkedin_enabled', 'true') === 'true' ? 'false' : 'true')}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${getSettingValue('floating_bar_linkedin_enabled', 'true') === 'true' ? 'bg-sky-600' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${getSettingValue('floating_bar_linkedin_enabled', 'true') === 'true' ? 'left-5.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="https://linkedin.com/..."
                                                value={getSettingValue('floating_bar_linkedin')}
                                                onChange={(e) => updateSettingLocal('floating_bar_linkedin', e.target.value)}
                                                className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 ring-brand-primary/20 outline-none font-bold text-slate-800"
                                            />
                                        </div>

                                        {/* Scroll to Top */}
                                        <div className="space-y-3 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-500/10 text-slate-600 rounded-lg">
                                                        <IconArrowUp size={20} />
                                                    </div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Scroll To Top</label>
                                                </div>
                                                <button
                                                    onClick={() => updateSettingLocal('scroll_to_top_enabled', getSettingValue('scroll_to_top_enabled', 'true') === 'true' ? 'false' : 'true')}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${getSettingValue('scroll_to_top_enabled', 'true') === 'true' ? 'bg-slate-600' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${getSettingValue('scroll_to_top_enabled', 'true') === 'true' ? 'left-5.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-400 italic">Enables a floating button to quickly return to the top of the page.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Announcement Banner Configuration */}
                                <div className="space-y-8 md:col-span-2 pt-8 border-t border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                            Announcement Banner Configuration
                                        </h3>
                                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Status</span>
                                            <button
                                                onClick={() => updateSettingLocal('announcement_enabled', getSettingValue('announcement_enabled', 'true') === 'true' ? 'false' : 'true')}
                                                className={`w-12 h-6 rounded-full transition-all relative ${getSettingValue('announcement_enabled', 'true') === 'true' ? 'bg-brand-primary' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${getSettingValue('announcement_enabled', 'true') === 'true' ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Announcement Text Content</label>
                                            <input
                                                type="text"
                                                placeholder="Free shipping on all orders over ₹5000"
                                                value={getSettingValue('announcement_text')}
                                                onChange={(e) => updateSettingLocal('announcement_text', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {/* Background Color */}
                                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                                <div className="relative w-12 h-12 rounded-xl shadow-inner border border-slate-200 overflow-hidden cursor-pointer flex-shrink-0 hover:ring-4 ring-brand-primary/20 transition-all">
                                                    <input
                                                        type="color"
                                                        value={getSettingValue('announcement_bg_color', '#FAD443')}
                                                        onChange={(e) => updateSettingLocal('announcement_bg_color', e.target.value)}
                                                        className="absolute -top-4 -left-4 w-32 h-32 cursor-pointer opacity-0"
                                                    />
                                                    <div
                                                        className="w-full h-full pointer-events-none"
                                                        style={{ backgroundColor: getSettingValue('announcement_bg_color', '#FAD443') }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Background</p>
                                                    <input
                                                        type="text"
                                                        value={getSettingValue('announcement_bg_color', '#FAD443')}
                                                        onChange={(e) => updateSettingLocal('announcement_bg_color', e.target.value)}
                                                        className="w-full bg-transparent font-bold text-sm text-slate-800 uppercase outline-none focus:border-b-2 focus:border-brand-primary transition-all mt-1"
                                                        maxLength={7}
                                                    />
                                                </div>
                                            </div>

                                            {/* Text Color */}
                                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                                <div className="relative w-12 h-12 rounded-xl shadow-inner border border-slate-200 overflow-hidden cursor-pointer flex-shrink-0 hover:ring-4 ring-slate-300/50 transition-all">
                                                    <input
                                                        type="color"
                                                        value={getSettingValue('announcement_text_color', '#000000')}
                                                        onChange={(e) => updateSettingLocal('announcement_text_color', e.target.value)}
                                                        className="absolute -top-4 -left-4 w-32 h-32 cursor-pointer opacity-0"
                                                    />
                                                    <div
                                                        className="w-full h-full pointer-events-none"
                                                        style={{ backgroundColor: getSettingValue('announcement_text_color', '#000000') }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Text Color</p>
                                                    <input
                                                        type="text"
                                                        value={getSettingValue('announcement_text_color', '#000000')}
                                                        onChange={(e) => updateSettingLocal('announcement_text_color', e.target.value)}
                                                        className="w-full bg-transparent font-bold text-sm text-slate-800 uppercase outline-none focus:border-b-2 focus:border-slate-400 transition-all mt-1"
                                                        maxLength={7}
                                                    />
                                                </div>
                                            </div>

                                            {/* Animation Type */}
                                            <div className="space-y-2 flex flex-col justify-center">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Animation Style</label>
                                                <select
                                                    value={getSettingValue('announcement_mode', 'static')}
                                                    onChange={(e) => updateSettingLocal('announcement_mode', e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800 outline-none"
                                                >
                                                    <option value="static">Static (No Animation)</option>
                                                    <option value="flash">Flash (Alert)</option>
                                                    <option value="slide">Slide (Marquee)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Global Strategy & Reach */}
                                <div className="space-y-8 md:col-span-2 pt-8 border-t border-slate-50">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Global Analytics
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Google Analytics ID</label>
                                            <input
                                                type="text"
                                                placeholder="G-XXXXXXXXXX"
                                                value={getSettingValue('google_analytics_id')}
                                                onChange={(e) => updateSettingLocal('google_analytics_id', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Archival Meta Description</label>
                                            <textarea
                                                value={getSettingValue('site_meta_description')}
                                                onChange={(e) => updateSettingLocal('site_meta_description', e.target.value)}
                                                rows="1"
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800 no-scrollbar"
                                                placeholder="Brief overview for our studio's SEO synchronization..."
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Supported Languages (List)</label>
                                            <input
                                                type="text"
                                                placeholder="English, Spanish, French"
                                                value={getSettingValue('supported_languages', 'English')}
                                                onChange={(e) => updateSettingLocal('supported_languages', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Date Protocol</label>
                                            <select
                                                value={getSettingValue('date_format', 'DD/MM/YYYY')}
                                                onChange={(e) => updateSettingLocal('date_format', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            >
                                                <option value="DD/MM/YYYY">DD/MM/YYYY (UK/India)</option>
                                                <option value="MM/DD/YYYY">MM/DD/YYYY (USA)</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Measurement Logic</label>
                                            <select
                                                value={getSettingValue('measurement_unit', 'metric')}
                                                onChange={(e) => updateSettingLocal('measurement_unit', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            >
                                                <option value="metric">Metric (kg, cm, Celsius)</option>
                                                <option value="imperial">Imperial (lb, in, Fahrenheit)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Regional Auto-Detect</label>
                                            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-transparent flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-600">Smart Gateway</span>
                                                <input
                                                    type="checkbox"
                                                    checked={getSettingValue('auto_language_detection', 'true') === 'true'}
                                                    onChange={(e) => updateSettingLocal('auto_language_detection', e.target.checked ? 'true' : 'false')}
                                                    className="w-5 h-5 accent-brand-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex justify-end">
                                <button
                                    onClick={() => handleSaveSettings('site')}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-primary hover:shadow-2xl hover:shadow-violet-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <IconDeviceFloppy size={20} />
                                    {saving ? 'Synchronizing Archive...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "business" && (
                        <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Business Details */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconBriefcase size={16} className="text-brand-primary" />
                                        Business Details
                                    </h3>

                                    <div className="grid grid-cols-1 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Shop Name</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('shop_name', getSettingValue('site_name'))}
                                                onChange={(e) => updateSettingLocal('shop_name', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="e.g. Florist Studio"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Legal Representative</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('legal_representative')}
                                                onChange={(e) => updateSettingLocal('legal_representative', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="Full Legal Name"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Customer Support Email</label>
                                                <input
                                                    type="email"
                                                    value={getSettingValue('customer_support_email', getSettingValue('contact_email'))}
                                                    onChange={(e) => updateSettingLocal('customer_support_email', e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                    placeholder="support@flowershop.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Technical Support Email</label>
                                                <input
                                                    type="email"
                                                    value={getSettingValue('technical_support_email')}
                                                    onChange={(e) => updateSettingLocal('technical_support_email', e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                    placeholder="tech@flowershop.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Phone Registry */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconPhoneFilled size={16} className="text-brand-primary" />
                                        Business Phone Registry
                                    </h3>

                                    <div className="grid grid-cols-1 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Business Phone-1 (Main)</label>
                                            <div className="relative">
                                                <IconPhone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" />
                                                <input
                                                    type="text"
                                                    value={getSettingValue('business_phone_main', getSettingValue('shop_phone'))}
                                                    onChange={(e) => updateSettingLocal('business_phone_main', e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                    placeholder="+1 (000) 000-0000"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Business Phone-2 (Sec)</label>
                                            <div className="relative">
                                                <IconPhone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" />
                                                <input
                                                    type="text"
                                                    value={getSettingValue('business_phone_secondary')}
                                                    onChange={(e) => updateSettingLocal('business_phone_secondary', e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                    placeholder="+1 (000) 000-0000"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">WhatsApp Registry</label>
                                            <div className="relative">
                                                <IconBrandWhatsapp size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                <input
                                                    type="text"
                                                    value={getSettingValue('business_whatsapp')}
                                                    onChange={(e) => updateSettingLocal('business_whatsapp', e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                    placeholder="+1 (000) 000-0000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order & Fiscal Oversight */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconCircleCheck size={16} className="text-brand-primary" />
                                        Order & Fiscal Oversight
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Min Order Value</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('min_order_value', '0')}
                                                onChange={(e) => updateSettingLocal('min_order_value', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Max Order Value (US/Global)</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('max_order_value', '10000')}
                                                onChange={(e) => updateSettingLocal('max_order_value', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="10000"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Daily Order Intake Limit</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('daily_order_limit', '0')}
                                                onChange={(e) => updateSettingLocal('daily_order_limit', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="0 for no limit"
                                            />
                                            <p className="text-[9px] text-slate-400 italic font-medium px-1">Blocks new orders once this daily total is reached.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Global Studio Address */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconMapPinFilled size={16} className="text-brand-primary" />
                                        Global Studio Address
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Headquarters Address</label>
                                        <textarea
                                            value={getSettingValue('headquarters_address', getSettingValue('shop_address'))}
                                            onChange={(e) => updateSettingLocal('headquarters_address', e.target.value)}
                                            rows="3"
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800 no-scrollbar"
                                            placeholder="123 Floral Ave, New York, NY 10001"
                                        />
                                    </div>
                                </div>

                                {/* Fiscal Architecture */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconCurrencyDollar size={16} className="text-brand-primary" />
                                        Fiscal Architecture
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Global Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('tax_rate', '18')}
                                                onChange={(e) => updateSettingLocal('tax_rate', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Delivery Threshold (Free Above)</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('delivery_threshold', '99')}
                                                onChange={(e) => updateSettingLocal('delivery_threshold', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Base Delivery Fee</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('delivery_fee', '15')}
                                                onChange={(e) => updateSettingLocal('delivery_fee', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Localization */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconGlobe size={16} className="text-brand-primary" />
                                        Localization & Compliance
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Shop Default Country</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('country', 'United States')}
                                                onChange={(e) => updateSettingLocal('country', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Studio Timezone</label>
                                            <select
                                                value={getSettingValue('timezone', 'UTC')}
                                                onChange={(e) => updateSettingLocal('timezone', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            >
                                                <option value="UTC">UTC (Standard)</option>
                                                <option value="America/New_York">Eastern (EST)</option>
                                                <option value="America/Chicago">Central (CST)</option>
                                                <option value="Asia/Kolkata">India (IST)</option>
                                                <option value="Europe/London">London (GMT)</option>
                                                <option value="Dubai/Asia">Dubai (GST)</option>
                                                <option value="Canada/Toronto">Toronto (EST)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Default Currency</label>
                                            <select
                                                value={getSettingValue('currency', 'USD')}
                                                onChange={(e) => updateSettingLocal('currency', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            >
                                                <option value="USD">USD ($) - US</option>
                                                <option value="EUR">EUR (€) - EU</option>
                                                <option value="GBP">GBP (£) - UK</option>
                                                <option value="INR">INR (₹) - India</option>
                                                <option value="AED">AED (د.إ) - Dubai</option>
                                                <option value="CAD">CAD ($) - Canada</option>
                                                <option value="AUD">AUD ($) - Australia</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Business Reg. Number (VAT/GST/EIN)</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('business_reg_number')}
                                                onChange={(e) => updateSettingLocal('business_reg_number', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="e.g. VAT123456789"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Authorized Shipping Countries</label>
                                            <textarea
                                                value={getSettingValue('shipping_countries', 'USA, Canada, United Kingdom, UAE, India')}
                                                onChange={(e) => updateSettingLocal('shipping_countries', e.target.value)}
                                                rows="2"
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800 no-scrollbar"
                                                placeholder="Comma separated: USA, Canada, UK..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Logic */}
                                <div className="space-y-6 md:col-span-2 pt-4 border-t border-slate-50">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconSettings size={16} className="text-brand-primary" />
                                        Operational Logic
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                    <IconWorld size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Same Day Delivery</p>
                                                    <p className="text-[10px] text-slate-500 font-bold italic">Enable express courier for same-day requests.</p>
                                                </div>
                                            </div>
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getSettingValue('same_day_delivery', 'true') === 'true'}
                                                    onChange={(e) => updateSettingLocal('same_day_delivery', e.target.checked.toString())}
                                                />
                                                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-primary"></div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col justify-center overflow-hidden">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block truncate" title="Global Inventory Limit (Warning)">Global Inventory Limit</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    value={getSettingValue('global_inventory_limit', '10')}
                                                    onChange={(e) => updateSettingLocal('global_inventory_limit', e.target.value)}
                                                    className="w-full min-w-0 px-4 py-3 bg-white border-2 border-transparent rounded-xl focus:border-brand-primary/20 transition-all font-bold text-slate-800 outline-none"
                                                    placeholder="Limit Count"
                                                />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-2 rounded-lg flex-shrink-0">Items</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Disabled Delivery Dates (Shop Closed)</label>
                                        <div className="relative">
                                            <IconClock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" />
                                            <input
                                                type="text"
                                                value={getSettingValue('disabled_delivery_dates', '')}
                                                onChange={(e) => updateSettingLocal('disabled_delivery_dates', e.target.value)}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="26-04-2026, 27-04-2026"
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-400 italic font-medium px-1 leading-relaxed">
                                            To disable multiple days, enter them separated by commas.
                                            <br />Example: <span className="text-brand-primary font-bold">28-04-2026, 29-04-2026</span> (DD-MM-YYYY format).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Category-Wise Dynamic Taxation */}
                            <div className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-8 mt-4">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <IconCurrencyDollar size={16} className="text-brand-primary" />
                                        Category-Wise Dynamic Taxation
                                    </h3>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                        Configure customized tax rates for specific main categories and subcategories. Matching products will dynamically load these rates.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Main Category</label>
                                        <select
                                            value={selectedMenu}
                                            onChange={(e) => {
                                                setSelectedMenu(e.target.value);
                                                setSelectedSubMenu('');
                                            }}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-brand-primary/40 transition-all font-bold text-slate-800 dark:text-slate-100 text-sm outline-none"
                                        >
                                            <option value="">-- Choose Category --</option>
                                            {menus.map(m => (
                                                <option key={m.id} value={m.name}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Sub-Category</label>
                                        <select
                                            value={selectedSubMenu}
                                            onChange={(e) => setSelectedSubMenu(e.target.value)}
                                            disabled={!selectedMenu}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-brand-primary/40 transition-all font-bold text-slate-800 dark:text-slate-100 text-sm outline-none disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400"
                                        >
                                            <option value="">-- All Sub-Categories --</option>
                                            {menus.find(m => m.name === selectedMenu)?.subItems?.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Tax Rate (%)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 18"
                                            value={customTaxRate}
                                            onChange={(e) => setCustomTaxRate(e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-brand-primary/40 transition-all font-bold text-slate-800 dark:text-slate-100 text-sm outline-none"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={handleSaveTaxRule}
                                            disabled={!selectedMenu || !customTaxRate}
                                            className="w-full py-3 bg-brand-primary hover:bg-brand-accent text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {taxRules.some(r => r.category.toLowerCase() === selectedMenu.toLowerCase() && (r.sub_category || '').toLowerCase() === (selectedSubMenu || '').toLowerCase()) ? (
                                                <>
                                                    <IconPencil size={16} /> Update Tax Rate
                                                </>
                                            ) : (
                                                <>
                                                    <IconPlus size={16} /> Save Tax Rule
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Filters & Search Bar */}
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="relative w-full sm:w-72">
                                        <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search category or sub-category..."
                                            value={taxSearch}
                                            onChange={(e) => {
                                                setTaxSearch(e.target.value);
                                                setTaxPage(1);
                                            }}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-brand-primary/40 transition-all font-bold text-slate-700 dark:text-slate-200 text-xs outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] hidden sm:inline">Filter Category:</span>
                                        <select
                                            value={taxCategoryFilter}
                                            onChange={(e) => {
                                                setTaxCategoryFilter(e.target.value);
                                                setTaxPage(1);
                                            }}
                                            className="w-full sm:w-56 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-brand-primary/40 transition-all font-bold text-slate-700 dark:text-slate-200 text-xs outline-none"
                                        >
                                            <option value="">All Categories</option>
                                            {Array.from(new Set(taxRules.map(r => r.category))).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Existing Rules List */}
                                <div className="space-y-4">
                                    <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-950">
                                        <table className="w-full border-collapse text-left">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Category</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Sub-Category</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Tax Rate</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                {loadingRules ? (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-medium italic">
                                                            Loading taxation configurations...
                                                        </td>
                                                    </tr>
                                                ) : filteredTaxRules.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-medium italic">
                                                            {taxRules.length === 0 ? "No category-wise tax rules configured. Default global rate applies." : "No tax rules matched your filters."}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    paginatedTaxRules.map(rule => (
                                                        <tr key={rule.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                                            <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">{rule.category}</td>
                                                            <td className="px-6 py-4 text-sm font-medium text-slate-500">{rule.sub_category || <span className="italic text-slate-400">All Sub-categories</span>}</td>
                                                            <td className="px-6 py-4 text-sm font-black text-brand-primary">{rule.tax_rate}%</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedMenu(rule.category);
                                                                        setSelectedSubMenu(rule.sub_category || '');
                                                                        setCustomTaxRate(rule.tax_rate);
                                                                    }}
                                                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 rounded-full transition-all mr-2"
                                                                    title="Edit Tax Rate"
                                                                >
                                                                    <IconPencil size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteTaxRule(rule.id)}
                                                                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 rounded-full transition-all"
                                                                    title="Delete Tax Rule"
                                                                >
                                                                    <IconTrash size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    {filteredTaxRules.length > 0 && (
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Showing {Math.min(filteredTaxRules.length, (taxPage - 1) * taxRowsPerPage + 1)}-{Math.min(filteredTaxRules.length, taxPage * taxRowsPerPage)} of {filteredTaxRules.length} rules
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={taxPage === 1}
                                                    onClick={() => setTaxPage(p => p - 1)}
                                                    className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 disabled:opacity-30 transition-all text-slate-600 dark:text-slate-400"
                                                >
                                                    <IconChevronLeft size={14} />
                                                </button>

                                                <div className="flex items-center gap-1">
                                                    {[...Array(totalTaxPages)].map((_, i) => (
                                                        <button
                                                            key={i + 1}
                                                            type="button"
                                                            onClick={() => setTaxPage(i + 1)}
                                                            className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${taxPage === i + 1
                                                                    ? "bg-brand-primary text-white shadow-lg shadow-indigo-100/50"
                                                                    : "bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50"
                                                                }`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={taxPage >= totalTaxPages}
                                                    onClick={() => setTaxPage(p => p + 1)}
                                                    className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 disabled:opacity-30 transition-all text-slate-600 dark:text-slate-400"
                                                >
                                                    <IconChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Weekly Subscription Menu Plan */}
                            <div className="space-y-8 md:col-span-2 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <IconFlower size={16} className="text-brand-primary" />
                                        Weekly Meal Subscription Menu Setup
                                    </h3>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                        Specify the static menu choices shown to customers for each day of the week under each plan.
                                    </p>
                                </div>

                                {/* Breakfast Plan Grid */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-2">
                                        <span>🍳</span> Breakfast Subscription Menu
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-orange-50/10 dark:bg-orange-950/5 p-6 rounded-3xl border border-orange-100 dark:border-orange-900/20">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                            const settingKey = `sub_menu_breakfast_${day.toLowerCase()}`;
                                            return (
                                                <div key={day} className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{day}</label>
                                                    <input
                                                        type="text"
                                                        value={getSettingValue(settingKey, '')}
                                                        onChange={(e) => updateSettingLocal(settingKey, e.target.value)}
                                                        className="w-full px-5 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-orange-500/40 transition-all font-bold text-slate-800 dark:text-slate-100 text-sm outline-none"
                                                        placeholder={`Breakfast for ${day}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Lunch Plan Grid */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
                                        <span>🍛</span> Lunch Subscription Menu
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-teal-50/10 dark:bg-teal-950/5 p-6 rounded-3xl border border-teal-100 dark:border-teal-900/20">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                            const settingKey = `sub_menu_lunch_${day.toLowerCase()}`;
                                            return (
                                                <div key={day} className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{day}</label>
                                                    <input
                                                        type="text"
                                                        value={getSettingValue(settingKey, '')}
                                                        onChange={(e) => updateSettingLocal(settingKey, e.target.value)}
                                                        className="w-full px-5 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-teal-500/40 transition-all font-bold text-slate-800 dark:text-slate-100 text-sm outline-none"
                                                        placeholder={`Lunch for ${day}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dinner Plan Grid */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2">
                                        <span>🍲</span> Dinner Subscription Menu
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-violet-50/10 dark:bg-violet-950/5 p-6 rounded-3xl border border-violet-100 dark:border-violet-900/20">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                            const settingKey = `sub_menu_dinner_${day.toLowerCase()}`;
                                            return (
                                                <div key={day} className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{day}</label>
                                                    <input
                                                        type="text"
                                                        value={getSettingValue(settingKey, '')}
                                                        onChange={(e) => updateSettingLocal(settingKey, e.target.value)}
                                                        className="w-full px-5 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500/40 transition-all font-bold text-slate-800 dark:text-slate-100 text-sm outline-none"
                                                        placeholder={`Dinner for ${day}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex justify-end">
                                <button
                                    onClick={() => handleSaveSettings('business')}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-primary hover:shadow-2xl hover:shadow-violet-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <IconDeviceFloppy size={20} />
                                    {saving ? 'Synchronizing Archive...' : 'Save Business Details'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "staff" && (
                        <div className="p-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Staff Directory</h3>
                                <button
                                    onClick={() => setShowStaffModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:shadow-md transition-all"
                                >
                                    <IconPlus size={18} />
                                    Add New Staff
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                                            <th className="px-10 py-5">Staff Identity</th>
                                            <th className="px-10 py-5">Archival Role</th>
                                            <th className="px-10 py-5">Contact Details</th>
                                            <th className="px-10 py-5">Status</th>
                                            <th className="px-10 py-5 text-right bg-slate-50/50">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {staff.slice((staffPage - 1) * staffRowsPerPage, staffPage * staffRowsPerPage).map((s) => (
                                            <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase">
                                                            {s.username.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{s.username}</p>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase">{s.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.role === 'superadmin' ? 'bg-violet-50 text-brand-primary border-violet-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        }`}>
                                                        {s.role}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter italic">{s.phone || 'No Phone Record'}</p>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                                        }`}>
                                                        ● {s.status || 'active'}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-right bg-slate-50/30">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => handleToggleStaffStatus(s.id, s.status || 'active')}
                                                            title={s.status === 'active' ? 'Deactivate Staff' : 'Activate Staff'}
                                                            className={`p-3 transition-all hover:bg-white hover:shadow-md rounded-xl ${s.status === 'active' ? 'text-brand-primary' : 'text-slate-400'}`}
                                                        >
                                                            {s.status === 'active' ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditStaff(s)}
                                                            title="Edit Staff Details"
                                                            className="p-3 text-amber-500 hover:text-amber-600 transition-all hover:bg-amber-50 hover:shadow-md rounded-xl"
                                                        >
                                                            <IconPencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteStaff(s.id)}
                                                            title="Remove Staff"
                                                            className="p-3 text-rose-300 hover:text-rose-600 transition-all hover:bg-rose-50 hover:shadow-md rounded-xl"
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

                            {/* Staff Pagination */}
                            {staff.length > staffRowsPerPage && (
                                <div className="p-6 border-t border-slate-50 bg-white rounded-b-[2.5rem] flex items-center justify-between">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        Showing {(staffPage - 1) * staffRowsPerPage + 1} to {Math.min(staffPage * staffRowsPerPage, staff.length)} of {staff.length} staff members
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={staffPage === 1}
                                            onClick={() => setStaffPage(prev => Math.max(1, prev - 1))}
                                            className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-slate-600"
                                        >
                                            <IconChevronLeft size={18} />
                                        </button>

                                        {[...Array(Math.ceil(staff.length / staffRowsPerPage))].map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setStaffPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-[11px] font-bold transition-all ${staffPage === i + 1
                                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                                    : "border border-slate-100 text-slate-600 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            disabled={staffPage === Math.ceil(staff.length / staffRowsPerPage)}
                                            onClick={() => setStaffPage(prev => Math.min(Math.ceil(staff.length / staffRowsPerPage), prev + 1))}
                                            className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-slate-600"
                                        >
                                            <IconChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "privileges" && (
                        <div className="p-0 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
                            {/* Privilege Header */}
                            <div className="p-8 border-b border-slate-100 bg-brand-secondary/30 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold font-serif text-brand-primary">User Role Permissions</h3>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1 font-sans">Manage system access levels and user capabilities</p>
                                </div>
                                <button
                                    onClick={handleSavePermissions}
                                    disabled={savingPerms}
                                    className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                                >
                                    {savingPerms ? 'Synchronizing...' : 'Save Changes'}
                                    <IconDeviceFloppy size={18} />
                                </button>
                            </div>

                            <div className="flex flex-col lg:flex-row h-full">
                                {/* Role Sidebar */}
                                <div className="w-full lg:w-72 border-r border-slate-100 p-8 space-y-6 bg-brand-secondary/10">
                                    <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Select Role</p>
                                    <div className="space-y-3">
                                        {['Admin', 'Staff', 'Manager'].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => setActiveRole(role)}
                                                className={`w-full flex items-center justify-between px-7 py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-300 ${activeRole === role
                                                    ? "bg-brand-primary text-white shadow-2xl shadow-indigo-200 scale-[1.02]"
                                                    : "text-slate-500 hover:bg-white hover:text-brand-primary"
                                                    }`}
                                            >
                                                {role}
                                                {activeRole === role && <IconCircleCheck size={18} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Permissions Grid */}
                                <div className="flex-1 p-12 bg-white">
                                    <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
                                        <h4 className="text-xl font-serif italic text-slate-800">Permissions for <span className="text-brand-primary font-black not-italic ml-2 uppercase tracking-tight">{activeRole}</span></h4>
                                        <div className="flex gap-6">
                                            <button onClick={() => handleSelectAll(activeRole, true)} className="text-[10px] font-black uppercase text-brand-primary hover:text-indigo-900 tracking-[0.2em] transition-colors">Select All</button>
                                            <button onClick={() => handleSelectAll(activeRole, false)} className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 tracking-[0.2em] transition-colors">Deselect All</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        {/* Grouped Permissions */}
                                        {Array.from(new Set(permissions.filter(p => p.role === activeRole).map(p => p.section))).map(section => (
                                            <div key={section} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] space-y-6 hover:bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
                                                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-brand-secondary text-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                                        {section === 'General Management' ? <IconLayoutDashboard size={20} /> : section === 'Home Page' ? <IconSection size={20} /> : section === 'Shop Management' ? <IconFlower size={20} /> : <IconShieldLock size={20} />}
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">{section}</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 pt-2">
                                                    {permissions.filter(p => p.role === activeRole && p.section === section).map(perm => (
                                                        <label key={perm.id} className="flex items-start gap-4 cursor-pointer group/item">
                                                            <div className="relative flex items-center justify-center mt-0.5">
                                                                <input
                                                                    type="checkbox"
                                                                    className="sr-only"
                                                                    checked={!!perm.is_granted}
                                                                    onChange={() => togglePermission(perm.id)}
                                                                />
                                                                <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${perm.is_granted ? 'bg-brand-primary border-brand-primary rotate-0 scale-100' : 'border-slate-200 bg-white rotate-12 scale-90'}`}></div>
                                                                {perm.is_granted && <IconCircleCheck className="absolute w-4 h-4 text-white animate-in zoom-in duration-300" />}
                                                            </div>
                                                            <span className={`text-xs font-bold transition-colors duration-300 ${perm.is_granted ? 'text-slate-900 translate-x-1' : 'text-slate-400 group-hover/item:text-slate-600'}`}>{perm.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                    {activeTab === "mail" && (
                        <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Sender Identity */}
                                <div className="space-y-8">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Sender Identity & Notifications
                                    </h3>

                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Mail Sender Name</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('mail_from_name', 'Car Accessories')}
                                                onChange={(e) => updateSettingLocal('mail_from_name', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="e.g. MBW Car Accessories"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Admin Alert Email</label>
                                            <input
                                                type="email"
                                                value={getSettingValue('mail_admin_email', 'admin@example.com')}
                                                onChange={(e) => updateSettingLocal('mail_admin_email', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="Email to receive order/registration alerts"
                                            />
                                        </div>

                                        <div className="pt-6 space-y-4">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Email Notifications Toggles</label>
                                            <div className="grid grid-cols-1 gap-3">
                                                {[
                                                    { key: 'mail_enable_order', label: 'Customer Order Confirmation' },
                                                    { key: 'mail_enable_order_admin', label: 'Admin New Order Alert' },
                                                    { key: 'mail_enable_register', label: 'Customer Welcome / Verify' },
                                                    { key: 'mail_enable_register_admin', label: 'Admin New User Alert' },
                                                ].map(item => (
                                                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:bg-white hover:border-brand-primary/20 transition-all">
                                                        <span className="text-xs font-bold text-slate-600">{item.label}</span>
                                                        <button
                                                            onClick={() => updateSettingLocal(item.key, getSettingValue(item.key, 'true') === 'true' ? 'false' : 'true')}
                                                            className={`w-12 h-6 rounded-full transition-all relative ${getSettingValue(item.key, 'true') === 'true' ? 'bg-brand-primary' : 'bg-slate-200'}`}
                                                        >
                                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${getSettingValue(item.key, 'true') === 'true' ? 'left-7' : 'left-1'}`} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SMTP Credentials */}
                                <div className="space-y-8">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Transactional Mail Credentials
                                    </h3>

                                    <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 space-y-3">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-primary shadow-sm shrink-0">
                                                <IconHelp size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-800">Need help with App Passwords?</p>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    Follow this tutorial to generate secure credentials:
                                                    <a href="https://www.youtube.com/watch?v=E-NvBfj4NUQ&t=3s" target="_blank" rel="noopener noreferrer" className="ml-1 text-brand-primary font-black hover:underline inline-flex items-center gap-1">
                                                        Watch Guide <IconExternalLink size={12} />
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-brand-primary/10 flex items-center gap-2">
                                            <IconInfoCircle size={14} className="text-brand-primary" />
                                            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                                                Note: The mail ID and app password must originate from the same account.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Order Mail SMTP */}
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
                                            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm text-brand-primary">
                                                    <IconBriefcase size={18} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Order Dispatch SMTP</span>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">SMTP Username / Email</label>
                                                <input
                                                    type="text"
                                                    value={getSettingValue('mail_order_from_id')}
                                                    onChange={(e) => updateSettingLocal('mail_order_from_id', e.target.value)}
                                                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-brand-primary transition-all font-bold text-slate-800 text-sm"
                                                    placeholder="gmail-id@gmail.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">App Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showOrderPass ? "text" : "password"}
                                                        value={getSettingValue('mail_order_app_password')}
                                                        onChange={(e) => updateSettingLocal('mail_order_app_password', e.target.value)}
                                                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-brand-primary transition-all font-bold text-slate-800 text-sm pr-12"
                                                        placeholder="•••• •••• •••• ••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowOrderPass(!showOrderPass)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-primary transition-colors"
                                                    >
                                                        {showOrderPass ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Registration Mail SMTP */}
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
                                            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm text-brand-primary">
                                                    <IconUserCircle size={18} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">User Authentication SMTP</span>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">SMTP Username / Email</label>
                                                <input
                                                    type="text"
                                                    value={getSettingValue('mail_register_from_id')}
                                                    onChange={(e) => updateSettingLocal('mail_register_from_id', e.target.value)}
                                                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-brand-primary transition-all font-bold text-slate-800 text-sm"
                                                    placeholder="gmail-id@gmail.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">App Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showRegisterPass ? "text" : "password"}
                                                        value={getSettingValue('mail_register_app_password')}
                                                        onChange={(e) => updateSettingLocal('mail_register_app_password', e.target.value)}
                                                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-brand-primary transition-all font-bold text-slate-800 text-sm pr-12"
                                                        placeholder="•••• •••• •••• ••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowRegisterPass(!showRegisterPass)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-primary transition-colors"
                                                    >
                                                        {showRegisterPass ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button Container */}
                            <div className="flex justify-end pt-8 border-t border-slate-50">
                                <button
                                    onClick={() => handleSaveSettings('mail')}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-brand-primary transition-all shadow-xl shadow-slate-200 disabled:opacity-50 group"
                                >
                                    <IconDeviceFloppy className="group-hover:rotate-12 transition-transform" />
                                    {saving ? "Synchronizing..." : "Finalize Mail Configuration"}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "logs" && (
                        <div className="p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold font-serif italic text-slate-800">Operational Registry</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Audit trail for administrative transitions (Retained for 7 days)</p>
                                </div>
                                <div className="relative">
                                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search archives..."
                                        value={logSearch}
                                        onChange={(e) => setLogSearch(e.target.value)}
                                        className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-primary transition-all w-64"
                                    />
                                </div>
                            </div>

                            <div className="border border-slate-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Operator</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Action Type</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Module Domain</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Log Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {paginatedLogs.map((log, i) => {
                                            const logDate = log.created_at || log.createdAt;
                                            const actionRaw = (log.action_type || '').toUpperCase();
                                            let actionLabel = actionRaw.replace('_', ' ');
                                            let actionColor = 'bg-indigo-50 text-indigo-500';

                                            if (actionRaw.includes('ADD') || actionRaw.includes('POST') || actionRaw.includes('CREATE')) {
                                                actionLabel = 'Added Record';
                                                actionColor = 'bg-emerald-50 text-emerald-500';
                                            } else if (actionRaw.includes('UPDATE') || actionRaw.includes('PUT') || actionRaw.includes('EDIT') || actionRaw.includes('SYNC')) {
                                                actionLabel = 'Updated Entry';
                                                actionColor = 'bg-blue-50 text-blue-500';
                                            } else if (actionRaw.includes('DELETE') || actionRaw.includes('REMOVE') || actionRaw.includes('CLEAR')) {
                                                actionLabel = 'Deleted Item';
                                                actionColor = 'bg-rose-50 text-rose-500';
                                            } else if (actionRaw.includes('LOGIN')) {
                                                actionLabel = 'Secure Login';
                                                actionColor = 'bg-amber-50 text-amber-500';
                                            }

                                            return (
                                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs font-black text-slate-700">
                                                                {logDate ? new Date(logDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending...'}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400">
                                                                {logDate ? new Date(logDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Calculating...'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase">
                                                                {(log.Admin?.username || 'S').substring(0, 2)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-black text-slate-800">{log.Admin?.username || 'System Agent'}</span>
                                                                <span className="text-[9px] font-bold text-brand-primary uppercase tracking-tighter">{log.Admin?.role || 'Service'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${actionColor}`}>
                                                            {actionLabel}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{log.module} Scope</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className="text-[10px] font-mono font-bold text-slate-300">#REF-{log.id.toString().padStart(6, '0')}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredLogs.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                                        <IconHistory size={48} />
                                                        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Archival Registry Empty</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Showing {Math.min(filteredLogs.length, (currentPage - 1) * rowsPerPage + 1)}-{Math.min(filteredLogs.length, currentPage * rowsPerPage)} of {filteredLogs.length} transitions
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30 transition-all"
                                    >
                                        <IconChevronLeft size={16} />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1
                                                        ? "bg-brand-primary text-white shadow-lg shadow-indigo-100"
                                                        : "bg-white text-slate-400 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30 transition-all"
                                    >
                                        <IconChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Field Modal - Horizontal Layout */}
            {showCustomModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold font-serif text-slate-800">Add New Configuration Property</h3>
                            <button onClick={() => setShowCustomModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 transition-all"><IconX size={24} /></button>
                        </div>
                        <form onSubmit={handleAddCustomField} className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6 items-end">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Property Key (Slug)</label>
                                    <input
                                        type="text" required
                                        placeholder="e.g. meta_title"
                                        value={newCustom.key}
                                        onChange={(e) => setNewCustom({ ...newCustom, key: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Value Mapping</label>
                                    <input
                                        type="text" required
                                        placeholder="e.g. Florist Botanical"
                                        value={newCustom.value}
                                        onChange={(e) => setNewCustom({ ...newCustom, value: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowCustomModal(false)} className="flex-1 py-4 bg-white border border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-50 transition-all">Discard</button>
                                <button type="submit" className="flex-1 py-4 bg-brand-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-violet-100 transition-all hover:scale-[1.02]">Stage Property</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Staff Commission Modal */}
            {showStaffModal && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold font-serif text-slate-800">{editingStaffId ? 'Update User Record' : 'Add New User'}</h3>
                            <button
                                onClick={() => {
                                    setShowStaffModal(false);
                                    setEditingStaffId(null);
                                    setNewStaff({ username: '', email: '', password: '', role: '', phone: '', status: 'active' });
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"
                            >
                                <IconX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddStaff} className="flex flex-col max-h-[90vh]">
                            {/* Scrollable Fields area */}
                            <div className="p-8 space-y-8 overflow-y-auto scrollbar-hide flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name</label>
                                        <input
                                            type="text" required
                                            placeholder="Enter full name"
                                            value={newStaff.username}
                                            onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Role */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={newStaff.role}
                                                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all outline-none text-slate-600 font-bold appearance-none cursor-pointer pr-12"
                                            >
                                                <option value="">Select Role</option>
                                                <option value="Admin">Admin</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Staff">Staff</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <IconChevronDown size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                        <input
                                            type="email" required
                                            placeholder="user@example.com"
                                            value={newStaff.email}
                                            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Record</label>
                                        <input
                                            type="tel"
                                            placeholder="Enter phone number"
                                            value={newStaff.phone}
                                            onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Password {editingStaffId && <span className="text-[9px] text-slate-400 font-normal normal-case ml-1">(Optional)</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required={!editingStaffId}
                                                placeholder={editingStaffId ? "Leave blank to keep current" : "Enter master password"}
                                                value={newStaff.password}
                                                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all outline-none pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operational Status</label>
                                        <div className="flex items-center gap-8 h-[58px]">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        value="active"
                                                        checked={newStaff.status === 'active'}
                                                        onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${newStaff.status === 'active' ? 'border-brand-primary' : 'border-slate-200'}`}></div>
                                                    {newStaff.status === 'active' && <div className="absolute w-3 h-3 bg-brand-primary rounded-full animate-in zoom-in duration-200"></div>}
                                                </div>
                                                <span className={`text-sm font-bold transition-colors ${newStaff.status === 'active' ? 'text-brand-primary' : 'text-slate-500 group-hover:text-slate-700'}`}>Active</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        value="inactive"
                                                        checked={newStaff.status === 'inactive'}
                                                        onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${newStaff.status === 'inactive' ? 'border-brand-primary' : 'border-slate-200'}`}></div>
                                                    {newStaff.status === 'inactive' && <div className="absolute w-3 h-3 bg-brand-primary rounded-full animate-in zoom-in duration-200"></div>}
                                                </div>
                                                <span className={`text-sm font-bold transition-colors ${newStaff.status === 'inactive' ? 'text-brand-primary' : 'text-slate-500 group-hover:text-slate-700'}`}>Inactive</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer Buttons */}
                            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowStaffModal(false);
                                        setEditingStaffId(null);
                                        setNewStaff({ username: '', email: '', password: '', role: '', phone: '', status: 'active' });
                                    }}
                                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-brand-primary transition-all shadow-xl shadow-slate-100 uppercase text-[10px] tracking-widest"
                                >
                                    {editingStaffId ? 'Update Record' : 'Authorize Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-10 text-center">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <IconTrash size={32} />
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 mb-2 font-serif tracking-tight">Decommission Record?</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-10 px-4">
                            Are you certain you want to remove this staff member from the archival registry? This action is permanent and cannot be reversed.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDeleteStaff}
                                className="w-full py-5 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 uppercase text-[11px] tracking-widest"
                            >
                                Confirm Permanent Deletion
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setStaffToDelete(null);
                                }}
                                className="w-full py-5 bg-white border border-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-[11px] tracking-widest"
                            >
                                Cancel Archival
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default SettingsManagement;
