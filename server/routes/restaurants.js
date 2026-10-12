const express = require('express');
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const { seedRestaurants } = require('../seed-data');

const router = express.Router();

function isDbUp() {
  return mongoose.connection.readyState === 1;
}

// GET /api/restaurants?category=&search=
// Returns DB restaurants merged with seed/curated list (DB first).
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let dbList = [];
    if (isDbUp()) {
      try {
        const filter = {};
        if (category && category !== 'All') filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' };
        dbList = await Restaurant.find(filter).lean();
      } catch (e) {
        console.warn('[restaurants] DB read failed, using seed:', e.message);
      }
    }

    // Merge: DB entries first, then seed entries not already present (by name).
    const seen = new Set(dbList.map(r => String(r.name || '').toLowerCase()));
    const merged = [...dbList];
    for (const s of seedRestaurants) {
      if (!seen.has(String(s.name || '').toLowerCase())) merged.push(s);
    }

    let list = merged;
    if (category && category !== 'All') {
      list = list.filter(r => r.category === category);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(r =>
        (r.name || '').toLowerCase().includes(s) ||
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
// Accepts full registration payload (also used internally by /api/leads sync):
// { name | restaurantName, image | logoImage, location, category,
//   email, phone, address, state, pincode, city, gst, tables,
//   restaurantId, partnerRestaurantId, source }
router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    const name = (b.name || b.restaurantName || '').trim();
    if (!name) return res.status(400).json({ error: 'Restaurant name required' });

    const doc = {
      name,
      image: b.image || b.logoImage || '',
      logoImage: b.logoImage || b.image || '',
      location: b.location || b.address || b.city || '',
      category: b.category || 'Partner',
      email: b.email || '',
      phone: b.phone || '',
      address: b.address || '',
      state: b.state || '',
      pincode: b.pincode || '',
      city: b.city || '',
      gst: b.gst || '',
      tables: b.tables || '',
      restaurantId: b.restaurantId || undefined,
      partnerRestaurantId: b.partnerRestaurantId || '',
      source: b.source || 'restaurants-api'
    };

    // Duplicate guard: one registration per restaurant email (case-insensitive).
    // Also guards re-use of an existing 12-digit Restaurant ID.
    const escRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (doc.email) {
      try {
        const dup = await Restaurant.findOne({
          email: { $regex: `^${escRegex(String(doc.email).trim())}$`, $options: 'i' }
        }).lean();
        if (dup) {
          return res.status(409).json({
            error: `This restaurant email (${dup.email}) is already registered${dup.restaurantId ? ` with Restaurant ID ${dup.restaurantId}` : ''}.`,
            persisted: false,
            duplicate: true,
            restaurantId: dup.restaurantId || undefined
          });
        }
      } catch (e) {
        if (mongoose.connection.readyState !== 1) console.warn('[restaurants] duplicate check skipped (DB not connected):', e.message);
      }
    }
    if (doc.restaurantId) {
      try {
        const dupId = await Restaurant.findOne({ restaurantId: doc.restaurantId }).lean();
        if (dupId) {
          return res.status(409).json({
            error: `This Restaurant ID (${doc.restaurantId}) is already registered to ${dupId.name}.`,
            persisted: false,
            duplicate: true,
            restaurantId: dupId.restaurantId
          });
        }
      } catch (e) {
        if (mongoose.connection.readyState !== 1) console.warn('[restaurants] ID duplicate check skipped (DB not connected):', e.message);
      }
    }

    // Always attempt a real DB write. Never silently fake success:
    // if Mongo is down this throws (bufferCommands=false) and we return 503.
    try {
      let created;
      if (doc.restaurantId) {
        created = await Restaurant.findOneAndUpdate(
          { restaurantId: doc.restaurantId },
          { $set: doc },
          { new: true, upsert: true, runValidators: true }
        );
      } else {
        created = await Restaurant.create(doc);
      }
      return res.status(201).json({ ...created.toObject(), persisted: true });
    } catch (dbErr) {
      console.error('[restaurants] DB write failed:', dbErr.message);
      return res.status(503).json({
        error: 'Database unavailable — restaurant NOT saved. Check server terminal for MongoDB connection errors and ensure MONGO_URI is set. No data was stored.',
        detail: dbErr.message,
        persisted: false,
        demoMode: true
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message, persisted: false });
  }
});

module.exports = router;
