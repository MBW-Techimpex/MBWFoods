import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from '@tabler/icons-react';

export default function Subscribe() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { settings, formatPrice } = useSettings();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activePlan, setActivePlan] = useState('Breakfast Plan');

  // Handle header scrolled class behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Retrieve the 7-day meal plan from the admin settings (seeded defaults as fallback)
  const breakfastMenu = {
    Monday: settings.sub_menu_breakfast_monday || 'Ghee Podi Idli (4 Pcs)',
    Tuesday: settings.sub_menu_breakfast_tuesday || 'Spicy Mysore Masala Dosa',
    Wednesday: settings.sub_menu_breakfast_wednesday || 'Steaming Sambar Idli (2 Pcs)',
    Thursday: settings.sub_menu_breakfast_thursday || 'Healthy Oats & Carrot Idli (2 Pcs)',
    Friday: settings.sub_menu_breakfast_friday || 'Healthy Ragi Finger Millet Dosa',
    Saturday: settings.sub_menu_breakfast_saturday || 'Steaming Sambar Idli (2 Pcs)',
    Sunday: settings.sub_menu_breakfast_sunday || 'Mini Button Idlis with Sambar (12 Pcs)'
  };

  const lunchMenu = {
    Monday: settings.sub_menu_lunch_monday || 'Traditional South Indian Rice Feast (Sambar, Rasam, Veggies, Curd)',
    Tuesday: settings.sub_menu_lunch_tuesday || 'Delicious Mini Meals (Variety Rice, Poriyal, Appalam)',
    Wednesday: settings.sub_menu_lunch_wednesday || 'Healthy Millet Rice Special (Millets, Kootu, Butter Milk)',
    Thursday: settings.sub_menu_lunch_thursday || 'Flavorful Lemon Rice & Potato Fry',
    Friday: settings.sub_menu_lunch_friday || 'Authentic Curry Leaf Rice & Curd Rice Combo',
    Saturday: settings.sub_menu_lunch_saturday || 'Special Veg Biryani & Onion Raitha',
    Sunday: settings.sub_menu_lunch_sunday || 'Grand Festive South Indian Thali'
  };

  const dinnerMenu = {
    Monday: settings.sub_menu_dinner_monday || 'Soft Chapati (3 Pcs) with Veg Kurma',
    Tuesday: settings.sub_menu_dinner_tuesday || 'Light Wheat Dosa with Tomato Chutney',
    Wednesday: settings.sub_menu_dinner_wednesday || 'Fluffy Phulka (3 Pcs) with Paneer Masala',
    Thursday: settings.sub_menu_dinner_thursday || 'Healthy Ragi Roti with Coconut Chutney',
    Friday: settings.sub_menu_dinner_friday || 'Flaky Malabar Parotta (2 Pcs) with Veg Salna',
    Saturday: settings.sub_menu_dinner_saturday || 'Crispy Plain Dosa with Sambar & Chutney',
    Sunday: settings.sub_menu_dinner_sunday || 'Steaming Hot Idli (3 Pcs) with Spicy Chutney'
  };

    const getPlanPricing = (planName, defaultPrice) => {
    const price = parseFloat(settings[`subscription_${planName}_price`] || defaultPrice);
    const discount = parseFloat(settings[`subscription_${planName}_discount`] || 0);
    const offerPrice = price - (price * (discount / 100));
    const name = settings[`subscription_${planName}_name`] || `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan`;
    const fullName = settings[`subscription_${planName}_fullname`] || `Weekly ${planName.charAt(0).toUpperCase() + planName.slice(1)} Subscription Plan`;
    const buttonText = settings[`subscription_${planName}_button_text`] || `Subscribe to ${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan`;
    const footerNote = settings[`subscription_${planName}_footer_note`] || 'Secure checkout & auto-activation for next morning';
    
    return {
      price,
      offerPrice,
      discount,
      priceStr: price.toString(),
      offerPriceStr: offerPrice.toString(),
      name,
      fullName,
      buttonText,
      footerNote
    };
  };

  const breakfastPricing = getPlanPricing('breakfast', 1400.00);
  const lunchPricing = getPlanPricing('lunch', 2100.00);
  const dinnerPricing = getPlanPricing('dinner', 2100.00);

  const plans = [
    {
      id: 9997,
      ...breakfastPricing,
      description: settings.subscription_breakfast_description || 'Start your mornings with traditional, light, and delicious South Indian breakfast items delivered fresh.',
      image: '/uploads/subscription_banner.png',
      menu: breakfastMenu,
      color: 'from-orange-500/10 to-amber-500/10 border-orange-200/50 dark:border-orange-900/30',
      textAccent: 'text-orange-600 dark:text-orange-400',
      bgAccent: 'bg-orange-500',
      bgAccentLight: 'bg-orange-50 dark:bg-orange-950/30',
      glow: 'shadow-orange-500/10',
      icon: '🍳',
      timing: settings.subscription_breakfast_timing || 'Delivered daily between 7:00 AM - 8:30 AM'
    },
    {
      id: 9998,
      ...lunchPricing,
      description: settings.subscription_lunch_description || 'Relish hearty, authentic multi-dish South Indian lunch meals delivered hot to satisfy your mid-day hunger.',
      image: '/uploads/subscription_banner.png',
      menu: lunchMenu,
      color: 'from-emerald-500/10 to-teal-500/10 border-teal-200/50 dark:border-teal-900/30',
      textAccent: 'text-teal-600 dark:text-teal-400',
      bgAccent: 'bg-teal-500',
      bgAccentLight: 'bg-teal-50 dark:bg-teal-950/30',
      glow: 'shadow-teal-500/10',
      icon: '🍛',
      timing: settings.subscription_lunch_timing || 'Delivered daily between 12:00 PM - 1:30 PM'
    },
    {
      id: 9999,
      ...dinnerPricing,
      description: settings.subscription_dinner_description || 'End your day with comforting, easily digestible traditional dinners prepared under strict hygienic protocols.',
      image: '/uploads/subscription_banner.png',
      menu: dinnerMenu,
      color: 'from-violet-500/10 to-indigo-500/10 border-violet-200/50 dark:border-violet-900/30',
      textAccent: 'text-violet-600 dark:text-violet-400',
      bgAccent: 'bg-violet-500',
      bgAccentLight: 'bg-violet-50 dark:bg-violet-950/30',
      glow: 'shadow-violet-500/10',
      icon: '🍲',
      timing: settings.subscription_dinner_timing || 'Delivered daily between 7:00 PM - 8:30 PM'
    }
  ];

  const selectedPlan = plans.find(p => p.name === activePlan) || plans[0];

  const handleSubscribe = async (plan) => {
    const subProduct = {
      id: plan.id,
      name: plan.fullName,
      price: plan.offerPriceStr,
      image: plan.image,
      stock: 999999
    };
    const options = {
      isSubscription: true,
      plan: plan.fullName,
      menu: plan.menu
    };

    // Add to cart and fast-track to checkout
    await addToCart(subProduct, options, 1);
    navigate('/checkout');
  };

  const daysOfWeek = [
    { day: 'Monday', icon: '🍲' },
    { day: 'Tuesday', icon: '🍛' },
    { day: 'Wednesday', icon: '🍚' },
    { day: 'Thursday', icon: '🥕' },
    { day: 'Friday', icon: '🥞' },
    { day: 'Saturday', icon: '🥯' },
    { day: 'Sunday', icon: '🍽️' }
  ];

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <Header isScrolled={isScrolled} activePage="subscribe" />

      {/* Hero Banner Section */}
      <section className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-brand-primary text-[10px] font-black tracking-[0.4em] uppercase"
            >
              {settings.subscription_subtitle || 'Exquisite Culinary Protocols'}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-serif text-slate-900 dark:text-slate-100 leading-tight"
            >
              {settings.subscription_heading || 'Weekly Meal Subscriptions'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 font-light text-sm md:text-base leading-relaxed"
            >
              {settings.subscription_description || 'Savor premium, fresh South Indian recipes designed and prepared daily by our expert chefs. Enjoy morning, mid-day, or evening deliveries straight to your doorstep. No cooking, no mess—just absolute culinary perfection.'}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Plan Choice Section */}
      <section className="pb-32 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* 2-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8 mb-16 items-start">

            {/* Left Sidebar: Plan Choices */}
            <div className="flex flex-col gap-6 w-full lg:w-1/3 shrink-0">
              {plans.map((plan) => {
                const isActive = activePlan === plan.name;
                return (
                  <motion.div
                    key={plan.name}
                    whileHover={{ y: isActive ? 0 : -6 }}
                    onClick={() => setActivePlan(plan.name)}
                    className={`bg-white dark:bg-slate-900 border-2 rounded-[2rem] p-6 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-sm ${isActive
                        ? `border-brand-primary shadow-2xl ring-4 ring-brand-primary/5 ${plan.glow}`
                        : 'border-slate-100 dark:border-slate-800 hover:border-brand-primary/20 hover:shadow-xl'
                      }`}
                  >
                    {/* Subtle Background Accent */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${plan.color} rounded-full blur-xl opacity-80 pointer-events-none`} />

                    <div className="relative space-y-4">
                      {/* Header with Icon and Label */}
                      <div className="flex items-center justify-between">
                        <div className="text-3xl">{plan.icon}</div>
                        {isActive && (
                          <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-md text-white ${plan.bgAccent}`}>
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{plan.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{plan.fullName}</p>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="relative pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Weekly Fee</span>
                        {plan.discount > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-400 line-through">{formatPrice(plan.price)}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-black text-brand-accent tracking-tighter">{formatPrice(plan.offerPrice)}</span>
                              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black">{plan.discount}% OFF</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-3xl font-black text-brand-accent tracking-tighter">{formatPrice(plan.price)}</span>
                        )}
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                        <Icons.IconChevronRight size={20} className={isActive ? 'rotate-90 transition-transform duration-300' : ''} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Side: Interactive Menu Schedule Section */}
            <div className="w-full lg:w-2/3 sticky top-32">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePlan}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-2xl p-8 md:p-12 space-y-12 relative overflow-hidden"
                >
                  {/* Subtle top decoration */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${selectedPlan.color}`} />

                  {/* Title & Info */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-50 dark:border-slate-800 pb-8 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{selectedPlan.icon}</span>
                        <div>
                          <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-md">
                            7 Days Schedule
                          </span>
                          <h2 className="text-2xl font-serif text-slate-900 dark:text-slate-100 mt-1.5">{selectedPlan.fullName}</h2>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                        <Icons.IconClock size={14} className={selectedPlan.textAccent} />
                        {selectedPlan.timing}
                      </p>
                    </div>

                    <div className="text-left md:text-right shrink-0">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Plan Cost</p>
                      {selectedPlan.discount > 0 ? (
                        <div className="flex flex-col items-start md:items-end mt-1">
                          <span className="text-sm font-semibold text-slate-400 line-through">{formatPrice(selectedPlan.price)}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-4xl font-serif font-black text-brand-accent tracking-tighter">{formatPrice(selectedPlan.offerPrice)}</span>
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black">{selectedPlan.discount}% OFF</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-4xl font-serif font-black text-brand-accent tracking-tighter mt-1">{formatPrice(selectedPlan.price)}</p>
                      )}
                      <p className="text-[9px] text-slate-400 font-semibold tracking-tight mt-1">All-inclusive daily doorstep delivery</p>
                    </div>
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {daysOfWeek.map(({ day, icon }) => (
                      <div
                        key={day}
                        className="bg-[#fafafc] dark:bg-slate-950 border border-slate-100 dark:border-slate-850 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl rounded-2xl p-4 text-center transition-all duration-300 flex flex-col items-center justify-between min-h-[150px] group cursor-default"
                      >
                        <div className="space-y-1.5 my-4">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{day}</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-snug line-clamp-3">
                            {selectedPlan.menu[day]}
                          </p>
                        </div>

                        <span className={`w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800 group-hover:scale-110 transition-all ${selectedPlan.bgAccent}`} />
                      </div>
                    ))}
                  </div>

                  {/* Subscribe Action Button */}
                  <div className="flex flex-col items-center pt-8 border-t border-slate-50 dark:border-slate-800 space-y-4">
                    <button
                      onClick={() => handleSubscribe(selectedPlan)}
                      className={`px-16 py-6 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:scale-[1.03] active:scale-[0.98] transition-all shadow-2xl cursor-pointer text-center font-bold flex items-center gap-3 ${selectedPlan.bgAccent}`}
                    >
                      <Icons.IconSparkles size={16} />
                      {selectedPlan.buttonText}
                    </button>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {selectedPlan.footerNote}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
