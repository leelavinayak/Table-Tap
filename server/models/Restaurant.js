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
  badge: String,
  // Full partner-registration details (synced from /api/leads)
  email: String,
  phone: String,
  address: String,
  state: String,
  pincode: String,
  city: String,
  gst: String,
  restaurantId: { type: String, unique: true, sparse: true },
  partnerRestaurantId: String,
  source: String,
  logoImage: String
}, { timestamps: true });

restaurantSchema.index({ email: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
