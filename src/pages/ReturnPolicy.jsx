import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';

import { useSettings } from '../context/SettingsContext';

export default function ReturnPolicy() {
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
            <span className="text-brand-primary text-[10px] font-black tracking-[0.5em] uppercase">{siteSettings.site_name ? siteSettings.site_name.split(' ')[0] : 'MBW'} Legal Archive</span>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-slate-100 leading-tight">Return <span className="italic font-light text-brand-primary">Policy</span></h1>
            <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Last Updated: May 09, 2026</p>
          </div>
        </div>
      </section>

      {/* ── Content Section ── */}
      <main className="container mx-auto px-6 lg:px-12 py-24">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-20 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary/10"></div>
          
          <div className="prose prose-slate max-w-none space-y-12 text-slate-600 dark:text-slate-400 leading-relaxed font-light">
            <section className="space-y-6">
              <p className="text-lg">
                At {siteSettings.site_name || 'MBW Foods'}, we strive for perfection in every culinary dish we prepare. Given the fresh, hot, and perishable nature of our food products, we do not accept physical returns. However, we are committed to your complete satisfaction and offer hassle-free refunds or redelivery for any order discrepancies.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">1. Eligibility for Refunds or Redelivery</h2>
              <p>You are eligible for a complete refund or immediate redelivery under the following conditions:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Spill or damage to packaging on arrival</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Incorrect food items delivered</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Quality discrepancies reported within 2 hours</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Proof of order receipt required</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">2. Non-Refundable Items</h2>
              <p>Due to hygiene and standard food safety protocols, refunds cannot be processed for:</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">01</span>
                  <span>Items consumed more than 25% of their original quantity</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">02</span>
                  <span>Quality concerns reported more than 2 hours after delivery</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">03</span>
                  <span>Change of mind or taste preferences after the kitchen has prepared the food</span>
                </li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">3. Damaged or Spilled Orders</h2>
              <p>
                In the rare event that your meal packaging is compromised or spilled during transit, please take a quick photograph and contact our customer support team immediately via phone or WhatsApp. We will arrange a priority fresh replacement.
              </p>
            </section>

            <section className="space-y-6">
               <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">4. Refund Processing</h2>
               <p>Once your discrepancy request is reviewed by our customer care team, approved refunds will be credited back to your original payment gateway (UPI, Card, or Wallet) within 3-5 business days.</p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">5. Customer Care Concierge</h2>
              <p>To report an issue or make any inquiries regarding your fresh hot meal delivery, please contact our concierge service:</p>
              <div className="p-8 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] space-y-2">
                <p className="font-serif text-xl text-slate-900 dark:text-slate-100">{siteSettings.site_name ? siteSettings.site_name.split(' ')[0] : 'MBW'} Food Concierge</p>
                <p className="text-sm flex items-center gap-2">
                  <span className="text-brand-primary font-bold">Email:</span> 
                  {siteSettings.contact_email || 'hello@mbwfoods.com'}
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <CartSidebar />
      <Footer />
    </div>
  );
}
