const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

const authenticateToken = require('../middleware/auth');
const { Op } = require('sequelize');

// GET profile data (for logged-in customer)
router.get('/profile', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const customer = await Customer.findByPk(req.user.id, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'createdAt']
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// GET all customers (for admin)
router.get('/', async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  const where = {};

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      const dFrom = new Date(dateFrom);
      dFrom.setHours(0, 0, 0, 0);
      where.createdAt[Op.gte] = dFrom;
    }
    if (dateTo) {
      const dTo = new Date(dateTo);
      dTo.setHours(23, 59, 59, 999);
      where.createdAt[Op.lte] = dTo;
    }
  }

  try {
    const customers = await Customer.findAll({
      where,
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
});

// UPDATE profile (for logged-in customer)
router.post('/profile', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  
  const { first_name, last_name, email } = req.body;
  
  try {
    const customer = await Customer.findByPk(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Check if email is being changed and if it's already taken
    if (email && email !== customer.email) {
      const existing = await Customer.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: req.user.id }
        } 
      });
      if (existing) {
        return res.status(400).json({ message: 'Email address already in use' });
      }
    }

    await customer.update({
      first_name: first_name || customer.first_name,
      last_name: last_name || customer.last_name,
      email: email || customer.email
    });

    res.json({
      message: 'Profile updated successfully',
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
