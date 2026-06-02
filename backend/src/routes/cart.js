const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Helper: Get or Create Cart
async function getOrCreateCart(userId, sessionId) {
  let cart;
  if (userId) {
    const Customer = require('../models/Customer');
    const exists = await Customer.findByPk(userId);
    if (!exists) {
        console.warn(`[getOrCreateCart] Invalid/Stale User ID identified: ${userId}. Reverting to guest session.`);
        userId = null;
    }
  }

  if (userId) {
    console.log(`[getOrCreateCart] Seeking clinical cart for User: ${userId}`);
    cart = await Cart.findOne({ where: { customer_id: userId, status: 'active' } });
    if (!cart) {
      cart = await Cart.create({ customer_id: userId });
      console.log(`[getOrCreateCart] Commissioned NEW User Cart: ${cart.id}`);
    } else {
      console.log(`[getOrCreateCart] Identified ACTIVE User Cart: ${cart.id}`);
    }
  } else if (sessionId) {
    console.log(`[getOrCreateCart] Seeking clinical cart for Session: ${sessionId}`);
    cart = await Cart.findOne({ where: { session_id: sessionId, status: 'active' } });
    if (!cart) {
      cart = await Cart.create({ session_id: sessionId });
      console.log(`[getOrCreateCart] Commissioned NEW Session Cart: ${cart.id}`);
    } else {
      console.log(`[getOrCreateCart] Identified ACTIVE Session Cart: ${cart.id}`);
    }
  }
  return cart;
}

// GET active cart
router.get('/', auth, async (req, res) => {
  const sessionId = req.query.sessionId;
  const userId = req.user ? req.user.id : null;

  try {
    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) return res.json({ items: [] });
    
    console.log(`[GET /cart] Fetching collections for Cart: ${cart.id}`);
    const items = await CartItem.findAll({ 
      where: { cart_id: cart.id },
      include: [{ model: Product }]
    });
    console.log(`[GET /cart] Synchronization complete. Items found: ${items.length}`);
    res.json({ cart, items });
  } catch (error) {
    console.error('[GET /cart] Clinical failure:', error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});

// ADD to cart
router.post('/add', auth, async (req, res) => {
  const { productId, quantity, options, sessionId } = req.body;
  const userId = req.user ? req.user.id : null;

  console.log(`[POST /cart/add] Incoming selection: Product ${productId}, Session ${sessionId}, User ${userId}`);

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      console.error(`[POST /cart/add] Selection not found in inventory: ${productId}`);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Workflow: Check Stock
    if (product.stock < (parseInt(quantity) || 1)) {
      console.warn(`[POST /cart/add] Insufficient artisanal stock for product: ${productId}`);
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    
    // Normalize options for consistent lookup
    const normalizedOptions = (options && Object.keys(options).length > 0) ? options : null;

    // Workflow: If product already in cart -> increase quantity
    let item = await CartItem.findOne({ 
      where: { 
        cart_id: cart.id, 
        product_id: productId,
        options: normalizedOptions
      } 
    });

    if (item) {
      console.log(`[POST /cart/add] Selection exists in cart. Incrementing quantity for item: ${item.id}`);
      item.quantity += (parseInt(quantity) || 1);
      await item.save();
    } else {
      console.log(`[POST /cart/add] New selection. Creating artisanal record in cart: ${cart.id}`);
      item = await CartItem.create({
        cart_id: cart.id,
        product_id: productId,
        name: product.name,
        price: parseFloat(product.price.toString().replace(/[^0-9.]/g, '')), // Robust price parsing for all currencies
        shipping_price: parseFloat(product.shipping_price || 0),
        quantity: parseInt(quantity) || 1,
        image: product.image,
        options: normalizedOptions
      });
    }

    res.status(201).json(item);
  } catch (error) {
    console.error('[POST /cart/add] Clinical failure:', error);
    // Workflow: Return specific message if it's a conflict or schema error
    res.status(error.status || 500).json({ 
        message: error.message || 'Error processing your selection in the studio archive.',
        error: error.name
    });
  }
});

// UPDATE quantity
router.put('/update', auth, async (req, res) => {
  const { cartItemId, quantity } = req.body;
  try {
    const item = await CartItem.findByPk(cartItemId, { include: [Product] });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (quantity <= 0) {
      await item.destroy();
      return res.json({ message: 'Item removed' });
    }

    // Workflow: Check Stock
    const product = item.Product;
    if (product && product.stock < quantity) {
      console.warn(`[PUT /cart/update] Insufficient artisanal stock for product: ${product.id}`);
      return res.status(400).json({ message: `Only ${product.stock} specimens are currently available in our archive.` });
    }

    item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
});

// REMOVE item
router.delete('/remove/:id', auth, async (req, res) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    await item.destroy();
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing item', error: error.message });
  }
});

// MERGE items (Guest -> User)
router.post('/merge', auth, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not logged in' });
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ message: 'Missing sessionId' });

  try {
    const guestCart = await Cart.findOne({ where: { session_id: sessionId, status: 'active' } });
    if (!guestCart) return res.json({ message: 'No guest cart to merge' });

    const userCart = await getOrCreateCart(req.user.id, null);
    const guestItems = await CartItem.findAll({ where: { cart_id: guestCart.id } });

    for (const gItem of guestItems) {
      let uItem = await CartItem.findOne({ 
        where: { 
          cart_id: userCart.id, 
          product_id: gItem.product_id,
          options: gItem.options 
        } 
      });

      if (uItem) {
        uItem.quantity += gItem.quantity;
        await uItem.save();
        await gItem.destroy();
      } else {
        gItem.cart_id = userCart.id;
        await gItem.save();
      }
    }
    
    // Optionally delete guest cart or mark as merged
    guestCart.status = 'merged';
    await guestCart.save();

    res.json({ message: 'Cart merged successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error merging carts', error: error.message });
  }
});

// Clear Cart on Order Success
router.delete('/clear', auth, async (req, res) => {
  const sessionId = req.body.sessionId || req.query.sessionId;
  const userId = req.user ? req.user.id : null;

  try {
    const where = userId ? { customer_id: userId, status: 'active' } : { session_id: sessionId, status: 'active' };
    
    if (!userId && !sessionId) {
        return res.status(400).json({ message: 'No session or user identification provided.' });
    }

    const cart = await Cart.findOne({ where });
    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id } });
      console.log(`[DELETE /cart/clear] Cart ${cart.id} liquidated.`);
    }
    
    // Always return success during liquidation to avoid blocking frontend flows
    res.json({ message: 'Studio bag cleared successfully' });
  } catch (error) {
    console.error('[DELETE /cart/clear] failure:', error);
    res.status(500).json({ message: 'Error during cart liquidation' });
  }
});

module.exports = router;
