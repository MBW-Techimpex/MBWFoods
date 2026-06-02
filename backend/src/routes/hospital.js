const express = require('express');
const router = express.Router();
const HospitalContent = require('../models/HospitalContent');
const HospitalFacility = require('../models/HospitalFacility');
const { verifyAdmin } = require('../middleware/adminAuth');

// --- PUBLIC ROUTES ---

// Get Content
router.get('/content', async (req, res) => {
  try {
    let content = await HospitalContent.findOne();
    if (!content) {
      content = await HospitalContent.create({});
    }
    res.json(content);
  } catch (err) {
    console.error("Error fetching HospitalContent:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get Facilities
router.get('/facilities', async (req, res) => {
  try {
    const facilities = await HospitalFacility.findAll({
       where: { status: 'Active' },
      order: [['position', 'ASC'], ['city', 'ASC']]
    });
    res.json(facilities);
  } catch (err) {
    console.error("Error fetching HospitalFacilities:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- ADMIN ROUTES ---

// Update Content
router.put('/content', verifyAdmin, async (req, res) => {
  try {
    let content = await HospitalContent.findOne();
    if (content) {
      await content.update(req.body);
    } else {
      content = await HospitalContent.create(req.body);
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Facility
router.post('/facilities', verifyAdmin, async (req, res) => {
  try {
    const facility = await HospitalFacility.create(req.body);
    res.status(201).json(facility);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Facility
router.put('/facilities/:id', verifyAdmin, async (req, res) => {
  try {
    const facility = await HospitalFacility.findByPk(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    await facility.update(req.body);
    res.json(facility);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Facility
router.delete('/facilities/:id', verifyAdmin, async (req, res) => {
  try {
    const facility = await HospitalFacility.findByPk(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    await facility.destroy();
    res.json({ message: 'Facility deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
