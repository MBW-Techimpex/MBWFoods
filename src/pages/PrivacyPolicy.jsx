import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';

import { useSettings } from '../context/SettingsContext';

export default function PrivacyPolicy() {
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
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-slate-100 leading-tight">Privacy <span className="italic font-light text-brand-primary">Policy</span></h1>
            <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Last Updated: May 08, 2026</p>
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
                {siteSettings.site_name || 'MBW Foods'} (“{siteSettings.site_name ? siteSettings.site_name.split(' ')[0] : 'MBW'},” “we,” “us,” or “our”) values your privacy and is committed to protecting personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit <span className="text-brand-primary font-medium italic">{siteSettings.site_name?.replace(/\s+/g, '') || 'MBWFoods'}.com</span> or interact with our premium culinary and food delivery services.
              </p>
              <p>
                This policy applies to our customer base and is intended to comply with applicable regional privacy standards, ensuring your data is handled with the highest level of security and transparency.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">1. Information We Collect</h2>
              
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">A. Technical Information</h3>
                <p>When you browse our catalog, we automatically collect essential technical data to optimize your experience, including:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> IP Address & Device Type</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Browser Specifications</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Operating System</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Navigation Path</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Timestamp of Access</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Referral Sources</li>
                </ul>
              </div>

              <div className="space-y-4 pt-6">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">B. Customer Data</h3>
                <p>We collect information necessary for processing your fresh food orders:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Full Name</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Shipping & Billing Address</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Contact Email</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Phone Number</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Dietary & Allergy Preferences (Optional)</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Transaction History</li>
                </ul>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">2. How We Use Your Information</h2>
              <p>We utilize your data to provide a superior shopping experience:</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">01</span>
                  <span>Order fulfillment, food preparation and logistics management</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">02</span>
                  <span>Customer support for dietary choices and custom orders</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">03</span>
                  <span>Secure payment processing and fraud prevention</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">04</span>
                  <span>Personalized food recommendations for your dining tastes</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">05</span>
                  <span>Enhancement of our digital platform and user interface</span>
                </li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">3. Tracking & Personalization</h2>
              <p>
                We use advanced tracking technologies to remember your ordering preferences and cart contents. You can manage these settings via your browser at any time.
              </p>
            </section>

            <section className="space-y-6">
               <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">4. Data Protection</h2>
               <p className="font-bold text-slate-900 dark:text-slate-100 italic underline decoration-brand-accent/30 decoration-4 underline-offset-4">We maintain strict protocols: your data is never sold to third parties.</p>
               <p>We only share information with essential delivery partners and secure payment processors to ensure the successful delivery of your food items.</p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">5. Customer Rights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-brand-primary tracking-widest">Global Support</h4>
                  <p className="text-xs leading-relaxed">Request access, correction, or deletion of your profile data at any time.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-brand-primary tracking-widest">Transparency</h4>
                  <p className="text-xs leading-relaxed">Clear oversight of how your dietary and transaction data is utilized.</p>
                </div>
              </div>
              <div className="p-6 bg-brand-primary text-white rounded-3xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] mb-2">Exercise Your Rights</p>
                <p className="text-sm">Email: <span className="font-bold italic underline">{siteSettings.contact_email || 'hello@mbwfoods.com'}</span></p>
              </div> 
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">6. Secure Transactions</h2>
              <p>
                All sensitive transaction data is processed via industry-standard SSL encryption. We implement robust safeguards to protect your financial information during every checkout.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 italic border-l-4 border-brand-primary pl-6">7. Contact Us</h2>
              <p>For inquiries regarding our privacy standards, please reach out to our legal team:</p>
              <div className="p-8 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] space-y-2">
                <p className="font-serif text-xl text-slate-900 dark:text-slate-100">{siteSettings.site_name || 'MBW Foods'}</p>
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
