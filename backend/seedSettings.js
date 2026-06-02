const Setting = require('./src/models/Setting');
const AtelierHour = require('./src/models/AtelierHour');
const FooterLink = require('./src/models/FooterLink');
const sequelize = require('./src/config/database');

const seedSettings = async () => {
    try {
        // Removed sync({ alter: true }) for VPS safety
        const defaults = [
            { group: 'site', key: 'site_name', value: 'MBW Luxury', type: 'string' },
            { group: 'site', key: 'contact_email', value: 'hello@mbwluxury.com', type: 'string' },
            { group: 'site', key: 'site_logo', value: '', type: 'string' },
            { group: 'site', key: 'site_favicon', value: '', type: 'string' },
            { group: 'site', key: 'site_meta_description', value: 'Elite automotive enhancements and premium car accessories for the discerning driver.', type: 'string' },
            { group: 'site', key: 'theme_color', value: '#7c3aed', type: 'string' },
            { group: 'site', key: 'secondary_color', value: '#fafaf9', type: 'string' },
            { group: 'business', key: 'currency', value: 'USD', type: 'string' },
            { group: 'business', key: 'tax_rate', value: '18', type: 'number' },
            { group: 'business', key: 'delivery_fee', value: '99', type: 'number' },
            { group: 'business', key: 'same_day_delivery', value: 'true', type: 'boolean' },
            { group: 'business', key: 'operating_country', value: 'United States', type: 'string' },
            { group: 'business', key: 'timezone', value: 'America/New_York', type: 'string' },
            { group: 'business', key: 'date_format', value: 'MM/DD/YYYY', type: 'string' },
            { group: 'business', key: 'shop_phone', value: '+1 (555) 000-0000', type: 'string' },
            { group: 'business', key: 'shop_whatsapp', value: '+1 (555) 000-0000', type: 'string' },
            { group: 'business', key: 'shop_address', value: '123 Floral Ave, New York, NY 10001', type: 'string' },
            { group: 'business', key: 'min_order_amount', value: '50', type: 'number' },
            { group: 'business', key: 'daily_order_limit', value: '0', type: 'number' },
            { group: 'business', key: 'disabled_delivery_dates', value: '', type: 'string' },
            { group: 'business', key: 'same_day_cutoff', value: '14:00', type: 'string' },
            { group: 'business', key: 'measurement_unit', value: 'imperial', type: 'string' },
            { group: 'site', key: 'social_instagram', value: '', type: 'string' },
            { group: 'site', key: 'social_facebook', value: '', type: 'string' },
            { group: 'site', key: 'social_pinterest', value: '', type: 'string' },
            { group: 'site', key: 'primary_font', value: "'Outfit', sans-serif", type: 'string' },
            { group: 'site', key: 'secondary_font', value: "'Playfair Display', serif", type: 'string' },
            { group: 'site', key: 'announcement_text', value: 'FREE SHIPPING ON ALL ORDERS OVER ₹5000 | SHOP NEW INTERIOR DROPS', type: 'string' },
            { group: 'site', key: 'announcement_bg_color', value: '#facc15', type: 'string' },
            { group: 'site', key: 'announcement_text_color', value: '#ffffff', type: 'string' },
            { group: 'site', key: 'announcement_mode', value: 'static', type: 'string' },
            { group: 'site', key: 'mail_from_name', value: 'MBW Studio', type: 'string' },
            { group: 'site', key: 'mail_register_from_id', value: 'taskenginembw@gmail.com', type: 'string' },
            { group: 'site', key: 'mail_register_app_password', value: 'rgxi vkao aqli pafs', type: 'string' },
            { group: 'site', key: 'mail_order_from_id', value: 'taskenginembw@gmail.com', type: 'string' },
            { group: 'site', key: 'mail_order_app_password', value: 'rgxi vkao aqli pafs', type: 'string' },
            { group: 'site', key: 'mail_admin_email', value: 'concierge@mbwstudio.com', type: 'string' },
            { group: 'site', key: 'mail_enable_register', value: 'true', type: 'boolean' },
            { group: 'site', key: 'mail_enable_order_customer', value: 'true', type: 'boolean' },
            { group: 'site', key: 'mail_enable_order_admin', value: 'true', type: 'boolean' },
            { group: 'site', key: 'mail_enable_password_reset', value: 'true', type: 'boolean' },
            { group: 'business', key: 'low_stock_limit', value: '10', type: 'number' },
            // Breakfast Plan Seeds
            { group: 'subscription', key: 'sub_menu_breakfast_monday', value: 'Ghee Podi Idli (4 Pcs)', type: 'string' },
            { group: 'subscription', key: 'sub_menu_breakfast_tuesday', value: 'Spicy Mysore Masala Dosa', type: 'string' },
            { group: 'subscription', key: 'sub_menu_breakfast_wednesday', value: 'Steaming Sambar Idli (2 Pcs)', type: 'string' },
            { group: 'subscription', key: 'sub_menu_breakfast_thursday', value: 'Healthy Oats & Carrot Idli (2 Pcs)', type: 'string' },
            { group: 'subscription', key: 'sub_menu_breakfast_friday', value: 'Healthy Ragi Finger Millet Dosa', type: 'string' },
            { group: 'subscription', key: 'sub_menu_breakfast_saturday', value: 'Steaming Sambar Idli (2 Pcs)', type: 'string' },
            { group: 'subscription', key: 'sub_menu_breakfast_sunday', value: 'Mini Button Idlis with Sambar (12 Pcs)', type: 'string' },
            
            // Lunch Plan Seeds
            { group: 'subscription', key: 'sub_menu_lunch_monday', value: 'Traditional South Indian Rice Feast (Sambar, Rasam, Veggies, Curd)', type: 'string' },
            { group: 'subscription', key: 'sub_menu_lunch_tuesday', value: 'Delicious Mini Meals (Variety Rice, Poriyal, Appalam)', type: 'string' },
            { group: 'subscription', key: 'sub_menu_lunch_wednesday', value: 'Healthy Millet Rice Special (Millets, Kootu, Butter Milk)', type: 'string' },
            { group: 'subscription', key: 'sub_menu_lunch_thursday', value: 'Flavorful Lemon Rice & Potato Fry', type: 'string' },
            { group: 'subscription', key: 'sub_menu_lunch_friday', value: 'Authentic Curry Leaf Rice & Curd Rice Combo', type: 'string' },
            { group: 'subscription', key: 'sub_menu_lunch_saturday', value: 'Special Veg Biryani & Onion Raitha', type: 'string' },
            { group: 'subscription', key: 'sub_menu_lunch_sunday', value: 'Grand Festive South Indian Thali', type: 'string' },

            // Dinner Plan Seeds
            { group: 'subscription', key: 'sub_menu_dinner_monday', value: 'Soft Chapati (3 Pcs) with Veg Kurma', type: 'string' },
            { group: 'subscription', key: 'sub_menu_dinner_tuesday', value: 'Light Wheat Dosa with Tomato Chutney', type: 'string' },
            { group: 'subscription', key: 'sub_menu_dinner_wednesday', value: 'Fluffy Phulka (3 Pcs) with Paneer Masala', type: 'string' },
            { group: 'subscription', key: 'sub_menu_dinner_thursday', value: 'Healthy Ragi Roti with Coconut Chutney', type: 'string' },
            { group: 'subscription', key: 'sub_menu_dinner_friday', value: 'Flaky Malabar Parotta (2 Pcs) with Veg Salna', type: 'string' },
            { group: 'subscription', key: 'sub_menu_dinner_saturday', value: 'Crispy Plain Dosa with Sambar & Chutney', type: 'string' },
            { group: 'subscription', key: 'sub_menu_dinner_sunday', value: 'Steaming Hot Idli (3 Pcs) with Spicy Chutney', type: 'string' }
        ];

        for (const s of defaults) {
            await Setting.findOrCreate({
                where: { key: s.key },
                defaults: s
            });
        }

        // Seed Default Atelier Hours
        const existingHours = await AtelierHour.count();
        if (existingHours === 0) {
            const defaultHours = [
                { day: 'Mon', hours: '8:30 AM - 4:30 PM', isClosed: false, position: 1 },
                { day: 'Tue', hours: '8:30 AM - 4:30 PM', isClosed: false, position: 2 },
                { day: 'Wed', hours: '8:30 AM - 4:30 PM', isClosed: false, position: 3 },
                { day: 'Thu', hours: '8:30 AM - 4:30 PM', isClosed: false, position: 4 },
                { day: 'Fri', hours: '8:30 AM - 6:30 PM', isClosed: false, position: 5 },
                { day: 'Sat', hours: '10:00 AM - 6:00 PM', isClosed: false, position: 6 },
                { day: 'Sun', hours: 'Closed', isClosed: true, position: 7 }
            ];
            await AtelierHour.bulkCreate(defaultHours);
            console.log('Atelier Registry: Initial hours synchronized.');
        }

        // Seed Default Footer Links
        const existingLinks = await FooterLink.count();
        if (existingLinks === 0) {
            const defaultLinks = [
                // Artisanal Studio
                { category: 'Artisanal Studio', label: 'Our Philosophy', url: '#', position: 1 },
                { category: 'Artisanal Studio', label: 'Floral Archives', url: '#', position: 2 },
                { category: 'Artisanal Studio', label: 'Sustainability', url: '#', position: 3 },
                { category: 'Artisanal Studio', label: 'Bespoke Suites', url: '#', position: 4 },
                
                // Client Service
                { category: 'Client Service', label: 'Track Acquisition', url: '#', position: 5 },
                { category: 'Client Service', label: 'Delivery Protocol', url: '#', position: 6 },
                { category: 'Client Service', label: 'Care Instructions', url: '#', position: 7 },
                { category: 'Client Service', label: 'Returns Archive', url: '#', position: 8 },
                
                // The Collective
                { category: 'The Collective', label: 'Easter', url: '/easter', position: 9 },
                { category: 'The Collective', label: 'Roses', url: '/roses', position: 10 },
                { category: 'The Collective', label: 'Birthday', url: '/birthday', position: 11 },
                { category: 'The Collective', label: 'Sympathy', url: '#', position: 12 },
                { category: 'The Collective', label: 'Occasions', url: '#', position: 13 },
                { category: 'The Collective', label: 'Holidays', url: '#', position: 14 }
            ];
            await FooterLink.bulkCreate(defaultLinks);
            console.log('Atelier Registry: Default footer links deployed.');
        }

        console.log('Atelier Registry: Default settings commissioned successfully.');
    } catch (err) {
        console.error('Atelier Registry: Seeding failed:', err);
    }
};

module.exports = seedSettings;

if (require.main === module) {
    seedSettings();
}
