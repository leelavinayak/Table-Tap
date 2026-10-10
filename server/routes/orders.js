const express = require('express');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// In-memory fallback when Mongo is not connected (demo mode)
const memoryTabs = {
  '8492': {
    tabId: '8492',
    table: 'TABLE 08 • GUSTO TRATTORIA',
    items: [
      { name: 'Burrata Pugliese', price: 18, qty: 1, seat: 1, status: 'Served • 19:24' },
      { name: 'Handmade Pappardelle', price: 56, qty: 2, seat: 2, status: 'In Kitchen • 19:38' }
    ],
    total: 74
  }
};

const router = express.Router();

// GET /api/orders/:tabId
router.get('/:tabId', async (req, res) => {
  const { tabId } = req.params;
  try {
    if (mongoose.connection.readyState === 1) {
      let order = await Order.findOne({ tabId });
      if (!order) {
        const seed = memoryTabs[tabId] || memoryTabs['8492'];
        order = await Order.create({ tabId, table: seed.table, items: seed.items, total: seed.total });
      }
      return res.json(order);
    }
    const tab = memoryTabs[tabId] || memoryTabs['8492'];
    res.json({ ...tab, _id: 'demo-' + tabId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:tabId/add  { name, price, seat }
router.post('/:tabId/add', async (req, res) => {
  const { tabId } = req.params;
  const { name, price, seat = 2 } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'name and price required' });
  try {
    if (mongoose.connection.readyState === 1) {
      let order = await Order.findOne({ tabId });
      if (!order) order = new Order({ tabId, items: [], total: 0 });
      order.items.push({ name, price, seat, status: 'Fired Just Now' });
      order.total = order.items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
      await order.save();
      return res.json(order);
    }
    const tab = memoryTabs[tabId] || (memoryTabs[tabId] = { tabId, table: 'TABLE 08 • GUSTO TRATTORIA', items: [...memoryTabs['8492'].items], total: 74 });
    tab.items.push({ name, price, seat, status: 'Fired Just Now • Seat ' + seat });
    tab.total = tab.items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    res.json(tab);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/service-call { table }
router.post('/service-call/notify', (req, res) => {
  res.json({ ok: true, message: 'Server notified • smartwatch buzzed', at: new Date().toISOString() });
});

module.exports = router;
