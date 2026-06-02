const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// Get reviews for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { product_id: req.params.productId },
      order: [['created_at', 'DESC']]
    });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post or Update a review for a product
router.post('/', auth, async (req, res) => {
  try {
    const { product_id, customer_name, rating, comment } = req.body;
    const customer_id = req.user ? req.user.id : null;

    if (!product_id || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!customer_id && !customer_name) {
        return res.status(400).json({ message: 'Customer identity required' });
    }

    // Check if review already exists for this user and product
    let existingReview = null;
    if (customer_id) {
        existingReview = await Review.findOne({
            where: { product_id, customer_id }
        });
    }

    if (existingReview) {
        // Update existing review
        existingReview.rating = rating;
        existingReview.comment = comment;
        if (customer_name) existingReview.customer_name = customer_name;
        await existingReview.save();
        return res.json(existingReview);
    } else {
        // Create new review
        const newReview = await Review.create({
            product_id,
            customer_id,
            customer_name: customer_name || 'Anonymous',
            rating,
            comment
        });
        return res.status(201).json(newReview);
    }
  } catch (err) {
    console.error('Error processing review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
