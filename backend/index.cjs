const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const { Pool } = require('pg');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { compressImage } = require('./src/utils/imageProcessor');

// Initialize Pool for non-sequelize routes
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});


// 1. IMPORT CENTRAL DATABASE
const sequelize = require('./src/config/database');

// 2. IMPORT ALL MODELS (Crucial: Models must be loaded before sync!)
const Admin = require('./src/models/Admin');
const { Menu, SubMenu, HeaderConfig } = require('./src/models/Menu');
const Banner = require('./src/models/Banner');
const Benefit = require('./src/models/Benefit');
const Category = require('./src/models/Category');
const Faq = require('./src/models/Faq');
const SectionSetting = require('./src/models/SectionSetting');
const Subscriber = require('./src/models/Subscriber');
const Permission = require('./src/models/Permission');
const seedPermissions = require('./seedPermissions');
const AtelierHour = require('./src/models/AtelierHour');
const FooterLink = require('./src/models/FooterLink');
const SocialLink = require('./src/models/SocialLink');
const Product = require('./src/models/Product');
const CustomerAddress = require('./src/models/CustomerAddress');

const ActivityLog = require('./src/models/ActivityLog');
const Setting = require('./src/models/Setting');
const FuneralContent = require('./src/models/FuneralContent');
const FuneralFacility = require('./src/models/FuneralFacility');
const HospitalContent = require('./src/models/HospitalContent');
const HospitalFacility = require('./src/models/HospitalFacility');
const DeliveryArea = require('./src/models/DeliveryArea');
const DeliveryAreaContent = require('./src/models/DeliveryAreaContent');
const DeliveryAreaPolicy = require('./src/models/DeliveryAreaPolicy');
const Customer = require('./src/models/Customer');
const Cart = require('./src/models/Cart');
const CartItem = require('./src/models/CartItem');
const Order = require('./src/models/Order');
const OrderItem = require('./src/models/OrderItem');
const Discount = require('./src/models/Discount');
const DiscountUsage = require('./src/models/DiscountUsage');
const HomeSection = require('./src/models/HomeSection');
const HomeSectionItem = require('./src/models/HomeSectionItem');
const Review = require('./src/models/Review');
const Wishlist = require('./src/models/Wishlist');
const VideoJourney = require('./src/models/VideoJourney');

// Associations
Admin.hasMany(ActivityLog, { foreignKey: 'admin_id' });
ActivityLog.belongsTo(Admin, { foreignKey: 'admin_id' });

Customer.hasMany(Cart, { foreignKey: 'customer_id' });
Cart.belongsTo(Customer, { foreignKey: 'customer_id' });

Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });

Customer.hasMany(Order, { foreignKey: 'customer_id' });
Order.belongsTo(Customer, { foreignKey: 'customer_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

Customer.hasMany(CustomerAddress, { foreignKey: 'customer_id', as: 'addresses' });
CustomerAddress.belongsTo(Customer, { foreignKey: 'customer_id' });

Discount.hasMany(DiscountUsage, { foreignKey: 'discount_id', as: 'usages' });
DiscountUsage.belongsTo(Discount, { foreignKey: 'discount_id' });
DiscountUsage.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasOne(DiscountUsage, { foreignKey: 'order_id' });

HomeSectionItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(HomeSectionItem, { foreignKey: 'product_id' });

Customer.hasMany(Wishlist, { foreignKey: 'customer_id' });
Wishlist.belongsTo(Customer, { foreignKey: 'customer_id' });
Wishlist.belongsTo(Product, { foreignKey: 'product_id' });


const app = express();


app.use('/uploads', (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const filePath = path.join(__dirname, 'uploads', req.path);

  if (fs.existsSync(filePath)) return next();

  // If the requested file doesn't exist and it has an extension
  if (ext !== '.webp' && ext !== '') {
    const basename = path.basename(req.path, ext);

    // 1. Try direct .webp fallback
    const webpPath = path.join(__dirname, 'uploads', basename + '.webp');
    if (fs.existsSync(webpPath)) {
      console.log(`[FALLBACK] Direct WebP: ${req.path} -> ${basename}.webp`);
      return res.sendFile(webpPath);
    }

    // 2. Fuzzy search for files containing the basename (handles prefixes/suffixes)
    try {
      const files = fs.readdirSync(path.join(__dirname, 'uploads'));
      // Find a file that contains the basename and is a webp/jpg/png
      const match = files.find(f =>
        (f.includes(basename) || basename.includes(f.replace(/\.[^.]+$/, ''))) &&
        /\.(webp|jpg|jpeg|png)$/i.test(f)
      );

      if (match) {
        console.log(`[FALLBACK] Fuzzy Match: ${req.path} -> ${match}`);
        return res.sendFile(path.join(__dirname, 'uploads', match));
      }
    } catch (e) {
      console.error('[FALLBACK] Fuzzy search error:', e.message);
    }

    console.log(`[FALLBACK] Failed to find match for: ${req.path}`);
  }
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Global Error Handlers to prevent server crashes
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global Request Logger for Debugging
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // For local image serving
  frameguard: false,
  contentSecurityPolicy: false
}));
app.use(cookieParser());

// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://127.0.0.1:5173',
//   process.env.FRONTEND_URL,
//   process.env.APP_DOMAIN,
//   'https://flowershop.mbwhost.in',
//   'http://flowershop.mbwhost.in',
//   'https://www.flowershop.mbwhost.in',
//   'http://www.flowershop.mbwhost.in'
// ].filter(Boolean);

app.use(cors({
  origin: true,
  credentials: true,
}));

// Rate limiting for API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const auditLogger = require('./src/middleware/audit');
app.use(auditLogger);

//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Global Image Storage Limit
const IMAGE_LIMIT = 5000;

/**
 * Middleware to check if image storage limit is reached
 */
const checkImageLimit = async (req, res, next) => {
  try {
    const files = await fs.promises.readdir(UPLOAD_DIR);
    // Count common image extensions
    const imageCount = files.filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)).length;

    if (imageCount >= IMAGE_LIMIT) {
      console.warn(`[LIMIT] Storage limit reached: ${imageCount}/${IMAGE_LIMIT}`);
      return res.status(400).json({
        error: `Storage limit reached. Your site has a limit of ${IMAGE_LIMIT} images. Please delete some images to upload new ones.`,
        limitReached: true,
        currentCount: imageCount,
        limit: IMAGE_LIMIT
      });
    }
    next();
  } catch (err) {
    console.error('[LIMIT CHECK] Error checking storage limit:', err);
    // Fail open to avoid blocking uploads if filesystem check fails
    next();
  }
};

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to avoid spaces and special chars
    const sanitized = file.originalname.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
    cb(null, sanitized);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 } // 10MB limit
});

