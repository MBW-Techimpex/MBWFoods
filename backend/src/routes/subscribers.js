const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// Get all subscribers
router.get('/', async (req, res) => {
  try {
    const subscribers = await Subscriber.findAll({ order: [['createdAt', 'DESC']] });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Signup Subscriber
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });
    
    // UPSERT or findOrCreate
    const [subscriber, created] = await Subscriber.findOrCreate({
      where: { email },
      defaults: { status: 'Active' }
    });
    
    if (!created && subscriber.status !== 'Active') {
      await subscriber.update({ status: 'Active' });
      return res.json({ message: "Welcome back! Subscription reactivated." });
    }
    
    res.json({ message: created ? "Thanks for subscribing!" : "Already subscribed." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Subscriber Status
router.put('/:id', async (req, res) => {
  try {
    const subscriber = await Subscriber.findByPk(req.params.id);
    if (!subscriber) return res.status(404).json({ error: "Not found" });
    await subscriber.update(req.body);
    res.json(subscriber);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Subscriber
router.delete('/:id', async (req, res) => {
  try {
    const subscriber = await Subscriber.findByPk(req.params.id);
    if (!subscriber) return res.status(404).json({ error: "Not found" });
    await subscriber.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
