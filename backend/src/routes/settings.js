const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { verifyAdmin } = require('../middleware/adminAuth');
const ActivityLog = require('../models/ActivityLog');
const Admin = require('../models/Admin');

// [SITE] Get site settings
router.get('/', async (req, res) => {
  try {
    const settings = await Setting.findAll();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// [SITE] Update multiple settings
router.post('/bulk', verifyAdmin, async (req, res) => {
  const { settings } = req.body; // Array of { group, key, value }
  console.log('Incoming Master Sync Request:', settings);
  try {
    const t = await Setting.sequelize.transaction();
    try {
      for (const s of settings) {
        const existing = await Setting.findOne({ where: { key: s.key }, transaction: t });
        if (existing) {
          await existing.update({ value: s.value, group: s.group }, { transaction: t });
        } else {
          await Setting.create(s, { transaction: t });
        }
      }
      await t.commit();
    } catch (dbError) {
      await t.rollback();
      throw dbError;
    }

    // Automated Registry Cleanup: Purge archives older than 7 days
    try {
      const { Op } = require('sequelize');
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      await ActivityLog.destroy({
        where: {
          created_at: { [Op.lt]: oneWeekAgo }
        }
      });
    } catch (cleanupErr) {
      console.warn("Log cleanup failed (non-critical):", cleanupErr.message);
    }

    res.json({ message: 'Atelier Registry: Settings synchronized successfully.' });
  } catch (error) {
    console.error("Clinical registry sync failure:", error);
    res.status(500).json({ message: 'Error updating settings archive.' });
  }
});

// [AUDIT] Get activity logs
router.get('/logs', verifyAdmin, async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      include: [
        { model: Admin, attributes: ['username', 'role'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 200 // Increased limit for visibility
    });
    res.json(logs);
  } catch (error) {
    console.error("CRITICAL AUDIT LOG FETCH FAILURE:", error);
    res.status(500).json({ message: 'Error fetching logs', debug: error.message });
  }
});

// [STAFF] Get all staff
router.get('/staff', verifyAdmin, async (req, res) => {
  try {
    const staff = await Admin.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(staff);
  } catch (error) {
    console.error("CRITICAL STAFF FETCH FAILURE:", error);
    res.status(500).json({ message: 'Error fetching staff', debug: error.message });
  }
});

// [STAFF] Add staff
const bcrypt = require('bcryptjs');
router.post('/staff', verifyAdmin, async (req, res) => {
  const { username, email, password, role, phone, status } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = await Admin.create({
      username: username ? username.trim() : username,
      email,
      password: hashedPassword,
      role: role ? role.toUpperCase() : 'STAFF',
      phone,
      status: status || 'active'
    });
    res.status(201).json({ message: 'Staff commissioned successfully', staff: { id: newStaff.id, username: newStaff.username } });
  } catch (error) {
    console.error("Staff authorization failure:", error);
    // Return specific error message if it's a validation error (e.g., uniqueness)
    const message = error.name === 'SequelizeUniqueConstraintError' 
      ? 'A user with this username or email already exists.'
      : error.message || 'Error creating staff';
      
    res.status(400).json({ message });
  }
});

// [STAFF] Update staff status/role/password
router.put('/staff/:id', verifyAdmin, async (req, res) => {
  const { role, status, phone, email, username, password } = req.body;
  try {
    const staff = await Admin.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });
    
    const updateData = { role: role ? role.toUpperCase() : undefined, status, phone, email, username };
    
    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    } 

    await staff.update(updateData);
    res.json({ message: 'Staff record updated successfully' });
  } catch (error) {
    console.error("[STAFF UPDATE ERROR]:", error);
    const message = error.name === 'SequelizeUniqueConstraintError' 
      ? 'A user with this username or email already exists.' 
      : 'Internal server error during staff update.';
    res.status(500).json({ message, debug: error.message });
  }
});

// [STAFF] Delete staff
router.delete('/staff/:id', verifyAdmin, async (req, res) => {
  try {
    const staff = await Admin.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });
    
    // Prevent deleting self
    if (staff.id === req.admin.id) {
      return res.status(403).json({ message: 'You cannot decommission your own profile.' });
    }

    await staff.destroy();
    res.json({ message: 'Staff record decommissioned' });
  } catch (error) {
    console.error("Staff decommissioning failure:", error);
    res.status(500).json({ message: 'Error deleting staff record' });
  }
});

module.exports = router;