// Upload Endpoint with Compression
app.post('/api/upload', checkImageLimit, (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File is too large (max 1MB)' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const originalSize = req.file.size / 1024; // KB

    try {
      console.log('[UPLOAD] Starting compression for:', req.file.path);
      // Use 50KB as target limit as requested by user
      const compressed = await compressImage(req.file.path, UPLOAD_DIR, 50);
      console.log('[UPLOAD] Compression successful:', compressed.filename);

      // Remove the original uncompressed file ONLY if it's a different file
      if (compressed.path !== req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log('[UPLOAD] Original file removed (different from compressed)');
      }

      const compressedSize = compressed.size.toFixed(2);
      const imageUrl = `${process.env.APP_DOMAIN}/uploads/${compressed.filename}`;

      // Also register in media table so it shows in Media Library
      try {
        const lastMediaResult = await pool.query('SELECT MAX(id) FROM media');
        const nextMediaId = (parseInt(lastMediaResult.rows[0].max) || 0) + 1;
        await pool.query(
          'INSERT INTO media (id, filename, url, file_size) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [nextMediaId, compressed.filename, imageUrl, `${compressedSize} KB`]
        );
        cachedTotalSizeKb = null; // Invalidate size cache
      } catch (mErr) {
        console.warn('[UPLOAD] Error registering in media table:', mErr.message);
      }

      res.json({
        imageUrl,
        originalSize: originalSize.toFixed(2),
        compressedSize: compressedSize
      });
    } catch (err) {
      console.error('[UPLOAD] Image compression failed:', err);
      // Fallback to original if compression fails
      const imageUrl = `${process.env.APP_DOMAIN}/uploads/${req.file.filename}`;

      // Also register in media table
      try {
        const lastMediaResult = await pool.query('SELECT MAX(id) FROM media');
        const nextMediaId = (parseInt(lastMediaResult.rows[0].max) || 0) + 1;
        const stats = fs.statSync(req.file.path);
        const fileSize = (stats.size / 1024).toFixed(2);
        await pool.query(
          'INSERT INTO media (id, filename, url, file_size) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [nextMediaId, req.file.filename, imageUrl, `${fileSize} KB`]
        );
        cachedTotalSizeKb = null; // Invalidate size cache on fallback
      } catch (mErr) {
        console.warn('[UPLOAD] Error registering in media table (fallback):', mErr.message);
      }

      res.json({
        imageUrl,
        originalSize: originalSize.toFixed(2),
        compressedSize: originalSize.toFixed(2)
      });
    }
  });
});


