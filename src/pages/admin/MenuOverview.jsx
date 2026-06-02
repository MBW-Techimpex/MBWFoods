import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import { ImageUpload } from "../../components/admin/UploadComponents";
import * as Icons from "@tabler/icons-react";
import {

  IconLayoutNavbar,
  IconLayoutNavbarExpand,
  IconLayoutSidebarLeftCollapse,
  IconArrowRight,
  IconCircleCheck,
  IconEdit,
  IconTrash,
  IconEye,
  IconSettings2,
  IconChevronDown,
  IconFlower,
  IconSearch,
  IconPlus,
  IconGripVertical,
  IconEyeOff,
  IconGift,
  IconConfetti,
  IconMoodSad,
  IconCalendarStar,
  IconCandy,
  IconArrowNarrowRight,
  IconLayoutDashboard,
  IconDeviceFloppy,
  IconRestore,
  IconGridDots,
  IconPoint,
  IconHome,
  IconSmartHome,
  IconBriefcase,
  IconMoodHeart,
  IconSettings,
  IconBox,
  IconShoppingBag,
  IconCalendarEvent,
  IconCar
} from "@tabler/icons-react";

const ICON_MAP = {
  IconLayoutDashboard,
  IconHome,
  IconSmartHome,
  IconBriefcase,
  IconConfetti,
  IconMoodHeart,
  IconSettings,
  IconBox,
  IconShoppingBag,
  IconCalendarEvent,
  IconCar
};

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Reorder, motion, AnimatePresence, useDragControls } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";
import { getImageUrl } from "../../utils/imageHelper";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = `${API_BASE}/api/menus`;

