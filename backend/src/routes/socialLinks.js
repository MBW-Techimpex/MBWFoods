const express = require('express');
const router = express.Router();
const SocialLink = require('../models/SocialLink');

// Get all socials
router.get('/', async (req, res) => {
  try {
    const list = await SocialLink.findAll({ order: [['position', 'ASC']] });
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create
router.post('/', async (req, res) => {
  try {
    const maxPos = await SocialLink.max('position');
    const newL = await SocialLink.create({ ...req.body, position: (maxPos || 0) + 1 });
    res.json(newL);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const link = await SocialLink.findByPk(req.params.id);
    if (!link) return res.status(404).json({ error: "Not found" });
    await link.update(req.body);
    res.json(link);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reorder 
router.post('/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  try {
    await Promise.all(orderedIds.map((id, index) => {
      return SocialLink.update({ position: index + 1 }, { where: { id } });
    }));
    res.json({ message: 'Reordered' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const link = await SocialLink.findByPk(req.params.id);
    if (!link) return res.status(404).json({ error: "Not found" });
    await link.destroy();
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
