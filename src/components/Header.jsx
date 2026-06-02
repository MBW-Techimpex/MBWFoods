import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { ALL_PRODUCTS, Prod1, Prod2, Prod3 } from '../data/products';
import * as Icons from '@tabler/icons-react';
import { IconX, IconCategory, IconChevronRight, IconSteeringWheel, IconEngine, IconBolt, IconTools } from '@tabler/icons-react';
import API_BASE from '../config';
import { getImageUrl } from '../utils/imageHelper';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CategorySidebar from './CategorySidebar';

export default function Header({ isScrolled, activePage }) {
  const { cartItems, wishlistItems, openSidebar } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const { settings: siteSettings, loading: settingsLoading } = useSettings();
  const [allDbProducts, setAllDbProducts] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dynamicMenus, setDynamicMenus] = useState(null);
  const [headerConfig, setHeaderConfig] = useState(null);
  const { customer } = useAuth();
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Fetch ALL products from API for global search
  useEffect(() => {
    fetch(`${API_BASE}/api/products`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllDbProducts(data);
      })
      .catch(() => { }); // silently fail — static fallback still works
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();

      // Search DB products (live data)
      const dbMatches = allDbProducts.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      ).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image,
        _source: 'db'
      }));

      // Search static products as fallback (avoid duplicates by id)
      const dbIds = new Set(dbMatches.map(p => String(p.id)));
      const staticMatches = ALL_PRODUCTS.filter(p =>
        !dbIds.has(String(p.id)) && (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
        )
      );

      const combined = [...dbMatches, ...staticMatches].slice(0, 8);
      setSearchResults(combined);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery, allDbProducts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };


  useEffect(() => {
    // Fetch menus
    fetch(`${API_BASE}/api/menus`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setDynamicMenus(data))
      .catch(err => console.error("Error fetching menus:", err));

    // Fetch header config with cache busting
    fetch(`${API_BASE}/api/menus/config?t=${Date.now()}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        console.log("Header Config Loaded:", data);
        setHeaderConfig(data);
      })
      .catch(err => console.error("Error fetching config:", err));

    return () => { };
  }, []);

  const menuIcons = [IconSteeringWheel, IconEngine, IconBolt, IconTools, IconCategory];

  const HomeIcon = headerConfig?.homeIconName && Icons[headerConfig.homeIconName]
    ? Icons[headerConfig.homeIconName]
    : Icons.IconLayoutDashboard;

  const defaultNavItems = [];

  const getNavItems = () => {
    if (!dynamicMenus || !Array.isArray(dynamicMenus) || dynamicMenus.length === 0) return defaultNavItems;


    return dynamicMenus
      .filter(m => m.status === 'active') // Filter out inactive menus
      .map(dbMenu => {
        const isMega = (dbMenu.type === 'Mega Menu' || dbMenu.type === 'Dropdown') && !dbMenu.hideMegaMenu;
        const dbLabel = dbMenu.name.toUpperCase();

        const navItem = {
          label: dbLabel,
          link: dbMenu.link || (isMega ? '#' : '/'),
          active: activePage === dbMenu.name.toLowerCase(),
          // DB Fields
          collectionTitle: dbMenu.collectionTitle,
          collectionSubtitle: dbMenu.collectionSubtitle,
          collectionDescription: dbMenu.collectionDescription,
          collectionBadgeText: dbMenu.collectionBadgeText,
          megaMenuTitle: dbMenu.megaMenuTitle,
          featuredImageUrl: dbMenu.featuredImageUrl,
          specimenId: dbMenu.specimenId,
          specimenTitle: dbMenu.specimenTitle,
        };

        if (dbMenu.type === 'Mega Menu' && !dbMenu.hideMegaMenu) {
          const sortedSubs = [...(dbMenu.subItems || [])]
            .filter(s => s.status !== 'inactive')
            .sort((a, b) => a.position - b.position);

          const topCategories = sortedSubs.filter(s => (s.listHeader || 'Top Categories') === 'Top Categories');
          const navigationLinks = sortedSubs.filter(s => s.listHeader === 'Navigation Links');

          navItem.type = 'Mega Menu';
          navItem.dropdown = {
            columns: [
              {
                label: dbMenu.megaMenuTitle || "Top Categories",
                items: topCategories.map(s => ({ name: s.name, link: s.link }))
              },
              {
                label: "Navigation Links",
                items: navigationLinks.map(s => ({ name: s.name, link: s.link }))
              }
            ]
          };
        } else if (dbMenu.type === 'Dropdown') {
          const sortedSubs = [...(dbMenu.subItems || [])]
            .filter(s => s.status !== 'inactive')
            .sort((a, b) => a.position - b.position);

          navItem.type = 'Dropdown';
          navItem.dropdown = {
            simple: true,
            items: sortedSubs.map(s => ({ name: s.name, link: s.link }))
          };
        } else {
          navItem.type = 'Main Link';
        }

        return navItem;
      });
  };

  const navItems = getNavItems();

  if (headerConfig && headerConfig.showHeader === false) return null;

  return (
    <div className="w-full">
      {siteSettings.announcement_enabled !== 'false' && siteSettings.announcement_text && (
        <div
          style={{
            backgroundColor: siteSettings.announcement_bg_color || 'var(--color-brand-primary)',
            color: siteSettings.announcement_text_color || '#ffffff'
          }}
          className="py-2 w-full text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] relative overflow-hidden group/announcement"
        >
          <div className={`relative mx-auto overflow-hidden h-full flex items-center justify-center ${siteSettings.announcement_mode === 'slide' ? 'max-w-[60%] w-full' : 'container px-6'
            }`}>
            <div className={`relative z-10 ${siteSettings.announcement_mode === 'flash' ? 'animate-flash' :
              siteSettings.announcement_mode === 'slide' ? 'animate-slide-announcement' : ''
              }`}>
              {siteSettings.announcement_text}
            </div>
          </div>
          {(!siteSettings.announcement_mode || siteSettings.announcement_mode === 'static') && (
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/announcement:translate-x-[100%] transition-transform duration-1000"></div>
          )}
        </div>
      )}
      <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-violet-100 dark:border-slate-800 py-3' : 'bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 py-5'}`}>
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center gap-8">
            <div className="flex-shrink-0">
              <Link to={headerConfig?.homeLink || "/"}>
                <div className="flex items-center gap-3 group">
                  <div className={`w-auto flex items-center transition-all duration-300  ${isScrolled ? 'h-12 md:h-20' : 'h-12 md:h-20'}`}>
                    {siteSettings?.site_logo ? (
                      <img
                        src={`${getImageUrl(siteSettings.site_logo)}?t=${Date.now()}`}
                        alt={siteSettings.site_name}
                        className="h-full w-auto object-contain transition-transform group-hover:scale-105 duration-500"
                      />
                    ) : headerConfig?.logoUrl ? (
                      <img
                        src={`${getImageUrl(headerConfig.logoUrl)}?t=${Date.now()}`}
                        alt={headerConfig.logoTitle}
                        className="h-full w-auto object-contain transition-transform group-hover:scale-105 duration-500"
                      />
                    ) : settingsLoading ? (
                      <div className="h-full aspect-square bg-slate-100 animate-pulse rounded-full" />
                    ) : (
                      <div className="h-full flex items-center">
                        <span className="text-2xl font-black text-brand-primary tracking-tighter">
                          {siteSettings.site_name ? siteSettings.site_name.split(' ')[0] : 'MBW'}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* <div className="hidden sm:block text-left">
                    <h1 className="text-[12px] md:text-[14px] font-black text-slate-900 dark:text-slate-100 leading-tight uppercase tracking-tighter">
                      {headerConfig?.logoSubtitle || ''}
                    </h1>
                  </div> */}
                </div>
              </Link>
            </div>

            <div className="hidden lg:flex flex-grow max-w-xl relative group" ref={searchRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 1 && setShowSearchDropdown(true)}
                placeholder={headerConfig?.searchPlaceholder || "Search for seat covers, LED lights, or car care..."}
                className="w-full pl-12 pr-6 py-3 bg-violet-50/50 dark:bg-slate-900/50 rounded-2xl border border-transparent focus:border-brand-primary dark:focus:border-brand-accent focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all duration-300 text-sm text-slate-900 dark:text-slate-100"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {/* Search Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden z-[110] animate-bloom-in origin-top">
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matching Products</span>
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-violet-50 px-2 py-0.5 rounded-md">{searchResults.length} Results</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="flex items-center gap-4 p-4 hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0 group/result"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          <img src={getImageUrl(product.image)} className="w-full h-full object-cover group-hover/result:scale-110 transition-transform duration-500" alt={product.name} />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover/result:text-brand-primary transition-colors">{product.name}</h4>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-brand-accent">{product.price}</p>
                          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">View Specimen</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-50 text-center">
                    <button onClick={() => setShowSearchDropdown(false)} className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-brand-primary transition-colors">Close Search</button>
                  </div>
                </div>
              )}

              {showSearchDropdown && searchQuery.trim().length > 1 && searchResults.length === 0 && (
                <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border border-slate-100 shadow-2xl rounded-3xl p-10 text-center z-[110] animate-bloom-in origin-top">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <h4 className="text-lg font-serif text-slate-900 mb-1">No items found</h4>
                  <p className="text-sm text-slate-400 font-light">We couldn't find any products matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 md:gap-8 items-center">
              <button className="lg:hidden p-2 text-slate-600 hover:text-brand-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <Link to="/account" className="hidden sm:flex flex-col items-start leading-none group cursor-pointer transition-transform hover:-translate-y-0.5 duration-300">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">
                  {customer ? `Hello, ${customer.first_name}` : (headerConfig?.accountTopText || 'Hello, Sign In')}

                </span>
                <span className={`text-sm font-black transition-colors duration-300 ${activePage === 'account' ? 'text-brand-primary' : 'text-slate-900 dark:text-slate-100 group-hover:text-brand-primary'}`}>
                  {customer ? 'My Account' : (headerConfig?.accountBottomText || 'My Account')}
                </span>
              </Link>

              {/* <Link
                to="/subscribe"
                className="hidden md:flex items-center justify-center bg-brand-primary text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-accent hover:shadow-lg hover:shadow-brand-primary/20 transition-all active:scale-95 mx-2"
              >
                Subscribe
              </Link> */}
              <div className="flex gap-4 items-center border-l-2 border-slate-100 pl-4 md:pl-8">
                <button onClick={() => openSidebar('wishlist')} className="p-2 hover:bg-violet-50 rounded-full transition-colors relative group">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${wishlistItems.length > 0 ? 'fill-brand-accent text-brand-accent' : 'text-slate-700 group-hover:text-brand-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-brand-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold pb-px">{wishlistItems.length}</span>
                </button>

                <button onClick={() => openSidebar('cart')} className="p-2 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-full transition-colors relative group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700 dark:text-slate-300 group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold pb-px">{totalItemsCount}</span>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-full transition-all group relative overflow-hidden"
                  title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={theme}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {theme === 'light' ? (
                        <Icons.IconMoon size={22} className="text-slate-700 group-hover:text-brand-primary" />
                      ) : (
                        <Icons.IconSun size={22} className="text-amber-400 group-hover:text-amber-300" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:text-brand-primary transition-colors"
                aria-label="Open Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="hidden lg:flex justify-center items-center gap-10 mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
            {/* All Categories Trigger */}
            <button
              onClick={() => setIsCategorySidebarOpen(true)}
              className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-brand-primary transition-all group/cat"
            >
              <div className="p-1.5 rounded-lg bg-slate-50 group-hover/cat:bg-brand-primary/10 transition-colors">
                <Icons.IconMenu2 size={18} strokeWidth={2.5} className="text-brand-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">All Categories</span>
            </button>

            <Link to={headerConfig?.homeLink || "/"} className="text-slate-700 dark:text-slate-300 hover:text-brand-primary transition-colors py-1 group relative">
              <div className="group-hover:-translate-y-0.5 transition-all duration-300">
                <HomeIcon size={20} strokeWidth={2.4} />
              </div>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-accent group-hover:w-full transition-all"></span>
            </Link>

            {navItems.slice(0, 6).map((item, index) => {
              const isLastFew = index >= navItems.length - 2;
              return (
                <div key={item.label} className="relative group/nav">
                  <Link
                    to={item.dropdown ? "#" : (item.link || "#")}
                    onClick={(e) => {
                      if (item.dropdown) {
                        e.preventDefault();
                      }
                    }}
                    className={`text-sm font-bold tracking-wider py-1 flex items-center gap-1 transition-colors hover:text-brand-accent ${item.active ? 'text-brand-primary' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {item.label}
                    {item.dropdown && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/nav:rotate-180 transition-transform duration-300 opacity-40">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    )}
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-brand-accent transition-all ${item.active ? 'w-full' : 'w-0 group-hover/nav:w-full'}`}></span>
                  </Link>

                  {item.dropdown && (
                    <div className={`absolute top-full pt-6 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-500 z-[100] translate-y-6 group-hover/nav:translate-y-0 ${item.type === 'Dropdown' ? "left-0 min-w-[240px]" : (isLastFew ? "right-[-100px] min-w-[1000px]" : "left-1/2 -translate-x-1/2 min-w-[1000px]")
                      }`}>
                      {item.type === 'Dropdown' ? (
                        /* Style 2: Simple Dropdown */
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2rem] p-5 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden min-w-[280px]">
                          <div className="px-4 py-2 mb-2 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Browse {item.label}</span>
                            <Icons.IconCheck size={12} className="text-emerald-500" />
                          </div>
                          <div className="space-y-1">
                            {(item.dropdown.items || []).map((sub, sIdx) => (
                              <Link
                                key={sIdx}
                                to={sub.link || "#"}
                                className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-violet-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 transition-all group/sub uppercase tracking-wide"
                              >
                                <span>{sub.name}</span>
                                <Icons.IconArrowNarrowRight size={16} className="text-brand-primary opacity-0 group-hover/sub:opacity-100 translate-x-[-4px] group-hover/sub:translate-x-0 transition-all" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Style 1: Mega Menu */
                        <div className="bg-white dark:bg-slate-900 border border-brand-primary/5 dark:border-slate-800 shadow-[0_60px_100px_-20px_rgba(46,16,101,0.15)] rounded-[50px] p-0 flex overflow-hidden">
                          <div className="w-[28%] bg-slate-50/80 dark:bg-slate-950/80 p-12 flex flex-col justify-between border-r border-brand-primary/5 dark:border-slate-800">
                            <div className="space-y-4">
                              <span className="text-[10px] font-black text-brand-primary tracking-[0.5em] uppercase opacity-40">
                                {item.collectionSubtitle || 'Performance . 025'}
                              </span>
                              <h3 className="text-4xl font-serif text-brand-primary leading-tight tracking-tighter">
                                {item.collectionTitle || 'The Build Lab'}
                              </h3>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                {item.collectionBadgeText || 'Track Certified'}
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {item.collectionDescription || 'Engineered for Precision'}
                              </p>
                            </div>
                          </div>

                          <div className="flex-grow p-12">
                            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                              {(item.dropdown.columns || []).map((col, cIdx) => (
                                <div key={cIdx} className="space-y-6">
                                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{col.label}</h4>
                                  <ul className="space-y-4">
                                    {col.items.map((subItem, sIdx) => {
                                      const itemName = typeof subItem === 'object' ? subItem.name : subItem;
                                      const itemLink = typeof subItem === 'object' ? subItem.link : '#';
                                      return (
                                        <li key={sIdx}>
                                          <a href={itemLink} className="group/item text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors flex items-center gap-3 uppercase tracking-wider">
                                            <span className="w-0 h-px bg-brand-primary/40 group-hover/item:w-4 transition-all"></span>
                                            {itemName}
                                          </a>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="w-[32%] relative group/hero overflow-hidden">
                            <img
                              src={getImageUrl(item.featuredImageUrl || (item.label === 'PERFORMANCE' ? Prod3 : item.label === 'ACCESSORIES' ? Prod1 : Prod2))}
                              className="w-full h-full object-cover group-hover/hero:scale-110 transition-transform duration-[2000ms]"
                              alt="Hero"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/60 via-transparent to-transparent opacity-60 group-hover/hero:opacity-80 transition-opacity"></div>
                            <div className="absolute bottom-10 left-10 right-10">
                              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl space-y-1">
                                <p className="text-[8px] font-bold text-white/50 uppercase tracking-[0.3em]">
                                  Specimen ID {item.specimenId || '#025'}
                                </p>
                                <p className="text-sm font-serif text-white italic">
                                  {item.specimenTitle || 'The Performance Signature'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Weekly Subscription Scroll Link */}
            {/* <Link
              to="/subscribe"
              className="text-sm font-bold tracking-wider py-1 flex items-center gap-1 transition-all text-slate-700 dark:text-slate-300 hover:text-brand-accent relative group uppercase"
            >
              Subscribe
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-accent group-hover:w-full transition-all"></span>
            </Link> */}


            <Link
              to="/subscribe"
              className="hidden md:flex items-center justify-center bg-brand-primary text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-accent hover:shadow-lg hover:shadow-brand-primary/20 transition-all active:scale-95 mx-2"
            >
              Subscribe
            </Link>

          </div>
        </div>
      </header>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-[85%] max-w-sm bg-white dark:bg-slate-950 z-[70] shadow-2xl lg:hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                    <Icons.IconGauge size={18} className="text-brand-primary" />
                  </div>
                  <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Garage Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-brand-primary shadow-sm"
                >
                  <Icons.IconX size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-grow overflow-y-auto pt-4">
                <nav className="px-4 space-y-1">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-violet-50 dark:hover:bg-slate-900 transition-all group"
                  >
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 group-hover:bg-brand-primary/10 transition-colors">
                      <HomeIcon size={20} className="text-slate-400 group-hover:text-brand-primary" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Home Garage</span>
                  </Link>

                  {navItems.map((item, idx) => {
                    const MenuIcon = menuIcons[idx % menuIcons.length];
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between group">
                          <Link
                            to={item.dropdown ? "#" : (item.link || "#")}
                            onClick={(e) => {
                              if (item.dropdown) {
                                e.preventDefault();
                              } else {
                                setIsMobileMenuOpen(false);
                              }
                            }}
                            className={`flex-grow flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-violet-50 dark:hover:bg-slate-900 transition-all ${item.active ? 'bg-violet-50 dark:bg-brand-primary/10 text-brand-primary' : 'text-slate-700 dark:text-slate-300'}`}
                          >
                            <div className={`p-2 rounded-xl ${item.active ? 'bg-brand-primary/10' : 'bg-slate-50 dark:bg-slate-900 group-hover:bg-brand-primary/10'} transition-colors`}>
                              <MenuIcon size={20} className={item.active ? 'text-brand-primary' : 'text-slate-400 group-hover:text-brand-primary'} />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-[0.1em]">{item.label}</span>
                          </Link>
                        </div>

                        {/* Simple mobile sub-menu if dropdown exists */}
                        {item.dropdown && (
                          <div className="pl-16 pr-4 pb-4 grid grid-cols-1 gap-3">
                            {(item.dropdown.columns || (item.dropdown.sections ? [item.dropdown.sections[1]] : [])).flatMap(col => col.items).slice(0, 5).map((subItem, sIdx) => {
                              const itemName = typeof subItem === 'object' ? subItem.name : subItem;
                              const itemLink = typeof subItem === 'object' ? subItem.link : '#';
                              return (
                                <Link
                                  key={sIdx}
                                  to={itemLink}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="text-xs font-medium text-slate-500 hover:text-brand-primary transition-colors flex items-center gap-2 uppercase tracking-tight"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                  {itemName}
                                </Link>
                              );
                            })}
                            <Link
                              to={item.link || "#"}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-[9px] font-black uppercase text-brand-accent tracking-widest pt-2"
                            >
                              Explore Section +
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Mobile Subscription Scroll Link */}
                  <Link
                    to="/subscribe"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-violet-50 dark:hover:bg-slate-900 transition-all text-slate-700 dark:text-slate-300 group"
                  >
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 group-hover:bg-brand-primary/10 transition-colors">
                      <Icons.IconSparkles size={20} className="text-slate-400 group-hover:text-brand-primary" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-[0.1em]">SUBSCRIBE</span>
                  </Link>

                  <div className="h-px bg-slate-50 my-6 mx-4" />

                  <Link
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-violet-50 dark:hover:bg-slate-900 transition-all group"
                  >
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 group-hover:bg-brand-primary/10 transition-colors">
                      <Icons.IconUser size={20} className="text-slate-400 group-hover:text-brand-primary" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter leading-tight">
                        {siteSettings?.site_name || 'MBW Car Accessories'}
                      </h2>
                      <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">
                        Performance Archive
                      </p>
                      <p className="text-xs font-bold text-brand-primary mt-1">
                        {customer ? customer.first_name : 'My Account'}
                      </p>
                    </div>
                  </Link>
                </nav>
              </div>

              {/* Mobile Footer */}
              <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-grow">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Support Studio</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{siteSettings.concierge_phone || "+44 20 7123 4567"}</p>
                  </div>
                  <Icons.IconShieldCheck size={24} className="text-emerald-500 opacity-20" />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase shadow-lg shadow-brand-primary/20"
                >
                  Return to Studio
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Category Sidebar (Left Side) */}
      <CategorySidebar
        isOpen={isCategorySidebarOpen}
        onClose={() => setIsCategorySidebarOpen(false)}
      />
    </div>
  );
}