// 3. DATABASE SYNCHRONIZATION
sequelize
  .authenticate()
  .then(async () => {
    console.log('Central Database handshaking successful...');

    // Nuclear Option: Manually ensure columns exist to fix "column does not exist" errors
    try {
      await sequelize.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT;');
      await sequelize.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions VARCHAR(255);');
      await sequelize.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS weight VARCHAR(255);');
      await sequelize.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(10, 2);');
      await sequelize.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_price VARCHAR(255) DEFAULT \'0\';');
      await sequelize.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'Active\';');
      await sequelize.query('ALTER TABLE "HeaderConfigs" ADD COLUMN IF NOT EXISTS "showHeader" BOOLEAN DEFAULT true;');
      await sequelize.query('ALTER TABLE "SubMenus" ADD COLUMN IF NOT EXISTS "listHeader" VARCHAR(255) DEFAULT \'Top Categories\';');


      // Also check orders table for missing columns
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(255);');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10, 2) DEFAULT 0;');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) DEFAULT 0;');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS cgst DECIMAL(10, 2) DEFAULT 0;');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS sgst DECIMAL(10, 2) DEFAULT 0;');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS igst DECIMAL(10, 2) DEFAULT 0;');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;');


      // Initialize master visibility toggles if they don't exist
      await sequelize.query(`
        INSERT INTO sectionsettings (key, value, "createdAt", "updatedAt")
        VALUES ('banner_section_show', 'true', NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `);

      await sequelize.query(`
        INSERT INTO sectionsettings (key, value, "createdAt", "updatedAt")
        VALUES ('whychooseus_section_show', 'true', NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `);

      await sequelize.query(`
        INSERT INTO sectionsettings (key, value, "createdAt", "updatedAt")
        VALUES ('explorecategories_section_show', 'true', NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `);

      await sequelize.query(`
        INSERT INTO sectionsettings (key, value, "createdAt", "updatedAt")
        VALUES ('signature_section_show', 'true', NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `);

      await sequelize.query(`
        INSERT INTO sectionsettings (key, value, "createdAt", "updatedAt")
        VALUES ('faq_section_show', 'true', NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `);

      await sequelize.query(`
        INSERT INTO sectionsettings (key, value, "createdAt", "updatedAt")
        VALUES ('testimonials_section_show', 'true', NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `);

      await sequelize.query(`
        INSERT INTO sectionsettings (key, value, "createdAt", "updatedAt")
        VALUES ('subscription_section_show', 'true', NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `);

      await sequelize.query(`
        INSERT INTO sectionsettings (key, value, "createdAt", "updatedAt")
        VALUES ('atelier_section_show', 'true', NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `);

      await sequelize.query(`
        INSERT INTO sectionsettings (key, value, "createdAt", "updatedAt")
        VALUES ('footer_section_show', 'true', NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `);

      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(255);');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT \'pending\';');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(255);');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_zip VARCHAR(255);');

      // Ensure Wishlist table exists
      await Wishlist.sync();
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(255);');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE;');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS time_slot VARCHAR(255);');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_message TEXT;');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS occasion_type VARCHAR(255);');
      await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_notes TEXT;');

      // Ensure payment_methods table exists and has correct columns
      await sequelize.query('CREATE TABLE IF NOT EXISTS payment_methods (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, logo TEXT, status VARCHAR(50) DEFAULT \'Active\', "order" INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE);');

      // Ensure media table has file_size and unique constraint
      try {
        await sequelize.query('CREATE TABLE IF NOT EXISTS media (id SERIAL PRIMARY KEY, filename VARCHAR(255), url TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());');
        await sequelize.query('ALTER TABLE media ADD COLUMN IF NOT EXISTS file_size VARCHAR(255);');
        await sequelize.query('ALTER TABLE media ADD CONSTRAINT unique_filename UNIQUE (filename);').catch(() => { });
      } catch (mediaErr) {
        console.warn('Media table adjustment notice:', mediaErr.message);
      }

      // Ensure reset password columns exist for Admins and Customers
      try {
        await sequelize.query('ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "resetPasswordToken" VARCHAR(255);');
        await sequelize.query('ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "resetPasswordExpires" TIMESTAMP WITH TIME ZONE;');
        await sequelize.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);');
        await sequelize.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;');
      } catch (dbErr) {
        console.warn('Reset password columns adjustment notice:', dbErr.message);
      }

      // Ensure tax_rules table exists
      try {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS tax_rules (
            id SERIAL PRIMARY KEY,
            category VARCHAR(255) NOT NULL,
            sub_category VARCHAR(255) DEFAULT NULL,
            tax_rate DECIMAL(10, 2) NOT NULL DEFAULT 18.00,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
        await sequelize.query('ALTER TABLE tax_rules ADD CONSTRAINT unique_cat_subcat UNIQUE (category, sub_category);').catch(() => { });
      } catch (taxRulesErr) {
        console.warn('Tax rules table setup notice:', taxRulesErr.message);
      }

      try {
        await sequelize.query('ALTER TABLE home_sections ALTER COLUMN section_type TYPE VARCHAR(255);');
      } catch (e) {
        console.warn('Altering home_sections.section_type type notice:', e.message);
      }
      try {
        await sequelize.query('ALTER TABLE home_section_items ALTER COLUMN section_type TYPE VARCHAR(255);');
      } catch (e) {
        console.warn('Altering home_section_items.section_type type notice:', e.message);
      }


      // Fix live collection database configs that are set to "READYMADE FOODS" but use sub_category filtering
      try {
        await sequelize.query("UPDATE collections SET filter_value = 'Instant Breakfast Mixes' WHERE slug = 'instant-breakfast-mixes' AND filter_field = 'sub_category' AND filter_value = 'READYMADE FOODS';");
        await sequelize.query("UPDATE collections SET filter_value = 'Ready-to-Cook Products' WHERE slug = 'ready-to-cook-products' AND filter_field = 'sub_category' AND filter_value = 'READYMADE FOODS';");
        await sequelize.query("UPDATE collections SET filter_value = 'Ready-to-Eat Foods' WHERE slug = 'ready-to-eat-foods' AND filter_field = 'sub_category' AND filter_value = 'READYMADE FOODS';");
        await sequelize.query("UPDATE collections SET filter_value = 'Traditional South Indian Foods' WHERE slug = 'traditional-south-indian-foods' AND filter_field = 'sub_category' AND filter_value = 'READYMADE FOODS';");
        console.log('[COLLECTION REPAIR] Live collections filter_value successfully updated.');
      } catch (err) {
        console.warn('[COLLECTION REPAIR] Error repairing collections filter_value:', err.message);
      }

      console.log('Database columns verified and added if missing.');

    } catch (columnErr) {
      console.warn('Manual column addition notice (might already exist):', columnErr.message);
    }

    // Automatically sync models to create missing tables
    console.log('Synchronizing database models...');
    return sequelize.sync();
  })
  .then(async () => {
    console.log('Database tables synchronized successfully.');
    console.log('Central Database Integrated & Synced (Atelier Studio Rules Active).');

    // SYNC MEDIA LIBRARY WITH DISK (Safe to do after sync)
    try {
      await syncMediaWithDisk();
    } catch (sErr) {
      console.warn('[MEDIA SYNC] Post-startup sync warning:', sErr.message);
    }

    // Seeding required for active archival rules
    const seedSettings = require('./seedSettings');
    const { HeaderConfig } = require('./src/models/Menu');
    // const AtelierHour = require('./src/models/AtelierHour'); // Already imported at top
    // const FooterLink = require('./src/models/FooterLink'); // Already imported at top

    await seedSettings();
    await seedPermissions();

    // Ensure Breakfast Subscription Product (ID 9997) exists
    await Product.findOrCreate({
      where: { id: 9997 },
      defaults: {
        name: 'Weekly Breakfast Subscription Plan',
        description: '7-Day Predefined Breakfast Subscription Plan. Enjoy traditional and healthy breakfast every morning.',
        price: '1400.00',
        category: 'Subscription',
        sub_category: 'Breakfast',
        stock: 999999,
        status: 'Active',
        image: '/uploads/subscription_banner.png'
      }
    });

    // Ensure Lunch Subscription Product (ID 9998) exists
    await Product.findOrCreate({
      where: { id: 9998 },
      defaults: {
        name: 'Weekly Lunch Subscription Plan',
        description: '7-Day Predefined Lunch Subscription Plan. Hearty and delicious South Indian meals for lunch daily.',
        price: '2100.00',
        category: 'Subscription',
        sub_category: 'Lunch',
        stock: 999999,
        status: 'Active',
        image: '/uploads/subscription_banner.png'
      }
    });

    // Ensure Dinner Subscription Product (ID 9999) exists
    await Product.findOrCreate({
      where: { id: 9999 },
      defaults: {
        name: 'Weekly Dinner Subscription Plan',
        description: '7-Day Predefined Dinner Subscription Plan. Light and traditional dinners delivered hot every evening.',
        price: '2100.00',
        category: 'Subscription',
        sub_category: 'Dinner',
        stock: 999999,
        status: 'Active',
        image: '/uploads/subscription_banner.png'
      }
    });

    // Ensure default seeds exist
    const hCount = await HeaderConfig.count();
    if (hCount === 0) await HeaderConfig.create({});

    const PORT = process.env.PORT || 3003;
    const server = app.listen(PORT, () => {
      console.log(`🚀 STUDIO SERVER STABILIZED ON PORT ${PORT}`);
    });

    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.error(`[CRITICAL] Port ${PORT} is already in use.`);
        // Process will restart via nodemon if we exit
        process.exit(1);
      } else {
        console.error('[CRITICAL] Server Error:', e);
      }
    });
  })
  .catch((err) => {
    console.error('CRITICAL: Database Sync/Startup Error:', err);
    // Recovery mode if sync fails
    const PORT = process.env.PORT || 3003;
    app.listen(PORT, () => console.log(`🚀 STUDIO SERVER RUNNING (RECOVERY MODE) ON PORT ${PORT}`));
  });

