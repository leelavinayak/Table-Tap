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

app.set('trust proxy', 1);

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  // Production frontend (Vercel). Keep in defaults so CORS works
  // even if CLIENT_URL is not set on the host.
  'https://table-tap-1vrp.vercel.app'
];

const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(s => s.trim()).filter(Boolean)
  : defaultOrigins;

// Allow Vercel preview deployments of the same project
// e.g. https://table-tap-xyz.vercel.app (useful for PR previews)
const vercelPreviewRe = /^https:\/\/table-tap.*\.vercel\.app$/;

function isAllowedOrigin(origin) {
  if (!origin) return true; // curl / server-to-server / same-origin
  if (clientOrigins.includes('*')) return true;
  if (clientOrigins.includes(origin)) return true;
  if (vercelPreviewRe.test(origin)) return true;
  return false;
}

app.use(cors({
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin ${origin}. Add it to backend CLIENT_URL (comma-separated) and redeploy backend.`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`[cors] allowed origins: ${clientOrigins.join(', ')} (+ https://table-tap*.vercel.app previews)`);
});
