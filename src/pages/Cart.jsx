import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageHelper';

export default function Cart() {
  const { cartItems, removeFromCart, updateCartQuantity } = useCart();
  const { settings, formatPrice, getCurrencySymbol } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const subtotal = cartItems.reduce((acc, item) => {
    const base = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price;
    let extra = 0;
    if (item.options?.chocolates) {
      const match = item.options.chocolates.match(/\+(\d+\.\d+)/);
      if (match) extra += parseFloat(match[1]);
    }
    if (item.options?.stuffedAnimal) {
      const match = item.options.stuffedAnimal.match(/\+(\d+\.\d+)/);
      if (match) extra += parseFloat(match[1]);
    }
    return acc + (base + extra) * item.quantity;
  }, 0);

  const globalTaxRate = parseFloat(settings?.tax_rate || 18);
  const taxAmount = cartItems.reduce((acc, item) => {
    const base = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price;
    let extra = 0;
    if (item.options?.chocolates) {
      const match = item.options.chocolates.match(/\+(\d+\.\d+)/);
      if (match) extra += parseFloat(match[1]);
    }
    if (item.options?.stuffedAnimal) {
      const match = item.options.stuffedAnimal.match(/\+(\d+\.\d+)/);
      if (match) extra += parseFloat(match[1]);
    }
    const itemSubtotal = (base + extra) * item.quantity;
    const itemTaxRate = (item.tax_rate !== undefined && item.tax_rate !== null) ? parseFloat(item.tax_rate) : globalTaxRate;
    return acc + (itemSubtotal * itemTaxRate) / 100;
  }, 0);

  const shipping = 50;
  const total = subtotal + shipping + taxAmount;

  const handleQtyChange = (id, delta) => {
    const item = cartItems.find(i => (i.cartKey === id || i.id === id));
    if (!item) return;
    const newQty = item.quantity + delta;
    updateCartQuantity(id, newQty);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors">
      <Header isScrolled={isScrolled} activePage="" />

      {/* ── Page Header ── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 dark:border-slate-800 pt-12 pb-8">
        <div className="container mx-auto px-6">
          <nav className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex gap-2">
            <Link to="/" className="hover:text-brand-primary">Home</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 dark:text-slate-100">Your Cart</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-slate-100 dark:text-slate-100">Your Shopping Cart</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">You have {cartItems.length} items in your cart.</p>
            </div>
            <Link to="/" className="text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-2 group">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* ── Cart Content ── */}
      <main className="container mx-auto px-6 py-12">
        {cartItems.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-8">
             <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 dark:text-slate-100">Your cart is empty</h2>
                <p className="text-slate-500 text-sm">Looks like you haven't added any beautiful arrangements yet.</p>
             </div>
             <Link to="/" className="inline-block px-10 py-4 bg-brand-primary text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-brand-accent transition-all shadow-lg hover:shadow-brand-primary/20">
                Explore Our Collection
             </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* 1. Items List */}
            <div className="w-full lg:w-2/3 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {cartItems.map((item) => {
                    const basePrice = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price;
                    let extraCost = 0;
                    if (item.options?.chocolates) {
                      const match = item.options.chocolates.match(/\+(\d+\.\d+)/);
                      if (match) extraCost += parseFloat(match[1]);
                    }
                    if (item.options?.stuffedAnimal) {
                      const match = item.options.stuffedAnimal.match(/\+(\d+\.\d+)/);
                      if (match) extraCost += parseFloat(match[1]);
                    }
                    const finalUnitPrice = basePrice + extraCost;

                    return (
                      <div key={item.cartKey || item.id} className="p-6 md:p-8 flex items-center gap-6 group">
                        {/* Product Image */}
                        <Link to={`/product/${item.id}`} className="w-20 md:w-32 aspect-square shrink-0 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-800 relative group">
                          <img src={getImageUrl(item.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>

                        {/* Info & controls */}
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Link to={`/product/${item.id}`} className="font-serif text-lg text-slate-900 dark:text-slate-100 dark:text-slate-100 hover:text-brand-primary transition-colors leading-tight block">{item.name}</Link>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.category}</p>
                            
                            {/* Display Options */}
                            {(item.options?.chocolates || item.options?.stuffedAnimal) && (
                              <div className="mt-2 space-y-1">
                                {item.options.chocolates && (
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-brand-primary rounded-full"></span>
                                    Extra: {item.options.chocolates}
                                  </p>
                                )}
                                {item.options.stuffedAnimal && (
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-brand-primary rounded-full"></span>
                                    Extra: {item.options.stuffedAnimal}
                                  </p>
                                )}
                              </div>
                            )}

                            <p className="text-brand-primary font-sans font-black mt-2">{formatPrice(finalUnitPrice)}</p>
                          </div>
                          
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                             {/* Quantity */}
                             <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-100 dark:border-slate-800 dark:border-slate-700 shadow-inner">
                                <button onClick={() => handleQtyChange(item.cartKey || item.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-brand-primary transition-colors text-xl">−</button>
                                <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{item.quantity}</span>
                                <button onClick={() => handleQtyChange(item.cartKey || item.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-brand-primary transition-colors text-xl">+</button>
                             </div>

                             <div className="flex items-center gap-4">
                               <div className="text-right">
                                 <p className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold mb-0.5 tracking-wider">Subtotal</p>
                                 <p className="text-lg font-sans font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">{formatPrice(finalUnitPrice * item.quantity)}</p>
                               </div>
                               <div className="flex gap-2">
                                  <Link 
                                    to={`/product/${item.id}`} 
                                    className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 hover:text-brand-primary transition-all shadow-sm" 
                                    title="Edit Product"
                                  >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  </Link>
                                  <button onClick={() => removeFromCart(item.cartKey || item.id)} className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm" title="Remove Item">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                  </button>
                               </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Order Summary Panel */}
            <div className="w-full lg:w-1/3">
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 dark:border-slate-800 p-8 shadow-2xl space-y-8 sticky top-32">
                  <h3 className="text-2xl font-serif text-slate-900 dark:text-slate-100 dark:text-slate-100 tracking-tight">Order Summary</h3>
                  
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 dark:text-slate-500 font-medium">Items Subtotal</span>
                        <span className="text-slate-900 dark:text-slate-100 dark:text-slate-100 font-sans font-black">{formatPrice(subtotal)}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 dark:text-slate-500 font-medium">Shipping & Delivery</span>
                        <span className="text-slate-900 dark:text-slate-100 font-sans font-black">
                          {formatPrice(shipping)}
                        </span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 dark:text-slate-500 font-medium">Estimated Taxes (GST/VAT)</span>
                        <span className="text-slate-900 dark:text-slate-100 font-sans font-black">
                          {formatPrice(taxAmount)}
                        </span>
                     </div>
                     
                     <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 dark:border-slate-800 flex justify-between items-baseline">
                        <span className="text-lg font-serif">Estimated Total</span>
                        <div className="text-right">
                          <div className="text-3xl font-sans font-black text-brand-primary tracking-tighter">{formatPrice(total)}</div>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black mt-1">Inclusive of VAT</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3 pt-6">
                    <Link to="/checkout" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-brand-primary transition-all shadow-xl hover:shadow-brand-primary/20 flex items-center justify-center group overflow-hidden relative">
                      <span className="relative z-10">Proceed to Checkout</span>
                      <div className="absolute inset-0 bg-brand-accent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </Link>
                    <Link to="/" className="w-full py-4 border border-slate-100 dark:border-slate-800 dark:border-slate-800 text-slate-400 dark:text-slate-500 dark:text-slate-500 rounded-[1.5rem] font-bold text-[10px] uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center">
                      Keep Exploring
                    </Link>
                  </div>

                  {/* Trust Badges */}
                  <div className="pt-8 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800">
                     <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <span className="text-[9px] font-black uppercase tracking-tighter">Secure Payment</span>
                     </div>
                     <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-[9px] font-black uppercase tracking-tighter">Fast Delivery</span>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        )}
      </main>

      <CartSidebar />
      <Footer />
    </div>
  );
}