// Dynamic multi-sheet Excel sample template generator
app.get('/api/products/sample-template', async (req, res) => {
  try {
    const { Menu, SubMenu } = require('./src/models/Menu');
    const exceljs = require('exceljs');

    // Fetch all active categories and subcategories
    const categories = await Menu.findAll({
      where: { status: 'active' },
      include: [{ model: SubMenu, as: 'subItems', where: { status: 'active' }, required: false }],
      order: [['position', 'ASC']]
    });

    const workbook = new exceljs.Workbook();
    workbook.creator = 'MBW Car Accessories';
    workbook.lastModifiedBy = 'Admin';

    if (categories.length === 0) {
      // Fallback worksheet if no categories are configured
      const sheet = workbook.addWorksheet('Default Catalog');
      sheet.columns = [
        { header: 'Name*', key: 'name', width: 30 },
        { header: 'Price*', key: 'price', width: 12 },
        { header: 'Stock*', key: 'stock', width: 10 },
        { header: 'Sub-Category*', key: 'sub_category', width: 25 },
        { header: 'Image URL', key: 'image', width: 35 },
        { header: 'Related Image URL 1', key: 'related_image_1', width: 25 },
        { header: 'Related Image URL 2', key: 'related_image_2', width: 25 },
        { header: 'Related Image URL 3', key: 'related_image_3', width: 25 },
        { header: 'Related Image URL 4', key: 'related_image_4', width: 25 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Badge', key: 'badge', width: 12 },
        { header: 'Dimensions', key: 'dimensions', width: 15 },
        { header: 'Weight', key: 'weight', width: 12 }
      ];
      sheet.getRow(1).font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    } else {
      // Create a hidden lookup sheet for subcategories to bypass the Excel 255-character literal limit!
      const lookupSheet = workbook.addWorksheet('__SubCategories');
      lookupSheet.state = 'hidden';

      let colIdx = 1;

      categories.forEach(cat => {
        // Excel worksheet name length limit is 31 chars. Remove invalid characters: \ / ? * : [ ]
        let sheetName = (cat.name || 'Category')
          .replace(/[\\\/\?\*\:\[\]]/g, '')
          .substring(0, 31)
          .trim();

        if (!sheetName) sheetName = `Cat-${cat.id}`;

        // Ensure unique sheet name
        let count = 1;
        let finalName = sheetName;
        while (workbook.getWorksheet(finalName)) {
          finalName = sheetName.substring(0, 31 - (count.toString().length + 1)) + `_${count}`;
          count++;
        }

        const sheet = workbook.addWorksheet(finalName);

        // Define columns (Dynamic Headings with Asterisk for Required Fields!)
        sheet.columns = [
          { header: 'Name*', key: 'name', width: 32 },
          { header: 'Price*', key: 'price', width: 14 },
          { header: 'Stock*', key: 'stock', width: 12 },
          { header: 'Sub-Category*', key: 'sub_category', width: 26 },
          { header: 'Image URL', key: 'image', width: 36 },
          { header: 'Related Image URL 1', key: 'related_image_1', width: 25 },
          { header: 'Related Image URL 2', key: 'related_image_2', width: 25 },
          { header: 'Related Image URL 3', key: 'related_image_3', width: 25 },
          { header: 'Related Image URL 4', key: 'related_image_4', width: 25 },
          { header: 'Description', key: 'description', width: 45 },
          { header: 'Badge', key: 'badge', width: 14 },
          { header: 'Dimensions', key: 'dimensions', width: 18 },
          { header: 'Weight', key: 'weight', width: 14 }
        ];

        // Format Heading Row
        const headerRow = sheet.getRow(1);
        headerRow.height = 28;
        headerRow.font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0D9488' } // Dynamic brand-primary Teal style!
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

        const subNames = (cat.subItems || []).map(sub => sub.name);

        // Add pre-filled helpful placeholder sample row
        const sampleSub = subNames[0] || 'Standard';
        sheet.addRow({
          name: `Sample Product for ${finalName}`,
          price: '4500.00',
          stock: '25',
          sub_category: sampleSub,
          image: 'https://example.com/placeholder.jpg',
          related_image_1: '',
          related_image_2: '',
          related_image_3: '',
          related_image_4: '',
          description: 'A brief description goes here.',
          badge: 'New',
          dimensions: '120x30x30 cm',
          weight: '8.5 kg'
        });

        // Format sample row
        const row = sheet.getRow(2);
        row.font = { name: 'Segoe UI', size: 10 };
        row.alignment = { vertical: 'middle' };

        // Configure dynamic subcategory dropdown validation using the hidden lookup sheet range reference
        if (subNames.length > 0) {
          const colLetter = lookupSheet.getColumn(colIdx).letter;

          // Write category name in row 1 for documentation
          lookupSheet.getCell(`${colLetter}1`).value = cat.name;

          // Write subcategory items to column cells
          subNames.forEach((subName, itemIdx) => {
            lookupSheet.getCell(`${colLetter}${itemIdx + 2}`).value = subName;
          });

          // Range reference formula (e.g. __SubCategories!$A$2:$A$18)
          const rangeRef = `__SubCategories!$${colLetter}$2:$${colLetter}$${subNames.length + 1}`;

          for (let rowNum = 2; rowNum <= 500; rowNum++) {
            sheet.getCell(`D${rowNum}`).dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: [rangeRef],
              showErrorMessage: true,
              errorTitle: 'Invalid Sub-Category',
              error: 'Please choose a valid sub-category from the dropdown menu.'
            };
          }
          colIdx++;
        } else {
          // Fallback simple validation if no sub-categories defined yet
          for (let rowNum = 2; rowNum <= 500; rowNum++) {
            sheet.getCell(`D${rowNum}`).dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: ['"Standard"'],
            };
          }
        }
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Dynamic_Product_Template.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('[API] Template generation error:', err);
    res.status(500).json({ message: 'Error generating excel template', error: err.message });
  }
});

// Fail-safe direct bulk route (supports both CSV and XLSX multi-sheet plus optional images matching and compression)
app.post('/api/products/bulk-upload', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'images', maxCount: 100 }
]), async (req, res) => {
  try {
    const spreadsheetFile = req.files && req.files['file'] ? req.files['file'][0] : null;
    if (!spreadsheetFile) return res.status(400).json({ message: 'No spreadsheet file provided' });

    const uploadedImages = req.files && req.files['images'] ? req.files['images'] : [];

    // Index uploaded images by lowercased original name for easy lookups
    const imageMap = {};
    for (const img of uploadedImages) {
      const nameKey = img.originalname.trim().toLowerCase();
      imageMap[nameKey] = img;
    }

    const Product = require('./src/models/Product');
    const maxProduct = await Product.findOne({ order: [['id', 'DESC']] });
    let nextId = (maxProduct ? maxProduct.id : 1000) + 1;

    const products = [];
    const extension = spreadsheetFile.originalname.split('.').pop().toLowerCase();

    if (extension === 'xlsx' || extension === 'xls') {
      const exceljs = require('exceljs');
      const workbook = new exceljs.Workbook();
      await workbook.xlsx.readFile(spreadsheetFile.path);

      let currentIdx = 0;
      workbook.eachSheet((sheet) => {
        // Skip hidden lookup sheets
        if (sheet.name.startsWith('__')) return;

        const categoryName = sheet.name;

        // Retrieve headers from row 1
        const headers = [];
        sheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber] = cell.value ? cell.value.toString().toLowerCase().replace(/[*]/g, '').trim() : '';
        });

        sheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip headers

          const obj = {
            id: nextId + currentIdx,
            category: categoryName
          };
          let hasName = false;
          const relatedImagesList = [];

          row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            const h = headers[colNumber];
            if (!h) return;

            let val = cell.value;
            if (val && typeof val === 'object') {
              if (val.text) val = val.text;
              else if (val.result !== undefined) val = val.result;
              else val = JSON.stringify(val);
            }

            if (val !== undefined && val !== null) {
              const strVal = val.toString().trim();
              if (h.includes('name')) { obj.name = strVal; hasName = true; }
              else if (h.includes('price')) obj.price = strVal;
              else if (h.includes('stock')) obj.stock = parseInt(strVal) || 0;
              else if (h.includes('sub-category') || h.includes('sub_category')) obj.sub_category = strVal;
              else if (h.includes('image') && !h.includes('related')) obj.image = strVal;
              else if (h.includes('related image url') || h.includes('related_image')) {
                if (strVal) relatedImagesList.push(strVal);
              }
              else if (h.includes('description')) obj.description = strVal;
              else if (h.includes('badge')) obj.badge = strVal;
              else if (h.includes('dimensions')) obj.dimensions = strVal;
              else if (h.includes('weight')) obj.weight = strVal;
            }
          });

          if (relatedImagesList.length > 0) {
            obj.images = JSON.stringify(relatedImagesList);
          } else {
            obj.images = JSON.stringify([]);
          }

          // Skip sample templates and empty names
          if (hasName && obj.name && !obj.name.toLowerCase().includes('sample product for')) {
            products.push(obj);
            currentIdx++;
          }
        });
      });
    } else {
      // Fallback text/CSV parse
      const text = fs.readFileSync(spreadsheetFile.path, 'utf8');
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

      if (lines.length < 2) {
        if (fs.existsSync(spreadsheetFile.path)) fs.unlinkSync(spreadsheetFile.path);
        return res.status(400).json({ message: 'CSV file is empty or missing data lines.' });
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[*]/g, ''));
      lines.slice(1).forEach((line, idx) => {
        const values = line.split(',').map(v => v.trim());
        const obj = { id: nextId + idx };
        const relatedImagesList = [];

        headers.forEach((h, i) => {
          let val = values[i] || "";
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);

          if (h === 'name') obj.name = val;
          else if (h === 'price') obj.price = val;
          else if (h === 'category') obj.category = val;
          else if (h === 'stock') obj.stock = parseInt(val) || 0;
          else if (h === 'image') obj.image = val;
          else if (h.includes('related image url') || h.includes('related_image')) {
            if (val) relatedImagesList.push(val);
          }
          else if (h === 'description') obj.description = val;
          else if (h === 'sub_category' || h === 'sub-category') obj.sub_category = val;
          else if (h === 'badge') obj.badge = val;
          else if (h === 'dimensions') obj.dimensions = val;
          else if (h === 'weight') obj.weight = val;
        });

        if (relatedImagesList.length > 0) {
          obj.images = JSON.stringify(relatedImagesList);
        } else {
          obj.images = JSON.stringify([]);
        }

        if (obj.name && !obj.name.toLowerCase().includes('sample product for')) {
          products.push(obj);
        }
      });
    }

    if (products.length === 0) {
      if (fs.existsSync(spreadsheetFile.path)) fs.unlinkSync(spreadsheetFile.path);
      return res.status(400).json({ message: 'No valid products found to import.' });
    }

    // List of matched and compressed images so we don't delete them
    const matchedImagePaths = new Set();

    // Process and match images for each product
    for (const product of products) {
      if (product.image) {
        const imgName = product.image.trim();
        const imgNameLower = imgName.toLowerCase();

        // If it's already a full URL, don't change it
        if (imgName.startsWith('http') || imgName.startsWith('data:')) {
          continue;
        }

        // Try to match with uploaded files
        let matchedFile = imageMap[imgNameLower];
        if (!matchedFile) {
          // Fuzzy match without extension
          const baseName = path.basename(imgNameLower);
          matchedFile = Object.values(imageMap).find(f => {
            const fNameLower = f.originalname.toLowerCase();
            return fNameLower === baseName ||
              path.basename(fNameLower, path.extname(fNameLower)) === path.basename(baseName, path.extname(baseName));
          });
        }

        if (matchedFile) {
          try {
            console.log('[BULK UPLOAD] Matched and compressing image:', matchedFile.originalname);
            // Compress image to under 50KB
            const compressed = await compressImage(matchedFile.path, UPLOAD_DIR, 50);

            const compressedSize = compressed.size.toFixed(2);
            const imageUrl = `${process.env.APP_DOMAIN}/uploads/${compressed.filename}`;

            product.image = imageUrl;
            matchedImagePaths.add(matchedFile.path);
            if (compressed.path !== matchedFile.path) {
              matchedImagePaths.add(compressed.path);
            }

            // Register in Media Library database
            try {
              const lastMediaResult = await pool.query('SELECT MAX(id) FROM media');
              const nextMediaId = (parseInt(lastMediaResult.rows[0].max) || 0) + 1;
              await pool.query(
                'INSERT INTO media (id, filename, url, file_size) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                [nextMediaId, compressed.filename, imageUrl, `${compressedSize} KB`]
              );
            } catch (mErr) {
              console.warn('[BULK UPLOAD] Error registering in media table:', mErr.message);
            }
          } catch (compressErr) {
            console.error('[BULK UPLOAD] Image compression failed, falling back:', compressErr);
            product.image = `${process.env.APP_DOMAIN}/uploads/${matchedFile.filename}`;
            matchedImagePaths.add(matchedFile.path);
          }
        } else {
          // If no image file uploaded matches, check if it exists in uploads folder already
          const localPath = path.join(UPLOAD_DIR, imgName);
          if (fs.existsSync(localPath)) {
            product.image = `${process.env.APP_DOMAIN}/uploads/${imgName}`;
          }
        }
      }
    }

    // Save products to database
    await Product.bulkCreate(products);

    // Clean up temp spreadsheet file
    if (fs.existsSync(spreadsheetFile.path)) {
      fs.unlinkSync(spreadsheetFile.path);
    }

    // Clean up uploaded image files that were NOT matched/used (to save server space)
    for (const img of uploadedImages) {
      if (!matchedImagePaths.has(img.path) && fs.existsSync(img.path)) {
        fs.unlinkSync(img.path);
        console.log('[BULK UPLOAD] Cleaned up unused image:', img.originalname);
      }
    }

    console.log(`Bulk uploaded ${products.length} products successfully.`);
    res.status(201).json({ message: `Successfully imported ${products.length} products.` });
  } catch (err) {
    console.error('Bulk upload failed:', err);
    res.status(500).json({ message: 'Error processing bulk upload', error: err.message });
  }
});

