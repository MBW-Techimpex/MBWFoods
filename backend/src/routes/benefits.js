const express = require('express');
const router = express.Router();
const Benefit = require('../models/Benefit');

// Get all benefits
router.get('/', async (req, res) => {
  try {
    const benefits = await Benefit.findAll({ order: [['position', 'ASC']] });
    res.json(benefits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create benefit
router.post('/', async (req, res) => {
  try {
    const maxPos = await Benefit.max('position');
    const newBenefit = await Benefit.create({
      ...req.body,
      position: maxPos ? maxPos + 1 : 1
    });
    res.json(newBenefit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update benefit
router.put('/:id', async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id);
    if (!benefit) return res.status(404).json({ error: "Not found" });
    await benefit.update(req.body);
    res.json(benefit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete benefit
router.delete('/:id', async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id);
    if (!benefit) return res.status(404).json({ error: "Not found" });
    await benefit.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder benefits
router.post('/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  try {
    await Promise.all(orderedIds.map((id, index) => {
      return Benefit.update({ position: index + 1 }, { where: { id } });
    }));
    res.json({ message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
