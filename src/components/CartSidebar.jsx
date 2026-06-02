import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageHelper';

export default function CartSidebar() {
  const { 
    cartItems, 
    wishlistItems, 
    addToCart, 
    sidebarOpen, 
    sidebarTab, 
    closeSidebar, 
    setSidebarTab, 
    removeFromCart, 
    removeFromWishlist,
    updateCartQuantity 
  } = useCart();
  const { settings, formatPrice } = useSettings();
  
  // Lock scroll when sidebar is open
  React.useEffect(() => {
    if (sidebarOpen) {
      const style = document.createElement('style');
      style.id = 'sidebar-lock-style';
      style.innerHTML = `
        html, body { 
          overflow: hidden !important; 
          overscroll-behavior: none;
        }
      `;
      document.head.appendChild(style);
    } else {
      const style = document.getElementById('sidebar-lock-style');
      if (style) style.remove();
    }
    // Cleanup on unmount
    return () => {
      const style = document.getElementById('sidebar-lock-style');
      if (style) style.remove();
    };
  }, [sidebarOpen]);

  return (
    <div className={`fixed inset-0 z-[100] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={closeSidebar}>
      <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex gap-6">
            <button
              onClick={() => setSidebarTab('cart')}
              className={`text-lg font-serif transition-colors pb-1 ${sidebarTab === 'cart' ? 'text-brand-primary font-bold border-b-2 border-brand-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              Cart ({cartItems.length})
            </button>
            <button
              onClick={() => setSidebarTab('wishlist')}
              className={`text-lg font-serif transition-colors pb-1 ${sidebarTab === 'wishlist' ? 'text-brand-primary font-bold border-b-2 border-brand-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              Wishlist ({wishlistItems.length})
            </button>
          </div>
          <button onClick={closeSidebar} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-violet-50 dark:hover:bg-slate-900 rounded-full transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 border-b border-slate-50 dark:border-slate-800">
           {sidebarTab === 'cart' ? (
              cartItems.length > 0 ? (
                 <div className="space-y-10">
                    {cartItems.map(item => (
                       <div key={item.cartKey || item.id} className="flex gap-6 border-b border-slate-50 pb-8 last:border-0 group/item">
                          <Link to={`/product/${item.id}`} onClick={closeSidebar} className="w-24 aspect-square overflow-hidden rounded-2xl bg-slate-100 shrink-0 shadow-sm transition-transform group-hover/item:scale-105 block">
                             <img src={getImageUrl(item.image)} className="w-full h-full object-cover" alt={item.name} />
                          </Link>
                          <div className="flex-grow flex flex-col justify-between py-1">
                             <div>
                                <div className="flex justify-between items-start mb-1">
                                   <Link to={`/product/${item.id}`} onClick={closeSidebar} className="font-serif text-slate-900 dark:text-slate-100 text-lg leading-tight line-clamp-2 hover:text-brand-primary transition-colors">{item.name}</Link>
                                   <button 
                                      onClick={() => removeFromCart(item.cartKey || item.id)} 
                                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                   >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                   </button>
                                </div>
                                <p className="text-brand-accent font-black text-sm">{formatPrice(item.price)}</p>
                                {parseFloat(item.shipping_price || 0) > 0 && (
                                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">+ {formatPrice(item.shipping_price)} shipping</p>
                                )}
                                {/* Shipping Concept Applied */}
                                
                                {/* Display Options */}
                                {(item.options?.chocolates || item.options?.stuffedAnimal) && (
                                  <div className="mt-1 space-y-0.5">
                                    {item.options.chocolates && <p className="text-[9px] text-slate-400 italic">• {item.options.chocolates.split('(')[0]}</p>}
                                    {item.options.stuffedAnimal && <p className="text-[9px] text-slate-400 italic">• {item.options.stuffedAnimal.split('(')[0]}</p>}
                                  </div>
                                )}
                             </div>
                             
                             <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-1">
                                   <button 
                                      onClick={() => updateCartQuantity(item.cartKey || item.id, item.quantity - 1)}
                                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:bg-white rounded-lg transition-all"
                                   >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                      </svg>
                                   </button>
                                   <span className="w-8 text-center text-xs font-black text-slate-700">{item.quantity}</span>
                                   <button 
                                      onClick={() => updateCartQuantity(item.cartKey || item.id, item.quantity + 1)}
                                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:bg-white rounded-lg transition-all"
                                   >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                      </svg>
                                   </button>
                                </div>
                                <Link 
                                  to={`/product/${item.id}`} 
                                  onClick={closeSidebar}
                                  className="text-[9px] font-black uppercase text-brand-primary tracking-widest hover:underline"
                                >
                                  Edit
                                </Link>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 pt-20">
                  <div className="w-24 h-24 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary/40">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                     </svg>
                  </div>
                  <p className="text-xl font-serif text-slate-300 italic">The vault is currently empty.</p>
                </div>
              )
           ) : (
              wishlistItems.length > 0 ? (
                 <div className="space-y-10">
                    {wishlistItems.map(item => (
                      <div key={item.id} className="flex gap-6 border-b border-slate-50 dark:border-slate-800 pb-10">
                         <div className="w-20 aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-100 dark:border-slate-800">
                              <img src={getImageUrl(item.image)} className="w-full h-full object-cover" alt={item.name} />
                         </div>
                          <div className="flex-grow">
                             <p className="font-serif text-slate-900 dark:text-slate-100 text-xl mb-6 leading-tight">{item.name}</p>
                             <div className="flex gap-2">
                                <button onClick={() => { addToCart(item); removeFromWishlist(item.id); }} className="text-[9px] font-black uppercase text-brand-primary tracking-[0.3em] bg-brand-primary/5 dark:bg-brand-primary/10 px-4 py-1.5 rounded-full hover:bg-brand-primary hover:text-white transition-all">Move to cart</button>
                                <button onClick={() => removeFromWishlist(item.id)} className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] bg-slate-50 dark:bg-slate-900 px-4 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Discard</button>
                             </div>
                          </div>
                      </div>
                    ))}
                 </div>
              ) : <div className="text-center pt-24"><p className="font-serif text-slate-300 text-3xl italic">No specimens saved yet.</p></div>
           )}
        </div>

        {/* Fixed Footer for Cart Sidebar */}
        {sidebarTab === 'cart' && cartItems.length > 0 && (() => {
           const subtotal = cartItems.reduce((acc, item) => {
             const p = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price;
             return acc + (p * item.quantity);
           }, 0);
           const shipping = cartItems.reduce((acc, item) => {
             const s = typeof item.shipping_price === 'string' ? parseFloat(item.shipping_price.replace(/[^\d.]/g, '')) : (item.shipping_price || 0);
             return acc + (s * item.quantity);
           }, 0);
           const globalTaxRate = parseFloat(settings?.tax_rate || 18);
           const tax = cartItems.reduce((acc, item) => {
             const p = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price;
             const itemSubtotal = p * item.quantity;
             const itemTaxRate = (item.tax_rate !== undefined && item.tax_rate !== null) ? parseFloat(item.tax_rate) : globalTaxRate;
             return acc + (itemSubtotal * itemTaxRate) / 100;
           }, 0);
           const total = subtotal + shipping + tax;

           return (
              <div className="p-8 space-y-6 bg-white dark:bg-slate-950 shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
                  <div className="space-y-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                     <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                       <span className="text-[9px] font-bold uppercase tracking-widest font-sans">Subtotal</span>
                       <span className="text-sm font-medium font-sans">{formatPrice(subtotal)}</span>
                     </div>
                     <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                       <span className="text-[9px] font-bold uppercase tracking-widest font-sans">Shipping Total</span>
                       <span className="text-sm font-medium font-sans">{formatPrice(shipping)}</span>
                     </div>
                     <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                       <span className="text-[9px] font-bold uppercase tracking-widest font-sans">Estimated Tax</span>
                       <span className="text-sm font-medium font-sans">{formatPrice(tax)}</span>
                     </div>
                  </div>
                  <div className="flex justify-between items-baseline pt-2">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-sans">Total Valuation</span>
                     <span className="text-2xl font-bold text-brand-primary tracking-tighter font-sans">{formatPrice(total)}</span>
                  </div>
                 <div className="space-y-3">
                    <Link 
                       to="/checkout"
                       onClick={closeSidebar}
                       className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.4em] hover:bg-brand-accent transition-all shadow-2xl flex items-center justify-center text-center font-sans"
                    >
                       Proceed to Checkout
                    </Link>
                    <Link 
                       to="/cart"
                       onClick={closeSidebar}
                       className="w-full py-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-brand-primary transition-colors text-center block font-sans"
                    >
                       View Cart
                    </Link>
                 </div>
              </div>
           );
        })()}
      </div>
    </div>
  );
}



