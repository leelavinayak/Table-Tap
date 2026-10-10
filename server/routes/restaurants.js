const express = require('express');
const Restaurant = require('../models/Restaurant');
const { seedRestaurants } = require('../seed-data');

const router = express.Router();

// GET /api/restaurants?category=&search=
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let list = seedRestaurants;

    // Try DB first, fallback to seed
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const filter = {};
        if (category && category !== 'All') filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' };
        const dbList = await Restaurant.find(filter).lean();
        if (dbList.length) list = dbList;
      }
    } catch (e) { /* fallback to seed */ }

    if (category && category !== 'All') {
      list = list.filter(r => r.category === category);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(s) ||
        (r.location || '').toLowerCase().includes(s)
      );
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', (req, res) => {
  res.json({
    partners: '540+',
    orders: '4.2M+',
    turnoverSaved: '18 min',
    beverageGmv: '+24.6%'
  });
});

// POST /api/restaurants — partner registration with logo
// body: { name, image (url or base64), location, category }
router.post('/', async (req, res) => {
  try {
    const { name, image = '', location = '', category = 'Partner' } = req.body;
    if (!name) return res.status(400).json({ error: 'Restaurant name required' });
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      const created = await Restaurant.create({ name, image, location, category });
      return res.status(201).json(created);
    }
    // demo memory mode — echo back
    return res.status(201).json({ _id: 'demo-' + Date.now(), name, image, location, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
