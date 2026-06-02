import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import { ALL_PRODUCTS, Prod1, Prod2, Prod3 } from '../data/products';
const CORE_PRODUCTS = ALL_PRODUCTS;

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import API_BASE from '../config.js';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageHelper';
import { 
  IconCheck, 
  IconStar, 
  IconStarFilled, 
  IconCalendar,
  IconArrowLeft,
  IconShoppingBag
} from '@tabler/icons-react';


export default function ProductDetails() {
  const { formatPrice, settings } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    addToCart,
    toggleWishlist,
    wishlistItems,
    openSidebar
  } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const prodRes = await fetch(`${API_BASE}/api/products/${id}`, { credentials: 'include' });
        let currentProduct = null;
        if (prodRes.ok) {
          currentProduct = await prodRes.json();
          setProduct(currentProduct);
          setSelectedImage(getImageUrl(currentProduct.image));
        } else {
          currentProduct = CORE_PRODUCTS.find(p => p.id.toString() === id);
          if (currentProduct) {
            setProduct(currentProduct);
            setSelectedImage(currentProduct.image);
          }
        }

        if (currentProduct) {
          // Fetch Related Products (try same sub_category first, then same category)
          const subCategoryQuery = currentProduct.sub_category ? `&sub_category=${encodeURIComponent(currentProduct.sub_category)}` : '';
          const relatedRes = await fetch(`${API_BASE}/api/products?category=${encodeURIComponent(currentProduct.category)}${subCategoryQuery}&status=Active`, { credentials: 'include' });
          if (relatedRes.ok) {
            let relatedData = await relatedRes.json();
            
            // If sub_category returned too few items, try broader category
            if (relatedData.length <= 1 && currentProduct.sub_category) {
              const categoryRes = await fetch(`${API_BASE}/api/products?category=${encodeURIComponent(currentProduct.category)}&status=Active`, { credentials: 'include' });
              if (categoryRes.ok) {
                relatedData = await categoryRes.json();
              }
            }

            // Filter out current product, inactive products, and limit to 6
            setRelatedProducts(relatedData.filter(p => 
              String(p.id) !== String(id) && 
              (p.status === 'Active' || p.status === 'ACTIVE')
            ).slice(0, 6));
          }
        }

        // Fetch Reviews
        const reviewRes = await fetch(`${API_BASE}/api/reviews/product/${id}`, { credentials: 'include' });
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, {}, quantity);
    setQuantity(1);
    openSidebar('cart');
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, {}, 1);
    navigate('/checkout');
  };

  const renderProductName = (name) => {
    if (!name) return '';
    const words = name.split(' ');
    if (words.length >= 2) {
      const first = words[0];
      const second = words[1];
      const rest = words.slice(2).join(' ');
      return (
        <>{first} <span className="text-yellow-400 italic font-serif">{second}</span> {rest}</>
      );
    }
    return name;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Gathering components...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-slate-400">Part currently archived.</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200">

      <Header isScrolled={isScrolled} activePage="" />

      {/* ── Breadcrumbs ── */}
      <div className="container mx-auto px-6 py-6 flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 font-medium">
        <Link to="/" className="hover:text-brand-primary">Home</Link>
        <span>›</span>
        <Link to={`/${product.category.toLowerCase()}`} className="hover:text-brand-primary cursor-pointer transition-colors capitalize">{product.category}</Link>
        <span>›</span>
        <span className="text-slate-900 dark:text-slate-100 dark:text-slate-100">{product.name}</span>
      </div>

      {/* ── Product Section (Amazon Inspired) ── */}
      <section className="container mx-auto px-6 lg:px-12 py-8 max-w-[1400px]">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* 1. Left: Image Gallery */}
          <div className="w-full lg:w-[50%] flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-16 shrink-0">
              {(() => {
                const galleryImages = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
                const allImages = [product.image, ...galleryImages].filter(Boolean);
                return allImages.map((img, idx) => {
                  const finalUrl = getImageUrl(img);
                  return (
                    <button
                      key={idx}
                      onMouseEnter={() => setSelectedImage(finalUrl)}
                      onClick={() => setSelectedImage(finalUrl)}
                      className={`aspect-square w-14 md:w-full rounded border-2 overflow-hidden transition-all ${selectedImage === finalUrl ? 'border-brand-primary' : 'border-transparent hover:border-brand-primary'}`}
                    >
                      <img src={finalUrl} alt="" className="w-full h-full object-contain" />
                    </button>
                  );
                });
              })()}
            </div>

            {/* Main Image with Zoom */}
            <div
              className="flex-grow relative aspect-square bg-white dark:bg-slate-900 overflow-hidden rounded-lg cursor-zoom-in group border border-slate-100 dark:border-slate-800 dark:border-slate-800"
              onMouseMove={(e) => {
                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                const x = ((e.pageX - left - window.scrollX) / width) * 100;
                const y = ((e.pageY - top - window.scrollY) / height) * 100;
                e.currentTarget.querySelector('img').style.transformOrigin = `${x}% ${y}%`;
              }}
            >
              <img
                key={selectedImage}
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[2.2] animate-fadeIn"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg z-10">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* 2. Middle: Product General Info */}
          <div className="w-full lg:w-[30%] space-y-4">
            <h1 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-slate-100 dark:text-slate-100 leading-tight">{renderProductName(product.name)}</h1>
            <div className="flex items-center gap-2 text-sm border-b border-slate-100 dark:border-slate-800 dark:border-slate-800 pb-4">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                   <span key={i} className={i < Math.round(avgRating) ? 'text-amber-500' : 'text-slate-200'}>★</span>
                ))}
              </div>
              <span className="text-brand-primary hover:text-brand-accent hover:underline cursor-pointer">{reviews.length} ratings</span>
            </div>

            <div className="py-2 flex flex-col gap-0.5">
              <div className="flex items-baseline">
                <span className="text-[12px] text-slate-500">Price:</span>
                <span className="text-2xl font-medium text-brand-primary ml-2">{formatPrice(product.price)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 italic border-l-4 border-slate-100 dark:border-slate-800 dark:border-slate-800 pl-4">{product.category} Selection</p>
              <div className="space-y-2 text-sm border-b border-slate-100 dark:border-slate-800 dark:border-slate-800 pb-8">
                <p className="font-bold">About this item:</p>
                <div 
                  className="text-slate-600 dark:text-slate-400 leading-relaxed prose prose-sm dark:prose-invert max-w-none
                             [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
                  dangerouslySetInnerHTML={{ __html: product.description || 'Premium quality materials for long-lasting durability.' }}
                />
              </div>
            </div>
          </div>

          {/* 3. Right: Purchase Box (The Amazon Buy Box) */}
          <div className="w-full lg:w-[20%] relative">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm sticky top-24 bg-white dark:bg-slate-900 z-30">
              <div className="text-2xl font-medium text-slate-900 dark:text-slate-100">
                {formatPrice(parseFloat(product.price) * quantity)}
              </div>

              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500 shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Delivery: <span className="text-emerald-600 dark:text-emerald-400 font-bold">30 – 45 mins</span>
              </div>

              <div className={`text-lg font-bold ${product.stock === 0 ? 'text-rose-600' : product.stock < 10 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {product.stock === 0 ? 'Out of Stock.' : product.stock < 10 ? `Only ${product.stock} left in stock - order soon.` : 'In Stock.'}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs">Quantity:</span>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    disabled={product.stock === 0}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1 text-sm shadow-sm focus:outline-none disabled:opacity-50"
                  >
                    {Array.from({ length: Math.min(product.stock, 10) || 0 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                    {product.stock === 0 && <option value="0">0</option>}
                  </select>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full py-2.5 rounded-full font-medium text-sm transition-all shadow-sm ${product.stock === 0 ? 'bg-slate-100 text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'bg-brand-primary hover:bg-brand-accent text-white'}`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className={`w-full py-2.5 rounded-full font-medium text-sm transition-all shadow-sm ${product.stock === 0 ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 cursor-not-allowed' : 'bg-brand-accent hover:bg-brand-secondary text-white'}`}
                >
                  Buy Now
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product)}
                className="w-full pt-4 text-[12px] text-left text-brand-primary hover:text-brand-accent hover:underline flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                {isInWishlist ? 'Saved to your list' : 'Add to List'}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── Additional Sections (Related, Tabs) ── */}
      <section className="bg-slate-50 dark:bg-slate-800/50 py-10 mt-10">
        <div className="container mx-auto px-6">
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 bg-slate-50 dark:bg-slate-800/50">
            {['Description', 'Information', 'Reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-8 py-3 text-sm font-bold border-b-2 transition-all uppercase tracking-widest ${activeTab === tab.toLowerCase() ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="max-w-4xl min-h-[150px]">
            {activeTab === 'description' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Product Description</h3>
                <div 
                  className="text-slate-600 dark:text-slate-400 leading-loose prose prose-slate dark:prose-invert max-w-none
                             [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
            {activeTab === 'information' && (
              <div className="space-y-8 animate-fadeIn">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dimensions</p>
                    <p className="text-xl font-serif italic text-brand-primary">{product.dimensions || 'Standard Fit'}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weight</p>
                    <p className="text-xl font-serif italic text-brand-primary">{product.weight || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-8 animate-fadeIn">
                {reviews.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <IconStar className="mx-auto mb-4 text-slate-300" size={32} />
                    <p className="text-slate-500 font-medium">No reviews yet for this masterpiece.</p>
                    <p className="text-xs text-slate-400 mt-1 italic">Be the first to share your experience!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((r) => (
                      <div key={r.id} className="group p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-brand-primary/5 transition-all">
                        <div className="flex gap-6 items-start">
                          <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-bold shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
                            {r.customer_name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div className="flex-grow space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">{r.customer_name}</h4>
                                {r.customer_id && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-100">
                                    <IconCheck size={10} /> Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex text-amber-400 text-xs gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <IconStarFilled key={i} size={14} className={i < r.rating ? 'text-amber-400' : 'text-slate-200'} />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium italic">"{r.comment}"</p>
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                              <IconCalendar size={12} className="text-slate-300" />
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(r.created_at || r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <h2 className="text-xl font-bold mb-10">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((rel) => (
                <div key={rel.id} className="group flex flex-col">
                  <Link to={`/product/${rel.id}`} className="aspect-square w-full overflow-hidden rounded-lg bg-white mb-3 border border-slate-100 dark:border-slate-800">
                    <img src={getImageUrl(rel.image)} alt={rel.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                  </Link>
                  <Link to={`/product/${rel.id}`} className="text-sm font-medium text-brand-primary hover:text-brand-accent truncate mb-1">{rel.name}</Link>
                  <div className="text-brand-primary font-bold text-sm">{formatPrice(rel.price)}</div>
                </div>
              ))
            ) : (
              // Fallback to static products if no related found in DB
              CORE_PRODUCTS.filter(p => p.id !== (product?.id || 0)).slice(0, 6).map((rel) => (
                <div key={rel.id} className="group flex flex-col">
                  <Link to={`/product/${rel.id}`} className="aspect-square w-full overflow-hidden rounded-lg bg-white mb-3 border border-slate-100 dark:border-slate-800">
                    <img src={rel.image} alt={rel.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                  </Link>
                  <Link to={`/product/${rel.id}`} className="text-sm font-medium text-brand-primary hover:text-brand-accent truncate mb-1">{rel.name}</Link>
                  <div className="text-brand-primary font-bold text-sm">{formatPrice(rel.price)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
      <CartSidebar />
    </div>
  );
}