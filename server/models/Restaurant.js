const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  category: String,
  description: String,
  rating: Number,
  reviews: String,
  tables: String,
  metricLabel: String,
  metricValue: String,
  image: String,
  badge: String
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
