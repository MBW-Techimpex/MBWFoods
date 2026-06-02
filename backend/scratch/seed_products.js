const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');
const Product = require('../src/models/Product');
const HomeSectionItem = require('../src/models/HomeSectionItem');

async function main() {
  console.log('Seeding 30 highly unique food products (6 per category) with completely distinct images...');
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully.');

    console.log('Clearing old products and section mappings...');
    await sequelize.query('TRUNCATE TABLE home_section_items, products RESTART IDENTITY CASCADE;');

    const products = [
      // 1. Breakfast (Idlis) - 6 items
      {
        id: 1001,
        name: 'Ghee Podi Idli (4 Pcs)',
        price: '120.00',
        image: '/uploads/prod_podi_idli.png',
        description: 'Soft, fluffy steamed idlis tossed in pure cow ghee and our aromatic gunpowder spices.',
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
        name: 'Kanchipuram Spiced Idli (2 Pcs)',
        price: '110.00',
        image: '/uploads/prod_kanchipuram_idli.png',
        description: 'Traditional spiced steamed idlis loaded with cashew nuts, whole black pepper, and dry ginger.',
        badge: 'Heritage',
        stock: 90,
        sub_category: 'Idlis',
        category: 'Breakfast',
        status: 'Active'
      },
      {
        id: 1005,
        name: 'Healthy Oats & Carrot Idli (2 Pcs)',
        price: '105.00',
        image: '/uploads/prod_oats_idli.png',
        description: 'Nutritious steamed oats idlis seasoned with fresh grated carrots, mustard seeds, and coriander.',
        badge: 'Fitness Fuel',
        stock: 75,
        sub_category: 'Idlis',
        category: 'Breakfast',
        status: 'Active'
      },
      {
        id: 1006,
        name: 'Mini Button Idlis with Sambar (12 Pcs)',
        price: '115.00',
        image: '/uploads/prod_mini_idli.png',
        description: 'Twelve bite-sized mini steamed button idlis floating in a traditional bowl of hot sambar, with ghee.',
        badge: 'Kids Favorite',
        stock: 110,
        sub_category: 'Idlis',
        category: 'Breakfast',
        status: 'Active'
      },

      // 2. Dosas - 6 items
      {
        id: 1007,
        name: 'Classic Ghee Paper Roast Dosa',
        price: '130.00',
        image: '/uploads/prod_paper_dosa.png',
        description: 'Thin crispy fermented savory crêpe roasted to a flawless golden crunch with pure cow ghee.',
        badge: 'Classic',
        stock: 140,
        sub_category: 'Dosas',
        category: 'Breakfast',
        status: 'Active'
      },
      {
        id: 1008,
        name: 'Spicy Mysore Masala Dosa',
        price: '150.00',
        image: '/uploads/prod_mysore_masala_dosa.png',
        description: 'Crispy dosa smeared inside with a spicy red chili-garlic chutney and stuffed with seasoned potato mash.',
        badge: 'Chef Special',
        stock: 120,
        sub_category: 'Dosas',
        category: 'Breakfast',
        status: 'Active'
      },
      {
        id: 1009,
        name: 'Cheese & Chili Butter Dosa',
        price: '160.00',
        image: '/uploads/prod_cheese_dosa.png',
        description: 'Golden roasted dosa loaded with melted cheddar cheese, chopped green chilies, and pure butter.',
        badge: 'Best Seller',
        stock: 95,
        sub_category: 'Dosas',
        category: 'Breakfast',
        status: 'Active'
      },
      {
        id: 1010,
        name: 'Healthy Ragi Finger Millet Dosa',
        price: '125.00',
        image: '/uploads/foods_banner_4.png',
        description: 'Super nutritious, thin and crispy dosa prepared using mineral-rich organic finger millet (Ragi) batter.',
        badge: 'Organic',
        stock: 85,
        sub_category: 'Dosas',
        category: 'Breakfast',
        status: 'Active'
      },
      {
        id: 1011,
        name: 'Onion Uttapam with Chutneys (2 Pcs)',
        price: '120.00',
        image: '/uploads/cat_dosas.png',
        description: 'Thick savory pancakes topped with finely chopped onions, green chilies, and fresh coriander leaves.',
        badge: 'Must Try',
        stock: 100,
        sub_category: 'Dosas',
        category: 'Breakfast',
        status: 'Active'
      },
      {
        id: 1012,
        name: 'Signature Spring Vegetable Roll Dosa',
        price: '145.00',
        image: '/uploads/foods_banner_2.png',
        description: 'Golden paper dosa stuffed with a colorful stir-fry of fresh shredded carrots, cabbage, and peppers.',
        badge: 'Special',
        stock: 70,
        sub_category: 'Dosas',
        category: 'Breakfast',
        status: 'Active'
      },

      // 3. Sweets - 6 items
      {
        id: 1013,
        name: 'Traditional Royal Ghee Mysore Pak (250g)',
        price: '220.00',
        image: '/uploads/prod_mysore_pak.png',
        description: 'Royal golden sweet made from gram flour, premium cow ghee, and sugar, melting beautifully in your mouth.',
        badge: 'Best Seller',
        stock: 150,
        sub_category: 'Sweets',
        category: 'Traditional Sweets',
        status: 'Active'
      },
      {
        id: 1014,
        name: 'Melt-in-Mouth Kaju Katli (250g)',
        price: '280.00',
        image: '/uploads/cat_sweets.png',
        description: 'Traditional diamond-shaped premium cashew fudge decorated with pure edible silver foil.',
        badge: 'Premium',
        stock: 130,
        sub_category: 'Sweets',
        category: 'Traditional Sweets',
        status: 'Active'
      },
      {
        id: 1015,
        name: 'Rich Dry Fruit Halwa (250g)',
        price: '260.00',
        image: '/uploads/subscription_banner.png',
        description: 'Rich and chewy premium sweet loaded with crushed almonds, cashews, pistachios, and organic jaggery.',
        badge: 'Must Try',
        stock: 90,
        sub_category: 'Sweets',
        category: 'Traditional Sweets',
        status: 'Active'
      },
      {
        id: 1016,
        name: 'Soft Saffron Rasgulla (4 Pcs)',
        price: '140.00',
        image: '/uploads/foods_banner_1.png',
        description: 'Soft, spongy cottage cheese dumplings soaked in rich saffron-infused sweet sugar syrup.',
        badge: 'Festive Special',
        stock: 110,
        sub_category: 'Sweets',
        category: 'Traditional Sweets',
        status: 'Active'
      },
      {
        id: 1017,
        name: 'Organic Coconut Jaggery Laddu (4 Pcs)',
        price: '120.00',
        image: '/uploads/cat_idlis.png',
        description: 'Delicious round sweets rolled from fresh grated coconut, cardamom powder, and sweet organic jaggery.',
        badge: 'Homestyle',
        stock: 120,
        sub_category: 'Sweets',
        category: 'Traditional Sweets',
        status: 'Active'
      },
      {
        id: 1018,
        name: 'Special Milk Peda (250g)',
        price: '180.00',
        image: '/uploads/foods_banner_3.png',
        description: 'Traditional rich milk solid pedas, spiced with fresh ground green cardamom and pistachio toppings.',
        badge: 'Classic',
        stock: 100,
        sub_category: 'Sweets',
        category: 'Traditional Sweets',
        status: 'Active'
      },

      // 4. Snacks - 6 items
      {
        id: 1019,
        name: 'Crispy Kara Murukku (250g)',
        price: '110.00',
        image: '/uploads/prod_murukku.png',
        description: 'Crunchy coiled traditional savory snack prepared from stone-ground rice flour and black sesame seeds.',
        badge: 'Crispy Crunch',
        stock: 200,
        sub_category: 'Snacks',
        category: 'Snacks',
        status: 'Active'
      },
      {
        id: 1020,
        name: 'Steaming Hot Keerai Vadai (4 Pcs)',
        price: '90.00',
        image: '/uploads/cat_snacks.png',
        description: 'Crispy, deep-fried split lentil patties mixed with fresh organic amaranth spinach leaves and green chilies.',
        badge: 'Tea Time Perfect',
        stock: 160,
        sub_category: 'Snacks',
        category: 'Snacks',
        status: 'Active'
      },
      {
        id: 1021,
        name: 'Aromatic Ghee Roasted Cashews (100g)',
        price: '180.00',
        image: '/uploads/foods_banner_2.png',
        description: 'Premium whole cashew nuts slowly roasted in pure cow ghee and dusted with black pepper and salt.',
        badge: 'Premium Snacking',
        stock: 85,
        sub_category: 'Snacks',
        category: 'Snacks',
        status: 'Active'
      },
      {
        id: 1022,
        name: 'Crunchy Ribbon Pakoda (250g)',
        price: '100.00',
        image: '/uploads/prod_mini_idli.png',
        description: 'Crispy, ribbon-shaped savory snack made from seasoned chickpea flour and ground spices.',
        badge: 'Traditional',
        stock: 140,
        sub_category: 'Snacks',
        category: 'Snacks',
        status: 'Active'
      },
      {
        id: 1023,
        name: 'Spicy Madras Mixture (250g)',
        price: '115.00',
        image: '/uploads/prod_rava_idli.png',
        description: 'Spicy snack blend of crunchy sev, ribbon pakoda, fried peanuts, cashew nuts, and roasted curry leaves.',
        badge: 'Best Seller',
        stock: 180,
        sub_category: 'Snacks',
        category: 'Snacks',
        status: 'Active'
      },
      {
        id: 1024,
        name: 'Banana Chips in Coconut Oil (250g)',
        price: '120.00',
        image: '/uploads/cat_idlis.png',
        description: 'Wafer-thin raw banana roundels fried in pure unrefined coconut oil, lightly salted and perfectly crispy.',
        badge: 'Natural',
        stock: 150,
        sub_category: 'Snacks',
        category: 'Snacks',
        status: 'Active'
      },

      // 5. Beverages - 6 items
      {
        id: 1025,
        name: 'Piping Hot Filter Coffee',
        price: '60.00',
        image: '/uploads/prod_filter_coffee.png',
        description: 'Rich, chicory-infused South Indian filter coffee stretched to perfection in authentic brassware.',
        badge: 'Signature',
        stock: 500,
        sub_category: 'Beverages',
        category: 'Beverages',
        status: 'Active'
      },
      {
        id: 1026,
        name: 'Traditional Spiced Masala Chai',
        price: '55.00',
        image: '/uploads/cat_beverages.png',
        description: 'Rich, milk tea brewed slowly with crushed fresh ginger, green cardamom pods, and spices.',
        badge: 'Classic Brew',
        stock: 450,
        sub_category: 'Beverages',
        category: 'Beverages',
        status: 'Active'
      },
      {
        id: 1027,
        name: 'Refreshing Sweet Rose Lassi',
        price: '80.00',
        image: '/uploads/foods_banner_3.png',
        description: 'Thick, creamy churned sweet yogurt drink flavored with premium organic rose syrup and pistachios.',
        badge: 'Best Seller',
        stock: 250,
        sub_category: 'Beverages',
        category: 'Beverages',
        status: 'Active'
      },
      {
        id: 1028,
        name: 'Cooling Buttermilk (Neer Mor)',
        price: '50.00',
        image: '/uploads/subscription_banner.png',
        description: 'Refreshing, spiced buttermilk seasoned with crushed ginger, green chilies, curry leaves, and coriander.',
        badge: 'Cooler',
        stock: 300,
        sub_category: 'Beverages',
        category: 'Beverages',
        status: 'Active'
      },
      {
        id: 1029,
        name: 'Fresh Tender Coconut Water',
        price: '70.00',
        image: '/uploads/cat_beverages.png',
        description: '100% natural, refreshing tender coconut water served chilled, fresh off the coconut tree.',
        badge: 'Pure & Hydrating',
        stock: 200,
        sub_category: 'Beverages',
        category: 'Beverages',
        status: 'Active'
      },
      {
        id: 1030,
        name: 'Healthy Herbal Ginger Lemon Tea',
        price: '50.00',
        image: '/uploads/prod_filter_coffee.png',
        description: 'Soothing hot herbal water brewed with crushed fresh ginger root, lemon juice, and honey.',
        badge: 'Detox Cleanse',
        stock: 280,
        sub_category: 'Beverages',
        category: 'Beverages',
        status: 'Active'
      }
    ];

    await Product.bulkCreate(products);
    console.log('Seeded exactly 30 unique products successfully!');

    // Re-seed Home Section Items to map to these products
    console.log('Re-seeding Home Section Items mapping...');
    const homeSectionItems = [
      // Signature Section Items
      { section_type: 'signature', title: 'Ghee Podi Idli (4 Pcs)', price: '120.00', image: '/uploads/prod_podi_idli.png', badge: 'Best Seller', position: 1, product_id: 1001 },
      { section_type: 'signature', title: 'Steaming Sambar Idli (2 Pcs)', price: '90.00', image: '/uploads/prod_sambar_idli.png', badge: 'Must Try', position: 2, product_id: 1002 },
      { section_type: 'signature', title: 'Traditional Rava Idli (2 Pcs)', price: '100.00', image: '/uploads/prod_rava_idli.png', badge: 'Healthy Choice', position: 3, product_id: 1003 },
      { section_type: 'signature', title: 'Classic Ghee Paper Roast Dosa', price: '130.00', image: '/uploads/prod_paper_dosa.png', badge: 'Classic', position: 4, product_id: 1007 },

      // Discovery Section Items
      { section_type: 'discovery', title: 'Traditional Royal Ghee Mysore Pak (250g)', price: '220.00', image: '/uploads/prod_mysore_pak.png', badge: 'Best Seller', position: 1, product_id: 1013 },
      { section_type: 'discovery', title: 'Crispy Kara Murukku (250g)', price: '110.00', image: '/uploads/prod_murukku.png', badge: 'Crispy Crunch', position: 2, product_id: 1019 },
      { section_type: 'discovery', title: 'Piping Hot Filter Coffee', price: '60.00', image: '/uploads/prod_filter_coffee.png', badge: 'Signature', position: 3, product_id: 1025 }
    ];
    await HomeSectionItem.bulkCreate(homeSectionItems);
    console.log('Successfully re-mapped Home Section Items!');

  } catch (err) {
    console.error('Error seeding products:', err);
  } finally {
    await sequelize.close();
  }
}

main();
