const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { Op } = require('sequelize');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, sub_category, status } = req.query;
    const where = {};
    if (category) {
      where.category = { [Op.iLike]: category };
    }
    if (sub_category) {
      where.sub_category = { [Op.iLike]: sub_category };
    }
    if (status) {
      where.status = { [Op.iLike]: status };
    }

    const products = await Product.findAll({
      where,
      order: [['id', 'DESC']],
    });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    console.log('[API] Creating new product:', req.body);
    const product = await Product.create(req.body);
    console.log('[API] Product created successfully with ID:', product.id);
    res.status(201).json(product);
  } catch (err) {
    console.error('[API] Error creating product:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Bulk create products
router.post('/bulk', async (req, res) => {
  try {
    console.log('Received bulk import request. Rows:', req.body.length);
    if (!req.body || !Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Invalid data format. Expected an array of products.' });
    }
    const products = await Product.bulkCreate(req.body);
    console.log('Successfully imported', products.length, 'products.');
    res.status(201).json({ message: 'Bulk import successful', count: products.length });
  } catch (err) {
    console.error('Error bulk creating products:', err);
    res.status(500).json({ message: 'Bulk import failed', error: err.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    console.log(`Updating product ${req.params.id} with body:`, req.body);
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.update(req.body);
    console.log('Update successful. New status:', product.status);
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk Update Tax Rates by Category/SubCategory
const { verifyAdmin } = require('../middleware/adminAuth');

router.patch('/bulk-tax', verifyAdmin, async (req, res) => {
  try {
    const { category, sub_category, tax_rate } = req.body;
    
    if (!category || tax_rate === undefined) {
      return res.status(400).json({ message: 'Category and tax rate are required' });
    }

    const where = { category: { [Op.iLike]: category } };
    if (sub_category) {
      where.sub_category = { [Op.iLike]: sub_category };
    }

    const [updatedCount] = await Product.update(
      { tax_rate: parseFloat(tax_rate) },
      { where }
    );

    res.json({ message: `Successfully updated tax rate for ${updatedCount} products`, count: updatedCount });
  } catch (err) {
    console.error('Error bulk updating tax rates:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
