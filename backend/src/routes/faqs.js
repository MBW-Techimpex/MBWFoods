const express = require('express');
const router = express.Router();
const Faq = require('../models/Faq');

// Get all FAQs
router.get('/', async (req, res) => {
  try {
    const faqs = await Faq.findAll({ order: [['position', 'ASC']] });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create FAQ
router.post('/', async (req, res) => {
  try {
    const maxPos = await Faq.max('position');
    const newFaq = await Faq.create({
      ...req.body,
      position: maxPos ? maxPos + 1 : 1
    });
    res.json(newFaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update FAQ
router.put('/:id', async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: "Not found" });
    await faq.update(req.body);
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete FAQ
router.delete('/:id', async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: "Not found" });
    await faq.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder FAQs
router.post('/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  try {
    await Promise.all(orderedIds.map((id, index) => {
      return Faq.update({ position: index + 1 }, { where: { id } });
    }));
    res.json({ message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
