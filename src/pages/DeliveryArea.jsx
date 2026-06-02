import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSettings } from '../context/SettingsContext';
import API_BASE from '../config';
import { IconClock, IconShoppingCart, IconCalendar } from '@tabler/icons-react';

const DeliveryArea = () => {
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zipCheck, setZipCheck] = useState('');
  const [zipResult, setZipResult] = useState(null);
  const [deliveryCities, setDeliveryCities] = useState([]);
  const [content, setContent] = useState({});
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    fetchData();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      const [areasRes, contentRes, policiesRes] = await Promise.all([
        fetch(`${API_BASE}/api/delivery-areas`),
        fetch(`${API_BASE}/api/delivery-areas/content`),
        fetch(`${API_BASE}/api/delivery-areas/policies`)
      ]);
      
      const areasData = await areasRes.json();
      const contentData = await contentRes.json();
      const policiesData = await policiesRes.json();

      if (Array.isArray(areasData)) {
        const formatted = areasData.map(item => ({
          ...item,
          name: item.city,
          zips: item.zip_codes.split(',').map(z => z.trim())
        }));
        setDeliveryCities(formatted);
      }
      
      if (contentData) setContent(contentData);
      if (Array.isArray(policiesData)) setPolicies(policiesData);
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching delivery area data:", err);
      setIsLoading(false);
    }
  };

  const getPolicyIcon = (iconName) => {
    switch (iconName) {
        case 'clock':
            return <IconClock className="w-8 h-8" />;
        case 'cart':
            return <IconShoppingCart className="w-8 h-8" />;
        case 'calendar':
            return <IconCalendar className="w-8 h-8" />;
        default:
            return <IconClock className="w-8 h-8" />;
    }
  };

  const allZips = deliveryCities.flatMap(city => city.zips);

  const handleZipCheck = (e) => {
    e.preventDefault();
    if (allZips.includes(zipCheck.trim())) {
      setZipResult({ success: true, message: `Yes! We deliver to ${zipCheck}.` });
    } else {
      setZipResult({ success: false, message: `Sorry, we don't deliver to ${zipCheck} yet.` });
    }
  };

  const filteredCities = deliveryCities.filter(city => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.zips.some(zip => zip.includes(searchQuery))
  );

  const deliveryPolicies = [
    {
      title: "Same Day Delivery",
      description: "Order by 2:00 PM Mon-Fri, or 11:00 AM Sat for same-day arrival.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Delivery Minimum",
      description: "A minimum order of $35.00 is required for all local deliveries.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "No Sunday Delivery",
      description: "We are closed on Sundays. Orders will be delivered on Monday.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans transition-colors">
      <Header isScrolled={isScrolled} activePage="" />

      {/* Hero with Utility */}
      <section className="relative bg-slate-100 dark:bg-slate-900 py-20 md:py-28 overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/60 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-brand-primary/5 blur-[120px] rounded-full" />
          {content.bannerImage && (
             <img src={getImageUrl(content.bannerImage)} className="absolute inset-0 w-full h-full object-cover opacity-10" alt="Background" />
          )}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
              {content.bannerTitle?.split(' ')[0]} <span className="italic font-light text-brand-primary">{content.bannerTitle?.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
              {content.bannerDescription}
            </p>

            {/* Zip Checker Tool */}
            <div className="max-w-md mx-auto pt-6">
              <form onSubmit={handleZipCheck} className="flex gap-2 p-2 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 focus-within:border-brand-primary transition-all">
                <input 
                  type="text" 
                  placeholder="Enter Zip Code (e.g. 37129)" 
                  value={zipCheck}
                  onChange={(e) => setZipCheck(e.target.value)}
                  className="flex-grow px-6 py-3 bg-transparent outline-none text-sm font-bold"
                  maxLength={5}
                />
                <button type="submit" className="px-8 py-3 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-all">
                  Check
                </button>
              </form>
              {zipResult && (
                <div className={`mt-4 text-xs font-bold uppercase tracking-widest animate-fade-in ${zipResult.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {zipResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <a href="/" className="hover:text-brand-primary">Home</a>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900 dark:text-slate-100">Delivery Architecture</span>
        </div>
      </div>

      {/* Service Highlights */}
      <section className="py-20 border-b border-slate-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-8">
            {policies.map((item, idx) => (
              <div key={idx} className="p-10 rounded-[40px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center space-y-6 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:shadow-none transition-all duration-500 group">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                  {getPolicyIcon(item.iconName)}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-light">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Searchable City Grid */}
      <section className="py-24 bg-white dark:bg-slate-950 min-h-[400px]">
        <div className="container mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16">
                <div className="space-y-4">
                  <h2 className="text-4xl font-serif text-slate-900 dark:text-slate-100">Coverage Regions</h2>
                  <p className="text-slate-400 text-sm max-w-md">Browse our primary service cities. Click on a city to see all eligible zip codes.</p>
                </div>
                <div className="w-full max-w-xs relative group">
                  <input 
                    type="text" 
                    placeholder="Search city or zip..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent focus:border-brand-primary focus:bg-white outline-none transition-all text-sm font-bold"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCities.map((city, idx) => (
                  <div key={idx} className="p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-primary hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{city.name}</h4>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Delivery: ₹{parseFloat(city.shipping_charge || 50).toFixed(2)}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-brand-primary/20 group-hover:bg-brand-primary transition-colors" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {city.zips.map(zip => (
                        <span key={zip} className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-[10px] font-bold text-slate-400 group-hover:bg-brand-primary/5 group-hover:text-brand-primary transition-colors tracking-widest">{zip}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {filteredCities.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <h4 className="text-xl font-serif text-slate-900 dark:text-slate-100 mb-2">No matching areas</h4>
                  <p className="text-slate-400 text-sm">Try searching for a different city or zip code.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Special Locations & Contact */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/3" />
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-serif leading-tight">
                    {content.specializedTitle?.split(' ')[0]} <br/><span className="italic text-brand-primary">{content.specializedTitle?.split(' ').slice(1).join(' ')}</span>
                </h2>
                <p className="text-slate-400 text-lg font-light leading-relaxed">
                  {content.specializedDescription}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-brand-primary font-black uppercase tracking-widest text-[10px]">Express Logistics</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Fast and secure delivery for all performance components and accessories.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-brand-primary font-black uppercase tracking-widest text-[10px]">Technical Support</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Dedicated support for installation scheduling and part compatibility.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[60px] p-10 md:p-16 flex flex-col justify-between">
              <div className="space-y-8">
                <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                <h3 className="text-3xl font-serif italic">Need Assistance?</h3>
                <p className="text-slate-400 font-light leading-relaxed">
                  If your area isn't listed or you have a specific time-sensitive requirement for your automotive build, our logistics team is ready to help.
                </p>
              </div>
              <div className="pt-12">
                <a href="tel:+16153968344" className="inline-block px-10 py-5 bg-brand-primary text-white rounded-full text-xs font-black uppercase tracking-[0.3em] hover:bg-brand-accent transition-all shadow-2xl shadow-brand-primary/20">
                  Contact Studio
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DeliveryArea;