app.post('/api/products/bulk', async (req, res) => {
  try {
    console.log('Direct JSON Bulk Route Triggered. Payload size:', req.body.length);
    const Product = require('./src/models/Product');
    const products = await Product.bulkCreate(req.body);
    res.status(201).json({ message: 'Direct Bulk Import Successful', count: products.length });
  } catch (err) {
    console.error('Error in Direct Bulk Import:', err);
    res.status(500).json({ message: 'Direct Bulk Import Failed', error: err.message });
  }
});

const authRoutes = require('./src/routes/auth');
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Dynamic Service Routes
const funeralRoutes = require('./src/routes/funeral');
const hospitalRoutes = require('./src/routes/hospital');
const deliveryAreaRoutes = require('./src/routes/deliveryAreas');

app.use('/api/funeral', funeralRoutes);
app.use('/funeral', funeralRoutes);

app.use('/api/hospital', hospitalRoutes);
app.use('/hospital', hospitalRoutes);

app.use('/api/delivery-areas', deliveryAreaRoutes);
app.use('/delivery-areas', deliveryAreaRoutes);

const bannerRoutes = require('./src/routes/banners');
app.use('/api/banners', bannerRoutes);
app.use('/banners', bannerRoutes);

const benefitRoutes = require('./src/routes/benefits');
app.use('/api/benefits', benefitRoutes);
app.use('/benefits', benefitRoutes);

