const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config({ override: true });

const restaurantRoutes = require('./routes/restaurants');
const orderRoutes = require('./routes/orders');
const leadRoutes = require('./routes/leads');
const reservationRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'table-tap-server',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'demo-memory-mode',
    time: new Date().toISOString()
  });
});

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/reservations', reservationRoutes);

app.get('/', (req, res) => res.send('Table Tap API running. Try /api/health'));

// Always return JSON errors (so frontend never sees HTML "Server rejected")
app.use((err, req, res, next) => {
  console.error(`[api-error] ${req.method} ${req.originalUrl}:`, err.message);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Logo image too large. Please upload an image under 4MB.' });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }
  if (!res.headersSent) return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  next(err);
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tabletap';
mongoose.set('bufferCommands', false);
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.warn('MongoDB not available, running in demo memory mode:', err.message));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
