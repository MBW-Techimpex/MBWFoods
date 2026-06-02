const express = require('express');
const router = express.Router();
const AtelierHour = require('../models/AtelierHour');

// Get all hours
router.get('/', async (req, res) => {
  try {
    const hours = await AtelierHour.findAll({ order: [['position', 'ASC']] });
    res.json(hours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Hour
router.put('/:id', async (req, res) => {
  try {
    const hour = await AtelierHour.findByPk(req.params.id);
    if (!hour) return res.status(404).json({ error: "Not found" });
    await hour.update(req.body);
    res.json(hour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder
router.post('/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  try {
    await Promise.all(orderedIds.map((id, index) => {
      return AtelierHour.update({ position: index + 1 }, { where: { id } });
    }));
    res.json({ message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add New Day 
router.post('/', async (req, res) => {
  try {
    const maxPos = await AtelierHour.max('position');
    const newHour = await AtelierHour.create({
      ...req.body,
      position: (maxPos || 0) + 1
    });
    res.json(newHour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Day
router.delete('/:id', async (req, res) => {
  try {
    const hour = await AtelierHour.findByPk(req.params.id);
    if (!hour) return res.status(404).json({ error: "Not found" });
    await hour.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
