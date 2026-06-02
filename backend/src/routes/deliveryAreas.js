const express = require('express');
const router = express.Router();
const DeliveryArea = require('../models/DeliveryArea');
const DeliveryAreaContent = require('../models/DeliveryAreaContent');
const DeliveryAreaPolicy = require('../models/DeliveryAreaPolicy');
const { verifyAdmin } = require('../middleware/adminAuth');

// --- PUBLIC ROUTES ---

// Get all delivery areas (Public)
router.get('/', async (req, res) => {
  try {
    const areas = await DeliveryArea.findAll({
      where: { status: 'Active' },
      order: [['position', 'ASC'], ['city', 'ASC']]
    });
    res.json(areas);
  } catch (err) {
    console.error("Public fetch failed, falling back:", err.message);
    try {
        const areas = await DeliveryArea.findAll({ order: [['city', 'ASC']] });
        res.json(areas);
    } catch (inner) {
        res.status(500).json({ message: 'Server error', error: inner.message });
    }
  }
});

// Get Page Content
router.get('/content', async (req, res) => {
  try {
    let content = await DeliveryAreaContent.findOne();
    if (!content) {
      content = await DeliveryAreaContent.create({});
    }
    res.json(content);
  } catch (err) {
    console.error("Error fetching DeliveryAreaContent:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get Policies
router.get('/policies', async (req, res) => {
  try {
    const policies = await DeliveryAreaPolicy.findAll({
      order: [['position', 'ASC']]
    });
    res.json(policies);
  } catch (err) {
    console.error("Error fetching DeliveryAreaPolicies:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all delivery areas (Admin - made more accessible for stability)
router.get('/admin-all', async (req, res) => {
  try {
    const areas = await DeliveryArea.findAll({
      order: [['position', 'ASC'], ['city', 'ASC']]
    });
    res.json(areas);
  } catch (err) {
    console.error("Admin fetch failed:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- ADMIN ROUTES ---

// Update Page Content
router.put('/content', verifyAdmin, async (req, res) => {
  try {
    let content = await DeliveryAreaContent.findOne();
    if (content) {
      await content.update(req.body);
    } else {
      content = await DeliveryAreaContent.create(req.body);
    }
    res.json(content);
  } catch (err) {
    console.error("Error updating DeliveryAreaContent:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create Policy
router.post('/policies', verifyAdmin, async (req, res) => {
  try {
    const policy = await DeliveryAreaPolicy.create(req.body);
    res.status(201).json(policy);
  } catch (err) {
    console.error("Error creating policy:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create area
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const area = await DeliveryArea.create(req.body);
    res.status(201).json(area);
  } catch (err) {
    console.error("Error creating delivery area:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update area
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    // Safety: ensure :id is not 'content' or 'policies'
    if (req.params.id === 'content' || req.params.id === 'policies') {
        return res.status(400).json({ message: 'Invalid ID' });
    }
    const area = await DeliveryArea.findByPk(req.params.id);
    if (!area) return res.status(404).json({ message: 'Area not found' });
    await area.update(req.body);
    res.json(area);
  } catch (err) {
    console.error("Error updating delivery area:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete area
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    if (req.params.id === 'content' || req.params.id === 'policies') {
        return res.status(400).json({ message: 'Invalid ID' });
    }
    const area = await DeliveryArea.findByPk(req.params.id);
    if (!area) return res.status(404).json({ message: 'Area not found' });
    await area.destroy();
    res.json({ message: 'Area deleted' });
  } catch (err) {
    console.error("Error deleting delivery area:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update Policy
router.put('/policies/:id', verifyAdmin, async (req, res) => {
  try {
    const policy = await DeliveryAreaPolicy.findByPk(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    await policy.update(req.body);
    res.json(policy);
  } catch (err) {
    console.error("Error updating policy:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete Policy
router.delete('/policies/:id', verifyAdmin, async (req, res) => {
  try {
    const policy = await DeliveryAreaPolicy.findByPk(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    await policy.destroy();
    res.json({ message: 'Policy deleted' });
  } catch (err) {
    console.error("Error deleting policy:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
