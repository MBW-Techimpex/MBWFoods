import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconCar,
  IconShoppingBag,
  IconUsers,
  IconSettings,
  IconLogout,
  IconLayoutGrid,
  IconBrush,
  IconChevronRight,
  IconChevronDown,
  IconPhoto,
  IconFiles,
  IconMail,
  IconStar,
  IconQuestionMark,
  IconClock,
  IconSection,
  IconVideo,
  IconGlobe,
  IconCurrencyDollar,
  IconPlus,
  IconShieldLock,
  IconHistory,
  IconCircleCheck,
  IconTicket
} from "@tabler/icons-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

const AdminSidebar = () => {
  const location = useLocation();
  const { admin, logout } = useAuth();

  const menuItems = [
    {
      group: "General",
      items: [
        { key: 'dashboard', label: "Dashboard", icon: IconLayoutDashboard, path: "/admin" },
        {
          label: "Home Page",
          icon: IconSection,
          children: [
            { key: 'admin_header', label: "Header", icon: IconBrush, path: "/admin/header" },
            { key: 'admin_banners', label: "Main Banner", icon: IconPhoto, path: "/admin/banners" },
            { key: 'admin_benefits', label: "Why Choose Us", icon: IconStar, path: "/admin/benefits" },
            { key: 'admin_categories', label: "Categories", icon: IconLayoutGrid, path: "/admin/categories" },
            { key: 'admin_signature', label: "Signature Components", icon: IconCar, path: "/admin/signature" },
            { key: 'admin_home_sections', label: "Manage Sections", icon: IconSection, path: "/admin/home-sections" },
            { key: 'admin_faqs', label: "FAQs", icon: IconQuestionMark, path: "/admin/faqs" },
            { key: 'admin_testimonials', label: "Testimonials", icon: IconStar, path: "/admin/testimonials" },
            { key: 'admin_video_journey', label: "Video Journey", icon: IconVideo, path: "/admin/video-journey" },
            { key: 'admin_newsletter', label: "Newsletter", icon: IconMail, path: "/admin/newsletter" },
            { key: 'admin_atelier', label: "Showroom Info", icon: IconClock, path: "/admin/atelier" },
            { key: 'admin_footer', label: "Footer", icon: IconBrush, path: "/admin/footer" },
          ]
        },
        { key: 'dynamic_pages', label: "Dynamic Pages", icon: IconFiles, path: "/admin/pages" },
        // {
        //   label: "Funeral Delivery",
        //   icon: IconStar,
        //   children: [
        //     { key: 'admin_funeral_content', label: "Page Content", icon: IconBrush, path: "/admin/funeral-content" },
        //     { key: 'admin_funeral_facilities', label: "Delivery Areas", icon: IconLayoutGrid, path: "/admin/funeral-facilities" },
        //   ]
        // },
        // {
        //   label: "Hospital Delivery",
        //   icon: IconClock,
        //   children: [
        //     { key: 'admin_hospital_content', label: "Page Content", icon: IconBrush, path: "/admin/hospital-content" },
        //     { key: 'admin_hospital_facilities', label: "Delivery Areas", icon: IconLayoutGrid, path: "/admin/hospital-facilities" },
        //   ]
        // },
        // {
        //   label: "Logistics Hub",
        //   icon: IconGlobe,
        //   children: [
        //     { key: 'admin_delivery_content', label: "Page Content", icon: IconBrush, path: "/admin/delivery-content" },
        //     { key: 'admin_delivery_areas', label: "Delivery Regions", icon: IconLayoutGrid, path: "/admin/delivery-areas" },
        //   ]
        // },


        { key: 'media_library', label: "Media Library", icon: IconPhoto, path: "/admin/media" },
        { key: 'admin_subscription_plans', label: "Subscription Plans", icon: IconSection, path: "/admin/subscription-plans" },
      ]
    },
    {
      group: "Shop Management",
      items: [
        { key: 'admin_products', label: "Products", icon: IconCar, path: "/admin/products" },
        { key: 'admin_inventory', label: "Inventory", icon: IconLayoutGrid, path: "/admin/inventory" },
        { key: 'admin_orders', label: "Orders", icon: IconShoppingBag, path: "/admin/orders" },
        { key: 'admin_orders', label: "Subscription Orders", icon: IconCircleCheck, path: "/admin/subscription-orders" },
        { key: 'admin_discounts', label: "Discounts", icon: IconTicket, path: "/admin/discounts" },
        { key: 'admin_customers', label: "Customers", icon: IconUsers, path: "/admin/customers" },
      ]
    },
    {
      group: "Configuration",
      items: [
        { key: 'email_templates', label: "Email Templates", icon: IconMail, path: "/admin/email-templates" },
        {
          label: "Settings",
          icon: IconSettings,
          children: [
            { key: 'settings_general', label: "General", icon: IconGlobe, path: "/admin/settings?tab=general" },
            { key: 'settings_business', label: "Business", icon: IconCurrencyDollar, path: "/admin/settings?tab=business" },
            { key: 'settings_staff', label: "Add Staff", icon: IconPlus, path: "/admin/settings?tab=staff" },
            { key: 'settings_mail', label: "Mail Credentials", icon: IconMail, path: "/admin/settings?tab=mail" },
            { key: 'settings_privileges', label: "User Privileges", icon: IconShieldLock, path: "/admin/settings?tab=privileges" },
            { key: 'activities_log', label: "Activities Log", icon: IconHistory, path: "/admin/settings?tab=logs" },
          ]
        },
      ]
    },
  ];

  // Initialize openSubmenus based on active path
  const [openSubmenus, setOpenSubmenus] = useState(() => {
    const initial = {};
    menuItems.forEach(group => {
      group.items.forEach(item => {
        if (item.children) {
          const isActive = item.children.some(child => location.pathname === child.path || (location.pathname + location.search) === child.path);
          if (isActive) {
            initial[item.label] = true;
          }
        }
      });
    });
    return initial;
  });



  // Filtering Logic (Creating fresh clones to avoid mutation)
  const filterItems = (items) => {
    if (!items) return [];

    // Normalize user permissions for case-insensitive matching
    const userPerms = Array.isArray(admin?.permissions)
      ? admin.permissions.map(p => String(p).toLowerCase())
      : [];

    return items.map(item => {
      const clonedItem = { ...item };

      // Case 1: Item has children (Recursion)
      if (clonedItem.children && clonedItem.children.length > 0) {
        const authorizedChildren = filterItems(clonedItem.children);
        if (authorizedChildren.length > 0) {
          return { ...clonedItem, children: authorizedChildren };
        }
        return null;
      }

      // Case 2: Leaf node (Link)
      // Dashboard is global fallback
      if (clonedItem.key === 'dashboard') return clonedItem;

      if (clonedItem.key) {
        const itemKey = String(clonedItem.key).toLowerCase();
        return userPerms.includes(itemKey) ? clonedItem : null;
      }

      // If no key, it might be a structural item without direct permission, 
      // but usually everything in our sidebar has a key or children.
      return clonedItem;
    }).filter(Boolean);
  };

  const filteredMenuItems = React.useMemo(() => {
    // ABSOLUTE BYPASS FOR ADMINS
    const roleMatch = admin?.role?.toLowerCase();
    if (roleMatch === 'admin' || roleMatch === 'superadmin') {
      return menuItems;
    }

    return menuItems.map(group => ({
      ...group,
      items: filterItems(group.items)
    })).filter(group => group.items.length > 0);
  }, [admin?.permissions, admin?.role, menuItems]);

  const toggleSubmenu = (label) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const renderItem = (item, isSubItem = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSubmenus[item.label];
    const isChildActive = hasChildren && item.children.some(child => {
      const currentPath = location.pathname + location.search;
      return currentPath === child.path || (currentPath.startsWith(child.path) && child.path !== "/admin");
    });
    const isActive = (location.pathname + location.search) === item.path || isChildActive;

    if (hasChildren) {
      return (
        <div key={item.label} className="space-y-1">
          <button
            onClick={() => toggleSubmenu(item.label)}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 group text-sm font-bold border-2 border-transparent",
              isChildActive
                ? "bg-brand-primary/10 text-brand-primary border-brand-primary/10 ring-1 ring-brand-primary/20"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
              isChildActive ? "bg-brand-primary text-white" : "bg-slate-50 dark:bg-slate-800 group-hover:bg-brand-secondary"
            )}>
              <item.icon size={18} className={isChildActive ? "text-white" : "text-slate-400 group-hover:text-brand-primary"} />
            </div>
            <span className="flex-1 text-left">{item.label}</span>
            {isOpen ? <IconChevronDown size={14} className="opacity-50" /> : <IconChevronRight size={14} className="opacity-50" />}
          </button>

          {isOpen && (
            <div className="ml-4 pl-4 border-l-2 border-slate-50 dark:border-slate-800 space-y-1 animate-in slide-in-from-top-1 duration-200">
              {item.children.map(child => renderItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group text-sm font-bold border-2 border-transparent",
          isActive
            ? isSubItem
              ? "bg-brand-secondary text-brand-primary border-brand-primary/10"
              : "bg-brand-primary text-white shadow-xl shadow-brand-primary/20 border-brand-primary/10"
            : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
        )}
      >
        {!isSubItem && (
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
            location.pathname === item.path ? "bg-white/20" : "bg-slate-50 dark:bg-slate-800 group-hover:bg-brand-secondary"
          )}>
            <item.icon
              size={18}
              className={cn(
                "transition-all duration-200",
                location.pathname === item.path ? "text-white" : "text-slate-300 group-hover:text-brand-primary"
              )}
            />
          </div>
        )}
        {isSubItem && <div className={cn("w-1.5 h-1.5 rounded-full mr-2", location.pathname === item.path ? "bg-brand-primary" : "bg-slate-200")} />}
        <span className="flex-1">{item.label}</span>
      </Link>
    );
  };

  const navRef = React.useRef(null);

  // Restore scroll position
  React.useEffect(() => {
    const savedScroll = sessionStorage.getItem('admin_sidebar_scroll');
    if (savedScroll && navRef.current) {
      navRef.current.scrollTop = parseInt(savedScroll);
    }
  }, []);

  // Handle scroll save
  const handleScroll = (e) => {
    sessionStorage.setItem('admin_sidebar_scroll', e.target.scrollTop.toString());
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white dark:bg-slate-900 border-r border-slate-50 dark:border-slate-800 z-40 flex flex-col shadow-sm dark:shadow-none">
      <nav
        ref={navRef}
        onScroll={handleScroll}
        className="flex-1 px-4 py-8 space-y-10 overflow-y-auto no-scrollbar scroll-smooth"
      >
        {filteredMenuItems.map((section) => (
          <div key={section.group} className="space-y-2">
            <div className="flex items-center justify-between px-4 mb-4">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px]">
                {section.group}
              </h3>
              <div className="h-px flex-1 bg-slate-50 dark:bg-slate-800 ml-4" />
            </div>

            <div className="space-y-1">
              {section.items.map(item => renderItem(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Status Section */}
      <div className="p-4 border-t border-slate-50 dark:border-slate-800 mt-auto">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-all duration-200 text-sm font-black group"
        >
          <IconLogout size={20} className="group-hover:rotate-12 transition-transform duration-300" />
          Logout System
        </button>
      </div>
    </aside>
  );
};
export default AdminSidebar;



