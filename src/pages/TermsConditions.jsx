import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';

import { useSettings } from '../context/SettingsContext';

export default function TermsConditions() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { settings: siteSettings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 overflow-x-hidden transition-colors">
      <Header isScrolled={isScrolled} activePage="terms" />
      
      {/* ── Page Hero ── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-brand-primary text-[10px] font-black tracking-[0.5em] uppercase">Service Agreement</span>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-slate-100 leading-tight">Terms & <span className="italic font-light text-brand-primary">Conditions</span></h1>
            <p className="text-slate-400 text-sm font-medium tracking-widest uppercase italic">{siteSettings.site_name || 'MBW FOODS'} — EST. 2026</p>
          </div>
        </div>
      </section>

      {/* ── Content Section ── */}
      <main className="container mx-auto px-6 lg:px-12 py-24">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-20 shadow-xl shadow-slate-200/50 border border-slate-50 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-accent/10"></div>
          
          <div className="prose prose-slate max-w-none space-y-12 text-slate-600 dark:text-slate-400 leading-relaxed font-light">
            
            {/* 1. Fulfillment Policy */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">Order Fulfillment</h2>
              <div className="space-y-4">
                <p>
                  At {siteSettings.site_name || 'MBW'}, we strive for absolute precision in delivering your premium food products. Occasionally, seasonal ingredients may require substitutions of equivalent fresh organic quality. We will always notify you if a significant deviation from your order is necessary.
                </p>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                  <p className="text-sm text-slate-300 font-medium italic">
                    Customers are responsible for providing accurate dietary information and shipping details. Delays caused by incorrect information provided during checkout are not eligible for shipping refunds.
                  </p>
                </div>
                <p>
                  We utilize premium logistics partners to ensure your culinary delicacies arrive fresh and hot. Standard transit times apply, though peak demand hours may occasionally influence delivery dates.
                </p>
                <p>
                  Order modifications or cancellations must be requested within 15 minutes of placement due to the fresh preparation process. Once an order has entered the kitchen stage, we are unable to process changes.
                </p>
              </div>
            </section>

            {/* 2. Professional Conduct */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">Privacy Standards</h2>
              <div className="space-y-4">
                <p>
                  Your technical and personal data is handled with industrial-grade security. We strictly use your information to facilitate order fulfillment and technical support. We maintain a zero-tolerance policy for data redistribution or unauthorized sales.
                </p>
                <p className="text-sm bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 italic">
                  While we implement robust encryption, {siteSettings.site_name || 'MBW'} remains compliant with all legal and governmental data transparency requirements. Information may be disclosed to authorities only when legally mandated.
                </p>
              </div>
            </section>

            {/* 3. Transaction Workflow */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">Financial Protocols</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Secure Gateways</p>
                  <ul className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                     <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Razorpay</li>
                     <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> UPI</li>
                     <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Net Banking</li>
                     <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Credit Card</li>
                     <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Debit Card</li>
                     <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Wallet</li>
                  </ul>
                </div>
                <div className="bg-slate-900 text-slate-300 p-8 rounded-[2rem] space-y-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-accent">Billing Identity</p>
                  <p className="text-sm leading-relaxed">
                    All transactions performed on this platform will reflect as <span className="text-white font-bold">{siteSettings.site_name || 'MBW Foods'}</span> on your financial statements.
                  </p>
                </div>
              </div>
              <p>
                {siteSettings.site_name || 'MBW'} authorizes payments at the moment of checkout to initiate the allocation of fresh stock for your order. Unauthorized or flagged transactions will be automatically reversed.
              </p>
            </section>

            {/* 4. Support & Documentation */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h2 className="text-lg font-serif text-slate-900 dark:text-slate-100 italic">Logistics Fees</h2>
                <p className="text-sm">Standard delivery fees are applied based on distance and delivery threshold rules.</p>
              </div>
              <div className="space-y-4">
                <h2 className="text-lg font-serif text-slate-900 dark:text-slate-100 italic">Order Verification</h2>
                <p className="text-sm">Digital invoices and order receipts are dispatched via email immediately following transaction confirmation.</p>
              </div>
            </section>

            {/* 5. Intellectual Property */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">Digital Assets</h2>
              <div className="p-8 bg-brand-primary/5 rounded-[2.5rem] border border-brand-primary/10">
                <p className="text-sm leading-relaxed italic">
                  All media content, including dishes photography and recipe details hosted on {siteSettings.site_name ? siteSettings.site_name.split(' ')[0] : 'MBW'} platforms, are the exclusive property of {siteSettings.site_name || 'MBW Foods'}. Unauthorized reproduction or commercial use is strictly prohibited.
                </p>
              </div>
            </section>

            {/* 6. Tax Obligations */}
            <section className="pt-8 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest text-center">
                GST and applicable regional taxes will be calculated at checkout.
              </p>
            </section>

          </div>
        </div>
      </main>

      <CartSidebar />
      <Footer />
    </div>
  );
}
