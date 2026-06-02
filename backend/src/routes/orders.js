const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Setting = require('../models/Setting');
const auth = require('../middleware/auth');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const CustomerAddress = require('../models/CustomerAddress');
const Discount = require('../models/Discount');
const DiscountUsage = require('../models/DiscountUsage');

const { verifyAdmin } = require('../middleware/adminAuth');
const bcrypt = require('bcryptjs');
const { sendOrderConfirmation } = require('../utils/mailer');

// Place Order & Reduce Stock (Supports both Guest and Logged-in)
router.post('/place', auth, async (req, res) => {
  const {
    items,
    totalAmount,
    paymentMethod,
    paymentId,
    customerInfo,
    shippingAddress,
    deliveryMethod,
    deliveryDate,
    timeSlot,
    giftMessage,
    occasionType,
    orderNotes,
    sessionId,
    discountId,
    discountAmount: appliedDiscountAmount
  } = req.body;

  // Identify Customer from Authentication Middleware
  let userId = req.user ? req.user.id : null;

  // Verify Identity (Handle stale tokens from environment transitions)
  if (userId) {
    try {
      const numericUserId = parseInt(userId);
      if (!isNaN(numericUserId)) {
        const exists = await Customer.findByPk(numericUserId);
        if (!exists) {
          console.warn(`[Order API] Stale Identity detected: ${userId}. Reverting to guest protocol.`);
          userId = null;
        }
      }
    } catch (err) {
      console.error(`[Order API] Identity check failure:`, err);
      userId = null;
    }
  }

  const transaction = await sequelize.transaction();

  try {
    if (!items || items.length === 0) {
      throw new Error("No botanical items detected in your registry.");
    }


    // 0. Daily Order Limit Check
    const settingLimit = await Setting.findOne({ where: { key: 'daily_order_limit' } });
    const limit = settingLimit ? parseInt(settingLimit.value) : 0;

    if (limit > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const orderCount = await Order.count({
        where: {
          createdAt: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          },
          status: { [Op.ne]: 'cancelled' }
        }
      });

      if (orderCount >= limit) {
        throw new Error("the shop today order limit reached");
      }
    }


    // Data Normalization
    const normalizedPaymentMethod = paymentMethod?.toUpperCase() === 'COD' ? 'COD' : 'Online';
    const normalizedDeliveryDate = (deliveryDate && deliveryDate !== '' && deliveryDate !== 'Invalid date') ? deliveryDate : null;

    if (normalizedDeliveryDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      if (normalizedDeliveryDate < todayStr) {
        throw new Error("We don't allow delivery on previous dates. Please select a current or future date.");
      }

      const selDate = new Date(normalizedDeliveryDate);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[selDate.getDay()];
      
      const AtelierHour = require('../models/AtelierHour');
      const atelierHour = await AtelierHour.findOne({ where: { day: dayName } });
      
      if (atelierHour && atelierHour.isClosed) {
        throw new Error(`The shop is closed on ${dayName}s. Please choose another date.`);
      }

      const disabledDatesSetting = await Setting.findOne({ where: { key: 'disabled_delivery_dates' } });
      if (disabledDatesSetting && disabledDatesSetting.value) {
        const disabledDates = disabledDatesSetting.value.split(',').map(d => {
          const t = d.trim();
          if (/^\d{2}-\d{2}-\d{4}$/.test(t)) {
            const [dd, mm, yyyy] = t.split('-');
            return `${yyyy}-${mm}-${dd}`;
          }
          return t;
        });
        if (disabledDates.includes(normalizedDeliveryDate)) {
          throw new Error("The shop is closed on the selected date. Please select another date.");
        }
      }
    }

    console.log(`[Order API] Processing order for ${userId ? 'User ' + userId : 'Guest'}. Payment: ${normalizedPaymentMethod}`);

    // 1. Fiscal Configuration & Identity Verification
    const settingsList = await Setting.findAll({ transaction });
    const settingsMap = {};
    settingsList.forEach(s => settingsMap[s.key] = s.value);

    const globalTaxRate = parseFloat(settingsMap.tax_rate || 18);
    const deliveryThreshold = parseFloat(settingsMap.delivery_threshold || 999999);
    const baseDeliveryFee = parseFloat(settingsMap.delivery_fee || 50);
    const isTamilNadu = shippingAddress?.state?.toLowerCase().trim() === 'tamil nadu' || shippingAddress?.state?.toLowerCase().trim() === 'tn';

    // 2. Stock Validation, Price Locking & Itemized Tax Calculation
    let calculatedTotal = 0;
    let cgstRaw = 0;
    let sgstRaw = 0;
    let igstRaw = 0;

    for (const item of items) {
      const product = await Product.findByPk(item.id || item.productId, { transaction });
      if (!product) {
        throw new Error(`Archived specimen #${item.id || item.productId} no longer exists.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficent stock for '${product.name}'. Remaining: ${product.stock}`);
      }

      const priceVal = parseFloat(product.price.toString().replace(/[^0-9.]/g, '')) || 0;
      let itemExtra = 0;
      if (item.options?.chocolates) {
        const match = item.options.chocolates.match(/\+(\d+\.\d+)/);
        if (match) itemExtra += parseFloat(match[1]);
      }
      if (item.options?.stuffedAnimal) {
        const match = item.options.stuffedAnimal.match(/\+(\d+\.\d+)/);
        if (match) itemExtra += parseFloat(match[1]);
      }
      
      const itemSubtotal = (priceVal + itemExtra) * item.quantity;
      calculatedTotal += itemSubtotal;

      // PER-PRODUCT TAX LOGIC
      const itemTaxRate = (product.tax_rate !== undefined && product.tax_rate !== null) ? parseFloat(product.tax_rate) : globalTaxRate;

      if (isTamilNadu) {
        cgstRaw += (itemSubtotal * (itemTaxRate / 2)) / 100;
        sgstRaw += (itemSubtotal * (itemTaxRate / 2)) / 100;
      } else {
        igstRaw += (itemSubtotal * itemTaxRate) / 100;
      }
    }

    // 3. Shipping Logic (Zip-based override)
    let calculatedShipping = baseDeliveryFee;
    if (shippingAddress?.zip) {
      const DeliveryArea = require('../models/DeliveryArea');
      const areas = await DeliveryArea.findAll({ transaction });
      const match = areas.find(a => 
        a.zip_codes.split(',').map(z => z.trim()).includes(shippingAddress.zip.trim())
      );
      if (match) {
        calculatedShipping = parseFloat(match.shipping_charge || baseDeliveryFee);
      }
    }

    // 4. Discount re-validation
    let discountAmount = 0;
    let discountCode = null;
    let discountRecord = null;

    if (discountId) {
      discountRecord = await Discount.findByPk(discountId, { transaction });
      if (discountRecord && discountRecord.status === 'active') {
        discountAmount = parseFloat(appliedDiscountAmount) || 0;
        discountCode = discountRecord.code;
      }
    }

    const discountedSubtotal = Math.max(0, calculatedTotal - discountAmount);

    // Apply Delivery Threshold
    let shipping = deliveryMethod === 'pickup' ? 0 : calculatedShipping;
    if (deliveryMethod !== 'pickup' && discountedSubtotal >= deliveryThreshold) {
      shipping = 0;
    }

    // 5. Final Fiscal Aggregation (Pro-rata Discount Adjustment)
    let cgst = cgstRaw;
    let sgst = sgstRaw;
    let igst = igstRaw;

    if (discountAmount > 0 && calculatedTotal > 0) {
      const ratio = discountedSubtotal / calculatedTotal;
      cgst *= ratio;
      sgst *= ratio;
      igst *= ratio;
    }

    const tax = cgst + sgst + igst;
    const finalTotal = discountedSubtotal + shipping + tax;

    const custName = customerInfo?.name || req.body.name || (req.body.firstName ? `${req.body.firstName} ${req.body.lastName || ''}` : null);
    const custEmail = customerInfo?.email || req.body.email || null;
    const custPhone = customerInfo?.phone || req.body.phone || null;

    // 2. Find or Create Customer record (for Guest Support)
    let finalCustomerId = userId;
    let isNewCustomer = false;
    console.log(`[Order API] Initial Identity: ${userId}`);

    if (!finalCustomerId && custEmail) {
      try {
        console.log(`[Order API] Converting Guest to Registered Customer: ${custEmail}`);
        
        // Hash the default password for security
        const hashedPassword = await bcrypt.hash('BotanicalGuest123!', 10);

        // Use findOrCreate to ensure we have a Customer record
        const [customerRecord, created] = await Customer.findOrCreate({
          where: { email: custEmail },
          defaults: {
            first_name: req.body.firstName || custName?.split(' ')[0] || 'Guest',
            last_name: req.body.lastName || custName?.split(' ').slice(1).join(' ') || 'User',
            phone: custPhone,
            is_verified: true, // Mark as verified since they just completed a purchase
            password: hashedPassword // Securely hashed default password
          },
          transaction
        });

        finalCustomerId = customerRecord.id;
        isNewCustomer = created;
        console.log(`[Order API] ${created ? 'New Customer Created' : 'Existing Customer Found'}: ID=${finalCustomerId}`);
        
        // If customer existed but was missing data, update it now
        if (!created) {
          await customerRecord.update({
            first_name: customerRecord.first_name || req.body.firstName || custName?.split(' ')[0],
            last_name: customerRecord.last_name || req.body.lastName || custName?.split(' ').slice(1).join(' '),
            phone: customerRecord.phone || custPhone
          }, { transaction });
        }
      } catch (custErr) {
        console.error("[Order API] Guest conversion failed:", custErr);
        // We don't throw here to avoid failing the order, but we log the failure
      }
    }

    console.log(`[Order API] Final Customer ID for Order: ${finalCustomerId}`);

    // 2.5 Archive Shipping Address as Landmark if requested or if new customer
    if (finalCustomerId && shippingAddress && shippingAddress.address) {
      console.log(`[Order API] Attempting to archive landmark for customer: ${finalCustomerId}`);
      try {
        const addrCount = await CustomerAddress.count({ where: { customer_id: finalCustomerId }, transaction });
        console.log(`[Order API] Current landmark count for user: ${addrCount}`);
        
        // We use findOrCreate to avoid duplicate landmarks for the same physical location
        const [addressRecord, createdAddr] = await CustomerAddress.findOrCreate({
          where: {
            customer_id: finalCustomerId,
            street: shippingAddress.address,
            city: shippingAddress.city || '',
            zip: shippingAddress.zip || ''
          },
          defaults: {
            title: 'Recent Delivery',
            first_name: req.body.firstName || custName?.split(' ')[0],
            last_name: req.body.lastName || custName?.split(' ').slice(1).join(' '),
            state: shippingAddress.state || '',
            phone: custPhone || '',
            is_default: addrCount === 0 // Make it default if it's their first landmark
          },
          transaction
        });
        
        if (createdAddr) {
          console.log(`[Order API] SUCCESS: Archived new landmark ${addressRecord.id} for customer ${finalCustomerId}`);
        } else {
          console.log(`[Order API] Landmark already exists (ID: ${addressRecord.id}) for customer ${finalCustomerId}`);
        }
      } catch (addrErr) {
        console.error("[Order API] FAILURE: Could not archive address landmark:", addrErr);
      }
    } else {
      console.log(`[Order API] Skipping landmark archival. Data: CustomerID=${finalCustomerId}, Address=${shippingAddress?.address}`);
    }

    // 3. Create Order dossier
    const order = await Order.create({
      customer_id: finalCustomerId,
      customer_name: custName,
      customer_email: custEmail,
      customer_phone: custPhone,
      total_amount: finalTotal,
      shipping_amount: shipping,
      tax_amount: tax,
      cgst,
      sgst,
      igst,
      payment_method: normalizedPaymentMethod,
      payment_status: normalizedPaymentMethod === 'COD' ? 'pending' : (paymentId ? 'paid' : 'pending'),
      payment_id: paymentId,
      shipping_address: shippingAddress?.address,
      shipping_city: shippingAddress?.city,
 shipping_state: shippingAddress?.state,
      shipping_zip: shippingAddress?.zip,
      delivery_method: deliveryMethod,
      delivery_date: normalizedDeliveryDate,
      time_slot: timeSlot,
      gift_message: giftMessage,
      occasion_type: occasionType,
      order_notes: orderNotes,
      status: 'placed',
      discount_amount: discountAmount,
      discount_code: discountCode
    }, { transaction });

  // 4. Record Discount Usage
    if (discountRecord) {
      await DiscountUsage.create({
        discount_id: discountRecord.id,
        customer_id: finalCustomerId,
        customer_email: custEmail,
        order_id: order.id
      }, { transaction });

      await discountRecord.increment('used_count', { transaction });
    }
    
    // 3. Create OrderItems & Reduce Stock
    for (const item of items) {
      const product = await Product.findByPk(item.id, { transaction });

      let options = item.options || {};
      if (options.isSubscription) {
        // Pre-generate the 7 daily deliveries starting from the selected delivery date
        // Parse date parts directly to avoid UTC↔local timezone shift (IST = UTC+5:30)
        const startDateStr = normalizedDeliveryDate || (() => {
          const t = new Date(Date.now() + 86400000);
          const y = t.getFullYear(), m = String(t.getMonth()+1).padStart(2,'0'), d = String(t.getDate()).padStart(2,'0');
          return `${y}-${m}-${d}`;
        })();
        const [sy, sm, sd] = startDateStr.split('-').map(Number);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const deliveries = [];

        for (let i = 0; i < 7; i++) {
          // Use LOCAL date constructor (not UTC parsing) to avoid off-by-one in IST/other timezones
          const currentDate = new Date(sy, sm - 1, sd + i);
          const y = currentDate.getFullYear();
          const m = String(currentDate.getMonth() + 1).padStart(2, '0');
          const d = String(currentDate.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;
          const dayName = days[currentDate.getDay()];
          const dish = options.menu?.[dayName] || 'Chef Special Recipe';

          deliveries.push({
            dayIndex: i + 1,
            date: dateStr,
            dayName: dayName,
            dish: dish,
            status: 'Pending'
          });
        }
        options.deliveries = deliveries;
      }

      await OrderItem.create({
        order_id: order.id,
        product_id: item.id,
        name: item.name,
        price: parseFloat(product.price.toString().replace(/[^0-9.]/g, '')) || 0,
        quantity: item.quantity,
        options: options,
        image: item.image || product.image
      }, { transaction });

      await product.update({ stock: product.stock - item.quantity }, { transaction });
      
      // Update item price in the array for email summary
      item.price = parseFloat(product.price.toString().replace(/[^0-9.]/g, '')) || 0;
    }

    if (userId || sessionId) {
      const cartWhere = userId ? { customer_id: userId, status: 'active' } : { session_id: sessionId, status: 'active' };
      const cart = await Cart.findOne({ where: cartWhere, transaction });
      if (cart) {
        await CartItem.destroy({ where: { cart_id: cart.id }, transaction });
      }
    }

    await transaction.commit();

    // 5. Send confirmation email (Async)
    try {
      const fullCustomer = await Customer.findByPk(finalCustomerId);
      if (fullCustomer) {
        sendOrderConfirmation(order, fullCustomer, items, isNewCustomer);
      }
    } catch (emailErr) {
      console.error("[Order API] Email trigger failed:", emailErr);
    }

    // Establish session for the reconciled customer if they were a guest
    if (!userId && finalCustomerId) {
      const customer = await Customer.findByPk(finalCustomerId);
      if (customer) {
        const token = jwt.sign(
          { id: customer.id, role: 'customer' },
          process.env.JWT_SECRET || 'supersecretkey',
          { expiresIn: '7d' }
        );

        res.cookie('customer_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
          message: 'Order archived successfully',
          orderId: order.id,
          total: finalTotal,
          token: token,
          customer: {
            id: customer.id,
            email: customer.email,
            first_name: customer.first_name,
            last_name: customer.last_name
          }
        });
      }
    }

    res.status(201).json({
      message: 'Order archived successfully',
      orderId: order.id,
      total: finalTotal
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('[Order API] CLINICAL FAILURE:', {
      message: error.message,
      stack: error.stack,
      payload: req.body
    });
    res.status(500).json({
      message: 'Order Processing Failed',
      error: error.message,
      tip: 'Check if all specimens are in stock and delivery date is valid.'
    });
  }
});

// ADMIN ROUTES
// Get all orders with filters
router.get('/admin/all', verifyAdmin, async (req, res) => {
  const { status, dateFrom, dateTo } = req.query;
  const where = {};

  if (status && status !== 'all') where.status = status;
  if (dateFrom || dateTo) {
    where.created_at = {};
    if (dateFrom) {
      const dFrom = new Date(dateFrom);
      dFrom.setHours(0, 0, 0, 0);
      where.created_at[Op.gte] = dFrom;
    }
    if (dateTo) {
      const dTo = new Date(dateTo);
      dTo.setHours(23, 59, 59, 999);
      where.created_at[Op.lte] = dTo;
    }
  }

  try {
    const orders = await Order.findAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error("Admin order fetch error:", error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Update order status
router.patch('/admin/:id/status', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await order.update({ status });
    res.json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Get User's Orders
router.get('/my-orders', auth, async (req, res) => {

  try {

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { customer_id: userId },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error("My orders fetch error:", error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Update daily subscription delivery status for an OrderItem
router.patch('/item/:orderItemId/subscription-status', async (req, res) => {
  const { orderItemId } = req.params;
  const { day, status, date } = req.body; // e.g. day: 'Monday', status: 'Delivered', date: '2026-05-31'

  try {
    const item = await OrderItem.findByPk(orderItemId);
    if (!item) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    // Ensure options exist and represent a subscription
    const options = item.options || {};
    if (!options.isSubscription) {
      return res.status(400).json({ message: 'Order item is not a subscription' });
    }

    // Update status in the new deliveries array if it exists
    if (Array.isArray(options.deliveries)) {
      const match = options.deliveries.find(d => d.date === date || d.dayName === day);
      if (match) {
        match.status = status;
      }
    }

    // Initialize deliveryStatuses if missing
    if (!options.deliveryStatuses) {
      options.deliveryStatuses = {
        Monday: 'Pending',
        Tuesday: 'Pending',
        Wednesday: 'Pending',
        Thursday: 'Pending',
        Friday: 'Pending',
        Saturday: 'Pending',
        Sunday: 'Pending'
      };
    }

    // Update status for the specific day (legacy fallback)
    options.deliveryStatuses[day] = status;

    // Mark as mutated so Sequelize knows to update the JSONB column
    item.options = options;
    item.changed('options', true);
    await item.save();

    res.json({ message: `Delivery status for ${day || date} updated to ${status}`, item });
  } catch (error) {
    console.error('Error updating subscription delivery status:', error);
    res.status(500).json({ message: 'Error updating delivery status', error: error.message });
  }
});

module.exports = router;

