const express = require('express');
const router = express.Router();
const FuneralContent = require('../models/FuneralContent');
const FuneralFacility = require('../models/FuneralFacility');

// --- Funeral Content (Singleton) ---

// Get Content
router.get('/content', async (req, res) => {
  try {
    let content = await FuneralContent.findOne();
    if (!content) {
      // Create default if not exists
      content = await FuneralContent.create({});
    }
    res.json(content);
  } catch (err) {
    console.error("Error fetching FuneralContent:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Content
router.put('/content', async (req, res) => {
  try {
    let content = await FuneralContent.findOne();
    if (!content) {
      content = await FuneralContent.create(req.body);
    } else {
      await content.update(req.body);
    }
    res.json({ message: 'Content updated successfully', content });
  } catch (err) {
    console.error("Error updating FuneralContent:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Funeral Facilities (CRUD) ---

// Get all facilities
router.get('/facilities', async (req, res) => {
  try {
    const facilities = await FuneralFacility.findAll({
       where: { status: 'Active' },
      order: [
        ['city', 'ASC'],
        ['position', 'ASC'],
        ['id', 'ASC']
      ]
    });
    res.json(facilities);
  } catch (err) {
    console.error("Error fetching FuneralFacilities:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new facility
router.post('/facilities', async (req, res) => {
  try {
    const facility = await FuneralFacility.create(req.body);
    res.status(201).json({ message: 'Facility created', facility });
  } catch (err) {
    console.error("Error creating FuneralFacility:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update facility
router.put('/facilities/:id', async (req, res) => {
  try {
    const facility = await FuneralFacility.findByPk(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    
    await facility.update(req.body);
    res.json({ message: 'Facility updated', facility });
  } catch (err) {
    console.error("Error updating FuneralFacility:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete facility
router.delete('/facilities/:id', async (req, res) => {
  try {
    const facility = await FuneralFacility.findByPk(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    
    await facility.destroy();
    res.json({ message: 'Facility deleted' });
  } catch (err) {
    console.error("Error deleting FuneralFacility:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