const categoryRoutes = require('./src/routes/categories');
app.use('/api/categories', categoryRoutes);
app.use('/categories', categoryRoutes);

const faqRoutes = require('./src/routes/faqs');
app.use('/api/faqs', faqRoutes);
app.use('/faqs', faqRoutes);

const testimonialRoutes = require('./src/routes/testimonials');
app.use('/api/testimonials', testimonialRoutes);
app.use('/testimonials', testimonialRoutes);

const subscriberRoutes = require('./src/routes/subscribers');
app.use('/api/subscribers', subscriberRoutes);
app.use('/subscribers', subscriberRoutes);

const atelierRoutes = require('./src/routes/atelierHours');
app.use('/api/atelier-hours', atelierRoutes);
app.use('/atelier-hours', atelierRoutes);

const footerLinkRoutes = require('./src/routes/footerLinks');
app.use('/api/footer-links', footerLinkRoutes);
app.use('/footer-links', footerLinkRoutes);

const socialLinkRoutes = require('./src/routes/socialLinks');
app.use('/api/social-links', socialLinkRoutes);
app.use('/social-links', socialLinkRoutes);

const menuRoutes = require('./src/routes/menus');
app.use('/api/menus', menuRoutes);
app.use('/menus', menuRoutes);

const permissionsRouter = require('./src/routes/permissions');
app.use('/api/permissions', permissionsRouter);
app.use('/permissions', permissionsRouter);

const productRoutes = require('./src/routes/products');
app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

const statsRoutes = require('./src/routes/stats');
app.use('/api/stats', statsRoutes);
app.use('/stats', statsRoutes);

const homeSectionRoutes = require('./src/routes/homeSections');
app.use('/api/home-sections', homeSectionRoutes);
app.use('/home-sections', homeSectionRoutes);

const cartRoutes = require('./src/routes/cart');
app.use('/api/cart', cartRoutes);
app.use('/cart', cartRoutes);

const orderRoutes = require('./src/routes/orders');
app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

const sectionSettingsRoutes = require('./src/routes/sectionSettings');
app.use('/api/section-settings', sectionSettingsRoutes);
app.use('/section-settings', sectionSettingsRoutes);

const wishlistRoutes = require('./src/routes/wishlist');
app.use('/api/wishlist', wishlistRoutes);
app.use('/wishlist', wishlistRoutes);

const settingsRoutes = require('./src/routes/settings');
app.use('/api/settings', settingsRoutes);
app.use('/settings', settingsRoutes);

const videoJourneyRoutes = require('./src/routes/videoJourney');
app.use('/api/video-journey', videoJourneyRoutes); // video journey routes added

const customerRoutes = require('./src/routes/customers');
app.use('/api/customers', customerRoutes);
app.use('/customers', customerRoutes);

const addressRoutes = require('./src/routes/addresses');
app.use('/api/addresses', addressRoutes);

const discountRoutes = require('./src/routes/discounts');
app.use('/api/discounts', discountRoutes);
app.use('/discounts', discountRoutes);

const reviewRoutes = require('./src/routes/reviews');
app.use('/api/reviews', reviewRoutes);
app.use('/reviews', reviewRoutes);

const paymentMethodRoutes = require('./src/routes/paymentMethods');
app.use('/api/payment-methods', paymentMethodRoutes);

// ---------------------------------------------------------

// ---------------------------------------------------------



