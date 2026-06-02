import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import { useSettings } from '../context/SettingsContext';

export default function About() {
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    window.scrollTo(0, 0);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 overflow-x-hidden transition-colors">
      <Header isScrolled={isScrolled} activePage="about" />

      {/* ── Beautiful Parallax Hero ── */}
      <section className="relative py-28 md:py-36 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent flex items-center justify-center border-b border-slate-100 dark:border-slate-900">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-primary/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-brand-accent/5 blur-[90px] rounded-full" />
        </div>

        <div className="relative z-10 text-center space-y-6 px-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/10 text-amber-500 dark:text-yellow-400 rounded-md text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Heritage & Passion
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
            Our Kitchen <span className="italic font-light text-amber-600 dark:text-yellow-400">Stories</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-light md:text-lg leading-relaxed">
            Redefining dynamic South Indian dining through traditional stone-ground perfection, time-honored recipes, and uncompromising quality.
          </p>
        </div>
      </section>

      {/* ── Culinary Narrative ── */}
      <section className="py-24 container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-slate-100 leading-tight">
              The Art of <span className="italic text-amber-600 dark:text-yellow-400">Steaming & Spices</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">
              At {settings.site_name || 'MBW Foods'}, our kitchen runs on time-honored principles. We believe that true South Indian food is a balance of nourishment, flavor, and texture. 
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">
              Our fresh idli batter is made daily from high-grade organic rice and black lentils, soaked and stone-ground by hand in traditional wet grinders. This natural fermentation process creates soft, cloud-like idlis that melt in your mouth without any raising agents or preservatives.
            </p>
          </div>
          <div className="relative rounded-[40px] overflow-hidden aspect-[4/3] shadow-xl border border-slate-100 dark:border-slate-800">
            <img 
              src="/uploads/foods_banner_1.png" 
              className="w-full h-full object-cover" 
              alt="Steaming hot idlis" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-[10px] font-bold tracking-widest uppercase text-yellow-400">Traditional Preparation</p>
              <p className="text-sm font-serif italic">Soft Steamed Cloud Idlis</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Pillars ── */}
      <section className="py-20 bg-slate-100/50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-950 p-10 rounded-[2.5rem] border border-slate-50 dark:border-slate-900 space-y-4 hover:-translate-y-2 transition-transform duration-500 shadow-sm hover:shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-yellow-400 font-black text-xl">01</div>
              <h3 className="text-xl font-serif text-slate-900 dark:text-slate-100">Pure Ghee & Podi</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light">
                We soak our crispy paper dosas and steamed idlis in premium, pure cow ghee and toss them in gunpowder spice mix ground under slow stone friction.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-10 rounded-[2.5rem] border border-slate-50 dark:border-slate-900 space-y-4 hover:-translate-y-2 transition-transform duration-500 shadow-sm hover:shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-yellow-400 font-black text-xl">02</div>
              <h3 className="text-xl font-serif text-slate-900 dark:text-slate-100">Filter Coffee Ritual</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light">
                Our frothy filter coffee blend combines premium Arabica and Robusta beans infused with organic chicory, stretched gracefully in brass cups.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-10 rounded-[2.5rem] border border-slate-50 dark:border-slate-900 space-y-4 hover:-translate-y-2 transition-transform duration-500 shadow-sm hover:shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-yellow-400 font-black text-xl">03</div>
              <h3 className="text-xl font-serif text-slate-900 dark:text-slate-100">No Preservatives</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light">
                We believe in serving pure foods. All batched chutneys, vegetable sambar, and dining courses are completely free of artificial coloring and chemical additions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sourcing Story ── */}
      <section className="py-24 container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-[40px] overflow-hidden aspect-[4/3] shadow-xl border border-slate-100 dark:border-slate-800 order-2 md:order-1">
            <img 
              src="/uploads/foods_banner_3.png" 
              className="w-full h-full object-cover" 
              alt="Pouring filter coffee" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-[10px] font-bold tracking-widest uppercase text-yellow-400">Coffee Ritual</p>
              <p className="text-sm font-serif italic">South Indian Filter Coffee</p>
            </div>
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-slate-100 leading-tight">
              Sourced from <span className="italic text-amber-600 dark:text-yellow-400">Local Farms</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">
              We source our fresh ingredients—from organic curry leaves and coriander to high-grade spices and fresh dairy ghee—directly from selected local farms in Southern India.
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">
              By working closely with local farmers, we ensure that every single spice blend, sweet pack, and dining course maintains the highest standards of culinary authenticity and ecological respect.
            </p>
          </div>
        </div>
      </section>

      <CartSidebar />
      <Footer />
    </div>
  );
}
