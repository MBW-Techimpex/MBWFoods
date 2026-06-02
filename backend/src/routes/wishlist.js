const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// GET user wishlist
router.get('/', auth, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  
  try {
    const items = await Wishlist.findAll({
      where: { customer_id: req.user.id },
      include: [{ model: Product }]
    });
    res.json(items.map(item => item.Product));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
});

// TOGGLE wishlist item
router.post('/toggle', auth, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  const { productId } = req.body;
  
  try {
    const existing = await Wishlist.findOne({
      where: { customer_id: req.user.id, product_id: productId }
    });
    
    if (existing) {
      await existing.destroy();
      return res.json({ removed: true });
    } else {
      await Wishlist.create({
        customer_id: req.user.id,
        product_id: productId
      });
      return res.json({ added: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling wishlist', error: error.message });
  }
});

// SYNC (Local -> DB) after login
router.post('/sync', auth, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  const { productIds } = req.body;
  
  try {
    for (const pId of productIds) {
      await Wishlist.findOrCreate({
        where: { customer_id: req.user.id, product_id: pId }
      });
    }
    const allItems = await Wishlist.findAll({
      where: { customer_id: req.user.id },
      include: [{ model: Product }]
    });
    res.json(allItems.map(item => item.Product));
  } catch (error) {
    res.status(500).json({ message: 'Error syncing wishlist', error: error.message });
  }
});

module.exports = router;
