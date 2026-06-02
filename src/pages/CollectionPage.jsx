import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import API_BASE from '../config';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageHelper';
import AUTO_UTILITIES_IMAGES from '../assets/Auto Utilities/autoUtilitiesImages';
import EXTERIOR_ACCESSORIES_IMAGES from '../assets/Exterior Accessories/exteriorAccessoriesImages';

// Helper: get the best image src for a product
function getProductImage(product, index = 0) {
  const placeholders = [
    'placeholder', 'chrome_kit.png', 'door_visors.png', 'exhaust_tips.png', 
    'hybrid_grill.png', 'car_cover.png', 'exterior_cat.png', 'door_guards_hq.png',
    'interior_cat.png', 'utilities_cat.png', 'lighting_cat.png'
  ];

  // If it's a real uploaded image (usually has a timestamp prefix and not a placeholder), use it
  const imgStr = String(product.image || "");
  const isPlaceholder = !product.image || placeholders.some(p => imgStr.toLowerCase().includes(p.toLowerCase()));
  
  if (!isPlaceholder && product.image.startsWith('/uploads/')) {
    return getImageUrl(product.image);
  }

  // Otherwise, try to find a dynamic asset from our maps
  const subCatImages = EXTERIOR_ACCESSORIES_IMAGES[product.sub_category] || AUTO_UTILITIES_IMAGES[product.sub_category];
  if (subCatImages && subCatImages.length > 0) {
    return subCatImages[index % subCatImages.length];
  }

  return getImageUrl(product.image);
}

