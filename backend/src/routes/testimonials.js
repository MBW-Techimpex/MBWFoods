const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');

// GET all testimonials ordered by position
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({ order: [['position', 'ASC'], ['createdAt', 'ASC']] });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new testimonial
router.post('/', async (req, res) => {
  try {
    const count = await Testimonial.count();
    const testimonial = await Testimonial.create({ ...req.body, position: count });
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update testimonial
router.put('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Not found' });
    await testimonial.update(req.body);
    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE testimonial
router.delete('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Not found' });
    await testimonial.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST reorder testimonials
router.post('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    await Promise.all(orderedIds.map((id, index) =>
      Testimonial.update({ position: index }, { where: { id } })
    ));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
