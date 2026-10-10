const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  tables: { type: String, default: '' },
  gst: { type: String, default: '' },
  logoImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);
