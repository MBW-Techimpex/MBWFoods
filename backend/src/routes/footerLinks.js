const express = require('express');
const router = express.Router();
const FooterLink = require('../models/FooterLink');

// Get all links
router.get('/', async (req, res) => {
  try {
    const links = await FooterLink.findAll({ order: [['position', 'ASC']] });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Link
router.put('/:id', async (req, res) => {
  try {
    const link = await FooterLink.findByPk(req.params.id);
    if (!link) return res.status(404).json({ error: "Not found" });
    await link.update(req.body);
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder 
router.post('/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  try {
    await Promise.all(orderedIds.map((id, index) => {
      return FooterLink.update({ position: index + 1 }, { where: { id } });
    }));
    res.json({ message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add New Link
router.post('/', async (req, res) => {
  try {
    const maxPos = await FooterLink.max('position');
    const newLink = await FooterLink.create({
      ...req.body,
      position: (maxPos || 0) + 1
    });
    res.json(newLink);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Link
router.delete('/:id', async (req, res) => {
  try {
    const link = await FooterLink.findByPk(req.params.id);
    if (!link) return res.status(404).json({ error: "Not found" });
    await link.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
