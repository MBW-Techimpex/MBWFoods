import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { generateInvoice } from '../utils/invoiceGenerator';
import { generateSummary } from '../utils/summaryGenerator';
import { getImageUrl } from '../utils/imageHelper';
import { useSettings } from '../context/SettingsContext';

export default function OrderSuccess() {
   const { clearCart } = useCart();
   const location = useLocation();
   const [isScrolled, setIsScrolled] = useState(false);
   const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
   const { settings: siteSettings, formatPrice } = useSettings();

   const orderData = location.state || {};
   const {
      items = [],
      transactionId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      orderId,
      total = 0
   } = orderData;
   
   const formattedOrderId = orderId ? String(orderId).padStart(3, '0') : transactionId;

   useEffect(() => {
      // Clear the cart when the order success page is reached
      clearCart();

      const handleScroll = () => {
         setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white flex flex-col selection:bg-brand-primary selection:text-white transition-colors duration-500">
         <Header isScrolled={isScrolled} activePage="" />

         <main className="flex-grow flex items-center justify-center py-32 px-6 relative">
            {/* Cinematic Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-brand-primary/20 rounded-full blur-[160px] opacity-40"></div>
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px] opacity-30"></div>
            </div>

            <div className="max-w-4xl w-full flex flex-col items-center gap-16 relative z-10">

               <div className="text-center space-y-6 animate-fadeIn">
                  <div className="w-20 h-20 bg-white/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto border border-slate-200 dark:border-white/10 backdrop-blur-sm mb-8 relative">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-accent">
                        <path d="M20 6 9 17l-5-5" />
                     </svg>
                     <div className="absolute inset-0 rounded-full border-2 border-brand-accent animate-ping opacity-20"></div>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-serif leading-tight">Your Registry <span className="italic font-light text-brand-accent">is Secured</span></h1>
                  <p className="text-sm md:text-base text-slate-400 font-medium max-w-lg mx-auto leading-relaxed tracking-wide">
                     Order Placed! Your order history has been officially registered with the {siteSettings.site_name ? siteSettings.site_name.split(' ')[0] : 'MBW'} Fulfillment Center.
                  </p>
               </div>

               {/* ── The "Artisan Invitation" Card ── */}
               <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-10 animate-scaleIn">

                  {/* LEFT: Detailed Receipt Card */}
                  <div className="lg:col-span-7 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] backdrop-blur-xl p-10 flex flex-col justify-between h-full relative overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-none">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-primary/20 transition-all"></div>

                     <div className="space-y-10 relative">
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent italic font-serif">Acknowledgement Receipt</p>
                              <h3 className="text-2xl font-serif text-slate-900 dark:text-white">Order Details</h3>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                              <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Authenticated</span>
                           </div>
                        </div>

                        <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                           {items.map((item, idx) => {
                              const base = typeof item.price === 'number' ? item.price : parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
                              let extra = 0;
                              if (item.options?.chocolates) {
                                 const match = item.options.chocolates.match(/\+(\d+\.\d+)/);
                                 if (match) extra += parseFloat(match[1]);
                              }
                              if (item.options?.stuffedAnimal) {
                                 const match = item.options.stuffedAnimal.match(/\+(\d+\.\d+)/);
                                 if (match) extra += parseFloat(match[1]);
                              }
                              const unitPrice = base + extra;

                              return (
                                 <div key={idx} className="flex gap-6 items-start">
                                    <div className="w-16 h-20 bg-slate-50 dark:bg-white/5 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-white/5">
                                       <img src={getImageUrl(item.image)} className="w-full h-full object-cover grayscale-0 group-hover:grayscale-0 transition-all duration-700" alt="" />
                                    </div>
                                    <div className="flex-grow space-y-1">
                                       <p className="text-base font-serif font-medium text-slate-800 dark:text-slate-200">{item.name}</p>
                                       <div className="flex flex-wrap gap-2 pt-1 opacity-60">
                                          {item.options?.chocolates && <span className="text-[8px] font-bold border border-white/10 px-2 py-0.5 rounded-full uppercase italic tracking-widest">🍫 {item.options.chocolates}</span>}
                                          {item.options?.stuffedAnimal && <span className="text-[8px] font-bold border border-white/10 px-2 py-0.5 rounded-full uppercase italic tracking-widest">🧸 {item.options.stuffedAnimal}</span>}
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-sm font-sans font-black text-brand-accent">{formatPrice(unitPrice * item.quantity)}</p>
                                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">x {item.quantity}</p>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     <div className="pt-10 mt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-center sm:text-left space-y-4">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Identification</p>
                              <p className="text-[11px] font-mono font-bold text-brand-primary mt-1">{formattedOrderId}</p>
                           </div>
                           {/* <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Identification</p>
                              <p className="text-[11px] font-mono font-bold text-slate-900/40 dark:text-white/40 mt-1">{transactionId}</p>
                           </div> */}
                        </div>
                        <div className="text-center sm:text-right">
                           {orderData.discountAmount > 0 && (
                              <div className="mb-4 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                 <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Total Savings</span>
                                 <span className="text-[10px] font-sans font-black text-emerald-400">-{formatPrice(orderData.discountAmount)}</span>
                              </div>
                           )}
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Valuation</p>
                           <p className="text-2xl font-sans font-bold text-slate-900 dark:text-white tracking-tight">{formatPrice(total)}</p>
                        </div>
                     </div>
                  </div>

                  {/* RIGHT: Quick Controls Card */}
                  <div className="lg:col-span-5 flex flex-col gap-8 h-full">

                     {/* Visual Status Card */}
                     <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-brand-primary/20 dark:to-brand-primary/5 border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 space-y-8 backdrop-blur-md flex-grow shadow-lg shadow-slate-200/30 dark:shadow-none">
                        <div className="space-y-2">
                           <h4 className="text-2xl font-serif text-slate-900 dark:text-white">What's Next?</h4>
                           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Our kitchen team is now preparing your order fresh with the finest ingredients.</p>
                        </div>

                        <div className="space-y-6 pt-4">
                           <div className="flex gap-4 items-center group cursor-help">
                              <div className="w-10 h-10 rounded-full bg-brand-accent/10 dark:bg-brand-accent/20 border border-brand-accent/20 flex items-center justify-center text-brand-accent group-hover:scale-110 transition-all">
                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Order Confirmed</p>
                           </div>
                           <div className="flex gap-4 items-center animate-pulse">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                              </div>
                              <div className="flex flex-col">
                                 <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Estimated Delivery</p>
                                 <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                    30 – 45 Minutes
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Primary Actions */}
                     <div className="space-y-4">
                        <Link to="/account" className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-brand-primary dark:hover:bg-brand-accent hover:text-white transition-all shadow-2xl">
                           View My Archive
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                        </Link>
                        <button
                           disabled={isGeneratingInvoice}
                           onClick={async () => {
                              try {
                                 setIsGeneratingInvoice(true);
                                 await generateSummary({
                                    ...orderData,
                                    id: transactionId,
                                    items: items,
                                    total_amount: total,
                                    payment_method: orderData.paymentMethod || 'Online',
                                    created_at: new Date()
                                 }, siteSettings);
                              } catch (err) {
                                 console.error("Invoice Error:", err);
                                 showNotification(`Invoice generation failed: ${err.message || 'Unknown Error'}`, 'error');
                              } finally {
                                 setIsGeneratingInvoice(false);
                              }
                           }}
                           className="w-full py-5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                        >
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={isGeneratingInvoice ? 'animate-spin' : ''}>
                              {isGeneratingInvoice ? (
                                 <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                              ) : (
                                 <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></>
                              )}
                           </svg>
                           {isGeneratingInvoice ? 'Processing Summary...' : 'Download Summary'}
                        </button>
                        <Link to="/" className="w-full py-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                           Continue Collection
                        </Link>
                     </div>
                  </div>
               </div>

               {/* <div className="flex flex-col items-center gap-4 pt-10">
                  <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.6em]">
                     <span className="w-16 h-px bg-slate-200 dark:bg-white/10"></span>
                     <span>Official Order ID: {formattedOrderId}</span>
                     <span className="w-16 h-px bg-slate-200 dark:bg-white/10"></span>
                  </div>
                  <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.6em]">
                     <span className="w-16 h-px bg-slate-200 dark:bg-white/10"></span>
                     <span>Authorized Release ID: {transactionId.includes('-') ? transactionId.split('-')[1] : transactionId}</span>
                     <span className="w-16 h-px bg-slate-200 dark:bg-white/10"></span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium max-w-sm text-center italic mt-4">
                     Correspondence has been dispatched to your registered address. 24/7 Archival Support at (615) 555-GALLATIN.
                  </p>
               </div> */}

            </div>
         </main>

         <Footer />
      </div>
   );
}



