const express = require('express');
const router = express.Router();
const VideoJourney = require('../models/VideoJourney');
const { verifyAdmin } = require('../middleware/adminAuth');

// [PUBLIC] Get active videos
router.get('/', async (req, res) => {
  try {
    const videos = await VideoJourney.findAll({
      where: { status: 'Active' },
      order: [['position', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos' });
  }
});

// [ADMIN] Get all videos
router.get('/admin', verifyAdmin, async (req, res) => {
  try {
    const videos = await VideoJourney.findAll({
      order: [['position', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos' });
  }
});

// [ADMIN] Create a new video
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { title, youtubeLink, thumbnail, status, position } = req.body;
    const newVideo = await VideoJourney.create({
      title,
      youtubeLink,
      thumbnail,
      status: status || 'Active',
      position: position || 0
    });
    res.status(201).json(newVideo);
  } catch (error) {
    res.status(500).json({ message: 'Error creating video', error: error.message });
  }
});

// [ADMIN] Update a video
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { title, youtubeLink, thumbnail, status, position } = req.body;
    const video = await VideoJourney.findByPk(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await video.update({
      title,
      youtubeLink,
      thumbnail,
      status,
      position
    });

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error updating video', error: error.message });
  }
});

// [ADMIN] Delete a video
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const video = await VideoJourney.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    await video.destroy();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting video' });
  }
});

module.exports = router;
