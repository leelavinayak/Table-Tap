# Table Tap — Connected Hospitality Platform (MERN Stack)

Pixel-rebuild of your `code.html` Stitch design as a full **MongoDB + Express + React + Node** app.

## Structure

```
Table Tap Website/
  server/               Express + Mongoose API
    server.js           entry, Mongo connect with memory fallback
    seed.js / seed-data.js
    models/ Restaurant.js Order.js Lead.js
    routes/ restaurants.js orders.js leads.js
  client/               React + Vite + Tailwind (your design)
    src/components/ Navbar Hero Difference PartnerNetwork LiveSimulation PosIntegration PilotCta Footer
    src/api.js          axios calls
  package.json          root concurrently runner
```

## Design parity (from code.html)

- **Hero:** Order & Reorder from Your Table / 42s, +32%, 100% + Table 14 live card + Repeat Round Fire +$42
- **Difference:** 01 Scan, 02 KDS route, 03 Reorder, 04 Split & Pay
- **Partner Network:** 540+ / 4.2M+ / 18min / +24.6%, filter pills, 3 cards (Velvet Bistro, Omakase Slate, Hopyard), zip search
- **Live Simulation:** phone Tab #8492, Burrata $18 + Pappardelle $56 = $74, Quick Reorder Peroni $9 / Pellegrino $6, Call Server, Pay Now
- **POS:** Toast, Square, Clover, NCR Aloha, Oracle Micros + Marcus Vance testimonial
- **CTA:** Ready to modernize dining floor? + pilot form
- **Footer:** Enterprise Hospitality

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | health + mongo status |
| GET | `/api/restaurants?category=&search=` | list + filter |
| GET | `/api/restaurants/stats` | KPIs |
| GET | `/api/orders/:tabId` | get tab (default 8492 = $74 seed) |
| POST | `/api/orders/:tabId/add` | `{name, price, seat}` add + retotal |
| POST | `/api/orders/service-call/notify` | server call |
| POST | `/api/leads` | `{restaurantName, email}` pilot request |
| GET | `/api/leads` | list leads |

Works **without MongoDB** (in-memory demo mode). With MongoDB, orders/leads persist.

## Run locally

1. **API:**
```powershell
cd server
npm install
copy .env.example .env   # optional, defaults work
npm run dev              # http://localhost:5000
```

2. **Client (new terminal):**
```powershell
cd client
npm install
npm run dev              # http://localhost:5173
```

3. **Optional: seed MongoDB:**
```powershell
# start mongod first, then
cd server
npm run seed
```

Or from root after `npm install -g concurrently`:
```powershell
npm install
npm run dev
```

## Env

- `server/.env`: `PORT=5000`, `MONGO_URI=mongodb://127.0.0.1:27017/tabletap`, `CLIENT_URL=http://localhost:5173`
- `client/.env`: `VITE_API_URL=/api` (uses Vite proxy in dev) or `http://localhost:5000/api` in prod.

## Deploy notes

- Frontend: `cd client; npm run build` → deploy `dist/` to Vercel/Netlify, set `VITE_API_URL` to your API URL.
- Backend: deploy `server/` to Render/Railway, set `MONGO_URI` to Atlas.