// Collection Configuration Routes
app.get('/api/collections', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM collections ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching collections:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/collections/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const result = await pool.query('SELECT * FROM collections WHERE slug = $1', [slug]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Collection not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching collection:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/collections', async (req, res) => {
  const { id, slug, title, accent_title, description, bg_gradient, bg_class, title_class, filter_field, filter_value, is_active } = req.body;
  console.log('Incoming collection save request:', { id, slug, title });

  try {
    if (id) {
      // Direct update if ID exists
      const result = await pool.query(
        `UPDATE collections SET 
                slug = $1, title = $2, accent_title = $3, description = $4, bg_gradient = $5, 
                bg_class = $6, title_class = $7, filter_field = $8, filter_value = $9, is_active = $10 
                WHERE id = $11 RETURNING *`,
        [slug, title, accent_title, description, bg_gradient, bg_class, title_class, filter_field, filter_value, is_active ?? true, parseInt(id)]
      );
      return res.json(result.rows[0]);
    } else {
      // Insert for new records
      const result = await pool.query(
        `INSERT INTO collections 
              (slug, title, accent_title, description, bg_gradient, bg_class, title_class, filter_field, filter_value, is_active) 
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
              ON CONFLICT (slug) DO UPDATE SET 
              title = $2, accent_title = $3, description = $4, bg_gradient = $5, 
              bg_class = $6, title_class = $7, filter_field = $8, filter_value = $9,
              is_active = $10
              RETURNING *`,
        [slug, title, accent_title, description, bg_gradient, bg_class, title_class, filter_field, filter_value, is_active ?? true]
      );
      return res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    console.error("Error saving collection:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.delete('/api/collections/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM collections WHERE id = $1', [id]);
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    console.error("Error deleting collection:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Ensures all files in the uploads folder are registered in the media table.
 */
async function syncMediaWithDisk() {
  try {
    console.log('[MEDIA SYNC] Scanning uploads directory for synchronization...');
    if (!fs.existsSync(UPLOAD_DIR)) return;

    const files = fs.readdirSync(UPLOAD_DIR);
    const images = files.filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file));

    // Get all existing records from DB to check for missing sizes
    const dbMediaResult = await pool.query('SELECT filename, file_size FROM media');
    const dbMediaMap = new Map(dbMediaResult.rows.map(r => [r.filename, r.file_size]));

    const missingFiles = images.filter(f => !dbMediaMap.has(f));
    const filesNeedingSize = images.filter(f => {
      const size = dbMediaMap.get(f);
      return size === null || size === undefined || size === 'N/A' || size === 'Unknown' || size === '';
    });

    if (missingFiles.length > 0 || filesNeedingSize.length > 0) {
      console.log(`[MEDIA SYNC] Found ${missingFiles.length} missing files and ${filesNeedingSize.length} files needing size updates.`);

      const lastResult = await pool.query('SELECT MAX(id) FROM media');
      let nextId = (parseInt(lastResult.rows[0].max) || 0) + 1;

      // Handle missing files (Insert)
      for (const filename of missingFiles) {
        const filePath = path.join(UPLOAD_DIR, filename);
        let fileSize = 'Unknown';
        try {
          const stats = fs.statSync(filePath);
          fileSize = (stats.size / 1024).toFixed(2) + ' KB';
        } catch (e) { }

        const imageUrl = `${process.env.APP_DOMAIN}/uploads/${filename}`;
        await pool.query(
          'INSERT INTO media (id, filename, url, file_size) VALUES ($1, $2, $3, $4) ON CONFLICT (filename) DO UPDATE SET file_size = $4',
          [nextId++, filename, imageUrl, fileSize]
        );
      }

      // Handle existing files with missing size (Update)
      for (const filename of filesNeedingSize) {
        const filePath = path.join(UPLOAD_DIR, filename);
        try {
          const stats = fs.statSync(filePath);
          const fileSize = (stats.size / 1024).toFixed(2) + ' KB';
          await pool.query('UPDATE media SET file_size = $1 WHERE filename = $2', [fileSize, filename]);
        } catch (e) {
          console.error(`[MEDIA SYNC] Error updating size for ${filename}:`, e.message);
        }
      }

      console.log('[MEDIA SYNC] Synchronization and size updates complete.');
    } else {
      console.log('[MEDIA SYNC] All files are already synchronized and sized.');
    }
  } catch (err) {
    console.error('[MEDIA SYNC] Error synchronizing media:', err);
  }
}

let cachedTotalSizeKb = null;
let lastSizeCacheTime = 0;
const CACHE_TTL = 300000; // Cache for 5 minutes

async function getTotalStorageSizeKb() {
  const now = Date.now();
  if (cachedTotalSizeKb !== null && (now - lastSizeCacheTime) < CACHE_TTL) {
    return cachedTotalSizeKb;
  }

  try {
    const sizeResult = await pool.query("SELECT file_size FROM media");
    let totalKb = 0;
    for (const row of sizeResult.rows) {
      if (row.file_size) {
        const val = parseFloat(row.file_size);
        if (!isNaN(val)) {
          if (row.file_size.includes('MB')) {
            totalKb += val * 1024;
          } else {
            totalKb += val;
          }
        }
      }
    }
    cachedTotalSizeKb = totalKb;
    lastSizeCacheTime = now;
    return totalKb;
  } catch (err) {
    console.error('[SIZE CACHE] Error calculating storage size:', err.message);
    return cachedTotalSizeKb || 0;
  }
}

// Media Library Endpoints
app.get('/api/media', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM media');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM media ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    let totalSizeKb = 0;
    if (!req.query.page) {
      totalSizeKb = await getTotalStorageSizeKb();
    }

    res.json({
      media: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalSizeMb: (totalSizeKb / 1024).toFixed(2)
      }
    });
  } catch (err) {
    console.error("Error fetching media:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/media', checkImageLimit, (req, res, next) => {
  upload.array('files', 20)(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'One or more files are too large (max 1MB)' });
      }
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }

    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

    try {
      const lastResult = await pool.query('SELECT MAX(id) FROM media');
      let nextId = (parseInt(lastResult.rows[0].max) || 0) + 1;
      const inserted = [];

      for (const file of req.files) {
        const originalSize = (file.size / 1024).toFixed(2);
        try {
          const compressed = await compressImage(file.path, UPLOAD_DIR, 50);
          // Remove original ONLY if it's a different file
          if (compressed.path !== file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);

          const compressedSizeStr = `${compressed.size.toFixed(2)} KB`;
          const imageUrl = `${process.env.APP_DOMAIN}/uploads/${compressed.filename}`;
          const result = await pool.query(
            'INSERT INTO media (id, filename, url, file_size) VALUES ($1, $2, $3, $4) RETURNING *',
            [nextId++, compressed.filename, imageUrl, compressedSizeStr]
          );

          inserted.push({
            ...result.rows[0],
            originalSize: originalSize,
            compressedSize: compressed.size.toFixed(2)
          });
        } catch (err) {
          console.error('Media compression failed for file:', file.filename, err);
          // Fallback
          const stats = fs.statSync(file.path);
          const fileSize = (stats.size / 1024).toFixed(2);
          const imageUrl = `${process.env.APP_DOMAIN}/uploads/${file.filename}`;
          const result = await pool.query(
            'INSERT INTO media (id, filename, url, file_size) VALUES ($1, $2, $3, $4) RETURNING *',
            [nextId++, file.filename, imageUrl, `${fileSize} KB`]
          );
          inserted.push({
            ...result.rows[0],
            originalSize: originalSize,
            compressedSize: fileSize
          });
        }
      }

      cachedTotalSizeKb = null; // Invalidate size cache
      res.json({ message: `Successfully uploaded ${inserted.length} images`, images: inserted });
    } catch (err) {
      console.error("Error saving media:", err);
      res.status(500).json({ message: 'Server error' });
    }
  });
});

