const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  qty: { type: Number, default: 1 },
  seat: { type: Number, default: 1 },
  status: { type: String, default: 'Fired Just Now' },
  firedAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  tabId: { type: String, required: true, index: true },
  table: { type: String, default: 'TABLE 08 • GUSTO TRATTORIA' },
  items: [orderItemSchema],
  total: { type: Number, default: 0 },
  status: { type: String, default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
