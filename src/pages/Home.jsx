import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { AnimatedTestimonials } from '../components/ui/AnimatedTestimonials'
import Footer from '../components/Footer'
import Header from '../components/Header'
import CartSidebar from '../components/CartSidebar'
import API_BASE from '../config';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageHelper';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import AuthModal from '../components/AuthModal';

// Local Assets (Replaced with foods imagery)
const HeroPrimary = "/uploads/foods_banner_1.png";
const HeroSecondary = "/uploads/foods_banner_2.png";
const HeroTertiary = "/uploads/foods_banner_3.png";

import { FEATURED_PRODUCTS } from '../data/products';
const SLIDER_PRODUCTS = FEATURED_PRODUCTS;

function WhyChooseUs() {
  const { settings } = useSettings();
  const [benefits, setBenefits] = useState([]);
  const [sectionSettings, setSectionSettings] = useState({
    whychooseus_tagline: `The ${settings.site_name ? settings.site_name.split(' ')[0] : 'MBW'} Standard`,
    whychooseus_heading: `Why Choose ${settings.site_name || 'MBW Luxury'}?`,
    whychooseus_description: "We define the intersection of automotive performance and elite aesthetics."
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/benefits`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const actives = data.filter(b => b.status === 'Active');
        setBenefits(actives);
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=whychooseus`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  if (benefits.length === 0) return <div className="h-[400px] animate-pulse bg-slate-50/50" />;

  const headingParts = sectionSettings.whychooseus_heading
    ? sectionSettings.whychooseus_heading.split(' ')
    : [];
  const lastWord = headingParts.slice(-1).join(' ');
  const restHeading = headingParts.slice(0, -1).join(' ');

  return (
    <div className="container mx-auto px-8 relative z-10">
      <div className="flex flex-col items-center mb-16 text-center">
        <span className="text-brand-primary text-[10px] font-black tracking-[0.4em] uppercase mb-4">
          {sectionSettings.whychooseus_tagline}
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-slate-100 leading-tight">
          {restHeading} <span className="italic text-brand-primary">{lastWord}</span>
        </h2>
        {sectionSettings.whychooseus_description && (
          <p className="text-slate-500 font-light text-sm mt-4 max-w-xl">
            {sectionSettings.whychooseus_description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((item, index) => (
          <div key={item.id} className="group relative bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 hover:bg-white dark:hover:bg-slate-900 hover:shadow-[0_20px_60px_-15px_rgba(76,29,149,0.12)] transition-all duration-500">
            <div className="absolute top-8 right-10 text-6xl font-serif italic text-brand-primary/[0.03] select-none">
              {String(index + 1).padStart(2, '0')}
            </div>

            <div className="space-y-6 relative z-10">
              <div className="w-16 h-16 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-serif text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-light">{item.description}</p>
              </div>

              {/* <div className="pt-4 flex items-center gap-2 text-brand-primary text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <span>Learn More</span>
                <span className="w-6 h-[1px] bg-brand-primary"></span>
              </div> */}


            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExploreCategories() {
  const [categories, setCategories] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [sectionSettings, setSectionSettings] = useState({
    explorecategories_tagline: "ELITE COLLECTIONS",
    explorecategories_heading: "Discover Perfection",
    explorecategories_quote: '"Redefining automotive luxury through precision engineering."'
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const actives = data.filter(c => c.status === 'Active');
        setCategories(actives);
        // Start in the middle of our triple-set to allow immediate back-scrolling
        setCurrentIndex(actives.length);
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=explorecategories`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isHovered || categories.length === 0) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, categories, currentIndex]);

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => prev - 1);
  };

  const handleCategoryClick = (cat) => {
    if (cat.link && cat.link !== '#') {
      navigate(cat.link);
    } else {
      // Fallback: slugify the name
      const slug = cat.name.toLowerCase().trim().replace(/\s+/g, '-');
      navigate(`/category/${slug}`);
    }
    window.scrollTo(0, 0);
  };

  if (categories.length === 0) return <div className="h-[600px] animate-pulse bg-slate-50/50" />;

  // Triple clone for seamless infinite sliding
  const loopCategories = [...categories, ...categories, ...categories];
  const cardWidth = 200 + 32; // width + gap

  // Invisible jump reset for infinite feel
  if (currentIndex >= categories.length * 2) {
    setTimeout(() => setCurrentIndex(categories.length), 0);
  } else if (currentIndex < categories.length) {
    setTimeout(() => setCurrentIndex(categories.length * 2 - 1), 0);
  }

  const headingWords = sectionSettings.explorecategories_heading
    ? sectionSettings.explorecategories_heading.split(' ')
    : ['Explore', 'Categories'];
  const lastWord = headingWords.slice(-1)[0];
  const restHeading = headingWords.slice(0, -1).join(' ');

  return (
    <section
      className="bg-slate-50/50 dark:bg-slate-900/50 py-24 relative overflow-hidden group/section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-10 right-10 text-[10rem] font-serif italic text-brand-primary/[0.03] rotate-12 select-none pointer-events-none">
        PREMIUM
      </div>

      <div className="container mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4">
            <span className="text-brand-primary text-[10px] font-black tracking-[0.5em] uppercase">{sectionSettings.explorecategories_tagline}</span>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-slate-100 leading-tight">
              {restHeading} <span className="italic text-brand-primary font-serif">{lastWord}</span>
            </h2>
          </div>
          {sectionSettings.explorecategories_quote && (
            <p className="text-slate-500 text-sm font-light max-w-xs text-right hidden lg:block italic leading-relaxed">
              {sectionSettings.explorecategories_quote}
            </p>
          )}
        </div>

        <div className="relative">

          <div className="hidden md:block">
            <button
              onClick={handlePrev}
              className="absolute -left-6 top-1/2 -translate-y-12 w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all active:scale-95 shadow-xl z-20 opacity-0 group-hover/section:opacity-100"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute -right-6 top-1/2 -translate-y-12 w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all active:scale-95 shadow-xl z-20 opacity-0 group-hover/section:opacity-100"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>

          <div className="flex overflow-hidden -mx-12 px-12">
            <motion.div
              className="flex gap-8 py-12"
              animate={{
                x: -currentIndex * cardWidth,
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
            >
              {loopCategories.map((cat, i) => (
                <div
                  key={`${cat.id}-${i}`}
                  onClick={() => handleCategoryClick(cat)}
                  className={`group block relative shrink-0 w-[200px] cursor-pointer ${i % 2 !== 0 ? 'xl:translate-y-8' : ''} transition-all duration-700`}
                >
                  <div className={`relative aspect-[4/5] ${cat.shape} overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 bg-slate-200 mx-auto`}>
                    <img src={`${getImageUrl(cat.image)}?t=${Date.now()}`} alt={cat.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms] ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80 opacity-60 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute inset-x-0 bottom-0 p-8 text-center translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out z-10">
                      <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] mb-3 block drop-shadow-md">{cat.count}</span>
                      <h3 className="text-lg font-serif text-white tracking-widest uppercase drop-shadow-lg leading-tight">{cat.name}</h3>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100 group-hover:bg-brand-primary group-hover:text-white z-10 border border-slate-50 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FaqItem = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div key={faq.id} className="group border-b border-slate-200 dark:border-slate-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between text-left outline-none group cursor-pointer"
      >
        <span className="text-lg md:text-xl font-serif text-slate-800 dark:text-slate-200 group-hover:text-brand-primary transition-colors pr-8">
          <span className="text-xs font-serif italic text-brand-primary/40 mr-4">
            {String(index + 1).padStart(2, '0')}
          </span>
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all duration-500 shadow-sm"
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="stroke-current">
            <path d="M1 1L6 6L11 1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8 pr-12">
              <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed text-sm md:text-base max-w-2xl whitespace-pre-line">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function FaqSection() {
  const [faqs, setFaqs] = useState([]);
  const [sectionSettings, setSectionSettings] = useState({
    faq_tagline: "Common Inquiries",
    faq_heading: "Your Questions, Answered.",
    faq_description: "Everything you need to know about installation, compatibility, and car care."
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/faqs`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const actives = Array.isArray(data) ? data.filter(f => f.status === 'Active') : [];
        setFaqs(actives);
      })
      .catch(err => {
        console.error('FAQ Fetch error:', err);
        setFaqs([]);
      });

    fetch(`${API_BASE}/api/section-settings?section=faq`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  if (faqs.length === 0) return <div className="h-[500px] animate-pulse bg-slate-50/50" />;

  return (
    <section className="py-28 bg-slate-50/50 dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute -bottom-20 -right-20 text-[15rem] font-serif italic text-brand-primary/[0.02] select-none pointer-events-none">
        Care
      </div>

      <div className="container mx-auto px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="w-full lg:w-1/3 space-y-8">
            <div className="space-y-4">
              <span className="text-brand-primary text-[10px] font-black tracking-[0.4em] uppercase">{sectionSettings.faq_tagline}</span>
              <h2 className="text-4xl md:text-6xl font-serif text-slate-900 dark:text-slate-100 leading-tight">
                {sectionSettings.faq_heading}
              </h2>
            </div>
            <p className="text-slate-500 font-light leading-relaxed max-w-sm">
              {sectionSettings.faq_description}
            </p>
          </div>

          <div className="w-full lg:w-2/3 space-y-4">
            {faqs.map((faq, i) => (
              <FaqItem key={faq.id} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [sectionSettings, setSectionSettings] = useState({
    testimonials_tagline: "Community Stories",
    testimonials_heading: "Shared Experiences.",
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/testimonials`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const actives = data.filter(t => t.status === 'Active');
        // AnimatedTestimonials expects 'src' instead of 'image'
        const formatted = actives.map(t => ({
          ...t,
          src: getImageUrl(t.image)
        }));
        setTestimonials(formatted);
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=testimonials`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  if (testimonials.length === 0) return <div className="h-[600px] animate-pulse bg-white" />;

  return (
    <section className="py-32 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none select-none">
        <span className="text-[15rem] font-serif italic text-brand-primary">Voices</span>
      </div>

      <div className="container mx-auto px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <span className="text-brand-accent text-[11px] font-black tracking-[0.5em] uppercase">{sectionSettings.testimonials_tagline}</span>
          <h2 className="text-4xl md:text-6xl font-serif text-slate-900 dark:text-slate-100 leading-tight italic">
            {sectionSettings.testimonials_heading}
          </h2>
        </div>

        <AnimatedTestimonials autoplay={true} testimonials={testimonials} />
      </div>
    </section>
  );
}

function AtelierSection() {
  const { settings } = useSettings();
  const [hours, setHours] = useState([]);
  const [sectionSettings, setSectionSettings] = useState({
    atelier_tagline: "Visit Our Showroom",
    atelier_heading: "Step into our Showroom to experience the precision and quality of our latest automotive components in person.",
    atelier_description: "Showroom visits and technical consultations are available during these hours.",
    atelier_location_title: "Showroom Location",
    atelier_location_text: "84 Kings Road, Chelsea, London SW3 4TZ",
    atelier_concierge_title: "Concierge",
    atelier_concierge_text: "+44 20 7123 4567, hello@studio.com",
    atelier_btn_url: "/contact"
  });

  useEffect(() => {
    // Fetch hours
    fetch(`${API_BASE}/api/atelier-hours`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setHours(data.filter(h => h.status === 'Active') || []);
      })
      .catch(console.error);

    // Fetch settings
    fetch(`${API_BASE}/api/section-settings?section=atelier`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  // Helper to check if open now
  const getStatus = () => {
    const today = hours.find(h => h.day === currentDay);
    if (!today || today.isClosed) return { label: "Closed Now", color: "rose" };

    // Parse hours e.g. "8:30 AM - 4:30 PM"
    try {
      const [start, end] = today.hours.split('-').map(t => t.trim());
      const parseTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hrs, mins] = time.split(':').map(Number);
        if (modifier === 'PM' && hrs < 12) hrs += 12;
        if (modifier === 'AM' && hrs === 12) hrs = 0;
        return hrs * 60 + (mins || 0);
      };
      const startMin = parseTime(start);
      const endMin = parseTime(end);
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();

      if (nowMin >= startMin && nowMin < endMin) return { label: "Open Now", color: "emerald" };
      return { label: "Closed Now", color: "rose" };
    } catch (e) {
      return { label: "Closed Now", color: "rose" };
    }
  };

  const status = getStatus();

  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden" id="atelier">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 lg:items-center">

          {/* Left Column Text */}
          <div className="flex-1 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {/* <div className={`px-3 py-1 bg-${status.color}-50 rounded-full flex items-center gap-2 border border-${status.color}-100/50`}>
                  <div className={`w-2 h-2 bg-${status.color}-500 rounded-full ${status.label === "Open Now" ? 'animate-pulse' : ''}`} />
                  <span className={`text-[10px] font-black text-${status.color}-600 uppercase tracking-widest`}>
                    {status.label === "Open Now" ? sectionSettings.atelier_tagline : "MBW Closed"}
                  </span>
                </div> */}
              </div>
              <h2 className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-slate-100 leading-tight">
                {(() => {
                  const text = (sectionSettings.atelier_tagline || "Visit Our Showroom").trim();
                  const words = text.split(/\s+/);
                  if (words.length <= 1) return text;
                  const lastWord = words[words.length - 1];
                  const rest = words.slice(0, -1).join(' ');
                  const displayWord = lastWord.endsWith('.') ? lastWord : `${lastWord}.`;
                  return (
                    <>
                      {rest} <br />
                      <span className="italic text-brand-primary">{displayWord}</span>
                    </>
                  );
                })()}
              </h2>
              <p className="text-slate-500 text-lg font-light leading-relaxed max-w-lg">
                {sectionSettings.atelier_heading}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 py-10 border-y border-slate-100 dark:border-slate-800">
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{sectionSettings.atelier_location_title}</h4>
                <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed">{sectionSettings.atelier_location_text}</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{sectionSettings.atelier_concierge_title}</h4>
                <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed">{sectionSettings.atelier_concierge_text}</p>
              </div>
            </div>

            {/* <div className="flex items-center gap-6 pt-6">
              <a href={sectionSettings.atelier_btn1_link || "/contact"} className="px-8 py-4 bg-[#0a0f1c] text-white rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-brand-primary transition-all text-center">
                {sectionSettings.atelier_btn1_text || "Get Directions"}
              </a>
              <div className="flex -space-x-3 overflow-hidden translate-y-0.5">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?u=${idx}`} className="w-full h-full object-cover" alt="User" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-4 border-white bg-brand-primary flex items-center justify-center text-white text-[9px] font-black shadow-sm">+2K</div>
              </div>
            </div> */}
          </div>

          {/* Right Column Hours */}
          <div className="flex-1 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[50px] border border-slate-50 dark:border-slate-800 shadow-2xl shadow-violet-100/50 dark:shadow-none p-10 md:p-16 relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/30 rounded-full blur-[100px] -z-10 group-hover:bg-brand-secondary/50 transition-all" />

            <div className="space-y-1">
              {hours.map((item, idx) => {
                const isToday = item.day === currentDay;
                return (
                  <div key={item.id} className={`flex items-center justify-between py-5 border-b border-slate-50 dark:border-slate-800 last:border-0 ${isToday ? 'relative' : ''}`}>
                    <div className="flex items-center gap-4">
                      <span className={`text-base font-bold ${isToday ? 'text-brand-primary' : 'text-slate-400'}`}>{item.day}</span>
                      {isToday && <span className="px-2 py-0.5 bg-brand-secondary text-brand-primary text-[8px] font-bold rounded-md uppercase tracking-wider">Today</span>}
                    </div>
                    <span className={`text-sm tracking-tight ${isToday ? 'text-slate-900 dark:text-slate-100 font-bold' : item.isClosed ? 'text-rose-400 italic' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.isClosed ? 'Closed' : item.hours}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <p className="text-[10px] text-slate-400 italic leading-relaxed max-w-[240px]">
                ** {sectionSettings.atelier_description}
              </p>
              <a href={sectionSettings.atelier_btn2_link || "/studio"} className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-xl shadow-brand-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all text-center whitespace-nowrap">
                {sectionSettings.atelier_btn2_text || "Navigate to Showroom"}
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}

function SubscriptionSection() {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sectionSettings, setSectionSettings] = useState({
    subscription_tagline: "Performance Membership",
    subscription_heading: "Never miss an upgrade with our elite membership",
    subscription_description: "Save up to 25% and receive exclusive access to performance parts and members-only deals. Pause or cancel anytime.",
    subscription_image: "",
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/section-settings?section=subscription&t=${Date.now()}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch(`${API_BASE}/api/subscribers`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message || 'Thanks for joining!');
      setEmail('');
    } catch (err) {
      setMessage('Error. Try again later.');
    }
  };

  const imageUrl = sectionSettings.subscription_image ? getImageUrl(sectionSettings.subscription_image) : HeroTertiary; const currentImage = (typeof imageUrl === "string" && imageUrl.startsWith("data:")) ? imageUrl : (imageUrl ? `${imageUrl}?t=${Date.now()}` : imageUrl);

  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="relative rounded-[50px] overflow-hidden min-h-[440px] flex items-center">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img src={currentImage} alt="Background" className="w-full h-full object-cover object-right" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/5 via-black/40 to-black/80"></div>
          </div>

          {/* Content */}
          <div className="w-full lg:w-3/5 p-10 lg:p-20 relative z-10 text-center lg:text-left mr-auto">
            <span className="text-white text-xs font-bold tracking-[0.3em] uppercase mb-3 block drop-shadow-md">{sectionSettings.subscription_tagline}</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight drop-shadow-lg">
              {sectionSettings.subscription_heading}
            </h2>
            <p className="text-white/90 text-lg mb-10 font-light max-w-xl leading-relaxed drop-shadow-md">
              {sectionSettings.subscription_description}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-grow px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-accent backdrop-blur-md"
                required
              />
              <button type="submit" className="px-8 py-4 bg-white text-brand-primary rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-2xl">
                Join Now
              </button>
            </form>
            {message && <p className="text-brand-accent text-xs mt-4 font-bold tracking-widest uppercase">{message}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function BannerSection({ banners }) {
  const { settings } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleBannerClick = (e, targetLink) => {
    if (!targetLink || targetLink === '/collection/interior' || targetLink === '#') {
      e.preventDefault();
      e.stopPropagation();
      if (banners.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }
    }
  };

  const renderTitle = (title) => {
    const words = (title || "").split(' ');
    if (words.length >= 3) {
      const first = words[0];
      const second = words[1];
      const rest = words.slice(2).join(' ');
      return (
        <>
          <span className="block">{first}</span>
          <span className="block italic font-light text-yellow-400">{second}</span>
          <span className="block">{rest}</span>
        </>
      );
    }
    return (
      <>
        <span className="block">{title || "Redefine Your Drive"}</span>
        <span className="block italic font-light text-brand-accent">Collection</span>
      </>
    );
  };

  return (
    <section className="relative h-[650px] md:h-[800px] lg:h-[90vh] min-h-[650px] flex overflow-hidden bg-[#0a0614]">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[100px] [animation-delay:2s]"></div>
      </div>

      <AnimatePresence>
        {banners.map((banner, idx) => {
          if (idx !== currentIndex) return null;

          return (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-10 flex"
            >
              {banner.type === 'Poster Image' ? (
                /* Poster Mode Layout - Full Width Focus */
                <div className="absolute inset-0 w-full h-full group bg-black overflow-hidden">
                  <img
                    src={`${getImageUrl(banner.image)}?t=${Date.now()}`}
                    className="w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-out group-hover:scale-110"
                    alt={banner.title}
                  />
                  {(banner.btnOneLink || banner.btnTwoLink) && (
                    <Link
                      to={banner.btnOneLink || banner.btnTwoLink}
                      onClick={(e) => handleBannerClick(e, banner.btnOneLink || banner.btnTwoLink)}
                      className="absolute inset-0 z-30 cursor-pointer"
                    />
                  )}
                  {/* Subtle Gradient Overlay to make it feel integrated */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 group-hover:opacity-0 transition-opacity duration-700"></div>
                </div>
              ) : banner.type === 'Jio Hotstar' ? (
                /* Jio Hotstar Mode Layout */
                <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col justify-end">
                  {/* Background Image with Vignette/Gradient overlay matching Hotstar */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={`${getImageUrl(banner.image)}?t=${Date.now()}`}
                      className="w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-out hover:scale-105"
                      alt={banner.title}
                    />
                    {/* Left-to-right black gradient to make text highly legible */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 via-black/50 to-transparent z-10"></div>
                    {/* Bottom-up black gradient for bottom items */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20 z-10"></div>
                  </div>

                  {/* Left Side Content - Centered vertically */}
                  <div className="relative z-20 flex flex-col justify-center h-full w-full lg:w-[50%] px-8 md:px-16 lg:px-24 pt-24 pb-16 space-y-6 text-left">
                    {/* Top Tagline / Specials Brand */}
                    {banner.topTagline && (
                      <div className="flex items-center gap-2">
                        <span className="text-brand-accent text-xs font-black tracking-[0.4em] uppercase drop-shadow">
                          {banner.topTagline}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-white leading-tight tracking-tight drop-shadow-md">
                      {banner.title}
                    </h1>

                    {/* Meta Badges/Info Row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white">
                      {banner.promoBadge && (
                        <span className="px-2.5 py-1 bg-amber-500/20 backdrop-blur border border-amber-500/30 text-yellow-400 font-bold rounded text-[10px] tracking-widest uppercase">
                          {banner.promoBadge}
                        </span>
                      )}
                      {banner.promoInfo && (
                        <span className="px-2.5 py-1 bg-white/10 backdrop-blur border border-white/10 text-white font-bold rounded text-[10px] tracking-widest uppercase">
                          {banner.promoInfo}
                        </span>
                      )}
                    </div>

                    {/* Description Subtitle */}
                    <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed max-w-lg drop-shadow">
                      {banner.subtitle}
                    </p>

                    {/* Genres/Categories Tagline */}
                    {banner.promoTitle && (
                      <p className="text-xs font-bold text-slate-400 tracking-wide">
                        {banner.promoTitle}
                      </p>
                    )}

                    {/* Buttons Row */}
                    <div className="flex items-center gap-4 pt-4">
                      <Link
                        to={banner.btnOneLink || "#"}
                        onClick={(e) => handleBannerClick(e, banner.btnOneLink || "#")}
                        className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-black text-xs tracking-[0.2em] uppercase hover:scale-105 transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        {banner.btnOneText || "Watch Now"}
                      </Link>
                    </div>
                  </div>

                  {/* Right Bottom - Horizontal Thumbnail Navigation Overlay */}
                  <div className="absolute right-8 md:right-16 bottom-16 z-30 flex items-end gap-6">

                    {/* Horizontal Mini Thumbnails Row */}
                    <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-2 rounded-2xl border border-white/5">
                      {banners.map((item, bIdx) => (
                        <button
                          key={item.id}
                          onClick={() => setCurrentIndex(bIdx)}
                          className={cn(
                            "w-20 h-11 rounded-lg overflow-hidden border-2 transition-all relative group cursor-pointer",
                            bIdx === currentIndex ? "border-amber-500 scale-105 shadow-lg shadow-amber-500/20" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <img src={getImageUrl(item.image)} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Hero Layout */
                <>
                  <div className="relative z-20 flex flex-col justify-between w-full lg:w-[48%] px-10 md:px-20 py-16">
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 40 }}
                        className="h-[2px] bg-brand-accent"
                      ></motion.div>
                      <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.6em]">{banner.topTagline || "MBW PERFORMANCE · EST 2025"}</span>
                    </div>

                    <div className="space-y-12">
                      <div className="space-y-8">
                        <h1 className="text-6xl md:text-7xl xl:text-[6rem] font-serif text-white leading-[0.9] tracking-tighter">
                          {renderTitle(banner.title)}
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed max-w-lg">
                          {banner.subtitle || `Experience the pinnacle of automotive luxury with ${settings.site_name || 'MBW'}'s exclusive carbon edition components.`}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <Link
                          to={banner.btnOneLink || "#"}
                          onClick={(e) => handleBannerClick(e, banner.btnOneLink || "#")}
                          className="relative overflow-hidden group px-12 py-6 bg-white text-[#0a0614] rounded-full font-black text-[11px] tracking-[0.4em] uppercase transition-all duration-500 hover:-translate-y-1 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)]"
                        >
                          <div className="absolute inset-0 bg-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors">
                            {banner.btnOneText || "Explore Now"}
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                          </span>
                        </Link>
                        <Link
                          to={banner.btnTwoLink || "/account"}
                          onClick={(e) => handleBannerClick(e, banner.btnTwoLink || "/account")}
                          className="px-10 py-6 border border-white/10 text-white/50 rounded-full font-bold text-[11px] tracking-[0.4em] uppercase hover:border-brand-accent hover:text-white transition-all duration-500"
                        >
                          {banner.btnTwoText || "Configure Build"}
                        </Link>
                      </div>

                      <div className="flex items-center gap-12 pt-10 border-t border-white/5">
                        {[
                          { num: banner.statOneNum, label: banner.statOneLabel },
                          { num: banner.statTwoNum, label: banner.statTwoLabel },
                          { num: banner.statThreeNum, label: banner.statThreeLabel },
                        ].filter(s => s.num || s.label).map((s, i) => (
                          <div key={i}>
                            <div className="text-3xl font-serif font-bold text-white leading-none">{s.num}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55%] z-10">
                    <div className="absolute inset-0">
                      <img
                        src={`${getImageUrl(banner.image)}?t=${Date.now()}`}
                        className="w-full h-full object-cover"
                        alt={banner.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0614] via-[#0a0614]/40 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0614]/60 via-transparent to-[#0a0614]/20"></div>
                    </div>

                    {banner.imageSecondary && banner.imageSecondary !== "" && banner.imageSecondary !== "null" && (
                      <div className="image-container absolute top-16 right-16 w-44 aspect-[3/4] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl z-10 backdrop-blur-md">
                        <img
                          src={`${getImageUrl(banner.imageSecondary)}?t=${Date.now()}`}
                          onError={(e) => { e.target.closest('.image-container').style.display = 'none'; }}
                          className="w-full h-full object-cover"
                          alt="Detail"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                    )}

                    {banner.imageTertiary && banner.imageTertiary !== "" && banner.imageTertiary !== "null" && (
                      <div className="image-container absolute bottom-20 right-48 w-56 aspect-[4/5] rounded-[50px] overflow-hidden border border-white/10 shadow-2xl z-20">
                        <img
                          src={`${getImageUrl(banner.imageTertiary)}?t=${Date.now()}`}
                          onError={(e) => { e.target.closest('.image-container').style.display = 'none'; }}
                          className="w-full h-full object-cover"
                          alt="Detail"
                        />
                      </div>
                    )}

                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 z-30 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] space-y-4 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse shadow-[0_0_10px_#FFD700]"></div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{banner.promoBadge || "Limited Edition"}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-serif text-xl leading-tight">
                          {banner.promoTitle || "Carbon"}<br />
                          <span className="italic font-light text-brand-accent">{banner.promoSubtitle || "Performance Series"}</span>
                        </p>
                      </div>
                      <p className="text-[11px] text-white/60 font-medium tracking-wide">{banner.promoInfo || "Handcrafted · Grade A Carbon"}</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Slide Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex gap-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "w-12 h-1 rounded-full transition-all duration-500",
                idx === currentIndex ? "bg-brand-accent w-16" : "bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const VideoCard = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoId = getYoutubeId(video.youtubeLink);

  return (
    <a
      href={video.youtubeLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block shrink-0 w-[280px] h-[280px] rounded-[1.5rem] overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && videoId ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&playsinline=1`}
          className="absolute inset-0 w-full h-full object-cover scale-[1.0] pointer-events-none"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <>
          <img
            src={video.thumbnail ? getImageUrl(video.thumbnail) : (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/uploads/placeholder.jpg')}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-12 h-12 rounded-[14px] bg-[#FF0000] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 ml-0.5 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

      {/* Content overlaid on video card */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
        <h3 className="text-white text-2xl font-black uppercase drop-shadow-md mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 line-clamp-2">
          {video.title}
        </h3>
        <div className="flex justify-end translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 rounded-full text-xs font-bold shadow-lg">
            Watch Video
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </span>
        </div>
      </div>
    </a>
  );
};

function VideoJourneySection() {
  const [videos, setVideos] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sectionHeading, setSectionHeading] = useState("Watch Our Journey");
  const [sectionShow, setSectionShow] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/video-journey`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVideos(data);
        } else {
          setVideos([]);
        }
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=videojourney`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.videojourney_heading) {
          setSectionHeading(data.videojourney_heading);
        }
        if (data.videojourney_section_show !== undefined) {
          setSectionShow(data.videojourney_section_show === 'true');
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isHovered || videos.length <= 3) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % videos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, videos]);

  // Render empty state if no videos
  if (!sectionShow) return null;

  if (videos.length === 0) {
    return (
      <section className="py-24 bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden group/vj">
        <div className="container mx-auto px-8 relative z-10">
          <div className="flex flex-col items-start mb-16 relative">
            <h2 className="text-4xl md:text-5xl font-serif text-[#1e3a8a] dark:text-blue-400 font-bold tracking-tight">
              {sectionHeading}
            </h2>
          </div>
          <div className="text-center text-slate-500 py-10">
            No videos uploaded yet. Add videos from the Admin Panel.
          </div>
        </div>
      </section>
    );
  }

  const handleNext = () => {
    if (videos.length > 3) {
      setCurrentIndex(prev => (prev + 1) % videos.length);
    }
  };

  const handlePrev = () => {
    if (videos.length > 3) {
      setCurrentIndex(prev => (prev - 1 + videos.length) % videos.length);
    }
  };

  // If we have <=3 videos, show them static. If >3, loop.
  const loopVideos = videos.length > 3 ? [...videos, ...videos, ...videos] : videos;

  // Calculate offset. 
  // We want to show 3 or 4 cards at a time.
  const cardWidth = 280 + 32; // width + gap (approximate)

  return (
    <section className="py-24 bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden group/vj"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container mx-auto px-8 relative z-10">
        <div className="flex flex-col items-start mb-16 relative">
          <h2 className="text-4xl md:text-5xl font-serif text-[#1e3a8a] dark:text-blue-400 font-bold tracking-tight">
            {sectionHeading}
          </h2>
        </div>

        <div className="relative max-w-[1200px] mx-auto">
          {videos.length > 3 && (
            <div className="hidden md:block">
              <button onClick={handlePrev} className="absolute -left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white transition-all shadow-xl z-20 opacity-0 group-hover/vj:opacity-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button onClick={handleNext} className="absolute -right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white transition-all shadow-xl z-20 opacity-0 group-hover/vj:opacity-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          )}

          <div className="overflow-hidden px-4 py-8 -my-8">
            <motion.div
              className={`flex gap-8 ${videos.length <= 3 ? 'justify-center' : ''}`}
              animate={{
                x: videos.length > 3 ? -(currentIndex * cardWidth) : 0,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {loopVideos.map((video, i) => (
                <VideoCard key={`${video.id}-${i}`} video={video} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}



function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const { customer, loading: authLoading } = useAuth();
  const [showBanners, setShowBanners] = useState(true);
  const [showWhyChoose, setShowWhyChoose] = useState(true);
  const [showExploreCategories, setShowExploreCategories] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [showFaq, setShowFaq] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [showSubscription, setShowSubscription] = useState(true);
  const [showAtelier, setShowAtelier] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [sections, setSections] = useState([]);
  const [sectionItems, setSectionItems] = useState([]);
  const [sectionsVisibility, setSectionsVisibility] = useState({});

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Fetch dynamic sections
    fetch(`${API_BASE}/api/home-sections?t=${Date.now()}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setSections(data.sections || []);
        setSectionItems(data.items || []);
      })
      .catch(console.error);

    // Fetch all section visibility settings at once
    fetch(`${API_BASE}/api/section-settings?t=${Date.now()}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setSectionsVisibility(data || {});
      })
      .catch(console.error);

    // Fetch Banners
    fetch(`${API_BASE}/api/banners?t=${Date.now()}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const activeBanners = Array.isArray(data) ? data.filter(b => b.status === 'Active') : [];
        setBanners(activeBanners);
        setLoadingBanners(false);
      })
      .catch(err => {
        console.error("Banner fetch error:", err);
        setLoadingBanners(false);
      });

    // Fetch Banner Visibility
    fetch(`${API_BASE}/api/section-settings?section=banner`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.banner_section_show !== undefined) {
          setShowBanners(data.banner_section_show === 'true');
        }
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=whychooseus`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.whychooseus_section_show !== undefined) {
          setShowWhyChoose(data.whychooseus_section_show === 'true');
        }
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=explorecategories`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.explorecategories_section_show !== undefined) {
          setShowExploreCategories(data.explorecategories_section_show === 'true');
        }
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=signature`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.signature_section_show !== undefined) {
          setShowSignature(data.signature_section_show === 'true');
        }
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=faq`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.faq_section_show !== undefined) {
          setShowFaq(data.faq_section_show === 'true');
        }
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=testimonials`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.testimonials_section_show !== undefined) {
          setShowTestimonials(data.testimonials_section_show === 'true');
        }
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=subscription`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.subscription_section_show !== undefined) {
          setShowSubscription(data.subscription_section_show === 'true');
        }
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=atelier`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.atelier_section_show !== undefined) {
          setShowAtelier(data.atelier_section_show === 'true');
        }
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=footer`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.footer_section_show !== undefined) {
          setShowFooter(data.footer_section_show === 'true');
        }
      })
      .catch(console.error);



    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show register modal on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedShowroom');
    if (!hasVisited && !customer && !authLoading) {
      setIsAuthModalOpen(true);
      localStorage.setItem('hasVisitedShowroom', 'true');
    }
  }, [customer, authLoading]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header isScrolled={isScrolled} activePage="home" />

      {showBanners && !loadingBanners && (
        <BannerSection banners={banners} />
      )}

      {loadingBanners && showBanners && (
        <div className="h-screen bg-[#0a0614] animate-pulse" />
      )}

      {showWhyChoose && (
        <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
          <WhyChooseUs />
        </section>
      )}

      {showExploreCategories && <ExploreCategories />}

      {sections.map(section => {
        const visibilityKey = `${section.section_type}_section_show`;
        const isVisible = sectionsVisibility[visibilityKey] !== 'false';
        if (!isVisible) return null;

        const itemsForSection = sectionItems.filter(item => item.section_type === section.section_type && item.is_active !== false);
        return (
          <BespokeHomeSection
            key={section.id}
            section={section}
            items={itemsForSection}
            addToCart={addToCart}
          />
        );
      })}

      {showFaq && <FaqSection />}

      {showTestimonials && <TestimonialsSection />}

      <VideoJourneySection />

      {showSubscription && <SubscriptionSection />}

      {showAtelier && <AtelierSection />}

      <CartSidebar />

      {showFooter && <Footer />}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="register"
      />
    </div>
  );
}


function BespokeHomeSection({ section, items, addToCart }) {
  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  const renderSectionTitle = (title) => {
    if (!title) return '';
    const words = title.split(' ');
    if (words.length <= 1) return title;
    const lastWord = words[words.length - 1];
    const rest = words.slice(0, -1).join(' ');
    return (
      <>{rest} <span className="italic text-brand-primary">{lastWord}</span></>
    );
  };

  const resolveProduct = (item) => {
    if (!item.Product) return item;
    return {
      ...item,
      title: item.title || item.Product.name,
      price: item.price || item.Product.price,
      image: item.image || item.Product.image,
      badge: typeof item.badge === 'string' ? item.badge : item.Product.badge,
      stock_status: item.Product.stock > 0 ? "In stock" : "Out of stock",
      id: item.Product.id // Use product ID for cart actions
    };
  };

  if (items.length === 0) return null;

  return (
    <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-slate-100 dark:border-slate-800 pb-12 gap-6">
          <div className="space-y-3">
            {section.subtitle && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-brand-primary rounded-md text-[10px] font-bold uppercase tracking-widest border border-violet-100">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>
                {section.subtitle}
              </div>
            )}
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-slate-100 leading-tight">
              {renderSectionTitle(section.title)}
            </h2>
            {section.description && <p className="text-slate-400 text-sm max-w-xl">{section.description}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {items.map((item) => {
            const product = resolveProduct(item);
            return (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="group flex flex-col items-center text-center h-full hover:-translate-y-2 transition-transform duration-500 cursor-pointer"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-[40px] bg-white dark:bg-slate-900 mb-8 shadow-sm border border-slate-50 dark:border-slate-800 group-hover:shadow-2xl transition-all duration-700 block">
                  <img src={`${getImageUrl(product.image)}?t=${Date.now()}`} alt={product.title} loading="lazy" className="w-full h-full object-contain transition-transform duration-[1500ms] group-hover:scale-110" />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {product.badge && <span className="bg-brand-primary/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-xl">{product.badge}</span>}
                  </div>
                  <div className="absolute inset-x-6 bottom-6 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart({ ...product, name: product.title }); }} className="w-full py-5 bg-brand-primary/95 backdrop-blur-md text-white rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-brand-accent transition-all shadow-2xl cursor-pointer">Add to Cart — {formatPrice(product.price)}</button>
                  </div>
                </div>
                <div className="px-1 flex flex-col items-center text-center">
                  <h3 className="text-xl font-serif text-slate-900 dark:text-slate-100 group-hover:text-brand-primary transition-colors mb-2">{product.title}</h3>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatPrice(product.price)}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary mt-1">{product.stock_status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



export default Home;