// ── CategorySidebar: shows 6 items, rest in scrollable "Show more" ────────────
function CategorySidebar({ sidebarCollections, slug }) {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE = 6;
  const hasMore = sidebarCollections.length > VISIBLE;

  // Determine which items are "main" and which are "extra"
  // If the current category is NOT in the first 6, we should ideally show it in the main list
  // but for simplicity, let's just make sure it's visible.
  
  const mainItems = sidebarCollections.slice(0, VISIBLE);
  const extraItems = sidebarCollections.slice(VISIBLE);

  // Check if current slug is in extra items
  const currentInExtra = extraItems.some(item => (slug === item.slug) || (item.label === 'All' && !slug));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-serif text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">Categories</h3>

      <div className="flex flex-col gap-2">
        {/* Main Items */}
        <ul className="space-y-2">
          {mainItems.map(item => {
            const isCurrent = (slug === item.slug) || (item.label === 'All' && !slug);
            return (
              <li key={item.label}>
                <Link
                  to={item.link}
                  className={`text-sm flex items-center justify-between py-1.5 px-2 rounded-lg transition-all ${
                    isCurrent
                      ? 'text-brand-primary font-bold bg-brand-primary/5 dark:bg-brand-primary/10'
                      : 'text-slate-500 dark:text-slate-400 hover:text-brand-primary hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isCurrent ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                    {item.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Extra Items (Scrollable) */}
        {hasMore && (
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded || currentInExtra ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <ul className="space-y-2 pt-2 border-t border-slate-50 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {extraItems.map(item => {
                const isCurrent = (slug === item.slug) || (item.label === 'All' && !slug);
                return (
                  <li key={item.label}>
                    <Link
                      to={item.link}
                      className={`text-sm flex items-center justify-between py-1.5 px-2 rounded-lg transition-all ${
                        isCurrent
                          ? 'text-brand-primary font-bold bg-brand-primary/5 dark:bg-brand-primary/10'
                          : 'text-slate-500 dark:text-slate-400 hover:text-brand-primary hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isCurrent ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}>
                        {item.count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Toggle Button */}
        {hasMore && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-brand-primary uppercase tracking-widest transition-colors mt-1"
          >
            <span>{expanded ? '▲ Show Less' : `▼ View ${extraItems.length} More Categories`}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function CollectionPage({ slug: propSlug }) {
  const { slug: paramSlug } = useParams();
  const slug = propSlug || paramSlug;

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState("price-low");
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedCollection, setExpandedCollection] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategoryLabel, setActiveCategoryLabel] = useState("");

  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const { formatPrice } = useSettings();

  const fetchPageData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Config for current page
      const configRes = await fetch(`${API_BASE}/api/collections/${slug}`, { credentials: 'include' });
      let pageConfig = null;
      if (configRes.ok) {
        pageConfig = await configRes.json();
        setConfig(pageConfig);
        setActiveCategoryLabel(pageConfig.title);
      }

      // 2. Fetch All Collections for Sidebar
      const catsRes = await fetch(`${API_BASE}/api/collections`, { credentials: 'include' });
      if (catsRes.ok) {
        const catsData = await catsRes.json();
        if (Array.isArray(catsData)) {
          setCategories(catsData.filter(c => c && c.is_active));
        }
      }

      // 3. Fetch Products
      const prodRes = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
      const allData = await prodRes.json();
      const safeData = Array.isArray(allData) ? allData : [];
      setAllProducts(safeData);

      // Filter products for the current collection
      if (pageConfig) {
        const filtered = allData.filter(p => {
          const fieldValue = p[pageConfig.filter_field];
          const filterValue = pageConfig.filter_value;
          if (!fieldValue || !filterValue) return false;
          
          const cleanString = (str) => String(str || "").toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanField = cleanString(fieldValue);
          const cleanFilter = cleanString(filterValue);
          if (!cleanField || !cleanFilter) return false;
          
          const matchesFilter = cleanField.includes(cleanFilter) || cleanFilter.includes(cleanField);
          return matchesFilter && (p.status === 'Active' || p.status === 'ACTIVE');
        });
        setProducts(filtered);
      } else {
        // Fallback to active products if no specific collection config
        setProducts(allData.filter(p => p.status === 'Active' || p.status === 'ACTIVE'));
      }

      // Initial price range
      const prices = allData.map(p => {
        const val = typeof p.price === 'string' ? parseFloat(p.price.replace(/[^\d.]/g, '')) : p.price;
        return val || 0;
      });
      const maxVal = prices.length > 0 ? Math.max(...prices) : 5000;
      setPriceRange(maxVal);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching collection data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleExpand = (label) => {
    setExpandedCollection(prev => prev === label ? null : label);
  };

  // Generate dynamic collections list for sidebar
  const sidebarCollections = [
    { label: 'All', count: allProducts.filter(p => p.status === 'Active' || p.status === 'ACTIVE').length, link: '/' },
    ...categories.map(cat => ({
      label: cat.title,
      count: allProducts.filter(p => {
        const fieldValue = p[cat.filter_field];
        const filterValue = cat.filter_value;
        if (!fieldValue || !filterValue) return false;
        
        const cleanString = (str) => String(str || "").toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanField = cleanString(fieldValue);
        const cleanFilter = cleanString(filterValue);
        if (!cleanField || !cleanFilter) return false;
        
        const matchesFilter = cleanField.includes(cleanFilter) || cleanFilter.includes(cleanField);
        return matchesFilter && (p.status === 'Active' || p.status === 'ACTIVE');
      }).length,
      link: `/category/${cat.slug}`,
      slug: cat.slug
    }))
  ];

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const curPrice = typeof p.price === 'string' ? parseFloat(p.price.replace(/[^\d.]/g, '')) : p.price;
      const matchesPrice = curPrice <= priceRange;
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      const priceA = typeof a.price === 'string' ? parseFloat(a.price.replace(/[^\d.]/g, '')) : a.price;
      const priceB = typeof b.price === 'string' ? parseFloat(b.price.replace(/[^\d.]/g, '')) : b.price;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      return 0;
    });

  const maxPossiblePrice = Math.max(...(products.length > 0 ? products.map(p => {
    const val = typeof p.price === 'string' ? parseFloat(p.price.replace(/[^\d.]/g, '')) : p.price;
    return val || 0;
  }) : [500]));

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Final safety check if config is still null after loading is finished
  if (!config || config.is_active === false) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center space-y-4 px-6 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-serif text-slate-900 dark:text-slate-100 tracking-tight">System Notice</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          The collection you're looking for is currently offline or has been moved.
        </p>
        <div className="pt-6">
          <Link to="/" className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-bold hover:bg-brand-primary transition-all">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
   <div className="min-h-screen bg-[#fcfcfc] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 overflow-x-hidden transition-colors">
      <Header isScrolled={isScrolled} activePage={slug} />

      {/* ── Page Header ── */}
      <section className={`relative ${config.bg_class} py-16 md:py-24 overflow-hidden flex items-center justify-center`} style={{ background: config.bg_gradient }}>
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-white/20 dark:bg-white/5 blur-[80px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-brand-primary/10 dark:bg-brand-primary/5 blur-[80px] rounded-full" />
        </div>

        <div className="relative z-10 text-center space-y-4 px-6">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif ${config.title_class} leading-tight tracking-tight capitalize`}>
            {config.title} <span className="italic font-black text-yellow-400 drop-shadow-sm">{config.accent_title}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-light md:text-lg">
            {config.description}
          </p>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <section className="container mx-auto px-6 lg:px-12 py-16 flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 space-y-10">
          {/* Search */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">Search</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-brand-primary outline-none transition-colors text-sm text-slate-900 dark:text-slate-100"
              />
              <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Categories */}
          <CategorySidebar sidebarCollections={sidebarCollections} slug={slug} />

          {/* Price Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">Filter by Price</h3>
            <div className="pt-2">
              <input
                type="range"
                min="0"
                max={maxPossiblePrice}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-brand-primary"
              />
              <div className="flex justify-between items-center mt-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                <span>Price: <span className="text-brand-primary">{formatPrice(0)} - {formatPrice(priceRange)}</span></span>
                <button className="text-[10px] uppercase tracking-widest bg-slate-100 dark:bg-slate-800 hover:bg-brand-primary hover:text-white px-3 py-1 rounded-full transition-colors text-slate-500 dark:text-slate-400 dark:text-slate-400">
                  Filter
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing all {filteredProducts.length} results for {config?.title} {config?.accent_title}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-slate-200 dark:border-slate-800 text-sm py-2 px-4 rounded-lg focus:outline-none focus:border-brand-primary dark:text-slate-300"
            >
              <option value="price-low">Sort by price: low to high</option>
              <option value="price-high">Sort by price: high to low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400 dark:text-slate-400 font-medium">Gathering components...</p>
              </div>
            ) : filteredProducts.map((product, index) => (
              <div key={product.id} className="group flex flex-col">
                <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden rounded-2xl bg-white dark:bg-slate-900 mb-4 cursor-pointer block">
                  <img
                    src={getProductImage(product, index)}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                  {product.badge && (
                    <span className={`absolute top-4 left-4 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full z-10 ${product.badge === 'Sale' ? 'bg-amber-400 text-slate-900' : product.badge === 'Best Seller' ? 'bg-brand-primary text-white' : 'bg-white text-slate-800'}`}>
                      {product.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-800 hover:bg-brand-primary hover:text-white transition-all shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
                      className={`w-12 h-12 bg-white rounded-full flex items-center justify-center transition-all shadow-lg ${wishlistItems.some(item => item.id === product.id) ? 'text-brand-accent' : 'text-slate-800 hover:text-white hover:bg-brand-primary'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${wishlistItems.some(item => item.id === product.id) ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </Link>
                <div className="space-y-1">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-serif text-lg text-slate-900 dark:text-slate-100 group-hover:text-brand-primary transition-colors cursor-pointer text-center">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-brand-accent font-bold">{formatPrice(product.price)}</span>
                    {product.stock <= 0 ? (
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">Out of Stock</span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">In Stock: {product.stock}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-2xl font-serif text-slate-500 dark:text-slate-400 mb-2">No products found</h3>
              <p className="text-slate-400">Please check back soon for our curated selection.</p>
            </div>
          )}
        </div>
      </section>

      <CartSidebar />
      <Footer />
    </div>
  );
}



