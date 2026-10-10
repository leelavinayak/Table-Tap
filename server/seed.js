const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const { seedRestaurants } = require('./seed-data');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tabletap';
  await mongoose.connect(uri);
  await Restaurant.deleteMany({});
  await Restaurant.insertMany(seedRestaurants.map(({ _id, ...r }) => r));
  console.log('Seeded restaurants:', seedRestaurants.length);
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
