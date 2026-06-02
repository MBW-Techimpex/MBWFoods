import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageHelper';
import { IconClock, IconBrandInstagram, IconBrandFacebook, IconMail } from '@tabler/icons-react';

const ComingSoon = () => {
    const { settings } = useSettings();

    const translations = {
        English: {
            soon: "Soon",
            maintenance: "Maintenance",
            status: "Refining the Experience",
            description_soon: "We're currently re-engineering our digital archive to provide you with the most premium automotive accessory selection.",
            description_maintenance: "We are currently performing scheduled maintenance to enhance your experience. We'll be back shortly.",
            follow: "Follow our Journey"
        },
        Hindi: {
            soon: "जल्द आ रहा है",
            maintenance: "रखरखाव",
            status: "अनुभव को बेहतर बना रहे हैं",
            description_soon: "हम वर्तमान में आपको सबसे प्रीमियम ऑटोमोटिव एक्सेसरी चयन प्रदान करने के लिए अपने डिजिटल संग्रह को फिर से तैयार कर रहे हैं।",
            description_maintenance: "हम वर्तमान में आपके अनुभव को बेहतर बनाने के लिए निर्धारित रखरखाव कर रहे हैं। हम जल्द ही वापस आएंगे।",
            follow: "हमारे साथ जुड़ें"
        },
        Arabic: {
            soon: "قريباً",
            maintenance: "تحت الصيانة",
            status: "تحسين التجربة",
            description_soon: "نحن نعمل حالياً على إعادة هندسة أرشيفنا الرقمي لنقدم لكم أرقى تشكيلة من إكسسوارات السيارات.",
            description_maintenance: "نحن نقوم حالياً بأعمال صيانة مجدولة لتحسين تجربتكم. سنعود إليكم قريباً.",
            follow: "تابعوا رحلتنا"
        },
        Spanish: {
            soon: "Próximamente",
            maintenance: "En Mantenimiento",
            status: "Refinando la Experiencia",
            description_soon: "Estamos rediseñando nuestro archivo digital para ofrecerle la selección de accesorios automotrices más premium.",
            description_maintenance: "Estamos realizando un mantenimiento programado para mejorar su experiencia. Volveremos en breve.",
            follow: "Sigue nuestro Viaje"
        },
        French: {
            soon: "Bientôt",
            maintenance: "En Maintenance",
            status: "Raffinage de l'Expérience",
            description_soon: "Nous réorganisons actuellement nos archives numériques pour vous offrir la sélection d'accessoires automobiles la plus haut de gamme.",
            description_maintenance: "Nous effectuons actuellement une maintenance programmée pour améliorer votre expérience. Nous serons de retour sous peu.",
            follow: "Suivez notre Parcours"
        },
        German: {
            soon: "Demnächst",
            maintenance: "Wartungsarbeiten",
            status: "Optimierung des Erlebnisses",
            description_soon: "Wir überarbeiten derzeit unser digitales Archiv, um Ihnen die hochwertigste Auswahl an Autozubehör zu bieten.",
            description_maintenance: "Wir führen derzeit geplante Wartungsarbeiten durch, um Ihr Erlebnis zu verbessern. Wir sind in Kürze wieder für Sie da.",
            follow: "Folgen Sie unserer Reise"
        },
        Italian: {
            soon: "Prossimamente",
            maintenance: "In Manutenzione",
            status: "Perfezionando l'Esperienza",
            description_soon: "Stiamo riprogettando il nostro archivio digitale per offrirti la selezione di accessori automobilistici più esclusiva.",
            description_maintenance: "Stiamo effettuando una manutenzione programmata per migliorare la tua esperienza. Torneremo a breve.",
            follow: "Segui il nostro Viaggio"
        },
        Tamil: {
            soon: "விரைவில்",
            maintenance: "பராமரிப்பில்",
            status: "அனுபவத்தை மேம்படுத்துகிறோம்",
            description_soon: "உங்களுக்கு மிகச் சிறந்த வாகன உதிரிபாகங்களைத் தேர்ந்தெடுப்பதற்காக எங்களது டிஜிட்டல் காப்பகத்தை நாங்கள் தற்போது மறுவடிவமைப்பு செய்து வருகிறோம்.",
            description_maintenance: "உங்கள் அனுபவத்தை மேம்படுத்த நாங்கள் தற்போது திட்டமிடப்பட்ட பராமரிப்பைச் செய்து வருகிறோம். விரைவில் திரும்புவோம்.",
            follow: "எங்கள் பயணத்தைப் பின்தொடரவும்"
        },
        Chinese: {
            soon: "即将推出",
            maintenance: "维护中",
            status: "优化体验中",
            description_soon: "我们目前正在重新设计我们的数字档案，为您提供最优质的汽车配件选择。",
            description_maintenance: "我们目前正在进行定期维护，以增强您的体验。我们将很快回来。",
            follow: "关注我们的动态"
        },
        Japanese: {
            soon: "まもなく公開",
            maintenance: "メンテナンス中",
            status: "エクスペリエンスを向上中",
            description_soon: "現在、最高級のカーアクセサリーセレクションをお届けするために、デジタルアーカイブの再構築を行っています。",
            description_maintenance: "現在、より良い体験を提供するために定期メンテナンスを行っています。まもなく再開いたします。",
            follow: "最新情報をチェック"
        },
        Russian: {
            soon: "Скоро",
            maintenance: "Техническое обслуживание",
            status: "Улучшаем работу",
            description_soon: "Мы обновляем наш цифровой архив, чтобы предложить вам самый премиальный выбор автомобильных аксессуаров.",
            description_maintenance: "В настоящее время мы проводим плановое техническое обслуживание. Мы скоро вернемся.",
            follow: "Следите за нашими новостями"
        },
        Portuguese: {
            soon: "Em Breve",
            maintenance: "Em Manutenção",
            status: "Refinando a Experiência",
            description_soon: "Estamos atualmente redesenhando nosso arquivo digital para oferecer a você a seleção mais premium de acessórios automotivos.",
            description_maintenance: "Estamos realizando uma manutenção programada para melhorar sua experiência. Voltaremos em breve.",
            follow: "Siga nossa Jornada"
        }
    };

    const t = translations[settings.default_language] || translations.English;
    const isHindi = settings.default_language === 'Hindi';
    const isArabic = settings.default_language === 'Arabic';
    const isMaintenance = settings.site_status === 'maintenance';

    return (
        <div className={`min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-6 ${isArabic ? 'font-sans' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
            {/* Background Aesthetic */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-accent/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 opacity-30 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
                {/* Logo Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12"
                >
                    <div className="h-24 md:h-32 flex items-center justify-center mx-auto mb-8">
                        {settings.site_logo ? (
                            <img 
                                src={getImageUrl(settings.site_logo)} 
                                alt={settings.site_name} 
                                className="h-full w-auto object-contain brightness-0 invert"
                            />
                        ) : (
                            <span className="text-4xl font-black text-white tracking-tighter uppercase">
                                {settings.site_name || 'MBW'}
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* Content Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md mb-4">
                        <IconClock size={18} className="text-brand-primary animate-pulse" />
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">{t.status}</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-serif italic text-white leading-tight tracking-tighter">
                        {isMaintenance ? t.maintenance : t.soon}
                    </h1>

                    <p className="max-w-xl mx-auto text-slate-400 text-lg md:text-xl font-light leading-relaxed">
                        {isMaintenance ? t.description_maintenance : t.description_soon}
                    </p>

                    <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">{t.follow}</span>
                            <div className="flex gap-6">
                                <a href={settings.social_instagram || "#"} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary hover:border-brand-primary transition-all duration-300">
                                    <IconBrandInstagram size={20} />
                                </a>
                                <a href={settings.social_facebook || "#"} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary hover:border-brand-primary transition-all duration-300">
                                    <IconBrandFacebook size={20} />
                                </a>
                                <a href={`mailto:${settings.contact_email || ""}`} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary hover:border-brand-primary transition-all duration-300">
                                    <IconMail size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer Attribution */}
            <div className="absolute bottom-10 left-0 right-0 text-center opacity-30">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.5em]">
                    &copy; {new Date().getFullYear()} {settings.site_name || 'MBW'} Archive
                </p>
            </div>
        </div>
    );
};

export default ComingSoon;
