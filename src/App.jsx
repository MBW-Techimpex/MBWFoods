import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Checkout from './pages/Checkout'
import Cart from './pages/Cart'
import Account from './pages/Account'
import OrderSuccess from './pages/OrderSuccess'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import ReturnPolicy from './pages/ReturnPolicy'
import About from './pages/About'
import { NotificationProvider } from './context/NotificationContext'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { ThemeProvider } from './context/ThemeContext'
import ScrollToTop from './components/ScrollToTop'
import FloatingContactBar from './components/FloatingContactBar'
import CustomCursor from './components/CustomCursor'
import CollectionPage from './pages/CollectionPage'
import Subscribe from './pages/Subscribe'
import API_BASE from './config';
import { getImageUrl } from './utils/imageHelper';

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import ProductManagement from './pages/admin/ProductManagement'
import MenuOverview from './pages/admin/MenuOverview'
import BannerManagement from './pages/admin/BannerManagement'
import AdminComingSoon from './pages/admin/ComingSoon'
import BenefitManagement from './pages/admin/BenefitManagement'
import CategoryManagement from './pages/admin/CategoryManagement'
import FaqManagement from './pages/admin/FaqManagement'
import TestimonialManagement from './pages/admin/TestimonialManagement'
import SubscriptionManagement from './pages/admin/SubscriptionManagement'
import AtelierManagement from './pages/admin/AtelierManagement'
import FooterManagement from './pages/admin/FooterManagement'
import AdminLogin from './pages/admin/Login'
import ProtectedRoute from './components/admin/ProtectedRoute'
import MediaManagement from './pages/admin/MediaManagement'
import PageManagement from './pages/admin/PageManagement'
import SignatureManagement from './pages/admin/SignatureManagement'
import HomeSectionsManager from './pages/admin/HomeSectionsManager'
import SubscriptionPlansManagement from './pages/admin/SubscriptionPlansManagement'
import VideoJourneyManagement from './pages/admin/VideoJourneyManagement'
import InventoryManagement from './pages/admin/InventoryManagement'
import SettingsManagement from './pages/admin/SettingsManagement'
import CustomerManagement from './pages/admin/CustomerManagement'
import OrderManagement from './pages/admin/OrderManagement'
import SubscriptionOrders from './pages/admin/SubscriptionOrders'
import DeliveryArea from './pages/DeliveryArea'
import DeliveryAreaManagement from './pages/admin/DeliveryAreaManagement'
import DeliveryAreaContentManagement from './pages/admin/DeliveryAreaContentManagement'
import DiscountManagement from './pages/admin/DiscountManagement'
import EmailTemplateManagement from './pages/admin/EmailTemplateManagement'


function NestedCollectionWrapper() {
  const { slug, subslug } = useParams();
  return <CollectionPage slug={`${slug}/${subslug}`} />;
}

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <BrowserRouter>
          <SettingsContent />
        </BrowserRouter>
      </SettingsProvider>
    </ThemeProvider>
  )
}

import ComingSoon from './pages/ComingSoon'
import { useLocation } from 'react-router-dom'

import { motion } from 'framer-motion'
import { Gauge } from 'lucide-react'

