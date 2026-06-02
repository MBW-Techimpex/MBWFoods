/**
 * Comprehensive Image Repair Utility
 * Fixes:
 * 1. Hardcoded localhost URLs (standardizes to current environment)
 * 2. Missing files (e.g. .jpg -> .webp conversion)
 * 3. Handles: Products, Banners, Home Sections, and Site Settings (Logos)
 */
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const UPLOAD_DIR = path.join(__dirname, 'uploads');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function repair() {
  // 1. Detect Environment Domain
  const isLive = process.env.NODE_ENV === 'production' || process.env.APP_DOMAIN?.includes('mbwhost.in');
  const targetDomain = isLive ? 'https://caraccessories.mbwhost.in' : 'http://localhost:3003';
  const oldLocalhost = 'http://localhost:3002'; // Legacy local port
  
  console.log(`🚀 Starting Image Repair Utility`);
  console.log(`Target Domain: ${targetDomain}`);
  console.log(`Environment: ${isLive ? 'LIVE' : 'LOCALHOST'}`);

  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    console.log(`Found ${files.length} files in uploads directory.`);

    // Helper to repair a single URL or path
    const fixImagePath = (val) => {
      if (!val || typeof val !== 'string') return val;
      let newVal = val;
      
      // Fix localhost domain
      newVal = newVal.replace(new RegExp(oldLocalhost, 'g'), targetDomain);
      
      // Fix path if missing from disk
      if (newVal.includes('/uploads/')) {
        const filename = newVal.split('/uploads/').pop();
        const ext = path.extname(filename);
        const basename = path.basename(filename, ext).toLowerCase();
        const fullPath = path.join(UPLOAD_DIR, filename);

        if (!fs.existsSync(fullPath)) {
          // Normalize basename for comparison (remove spaces, underscores, hyphens)
          const normBase = basename.replace(/[-_ ]/g, '');
          
          const match = files.find(f => {
            const fBase = path.basename(f, path.extname(f)).toLowerCase();
            const fNorm = fBase.replace(/[-_ ]/g, '');
            return (fNorm.includes(normBase) || normBase.includes(fNorm)) && /\.(webp|jpg|jpeg|png)$/i.test(f);
          });

          if (match) {
            newVal = newVal.replace(filename, match);
            console.log(`   [FIXED] ${filename} -> ${match}`);
          }
        }
      }
      return newVal;
    };

    // --- Step 1: Repair Products ---
    console.log('\n--- Repairing Products ---');
    const products = await pool.query('SELECT id, image, images FROM products');
    for (const p of products.rows) {
      const newImage = fixImagePath(p.image);
      let newImages = p.images;
      if (p.images) {
        try {
          const imgs = JSON.parse(p.images);
          if (Array.isArray(imgs)) {
            newImages = JSON.stringify(imgs.map(fixImagePath));
          }
        } catch (e) {
          newImages = fixImagePath(p.images);
        }
      }
      if (newImage !== p.image || newImages !== p.images) {
        await pool.query('UPDATE products SET id = id, image = $1, images = $2 WHERE id = $3', [newImage, newImages, p.id]);
        console.log(`   [UPDATED] Product ID: ${p.id}`);
      }
    }

    // --- Step 2: Repair Banners ---
    console.log('\n--- Repairing Banners ---');
    const bannerTables = ['banners', 'Banners'];
    for (const table of bannerTables) {
      try {
        const banners = await pool.query(`SELECT id, image FROM "${table}"`);
        for (const b of banners.rows) {
          const newImage = fixImagePath(b.image);
          if (newImage !== b.image) {
            await pool.query(`UPDATE "${table}" SET image = $1 WHERE id = $2`, [newImage, b.id]);
            console.log(`   [UPDATED] ${table} ID: ${b.id}`);
          }
        }
      } catch (e) {}
    }

    // --- Step 3: Repair Home Section Items ---
    console.log('\n--- Repairing Home Section Items ---');
    try {
      const items = await pool.query('SELECT id, image FROM home_section_items');
      for (const item of items.rows) {
        const newImage = fixImagePath(item.image);
        if (newImage !== item.image) {
          await pool.query('UPDATE home_section_items SET image = $1 WHERE id = $2', [newImage, item.id]);
          console.log(`   [UPDATED] Section Item ID: ${item.id}`);
        }
      }
    } catch (e) {}

    // --- Step 3.5: Repair Categories ---
    console.log('\n--- Repairing Categories ---');
    const catTables = ['categories', 'Categories'];
    for (const table of catTables) {
      try {
        const categories = await pool.query(`SELECT id, image FROM "${table}"`);
        for (const cat of categories.rows) {
          const newImage = fixImagePath(cat.image);
          if (newImage !== cat.image) {
            await pool.query(`UPDATE "${table}" SET image = $1 WHERE id = $2`, [newImage, cat.id]);
            console.log(`   [UPDATED] ${table} ID: ${cat.id}`);
          }
        }
      } catch (e) {}
    }

    // --- Step 3.6: Repair Testimonials ---
    console.log('\n--- Repairing Testimonials ---');
    const testTables = ['testimonials', 'Testimonials'];
    for (const table of testTables) {
      try {
        const testimonials = await pool.query(`SELECT id, image FROM "${table}"`);
        for (const t of testimonials.rows) {
          const newImage = fixImagePath(t.image);
          if (newImage !== t.image) {
            await pool.query(`UPDATE "${table}" SET image = $1 WHERE id = $2`, [newImage, t.id]);
            console.log(`   [UPDATED] ${table} ID: ${t.id}`);
          }
        }
      } catch (e) {}
    }

    // --- Step 4: Repair Site Settings (Logos, etc) ---
    console.log('\n--- Repairing Site Settings (Logos) ---');
    const settings = await pool.query('SELECT id, key, value FROM sectionsettings WHERE value LIKE \'%/uploads/%\' OR value LIKE \'%localhost%\'');
    for (const s of settings.rows) {
      const newValue = fixImagePath(s.value);
      if (newValue !== s.value) {
        await pool.query('UPDATE sectionsettings SET value = $1 WHERE id = $2', [newValue, s.id]);
        console.log(`   [UPDATED] Setting: ${s.key}`);
      }
    }

    // --- Step 5: Media Table Sync ---
    console.log('\n--- Finalizing Media Library URLs ---');
    await pool.query(`UPDATE media SET url = REPLACE(url, $1, $2)`, [oldLocalhost, targetDomain]);

    console.log('\n✅ Repair Complete! All home page and product images are synchronized.');
  } catch (err) {
    console.error('\n❌ Repair Failed:', err.message);
  } finally {
    await pool.end();
  }
}

repair();
