const express = require('express');
const router = express.Router();
const Permission = require('../models/Permission');

// Get all permissions for all roles
router.get('/', async (req, res) => {
  try {
    const list = await Permission.findAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update multiple permissions at once
router.post('/save', async (req, res) => {
  const { permissions } = req.body; // Array of { id, is_granted }
  const sequelize = require('../config/database');
  
  if (!permissions || !Array.isArray(permissions)) {
    return res.status(400).json({ error: 'Invalid permissions data' });
  }

  const t = await sequelize.transaction();
  try {
    console.log(`[PERMISSIONS] Synchronizing ${permissions.length} privileges...`);
    
    for (const p of permissions) {
      if (p.id) {
        const val = !!p.is_granted;
        console.log(`[PERMISSIONS] ID: ${p.id} -> ${val}`);
        const [affectedRows] = await Permission.update(
          { is_granted: val }, 
          { where: { id: p.id }, transaction: t }
        );
        if (affectedRows === 0) {
            console.warn(`[PERMISSIONS] No record found for ID: ${p.id}`);
        }
      }
    }
    
    await t.commit();
    console.log(`[PERMISSIONS] Successfully synchronized ${permissions.length} privileges.`);
    
    // Fetch fresh list after save and return directly to frontend
    const updatedList = await Permission.findAll();
    res.json({ 
      message: 'Privileges updated successfully.',
      permissions: updatedList 
    });
  } catch (err) {
    if (t) await t.rollback();
    console.error('[PERMISSIONS] Sync failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
