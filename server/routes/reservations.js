const express = require('express');
const Reservation = require('../models/Reservation');
const mongoose = require('mongoose');

const router = express.Router();
const memory = [];

// POST /api/reservations
router.post('/', async (req, res) => {
  const { restaurantName, name, phone, date, time, guests, items } = req.body;
  if (!restaurantName || !name) return res.status(400).json({ error: 'Restaurant and your name are required' });

  // Simple table assignment: T- + random 1-30
  const tableAssigned = 'T-' + (1 + Math.floor(Math.random() * 30));

  const doc = {
    restaurantName, name, phone, date, time,
    guests: Number(guests) || 2,
    items: Array.isArray(items) ? items : [],
    tableAssigned,
    status: 'reserved',
    _id: 'demo-' + Date.now()
  };

  try {
    if (mongoose.connection.readyState === 1) {
      const saved = await Reservation.create({ ...doc, _id: undefined });
      return res.status(201).json({ ok: true, reservation: saved });
    }
    memory.push(doc);
    return res.status(201).json({ ok: true, reservation: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reservations (latest, for operator demo)
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const list = await Reservation.find().sort({ createdAt: -1 }).limit(20).lean();
      return res.json(list);
    }
    res.json(memory.slice(-20).reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
