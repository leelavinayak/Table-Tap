const mongoose = require('mongoose');

const reservationItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  qty: { type: Number, default: 1 }
});

const reservationSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  name: { type: String, required: true },
  phone: String,
  date: String,
  time: String,
  guests: { type: Number, default: 2 },
  items: [reservationItemSchema],
  tableAssigned: String,
  status: { type: String, default: 'reserved' }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