function SettingsContent() {
  const { settings, loading } = useSettings();
  const location = useLocation();

  useEffect(() => {
    // Apply visual protocol (CSS Variables)
    if (settings.theme_color) {
      document.documentElement.style.setProperty('--brand-primary', settings.theme_color);
      document.documentElement.style.setProperty('--brand-accent', settings.theme_color);
    }
    if (settings.secondary_color) {
      document.documentElement.style.setProperty('--brand-secondary', settings.secondary_color);
    }
    if (settings.site_name) {
      document.title = settings.site_slogan ? `${settings.site_name} - ${settings.site_slogan}` : settings.site_name;
    }
    if (settings.site_favicon) {
      const favicon = document.querySelector('link[rel="icon"]');
      const faviconUrl = getImageUrl(settings.site_favicon);
      if (favicon) {
        favicon.href = faviconUrl;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = faviconUrl;
        document.head.appendChild(newFavicon);
      }
    }

    // Handle Language Attribute
    if (settings.default_language) {
      const langMap = {
        'Hindi': 'hi',
        'Spanish': 'es',
        'French': 'fr',
        'Arabic': 'ar',
        'German': 'de',
        'Italian': 'it',
        'Tamil': 'ta',
        'Chinese': 'zh',
        'Japanese': 'ja',
        'Russian': 'ru',
        'Portuguese': 'pt'
      };
      const langCode = langMap[settings.default_language] || 'en';
      document.documentElement.setAttribute('lang', langCode);
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050505] text-white relative overflow-hidden">
        {/* Ambient Glow */}
        <motion.div
          initial={{ opacity: 0.2, scale: 0.8 }}
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[140px]"
        />

        <div className="relative flex flex-col items-center gap-12">
          {/* Premium Loader Architecture */}
          <div className="relative w-28 h-28">
            {/* Outer Spinning Ring */}
            <motion.div
              className="absolute inset-0 border-t-[3px] border-r-[1px] border-brand-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner Counter-Spinning Ring */}
            <motion.div
              className="absolute inset-3 border-b-[2px] border-l-[1px] border-brand-primary/20 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center text-brand-primary">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Gauge size={38} strokeWidth={1.5} />
              </motion.div>
            </div>
          </div>

          {/* Branding & Status */}
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.8em" }}
              transition={{ duration: 1.5 }}
              className="text-[14px] font-bold uppercase text-brand-primary ml-[0.8em]"
            >
              {settings.site_name || 'MBW LUXURY'}
            </motion.div>

            <div className="flex items-center gap-[2px]">
              {"IGNITING PREMIUM EXPERIENCE".split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.3] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: index * 0.04,
                    ease: "easeInOut"
                  }}
                  className="text-[10px] font-light uppercase tracking-[0.1em] text-white/60"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Progress Line */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="h-full bg-brand-primary shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.5)]"
          />
        </div>
      </div>
    );
  }


  const isMaintenanceMode = settings.site_status === 'maintenance' || settings.site_status === 'coming_soon';
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <ScrollToTop />
          {!isAdminPath && <CustomCursor />}
          {!isAdminPath && <FloatingContactBar />}
          <Routes>
            {/* 1. Admin Management Suite (Always Accessible for Admins) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/header" element={<ProtectedRoute><MenuOverview /></ProtectedRoute>} />
            <Route path="/admin/banners" element={<ProtectedRoute><BannerManagement /></ProtectedRoute>} />
            <Route path="/admin/benefits" element={<ProtectedRoute><BenefitManagement /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><CategoryManagement /></ProtectedRoute>} />
            <Route path="/admin/faqs" element={<ProtectedRoute><FaqManagement /></ProtectedRoute>} />
            <Route path="/admin/testimonials" element={<ProtectedRoute><TestimonialManagement /></ProtectedRoute>} />
            <Route path="/admin/video-journey" element={<ProtectedRoute><VideoJourneyManagement /></ProtectedRoute>} />
            <Route path="/admin/signature" element={<ProtectedRoute><SignatureManagement /></ProtectedRoute>} />
            <Route path="/admin/home-sections" element={<ProtectedRoute><HomeSectionsManager /></ProtectedRoute>} />
            <Route path="/admin/newsletter" element={<ProtectedRoute><SubscriptionManagement /></ProtectedRoute>} />
            <Route path="/admin/atelier" element={<ProtectedRoute><AtelierManagement /></ProtectedRoute>} />
            <Route path="/admin/footer" element={<ProtectedRoute><FooterManagement /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />
            <Route path="/admin/subscription-orders" element={<ProtectedRoute><SubscriptionOrders /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><SettingsManagement /></ProtectedRoute>} />
            <Route path="/admin/media" element={<ProtectedRoute><MediaManagement /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
            <Route path="/admin/pages" element={<ProtectedRoute><PageManagement /></ProtectedRoute>} />
            <Route path="/admin/subscription-plans" element={<ProtectedRoute><SubscriptionPlansManagement /></ProtectedRoute>} />
            <Route path="/admin/customers" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
            <Route path="/admin/delivery-areas" element={<ProtectedRoute><DeliveryAreaManagement /></ProtectedRoute>} />
            <Route path="/admin/delivery-content" element={<ProtectedRoute><DeliveryAreaContentManagement /></ProtectedRoute>} />
            <Route path="/admin/discounts" element={<ProtectedRoute><DiscountManagement /></ProtectedRoute>} />
            <Route path="/admin/email-templates" element={<ProtectedRoute><EmailTemplateManagement /></ProtectedRoute>} />

            {/* 2. Maintenance / Coming Soon Guard */}
            {isMaintenanceMode && !isAdminPath && (
              <Route path="*" element={<ComingSoon />} />
            )}

            {/* 3. Standard Storefront Routes (Only render if not in maintenance) */}
            {!isMaintenanceMode && (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/account" element={<Account />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/delivery-area" element={<DeliveryArea />} />
                <Route path="/subscribe" element={<Subscribe />} />
                <Route path="/:slug" element={<CollectionPage />} />
                <Route path="/category/:slug" element={<CollectionPage />} />
                <Route path="/category/:slug/:subslug" element={<NestedCollectionWrapper />} />
              </>
            )}
          </Routes>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
