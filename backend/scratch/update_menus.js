const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');
const { Menu, SubMenu } = require('../src/models/Menu');

async function main() {
  console.log('Seeding dynamic mega menus in database with rich sub-categories...');
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully.');

    console.log('Truncating Menus and SubMenus tables...');
    await sequelize.query('TRUNCATE TABLE "SubMenus", "Menus" RESTART IDENTITY CASCADE;');

    // 1. Seed Menu 1: Breakfast & Lunch
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

    // 2. Seed Menu 2: Dinner & Specials
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

    // 3. Seed Menu 3: Sweets & Beverages
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

    // 4. Seed Menu 4: Our Restaurant
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

    console.log('Successfully seeded dynamic mega menus with 8 submenus each!');

  } catch (err) {
    console.error('Error seeding menus:', err);
  } finally {
    await sequelize.close();
  }
}

main();
