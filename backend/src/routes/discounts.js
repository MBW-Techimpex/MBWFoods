const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Discount = require('../models/Discount');
const DiscountUsage = require('../models/DiscountUsage');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Customer = require('../models/Customer');

// Get all discounts (Admin)
router.get('/', async (req, res) => {
  try {
    const discounts = await Discount.findAll({
      order: [['created_at', 'DESC']],
    });
    res.json(discounts);
  } catch (err) {
    console.error('Error fetching discounts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single discount
router.get('/:id', async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id);
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    res.json(discount);
  } catch (err) {
    console.error('Error fetching discount:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get usage details for a discount
router.get('/:id/usage', async (req, res) => {
  const { id } = req.params;
  console.log(`[Discount API] Fetching usage for discount ID: ${id}`);

  try {
    const usages = await DiscountUsage.findAll({
      where: { discount_id: id },
      include: [
        {
          model: Order,
          include: [
            {
              model: OrderItem,
              as: 'items'
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`[Discount API] Found ${usages.length} usage records for discount ${id}`);
    res.json(usages);
  } catch (err) {
    console.error(`[Discount API] Error fetching discount usage for ${id}:`, err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create discount
router.post('/', async (req, res) => {
  try {
    const discount = await Discount.create(req.body);
    res.status(201).json(discount);
  } catch (err) {
    console.error('Error creating discount:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update discount
router.put('/:id', async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id);
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    await discount.update(req.body);
    res.json(discount);
  } catch (err) {
    console.error('Error updating discount:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete discount
router.delete('/:id', async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id);
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    await discount.destroy();
    res.json({ message: 'Discount deleted' });
  } catch (err) {
    console.error('Error deleting discount:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate discount code
router.post('/validate', async (req, res) => {
  const { code, cartItems, customerId, customerEmail, subtotal } = req.body;
  console.log('--- Discount Validation Start ---');
  console.log('Code:', code);
  console.log('Cart Items:', JSON.stringify(cartItems, null, 2));

  try {
    const discount = await Discount.findOne({
      where: {
        code: code,
        status: 'active',
        start_date: { [Op.lte]: new Date() },
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: new Date() } }
        ]
      }
    });

    if (!discount) {
      console.log('Discount not found or inactive.');
      return res.status(400).json({ valid: false, message: 'Invalid or expired discount code.' });
    }

    console.log('Found Discount:', discount.id, discount.type, discount.applies_to);

    // Check usage limit
    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      return res.status(400).json({ valid: false, message: 'This discount code has reached its usage limit.' });
    }

    // Check usage limit per customer
    if (discount.usage_limit_per_customer) {
      const usageCount = await DiscountUsage.count({
        where: {
          discount_id: discount.id,
          [Op.or]: [
            customerId ? { customer_id: customerId } : null,
            customerEmail ? { customer_email: customerEmail } : null
          ].filter(Boolean)
        }
      });

      if (usageCount > 0) {
        return res.status(400).json({ valid: false, message: 'You have already used this discount code.' });
      }
    }

    // Check minimum requirement
    if (discount.min_requirement_type === 'min_purchase_amount') {
      if (parseFloat(subtotal) < parseFloat(discount.min_requirement_value)) {
        return res.status(400).json({
          valid: false,
          message: `Minimum purchase of ${discount.min_requirement_value} required for this discount.`
        });
      }
    } else if (discount.min_requirement_type === 'min_quantity_items') {
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      if (totalItems < parseInt(discount.min_requirement_value)) {
        return res.status(400).json({
          valid: false,
          message: `Minimum ${discount.min_requirement_value} items required for this discount.`
        });
      }
    }

    // Check application scope
    let applicableItems = [];
    if (discount.applies_to === 'all') {
      applicableItems = cartItems;
    } else if (discount.applies_to === 'specific_products') {
      const productIds = (discount.specific_product_ids || []).map(id => id.toString());
      applicableItems = cartItems.filter(item => {
        const id = (item.product_id || item.id)?.toString().replace('PRD-', '');
        return productIds.includes(id);
      });
    } else if (discount.applies_to === 'specific_categories') {
      const categoryNames = (discount.specific_category_ids || []).map(name => name.toLowerCase());
      console.log('Target Categories (lowercased):', categoryNames);

      // Fetch full product details for cart items to check their categories
      const cartProductIds = cartItems.map(item => {
        const rawId = (item.product_id || item.id)?.toString();
        return rawId ? rawId.replace('PRD-', '') : null;
      }).filter(Boolean);

      console.log('Looking up Product IDs:', cartProductIds);

      const dbProducts = await Product.findAll({
        where: { id: cartProductIds }
      });

      console.log('Products found in DB:', dbProducts.map(p => ({ id: p.id, category: p.category })));

      applicableItems = cartItems.filter(item => {
        const rawId = (item.product_id || item.id)?.toString().replace('PRD-', '');
        const dbProd = dbProducts.find(p => p.id.toString() === rawId);
        const match = dbProd && dbProd.category && categoryNames.includes(dbProd.category.toLowerCase());
        console.log(`Checking Item ID ${rawId}: Category ${dbProd?.category} -> Match: ${match}`);
        return match;
      });
    }

    console.log('Number of Applicable Items:', applicableItems.length);

    if (applicableItems.length === 0) {
      return res.status(400).json({
        valid: false,
        message: 'This discount does not apply to the items in your cart.'
      });
    }

    // Calculate discount amount
    const parsePrice = (price) => {
      if (typeof price === 'number') return price;
      return parseFloat(price.toString().replace(/[^0-9.]/g, '')) || 0;
    };

    let discountAmount = 0;
    const applicableSubtotal = applicableItems.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0);
    const totalSubtotal = parseFloat(subtotal) || applicableItems.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0);

    if (discount.type === 'amount_off_order') {
      if (discount.value_type === 'percentage') {
        discountAmount = totalSubtotal * (parseFloat(discount.value) / 100);
      } else {
        discountAmount = parseFloat(discount.value);
      }
    } else if (discount.type === 'amount_off_products') {
      if (discount.value_type === 'percentage') {
        discountAmount = applicableSubtotal * (parseFloat(discount.value) / 100);
      } else {
        discountAmount = parseFloat(discount.value);
      }
    } else if (discount.type === 'free_shipping') {
      discountAmount = 0;
    } else if (discount.type === 'buy_x_get_y') {
      const buyQ = parseInt(discount.buy_quantity) || 1;
      const getQ = parseInt(discount.get_quantity) || 1;
      const setSize = buyQ + getQ;

      // Expand items to single units to handle different prices
      let allUnits = [];
      applicableItems.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          allUnits.push(parsePrice(item.price));
        }
      });

      // Sort by price ascending (discount the cheapest ones)
      allUnits.sort((a, b) => a - b);

      const numSets = Math.floor(allUnits.length / setSize);
      const numFree = numSets * getQ;

      if (numSets === 0) {
        return res.json({ 
          valid: true, 
          discountId: discount.id,
          code: discount.code,
          discountAmount: "0.00",
          message: `Add ${setSize - allUnits.length} more item(s) to activate this BOGO offer!` 
        });
      }

      const discountValue = parseFloat(discount.value) || 100;
      const totalSavings = allUnits.slice(0, numFree).reduce((sum, p) => sum + p, 0);
      discountAmount = totalSavings * (discountValue / 100);
    }

    // Cap discount at total subtotal
    discountAmount = Math.min(discountAmount, totalSubtotal);

    res.json({
      valid: true,
      discountId: discount.id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      valueType: discount.value_type,
      discountAmount: discountAmount.toFixed(2),
      message: 'Discount applied successfully!',
      buy_quantity: discount.buy_quantity,
      get_quantity: discount.get_quantity
    });

  } catch (err) {
    console.error('Error validating discount:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get automatic discounts for a cart
router.post('/automatic', async (req, res) => {
  const { cartItems, customerId, customerEmail, subtotal } = req.body;
  
  try {
    const automaticDiscounts = await Discount.findAll({
      where: {
        is_automatic: true,
        status: 'active',
        start_date: { [Op.lte]: new Date() },
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: new Date() } }
        ]
      }
    });

    res.json(automaticDiscounts);
  } catch (err) {
    console.error('Error fetching automatic discounts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
