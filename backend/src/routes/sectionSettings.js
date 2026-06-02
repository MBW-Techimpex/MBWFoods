const express = require('express');
const router = express.Router();
const SectionSetting = require('../models/SectionSetting');
const { renderEmailTemplate } = require('../utils/emailTemplates');
const Setting = require('../models/Setting');

// GET /api/section-settings/email-templates/preview/:category/:theme
router.get('/email-templates/preview/:category/:theme', async (req, res) => {
  try {
    const { category, theme } = req.params;

    let siteNameObj = await Setting.findOne({ where: { key: 'site_name' } });
    if (!siteNameObj) siteNameObj = await SectionSetting.findOne({ where: { key: 'site_name' } });
    const siteName = siteNameObj ? siteNameObj.value : 'MBW Car Accessories';

    let brandPrimaryObj = await Setting.findOne({ where: { key: 'theme_color' } });
    if (!brandPrimaryObj) brandPrimaryObj = await SectionSetting.findOne({ where: { key: 'brand_primary' } });
    if (!brandPrimaryObj) brandPrimaryObj = await Setting.findOne({ where: { key: 'brand_primary' } });
    const brandPrimary = brandPrimaryObj ? brandPrimaryObj.value : '#4f46e5';

    let brandAccentObj = await Setting.findOne({ where: { key: 'secondary_color' } });
    if (!brandAccentObj) brandAccentObj = await SectionSetting.findOne({ where: { key: 'brand_accent' } });
    if (!brandAccentObj) brandAccentObj = await Setting.findOne({ where: { key: 'brand_accent' } });
    const brandAccent = brandAccentObj ? brandAccentObj.value : '#64748b';

    let currencyObj = await Setting.findOne({ where: { key: 'currency' } });
    const currency = currencyObj ? currencyObj.value : 'USD';
    const symbols = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'CAD': '$', 'AUD': '$', 'SGD': '$', 'AED': 'د.إ' };
    const symbol = symbols[currency] || '$';

    const data = {
      siteName,
      brandPrimary,
      brandAccent,
      symbol,
      email: 'client@example.com',
      password: 'TempPassword123!',
      verificationUrl: 'http://localhost:5173/api/auth/customer/verify/mock_token',
      order: {
        id: 'ord-a7b2c9d8',
        shipping_amount: '15.00',
        discount_code: 'PROMO10',
        discount_amount: '10.00',
        total_amount: '184.99',
        delivery_date: 'Tuesday, May 26',
        cgst: '0.00',
        sgst: '0.00',
        igst: '0.00'
      },
      customer: {
        first_name: 'James',
        last_name: 'Sterling',
        email: 'james.sterling@example.com'
      },
      items: [
        { name: 'Carbon Fiber Steering Wheel', quantity: 1, price: '129.99' },
        { name: 'Alloy Hub Caps (Set of 4)', quantity: 1, price: '50.00' }
      ]
    };

    const html = renderEmailTemplate(category, theme, data);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all settings for a section (e.g. GET /api/section-settings?section=whychooseus)
router.get('/', async (req, res) => {
  try {
    const { section } = req.query;
    const where = section ? { key: { [require('sequelize').Op.like]: `${section}_%` } } : {};
    const settings = await SectionSetting.findAll({ where });
    // Return as a key-value object for ease of use
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upsert (create or update) a batch of settings
// Body: { "whychooseus_tagline": "Our Commitment", "whychooseus_heading": "Why Choose ...", ... }
router.post('/upsert', async (req, res) => {
  try {
    const updates = req.body;
    const promises = Object.entries(updates).map(async ([key, value]) => {
      const existing = await SectionSetting.findOne({ where: { key } });
      if (existing) {
        return existing.update({ value });
      } else {
        return SectionSetting.create({ key, value });
      }
    });
    await Promise.all(promises);
    res.json({ message: 'Settings saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
