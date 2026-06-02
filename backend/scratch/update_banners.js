const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');
const Banner = require('../src/models/Banner');

async function main() {
  console.log('Updating banners in database...');
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully.');

    console.log('Truncating banners table...');
    await sequelize.query('TRUNCATE TABLE banners RESTART IDENTITY CASCADE;');

    console.log('Seeding 4 Jio Hotstar Banners...');
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
        type: 'Jio Hotstar',
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
        promoBadge: 'CHEF SPECIAL',
        promoTitle: 'Steamed Podi Idlis • Rich Aromatic Spices',
        promoSubtitle: 'Podi Idli',
        promoInfo: 'SPICY • COW GHEE • HAND-CRAFTED SPICES',
        status: 'Active',
        position: 2
      },
      {
        title: 'Traditional Filter Coffee',
        subtitle: 'Rich, chicory-infused South Indian filter coffee stretched to perfection in authentic brassware.',
        image: '/uploads/foods_banner_3.png',
        type: 'Jio Hotstar',
        btnOneText: 'EXPLORE BEVERAGES',
        btnOneLink: '/category/beverages',
        btnTwoText: 'RITUAL',
        btnTwoLink: '/category/beverages',
        statOneNum: 'Aromatic',
        statOneLabel: 'Chicory Blend',
        statTwoNum: 'Hot',
        statTwoLabel: 'Frothy Pour',
        statThreeNum: 'Authentic',
        statThreeLabel: 'Brassware',
        topTagline: 'MORNING RITUAL',
        promoBadge: 'AUTHENTIC',
        promoTitle: 'Pure Coffee • Chicory Blend • Served Hot',
        promoSubtitle: 'Filter Coffee',
        promoInfo: 'HOT BREW • AROMATIC • TRADITIONAL POUR',
        status: 'Active',
        position: 3
      },
      {
        title: 'Crispy Golden Paper Dosa',
        subtitle: 'Thin, ultra-crispy golden paper roast dosa served with traditional piping hot sambar and fresh homemade coconut and tomato chutneys.',
        image: '/uploads/foods_banner_4.png',
        type: 'Jio Hotstar',
        btnOneText: 'ORDER DOSA',
        btnOneLink: '/category/dosas',
        btnTwoText: 'FULL MENU',
        btnTwoLink: '/category/dosas',
        statOneNum: 'Crispy',
        statOneLabel: 'Golden Texture',
        statTwoNum: 'Fresh',
        statTwoLabel: 'Hot Griddle',
        statThreeNum: '3 Types',
        statThreeLabel: 'Chutneys',
        topTagline: 'FESTIVAL SPECIALS',
        promoBadge: 'BESTSELLER',
        promoTitle: 'Crispy Dosa • Traditional Chutneys • Authentic',
        promoSubtitle: 'Paper Dosa',
        promoInfo: '2026 • VEG • GOLDEN GLOW • PIPING HOT',
        status: 'Active',
        position: 4
      }
    ];

    await Banner.bulkCreate(banners);
    console.log('Successfully seeded 4 Jio Hotstar Banners!');

  } catch (err) {
    console.error('Error seeding banners:', err);
  } finally {
    await sequelize.close();
  }
}

main();
