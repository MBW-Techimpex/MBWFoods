const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');

const Setting = require('../src/models/Setting');
const Banner = require('../src/models/Banner');
const Category = require('../src/models/Category');
const Benefit = require('../src/models/Benefit');
const Faq = require('../src/models/Faq');
const Testimonial = require('../src/models/Testimonial');
const AtelierHour = require('../src/models/AtelierHour');
const Product = require('../src/models/Product');
const HomeSection = require('../src/models/HomeSection');
const HomeSectionItem = require('../src/models/HomeSectionItem');
const SectionSetting = require('../src/models/SectionSetting');
const { Menu, SubMenu, HeaderConfig } = require('../src/models/Menu');

async function main() {
  console.log('Starting MBW Foods Sequelize database seeding...');
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully.');

    console.log('Truncating tables...');
    // Clear dynamic home and catalog tables using raw SQL CASCADE truncate to handle foreign keys cleanly
    await sequelize.query('TRUNCATE TABLE banners, "Categories", "Benefits", "Faqs", "Testimonials", atelierhours, products, home_sections, home_section_items, "Menus", "SubMenus", "HeaderConfigs", collections RESTART IDENTITY CASCADE;');
    console.log('Tables truncated successfully.');

    // 1. SEED SETTINGS
    console.log('Seeding settings...');
    const settingsToUpdate = [
      { group: 'site', key: 'site_name', value: 'MBW Foods', type: 'string' },
      { group: 'site', key: 'site_description', value: 'Premium South Indian Vegetarian Cuisine & Authentic Idlis', type: 'string' },
      { group: 'site', key: 'theme_color', value: '#D97706', type: 'string' }, // Premium golden amber
      { group: 'site', key: 'secondary_color', value: '#FFFBEB', type: 'string' }, // Soft warm cream
      { group: 'site', key: 'announcement_text', value: 'FREE DELIVERY ON ALL ORDERS OVER ₹500 | FRESH & HYGIENIC SOUTH INDIAN DELICACIES', type: 'string' },
      { group: 'site', key: 'announcement_bg_color', value: '#D97706', type: 'string' },
      { group: 'site', key: 'announcement_text_color', value: '#FFFFFF', type: 'string' },
      { group: 'site', key: 'mail_from_name', value: 'MBW Foods', type: 'string' },
      { group: 'business', key: 'headquarters_address', value: '27 Bazullah Road, T. Nagar, Chennai, Tamil Nadu 600017', type: 'string' },
      { group: 'business', key: 'shop_address', value: '27 Bazullah Road, T. Nagar, Chennai, Tamil Nadu 600017', type: 'string' },
      { group: 'business', key: 'shop_phone', value: '+91 82200 12393', type: 'string' },
      { group: 'business', key: 'shop_whatsapp', value: '+91 82200 12393', type: 'string' },
      { group: 'site', key: 'floating_bar_phone', value: '82200 12393', type: 'string' },
      { group: 'site', key: 'floating_bar_whatsapp', value: '82200 12393', type: 'string' },
      { group: 'site', key: 'contact_email', value: 'hello@mbwfoods.com', type: 'string' },
      { group: 'site', key: 'mail_admin_email', value: 'concierge@mbwfoods.com', type: 'string' },
      { group: 'business', key: 'currency', value: 'INR', type: 'string' },
      { group: 'business', key: 'delivery_fee', value: '40', type: 'number' },
      { group: 'business', key: 'min_order_amount', value: '150', type: 'number' },
      { group: 'site', key: 'site_logo', value: '/uploads/logo_foods.png', type: 'string' },
      { group: 'site', key: 'site_favicon', value: '/uploads/logo_foods.png', type: 'string' },
      { group: 'site', key: 'footer_logo', value: '/uploads/logo_foods.png', type: 'string' }
    ];

    // Clear matching settings to prevent duplicate keys
    await Setting.destroy({
      where: {
        key: settingsToUpdate.map(s => s.key)
      }
    });

    await Setting.bulkCreate(settingsToUpdate);
    console.log('Settings seeded.');

    // 2. SEED BANNERS
    console.log('Seeding Banners...');
    const banners = [
      {
        title: 'Authentic South Indian Flavors',
        subtitle: 'Experience the traditional warmth of home-style delicacies, fresh off the stone-grind and served with love.',
        image: '/uploads/foods_banner_1.png',
        type: 'Jio Hotstar',
        btnOneText: 'ORDER ONLINE',
        btnOneLink: '/category/idlis',
        btnTwoText: 'OUR STORY',
        btnTwoLink: '/about',
        statOneNum: '100%',
        statOneLabel: 'Organic & Fresh',
        statTwoNum: '0%',
        statTwoLabel: 'Preservatives',
        statThreeNum: '10K+',
        statThreeLabel: 'Happy Diners',
        topTagline: 'MBW FOODS SPECIALS',
        promoBadge: 'RATED 4.9★',
        promoTitle: 'Breakfast • Main Course • Authentic South Indian',
        promoSubtitle: 'Sambar Idli',
        promoInfo: '2026 • VEG • FRESH BATTER • STONE-GROUND',
        status: 'Active',
        position: 1
      },
      {
        title: 'Golden Crispy Ghee Podi Idlis',
        subtitle: 'Glazed in rich pure cow ghee and coated in our secret aromatic spices. The perfect combination of soft and spicy.',
        image: '/uploads/foods_banner_2.png',
        type: 'Hero Slider',
        btnOneText: 'EXPLORE MENU',
        btnOneLink: '/category/idlis',
        btnTwoText: 'DINE IN HOURS',
        btnTwoLink: '#atelier',
        statOneNum: 'Pure',
        statOneLabel: 'Cow Ghee',
        statTwoNum: 'Fresh',
        statTwoLabel: 'Every Hour',
        statThreeNum: 'Hot',
        statThreeLabel: 'To Your Door',
        topTagline: 'TRADITIONAL FAVORITES',
        promoBadge: 'Chef Special',
        promoTitle: 'Ghee Podi',
        promoSubtitle: 'Glistening Gold',
        promoInfo: 'Rich Aromatic Spices',
        status: 'Active',
        position: 2
      },
      {
        title: 'Traditional Filter Coffee',
        subtitle: 'Rich, chicory-infused South Indian filter coffee stretched to perfection in authentic brassware.',
        image: '/uploads/foods_banner_3.png',
        type: 'Poster Image',
        btnOneText: 'EXPLORE BEVERAGES',
        btnOneLink: '/category/beverages',
        btnTwoText: 'RITUAL',
        btnTwoLink: '/category/beverages',
        status: 'Active',
        position: 3
      }
    ];
    await Banner.bulkCreate(banners);
    console.log('Banners seeded.');

    // 3. SEED CATEGORIES
    console.log('Seeding Categories...');
    const categories = [
      { name: 'Idlis', count: '6 Items', image: '/uploads/cat_idlis.png', status: 'Active', shape: 'rounded-t-full', link: '/category/idlis', position: 1 },
      { name: 'Dosas', count: '5 Items', image: '/uploads/cat_dosas.png', status: 'Active', shape: 'rounded-t-full', link: '/category/dosas', position: 2 },
      { name: 'Traditional Sweets', count: '4 Items', image: '/uploads/cat_sweets.png', status: 'Active', shape: 'rounded-t-full', link: '/category/traditional-sweets', position: 3 },
      { name: 'Snacks', count: '8 Items', image: '/uploads/cat_snacks.png', status: 'Active', shape: 'rounded-t-full', link: '/category/snacks', position: 4 },
      { name: 'Beverages', count: '3 Items', image: '/uploads/cat_beverages.png', status: 'Active', shape: 'rounded-t-full', link: '/category/beverages', position: 5 }
    ];
    await Category.bulkCreate(categories);
    console.log('Categories seeded.');

    // 4. SEED BENEFITS
    console.log('Seeding Benefits...');
    const benefits = [
      {
        title: 'Authentic Recipes',
        description: 'Generations-old traditional recipes cooked with organic ingredients and no artificial preservatives.',
        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        status: 'Active',
        position: 1
      },
      {
        title: 'Premium Ingredients',
        description: 'We use stone-ground batter, pure golden cow ghee, and hand-selected spices for authentic home-style flavors.',
        icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
        status: 'Active',
        position: 2
      },
      {
        title: 'Fresh & Hot Delivery',
        description: 'All food is prepared fresh against your order and delivered in insulated containers to ensure it reaches you piping hot.',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        status: 'Active',
        position: 3
      }
    ];
    await Benefit.bulkCreate(benefits);
    console.log('Benefits seeded.');

    // 5. SEED FAQS
    console.log('Seeding FAQs...');
    const faqs = [
      {
        question: 'Do you use artificial colors or preservatives?',
        answer: 'Absolutely not. We pride ourselves on authentic cooking. Our idli batters, chutneys, and sambar are prepared fresh daily using completely natural ingredients.',
        status: 'Active',
        position: 1
      },
      {
        question: 'How long can I store the fresh idli/dosa batter?',
        answer: 'Our fresh stone-ground batter can be refrigerated and used for up to 3 to 4 days. Always keep it in an airtight container.',
        status: 'Active',
        position: 2
      },
      {
        question: 'Do you cater for family events and festival bulk orders?',
        answer: 'Yes! We cater bulk orders for festivals, family functions, and corporate events. Contact our concierge number or email us to customize your menu.',
        status: 'Active',
        position: 3
      }
    ];
    await Faq.bulkCreate(faqs);
    console.log('FAQs seeded.');

    // 6. SEED TESTIMONIALS
    console.log('Seeding Testimonials...');
    const testimonials = [
      {
        name: 'Priya Ramanathan',
        designation: 'Food Critic, Chennai Times',
        quote: 'The Ghee Podi Idlis here are out of this world. Soft as clouds, rich in flavor, and perfectly seasoned. Reminds me of my grandmother\'s kitchen cooking.',
        image: '/uploads/priya_ramanathan.png',
        status: 'Active',
        position: 1
      },
      {
        name: 'Umesh Vaidya',
        designation: 'Software Architect & Regular Patron',
        quote: 'Finding authentic home-style South Indian breakfast locally is rare. MBW Foods has nailed the consistency. Their Filter Coffee is an absolute daily ritual for me.',
        image: '/uploads/umesh_vaidya.png',
        status: 'Active',
        position: 2
      }
    ];
    await Testimonial.bulkCreate(testimonials);
    console.log('Testimonials seeded.');

    // 7. SEED ATELIER HOURS
    console.log('Seeding Operating Hours...');
    const hours = [
      { day: 'Mon', hours: '7:00 AM - 11:30 AM & 5:00 PM - 10:30 PM', isClosed: false, position: 1 },
      { day: 'Tue', hours: '7:00 AM - 11:30 AM & 5:00 PM - 10:30 PM', isClosed: false, position: 2 },
      { day: 'Wed', hours: '7:00 AM - 11:30 AM & 5:00 PM - 10:30 PM', isClosed: false, position: 3 },
      { day: 'Thu', hours: '7:00 AM - 11:30 AM & 5:00 PM - 10:30 PM', isClosed: false, position: 4 },
      { day: 'Fri', hours: '7:00 AM - 11:30 AM & 5:00 PM - 10:30 PM', isClosed: false, position: 5 },
      { day: 'Sat', hours: '7:00 AM - 12:00 PM & 4:30 PM - 11:00 PM', isClosed: false, position: 6 },
      { day: 'Sun', hours: '7:00 AM - 12:00 PM & 4:30 PM - 11:00 PM', isClosed: false, position: 7 }
    ];
    await AtelierHour.bulkCreate(hours);
    console.log('Operating hours seeded.');

    // 8. SEED SECTION SETTINGS
    console.log('Seeding Section Settings...');
    const sectionTexts = [
      { key: 'whychooseus_tagline', value: 'The MBW Standard' },
      { key: 'whychooseus_heading', value: 'Why Choose MBW Foods?' },
      { key: 'whychooseus_description', value: 'We define the intersection of rich culinary tradition and elite dining standards.' },
      { key: 'explorecategories_tagline', value: 'ORGANIC CULINARY SECTIONS' },
      { key: 'explorecategories_heading', value: 'Discover Authentic Taste' },
      { key: 'explorecategories_quote', value: '"Redefining South Indian dining through traditional stone-ground perfection."' },
      { key: 'faq_tagline', value: 'Common Inquiries' },
      { key: 'faq_heading', value: 'Your Questions, Answered.' },
      { key: 'faq_description', value: 'Everything you need to know about ingredients, freshness, and our culinary standards.' },
      { key: 'testimonials_tagline', value: 'Happy Diners' },
      { key: 'testimonials_heading', value: 'Shared Delights.' },
      { key: 'atelier_tagline', value: 'Visit Our Restaurant' },
      { key: 'atelier_heading', value: 'Step into our dining room in T. Nagar to experience authentic South Indian hospitality and piping hot idlis.' },
      { key: 'atelier_location_title', value: 'Dining Location' },
      { key: 'atelier_location_text', value: '27 Bazullah Road, T. Nagar, Chennai, Tamil Nadu 600017' },
      { key: 'atelier_concierge_title', value: 'Home Delivery & Concierge' },
      { key: 'atelier_concierge_text', value: '+91 82200 12393, order@mbwfoods.com' },
      { key: 'subscription_tagline', value: 'Culinary Club Membership' },
      { key: 'subscription_heading', value: 'Never miss a fresh batch with our VIP dining club' },
      { key: 'subscription_description', value: 'Save up to 25% on daily breakfast subscriptions and receive exclusive access to special festival menus.' },
      { key: 'subscription_image', value: '/uploads/subscription_banner.png' }
    ];

    for (const t of sectionTexts) {
      await SectionSetting.upsert(t);
    }
    console.log('Section settings updated.');

    // 9. SEED PRODUCTS
    console.log('Seeding products...');
    const products = [
      {
        id: 1001,
        name: 'Ghee Podi Idli (4 Pcs)',
        price: '120.00',
        image: '/uploads/prod_podi_idli.png',
        description: 'Soft, fluffy steamed idlis tossed in pure cow ghee and our aromatic home-style gunpowder spice mix.',
        badge: 'Best Seller',
        stock: 100,
        sub_category: 'Idlis',
        category: 'Breakfast',
        status: 'Active'
      },
      {
        id: 1002,
        name: 'Steaming Sambar Idli (2 Pcs)',
        price: '90.00',
        image: '/uploads/prod_sambar_idli.png',
        description: 'Classic steamed idlis completely submerged in piping hot, vegetable-rich traditional sambar.',
        badge: 'Must Try',
        stock: 150,
        sub_category: 'Idlis',
        category: 'Breakfast',
        status: 'Active'
      },
      {
        id: 1003,
        name: 'Traditional Rava Idli (2 Pcs)',
        price: '100.00',
        image: '/uploads/prod_rava_idli.png',
        description: 'Steamed semolina cakes spiced with mustard seeds, green chilies, curry leaves, and cashews.',
        badge: 'Healthy Choice',
        stock: 80,
        sub_category: 'Idlis',
        category: 'Breakfast',
        status: 'Active'
      },
      {
        id: 1004,
        name: 'Crispy Paper Roast Dosa',
        price: '130.00',
        image: '/uploads/prod_paper_dosa.png',
        description: 'Large, paper-thin crispy rice and lentil crêpe roasted with pure cow ghee.',
        badge: 'Kids Favorite',
        stock: 90,
        sub_category: 'Dosas',
        category: 'Breakfast',
        status: 'Active'
      },
      {
        id: 1005,
        name: 'Piping Hot Filter Coffee',
        price: '60.00',
        image: '/uploads/prod_filter_coffee.png',
        description: 'Authentic chicory-infused South Indian filter coffee stretched to perfection with foaming fresh milk.',
        badge: 'Signature',
        stock: 200,
        sub_category: 'Beverages',
        category: 'Beverages',
        status: 'Active'
      },
      {
        id: 1006,
        name: 'Traditional Ghee Mysore Pak (250g)',
        price: '220.00',
        image: '/uploads/prod_mysore_pak.png',
        description: 'Melt-in-your-mouth authentic sweet prepared with gram flour, premium cow ghee, and sugar.',
        badge: 'Best Seller',
        stock: 80,
        sub_category: 'Sweets',
        category: 'Traditional Sweets',
        status: 'Active'
      },
      {
        id: 1007,
        name: 'Crispy Kara Murukku (250g)',
        price: '110.00',
        image: '/uploads/prod_murukku.png',
        description: 'Crunchy, spiced rice-flour coiled snacks prepared using traditional family recipes.',
        badge: 'Snack Time',
        stock: 120,
        sub_category: 'Snacks',
        category: 'Snacks',
        status: 'Active'
      }
    ];
    await Product.bulkCreate(products);
    console.log('Products seeded.');

    // 10. SEED HOMEPAGE SECTIONS
    console.log('Seeding Home Sections...');
    const homeSections = [
      {
        id: 1,
        section_type: 'signature',
        title: 'Our Signature Delicacies',
        subtitle: 'HOT & FRESH SPECIALS',
        description: 'Authentic South Indian items prepared daily from fresh stone-ground batter.'
      },
      {
        id: 2,
        section_type: 'discovery',
        title: 'Festival Specials & Sweets',
        subtitle: 'SWEETS & SNACKS',
        description: 'Celebrate traditional celebrations with our authentic ghee sweets and crunchy snacks.'
      }
    ];
    await HomeSection.bulkCreate(homeSections);
    console.log('Home sections seeded.');

    // 11. SEED HOME SECTION ITEMS
    console.log('Seeding Home Section Items...');
    const homeSectionItems = [
      // Signature Section Items
      { section_type: 'signature', title: 'Ghee Podi Idli (4 Pcs)', price: '120.00', image: '/uploads/prod_podi_idli.png', badge: 'Best Seller', position: 1, product_id: 1001 },
      { section_type: 'signature', title: 'Steaming Sambar Idli (2 Pcs)', price: '90.00', image: '/uploads/prod_sambar_idli.png', badge: 'Must Try', position: 2, product_id: 1002 },
      { section_type: 'signature', title: 'Traditional Rava Idli (2 Pcs)', price: '100.00', image: '/uploads/prod_rava_idli.png', badge: 'Healthy Choice', position: 3, product_id: 1003 },
      { section_type: 'signature', title: 'Crispy Paper Roast Dosa', price: '130.00', image: '/uploads/prod_paper_dosa.png', badge: 'Kids Favorite', position: 4, product_id: 1004 },

      // Discovery Section Items
      { section_type: 'discovery', title: 'Traditional Ghee Mysore Pak (250g)', price: '220.00', image: '/uploads/prod_mysore_pak.png', badge: 'Best Seller', position: 1, product_id: 1006 },
      { section_type: 'discovery', title: 'Crispy Kara Murukku (250g)', price: '110.00', image: '/uploads/prod_murukku.png', badge: 'Snack Time', position: 2, product_id: 1007 },
      { section_type: 'discovery', title: 'Piping Hot Filter Coffee', price: '60.00', image: '/uploads/prod_filter_coffee.png', badge: 'Signature', position: 3, product_id: 1005 }
    ];
    await HomeSectionItem.bulkCreate(homeSectionItems);
    console.log('Home section items seeded.');

    // 12. SEED BRANDED HEADER CONFIG
    console.log('Seeding branded HeaderConfig...');
    await HeaderConfig.create({
      logoUrl: '/uploads/logo_foods.png',
      logoTitle: 'MBW FOODS',
      logoSubtitle: 'House of Idlies',
      searchPlaceholder: 'Search for soft idlis, crispy dosas, filter coffee...',
      accountTopText: 'Hello, Sign In',
      accountBottomText: 'My Account',
      homeIconName: 'IconLayoutDashboard',
      homeLink: '/',
      showHeader: true
    });
    console.log('HeaderConfig seeded.');

    // 13. SEED BRANDED MENUS
    console.log('Seeding dynamic navigation menus...');
    const menu1 = await Menu.create({
      name: 'Breakfast & Lunch',
      type: 'Mega Menu',
      status: 'active',
      position: 1,
      link: '#',
      collectionTitle: 'Morning Feast',
      collectionSubtitle: 'STONE-GROUND & FRESH',
      collectionDescription: 'Soft cloud-like steaming idlis and golden crispy ghee paper dosas made fresh daily.',
      collectionBadgeText: 'FRESH AT 7:00 AM',
      megaMenuTitle: 'Breakfast Specials',
      featuredImageUrl: '/uploads/foods_banner_1.png',
      specimenId: '#BF01',
      specimenTitle: 'Authentic South Indian Breakfast'
    });

    await SubMenu.bulkCreate([
      { name: 'Soft Steamed Idlis', position: 1, link: '/category/idlis', listHeader: 'Top Categories', menuId: menu1.id },
      { name: 'Golden Ghee Dosas', position: 2, link: '/category/dosas', listHeader: 'Top Categories', menuId: menu1.id },
      { name: 'Breakfast Combos', position: 3, link: '/category/idlis', listHeader: 'Top Categories', menuId: menu1.id },
      { name: 'Morning Specials', position: 4, link: '/category/idlis', listHeader: 'Top Categories', menuId: menu1.id },
      { name: 'Available All Day', position: 5, link: '/category/idlis', listHeader: 'Navigation Links', menuId: menu1.id },
      { name: 'All Day Long Specials', position: 6, link: '/category/dosas', listHeader: 'Navigation Links', menuId: menu1.id },
      { name: 'Kid\'s Breakfast Menu', position: 7, link: '/category/idlis', listHeader: 'Navigation Links', menuId: menu1.id },
      { name: 'Morning & Evening Specials', position: 8, link: '/category/idlis', listHeader: 'Navigation Links', menuId: menu1.id }
    ]);

    const menu2 = await Menu.create({
      name: 'Dinner & Specials',
      type: 'Mega Menu',
      status: 'active',
      position: 2,
      link: '#',
      collectionTitle: 'Evening Delights',
      collectionSubtitle: 'TRADITIONAL FLAVORS',
      collectionDescription: 'Indulge in vegetable-rich hot sambar, crispy traditional appetizers, and signature kitchen specials.',
      collectionBadgeText: 'SERVED FROM 5:00 PM',
      megaMenuTitle: 'Dinner & House Specials',
      featuredImageUrl: '/uploads/foods_banner_2.png',
      specimenId: '#DN02',
      specimenTitle: 'Traditional Indian Dinner'
    });

    await SubMenu.bulkCreate([
      { name: 'Dinner Specials', position: 1, link: '/category/idlis', listHeader: 'Top Categories', menuId: menu2.id },
      { name: 'Evening Specials', position: 2, link: '/category/dosas', listHeader: 'Top Categories', menuId: menu2.id },
      { name: 'House Specials', position: 3, link: '/category/idlis', listHeader: 'Top Categories', menuId: menu2.id },
      { name: 'Traditional Appetizers', position: 4, link: '/category/snacks', listHeader: 'Top Categories', menuId: menu2.id },
      { name: 'Evening Special Combos', position: 5, link: '/category/idlis', listHeader: 'Navigation Links', menuId: menu2.id },
      { name: 'Kitchen Stories', position: 6, link: '/about', listHeader: 'Navigation Links', menuId: menu2.id },
      { name: 'Chef\'s Handcrafted Plates', position: 7, link: '/category/idlis', listHeader: 'Navigation Links', menuId: menu2.id },
      { name: 'Kids Dinner Menu', position: 8, link: '/category/dosas', listHeader: 'Navigation Links', menuId: menu2.id }
    ]);

    const menu3 = await Menu.create({
      name: 'Sweets & Beverages',
      type: 'Mega Menu',
      status: 'active',
      position: 3,
      link: '#',
      collectionTitle: 'Sweet Confections',
      collectionSubtitle: 'PURE COW GHEE',
      collectionDescription: 'Celebrate traditional celebrations with our melt-in-your-mouth Mysore Pak and frothy filter coffee.',
      collectionBadgeText: '100% PURE INGREDIENTS',
      megaMenuTitle: 'Traditional Sweets & Hot Brews',
      featuredImageUrl: '/uploads/foods_banner_3.png',
      specimenId: '#SW03',
      specimenTitle: 'South Indian Coffee & Sweets'
    });

    await SubMenu.bulkCreate([
      { name: 'Traditional Sweets', position: 1, link: '/category/traditional-sweets', listHeader: 'Top Categories', menuId: menu3.id },
      { name: 'Crunchy Kara Snacks', position: 2, link: '/category/snacks', listHeader: 'Top Categories', menuId: menu3.id },
      { name: 'South Indian Filter Coffee', position: 3, link: '/category/beverages', listHeader: 'Top Categories', menuId: menu3.id },
      { name: 'Sweet Mysore Pak', position: 4, link: '/category/traditional-sweets', listHeader: 'Top Categories', menuId: menu3.id },
      { name: 'Delicious Desserts', position: 5, link: '/category/traditional-sweets', listHeader: 'Navigation Links', menuId: menu3.id },
      { name: 'Festival Special Gift Packs', position: 6, link: '/category/traditional-sweets', listHeader: 'Navigation Links', menuId: menu3.id },
      { name: 'Hot & Cold Beverages', position: 7, link: '/category/beverages', listHeader: 'Navigation Links', menuId: menu3.id },
      { name: 'Crunchy Murukku Snacks', position: 8, link: '/category/snacks', listHeader: 'Navigation Links', menuId: menu3.id }
    ]);

    const menu4 = await Menu.create({
      name: 'Our Restaurant',
      type: 'Mega Menu',
      status: 'active',
      position: 4,
      link: '#',
      collectionTitle: 'Visit Our Atelier',
      collectionSubtitle: 'SOUTHERN HOSPITALITY',
      collectionDescription: 'Step into our warm dining room at T. Nagar, Chennai to enjoy piping hot delicacies directly from the griddle.',
      collectionBadgeText: 'T. NAGAR, CHENNAI',
      megaMenuTitle: 'Explore MBW Foods',
      featuredImageUrl: '/uploads/foods_banner_4.png',
      specimenId: '#AT04',
      specimenTitle: 'Dining & Southern Hospitality'
    });

    await SubMenu.bulkCreate([
      { name: 'Book Dine-In Table', position: 1, link: '#atelier', listHeader: 'Top Categories', menuId: menu4.id },
      { name: 'Operating Hours', position: 2, link: '#atelier', listHeader: 'Top Categories', menuId: menu4.id },
      { name: 'Home Delivery & Concierge', position: 3, link: '#atelier', listHeader: 'Top Categories', menuId: menu4.id },
      { name: 'Locate Us on Map', position: 4, link: '#atelier', listHeader: 'Top Categories', menuId: menu4.id },
      { name: 'Our Culinary Story', position: 5, link: '/about', listHeader: 'Navigation Links', menuId: menu4.id },
      { name: 'Customer Testimonials', position: 6, link: '#testimonials', listHeader: 'Navigation Links', menuId: menu4.id },
      { name: 'Frequently Asked Questions', position: 7, link: '#faq', listHeader: 'Navigation Links', menuId: menu4.id },
      { name: 'Contact Our Concierge', position: 8, link: '#atelier', listHeader: 'Navigation Links', menuId: menu4.id }
    ]);
    console.log('Navigation menus and submenus seeded.');

    // 14. SEED COLLECTION DETAIL DESCRIPTIONS (for inner category pages)
    console.log('Seeding category collections config details...');
    const collections = [
      {
        id: 1,
        slug: 'idlis',
        title: 'Soft Steaming',
        accent_title: 'Idlis',
        description: 'Traditional stone-ground fermented rice and black lentil steamed cakes, prepared fresh daily without any preservatives.',
        bg_gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        bg_class: 'bg-amber-50',
        title_class: 'text-amber-950',
        filter_field: 'sub_category',
        filter_value: 'Idlis',
        is_active: true
      },
      {
        id: 2,
        slug: 'dosas',
        title: 'Crispy Ghee',
        accent_title: 'Dosas',
        description: 'Thin crispy fermented savory crêpes roasted to a flawless golden crunch with pure cow ghee.',
        bg_gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        bg_class: 'bg-amber-50',
        title_class: 'text-amber-950',
        filter_field: 'sub_category',
        filter_value: 'Dosas',
        is_active: true
      },
      {
        id: 3,
        slug: 'traditional-sweets',
        title: 'Traditional Premium',
        accent_title: 'Sweets',
        description: 'Celebrate sweet moments with our legendary melt-in-your-mouth Ghee Mysore Pak and traditional festival sweets.',
        bg_gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        bg_class: 'bg-amber-50',
        title_class: 'text-amber-950',
        filter_field: 'sub_category',
        filter_value: 'Sweets',
        is_active: true
      },
      {
        id: 4,
        slug: 'snacks',
        title: 'Crunchy Kara',
        accent_title: 'Snacks',
        description: 'Enjoy hand-coiled, aromatic rice-flour savories and crunchy snacks made using heritage household recipes.',
        bg_gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        bg_class: 'bg-amber-50',
        title_class: 'text-amber-950',
        filter_field: 'sub_category',
        filter_value: 'Snacks',
        is_active: true
      },
      {
        id: 5,
        slug: 'beverages',
        title: 'Foaming Filter',
        accent_title: 'Coffee',
        description: 'Rich, authentic chicory-infused South Indian filter coffee stretched in traditional brassware.',
        bg_gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        bg_class: 'bg-amber-50',
        title_class: 'text-amber-950',
        filter_field: 'sub_category',
        filter_value: 'Beverages',
        is_active: true
      }
    ];

    for (const col of collections) {
      await sequelize.query(
        `INSERT INTO collections (id, slug, title, accent_title, description, bg_gradient, bg_class, title_class, filter_field, filter_value, is_active, created_at)
         VALUES (:id, :slug, :title, :accent_title, :description, :bg_gradient, :bg_class, :title_class, :filter_field, :filter_value, :is_active, NOW());`,
        { replacements: col }
      );
    }
    console.log('Collection configs seeded.');

    console.log('MBW Foods database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding MBW Foods database:', err);
  } finally {
    await sequelize.close();
  }
}

main();
