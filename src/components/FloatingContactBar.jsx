import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { 
    IconBrandWhatsapp, 
    IconBrandFacebook, 
    IconBrandInstagram, 
    IconBrandLinkedin, 
    IconPhone, 
    IconArrowUp
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingContactBar = () => {
    const { settings } = useSettings();
    const { sidebarOpen } = useCart();
    const [isVisible, setIsVisible] = useState(false);

    const isBarEnabled = settings.floating_bar_enabled !== 'false';
    const isScrollToTopEnabled = settings.scroll_to_top_enabled !== 'false';

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isBarEnabled && !isScrollToTopEnabled) return null;
    if (sidebarOpen) return null;

    const contactLinks = [
        { 
            key: 'floating_bar_whatsapp', 
            icon: IconBrandWhatsapp, 
            color: 'bg-[#25D366]', 
            href: settings.floating_bar_whatsapp ? `https://wa.me/${settings.floating_bar_whatsapp.replace(/[^0-9]/g, '')}` : null,
            label: 'WhatsApp',
            enabled: settings.floating_bar_whatsapp_enabled !== 'false'
        },
        { 
            key: 'floating_bar_instagram', 
            icon: IconBrandInstagram, 
            color: 'bg-[#E4405F]', 
            href: settings.floating_bar_instagram,
            label: 'Instagram',
            enabled: settings.floating_bar_instagram_enabled !== 'false'
        },
        { 
            key: 'floating_bar_facebook', 
            icon: IconBrandFacebook, 
            color: 'bg-[#1877F2]', 
            href: settings.floating_bar_facebook,
            label: 'Facebook',
            enabled: settings.floating_bar_facebook_enabled !== 'false'
        },
        { 
            key: 'floating_bar_linkedin', 
            icon: IconBrandLinkedin, 
            color: 'bg-[#0A66C2]', 
            href: settings.floating_bar_linkedin,
            label: 'LinkedIn',
            enabled: settings.floating_bar_linkedin_enabled !== 'false'
        },
        { 
            key: 'floating_bar_phone', 
            icon: IconPhone, 
            color: 'bg-[#3b82f6]', 
            href: settings.floating_bar_phone ? `tel:${settings.floating_bar_phone}` : null,
            label: 'Call Us',
            enabled: settings.floating_bar_phone_enabled !== 'false'
        },
    ].filter(link => link.href && link.enabled);

    const themeColor = settings.theme_color || '#4f46e5';

    return (
        <>
            {/* Contact Buttons Stack - Right Side Center */}
            {isBarEnabled && (
                <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[9999] flex flex-col gap-3 items-center">
                    {contactLinks.map((link, index) => (
                        <motion.a
                            key={link.key}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`group relative w-12 h-12 ${link.color} text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 ring-4 ring-transparent hover:ring-white/20`}
                            title={link.label}
                        >
                            <link.icon size={24} stroke={2} />
                            <span className="absolute right-full mr-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-2xl border border-white/10 translate-x-2 group-hover:translate-x-0">
                                {link.label}
                            </span>
                        </motion.a>
                    ))}
                </div>
            )}

            {/* Scroll to Top - Bottom Right */}
            <div className="fixed bottom-6 right-6 z-[9999]">
                <AnimatePresence>
                    {isScrollToTopEnabled && isVisible && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            onClick={scrollToTop}
                            style={{ backgroundColor: themeColor }}
                            className="w-12 h-12 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all active:scale-95 group ring-4 ring-transparent hover:ring-blue-100/20"
                        >
                            <IconArrowUp size={24} stroke={2.5} className="group-hover:-translate-y-1 transition-transform" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default FloatingContactBar;
