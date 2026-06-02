const express = require('express');
const router = express.Router();
const PaymentMethod = require('../models/PaymentMethod');

// Get all payment methods
router.get('/', async (req, res) => {
  try {
    const methods = await PaymentMethod.findAll({ order: [['order', 'ASC']] });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new payment method
router.post('/', async (req, res) => {
  try {
    const method = await PaymentMethod.create(req.body);
    res.status(201).json(method);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update payment method
router.put('/:id', async (req, res) => {
  try {
    const method = await PaymentMethod.findByPk(req.params.id);
    if (!method) return res.status(404).json({ message: 'Not found' });
    await method.update(req.body);
    res.json(method);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete payment method
router.delete('/:id', async (req, res) => {
  try {
    const method = await PaymentMethod.findByPk(req.params.id);
    if (!method) return res.status(404).json({ message: 'Not found' });
    await method.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reorder
router.post('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    await Promise.all(orderedIds.map((id, index) => 
      PaymentMethod.update({ order: index }, { where: { id } })
    ));
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