app.delete('/api/media/:id', async (req, res) => {
  const { id } = req.params;
  const mediaId = parseInt(id);

  if (isNaN(mediaId)) {
    return res.status(400).json({ message: 'Invalid media ID' });
  }

  try {
    // Find file first to delete from disk
    const mediaResult = await pool.query('SELECT * FROM media WHERE id = $1', [mediaId]);

    if (mediaResult.rowCount > 0) {
      const filename = mediaResult.rows[0].filename;
      const filePath = path.join(UPLOAD_DIR, filename);

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fsError) {
        console.error("Warning: Could not delete physical file:", filePath, fsError.message);
        // We continue to delete from DB even if physical file is missing or locked
      }
    }

    await pool.query('DELETE FROM media WHERE id = $1', [mediaId]);
    cachedTotalSizeKb = null; // Invalidate size cache
    res.json({ message: 'Media deleted successfully' });
  } catch (err) {
    console.error("Error deleting media:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── Tax Rules API ──────────────────────────────────────────────────────────
app.get('/api/tax-rules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tax_rules ORDER BY category ASC, sub_category ASC NULLS FIRST');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tax rules:', err);
    res.status(500).json({ message: 'Server error fetching tax rules' });
  }
});

app.post('/api/tax-rules', async (req, res) => {
  const { category, sub_category, tax_rate } = req.body;
  if (!category || tax_rate === undefined || tax_rate === '') {
    return res.status(400).json({ message: 'Category and tax rate are required' });
  }
  const subCatVal = sub_category || null;
  const rateVal = parseFloat(tax_rate);
  try {
    await pool.query(`
      INSERT INTO tax_rules (category, sub_category, tax_rate, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (category, sub_category)
      DO UPDATE SET tax_rate = $3, updated_at = NOW()
    `, [category, subCatVal, rateVal]);
    // Use ILIKE for case-insensitive match — products may store category in different case
    if (subCatVal) {
      await pool.query(
        'UPDATE products SET tax_rate = $1 WHERE category ILIKE $2 AND sub_category ILIKE $3',
        [rateVal, category, subCatVal]
      );
    } else {
      await pool.query(
        'UPDATE products SET tax_rate = $1 WHERE category ILIKE $2',
        [rateVal, category]
      );
    }
    res.json({ message: 'Tax rule saved and applied to products successfully' });
  } catch (err) {
    console.error('Error saving tax rule:', err);
    res.status(500).json({ message: 'Server error saving tax rule' });
  }
});

app.delete('/api/tax-rules/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const ruleResult = await pool.query('SELECT * FROM tax_rules WHERE id = $1', [id]);
    if (ruleResult.rows.length === 0) return res.status(404).json({ message: 'Tax rule not found' });
    const { category, sub_category } = ruleResult.rows[0];
    await pool.query('DELETE FROM tax_rules WHERE id = $1', [id]);
    // Use ILIKE for case-insensitive match
    if (sub_category) {
      await pool.query(
        'UPDATE products SET tax_rate = NULL WHERE category ILIKE $1 AND sub_category ILIKE $2',
        [category, sub_category]
      );
    } else {
      await pool.query(
        'UPDATE products SET tax_rate = NULL WHERE category ILIKE $1',
        [category]
      );
    }
    res.json({ message: 'Tax rule deleted and products updated successfully' });
  } catch (err) {
    console.error('Error deleting tax rule:', err);
    res.status(500).json({ message: 'Server error deleting tax rule' });
  }
});
// ───────────────────────────────────────────────────────────────────────────

app.post('/api/media/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs provided' });

  try {
    // Find files to delete from disk
    const result = await pool.query('SELECT * FROM media WHERE id = ANY($1)', [ids]);

    for (const item of result.rows) {
      const filePath = path.join(UPLOAD_DIR, item.filename);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Bulk delete physical file error:", e.message);
      }
    }

    await pool.query('DELETE FROM media WHERE id = ANY($1)', [ids]);
    cachedTotalSizeKb = null; // Invalidate size cache
    res.json({ message: `Successfully deleted ${ids.length} images` });
  } catch (err) {
    console.error("Bulk media delete failed:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/media/bulk-compress', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs provided' });

  try {
    const result = await pool.query('SELECT * FROM media WHERE id = ANY($1)', [ids]);
    const compressed = [];

    for (const item of result.rows) {
      const filePath = path.join(UPLOAD_DIR, item.filename);

      if (fs.existsSync(filePath)) {
        try {
          // Re-compress to 50KB target
          const result = await compressImage(filePath, UPLOAD_DIR, 50);

          // If a new file was created (filename changed), remove the old one
          if (result.filename !== item.filename) {
            fs.unlinkSync(filePath);
          }

          const newSizeStr = `${result.size.toFixed(2)} KB`;
          const newUrl = `${process.env.APP_DOMAIN}/uploads/${result.filename}`;

          await pool.query(
            'UPDATE media SET filename = $1, url = $2, file_size = $3 WHERE id = $4',
            [result.filename, newUrl, newSizeStr, item.id]
          );

          compressed.push({ id: item.id, newSize: newSizeStr, filename: result.filename });
        } catch (err) {
          console.error(`Compression failed for ${item.filename}:`, err.message);
        }
      }
    }

    cachedTotalSizeKb = null; // Invalidate size cache
    res.json({ message: `Successfully compressed ${compressed.length} images`, results: compressed });
  } catch (err) {
    console.error("Bulk media compression failed:", err);
    res.status(500).json({ message: 'Server error' });
  }
});








// ---------------------------------------------------------
// FRONTEND SERVING (Safety Position)
// ---------------------------------------------------------
app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ message: 'API Route Not Found' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Server already started in consolidated sync chain

// Final Global Error Handler (MUST BE LAST)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
