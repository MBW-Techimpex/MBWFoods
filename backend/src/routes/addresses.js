const express = require('express');
const router = express.Router();
const CustomerAddress = require('../models/CustomerAddress');
const Customer = require('../models/Customer');
const authenticateToken = require('../middleware/auth');

// GET all addresses for the logged-in customer
router.get('/', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const addresses = await CustomerAddress.findAll({
      where: { customer_id: req.user.id },
      order: [['is_default', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Error fetching addresses' });
  }
});

// POST a new address
router.get('/add', authenticateToken, async (req, res) => {
  // Note: I will use POST for real implementation, but I'll add a helper GET for testing if needed.
  // Actually, user requested storing from checkout which is a POST.
});

router.post('/', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const { title, first_name, last_name, street, suite, city, state, zip, phone, is_default } = req.body;

  try {
    // If this is the first address, make it default
    const count = await CustomerAddress.count({ where: { customer_id: req.user.id } });

    if (count >= 5) {
      return res.status(400).json({ message: 'Address Archive Limit Reached: You may only store up to 5 shipping destinations.' });
    }

    // If setting as default, unset others
    if (is_default || count === 0) {
      await CustomerAddress.update({ is_default: false }, { where: { customer_id: req.user.id } });
    }

    console.log('[ADDRESSES] Creating address for user:', req.user.id, 'with payload:', req.body);

    const customerId = parseInt(req.user.id);
    if (isNaN(customerId)) {
       return res.status(400).json({ message: 'Invalid customer ID' });
    }

    // Check if customer exists in the centralized archive
    const customerExists = await Customer.findByPk(customerId);
    if (!customerExists) {
        console.warn(`[ADDRESS_ERROR] Identity mismatch: User ID ${customerId} not found in database.`);
        return res.status(401).json({ message: 'Session Expired: Please logout and establish a new connection.' });
    }

    const address = await CustomerAddress.create({
      customer_id: customerId,
      title: title || 'Home',
      first_name,
      last_name,
      street,
      suite,
      city,
      state,
      zip,
      phone,
      is_default: !!(is_default || count === 0)
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('[ADDRESS_ERROR] Detailed failure:', error);
    res.status(500).json({ 
      message: 'Error creating address', 
      error: error.name === 'SequelizeValidationError' ? error.errors[0].message : error.message,
      detail: error.original ? error.original.detail : null 
    });
  }
});

// UPDATE an address (POST fallback for compatibility)
router.post('/:id', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const { title, first_name, last_name, street, suite, city, state, zip, phone, is_default } = req.body;

  try {
    console.log(`[ADDRESS_UPDATE_POST] Attempting update for ID: ${req.params.id}, User: ${req.user.id}`);
    const address = await CustomerAddress.findOne({
      where: { id: req.params.id, customer_id: req.user.id }
    });

    if (!address) {
      console.warn(`[ADDRESS_UPDATE_POST] Address ${req.params.id} not found for user ${req.user.id}`);
      return res.status(404).json({ message: 'Address not found' });
    }

    // If setting as default, unset others
    if (is_default && !address.is_default) {
      await CustomerAddress.update({ is_default: false }, { where: { customer_id: req.user.id } });
    }

    await address.update({
      title: title || address.title,
      first_name: first_name !== undefined ? first_name : address.first_name,
      last_name: last_name !== undefined ? last_name : address.last_name,
      street: street || address.street,
      suite: suite !== undefined ? suite : address.suite,
      city: city || address.city,
      state: state || address.state,
      zip: zip || address.zip,
      phone: phone || address.phone,
      is_default: is_default !== undefined ? !!is_default : address.is_default
    });
    console.log(`[ADDRESS_UPDATE_POST] Successfully updated address: ${address.id}`);
    res.json(address);
  } catch (error) {
    console.error('[ADDRESS_UPDATE_POST_ERROR] Detailed failure:', error);
    res.status(500).json({ 
      message: 'Error updating address',
      error: error.name === 'SequelizeValidationError' ? error.errors[0].message : error.message
    });
  }
});

// UPDATE an address
router.put('/:id', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const { title, first_name, last_name, street, suite, city, state, zip, phone, is_default } = req.body;

  try {
    console.log(`[ADDRESS_UPDATE] Attempting update for ID: ${req.params.id}, User: ${req.user.id}`);
    const address = await CustomerAddress.findOne({
      where: { id: req.params.id, customer_id: req.user.id }
    });

    if (!address) {
      console.warn(`[ADDRESS_UPDATE] Address ${req.params.id} not found for user ${req.user.id}`);
      return res.status(404).json({ message: 'Address not found' });
    }

    // If setting as default, unset others
    if (is_default && !address.is_default) {
      await CustomerAddress.update({ is_default: false }, { where: { customer_id: req.user.id } });
    }

    await address.update({
      title: title || address.title,
      first_name: first_name !== undefined ? first_name : address.first_name,
      last_name: last_name !== undefined ? last_name : address.last_name,
      street: street || address.street,
      suite: suite !== undefined ? suite : address.suite,
      city: city || address.city,
      state: state || address.state,
      zip: zip || address.zip,
      phone: phone || address.phone,
      is_default: is_default !== undefined ? !!is_default : address.is_default
    });
    console.log(`[ADDRESS_UPDATE] Successfully updated address: ${address.id}`);
    res.json(address);
  } catch (error) {
    console.error('[ADDRESS_UPDATE_ERROR] Detailed failure:', error);
    res.status(500).json({ 
      message: 'Error updating address',
      error: error.name === 'SequelizeValidationError' ? error.errors[0].message : error.message
    });
  }
});

// DELETE an address
router.delete('/:id', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const result = await CustomerAddress.destroy({
      where: { id: req.params.id, customer_id: req.user.id }
    });
    if (result) {
      res.json({ message: 'Address deleted' });
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Error deleting address' });
  }
});

module.exports = router;
