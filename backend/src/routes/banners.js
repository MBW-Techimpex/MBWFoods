const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');

// Get all banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.findAll({ order: [['position', 'ASC']] });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create banner
router.post('/', async (req, res) => {
  try {
    const maxPos = await Banner.max('position');
    const newBanner = await Banner.create({
      ...req.body,
      position: maxPos ? maxPos + 1 : 1
    });
    res.json(newBanner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update banner
router.put('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Not found" });
    await banner.update(req.body);
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete banner
router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Not found" });
    await banner.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder banners
router.post('/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  try {
    await Promise.all(orderedIds.map((id, index) => {
      return Banner.update({ position: index + 1 }, { where: { id } });
    }));
    res.json({ message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
