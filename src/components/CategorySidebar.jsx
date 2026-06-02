import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconCategory, IconChevronRight, IconSteeringWheel, IconEngine, IconBolt, IconTools } from '@tabler/icons-react';
import API_BASE from '../config';
import { getImageUrl } from '../utils/imageHelper';
import { useSettings } from '../context/SettingsContext';

export default function CategorySidebar({ isOpen, onClose }) {
  const { settings: siteSettings, loading: settingsLoading } = useSettings();
  const [headerConfig, setHeaderConfig] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchMenus();
      fetchHeaderConfig();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const fetchMenus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/menus`, { credentials: 'include' });
      const data = await res.json();
      setMenus(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching menus:", err);
      setLoading(false);
    }
  };

  const fetchHeaderConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/header-settings`, { credentials: 'include' });
      const data = await res.json();
      setHeaderConfig(data);
    } catch (err) {
      console.error("Error fetching header config:", err);
    }
  };

  const toggleExpand = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const menuIcons = [IconSteeringWheel, IconEngine, IconBolt, IconTools, IconCategory];

  const logoUrl = siteSettings?.site_logo || headerConfig?.logoUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-screen w-full sm:w-[380px] bg-white dark:bg-slate-950 z-[110] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-24 h-14 flex items-center justify-center overflow-hidden transition-all duration-300`}>
                  {siteSettings?.site_logo ? (
                    <img 
                      src={`${getImageUrl(siteSettings.site_logo)}?t=${Date.now()}`} 
                      alt={siteSettings?.site_name || "Logo"} 
                      className="h-full w-auto object-contain"
                    />
                  ) : headerConfig?.logoUrl ? (
                    <img 
                      src={`${getImageUrl(headerConfig.logoUrl)}?t=${Date.now()}`} 
                      alt={headerConfig?.logoTitle || "Logo"} 
                      className="h-full w-auto object-contain"
                    />
                  ) : settingsLoading ? (
                    <div className="h-full aspect-square bg-slate-100 animate-pulse rounded-full" />
                  ) : (
                    <span className="text-2xl font-black text-brand-primary tracking-tighter">
                      {siteSettings?.site_name ? siteSettings.site_name.split(' ')[0] : 'MBW'}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter leading-tight">
                    {siteSettings?.site_name || 'MBW LUXURY'}
                  </h2>
                  <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">
                    Performance Archive
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-brand-primary transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Menus List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
              <div className="space-y-1">
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <div key={i} className="h-12 bg-slate-50 dark:bg-slate-900 rounded-xl animate-pulse" />
                  ))
                ) : (
                  menus.filter(m => m.status === 'active').map((menu, idx) => {
                    const hasSubItems = menu.subItems && menu.subItems.length > 0;
                    const isExpanded = expandedMenu === menu.id;
                    const Icon = menuIcons[idx % menuIcons.length];

                    return (
                      <div key={menu.id || idx} className="space-y-1">
                        <div 
                          onClick={() => hasSubItems ? toggleExpand(menu.id) : null}
                          className={`group flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border border-transparent cursor-pointer ${isExpanded ? 'bg-slate-50 dark:bg-slate-900' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            <Icon size={18} className={`transition-colors ${isExpanded ? 'text-brand-primary' : 'text-slate-300 group-hover:text-brand-primary'}`} />
                            {hasSubItems ? (
                              <span className={`text-sm font-bold uppercase tracking-wider transition-colors ${isExpanded ? 'text-brand-primary' : 'text-slate-700 dark:text-slate-300 group-hover:text-brand-primary'}`}>
                                {menu.name}
                              </span>
                            ) : (
                              <Link
                                  to={menu.link || '#'}
                                  onClick={onClose}
                                  className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-brand-primary transition-colors"
                                >
                                  {menu.name}
                                </Link>
                            )}
                          </div>
                          {hasSubItems && (
                            <IconChevronRight 
                              size={14} 
                              className={`text-slate-300 transition-all duration-300 ${isExpanded ? 'rotate-90 text-brand-primary' : 'group-hover:text-brand-primary group-hover:translate-x-1'}`} 
                            />
                          )}
                        </div>

                        {/* Dropdown Content */}
                        <AnimatePresence>
                          {isExpanded && hasSubItems && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-10 pr-4 space-y-1"
                            >
                              {menu.subItems.filter(s => s.status !== 'inactive').map((sub, sIdx) => (
                                <Link
                                  key={sIdx}
                                  to={sub.link || '#'}
                                  onClick={onClose}
                                  className="block py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-primary transition-all border-l border-slate-100 dark:border-slate-800 pl-4 relative group uppercase tracking-widest"
                                >
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0.5 bg-brand-primary/30 group-hover:w-2 transition-all" />
                                  {sub.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Simple Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <button
                 onClick={onClose}
                 className="w-full py-3.5 bg-brand-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-accent transition-all active:scale-95 shadow-lg shadow-brand-primary/10"
              >
                Close Menu
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