const MenuItemCard = ({
  item,
  handleToggleStatus,
  handleEditMenu,
  handleDeleteMenu,
  handleToggleMegaMenuStatus,
  handleReorderSubCategory,
  handleToggleSubMenuStatus,
  handleEditSubMenu,
  handleDeleteSubMenu,
  handleReorderSubItems,
  handleAddSubMenu
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden relative"
    >
      <div className="flex items-center gap-6 mb-2">
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="text-slate-200 group-hover:text-brand-primary cursor-grab active:cursor-grabbing transition-colors p-2 -m-2"
        >
          <IconGripVertical size={24} />
        </div>

        <div className="flex-1">
          <h4 className="text-lg font-black text-slate-800 tracking-tight">{item.name}</h4>
          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>{item.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleToggleStatus(item)}
            className={cn(
              "w-12 h-12 flex items-center justify-center transition-all rounded-2xl border",
              item.status === 'active'
                ? "text-emerald-500 bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                : "text-slate-300 bg-slate-50 border-slate-100 hover:text-slate-400"
            )}
            title={item.status === 'active' ? 'Hide from Storefront' : 'Show on Storefront'}
          >
            {item.status === 'active' ? <IconEye size={20} /> : <IconEyeOff size={20} />}
          </button>
          <button onClick={() => handleEditMenu(item)} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all bg-slate-50 hover:bg-white hover:shadow-xl rounded-2xl border border-transparent hover:border-violet-100"><IconEdit size={20} /></button>
          <button onClick={() => handleDeleteMenu(item)} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-all bg-slate-50 hover:bg-rose-500 rounded-2xl border border-transparent shadow-sm"><IconTrash size={20} /></button>
        </div>
      </div>

      {/* GENERIC SUBMENU SECTION - NOW FOR EVERY MENU TYPE */}
      <div className="mt-8 ml-20 pl-8 border-l-2 border-dashed border-slate-100 space-y-6 relative">
        <div className="absolute top-0 -left-[5px] w-2 h-2 bg-slate-100 rounded-full" />

        {/* MEGA MENU LAYOUT CONFIG CARD - Only for specific types */}
        {(item.type === "Mega Menu" || item.type === "Dropdown") && (
          <div className="bg-brand-secondary/30 border border-brand-primary/10 rounded-2xl p-5 flex items-center justify-between group/layout animate-fade-in">
            <div className="flex items-center gap-5">
              <div className="w-20 h-14 bg-white rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                {item.featuredImageUrl ? (
                  <img src={item.featuredImageUrl.startsWith('http') ? item.featuredImageUrl : `${API_BASE}${item.featuredImageUrl}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><IconBox size={24} /></div>
                )}
              </div>
              <div>
                <h5 className="text-[10px] font-black text-brand-primary uppercase tracking-[2px] mb-1">Mega Menu Layout</h5>
                <p className="text-xs font-bold text-slate-500">{item.collectionTitle || "The Grace Edit"} • {item.specimenTitle || "Specimen #025"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleMegaMenuStatus(item)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center transition-all rounded-xl border-dashed border-2",
                  !item.hideMegaMenu
                    ? "text-emerald-500 bg-emerald-50/50 border-emerald-200/50 hover:bg-emerald-100/50"
                    : "text-slate-300 bg-slate-50/50 border-slate-200/50 hover:text-slate-400"
                )}
                title={!item.hideMegaMenu ? 'Hide Mega Menu' : 'Show Mega Menu'}
              >
                {!item.hideMegaMenu ? <IconEye size={18} /> : <IconEyeOff size={18} />}
              </button>
              <button onClick={() => handleEditMenu(item)} className="px-4 py-2 bg-white text-brand-primary rounded-xl font-bold text-[10px] uppercase tracking-widest border border-brand-primary/10 shadow-sm hover:shadow-md transition-all group-hover/layout:bg-brand-primary group-hover/layout:text-white">
                CUSTOMIZE BRANDING & IMAGE
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-4 mb-2">Links & Navigation</h5>
          {item.type === 'Mega Menu' ? (
            <>
              <h6 className="text-[9px] font-bold text-slate-400 ml-6 mb-1">Top Categories</h6>
              <Reorder.Group axis="y" values={(item.subItems || []).filter(s => (s.listHeader || 'Top Categories') === 'Top Categories')} onReorder={(newOrder) => handleReorderSubCategory(item.id, 'Top Categories', newOrder)} className="space-y-2 mb-4">
                {(item.subItems || []).filter(s => (s.listHeader || 'Top Categories') === 'Top Categories').map((sub) => (
                  <Reorder.Item
                    key={sub.id}
                    value={sub}
                    className="flex items-center justify-between py-3 px-4 bg-slate-50 hover:bg-brand-secondary/50 rounded-2xl cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-brand-primary/10 group/sub"
                  >
                    <div className="flex items-center gap-3">
                      <IconGridDots size={16} className="text-slate-300 group-hover/sub:text-brand-primary transition-colors" />
                      <span className="text-sm font-bold text-slate-600">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-2 transition-all">
                      <button
                        onClick={() => handleToggleSubMenuStatus(sub)}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-lg transition-all border",
                          sub.status === 'inactive'
                            ? "text-slate-300 bg-slate-50 border-slate-100 hover:text-slate-400"
                            : "text-emerald-500 bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                        )}
                        title={sub.status === 'inactive' ? 'Show on Storefront' : 'Hide from Storefront'}
                      >
                        {sub.status === 'inactive' ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                      </button>
                      <button onClick={() => handleEditSubMenu(sub)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:bg-white rounded-lg transition-all"><IconEdit size={14} /></button>
                      <button onClick={() => handleDeleteSubMenu(sub)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white rounded-lg transition-all"><IconTrash size={14} /></button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              <h6 className="text-[9px] font-bold text-slate-400 ml-6 mb-1">Navigation Links</h6>
              <Reorder.Group axis="y" values={(item.subItems || []).filter(s => s.listHeader === 'Navigation Links')} onReorder={(newOrder) => handleReorderSubCategory(item.id, 'Navigation Links', newOrder)} className="space-y-2">
                {(item.subItems || []).filter(s => s.listHeader === 'Navigation Links').map((sub) => (
                  <Reorder.Item
                    key={sub.id}
                    value={sub}
                    className="flex items-center justify-between py-3 px-4 bg-slate-50 hover:bg-brand-secondary/50 rounded-2xl cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-brand-primary/10 group/sub"
                  >
                    <div className="flex items-center gap-3">
                      <IconGridDots size={16} className="text-slate-300 group-hover/sub:text-brand-primary transition-colors" />
                      <span className="text-sm font-bold text-slate-600">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-2 transition-all">
                      <button
                        onClick={() => handleToggleSubMenuStatus(sub)}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-lg transition-all border",
                          sub.status === 'inactive'
                            ? "text-slate-300 bg-slate-50 border-slate-100 hover:text-slate-400"
                            : "text-emerald-500 bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                        )}
                        title={sub.status === 'inactive' ? 'Show on Storefront' : 'Hide from Storefront'}
                      >
                        {sub.status === 'inactive' ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                      </button>
                      <button onClick={() => handleEditSubMenu(sub)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:bg-white rounded-lg transition-all"><IconEdit size={14} /></button>
                      <button onClick={() => handleDeleteSubMenu(sub)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white rounded-lg transition-all"><IconTrash size={14} /></button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </>
          ) : (
            <Reorder.Group axis="y" values={item.subItems || []} onReorder={(newOrder) => handleReorderSubItems(item.id, newOrder)} className="space-y-2">
              {(item.subItems || []).map((sub) => (
                <Reorder.Item
                  key={sub.id}
                  value={sub}
                  className="flex items-center justify-between py-3 px-4 bg-slate-50 hover:bg-brand-secondary/50 rounded-2xl cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-brand-primary/10 group/sub"
                >
                  <div className="flex items-center gap-3">
                    <IconGridDots size={16} className="text-slate-300 group-hover/sub:text-brand-primary transition-colors" />
                    <span className="text-sm font-bold text-slate-600">{sub.name}</span>
                  </div>
                  <div className="flex items-center gap-2 transition-all">
                    <button
                      onClick={() => handleToggleSubMenuStatus(sub)}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-lg transition-all border",
                        sub.status === 'inactive'
                          ? "text-slate-300 bg-slate-50 border-slate-100 hover:text-slate-400"
                          : "text-emerald-500 bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                      )}
                      title={sub.status === 'inactive' ? 'Show on Storefront' : 'Hide from Storefront'}
                    >
                      {sub.status === 'inactive' ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                    </button>
                    <button onClick={() => handleEditSubMenu(sub)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:bg-white rounded-lg transition-all"><IconEdit size={14} /></button>
                    <button onClick={() => handleDeleteSubMenu(sub)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white rounded-lg transition-all"><IconTrash size={14} /></button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}

          <button onClick={() => handleAddSubMenu(item)} className="flex items-center gap-2 mx-4 mt-6 text-[10px] font-black text-brand-primary/60 hover:text-brand-primary uppercase tracking-[2px] transition-all">
            <IconPlus size={14} />
            Add New Link
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
};

const MenuOverview = () => {
  const [menus, setMenus] = useState([]);
  const [originalMenus, setOriginalMenus] = useState([]);
  const [hasChanged, setHasChanged] = useState(false);
  const { showNotification } = useNotification();
  const [headerConfig, setHeaderConfig] = useState({
    logoUrl: null,
    logoTitle: 'MBW CAR ACCESSORIES',
    logoSubtitle: 'Performance Studio',
    searchPlaceholder: 'Search for lighting, chrome, or interior kits...',
    accountTopText: 'Hello, Sign In',
    accountBottomText: 'My Account',
    homeIconName: 'IconLayoutDashboard',
    homeLink: '/',
    showHeader: true
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState(""); // 'editMenu', 'editSub', 'addSub', 'deleteMenu', 'deleteSub'
  const [currentItem, setCurrentItem] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [inputLinkValue, setInputLinkValue] = useState("");
  const [inputListHeaderValue, setInputListHeaderValue] = useState("Top Categories");

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch(API_URL, { credentials: 'include' });
      const data = await res.json();

      const menusWithSubs = Array.isArray(data) ? data.map(m => ({
        ...m,
        subItems: m.subItems || []
      })) : [];

      setMenus(menusWithSubs);
      setOriginalMenus(JSON.parse(JSON.stringify(menusWithSubs)));

      // Fetch config
      const configRes = await fetch(`${API_URL}/config`, { credentials: 'include' });
      const configData = await configRes.json();
      if (configData) {
        setHeaderConfig(prev => ({
          ...prev,
          ...configData
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorderMenus = (newOrder) => {
    setMenus(newOrder);
    setHasChanged(true);
  };

  const handleReorderSubItems = (parentId, newSubOrder) => {
    setMenus(prev => prev.map(m =>
      m.id === parentId ? { ...m, subItems: newSubOrder } : m
    ));
    setHasChanged(true);
  };

  const handleReorderSubCategory = (parentId, category, newCategoryOrder) => {
    setMenus(prev => prev.map(m => {
      if (m.id === parentId) {
         const otherItems = (m.subItems || []).filter(s => (s.listHeader || 'Top Categories') !== category);
         return { ...m, subItems: [...otherItems, ...newCategoryOrder] };
      }
      return m;
    }));
    setHasChanged(true);
  };

  const handleSave = async () => {
    try {
      // 1. Save Menu Order
      const orderedIds = menus.map(m => m.id);
      await fetch(`${API_URL}/reorder`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });

      // 2. Save Submenu Orders
      for (const menu of menus) {
        if (menu.subItems && menu.subItems.length > 0) {
          const orderedIds = menu.subItems.map(s => s.id);
          await fetch(`${API_URL}/${menu.id}/submenus/reorder`, {
            credentials: 'include',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderedIds })
          });
        }
      }

      // 3. Save Header Config (The Toggle, Logo, etc.)
      await fetch(`${API_URL}/config`, {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(headerConfig)
      });

      setHasChanged(false);
      setOriginalMenus(JSON.parse(JSON.stringify(menus)));
      showNotification("All changes saved successfully!", "success");
    } catch (error) {
      console.error(error);
      showNotification("Save failed. Please try again.", "error");
    }
  };

  const handleReset = () => {
    setMenus(JSON.parse(JSON.stringify(originalMenus)));
    setHasChanged(false);
  };

  const handleDeleteMenu = (item) => {
    setModalTitle("Confirm Deletion");
    setModalType("deleteMenu");
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteSubMenu = (subItem) => {
    setModalTitle("Confirm Deletion");
    setModalType("deleteSub");
    setCurrentItem(subItem);
    setIsModalOpen(true);
  };

  const handleEditMenu = (item) => {
    setModalTitle("Edit Menu");
    setModalType("editMenu");
    setCurrentItem(item);
    setInputValue(item.name);
    setInputLinkValue(item.link || "");
    setIsModalOpen(true);
  };

  const handleEditSubMenu = (subItem) => {
    setModalTitle("Edit Submenu");
    setModalType("editSub");
    setCurrentItem(subItem);
    setInputValue(subItem.name);
    setInputLinkValue(subItem.link || "");
    setInputListHeaderValue(subItem.listHeader || "Top Categories");
    setIsModalOpen(true);
  };

  const handleAddSubMenu = (menuItem) => {
    setModalTitle(`Add Link in ${menuItem.name}`);
    setModalType("addSub");
    setCurrentItem(menuItem);
    setInputValue("");
    setInputLinkValue("");
    setInputListHeaderValue("Top Categories");
    setIsModalOpen(true);
  };

  const handleAddMainMenu = () => {
    setModalTitle("Add New Category");
    setModalType("addMenu");
    setCurrentItem({ type: 'Main Link', status: 'active', sub_items: [], position: menus.length });
    setInputValue("");
    setInputLinkValue("");
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`${API_URL}/${item.id}`, {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          status: newStatus
        })
      });
      showNotification("Status updated successfully!", "success");
      fetchMenus();
    } catch (e) {
      console.error(e);
      showNotification("Failed to toggle status.", "error");
    }
  };

  const handleToggleSubMenuStatus = async (subItem) => {
    const newStatus = subItem.status === 'inactive' ? 'active' : 'inactive';
    try {
      await fetch(`${API_URL}/submenus/${subItem.id}`, {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...subItem,
          status: newStatus
        })
      });
      showNotification("Status updated successfully!", "success");
      fetchMenus();
    } catch (e) {
      console.error(e);
      showNotification("Failed to toggle status.", "error");
    }
  };

  const handleToggleMegaMenuStatus = async (item) => {
    const newHideStatus = !item.hideMegaMenu;
    try {
      await fetch(`${API_URL}/${item.id}`, {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          hideMegaMenu: newHideStatus
        })
      });
      showNotification(`Mega Menu ${newHideStatus ? 'hidden' : 'visible'}.`, "success");
      fetchMenus();
    } catch (e) {
      console.error(e);
      showNotification("Failed to toggle mega menu visibility.", "error");
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType !== "deleteMenu" && modalType !== "deleteSub") {
        if (!inputValue || inputValue.trim() === "") return;
      }

      if (modalType === "editMenu") {
        await fetch(`${API_URL}/${currentItem.id}`, {
          credentials: 'include',
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: inputValue.trim(),
            link: inputLinkValue.trim(),
            type: currentItem.type,
            status: currentItem.status,
            position: currentItem.position,
            collectionTitle: currentItem.collectionTitle,
            collectionSubtitle: currentItem.collectionSubtitle,
            collectionDescription: currentItem.collectionDescription,
            collectionBadgeText: currentItem.collectionBadgeText,
            megaMenuTitle: currentItem.megaMenuTitle,
            featuredImageUrl: currentItem.featuredImageUrl,
            specimenId: currentItem.specimenId,
            specimenTitle: currentItem.specimenTitle,
            hideMegaMenu: currentItem.hideMegaMenu
          })
        });
        showNotification("Menu updated successfully.", "success");
      } else if (modalType === "editSub") {
        const parentMenu = menus.find(m => m.id === currentItem.menuId);
        if (parentMenu && (currentItem.listHeader || 'Top Categories') !== inputListHeaderValue) {
          const count = (parentMenu.subItems || []).filter(s => (s.listHeader || 'Top Categories') === inputListHeaderValue).length;
          if (count >= 10) {
            showNotification(`Maximum 10 submenus allowed in "${inputListHeaderValue}".`, "error");
            return;
          }
        }

        const res = await fetch(`${API_URL}/submenus/${currentItem.id}`, {
          credentials: 'include',
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: inputValue.trim(),
            link: inputLinkValue.trim(),
            position: currentItem.position,
            listHeader: inputListHeaderValue
          })
        });
        if (!res.ok) {
          const errorData = await res.json();
          showNotification(errorData.message || "Failed to update submenu.", "error");
          return;
        }
        showNotification("Submenu updated successfully.", "success");
      } else if (modalType === "addSub") {
        const count = (currentItem.subItems || []).filter(s => (s.listHeader || 'Top Categories') === inputListHeaderValue).length;
        if (count >= 10) {
          showNotification(`Maximum 10 submenus allowed in "${inputListHeaderValue}".`, "error");
          return;
        }

        const res = await fetch(`${API_URL}/${currentItem.id}/submenus`, {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: inputValue.trim(),
            link: inputLinkValue.trim(),
            listHeader: inputListHeaderValue
          })
        });
        if (!res.ok) {
          const errorData = await res.json();
          showNotification(errorData.message || "Failed to add submenu.", "error");
          return;
        }
        showNotification("New link added successfully.", "success");
      } else if (modalType === "addMenu") {
        await fetch(API_URL, {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: inputValue.trim(),
            link: inputLinkValue.trim(),
            type: currentItem.type,
            status: 'active',
            position: menus.length
          })
        });
        showNotification("New menu category added successfully.", "success");
      } else if (modalType === "deleteMenu") {
        const res = await fetch(`${API_URL}/${currentItem.id}`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) throw new Error("Failed to delete menu");
        showNotification("Menu link deleted successfully.", "success");
      } else if (modalType === "deleteSub") {
        const res = await fetch(`${API_URL}/submenus/${currentItem.id}`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) throw new Error("Failed to delete submenu");
        showNotification("Submenu item deleted successfully.", "success");
      }
      setIsModalOpen(false);
      fetchMenus();
    } catch (e) {
      console.error(e);
      showNotification("Update failed. Please try again.", "error");
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size - if it's way too large, we might still fail or lose too much quality
    if (file.size > 5 * 1024 * 1024) { // 5MB limit for original
      showNotification("File is too large (max 5MB for original). Please choose a smaller image.", "error");
      return;
    }

    showNotification("Compressing and uploading logo...", "info");

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        credentials: 'include',
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      console.log('Upload response data:', data);
      
      if (res.status === 413) {
          showNotification("File is too large for the server to process.", "error");
          return;
      }

      if (data.imageUrl) {
        const newConfig = { ...headerConfig, logoUrl: data.imageUrl };
        await fetch(`${API_URL}/config`, {
          credentials: 'include',
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig)
        });
        setHeaderConfig(newConfig);
        showNotification(`Logo uploaded and compressed to ${data.size} KB!`, "success");
      } else {
        showNotification(data.error || "Failed to upload image.", "error");
      }
    } catch (e) {
      console.error(e);
      showNotification("Failed to upload image.", "error");
    }
  };

  const updateHeaderConfigField = async () => {
    try {
      await fetch(`${API_URL}/config`, {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(headerConfig)
      });
      showNotification("All header settings saved successfully.", "success");
    } catch (e) {
      showNotification("Failed to update settings.", "error");
    }
  };

  const HomeIcon = ICON_MAP[headerConfig.homeIconName] || ICON_MAP.IconLayoutDashboard;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">
        {/* Global Settings Section */}
        <div className="mb-12 space-y-8">
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Global Header</h2>
              <p className="text-slate-400 font-bold mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                Branding, Search and Icon Settings
              </p>
            </div>
            <button
              onClick={handleSave}
              className="h-12 px-8 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary transition-all shadow-xl shadow-slate-200 flex items-center gap-3 active:scale-95 group"
            >
              <IconDeviceFloppy size={20} className="group-hover:rotate-12 transition-transform" />
              Save All Changes
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Branding Identity */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="w-12 h-12 bg-brand-secondary rounded-2xl flex items-center justify-center text-brand-primary group-hover/card:scale-110 transition-transform">
                  <IconSettings2 size={24} stroke={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Identity Hub</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Narrative</p>
                </div>
              </div>

              <div className="space-y-6">
                <ImageUpload 
                  label="Header Brand Logo"
                  currentUrl={headerConfig.logoUrl}
                  showNotification={showNotification}
                  recSize="Horizontal"
                  onUpload={async (url) => {
                    const newConfig = { ...headerConfig, logoUrl: url };
                    try {
                      await fetch(`${API_URL}/config`, {
                        credentials: 'include',
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newConfig)
                      });
                      setHeaderConfig(newConfig);
                      showNotification("Logo updated successfully!", "success");
                    } catch (e) {
                      showNotification("Failed to update config.", "error");
                    }
                  }}
                />

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Brand Designation</label>
                    <input 
                      type="text" 
                      value={headerConfig.siteTitle || ''} 
                      onChange={(e) => setHeaderConfig({ ...headerConfig, siteTitle: e.target.value })}
                      className="w-full h-11 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white transition-colors"
                      placeholder="e.g. MBW LUXURY"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identity Tagline</label>
                    <input 
                      type="text" 
                      value={headerConfig.siteSubtitle || ''} 
                      onChange={(e) => setHeaderConfig({ ...headerConfig, siteSubtitle: e.target.value })}
                      className="w-full h-11 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white transition-colors"
                      placeholder="e.g. PERFORMANCE DIV."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Home Icon Selector */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover/card:scale-110 transition-transform">
                  <IconLayoutDashboard size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Home Interface</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navigation Style</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Home Icon</label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.keys(ICON_MAP).map(iconName => {
                      const IconComp = ICON_MAP[iconName];
                      return (
                        <button
                          key={iconName}
                          onClick={() => setHeaderConfig({ ...headerConfig, homeIconName: iconName })}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            headerConfig.homeIconName === iconName ? "bg-brand-primary text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100 font-bold"
                          )}
                        >
                          <IconComp size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Home Destination URL</label>
                  <input
                    type="text"
                    value={headerConfig.homeLink}
                    onChange={(e) => setHeaderConfig({ ...headerConfig, homeLink: e.target.value })}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover/card:scale-110 transition-transform">
                  <IconMoodHeart size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">User Experience</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interface Labels</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Search Placeholder</label>
                  <input
                    type="text"
                    value={headerConfig.searchPlaceholder}
                    onChange={(e) => setHeaderConfig({ ...headerConfig, searchPlaceholder: e.target.value })}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Greeting Text</label>
                  <input
                    type="text"
                    value={headerConfig.accountTopText}
                    onChange={(e) => setHeaderConfig({ ...headerConfig, accountTopText: e.target.value })}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account Label</label>
                  <input
                    type="text"
                    value={headerConfig.accountBottomText}
                    onChange={(e) => setHeaderConfig({ ...headerConfig, accountBottomText: e.target.value })}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Header Visibility Master Toggle */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group/card">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  headerConfig.showHeader !== false ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                )}>
                  {headerConfig.showHeader !== false ? <IconEye size={24} /> : <IconEyeOff size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Master Visibility</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Header Switch</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Header Status</span>
                    <button
                      onClick={async () => {
                        const newStatus = headerConfig.showHeader === false;
                        const newConfig = { ...headerConfig, showHeader: newStatus };
                        setHeaderConfig(newConfig);
                        
                        // Save immediately
                        try {
                          await fetch(`${API_URL}/config`, {
                            credentials: 'include',
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newConfig)
                          });
                          showNotification(`Header is now ${newStatus ? 'Active' : 'Inactive'}`, "success");
                        } catch (e) {
                          showNotification("Failed to save visibility status", "error");
                        }
                      }}
                      className={cn(
                        "w-16 h-8 rounded-full relative transition-all duration-300 shadow-inner",
                        headerConfig.showHeader !== false ? "bg-emerald-500" : "bg-slate-300"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md",
                        headerConfig.showHeader !== false ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">
                    {headerConfig.showHeader !== false 
                      ? "The website header is currently visible to all visitors." 
                      : "The header is hidden. Use this only during maintenance or layout changes."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Simulation Section */}
        <div className={cn(
          "mb-16 text-center animate-fade-in transition-opacity duration-500",
          headerConfig.showHeader === false && "opacity-40"
        )}>
          <h1 className="text-4xl font-black text-slate-900 font-serif mb-3 tracking-tight">Header Manager</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Organize your shop's navigation menu. Drag cards or inner links to change their positions.
          </p>
        </div>

        {/* TOP SECTION: Live Simulation Header */}
        <div className={cn(
          "mb-16 animate-fade-up relative z-50 transition-all duration-500",
          headerConfig.showHeader === false && "grayscale opacity-50 blur-[2px] pointer-events-none"
        )}>
          <div className="bg-slate-950 rounded-[3rem] p-1 shadow-2xl relative group overflow-visible">
            <div className="bg-white rounded-[2.9rem] p-12 border border-white/20 overflow-visible">
              {/* STOREFRONT SIMULATION: TOP ROW */}
              <div className="flex items-center justify-between mb-6 px-4">
                {/* Logo Placeholder */}
                <div
                  className="flex border p-2 rounded-lg border-slate-50 items-center gap-3 group/logo"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded flex items-center justify-center group-hover/logo:bg-white shadow-sm transition-colors overflow-hidden">
                    {headerConfig.logoUrl ? (
                      <img src={getImageUrl(headerConfig.logoUrl)} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <IconCar size={28} className="text-brand-primary" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-slate-800 leading-tight uppercase tracking-tighter">{headerConfig.logoTitle}</div>
                    <div className="text-[8px] font-medium text-slate-400 uppercase tracking-[0.2em]">{headerConfig.logoSubtitle}</div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl mx-12">
                  <div className="relative cursor-pointer group/search" onClick={() => handleEditConfig('search')}>
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover/search:text-brand-primary transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder={headerConfig.searchPlaceholder}
                      className="w-full h-12 pl-12 pr-6 bg-slate-50/50 border border-slate-100 rounded-full text-sm font-medium text-slate-600 focus:outline-none ring-offset-2 transition-all shadow-inner cursor-pointer group-hover/search:bg-white"
                      disabled
                    />
                  </div>
                </div>

                {/* Account & Action Icons */}
                <div className="flex items-center gap-8">
                  <div className="text-right hidden xl:block cursor-pointer group/account" onClick={() => handleEditConfig('account')}>
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1 group-hover/account:text-brand-primary transition-colors">{headerConfig.accountTopText}</div>
                    <div className="text-sm font-black text-slate-800">{headerConfig.accountBottomText}</div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="relative group/icon cursor-pointer">
                      <div className="w-10 h-10 flex items-center justify-center text-slate-400 group-hover/icon:text-brand-primary transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                      </div>
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">0</span>
                    </div>
                    <div className="relative group/icon cursor-pointer">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover/icon:bg-brand-primary transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                      </div>
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">0</span>
                    </div>
                  </div>
                </div>
              </div>

              <nav className="h-16 px-6 flex items-center border-t border-slate-50 bg-white relative overflow-visible">
                <div className="flex items-center gap-10">
                  {/* Home Icon */}
                  <div
                    title={`Home Link: ${headerConfig.homeLink}`}
                    className="p-2.5 bg-slate-50 rounded-xl text-slate-400 shadow-sm"
                  >
                    <HomeIcon size={18} />
                  </div>

                  {/* Dynamic Nav Items */}
                  {menus.map((menu) => (
                    <div key={menu.id} className="relative group/menu">
                      <a 
                        href={menu.link || "#"}
                        className={cn(
                          "flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.15em] transition-all py-6 whitespace-nowrap",
                          menu.status === 'inactive' ? "opacity-30" : "text-slate-500 hover:text-brand-primary"
                        )}
                      >
                        {menu.name}
                        {(menu.type === "Mega Menu" || menu.type === "Dropdown") && (
                          <IconChevronDown size={14} className="group-hover/menu:rotate-180 transition-all opacity-40 ml-1" />
                        )}
                      </a>

                      {/* Style 1: Mega Menu */}
                      {menu.type === "Mega Menu" && !menu.hideMegaMenu && (
                        <div className="absolute top-full left-0 pt-0 hidden group-hover/menu:block z-[999] animate-fade-in shadow-2xl">
                          <div className="w-[600px] bg-white border border-slate-100 rounded-[2.5rem] p-8 ring-1 ring-slate-100 mt-2 flex gap-8">
                            <div className="flex-1 space-y-4">
                              <div className="px-4 py-2 text-[10px] font-black text-brand-primary uppercase tracking-widest border-b border-slate-50 mb-2">
                                {menu.megaMenuTitle || `${menu.name} Collection`}
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {(menu.subItems || []).map((sub) => (
                                  <a key={sub.id} href={sub.link || "#"} className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-brand-secondary text-xs font-bold text-slate-600 transition-all group/item">
                                    <span>{sub.name}</span>
                                    <IconArrowNarrowRight size={14} className="text-brand-primary opacity-0 group-hover/item:opacity-100 transition-all" />
                                  </a>
                                ))}
                              </div>
                            </div>
                            <div className="w-48 bg-slate-50 rounded-3xl overflow-hidden relative group/feat">
                               {menu.featuredImageUrl ? (
                                 <img src={getImageUrl(menu.featuredImageUrl)} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-200"><IconBox size={40} /></div>
                               )}
                               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                                  <p className="text-[8px] font-black text-white/70 uppercase tracking-widest mb-1">{menu.collectionBadgeText || "Special Edition"}</p>
                                  <p className="text-[10px] font-black text-white leading-tight uppercase">{menu.specimenTitle || "The Edit"}</p>
                               </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Style 2: Dropdown */}
                      {menu.type === "Dropdown" && (
                        <div className="absolute top-full left-0 pt-0 hidden group-hover/menu:block z-[999] animate-fade-in shadow-2xl">
                          <div className="w-64 bg-white border border-slate-100 rounded-3xl p-4 ring-1 ring-slate-100 mt-2">
                             <div className="space-y-1">
                                {(menu.subItems || []).map((sub) => (
                                  <a key={sub.id} href={sub.link || "#"} className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-brand-secondary text-sm font-bold text-slate-600 transition-all group/item">
                                    <span>{sub.name}</span>
                                    <IconArrowNarrowRight size={16} className="text-brand-primary opacity-0 group-hover/item:opacity-100 transition-all" />
                                  </a>
                                ))}
                             </div>
                          </div>
                        </div>
                      )}

                      {/* Style 3: Simple (No Dropdown - already handled by just showing the link) */}
                    </div>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Nested Drag & Drop Manager */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-[10px] font-black text-brand-primary uppercase tracking-[4px]">Header Editor</h2>
              <button
                onClick={handleAddMainMenu}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
              >
                <IconPlus size={14} />
                Add New Main Menu
              </button>
            </div>

            {hasChanged && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3">
                <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 text-slate-400 hover:text-slate-600 font-bold text-xs transition-colors">
                  <IconRestore size={18} />
                  Discard
                </button>
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">
                  <IconDeviceFloppy size={18} />
                  Save Changes
                </button>
              </motion.div>
            )}
          </div>

          <Reorder.Group axis="y" values={menus} onReorder={handleReorderMenus} className="space-y-4">
            {menus.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                handleToggleStatus={handleToggleStatus}
                handleEditMenu={handleEditMenu}
                handleDeleteMenu={handleDeleteMenu}
                handleToggleMegaMenuStatus={handleToggleMegaMenuStatus}
                handleReorderSubCategory={handleReorderSubCategory}
                handleToggleSubMenuStatus={handleToggleSubMenuStatus}
                handleEditSubMenu={handleEditSubMenu}
                handleDeleteSubMenu={handleDeleteSubMenu}
                handleReorderSubItems={handleReorderSubItems}
                handleAddSubMenu={handleAddSubMenu}
              />
            ))}
          </Reorder.Group>
        </div>
      </div>

      {/* Modal for Edit/Add */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        footer={
          <div className="flex gap-5 w-full">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 h-16 bg-white text-slate-400 font-black text-xs uppercase tracking-[0.2em] rounded-3xl hover:bg-slate-50 transition-all border-2 border-slate-100 hover:border-slate-200 active:scale-95"
            >
              Discard Changes
            </button>
            <button
              form="modal-form"
              type="submit"
              className={cn(
                "flex-1 h-16 text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-2xl transition-all transform active:scale-95",
                (modalType === 'deleteMenu' || modalType === 'deleteSub')
                  ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-200"
                  : "bg-gradient-to-r from-brand-primary to-slate-900 shadow-brand-primary/20"
              )}
            >
              {(modalType === 'deleteMenu' || modalType === 'deleteSub') ? 'Confirm Deletion' : 'Commit Changes'}
            </button>
          </div>
        }
      >
        <form id="modal-form" onSubmit={handleModalSubmit} className="space-y-4">
          {(modalType === 'deleteMenu' || modalType === 'deleteSub') ? (
            <div className="text-center space-y-3 py-2">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-bloom-pulse">
                <IconTrash size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800">Final Confirmation</h3>
                <p className="text-slate-500 text-xs font-medium">
                  Are you absolutely sure you want to delete <span className="text-rose-600 font-bold">"{currentItem?.name}"</span>? This action is permanent.
                </p>
              </div>
            </div>
          ) : modalType === 'editConfig' ? (
            <>
              {currentItem?.subType === 'logo' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-1">Main Brand Title</label>
                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold text-slate-800 text-sm" autoFocus />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-1">Tagline / Subshoppe</label>
                    <input type="text" value={inputLinkValue} onChange={(e) => setInputLinkValue(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold text-slate-800 text-sm" />
                  </div>
                </>
              )}
              {currentItem?.subType === 'search' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-1">Search Box Placeholder</label>
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold text-slate-800 text-sm" autoFocus />
                </div>
              )}
              {currentItem?.subType === 'account' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-1">Greeting Text</label>
                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold text-slate-800 text-sm" autoFocus />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-1">Account Label</label>
                    <input type="text" value={inputLinkValue} onChange={(e) => setInputLinkValue(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold text-slate-800 text-sm" />
                  </div>
                </>
              )}
              {currentItem?.subType === 'home' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-1">Home Destination URL</label>
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold text-slate-800 text-sm" autoFocus />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-1">
                  Menu Name
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter name..."
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold text-slate-800 text-sm"
                  autoFocus
                />
              </div>

              {(modalType === 'addMenu' || modalType === 'editMenu') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-1">
                    Display Order (Position)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentItem?.position !== undefined ? currentItem.position : ""}
                    onChange={(e) => setCurrentItem({ ...currentItem, position: parseInt(e.target.value) || 0 })}
                    placeholder="Enter display order (e.g. 0, 1, 2, 3...)"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold text-slate-800 text-sm"
                  />
                  <p className="text-[9px] text-slate-400 font-medium px-1 leading-relaxed">
                    Set a custom position number. Lower numbers display first (e.g. 0 displays before 1).
                  </p>
                </div>
              )}

              {(modalType === 'addMenu' || modalType === 'editMenu') && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] px-1">Menu Design Architecture</label>
                  <div className="bg-slate-50 p-1.5 rounded-[2rem] border border-slate-100 grid grid-cols-3 gap-1.5">
                  {[
                    { key: 'Main Link', label: 'Simple Link', icon: <Icons.IconArrowRight size={18} /> },
                    { key: 'Mega Menu', label: 'Mega Menu', icon: <Icons.IconLayoutNavbar size={18} /> },
                    { key: 'Dropdown', label: 'Simple Dropdown', icon: <Icons.IconLayoutNavbarExpand size={18} /> }
                  ].map((style) => (
                    <button
                      key={style.key}
                      type="button"
                      onClick={() => setCurrentItem({ ...currentItem, type: style.key })}
                      className={cn(
                        "py-3.5 px-2 rounded-[1.6rem] transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group",
                        currentItem.type === style.key
                          ? "bg-white text-brand-primary shadow-xl shadow-slate-200/50 scale-[1.02] ring-1 ring-slate-100"
                          : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                      )}
                    >
                      <div className={cn(
                         "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                         currentItem.type === style.key 
                           ? "bg-brand-primary text-white rotate-[360deg] shadow-lg shadow-brand-primary/20" 
                           : "bg-slate-100 group-hover:bg-white shadow-sm"
                      )}>
                        {style.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{style.label}</span>
                      
                      {currentItem.type === style.key && (
                         <motion.div 
                           layoutId="active-pill"
                           className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-brand-primary rounded-t-full"
                         />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              )}

              {(modalType === 'addSub' || modalType === 'editSub') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-1">Column Category</label>
                  <select
                    value={inputListHeaderValue}
                    onChange={(e) => setInputListHeaderValue(e.target.value)}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold text-slate-800 text-sm"
                  >
                    <option value="Top Categories">Top Categories</option>
                    <option value="Navigation Links">Navigation Links</option>
                  </select>
                </div>
              )}

              {currentItem?.type === 'Mega Menu' && (
                <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-5 bg-brand-secondary/30 rounded-3xl border border-brand-primary/10">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                      <IconSettings size={14} />
                      Mega Menu Configuration
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Col. Title</label>
                        <input type="text" value={currentItem?.collectionTitle || ''} onChange={(e) => setCurrentItem({ ...currentItem, collectionTitle: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-brand-primary/10 transition-all" placeholder="The Grace Edit" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Col. Subtitle</label>
                        <input type="text" value={currentItem?.collectionSubtitle || ''} onChange={(e) => setCurrentItem({ ...currentItem, collectionSubtitle: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-brand-primary/10 transition-all" placeholder="Collection 025" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Col. Description</label>
                        <input type="text" value={currentItem?.collectionDescription || ''} onChange={(e) => setCurrentItem({ ...currentItem, collectionDescription: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-brand-primary/10 transition-all" placeholder="Curated by Master Florists..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Badge Text</label>
                        <input type="text" value={currentItem?.collectionBadgeText || ''} onChange={(e) => setCurrentItem({ ...currentItem, collectionBadgeText: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-brand-primary/10 transition-all" placeholder="STUDIO AUTHORIZED" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">List Header</label>
                        <input type="text" value={currentItem?.megaMenuTitle || ''} onChange={(e) => setCurrentItem({ ...currentItem, megaMenuTitle: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-brand-primary/10 transition-all" placeholder="SYMPATHY FLOWERS" />
                      </div>
                      <div className="col-span-2 space-y-1 pt-1">
                      <div className="col-span-2 space-y-1 pt-1">
                        <ImageUpload 
                          label="Featured Layout Image"
                          currentUrl={currentItem?.featuredImageUrl}
                          showNotification={showNotification}
                          recSize="800x400px (Max 2MB)"
                          onUpload={(url) => {
                            setCurrentItem({ ...currentItem, featuredImageUrl: url });
                          }}
                        />
                      </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Specimen ID</label>
                        <input type="text" value={currentItem?.specimenId || ''} onChange={(e) => setCurrentItem({ ...currentItem, specimenId: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-brand-primary/10 transition-all" placeholder="#025" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Specimen Title</label>
                        <input type="text" value={currentItem?.specimenTitle || ''} onChange={(e) => setCurrentItem({ ...currentItem, specimenTitle: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-brand-primary/10 transition-all" placeholder="The Seasonal Signature" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-1">
                  Destination Link
                </label>
                <input
                  type="text"
                  value={inputLinkValue}
                  onChange={(e) => setInputLinkValue(e.target.value)}
                  placeholder="e.g. /roses or https://..."
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold text-slate-800 text-sm"
                />
              </div>
            </>
          )}
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default MenuOverview;



